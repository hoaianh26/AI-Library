import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { searchBooks } from '../services/bookService';

function Navbar({ isSidebarOpen }) {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchBoxRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '' || !isBoxVisible) {
      setSearchResults([]);
      return;
    }
    const debounceTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchBooks(searchTerm, token);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, token, isBoxVisible]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setIsBoxVisible(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchBoxRef, userMenuRef]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() !== '' && !isBoxVisible) {
        setIsBoxVisible(true);
    }
  };
  
  const handleResultClick = () => {
    setIsBoxVisible(false);
    setSearchTerm('');
  };

  const getLinkClass = ({ isActive }) => 
    `px-4 py-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'}`;

  return (
    <nav 
      className="fixed top-0 left-0 w-full z-40 transition-all duration-500 ease-in-out"
      style={{ paddingLeft: isSidebarOpen ? '256px' : '96px' }}
    >
      <div className={`transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-2xl border-b border-white/30 shadow-2xl' : 'bg-white/85 backdrop-blur-xl border-b border-white/20 shadow-lg'}`}>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60"></div>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 text-2xl font-bold group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <span className="text-xl group-hover:animate-pulse">📚</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full opacity-0 group-hover:opacity-100 animate-bounce transition-opacity duration-300"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300 delay-150"></div>
              </div>
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:via-purple-700 group-hover:to-pink-700 transition-all duration-300">
                Digital Library
              </span>
            </Link>

            <div className="flex-grow mx-8 max-w-xl relative" ref={searchBoxRef}>
                            <div className="relative w-full">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setIsBoxVisible(true)}
                  placeholder="Search for books by title or author..."
                  className="w-full py-3 pl-12 pr-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300 shadow-inner"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                {isBoxVisible && (
                  <div className="absolute mt-3 w-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden transform animate-in slide-in-from-top-2 duration-200">
                    {isSearching && <div className="p-4 text-center text-slate-500">Searching...</div>}
                    {!isSearching && searchResults.length === 0 && searchTerm.length > 0 && (
                      <div className="p-4 text-center text-slate-500">No results found.</div>
                    )}
                    {!isSearching && searchResults.length > 0 && (
                      <ul className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                        {searchResults.map((book) => (
                          <li key={book._id}>
                            <Link 
                              to={`/books/${book._id}`} 
                              onClick={handleResultClick}
                              className="flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group"
                            >
                              <img src={book.imageUrl || 'https://via.placeholder.com/40x60'} alt={book.title} className="w-10 h-14 object-cover rounded-md shadow-sm group-hover:scale-105 transition-transform duration-200" />
                              <div>
                                <p className="font-semibold text-slate-800 group-hover:text-indigo-700">{book.title}</p>
                                <p className="text-sm text-slate-500">{book.author}</p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {user.role !== 'admin' && (
                    <>
                    </>
                  )}
                  <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/40 hover:bg-white/90 hover:border-indigo-200 transition-all duration-300 shadow-lg hover:shadow-xl group">
                      <div className="relative">
                        <div className="w-9 h-9 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow duration-200">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors duration-200">{user.name}</p>
                        <p className="text-xs text-slate-500 capitalize flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-purple-400' : 'bg-blue-400'}`}></span>
                          {user.role}
                        </p>
                      </div>
                      <svg className={`w-4 h-4 text-slate-400 transform transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden transform animate-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-100">
                          <p className="font-semibold text-slate-800">{user.name}</p>
                          <p className="text-sm text-slate-600">{user.email}</p>
                        </div>
                        <div className="py-2">
                          {user.role === 'admin' && (
                            <Link to="/admin/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 transition-all duration-200 group">
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                              <span className="font-medium">Admin Dashboard</span>
                            </Link>
                          )}
                          <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 transition-all duration-200 group">
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <span className="font-medium">Profile</span>
                          </Link>
                          <Link to="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 transition-all duration-200 group">
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="font-medium">Settings</span>
                          </Link>
                        </div>
                        <div className="border-t border-slate-100 py-2">
                          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all duration-200 group">
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            <span className="font-medium">Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="group px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative">Login</span>
                  </Link>
                  <Link to="/register" className="px-6 py-2.5 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 text-slate-700 hover:bg-white/90 hover:border-indigo-300 hover:text-indigo-700 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
