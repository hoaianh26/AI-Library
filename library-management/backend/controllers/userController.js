import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Đăng ký
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, gender, address } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      gender,
      address,
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      address: user.address,
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.role === 'admin') {
        return res.status(403).json({ message: "Admin login is not allowed here. Please use the admin login page." });
      }
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" }),
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
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

    res.status(200).json({ message: "Book added to favorites", favorites: user.favorites });
  } catch (error) {
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

    res.status(200).json({ message: "Book removed from favorites", favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all favorite books for the user
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Not an admin." });
      }
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" }),
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
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

    if (user.role === 'admin') {
      return res.status(403).json({ message: "Cannot modify an admin account." });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      gender: updatedUser.gender,
      address: updatedUser.address,
      createdAt: updatedUser.createdAt,
    });

  } catch (error) {
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
      (entry) => entry.book.toString() !== bookId
    );

    user.viewHistory.unshift({ book: bookId, viewedAt: new Date() });

    if (user.viewHistory.length > 50) {
      user.viewHistory = user.viewHistory.slice(0, 50);
    }

    await user.save();
    res.status(200).json({ message: "Book added to viewing history" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's viewing history
export const getViewHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'viewHistory.book',
      model: 'Book'
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.viewHistory);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
