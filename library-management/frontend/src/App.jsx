import { useState, useEffect } from "react";
import { useAuth } from './context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Recommendations from './components/Recommendations';
import { BookMarked, Eye, Sparkles } from 'lucide-react';
import { getFavorites } from './services/bookService';

function App() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [followingBooks, setFollowingBooks] = useState([]);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // Redirect admin to dashboard
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin-dashboard');
    }
  }, [user, navigate]);


  // Fetch books and user data for non-admins
  useEffect(() => {
    const fetchBooksAndFavorites = async () => {
      try {
        // Fetch all books
        const res = await fetch(`${API_URL}/books?page=${page}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const booksData = await res.json();
        setBooks(booksData.books || []); // Handle paginated and non-paginated response
        setPage(booksData.page);
        setPages(booksData.pages);
        setTotal(booksData.total);
        
        // Fetch favorite books and limit to 5
        const favoriteBooksData = await getFavorites(token);
        const sortedFavorites = favoriteBooksData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFollowingBooks(sortedFavorites.slice(0, 5));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    if (token && user && user.role !== 'admin') {
      fetchBooksAndFavorites();
    }
  }, [token, user, page]);

  // Render nothing or a loading spinner while redirecting or for admin
  if (user && user.role === 'admin') {
    return null; 
  }

  const Pagination = ({ page, pages, onPageChange }) => {
    if (pages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
        >
          Previous
        </button>
        <span className="text-white font-semibold">
          Page {page} of {pages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
        >
          Next
        </button>
      </div>
    );
  };


  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      {/* Enhanced Header with Logo */}
      <div className="mb-16 mt-8">
        <div className="flex items-center gap-5 mb-2">
          <div className="relative group">
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4 rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Your Digital Library
              </h1>
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-gray-300 text-lg font-medium">Discover and explore amazing books</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-16">
        <Recommendations />
      </div>

      {/* TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SIDE - ALL BOOKS (8 columns) */}
        <div className="lg:col-span-8">
          {/* Enhanced Section Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur-md opacity-75"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl shadow-xl">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">All Books</h2>
                <p className="text-sm text-gray-400 font-medium mt-0.5">{total} books available</p>
              </div>
            </div>
          </div>

          {/* Enhanced Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book, index) => (
              <Link to={`/books/${book._id}`} key={book._id} className="flex">
                <div
                  className="group relative bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden hover:shadow-[0_20px_50px_rgba(138,43,226,0.3)] transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] flex flex-col w-full"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                    opacity: 0
                  }}
                >
                  {/* Enhanced Book Image */}
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img
                      src={book.imageUrl ? book.imageUrl : 'https://via.placeholder.com/300x400/6366f1/white?text=No+Cover'}
                      alt={book.title}
                      className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-125 group-hover:rotate-2"
                    />
                    
                    {/* Enhanced floating badge with animation */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110 z-20">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 backdrop-blur-sm px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
                        <Eye className="w-4 h-4 text-white" />
                        <span className="text-white text-xs font-bold">View</span>
                      </div>
                    </div>

                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    </div>
                  </div>

                  {/* Enhanced Book Info */}
                  <div className="p-6 flex-grow flex flex-col relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-3xl"></div>
                    <h3 className="relative font-black text-xl text-slate-800 mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                      {book.title}
                    </h3>
                    <p className="relative text-slate-600 font-semibold text-sm group-hover:text-indigo-600 transition-colors duration-300">
                      by {book.author}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination page={page} pages={pages} onPageChange={setPage} />

          {/* Enhanced Empty State */}
          {books.length === 0 && (
            <div className="text-center py-24">
              <div className="inline-block mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black p-12 rounded-full border-2 border-gray-700 shadow-2xl">
                    <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">Your library is empty</h3>
              <p className="text-gray-300 text-xl font-medium">Start by adding your first book!</p>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - ENHANCED FAVORITES (4 columns) */}
        <div className="lg:col-span-4">
          <div className="lg:sticky top-20">
            {/* Enhanced Section Header */}
            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur-md opacity-75"></div>
                <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-xl">
                  <BookMarked className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">Favorites</h2>
                <p className="text-sm text-gray-400 font-medium mt-0.5">Your saved books</p>
              </div>
            </div>

            {/* Enhanced Following Books List */}
            <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 p-5 space-y-3">
              {followingBooks.length > 0 ? (
                followingBooks.map((book, index) => (
                  <Link 
                    to={`/books/${book._id}`} 
                    key={book._id}
                    className="flex gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group border border-transparent hover:border-purple-200 hover:shadow-lg"
                    style={{
                      animation: 'slideInRight 0.5s ease-out forwards',
                      animationDelay: `${index * 100}ms`,
                      opacity: 0
                    }}
                  >
                    {/* Enhanced Book Thumbnail */}
                    <div className="relative flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <img
                        src={book.imageUrl ? book.imageUrl : 'https://via.placeholder.com/300x400/6366f1/white?text=No+Cover'}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Enhanced Book Info */}
                    <div className="flex-grow min-w-0 flex flex-col justify-center">
                      <h4 className="font-black text-slate-800 text-base line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all mb-2">
                        {book.title}
                      </h4>
                      <p className="text-sm text-slate-600 font-semibold line-clamp-1 group-hover:text-purple-600 transition-colors">
                        by {book.author}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="inline-block mb-4 p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
                    <BookMarked className="w-12 h-12 text-purple-400" />
                  </div>
                  <p className="text-slate-600 font-semibold">No favorites yet</p>
                  <p className="text-slate-400 text-sm mt-1">Start adding books you love!</p>
                </div>
              )}
            </div>

            {/* Enhanced View All Button */}
            {followingBooks.length > 0 && (
              <button
                onClick={() => navigate('/favorites')}
                className="w-full mt-5 py-4 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 text-white rounded-2xl font-black text-lg hover:from-purple-600 hover:via-pink-600 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-[0_10px_40px_rgba(168,85,247,0.5)] hover:scale-105 transform relative overflow-hidden group"
              >
                <span className="relative z-10">View All Favorites</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;