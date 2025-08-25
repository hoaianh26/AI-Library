import express from "express";
import { registerUser, loginUser, addFavorite, removeFavorite, getFavorites } from "../controllers/userController.js";
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Favorites routes (for students and teachers)
router.post("/favorites/add", protect, authorizeRoles('student', 'teacher'), addFavorite);
router.post("/favorites/remove", protect, authorizeRoles('student', 'teacher'), removeFavorite);
router.get("/favorites", protect, authorizeRoles('student', 'teacher'), getFavorites);

export default router;
