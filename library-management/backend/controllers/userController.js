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

    // Check if book is already favorited
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

    // Check if book is in favorites
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
    const user = await User.findById(req.user.id).populate('favorites'); // Populate to get full book details

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
