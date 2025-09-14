import express from 'express';
import { getBookSuggestion, generateChatResponse } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/ai/suggest
// @desc    Get a book suggestion from the AI assistant
// @access  Private
router.post('/suggest', protect, getBookSuggestion);

// @route   POST /api/ai/chat
// @desc    Engage in a conversational chat with the AI assistant (RAG)
// @access  Private
router.post('/chat', protect, generateChatResponse);

export default router;
