import { useState, useEffect } from "react";
import { useAuth } from './context/AuthContext';
import { Link } from 'react-router-dom';
import Recommendations from './components/Recommendations';
import { BookMarked, Eye, Heart } from 'lucide-react';
import { getFavorites } from './services/bookService';

function App() {
  const [books, setBooks] = useState([]);
  const [followingBooks, setFollowingBooks] = useState([]);
  const { user, token } = useAuth();

  const API_URL = "http://localhost:5000";

  // Fetch books from backend
  useEffect(() => {
    const fetchBooksAndFavorites = async () => {
      try {
        // Fetch all books
        const res = await fetch(`${API_URL}/api/books`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const allBooks = await res.json();
        setBooks(allBooks);
        
        // Fetch favorite books and limit to 5
        const favoriteBooksData = await getFavorites(token);
        // Sort by most recently added (assuming a 'createdAt' property exists in each favorite object)
        const sortedFavorites = favoriteBooksData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFollowingBooks(sortedFavorites.slice(0, 5));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    if (token) {
      fetchBooksAndFavorites();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="pt-16 px-4 w-full">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header với Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Your Digital Library</h1>
                <p className="text-gray-400">Discover {books.length} amazing books</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <Recommendations />

          {/* PHẦN CHIA 2 CỘT BẮT ĐẦU TỪ ĐÂY */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* BÊN TRÁI - ALL BOOKS (8 cột) */}
            <div className="lg:col-span-8">
              {/* Section Header */}
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">All Books</h2>
              </div>

              {/* Books Grid - 4 sách/hàng, tối đa 5 hàng = 20 sách */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {books.slice(0, 20).map((book, index) => (
                  <Link to={`/books/${book._id}`} key={book._id} className="flex">
                    <div
                      className="group relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/80 flex flex-col w-full"
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      {/* Book Image */}
                      <div className="relative overflow-hidden">
                        <img
                          src={book.imageUrl ? book.imageUrl : 'https://via.placeholder.com/300x400/6366f1/white?text=No+Cover'}
                          alt={book.title}
                          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Floating badge */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Book Info */}
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

              {/* Empty State */}
              {books.length === 0 && (
                <div className="text-center py-20">
                  <div className="inline-block mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-50"></div>
                      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-full border border-gray-700">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Your library is empty</h3>
                  <p className="text-gray-400 text-lg">Start by adding your first book!</p>
                </div>
              )}
            </div>

            {/* BÊN PHẢI - FAVORITES (4 cột) */}
            <div className="lg:col-span-4">
              <div className="sticky top-20">
                {/* Section Header */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg shadow-lg">
                    <BookMarked className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Favorites</h2>
                </div>

                {/* Following Books List */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-4 space-y-3">
                  {followingBooks.length > 0 ? (
                    followingBooks.map((book, index) => (
                      <Link 
                        to={`/books/${book._id}`} 
                        key={book._id}
                        className="flex gap-3 p-3 rounded-2xl hover:bg-white/80 transition-all duration-300 group"
                      >
                        {/* Book Thumbnail */}
                        <div className="relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden shadow-md">
                          <img
                            src={book.imageUrl ? book.imageUrl : 'https://via.placeholder.com/300x400/6366f1/white?text=No+Cover'}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>

                        {/* Book Info */}
                        <div className="flex-grow min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1">
                            {book.title}
                          </h4>
                          <p className="text-xs text-slate-600 mb-2 line-clamp-1">{book.author}</p>
                          
                          {/* Progress bar (giả định) */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Eye className="w-3 h-3" />
                              <span>Chương {Math.floor(Math.random() * 50) + 1}/100</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${Math.floor(Math.random() * 80) + 10}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookMarked className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600 text-sm">No favorites yet</p>
                    </div>
                  )}
                </div>

                {/* View All Button */}
                {followingBooks.length > 0 && (
                  <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                    Xem tất cả
                  </button>
                )}
              </div>
            </div>

          </div>
          {/* KẾT THÚC PHẦN CHIA 2 CỘT */}

        </div>
      </div>
    </div>
  );
}

export default App;