import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    publishedYear: { type: Number },
    genre: { type: String },
    available: { type: Boolean, default: true },
    imageUrl: { type: String },
    htmlContentPath: { type: String },
  },
  { timestamps: true }
);

// Add a text index to the title and author fields for text search
bookSchema.index({ title: 'text', author: 'text' });

const Book = mongoose.model("Book", bookSchema);
export default Book;
