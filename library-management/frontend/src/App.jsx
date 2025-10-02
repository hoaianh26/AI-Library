import { useState, useEffect } from "react";
import { useAuth } from './context/AuthContext';
import { Link } from 'react-router-dom';

function App() {
  const [books, setBooks] = useState([]);
  const { user, token } = useAuth();

  const API_URL = "http://localhost:5000";

  // Fetch books from backend
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/books`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setBooks(data);
      } catch (err) {
        console.error("Error fetching books:", err);
      }
    };

    if (token) {
      fetchBooks();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="pt-24 px-6 w-full">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
              📚 Your Digital Library
            </h2>
            <p className="text-slate-600 text-lg">
              Discover ${books.length} amazing books
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {books.map((book, index) => (
              <Link to={`/books/${book._id}`} key={book._id} className="flex">
                <div
                  className="group relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/80 flex flex-col w-full"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={book.imageUrl ? book.imageUrl : 'https://via.placeholder.com/300x400/6366f1/white?text=No+Cover'}
                      alt={book.title}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="font-bold text-xl text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300 flex-grow">
                      {book.title}
                    </h3>
                    <p className="text-slate-600 font-medium mb-1">by {book.author}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {books.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">Your library is empty</h3>
              <p className="text-slate-500">Start by adding your first book!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
