import express from "express";
import Book from "../models/Book.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // Import middleware

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// SEARCH for books by title or author
router.get("/search", protect, async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const query = {
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { author: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    const books = await Book.find(query).limit(10); // Limit to 10 results for performance
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all books (accessible to all authenticated users)
router.get("/", protect, async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single book by id (accessible to all authenticated users)
router.get("/:id", protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE new book (only for admin)
router.post("/", protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE book (only for admin)
router.put("/:id", protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBook) return res.status(404).json({ message: "Book not found" });
    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE book (only for admin)
router.delete("/:id", protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const bookToDelete = await Book.findById(req.params.id);
    if (!bookToDelete) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Delete associated image file
    if (bookToDelete.imageUrl) {
      const imagePath = path.join(__dirname, '..', bookToDelete.imageUrl);
      try {
        await fs.promises.unlink(imagePath);
        console.log(`Deleted image: ${imagePath}`);
      } catch (err) {
        console.error(`Error deleting image ${imagePath}: ${err.message}`);
        // Continue with book deletion even if image deletion fails
      }
    }

    // Delete associated HTML content directory
    if (bookToDelete.htmlContentPath) {
      // htmlContentPath is like /public/book_content/filename/index.html
      // We need to get the directory: /public/book_content/filename/
      const contentDir = path.dirname(path.join(__dirname, '..', bookToDelete.htmlContentPath));
      try {
        await fs.promises.rm(contentDir, { recursive: true, force: true });
        console.log(`Deleted HTML content directory: ${contentDir}`);
      } catch (err) {
        console.error(`Error deleting HTML content directory ${contentDir}: ${err.message}`);
        // Continue with book deletion even if content deletion fails
      }
    }

    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
