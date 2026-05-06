// backend/routes/userRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  loginAdmin,
  verifyEmail,
  getUsers,
  updateUser,
  addFavorite,
  removeFavorite,
  getFavorites,
  addBookToHistory,
  getViewHistory,
  getUserProfile,
  updateUserProfile,
  updateMembership,
  updateUserMembershipByAdmin,
  changePassword,
  uploadAvatar,
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { uploadAvatar as uploadAvatarMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);
router.get("/verify-email", verifyEmail);  

// Admin-only
router.get("/", protect, authorizeRoles("admin"), getUsers);
router.put("/:id", protect, authorizeRoles("admin"), updateUser);
router.put("/:id/membership", protect, authorizeRoles("admin"), updateUserMembershipByAdmin);


// Favorites routes 
router.post("/favorites/add", protect, addFavorite);
router.post("/favorites/remove", protect, removeFavorite);
router.get("/favorites", protect, getFavorites);

// History routes – cũng chỉ cần đăng nhập
router.post("/history/add", protect, addBookToHistory);
router.get("/history", protect, getViewHistory);

// Profile
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/profile/change-password", protect, changePassword);
router.post("/profile/avatar", protect, uploadAvatarMiddleware.single('avatar'), uploadAvatar);

// Membership (nâng cấp / gia hạn)
router.patch("/membership", protect, updateMembership);

export default router;

