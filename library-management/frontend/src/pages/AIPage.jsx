import React, { useState } from 'react';
import { getAIChatResponse } from '../services/api'; // Import getAIChatResponse from api.js
import { useAuth } from '../context/AuthContext'; // Import useAuth

const AIPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator
  const { token } = useAuth(); // Get token from AuthContext

  const handleSendMessage = async (e) => { // Made async
    e.preventDefault();
    if (input.trim()) {
      const userMessage = { text: input, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput('');
      setIsLoading(true); // Set loading to true

      try {
        const aiResponse = await getAIChatResponse(input, messages, token); // Call getAIChatResponse with token
        // The response can have { text, books }
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: aiResponse.text, sender: 'ai', books: aiResponse.books || [] }, // Store books array
        ]);
      } catch (error) {
        console.error("Error sending message to AI:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "Sorry, I'm having trouble connecting to the AI. Please try again later.", sender: 'ai', books: [] },
        ]);
      } finally {
        setIsLoading(false); // Set loading to false
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50"> {/* Adjust height based on your layout, 4rem for navbar */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Start a conversation with the AI!
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                  msg.sender === 'user'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {/* Render the main text */}
                <div>{msg.text}</div>

                {/* Render books if they exist */}
                {msg.sender === 'ai' && msg.books && msg.books.length > 0 && (
                  <div className="mt-3 border-t border-gray-300 pt-3">
                    <div className="grid grid-cols-1 gap-2">
                      {msg.books.map((book) => (
                        <div key={book._id} className="flex items-center bg-white p-2 rounded-lg">
                          <img src={book.imageUrl} alt={book.title} className="w-12 h-16 object-cover rounded-md mr-3" />
                          <div>
                            <div className="font-bold text-sm text-gray-900">{book.title}</div>
                            <div className="text-xs text-gray-600">{book.author}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading} // Disable button when loading
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default AIPage;