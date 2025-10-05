import { GoogleGenerativeAI } from "@google/generative-ai";
import Book from "../models/Book.js";
import User from "../models/User.js";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const tools = [
  {
    functionDeclarations: [
      {
        name: "getBooks",
        description: "Get a list of books from the library based on title, author, or category.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: {
              type: "STRING",
              description: "The title of the book to search for (partial matches allowed).",
            },
            author: {
              type: "STRING",
              description: "The author of the book to search for (partial matches allowed).",
            },
            category: {
              type: "STRING",
              description: "The category of the book to search for (e.g., Adventure, Fiction).",
            },
          },
          required: [],
        },
      },
    ],
  },
];

async function callTool(toolCall) {
  console.log("DEBUG: AI Tool Call Received:", JSON.stringify(toolCall, null, 2));

  if (!toolCall || typeof toolCall !== 'object' || !toolCall.name) {
    console.error("Invalid toolCall object received:", toolCall);
    return { error: "Invalid tool call received by backend." };
  }

  if (toolCall.name === "getBooks") {
    const { title, author, category } = toolCall.args || {};
    const query = {};
    if (title) {
      query.title = { $regex: title, $options: "i" };
    }
    if (author) {
      query.author = { $regex: author, $options: "i" };
    }
    if (category) {
      query.categories = { $regex: category, $options: "i" };
    }

    try {
      const books = await Book.find(query).limit(5);
      return { books: books.map(book => book.toJSON()) };
    } catch (error) {
      console.error("Error querying books from MongoDB:", error);
      return { error: "Failed to retrieve books from the database." };
    }
  }
  return { error: "Tool not found." };
}

async function findBooksInText(text, user, history) {
  if (!text && (!history || history.length === 0)) return [];
  const historyText = history ? history.slice(-4).map(msg => msg.text).join(' \n ') : '';
  const combinedText = `${text} ${historyText}`;
  if (!combinedText) return [];
  const mentionedBooks = [];
  const allBookTitles = await Book.find({}, 'title');
  const uniqueTitles = [...new Set(allBookTitles.map(b => b.title))];
  for (const title of uniqueTitles) {
    const regex = new RegExp(`\b${title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\b`, 'gi');
    if (regex.test(combinedText)) {
      const fullBook = await Book.findOne({ title: title });
      if (fullBook && !mentionedBooks.some(b => b._id.equals(fullBook._id))) {
        mentionedBooks.push(fullBook.toJSON());
      }
    }
  }
  return mentionedBooks;
}

async function generateContent(req, res) {
  try {
    if (!API_KEY) {
      return res.status(500).json({ message: "Server configuration error: Gemini API key missing." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", tools });
    const { prompt, history } = req.body;
    const userId = req.user.id;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    let user;
    let userContext = "";
    if (userId) {
      try {
        user = await User.findById(userId)
          .populate({ path: 'favorites', model: 'Book', select: 'title author categories' })
          .populate({
            path: 'viewHistory.book',
            model: 'Book',
            select: 'title author categories'
          });

        if (user) {
          userContext += "You are a helpful library assistant.\n\n";
          userContext += "**Crucial Instruction:** After you use the `getBooks` tool, you MUST mention the book's full title in your text response. For example, instead of saying ‘Yes, I have it’, you must say ‘Yes, I have The Great Gatsby by F. Scott Fitzgerald’. This is essential for the system to show the book's cover to the user.\n\n";

          if (user.favorites && user.favorites.length > 0) {
            userContext += "**User's Favorite Books (Tracked):**\n";
            user.favorites.forEach(book => {
              userContext += `- Title: ${book.title}, Author: ${book.author}, Categories: ${book.categories.join(', ')}\n`;
            });
          }
          if (user.viewHistory && user.viewHistory.length > 0) {
            const recentViews = user.viewHistory.slice(-10);
            userContext += "\n**User's Recently Viewed Books:**\n";
            recentViews.forEach(view => {
              if (view.book) {
                userContext += `- Title: ${view.book.title}, Author: ${view.book.author}, Categories: ${view.book.categories.join(', ')}\n`;
              }
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user book data:", error);
      }
    }

    const formattedHistory = history ? history.map(msg => ({ role: msg.sender === 'ai' ? 'model' : 'user', parts: [{ text: msg.text }] })) : [];
    const chat = model.startChat({ history: formattedHistory });
    const finalPrompt = userContext ? `${userContext}\n--- END OF USER CONTEXT ---\n\n${prompt}` : prompt;

    const result = await chat.sendMessage(finalPrompt);
    const response = result.response;

    let responseText = "";

    if (response.functionCalls() && response.functionCalls().length > 0) {
      const actualFunctionCall = response.functionCalls()[0];
      if (actualFunctionCall.name && actualFunctionCall.args) {
        const toolResponse = await callTool(actualFunctionCall);
        const toolResult = await chat.sendMessage([
          {
            functionResponse: {
              name: actualFunctionCall.name,
              response: toolResponse,
            },
          },
        ]);
        responseText = toolResult.response.text();
      } else {
        return res.status(500).json({ message: "AI returned a malformed function call." });
      }
    } else if (response.text()) {
      responseText = response.text();
    } else {
      return res.status(500).json({ message: "AI returned an unexpected response format." });
    }

    const mentionedBooks = await findBooksInText(responseText, user, history);

    res.json({ text: responseText, books: mentionedBooks });

  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    res.status(500).json({ message: "Error generating content", error: error.message });
  }
}

export {
  generateContent,
};
