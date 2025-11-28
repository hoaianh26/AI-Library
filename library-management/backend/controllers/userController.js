import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { TIERS, TIER_RANK } from "../shared/tiers.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// 🔐 Helper to create JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// =========================== AUTH ===================================

// Register
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

    // generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = Date.now() + 1000 * 60 * 60 * 24; // 24h

    const user = await User.create({
      name,
      email,
      password, // password will be hashed by User model
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
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your AI Library account",
      html: `
        <p>Hi ${user.name || "there"},</p>
        <p>Please click the link below to verify your email address:</p>
        <p><a href="${verifyUrl}" target="_blank">${verifyUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    return res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("registerUser error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Normal user login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // prevent admin from using this endpoint
      if (user.role === "admin") {
        return res.status(403).json({
          message:
            "Admin login is not allowed here. Please use the admin login page.",
        });
      }

      // block login if email is not verified
      if (!user.isEmailVerified) {
        return res.status(403).json({
          message: "Email is not verified. Please check your inbox.",
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

// Admin login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Not an admin." });
      }

      if (!user.isEmailVerified) {
        return res.status(403).json({
          message: "Email is not verified. Please check your inbox.",
        });
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

// GET /api/users/verify-email?token=...
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .json({ message: "Verification token is required" });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("verifyEmail error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =========================== USER MANAGEMENT ===============================

// Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchTerm = req.query.search || '';
    const sortKey = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'desc' ? -1 : 1;

    const searchFilter = searchTerm
      ? {
          $or: [
            { name: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
          ],
        }
      : {};

    const sortQuery = {};
    if (sortKey) {
        sortQuery[sortKey] = sortOrder;
    }

    const count = await User.countDocuments({ ...searchFilter });
    const users = await User.find({ ...searchFilter })
      .sort(sortQuery)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .select("-password");

    res.json({
      users,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
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

    if (password) {
      user.password = password; // will be hashed in model
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
  console.log('[HISTORY] Received request to add book to history.');
  try {
    const { bookId } = req.body;
    console.log(`[HISTORY] Book ID from request body: ${bookId}`);

    if (!req.user || !req.user.id) {
      console.log('[HISTORY] Error: User not found on request object.');
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log(`[HISTORY] Error: Could not find user with ID: ${req.user.id}`);
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.viewHistory)) {
      console.log('[HISTORY] User viewHistory is not an array, initializing.');
      user.viewHistory = [];
    }

    const historyLengthBefore = user.viewHistory.length;
    console.log(`[HISTORY] View history length before update: ${historyLengthBefore}`);

    // Remove existing entry for the same book to move it to the top
    user.viewHistory = user.viewHistory.filter(
      (entry) => entry.bookId.toString() !== bookId
    );

    const historyLengthAfterFilter = user.viewHistory.length;
    if(historyLengthBefore > historyLengthAfterFilter) {
      console.log(`[HISTORY] Removed existing entry for book ID: ${bookId}`);
    }

    // Add the new entry to the beginning of the array
    user.viewHistory.unshift({ bookId: bookId, viewedAt: new Date() });
    console.log(`[HISTORY] Added new entry for book ID: ${bookId} to the beginning of the history.`);

    // Keep history capped at 50
    if (user.viewHistory.length > 50) {
      user.viewHistory = user.viewHistory.slice(0, 50);
      console.log('[HISTORY] History length exceeded 50, trimmed to 50 entries.');
    }

    console.log('[HISTORY] Attempting to save user document...');
    await user.save();
    console.log('[HISTORY] User document saved successfully.');
    
    return res.status(200).json({ message: "Book added to viewing history" });
  } catch (error) {
    console.error("[HISTORY-FATAL] addBookToHistory error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's viewing history
export const getViewHistory = async (req, res) => {
  console.log('[GET HISTORY] Received request to get user view history.');
  try {
    if (!req.user || !req.user.id) {
      console.log('[GET HISTORY] Error: User not found on request object.');
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Step 1: Find the user WITHOUT populating first to see the raw data.
    const userRaw = await User.findById(req.user.id).lean();
    if (!userRaw) {
      console.log(`[GET HISTORY] Error: Could not find user with ID: ${req.user.id}`);
      return res.status(404).json({ message: "User not found" });
    }
    console.log('[GET HISTORY] Raw user.viewHistory from DB:', JSON.stringify(userRaw.viewHistory, null, 2));

    // Step 2: Now find and populate to see the result.
    const user = await User.findById(req.user.id).populate({
      path: "viewHistory.bookId",
      model: "Book",
    });
    console.log('[GET HISTORY] user.viewHistory after populate:', JSON.stringify(user.viewHistory, null, 2));

    return res.status(200).json(user.viewHistory);
  } catch (error) {
    console.error("[GET HISTORY-FATAL] getViewHistory error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper to add months to a date
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

// Change current user's password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    user.password = newPassword; // Mongoose pre-save hook will hash it
    await user.save();

    res.json({ message: "Mật khẩu đã được thay đổi thành công" });
  } catch (error) {
    console.error("changePassword error", error);
    res.status(500).json({ message: error.message });
  }
};

// Upload user avatar
export const uploadAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // `req.file.path` contains the URL from Cloudinary
    user.avatar = req.file.path;
    await user.save();

    res.json({
      message: "Avatar uploaded successfully",
      avatarUrl: user.avatar,
    });
  } catch (error) {
    console.error("uploadAvatar error", error);
    res.status(500).json({ message: "Avatar upload failed" });
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

    console.log("updateMembership: req.body", req.body);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("updateMembership: user before", user);
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
    console.log("updateMembership: newExpiry", newExpiry);

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
    console.log("updateMembership: user after", user);

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

    const days = Number(expiresInDays);
    if (days > 0) {
      const now = new Date();
      now.setDate(now.getDate() + days);
      user.membershipExpiresAt = now;
    } else {
      user.membershipExpiresAt = null;
    }

    user.isMembershipActive = true;

    user.membershipHistory = user.membershipHistory || [];
    user.membershipHistory.push({
      tier: user.membershipTier,
      start: new Date(),
      end: user.membershipExpiresAt,
      paymentId: `admin_grant_${req.user._id}`,
    });

    const updatedUser = await user.save();

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