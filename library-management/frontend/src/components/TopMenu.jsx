import { NavLink } from 'react-router-dom';
import { useState, useRef } from 'react';
import { CATEGORIES } from '../constants/categories';

const TopMenu = () => {
  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Favorites', path: '/favorites' },
    { name: 'History', path: '/history' },
    { name: 'AI', path: '/ai' },
  ];

  const [isCategoriesOpen, setCategoriesOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);

  const handleMouseMove = (e) => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const getLinkClass = ({ isActive }) =>
    `relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 overflow-hidden ${
      isActive
        ? 'bg-indigo-100 text-indigo-700 shadow-md scale-105'
        : 'text-slate-600 hover:bg-gray-200 hover:text-slate-900 hover:scale-105'
    }`;

  return (
    <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={menuRef}
          className="relative flex items-center justify-center space-x-2 h-12"
          onMouseMove={handleMouseMove}
        >
          {/* Spotlight effect - follows mouse */}
          <div
            className="absolute pointer-events-none transition-opacity duration-300"
            style={{
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`,
              width: '200px',
              height: '200px',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
              opacity: mousePosition.x > 0 ? 1 : 0,
            }}
          />

          {menuItems.map((item, index) => (
            <NavLink 
              to={item.path} 
              key={item.name} 
              className={getLinkClass} 
              end
            >
              <span className="relative z-10">{item.name}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 opacity-0 hover:opacity-100 transition-opacity duration-500"></span>
            </NavLink>
          ))}

          {/* Categories Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <button className="relative px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-200 hover:text-slate-900 rounded-md transition-all duration-300 flex items-center hover:scale-105 overflow-hidden">
              <span className="relative z-10">Categories</span>
              <svg 
                className="relative z-10 w-4 h-4 ml-1 transition-transform duration-300" 
                style={{ transform: isCategoriesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 opacity-0 hover:opacity-100 transition-opacity duration-500"></span>
            </button>
            
            {/* Dropdown with entrance animation */}
            <div 
              className={`absolute z-10 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200/80 max-h-96 overflow-y-auto transition-all duration-300 origin-top ${
                isCategoriesOpen 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="py-1">
                {CATEGORIES.map((category) => (
                  <NavLink
                    key={category}
                    to={`/category/${category.toLowerCase().replace(/ /g, '-')}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 transition-all duration-200 hover:translate-x-1"
                    onClick={() => setCategoriesOpen(false)}
                  >
                    {category}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopMenu;