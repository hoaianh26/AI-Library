import express from "express";
import { registerUser, loginUser, addFavorite, removeFavorite, getFavorites, loginAdmin, getUsers, updateUser, addBookToHistory, getViewHistory } from "../controllers/userController.js";
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);

// Admin routes
router.get("/", protect, authorizeRoles('admin'), getUsers);
router.put("/:id", protect, authorizeRoles('admin'), updateUser);

// Favorites routes (for students and teachers)
router.post("/favorites/add", protect, authorizeRoles('student', 'teacher'), addFavorite);
router.post("/favorites/remove", protect, authorizeRoles('student', 'teacher'), removeFavorite);
router.get("/favorites", protect, authorizeRoles('student', 'teacher'), getFavorites);

// History routes (for students and teachers)
router.post("/history/add", protect, authorizeRoles('student', 'teacher'), addBookToHistory);
router.get("/history", protect, authorizeRoles('student', 'teacher'), getViewHistory);

export default router;
