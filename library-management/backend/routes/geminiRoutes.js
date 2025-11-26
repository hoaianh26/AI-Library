import express from 'express';
const router = express.Router();
import { generateContent, generateSummary } from '../controllers/geminiController.js'; // Note the .js extension
import { protect } from '../middleware/authMiddleware.js'; // Note the .js extension

router.post('/', protect, generateContent);
router.post('/summarize', protect, generateSummary);

export default router;