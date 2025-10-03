import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { CATEGORIES } from '../constants/categories';

const TopMenu = () => {
  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Favorites', path: '/favorites' },
    { name: 'History', path: '/history' },
    { name: 'AI', path: '/ai' },
  ];

  const [isCategoriesOpen, setCategoriesOpen] = useState(false);

  const getLinkClass = ({ isActive }) =>
    `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-slate-600 hover:bg-gray-200 hover:text-slate-900'
    }`;

  return (
    <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-2 h-12">
          {menuItems.map((item) => (
            <NavLink to={item.path} key={item.name} className={getLinkClass} end>
              {item.name}
            </NavLink>
          ))}

          {/* Categories Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-200 hover:text-slate-900 rounded-md transition-colors duration-200 flex items-center">
              Categories
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isCategoriesOpen && (
              <div className="absolute z-10 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200/80 max-h-96 overflow-y-auto">
                <div className="py-1">
                  {CATEGORIES.map((category) => (
                    <NavLink
                      key={category}
                      to={`/category/${category.toLowerCase().replace(/ /g, '-')}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      {category}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopMenu;
