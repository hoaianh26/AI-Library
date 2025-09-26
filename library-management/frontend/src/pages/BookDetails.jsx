import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBook, deleteBook, addFavorite, removeFavorite, getFavorites } from '../services/bookService';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';

const BookDetails = () => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // New states for favorites popup
  const [showFavoritesPopup, setShowFavoritesPopup] = useState(false);
  const [favoritesMessage, setFavoritesMessage] = useState('');
  const [favoritesType, setFavoritesType] = useState(''); // 'added' or 'removed'
  
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const bookData = await getBook(id, token);
        setBook(bookData);
        setError(null);
        setIsVisible(true);

        // Check if book is favorited
        if (user && user.role !== 'admin') {
          const userFavorites = await getFavorites(token);
          setIsFavorited(userFavorites.some(favBook => favBook._id === bookData._id));
        }

      } catch (err) {
        setError('Failed to fetch book details.');
        console.error(err);
        setIsVisible(true);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBook();
    }
  }, [id, token, user]);

  // Log viewing history
  useEffect(() => {
    const logHistory = async () => {
      if (user && user.role !== 'admin' && book) {
        try {
          await fetch(`${API_URL}/api/users/history/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ bookId: book._id }),
          });
        } catch (err) {
          console.error("Failed to log history:", err);
        }
      }
    };

    logHistory();
  }, [book, user, token]);

  // Auto hide favorites popup after 3 seconds
  useEffect(() => {
    if (showFavoritesPopup) {
      const timer = setTimeout(() => {
        setShowFavoritesPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showFavoritesPopup]);

  const handleDelete = async () => {
    try {
      await deleteBook(id);
      setIsVisible(false);
      setTimeout(() => navigate('/'), 300);
    } catch (err) {
      console.error("Error deleting book:", err);
      alert('Failed to delete book.');
    }
  };

  const handleNavigation = (path) => {
    setIsVisible(false);
    setTimeout(() => navigate(path), 300);
  };

  const showFavoritesNotification = (message, type) => {
    setFavoritesMessage(message);
    setFavoritesType(type);
    setShowFavoritesPopup(true);
  };

  const handleToggleFavorite = async () => {
    if (!user || user.role === 'admin') return;

    try {
      if (isFavorited) {
        await removeFavorite(book._id, token);
        setIsFavorited(false);
        showFavoritesNotification(`"${book.title}" removed from favorites!`, 'removed');
      } else {
        await addFavorite(book._id, token);
        setIsFavorited(true);
        showFavoritesNotification(`"${book.title}" added to favorites!`, 'added');
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      showFavoritesNotification('Failed to update favorites. Please try again.', 'error');
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="flex justify-center items-center min-h-screen relative z-10">
          <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Loading book details...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <PageTransition isVisible={isVisible} direction="fade">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-300/30 to-pink-300/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl"></div>
          </div>

          <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-rose-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                ⚠️
              </div>
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                Oops! Something went wrong
              </h2>
              <p className="text-red-600 text-lg mb-6">{error}</p>
              <button
                onClick={() => handleNavigation('/')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Library
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Book Not Found State
  if (!book) {
    return (
      <PageTransition isVisible={isVisible} direction="fade">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-300/30 to-orange-300/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl"></div>
          </div>

          <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                🔍
              </div>
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Book Not Found
              </h2>
              <p className="text-slate-600 mb-6">The book you're looking for doesn't exist or may have been removed.</p>
              <button
                onClick={() => handleNavigation('/')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Library
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition isVisible={isVisible} direction="fade">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 relative overflow-hidden">
        {/* Enhanced background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Floating shapes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-5 h-5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-60 animate-bounce" style={{animationDelay: '1s'}}></div>

        <div className="pt-24 px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Back Navigation */}
            <div className="mb-8">
              <button
                onClick={() => handleNavigation('/')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-xl rounded-2xl text-slate-600 hover:text-slate-800 hover:bg-white/80 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-white/40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Library
              </button>
            </div>

            {/* Main Content */}
            <div className="bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/50 hover:bg-white/80 transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                {/* Book Cover */}
                <div className="lg:col-span-2">
                  <div className="relative group">
                    <div className={`transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                      <img
                        src={book.imageUrl ? `${API_URL}${book.imageUrl}` : 'https://via.placeholder.com/400x600/6366f1/white?text=No+Cover'}
                        alt={book.title}
                        className="w-full h-auto object-cover rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:scale-105"
                        onLoad={() => setImageLoaded(true)}
                      />
                    </div>
                    {!imageLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      </div>
                    )}
                    {/* Decorative gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>

                {/* Book Information */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Title and Author */}
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 leading-tight">
                      {book.title}
                    </h1>
                    <p className="text-slate-700 font-semibold text-xl md:text-2xl flex items-center gap-2">
                      <span className="text-indigo-500">✍️</span>
                      by {book.author}
                    </p>
                  </div>

                  {/* Book Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-100">
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="text-indigo-500">📅</span>
                        <span className="font-semibold">Published:</span>
                        <span>{book.publishedYear}</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100 md:col-span-2">
                      <div className="flex items-center gap-2 text-slate-700 mb-3">
                        <span className="text-purple-500">🏷️</span>
                        <span className="font-semibold">Categories:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {book.categories && book.categories.length > 0 ? (
                          book.categories.map((category, index) => (
                            <span key={index} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">
                              {category}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-2xl border border-cyan-100 md:col-span-2">
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="text-cyan-500">📚</span>
                        <span className="font-semibold">Added to library:</span>
                        <span>{new Date(book.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {book.description && (
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-2xl border border-slate-200">
                      <h3 className="font-semibold text-lg mb-3 text-slate-800 flex items-center gap-2">
                        <span className="text-slate-500">📖</span>
                        Description
                      </h3>
                      <p className="text-slate-600 leading-relaxed">{book.description}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    {/* Favorite Button */}
                    {user && user.role !== 'admin' && (
                      <button
                        onClick={handleToggleFavorite}
                        className={`group inline-flex items-center justify-center gap-3 w-full p-4 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg
                          ${isFavorited 
                            ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700'
                            : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300'
                          }`}
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{isFavorited ? '❤️' : '🤍'}</span>
                        <span>{isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                      </button>
                    )}

                    {/* Read Online Button */}
                    {book.htmlContentPath && (
                      <a
                        href={`${API_URL}${book.htmlContentPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 rounded-2xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold text-lg"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📖</span>
                        <span className="text-white">Read Online</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}

                    {/* Admin Actions */}
                    {user && user.role === 'admin' && (
                      <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => handleNavigation(`/edit-book/${id}`)}
                          className="group flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-2xl hover:from-amber-500 hover:to-orange-600 transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          <span className="text-lg group-hover:rotate-12 transition-transform duration-300">✏️</span>
                          <span>Edit Book</span>
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="group flex-1 bg-gradient-to-r from-red-400 to-rose-500 text-white px-6 py-3 rounded-2xl hover:from-red-500 hover:to-rose-600 transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          <span className="text-lg group-hover:scale-110 transition-transform duration-300">🗑️</span>
                          <span>Delete Book</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Favorites Notification Popup */}
        {showFavoritesPopup && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
            <div className={`relative bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border max-w-sm transform transition-all duration-300 ${
              favoritesType === 'added' 
                ? 'border-green-200 bg-gradient-to-br from-green-50/80 to-emerald-50/80' 
                : favoritesType === 'removed'
                ? 'border-orange-200 bg-gradient-to-br from-orange-50/80 to-yellow-50/80'
                : 'border-red-200 bg-gradient-to-br from-red-50/80 to-rose-50/80'
            }`}>
              {/* Close button */}
              <button
                onClick={() => setShowFavoritesPopup(false)}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/80 transition-all duration-200 text-slate-500 hover:text-slate-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  favoritesType === 'added' 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                    : favoritesType === 'removed'
                    ? 'bg-gradient-to-r from-orange-400 to-yellow-500'
                    : 'bg-gradient-to-r from-red-400 to-rose-500'
                }`}>
                  <span className="text-white text-xl">
                    {favoritesType === 'added' ? '❤️' : favoritesType === 'removed' ? '💔' : '⚠️'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-lg mb-1 ${
                    favoritesType === 'added' 
                      ? 'text-green-800' 
                      : favoritesType === 'removed'
                      ? 'text-orange-800'
                      : 'text-red-800'
                  }`}>
                    {favoritesType === 'added' ? 'Added to Favorites!' : favoritesType === 'removed' ? 'Removed from Favorites!' : 'Error!'}
                  </h4>
                  <p className={`text-sm leading-relaxed ${
                    favoritesType === 'added' 
                      ? 'text-green-700' 
                      : favoritesType === 'removed'
                      ? 'text-orange-700'
                      : 'text-red-700'
                  }`}>
                    {favoritesMessage}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-3xl overflow-hidden">
                <div 
                  className={`h-full rounded-b-3xl transition-all duration-3000 ease-linear ${
                    favoritesType === 'added' 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                      : favoritesType === 'removed'
                      ? 'bg-gradient-to-r from-orange-400 to-yellow-500'
                      : 'bg-gradient-to-r from-red-400 to-rose-500'
                  }`}
                  style={{
                    width: '100%',
                    animation: 'shrink 3s linear forwards'
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 max-w-md w-full transform transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-rose-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                  ⚠️
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Delete Book
                </h3>
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete "<strong>{book.title}</strong>"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-4 py-3 rounded-2xl hover:from-slate-200 hover:to-slate-300 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      handleDelete();
                    }}
                    className="flex-1 bg-gradient-to-r from-red-400 to-rose-500 text-white px-4 py-3 rounded-2xl hover:from-red-500 hover:to-rose-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CSS Animation for progress bar */}
        <style jsx>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </div>
    </PageTransition>
  );
};

export default BookDetails;