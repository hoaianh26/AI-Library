import { useEffect, useState } from "react";
import { getBooks } from "../services/bookService";
import BookCard from "./BookCard";

const BookList = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-slate-800">📚 All Books</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {books.map((book, index) => (
          <BookCard key={book._id} book={book} index={index} />
        ))}
      </div>
    </div>
  );
};

export default BookList;
