import express from 'express';
import {
  addReview,
  getBookReviews,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes
router.route('/').post(protect, addReview);
router.route('/:bookId').get(getBookReviews);
router.route('/:id').delete(protect, admin, deleteReview);

export default router;
