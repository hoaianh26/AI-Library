import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { token } = useAuth();
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/books/recommendations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        const data = await res.json();
        // Giới hạn chỉ lấy 10 quyển sách
        setRecommendations(data.slice(0, 10));
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [token]);

  // Auto scroll effect - chuyển sau mỗi 3 giây
  useEffect(() => {
    if (recommendations.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        // Nếu đến cuối thì quay về đầu
        if (prev >= recommendations.length - 5) {
          return 0;
        }
        return prev + 1;
      });
    }, 3000); // 3 giây đổi 1 lần

    return () => clearInterval(interval);
  }, [recommendations.length]);

  // Scroll to current index
  useEffect(() => {
    if (scrollRef.current) {
      const cardWidth = 272; // 256px width + 16px gap
      scrollRef.current.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(recommendations.length - 5, prev + 1));
  };

  if (loading) {
    return (
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Recommended For You</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-64 h-80 bg-gray-800/50 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-12 p-6 bg-gray-800 rounded-lg shadow-xl">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg shadow-lg animate-pulse">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Recommended For You</h2>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
            10 books • Auto-rotating
          </span>
          {/* Pagination dots */}
          <div className="flex gap-1">
            {[...Array(Math.ceil(recommendations.length / 5))].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i * 5)}
                className={`w-2 h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / 5) === i 
                    ? 'bg-purple-500 w-6' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Scrollable Container - Hiển thị 5 quyển */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-hidden gap-4 pb-6 snap-x snap-mandatory scroll-smooth"
        >
          {recommendations.map((book, index) => (
            <Link 
              to={`/books/${book._id}`} 
              key={book._id}
              className="flex-shrink-0 w-64 snap-start group/item"
              style={{
                animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50">
                {/* Book Cover */}
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={book.imageUrl || 'https://via.placeholder.com/300x400/8b5cf6/white?text=Recommended'}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  
                  {/* Recommended Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs font-bold text-white">#{index + 1}</span>
                    </div>
                  </div>
                  
                  {/* Book Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg mb-1 line-clamp-2 drop-shadow-lg">
                      {book.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-2 drop-shadow-lg">
                      by {book.author}
                    </p>
                    

                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover/item:border-purple-500 rounded-2xl transition-all duration-300 pointer-events-none"></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`absolute left-0 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-r-xl backdrop-blur-sm transition-all z-10 ${
            currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={handleNext}
          disabled={currentIndex >= recommendations.length - 5}
          className={`absolute right-0 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-l-xl backdrop-blur-sm transition-all z-10 ${
            currentIndex >= recommendations.length - 5 ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Recommendations;