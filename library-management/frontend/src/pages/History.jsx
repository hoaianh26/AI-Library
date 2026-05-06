import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { Clock, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/users/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch history');
        }
        const data = await res.json();
        // Filter out entries with no bookId
        setHistory(data.filter(entry => entry.bookId));
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
        setIsVisible(true);
      }
    };

    if (token) {
      fetchHistory();
    }
  }, [token]);

  // Pagination Logic
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const currentHistoryItems = history.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Generate page numbers for pagination controls
  const getPaginationGroup = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      end = Math.min(5, totalPages);
    }
    if (currentPage > totalPages - 3) {
      start = Math.max(1, totalPages - 4);
    }
    
    let pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PageTransition isVisible={isVisible}>
      <div className="pt-24 px-6 w-full pb-12">
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* HEADER */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-6 shadow-2xl shadow-purple-500/30">
              <Clock className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent mb-4 leading-tight">
              Viewing History
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              A timeline of your literary journey through the library.
            </p>
          </div>

          {currentHistoryItems.length > 0 ? (
            <>
              {/* HISTORY GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {currentHistoryItems.map((entry) => (
                  <Link to={`/books/${entry.bookId._id}`} key={entry._id} className="block group">
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-6 h-full
                                    hover:shadow-[0_20px_50px_rgba(128,90,213,0.3)] transition-all duration-500 hover:-translate-y-2 hover:border-purple-400/50">
                      
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <img
                            src={entry.bookId.imageUrl ? entry.bookId.imageUrl : 'https://via.placeholder.com/120x160/6366f1/white?text=No+Cover'}
                            alt={entry.bookId.title}
                            className="w-24 h-36 object-cover rounded-lg shadow-lg shadow-black/30 transform group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-black text-2xl text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
                            {entry.bookId.title}
                          </h3>
                          <p className="text-gray-400 font-semibold mb-4">by {entry.bookId.author}</p>
                          <div className="bg-white/10 px-4 py-2 rounded-lg inline-flex items-center gap-3">
                            <Clock className="w-5 h-5 text-purple-300" />
                            <span className="text-gray-200 font-medium">{new Date(entry.viewedAt).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="p-3 bg-purple-500/80 rounded-full">
                                <BookOpen className="w-6 h-6 text-white"/>
                            </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="mt-16 flex flex-col items-center justify-center gap-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-xl font-semibold text-white border border-white/20
                                 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span>Previous</span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {getPaginationGroup().map(pageNumber => (
                            <button
                                key={pageNumber}
                                onClick={() => handlePageClick(pageNumber)}
                                className={`w-12 h-12 rounded-xl font-semibold transition-all duration-300 border
                                            ${currentPage === pageNumber 
                                                ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' 
                                                : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20 hover:border-purple-400/50'}`}
                            >
                                {pageNumber}
                            </button>
                        ))}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-xl font-semibold text-white border border-white/20
                                 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-400 font-medium">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-r from-purple-500/20 to-indigo-600/20 rounded-full mb-8">
                <Clock className="w-14 h-14 text-purple-300" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">No Viewing History</h3>
              <p className="text-gray-400 text-lg">Start exploring books to see your history here.</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default History;