import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import PageTransition from './PageTransition';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const { token } = useAuth();
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/users/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch history');
        }
        const data = await res.json();
        setHistory(data);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PageTransition isVisible={isVisible}>
      <div className="pt-24 px-6 w-full">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
              🕒 Viewing History
            </h2>
            <p className="text-slate-600 text-lg">
              Books you have recently viewed.
            </p>
          </div>

          {history.length > 0 ? (
            <div className="space-y-6">
              {history.filter(entry => entry.book).map((entry) => (
                <Link to={`/books/${entry.book._id}`} key={entry._id} className="block">
                  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/80 flex items-center gap-6">
                    <img
                      src={entry.book.imageUrl ? `${API_URL}${entry.book.imageUrl}` : 'https://via.placeholder.com/100x150/6366f1/white?text=No+Cover'}
                      alt={entry.book.title}
                      className="w-20 h-28 object-cover rounded-lg shadow-md"
                    />
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors duration-300">
                        {entry.book.title}
                      </h3>
                      <p className="text-slate-600 font-medium mb-2">by {entry.book.author}</p>
                      <p className="text-sm text-slate-500">
                        Viewed on: {new Date(entry.viewedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-indigo-500">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🕒</div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">No Viewing History</h3>
              <p className="text-slate-500">Start exploring books to see your history here.</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default History;
