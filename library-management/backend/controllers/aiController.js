import { GoogleGenerativeAI } from '@google/generative-ai';
import Book from '../models/Book.js';

// Initialize the Google AI client with the API key from environment variables
// Make sure to add GEMINI_API_KEY to your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @desc    Get book suggestions from AI based on available books and a user prompt.
 * @route   POST /api/ai/suggest
 * @access  Private
 */
export const getBookSuggestion = async (req, res) => {
  console.log('[DEBUG] Entered getBookSuggestion controller for Gemini.');
  try {
    // 1. Fetch all books from our database
    const allBooks = await Book.find({}, 'title author publishedYear');

    if (allBooks.length === 0) {
      return res.status(404).json({ message: 'No books found in the library to make a suggestion.' });
    }

    // 2. Format the book list into a simple string for the AI prompt
    const bookListString = allBooks
      .map(book => `Title: ${book.title}, Author: ${book.author}, Year: ${book.publishedYear}`)
      .join('\n');

    // 3. Get the user's prompt from the request body (if any)
    const userPrompt = req.body.prompt || 'any good book'; // Default prompt if user provides none

    // 4. Construct the main prompt for the Gemini AI
    const systemPrompt = `
      You are a friendly and knowledgeable librarian assistant for our digital library.
      Your task is to recommend ONE book from the list of available books provided below, based on the user's request.
      You must only suggest books that are on the list.
      
      IMPORTANT: You must respond with only a valid JSON object and nothing else. Do not wrap the JSON in markdown backticks or any other text.
      The JSON object must have two keys:
      - "suggestion": A conversational and friendly suggestion, explaining WHY you are recommending this specific book based on the user's prompt. (e.g., "Based on your interest in classic adventures, I'd recommend 'Treasure Island'. It's a timeless tale of pirates and hidden gold that I think you'll love!").
      - "book": The exact book object {title, author, publishedYear} that you are recommending.

      Here is the list of available books:
      ---
      ${bookListString}
      ---

      The user's request is: "${userPrompt}"
    `;

    // 5. Call the Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // 6. Parse the response and send it to the client
    const suggestion = JSON.parse(text);
    res.status(200).json(suggestion);

  } catch (error) {
    console.error('Error getting AI suggestion from Gemini:', error);
    res.status(500).json({
      message: 'An error occurred while communicating with the Gemini AI assistant.',
      error: error.message,
    });
  }
};