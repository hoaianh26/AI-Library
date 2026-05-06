import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs/promises';
import path from 'path';
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
      {
        name: "findSimilarBooks",
        description: "Finds books that are similar to a given book, based on shared categories.",
        parameters: {
          type: "OBJECT",
          properties: {
            bookTitle: {
              type: "STRING",
              description: "The title of the book to find similar books for.",
            },
          },
          required: ["bookTitle"],
        },
      },
      {
        name: "getUserStats",
        description: "Gets statistics about the user's reading habits, such as favorite categories, favorite authors, and activity counts.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },

      {
        name: "getBookDetails",
        description: "Gets detailed information about a specific book, including a summary.",
        parameters: {
            type: "OBJECT",
            properties: {
                bookTitle: {
                    type: "STRING",
                    description: "The exact title of the book to get details for.",
                },
            },
            required: ["bookTitle"],
        },
      },
    ],
  },
];

async function callTool(toolCall, req) {
  console.log("DEBUG: AI Tool Call Received:", JSON.stringify(toolCall, null, 2));
  const userId = req.user.id;

  if (!toolCall || typeof toolCall !== 'object' || !toolCall.name) {
    console.error("Invalid toolCall object received:", toolCall);
    return { error: "Invalid tool call received by backend." };
  }

  // Tool: getBooks
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

  // Tool: findSimilarBooks
  if (toolCall.name === "findSimilarBooks") {
    const { bookTitle } = toolCall.args || {};
    if (!bookTitle) {
      return { error: "The book title is required to find similar books." };
    }
    try {
      const originalBook = await Book.findOne({ title: { $regex: `^${bookTitle}$`, $options: "i" } });
      if (!originalBook) {
        return { error: `Could not find a book with the title "${bookTitle}".` };
      }

      if (!originalBook.categories || originalBook.categories.length === 0) {
        return { books: [], message: `The book "${originalBook.title}" does not have any categories to compare.` };
      }

      const similarBooks = await Book.find({
        categories: { $in: originalBook.categories },
        _id: { $ne: originalBook._id } // Exclude the original book
      }).limit(5);

      return { books: similarBooks.map(book => book.toJSON()) };

    } catch (error) {
      console.error("Error finding similar books:", error);
      return { error: "An error occurred while trying to find similar books." };
    }
  }

  // Tool: getUserStats
  if (toolCall.name === "getUserStats") {
    try {
      const user = await User.findById(userId)
        .read('primary')
        .populate('favorites')
        .populate('viewHistory.bookId');

      if (!user) {
        return { error: "User not found." };
      }

      const favoriteCount = user.favorites.length;
      const historyCount = user.viewHistory.length;

      const calculateTopItems = (items, key) => {
        if (!items || items.length === 0) return 'N/A';
        const counts = items.reduce((acc, item) => {
          if (item) { // Ensure item is not null
            const values = Array.isArray(item[key]) ? item[key] : [item[key]];
            values.forEach(value => {
              if (value) {
                acc[value] = (acc[value] || 0) + 1;
              }
            });
          }
          return acc;
        }, {});
        
        const topItem = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, null);
        return topItem || 'N/A';
      };
      
      const topFavoriteCategory = calculateTopItems(user.favorites, 'categories');
      const topFavoriteAuthor = calculateTopItems(user.favorites, 'author');
      
      return {
        stats: {
          favoriteCount,
          historyCount,
          topFavoriteCategory,
          topFavoriteAuthor,
        }
      };

    } catch (error) {
      console.error("Error getting user stats:", error);
      return { error: "An error occurred while getting user stats." };
    }
  }


  // Tool: getBookDetails
  if (toolCall.name === "getBookDetails") {
      const { bookTitle } = toolCall.args || {};
      if (!bookTitle) {
          return { error: "The book title is required to get its details." };
      }
      try {
          const book = await Book.findOne({ title: { $regex: `^${bookTitle}$`, $options: "i" } });
          if (!book) {
              return { error: `Could not find a book with the title "${bookTitle}".` };
          }
          // Return a structured object with book details
          return {
              bookDetails: {
                  title: book.title,
                  author: book.author,
                  publishedYear: book.publishedYear,
                  categories: book.categories,
                  summary: book.summary || "No summary available."
              }
          };
      } catch (error) {
          console.error("Error getting book details:", error);
          return { error: "An error occurred while trying to get book details." };
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

//generate sumary
const generateSummary = async (req, res) => {
    try {
        const { bookId } = req.body;
        if (!bookId) {
            return res.status(400).json({ message: "Book ID is required." });
        }

        const book = await Book.findById(bookId);
        if (!book || !book.htmlContentPath) {
            return res.status(404).json({ message: "Book or book content not found." });
        }
        
        // Sanitize the path to remove leading slash if it exists
        const relativePath = book.htmlContentPath.startsWith('/') 
            ? book.htmlContentPath.substring(1) 
            : book.htmlContentPath;
        
        // Construct the correct path from the project root
        const contentPath = path.join(process.cwd(), relativePath);

        const htmlContent = await fs.readFile(contentPath, 'utf-8');
        
        // Basic HTML stripping and normalization
        const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s\s+/g, ' ').trim();
        
        // Truncate to avoid exceeding context window limits
        const truncatedText = textContent.substring(0, 15000); 

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Provide a concise, engaging summary for a potential reader, in 3-5 sentences, based on the following book content:\n\n---\n\n${truncatedText}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        res.json({ summary });

    } catch (error) {
        console.error("Error generating summary:", error);
        res.status(500).json({ message: "Error generating summary", error: error.message });
    }
};


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
          .read('primary') // Force read from primary replica to avoid lag
          .populate({ path: 'favorites', model: 'Book', select: 'title author categories' })
          .populate({
            path: 'viewHistory.bookId',
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
              if (view.bookId) {
                userContext += `- Title: ${view.bookId.title}, Author: ${view.bookId.author}, Categories: ${view.bookId.categories.join(', ')}\n`;
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

    // In modern versions, function calls are in the 'parts' array of the first candidate
    const functionCall = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;

    if (functionCall) {
        const toolResponse = await callTool(functionCall, req);
        const toolResult = await chat.sendMessage([
          {
            functionResponse: {
              name: functionCall.name,
              response: toolResponse,
            },
          },
        ]);
        // The response from a tool call also needs to be parsed as text
        responseText = toolResult.response.text();
    } else {
      // If no function call, get the text directly
      responseText = response.text();
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
  generateSummary,
};
