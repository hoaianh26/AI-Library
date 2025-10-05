import { Outlet } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TopMenu from '../components/TopMenu';
import Footer from '../components/Footer'; // Import Footer

const Layout = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = () => {
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
      setShowNavbar(false);
    } else {
      setShowNavbar(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar - sẽ trượt lên và biến mất */}
      <div className={`relative z-50 transition-all duration-300 ${showNavbar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <Navbar />
      </div>
      
      {/* TopMenu - sticky sẽ bị "chặn" lại ở top */}
      <div className="sticky top-0 z-40">
        <TopMenu />
      </div>
      
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer /> {/* Render Footer */}
    </div>
  );
};

export default Layout;