import express from "express";
import { registerUser, loginUser, addFavorite, removeFavorite, getFavorites, loginAdmin, getUsers, updateUser } from "../controllers/userController.js";
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

export default router;
