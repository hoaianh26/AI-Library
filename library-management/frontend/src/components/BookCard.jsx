
import { Link } from 'react-router-dom';

const BookCard = ({ book, index }) => {
  const API_URL = "http://localhost:5000";

  return (
    <Link to={`/books/${book._id}`} className="group relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/80" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="relative overflow-hidden">
        <img
          src={book.imageUrl ? book.imageUrl : 'https://via.placeholder.com/300x400/6366f1/white?text=No+Cover'}
          alt={book.title}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-6">
        <h3 className="font-bold text-xl text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
          {book.title}
        </h3>
        <p className="text-slate-600 font-medium">by {book.author}</p>
      </div>
    </Link>
  );
};

export default BookCard;
