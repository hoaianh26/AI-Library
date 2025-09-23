import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const getLinkClass = ({ isActive }) =>
    `flex items-center p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
      isActive 
        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-700 shadow-lg border border-indigo-200/50 backdrop-blur-sm' 
        : 'hover:bg-gradient-to-r hover:from-indigo-50/80 hover:to-purple-50/80 text-slate-600 hover:text-indigo-600 hover:shadow-md'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}
      
      <aside className={`fixed top-0 left-0 h-full z-50 transition-all duration-500 ease-out ${
        isOpen ? 'w-72' : 'w-16'
      } shadow-2xl`}>
        {/* Background with enhanced gradient */}
        <div className="absolute inset-0">
          <div className="h-full bg-gradient-to-br from-slate-50/95 via-indigo-50/95 to-purple-50/95 backdrop-blur-xl border-r border-white/40"></div>
          
          {/* Animated gradient orbs */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-indigo-300/15 to-purple-300/15 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-1/2 -right-10 w-24 h-24 bg-gradient-to-tl from-purple-300/15 to-pink-300/15 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute -bottom-10 left-1/3 w-28 h-28 bg-gradient-to-tr from-blue-300/15 to-cyan-300/15 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Main content */}
        <div className="relative h-full p-4 flex flex-col">
          {/* Header section */}
          <div className={`flex items-center mb-8 ${isOpen ? 'justify-between' : 'justify-center'}`}>
            {isOpen ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">📚</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent">
                    My Library
                  </h1>
                  <p className="text-xs text-slate-500">Personal Collection</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">📚</span>
              </div>
            )}
            
            <button 
              onClick={toggleSidebar} 
              className="p-2 rounded-lg hover:bg-white/30 transition-all duration-300 hover:shadow-md group backdrop-blur-sm"
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <svg 
                className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isOpen ? "M11 19l-7-7 7-7" : "M13 5l7 7-7 7"} 
                />
              </svg>
            </button>
          </div>

          {/* Navigation menu */}
          <nav className="space-y-2 flex-1">
            <NavLink to="/" className={getLinkClass}>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                </svg>
              </div>
              {isOpen && (
                <div className="ml-3 flex-1">
                  <span className="font-semibold">Dashboard</span>
                  <p className="text-xs opacity-70">Overview & stats</p>
                </div>
              )}
            </NavLink>

            <NavLink to="/favorites" className={getLinkClass}>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
              {isOpen && (
                <div className="ml-3 flex-1">
                  <span className="font-semibold">Favorites</span>
                  <p className="text-xs opacity-70">Loved books</p>
                </div>
              )}
            </NavLink>

            <NavLink to="/history" className={getLinkClass}>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              {isOpen && (
                <div className="ml-3 flex-1">
                  <span className="font-semibold">Reading History</span>
                  <p className="text-xs opacity-70">Track progress</p>
                </div>
              )}
            </NavLink>

            <NavLink to="/add-book" className={getLinkClass}>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              {isOpen && (
                <div className="ml-3 flex-1">
                  <span className="font-semibold">Add Book</span>
                  <p className="text-xs opacity-70">New addition</p>
                </div>
              )}
            </NavLink>

            {/* Divider */}
            {isOpen && <div className="border-t border-white/20 my-4"></div>}
            
            {/* Additional menu items */}
            <NavLink to="/categories" className={getLinkClass}>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              {isOpen && (
                <div className="ml-3 flex-1">
                  <span className="font-semibold">Categories</span>
                  <p className="text-xs opacity-70">Browse genres</p>
                </div>
              )}
            </NavLink>

            <NavLink to="/settings" className={getLinkClass}>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              {isOpen && (
                <div className="ml-3 flex-1">
                  <span className="font-semibold">Settings</span>
                  <p className="text-xs opacity-70">Preferences</p>
                </div>
              )}
            </NavLink>
          </nav>

          {/* User profile section */}
          <div className="mt-auto pt-4 border-t border-white/30">
            <NavLink to="/profile" className={getLinkClass}>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400/20 to-purple-400/20 backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              {isOpen && (
                <div className="ml-3 flex-1">
                  <span className="font-semibold">Profile</span>
                  <p className="text-xs opacity-70">Your account</p>
                </div>
              )}
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;