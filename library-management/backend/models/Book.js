import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    publishedYear: { type: Number },
    categories: [{ type: String }],
    available: { type: Boolean, default: true },
    imageUrl: { type: String },
    htmlContentPath: { type: String },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

// Add a text index to the title and author fields for text search
bookSchema.index({ title: 'text', author: 'text' });

// Virtual for full image URL
bookSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.imageUrl && !ret.imageUrl.startsWith('http')) {
      // Prepend the base URL of the backend
      ret.imageUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}${ret.imageUrl}`;
    }
    return ret;
  },
});

const Book = mongoose.model("Book", bookSchema);
export default Book;
