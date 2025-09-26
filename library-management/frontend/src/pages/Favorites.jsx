import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../services/bookService';
import PageTransition from '../components/PageTransition';

const Favorites = () => {
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // States for confirmation modal
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);
  
  // States for notification popup
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState(''); // 'success' or 'error'

  const { user, token } = useAuth();
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const data = await getFavorites(token);
        setFavoriteBooks(data);
        setError(null);
        setIsVisible(true);
      } catch (err) {
        setError('Failed to fetch favorite books.');
        console.error(err);
        setIsVisible(true);
      } finally {
        setLoading(false);
      }
    };

    if (token && user && (user.role === 'student' || user.role === 'teacher')) {
      fetchFavorites();
    } else if (user && user.role === 'admin') {
      setError('Admins do not have a favorites list.');
      setLoading(false);
      setIsVisible(true);
    } else {
      navigate('/login');
    }
  }, [token, user, navigate]);

  // Auto hide notification after 3 seconds
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const showNotificationPopup = (message, type) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  const handleRemoveConfirmation = (book) => {
    setBookToRemove(book);
    setShowRemoveModal(true);
  };

  const handleRemoveFavorite = async () => {
    if (!bookToRemove) return;

    try {
      await removeFavorite(bookToRemove._id, token);
      setFavoriteBooks(favoriteBooks.filter(book => book._id !== bookToRemove._id));
      showNotificationPopup(`"${bookToRemove.title}" removed from favorites!`, 'success');
    } catch (err) {
      console.error("Error removing from favorites:", err);
      showNotificationPopup('Failed to remove book from favorites.', 'error');
    } finally {
      setShowRemoveModal(false);
      setBookToRemove(null);
    }
  };

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
                Loading your favorites...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Library
              </Link>
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
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Floating hearts */}
        <div className="absolute top-20 left-20 text-2xl opacity-60 animate-bounce">❤️</div>
        <div className="absolute top-40 right-32 text-xl opacity-60 animate-pulse">💖</div>
        <div className="absolute bottom-32 left-1/4 text-lg opacity-60 animate-bounce" style={{animationDelay: '1s'}}>💕</div>
        <div className="absolute top-1/2 right-20 text-xl opacity-60 animate-pulse" style={{animationDelay: '2s'}}>💝</div>

        <div className="pt-24 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full mb-6 shadow-2xl">
                <span className="text-3xl">❤️</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent mb-4 leading-tight">
                Your Favorite Books
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Discover and revisit the books that captured your heart
              </p>
            </div>

            {favoriteBooks.length === 0 ? (
              /* Empty State */
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-12 text-center max-w-2xl mx-auto">
                <div className="w-32 h-32 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-6xl opacity-60">📚</span>
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">No favorite books yet</h3>
                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                  Your favorite books collection is empty. Start exploring our library and add books that inspire you!
                </p>
                <Link 
                  to="/" 
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                >
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Explore Library</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            ) : (
              /* Books Grid */
              <>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📖</span>
                    <span className="text-xl font-semibold text-slate-700">
                      {favoriteBooks.length} book{favoriteBooks.length !== 1 ? 's' : ''} in your collection
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                  {favoriteBooks.map((book) => (
                    <div
                      key={book._id}
                      className="group relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:bg-white/90"
                    >
                      {/* Book Cover */}
                      <Link to={`/books/${book._id}`} className="block">
                        <div className="relative overflow-hidden">
                          <img
                            src={book.imageUrl ? `${API_URL}${book.imageUrl}` : 'https://via.placeholder.com/300x400/6366f1/white?text=No+Cover'}
                            alt={book.title}
                            className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          {/* Favorite badge */}
                          <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-lg">❤️</span>
                          </div>

                          {/* Hover overlay with read button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full font-semibold text-slate-800 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                              View Details
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Book Info */}
                      <div className="p-6">
                        <Link to={`/books/${book._id}`}>
                          <h3 className="font-bold text-xl text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300 leading-tight">
                            {book.title}
                          </h3>
                          <p className="text-slate-600 font-medium mb-4 flex items-center gap-2">
                            <span className="text-indigo-500">✍️</span>
                            {book.author}
                          </p>
                        </Link>

                        {/* Additional info */}
                        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                          <span className="flex items-center gap-1">
                            <span>📅</span>
                            {book.publishedYear}
                          </span>
                          {book.genre && (
                            <span className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium border border-indigo-100">
                              {book.genre}
                            </span>
                          )}
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveConfirmation(book)}
                          className="group/btn w-full bg-gradient-to-r from-red-400 to-rose-500 text-white px-4 py-3 rounded-2xl hover:from-red-500 hover:to-rose-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                          <span className="text-lg group-hover/btn:scale-110 transition-transform duration-300">💔</span>
                          <span>Remove from Favorites</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Remove Confirmation Modal */}
        {showRemoveModal && bookToRemove && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 max-w-md w-full transform transition-all duration-300">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6">
                  💔
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Remove from Favorites?
                </h3>
                <p className="text-slate-600 mb-2">
                  Are you sure you want to remove
                </p>
                <p className="font-semibold text-lg text-slate-800 mb-6">
                  "{bookToRemove.title}"
                </p>
                <p className="text-slate-500 text-sm mb-8">
                  You can always add it back later from the book details page.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRemoveModal(false);
                      setBookToRemove(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-4 py-3 rounded-2xl hover:from-slate-200 hover:to-slate-300 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                  >
                    Keep in Favorites
                  </button>
                  <button
                    onClick={handleRemoveFavorite}
                    className="flex-1 bg-gradient-to-r from-red-400 to-rose-500 text-white px-4 py-3 rounded-2xl hover:from-red-500 hover:to-rose-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Yes, Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Popup */}
        {showNotification && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
            <div className={`relative bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border max-w-sm transform transition-all duration-300 ${
              notificationType === 'success' 
                ? 'border-green-200 bg-gradient-to-br from-green-50/90 to-emerald-50/90' 
                : 'border-red-200 bg-gradient-to-br from-red-50/90 to-rose-50/90'
            }`}>
              {/* Close button */}
              <button
                onClick={() => setShowNotification(false)}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/80 transition-all duration-200 text-slate-500 hover:text-slate-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notificationType === 'success' 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                    : 'bg-gradient-to-r from-red-400 to-rose-500'
                }`}>
                  <span className="text-white text-xl">
                    {notificationType === 'success' ? '💔' : '⚠️'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-lg mb-1 ${
                    notificationType === 'success' 
                      ? 'text-green-800' 
                      : 'text-red-800'
                  }`}>
                    {notificationType === 'success' ? 'Removed Successfully!' : 'Error!'}
                  </h4>
                  <p className={`text-sm leading-relaxed ${
                    notificationType === 'success' 
                      ? 'text-green-700' 
                      : 'text-red-700'
                  }`}>
                    {notificationMessage}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-3xl overflow-hidden">
                <div 
                  className={`h-full rounded-b-3xl transition-all duration-3000 ease-linear ${
                    notificationType === 'success' 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
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

export default Favorites;