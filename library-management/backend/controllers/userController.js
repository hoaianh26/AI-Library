import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { TIERS, TIER_RANK } from "../../shared/tiers.js";

// 🔐 helper tạo JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Đăng ký
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      gender,
      address,
      phoneNumber,
      dateOfBirth,
      libraryId,
      status,
      membershipType,
      avatar,
      favoriteCategories,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ❌ KHÔNG hash ở đây nữa, để model lo
    const user = await User.create({
      name,
      email,
      password, // model sẽ tự hash trong pre("save")
      role,
      gender,
      address,
      phoneNumber,
      dateOfBirth,
      libraryId,
      status: status || "active",
      membershipType: membershipType || "standard",
      avatar,
      favoriteCategories,
    });

    return res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      address: user.address,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      libraryId: user.libraryId,
      status: user.status,
      membershipType: user.membershipType,
      avatar: user.avatar,
      favoriteCategories: user.favoriteCategories,
      // trả luôn các field membership mới nếu có
      membershipTier: user.membershipTier,
      membershipExpiresAt: user.membershipExpiresAt,
      isMembershipActive: user.isMembershipActive,
      token: generateToken(user),
    });
  } catch (error) {
    console.error("registerUser error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập user thường
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    // ✅ dùng method từ model, không dùng bcrypt trực tiếp
    if (user && (await user.matchPassword(password))) {
      if (user.role === "admin") {
        return res.status(403).json({
          message:
            "Admin login is not allowed here. Please use the admin login page.",
        });
      }

      return res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        membershipTier: user.membershipTier,
        membershipExpiresAt: user.membershipExpiresAt,
        isMembershipActive: user.isMembershipActive,
        token: generateToken(user),
      });
    } else {
      return res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("loginUser error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Not an admin." });
      }
      return res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user),
      });
    } else {
      return res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("loginAdmin error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res
        .status(403)
        .json({ message: "Cannot modify an admin account." });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    // ❌ không hash ở đây
    if (password) {
      user.password = password; // model sẽ hash trước khi save
    }

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      gender: updatedUser.gender,
      address: updatedUser.address,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error("updateUser error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add book to favorites
export const addFavorite = async (req, res) => {
  try {
    const { bookId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.favorites.includes(bookId)) {
      return res.status(400).json({ message: "Book already in favorites" });
    }

    user.favorites.push(bookId);
    await user.save();

    return res
      .status(200)
      .json({ message: "Book added to favorites", favorites: user.favorites });
  } catch (error) {
    console.error("addFavorite error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Remove book from favorites
export const removeFavorite = async (req, res) => {
  try {
    const { bookId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.favorites.includes(bookId)) {
      return res.status(400).json({ message: "Book not in favorites" });
    }

    user.favorites = user.favorites.filter(
      (favId) => favId.toString() !== bookId
    );
    await user.save();

    return res.status(200).json({
      message: "Book removed from favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("removeFavorite error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all favorite books for the user
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.favorites);
  } catch (error) {
    console.error("getFavorites error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add book to viewing history
export const addBookToHistory = async (req, res) => {
  try {
    const { bookId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.viewHistory)) {
      user.viewHistory = [];
    }

    user.viewHistory = user.viewHistory.filter(
      (entry) => entry.bookId.toString() !== bookId
    );

    user.viewHistory.unshift({ bookId: bookId, viewedAt: new Date() });

    if (user.viewHistory.length > 50) {
      user.viewHistory = user.viewHistory.slice(0, 50);
    }

    await user.save();
    return res.status(200).json({ message: "Book added to viewing history" });
  } catch (error) {
    console.error("addBookToHistory error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's viewing history
export const getViewHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "viewHistory.book",
      model: "Book",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.viewHistory);
  } catch (error) {
    console.error("getViewHistory error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper cộng thêm số tháng vào 1 ngày
const addMonths = (date, months) => {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) {
    d.setDate(0);
  }
  return d;
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        address: user.address,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        libraryId: user.libraryId,
        status: user.status,
        membershipType: user.membershipType,
        avatar: user.avatar,
        favoriteCategories: user.favoriteCategories,
        createdAt: user.createdAt,
        favorites: user.favorites,
        viewHistory: user.viewHistory,
        membershipTier: user.membershipTier,
        membershipExpiresAt: user.membershipExpiresAt,
        isMembershipActive: user.isMembershipActive,
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("getUserProfile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update current user's profile
export const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      gender,
      address,
      phoneNumber,
      dateOfBirth,
      avatar,
      favoriteCategories,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (gender !== undefined) user.gender = gender;
    if (address !== undefined) user.address = address;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (avatar !== undefined) user.avatar = avatar;
    if (favoriteCategories !== undefined) {
      user.favoriteCategories = favoriteCategories;
    }

    const updated = await user.save();

    return res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      gender: updated.gender,
      address: updated.address,
      phoneNumber: updated.phoneNumber,
      dateOfBirth: updated.dateOfBirth,
      libraryId: updated.libraryId,
      status: updated.status,
      membershipType: updated.membershipType,
      avatar: updated.avatar,
      favoriteCategories: updated.favoriteCategories,
      createdAt: updated.createdAt,
      favorites: updated.favorites,
      viewHistory: updated.viewHistory,
      membershipTier: updated.membershipTier,
      membershipExpiresAt: updated.membershipExpiresAt,
      isMembershipActive: updated.isMembershipActive,
    });
  } catch (error) {
    console.error("updateUserProfile error", error);
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/users/membership
// Body: { tier, durationMonths, paymentId? }
export const updateMembership = async (req, res) => {
  try {
    const { tier, durationMonths, paymentId } = req.body;
    const userId = req.user._id;

    if (!TIERS.includes(tier)) {
      return res.status(400).json({ message: "Invalid tier" });
    }

    const months = Number(durationMonths);
    if (!months || months <= 0) {
      return res.status(400).json({ message: "Invalid durationMonths" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const currentTier = user.membershipTier || "bronze";

    if (TIER_RANK[tier] < TIER_RANK[currentTier]) {
      return res
        .status(400)
        .json({ message: "Cannot downgrade membership tier" });
    }

    const now = new Date();
    const base =
      user.membershipExpiresAt && user.membershipExpiresAt > now
        ? user.membershipExpiresAt
        : now;

    const newExpiry = addMonths(base, months);

    user.membershipTier = tier;
    user.membershipExpiresAt = newExpiry;
    user.isMembershipActive = true;

    user.membershipHistory = user.membershipHistory || [];
    user.membershipHistory.push({
      tier,
      start: base,
      end: newExpiry,
      paymentId: paymentId || null,
    });

    await user.save();

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      address: user.address,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      libraryId: user.libraryId,
      status: user.status,
      avatar: user.avatar,
      favoriteCategories: user.favoriteCategories,
      membershipTier: user.membershipTier,
      membershipExpiresAt: user.membershipExpiresAt,
      isMembershipActive: user.isMembershipActive,
    });
  } catch (error) {
    console.error("updateMembership error", error);
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/:id/membership (Admin only)
// Body: { tier, expiresInDays? }
export const updateUserMembershipByAdmin = async (req, res) => {
  try {
    const { tier, expiresInDays } = req.body;
    const userId = req.params.id;

    if (!tier || !TIERS.includes(tier)) {
      return res.status(400).json({ message: "Invalid tier provided" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.membershipTier = tier;

    // Handle expiration
    const days = Number(expiresInDays);
    if (days > 0) {
      const now = new Date();
      now.setDate(now.getDate() + days);
      user.membershipExpiresAt = now;
    } else {
      // If expiresInDays is 0, empty, or not provided, set it to null for permanent
      user.membershipExpiresAt = null;
    }
    
    // An admin-set membership is always considered 'active' in principle
    user.isMembershipActive = true; 

    // Add to history
    user.membershipHistory = user.membershipHistory || [];
    user.membershipHistory.push({
      tier: user.membershipTier,
      start: new Date(),
      end: user.membershipExpiresAt,
      paymentId: `admin_grant_${req.user._id}`, // Note who granted it
    });

    const updatedUser = await user.save();

    // Return only the fields relevant to the user list
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      membershipTier: updatedUser.membershipTier,
      membershipExpiresAt: updatedUser.membershipExpiresAt,
      isMembershipActive: updatedUser.isMembershipActive,
    });

  } catch (error) {
    console.error("updateUserMembershipByAdmin error", error);
    res.status(500).json({ message: error.message });
  }
};


