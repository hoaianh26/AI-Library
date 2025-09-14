import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAIChatResponse } from '../services/api';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
        setMessages([
            {
                sender: 'ai',
                text: "Hello! I'm your friendly library assistant. Ask me about our books, authors, and more!",
            },
        ]);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await getAIChatResponse(input, token);
      const aiMessage = { 
        sender: 'ai', 
        text: data.reply, 
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage = { 
        sender: 'ai', 
        text: error.message || "I'm sorry, I seem to be having some trouble right now. Please try again later."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Chat Window */}
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'w-96 h-[600px] opacity-100' : 'w-0 h-0 opacity-0'}`}>
        <div className="bg-white/80 backdrop-blur-xl w-full h-full rounded-3xl shadow-2xl border border-white/50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center">AI Library Assistant</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-3 rounded-2xl shadow ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
                <div className="flex justify-start mb-4">
                    <div className='max-w-xs px-4 py-3 rounded-2xl shadow bg-slate-100 text-slate-800 flex items-center gap-2'>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-4 border-t border-slate-200">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about books, authors, etc..."
                className="w-full border-2 border-slate-200 p-3 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50" disabled={isLoading}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-2xl transform hover:scale-110 transition-transform duration-300">
        {isOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>
    </div>
  );
};

export default AIChat;
