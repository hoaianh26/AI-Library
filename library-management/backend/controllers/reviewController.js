import Review from '../models/Review.js';
import Book from '../models/Book.js';

// @desc    Add a new review
// @route   POST /api/reviews
// @access  Private
export const addReview = async (req, res) => {
  const { rating, comment, bookId } = req.body;

  try {
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const alreadyReviewed = await Review.findOne({ book: bookId, user: req.user._id });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    const review = new Review({
      rating: Number(rating),
      comment,
      book: bookId,
      user: req.user._id,
    });

    await review.save();

    // Update book's rating and numReviews
    const reviews = await Review.find({ book: bookId });
    book.numReviews = reviews.length;
    book.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await book.save();

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server error while adding review.' });
  }
};

// @desc    Get all reviews for a book
// @route   GET /api/reviews/:bookId
// @access  Public
export const getBookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId }).populate('user', 'name avatar');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching reviews.' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Admin
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const book = await Book.findById(review.book);

        await review.remove();

        // Recalculate rating for the book
        if (book) {
            const reviews = await Review.find({ book: review.book });
            book.numReviews = reviews.length;
            if (reviews.length > 0) {
                book.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
            } else {
                book.rating = 0; // Reset rating if no reviews are left
            }
            await book.save();
        }

        res.json({ message: 'Review removed' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Server error while deleting review.' });
    }
};
