import { useState } from "react";
import BookManagement from './BookManagement';
import UserManagement from './UserManagement';

function AdminDashboard() {
  const [activeView, setActiveView] = useState('books'); // 'books' or 'users'

  const getButtonClass = (viewName) => {
    const baseClass = "px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5";
    if (activeView === viewName) {
      return `${baseClass} bg-gradient-to-r from-indigo-500 to-purple-600 text-white`;
    } else {
      return `${baseClass} bg-white/70 backdrop-blur-xl text-slate-700 hover:bg-white/90`;
    }
  };

  return (
    <div className="pt-24 px-6 w-full">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-center items-center gap-4 mb-12">
          <button onClick={() => setActiveView('books')} className={getButtonClass('books')}>
            Book Management
          </button>
          <button onClick={() => setActiveView('users')} className={getButtonClass('users')}>
            User Management
          </button>
        </div>

        <div>
          {activeView === 'books' && <BookManagement />}
          {activeView === 'users' && <UserManagement />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;