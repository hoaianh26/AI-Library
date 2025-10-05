import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, Info } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-12 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white text-2xl font-bold">
            <BookOpen className="w-7 h-7 text-indigo-400" />
            <span>BookVerse Library</span>
          </div>
          <p className="text-gray-400 text-sm">
            Free Online Reading Platform for All Book Lovers.<br/>Explore a vast collection of novels, textbooks, and research materials updated every day. Enjoy reading anytime, anywhere — fully compatible with all devices. Dive into knowledge, imagination, and inspiration with just one click.
          </p>
          <div className="flex space-x-4 mt-4">
            {/* Social Media Icons - Placeholder */}
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-twitter"></i></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-instagram"></i></a>
          </div>
        </div>

        {/* Support Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white mb-4">Support</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            All information and images on this website are collected from the Internet. We do not own or take responsibility for any content displayed here. If any material affects an individual or organization, please contact us — we will review and remove it immediately upon request.
          </p>
        </div>

        {/* Contact Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white mb-4">Contact</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-indigo-400" />
              <a href="mailto:support@digitallibrary.com" className="text-gray-400 hover:text-white transition-colors">support@digitallibrary.com</a>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-indigo-400" />
              <a href="tel:+1234567890" className="text-gray-400 hover:text-white transition-colors">+1 (234) 567-890</a>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Info className="w-4 h-4 text-indigo-400" />
              <span className="text-gray-400">123 Library St, Booktown, BK 12345</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center text-gray-500 text-sm mt-10 border-t border-gray-800 pt-6">
        © {new Date().getFullYear()} Digital Library. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
