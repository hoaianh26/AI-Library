import express from 'express';
import { searchBooks } from '../controllers/searchController.js';

const router = express.Router();

// @route   GET /api/search
// @desc    Search for books by query
// @access  Public
router.get('/', searchBooks);

export default router;
