import express from 'express';
import { uploadFile } from '../controllers/fileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, uploadFile);

export default router;
