import express from 'express';
import { getBookSuggestion } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/ai/suggest
// @desc    Get a book suggestion from the AI assistant
// @access  Private
router.post('/api/ai/suggest', protect, getBookSuggestion);

export default router;
