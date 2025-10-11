import Book from '../models/Book.js';

// @desc    Search for books
// @route   GET /api/search
// @access  Public
export const searchBooks = async (req, res) => {
  try {
    const { q } = req.query; // q stands for query

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Using the $text operator for full-text search on indexed fields (title, author)
    // Also adding a regex search on categories for broader results
    const books = await Book.find({
      $or: [
        { $text: { $search: q } },
        { 'categories': { $in: [new RegExp(q, 'i')] } }
      ]
    }).limit(20); // Limit results for performance

    if (books.length === 0) {
        return res.status(404).json({ message: 'No books found matching your query.' });
    }

    res.json(books);

  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ message: 'Server error during book search.' });
  }
};
