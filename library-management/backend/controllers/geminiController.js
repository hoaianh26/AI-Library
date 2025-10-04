import { GoogleGenerativeAI } from "@google/generative-ai";
import Book from "../models/Book.js"; // Import the Book model

// Access your API key as an environment variable (see "Set up your API key" above)
// Retrieve the API key explicitly here
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY); // Pass the explicitly retrieved key

// Define the tool for getting book information
const tools = [
  {
    functionDeclarations: [
      {
        name: "getBooks",
        description: "Get a list of books from the library based on title, author, or genre. Can also check for existence.",
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
            genre: {
              type: "STRING",
              description: "The genre of the book to search for (partial matches allowed).",
            },
            checkExistence: {
              type: "BOOLEAN",
              description: "If true, only check if any book matching the criteria exists, without returning full details. Defaults to false.",
            },
          },
          required: [],
        },
      },
    ],
  },
];

// Function to execute the tool call
async function callTool(toolCall) {
  // Add defensive checks
  if (!toolCall || typeof toolCall !== 'object' || !toolCall.name) {
    console.error("Invalid toolCall object received:", toolCall);
    return { error: "Invalid tool call received by backend." };
  }

  if (toolCall.name === "getBooks") {
    const { title, author, genre, checkExistence } = toolCall.args || {}; // Added genre and checkExistence
    const query = {};
    if (title) {
      query.title = { $regex: title, $options: "i" }; // Case-insensitive partial match
    }
    if (author) {
      query.author = { $regex: author, $options: "i" }; // Case-insensitive partial match
    }
    if (genre) { // Added genre to query
      query.genre = { $regex: genre, $options: "i" }; // Case-insensitive partial match
    }

    try {
      if (checkExistence) {
        const exists = await Book.exists(query);
        return { exists: !!exists }; // Return true/false
      } else {
        const books = await Book.find(query).limit(5); // Limit to 5 results
        // Return an object with a 'books' property containing the array
        return { books: books.map(book => ({
          title: book.title,
          author: book.author,
          genre: book.genre,
          description: book.description ? book.description.substring(0, 100) + '...' : 'No description', // Shorten description
          // Add other relevant book fields
        }))};
      }
    } catch (error) {
      console.error("Error querying books from MongoDB:", error);
      return { error: "Failed to retrieve books from the database." };
    }
  }
  return { error: "Tool not found." };
}


async function generateContent(req, res) {
  try {
    // Add a final check here to ensure API_KEY is not undefined or empty
    if (!API_KEY) {
      console.error("❌ API_KEY is undefined or empty when initializing GoogleGenerativeAI!");
      return res.status(500).json({ message: "Server configuration error: Gemini API key missing." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", tools }); // Pass tools to the model
    const { prompt, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // Format the history for the Gemini API
    const formattedHistory = history ? history.map(msg => ({
      role: msg.sender === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    })) : [];

    // Start a chat session
    const chat = model.startChat({
      history: formattedHistory, // Pass the formatted chat history
    });

    const result = await chat.sendMessage(prompt); // Use chat.sendMessage
    const response = result.response;
    console.log("Gemini raw response (full object):", JSON.stringify(response, null, 2)); // Log the full response object
    console.log("Gemini raw response.text():", response.text());
    console.log("Gemini raw response.functionCall:", response.functionCall);


    // Handle tool calls or direct text response
    if (response.text()) { // If the AI provides a direct text response
      res.json({ text: response.text() });
    } else if (response.functionCalls().length > 0) { // Check if there are any function calls
      const actualFunctionCall = response.functionCalls()[0]; // Get the first function call
      console.log("Gemini actualFunctionCall object:", actualFunctionCall); // Log the actual object

      // Ensure the function call is well-formed
      if (actualFunctionCall.name && actualFunctionCall.args) {
        const toolResponse = await callTool(actualFunctionCall); // Pass the actual object to callTool
        const toolResult = await chat.sendMessage([ // Pass an array of parts directly
          {
            functionResponse: {
              name: actualFunctionCall.name,
              response: toolResponse, // toolResponse is already an object
            },
          },
        ]);
        const finalResponse = await toolResult.response;
        res.json({ text: finalResponse.text() });
      } else {
        console.error("Malformed function call from Gemini:", actualFunctionCall);
        res.status(500).json({ message: "AI returned a malformed function call." });
      }
    } else {
      console.error("Gemini response neither text nor functionCall:", response);
      res.status(500).json({ message: "AI returned an unexpected response format." });
    }
  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    // Log the full error object for more details
    console.error("Full Gemini API error object:", error);
    res.status(500).json({ message: "Error generating content", error: error.message });
  }
}

export {
  generateContent,
};