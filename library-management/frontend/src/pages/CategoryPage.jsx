import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const API_URL = "http://localhost:5000";

  // Create a user-friendly title from the URL slug
  const categoryTitle = categoryName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  useEffect(() => {
    const fetchBooksByCategory = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/books/category/${categoryName}`, {
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
        console.error(`Error fetching books for category ${categoryName}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && categoryName) {
      fetchBooksByCategory();
    }
  }, [token, categoryName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="pt-24 px-6 w-full">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
              Category: {categoryTitle}
            </h2>
            <p className="text-slate-600 text-lg">
              {isLoading ? 'Loading books...' : `${books.length} books found`}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-16 font-semibold text-slate-600">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {books.map((book, index) => (
                <Link to={`/books/${book._id}`} key={book._id} className="flex">
                  <div
                    className="group relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/80 flex flex-col w-full"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={book.imageUrl ? book.imageUrl : 'https://via.placeholder.com/300x400/6366f1/white?text=No+Cover'}
                        alt={book.title}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
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
          )}

          {!isLoading && books.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">No books found in this category.</h3>
              <p className="text-slate-500">Try exploring other categories!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
