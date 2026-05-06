import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getAIChatResponse } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bot, X, Send, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you explore the library today?", sender: 'ai', books: [] }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const userMessage = { text: input, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const aiResponse = await getAIChatResponse(input, messages, token);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: aiResponse.text, sender: 'ai', books: aiResponse.books || [] },
        ]);
      } catch (error) {
        console.error("Error sending message to AI:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "Sorry, I'm having trouble connecting. Please try again later.", sender: 'ai', books: [] },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Hide the widget on the main AI page
  if (location.pathname === '/ai') {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col origin-bottom-right"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">Library AI Assistant</h3>
              <button onClick={() => setIsOpen(false)} className="group p-1 rounded-full hover:bg-indigo-500 transition-colors" style={{backgroundColor: 'rgba(0, 0, 0, 1) !important'}}>
                <X size={20} className="text-black group-hover:text-purple-400 transition-colors" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'ai' && <Bot className="w-6 h-6 flex-shrink-0 bg-indigo-500 text-white p-1 rounded-full" />}
                  <div
                    className={`max-w-[85%] px-4 py-2 rounded-2xl shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-indigo-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <div>{msg.text}</div>
                    {msg.sender === 'ai' && msg.books && msg.books.length > 0 && (
                      <div className="mt-3 border-t border-gray-200 pt-3 grid grid-cols-1 gap-2">
                        {msg.books.map((book) => (
                          <Link to={`/books/${book._id}`} key={book._id} className="flex items-center bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                            <img src={book.imageUrl} alt={book.title} className="w-10 h-14 object-cover rounded-md mr-3" />
                            <div>
                              <div className="font-bold text-sm text-gray-900 line-clamp-1">{book.title}</div>
                              <div className="text-xs text-gray-600">by {book.author}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-end gap-2 justify-start">
                    <Bot className="w-6 h-6 flex-shrink-0 bg-indigo-500 text-white p-1 rounded-full" />
                    <div className="px-4 py-2 rounded-2xl shadow-sm bg-white text-gray-800 rounded-bl-none flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></span>
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></span>
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '400ms'}}></span>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex-shrink-0 p-3 bg-white border-t border-gray-200 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the AI..."
                className="flex-grow px-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={isLoading}
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center transform transition-all duration-300 ease-in-out hover:scale-110 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <Bot size={32} />
      </button>
    </div>
  );
};

export default ChatWidget;