import express from "express";
import Book from "../models/Book.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from 'cloudinary';
import { protect, authorizeRoles } from "../middleware/authMiddleware.js"; // Import middleware
import { getRecommendations } from "../controllers/bookController.js"; // Import recommendations controller
import { TIERS, TIER_RANK, DEFAULT_TIER } from "../../shared/tiers.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper to check lock status based on membership and allowedTiers
const isBookLockedForUser = (book, user) => {
  if (!user) return true;

  // Admins can access all books
  if (user.role === "admin") return false;

  // If membership is explicitly disabled, block access
  if (user.isMembershipActive === false) return true;
  
  // If book has no allowedTiers, it's free for all active users.
  if (!book.allowedTiers || book.allowedTiers.length === 0) return false;

  // Defensively check user's tier. If it's not a valid tier, default to 'bronze'.
  let userTier = user.membershipTier;
  if (!TIERS.includes(userTier)) {
    userTier = DEFAULT_TIER;
  }

  // If user has a membership with an expiry date, check if it's expired.
  // If expired, the user falls back to 'bronze' tier.
  if (user.membershipExpiresAt) {
    const now = new Date();
    const expiresAt = new Date(user.membershipExpiresAt);
    if (expiresAt < now) {
      userTier = DEFAULT_TIER;
    }
  }

  const userTierRank = TIER_RANK[userTier] || 0;

  // Find the minimum tier rank required for the book.
  const minRequiredTierRank = Math.min(
    ...book.allowedTiers.map((tier) => TIER_RANK[tier] || 1)
  );

  // Lock the book if the user's tier is lower than the minimum required tier.
  return userTierRank < minRequiredTierRank;
};

const attachLockFlag = (book, user, { hideContentPathIfLocked = false } = {}) => {
  const locked = isBookLockedForUser(book, user);
  const plain = book.toObject ? book.toObject() : { ...book };

  plain.locked = locked;

  if (locked && hideContentPathIfLocked) {
    plain.htmlContentPath = null;
  }

  return plain;
};

const normalizeAllowedTiers = (rawAllowedTiers) => {
  if (!Array.isArray(rawAllowedTiers) || rawAllowedTiers.length === 0) {
    return TIERS;
  }
  const filtered = rawAllowedTiers.filter((t) => TIERS.includes(t));
  return filtered.length > 0 ? filtered : TIERS;
};

// GET recommendations for the current user
router.get("/recommendations", protect, getRecommendations);

// SEARCH for books by title or author
router.get("/search", protect, async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const query = {
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { author: { $regex: searchTerm, $options: "i" } },
      ],
    };

    const books = await Book.find(query).limit(10);
    const user = req.user;

    const booksWithLock = books.map((book) =>
      attachLockFlag(book, user, { hideContentPathIfLocked: true })
    );

    res.json(booksWithLock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all books (accessible to all authenticated users)
router.get("/", protect, async (req, res) => {
  try {
    const pageSize = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;

    const count = await Book.countDocuments({});
    const books = await Book.find({})
      .limit(pageSize)
      .skip(pageSize * (page - 1));
      
    const user = req.user;

    const booksWithLock = books.map((book) =>
      attachLockFlag(book, user, { hideContentPathIfLocked: true })
    );

    res.json({
      books: booksWithLock,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET books by category
router.get("/category/:categoryName", protect, async (req, res) => {
  try {
    const pageSize = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    // The category name from URL is slugified (e.g., "science-fiction").
    // We perform a case-insensitive search for the original category name.
    const categoryName = req.params.categoryName.replace(/-/g, " ");
    const query = {
      categories: { $regex: new RegExp("^" + categoryName + "$", "i") },
    };

    const count = await Book.countDocuments(query);
    const books = await Book.find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    const user = req.user;
    const booksWithLock = books.map((book) =>
      attachLockFlag(book, user, { hideContentPathIfLocked: true })
    );

    res.json({
      books: booksWithLock,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single book by id (accessible to all authenticated users)
router.get("/:id", protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const user = req.user;
    const bookWithLock = attachLockFlag(book, user, {
      hideContentPathIfLocked: true,
    });

    res.json(bookWithLock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE new book (only for admin)
router.post("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { allowedTiers, ...rest } = req.body;

    const normalizedAllowedTiers = normalizeAllowedTiers(allowedTiers);

    const newBook = new Book({
      ...rest,
      allowedTiers: normalizedAllowedTiers,
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE book (only for admin)
router.put("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { allowedTiers, ...rest } = req.body;

    const update = { ...rest };
    if (allowedTiers !== undefined) {
      update.allowedTiers = normalizeAllowedTiers(allowedTiers);
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!updatedBook)
      return res.status(404).json({ message: "Book not found" });
    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE book (only for admin)
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const bookToDelete = await Book.findById(req.params.id);
    if (!bookToDelete) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Delete associated image file from Cloudinary or local storage
    if (bookToDelete.imageUrl) {
      try {
        if (bookToDelete.imageUrl.includes('res.cloudinary.com')) {
          // It's a Cloudinary URL, extract public_id and delete
          const urlParts = bookToDelete.imageUrl.split('/');
          const publicIdWithExt = urlParts.slice(urlParts.indexOf('library_uploads')).join('/');
          const publicId = path.parse(publicIdWithExt).name;
          
          const result = await cloudinary.uploader.destroy(`library_uploads/${publicId}`);
          console.log('Cloudinary deletion result:', result);
          if (result.result !== 'ok' && result.result !== 'not found') {
            throw new Error(result.result);
          }
          console.log(`Deleted image from Cloudinary: ${publicId}`);

        } else {
          // It's a local file, delete it from the filesystem
          const imagePath = path.join(__dirname, "..", bookToDelete.imageUrl);
          await fs.promises.unlink(imagePath);
          console.log(`Deleted local image: ${imagePath}`);
        }
      } catch (err) {
        console.error(
          `Error deleting image asset: ${err.message}`
        );
        // Continue with book deletion even if image deletion fails
      }
    }

    // Delete associated HTML content directory
    if (bookToDelete.htmlContentPath) {
      // htmlContentPath is like /public/book_content/filename/index.html
      // We need to get the directory: /public/book_content/filename/
      const contentDir = path.dirname(
        path.join(__dirname, "..", bookToDelete.htmlContentPath)
      );
      try {
        await fs.promises.rm(contentDir, { recursive: true, force: true });
        console.log(`Deleted HTML content directory: ${contentDir}`);
      } catch (err) {
        console.error(
          `Error deleting HTML content directory ${contentDir}: ${err.message}`
        );
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
