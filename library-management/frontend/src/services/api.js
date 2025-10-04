const BASE_API_URL = "http://localhost:5000/api";

// Lấy danh sách sách
export const getBooks = async () => {
  const res = await fetch(`${BASE_API_URL}/books`);
  return res.json();
};

// Lấy một sách theo ID
export const getBook = async (id, token) => {
  const res = await fetch(`${BASE_API_URL}/books/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  return res.json();
};

// Thêm sách
export const addBook = async (book) => {
  const res = await fetch(`${BASE_API_URL}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  return res.json();
};

// Cập nhật sách
export const updateBook = async (id, book) => {
  const res = await fetch(`${BASE_API_URL}/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  return res.json();
};

// Xóa sách
export const deleteBook = async (id) => {
  await fetch(`${BASE_API_URL}/books/${id}`, { method: "DELETE" });
};

// Search for books
export const searchBooks = async (query, token) => {
  const res = await fetch(`${BASE_API_URL}/books/search?q=${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  return res.json();
};

// Favorites API functions
export const addFavoriteApi = async (bookId, token) => {
  const res = await fetch(`${BASE_API_URL}/users/favorites/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ bookId }),
  });
  return res.json();
};

export const removeFavoriteApi = async (bookId, token) => {
  const res = await fetch(`${BASE_API_URL}/users/favorites/remove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ bookId }),
  });
  return res.json();
};

export const getFavoritesApi = async (token) => {
  const res = await fetch(`${BASE_API_URL}/users/favorites`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return res.json();
};

// AI Chat API
export const getAIChatResponse = async (prompt, history, token) => { // Changed 'message' to 'prompt' for consistency
  const res = await fetch(`${BASE_API_URL}/gemini`, { // Changed '/ai/chat' to '/gemini'
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, history }), // Changed 'message' to 'prompt'
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to get response from AI assistant');
  }
  return res.json();
};