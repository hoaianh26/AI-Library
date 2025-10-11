import Book from '../models/Book.js';
import User from '../models/User.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();

    // Get top 5 most favorited books
    const popularBooks = await User.aggregate([
      { $unwind: '$favorites' },
      { $group: { _id: '$favorites', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      { $unwind: '$bookDetails' },
      { $project: { '_id': 0, 'book': '$bookDetails', 'favoritesCount': '$count' } }
    ]);

    // Get book count by category
    const booksByCategory = await Book.aggregate([
        { $unwind: '$categories' },
        { $group: { _id: '$categories', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { 'category': '$_id', 'count': 1, '_id': 0 } }
    ]);

    res.json({
      totalBooks,
      totalUsers,
      popularBooks,
      booksByCategory
    });

  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Server error while getting stats.' });
  }
};
