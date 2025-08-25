import { useEffect, useState } from "react";
import { getBooks } from "../services/bookService";

const BookList = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const data = await getBooks();
    setBooks(data);
  };

  return (
    <div className="p-4 bg-white shadow rounded-2xl">
      <h2 className="text-xl font-bold mb-3">📚 Danh sách sách</h2>
      <ul className="space-y-2">
        {books.map((book) => (
          <li key={book.id} className="border p-2 rounded-lg">
            <p className="font-semibold">{book.title}</p>
            <p className="text-gray-600">Tác giả: {book.author}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookList;
