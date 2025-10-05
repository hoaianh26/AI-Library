import Book from '../models/Book.js';
import User from '../models/User.js';

// @desc    Get book recommendations for a user
// @route   GET /api/books/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('viewHistory.book');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const viewedBookIds = user.viewHistory.map(item => item.book._id.toString());
    const favoriteBookIds = user.favorites.map(id => id.toString());
    const seenBookIds = [...new Set([...viewedBookIds, ...favoriteBookIds])];

    // Find user's preferred categories
    let preferredCategories = [];
    const booksInHistory = user.viewHistory.map(item => item.book);
    
    for (const book of booksInHistory) {
        if(book && book.categories) {
            preferredCategories.push(...book.categories);
        }
    }

    // If user has no history, recommend top 10 most recently added books
    if (preferredCategories.length === 0) {
      const recentBooks = await Book.find({}).sort({ createdAt: -1 }).limit(10);
      return res.json(recentBooks);
    }

    // Get unique categories
    const uniquePreferredCategories = [...new Set(preferredCategories)];

    // Find books that match the preferred categories, are not already seen by the user
    const recommendations = await Book.find({
      categories: { $in: uniquePreferredCategories },
      _id: { $nin: seenBookIds } // Exclude seen books
    }).limit(10);

    // If not enough recommendations, fill with most recent books
    if (recommendations.length < 10) {
        const additionalBooksNeeded = 10 - recommendations.length;
        const recommendationIds = recommendations.map(b => b._id.toString());
        const allExcludedIds = [...new Set([...seenBookIds, ...recommendationIds])];

        const recentBooks = await Book.find({
            _id: { $nin: allExcludedIds }
        }).sort({ createdAt: -1 }).limit(additionalBooksNeeded);

        recommendations.push(...recentBooks);
    }

    res.json(recommendations);

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Server error while getting recommendations.' });
  }
};

export { getRecommendations };
