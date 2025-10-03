import express from 'express';
const router = express.Router();
import { generateContent } from '../controllers/geminiController.js'; // Note the .js extension
import { protect } from '../middleware/authMiddleware.js'; // Note the .js extension

router.post('/', protect, generateContent);

export default router;