import * as api from './api';

export const getBooks = async () => {
  try {
    // Gọi đúng hàm getBooks từ api.js
    const data = await api.getBooks();
    return data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const getBook = async (id, token) => {
  try {
    const data = await api.getBook(id, token);
    return data;
  } catch (error) {
    console.error(`Error fetching book with id ${id}:`, error);
    throw error;
  }
};

export const addBook = async (bookData) => {
  try {
    // Gọi đúng hàm addBook từ api.js
    const data = await api.addBook(bookData);
    return data;
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
};

export const updateBook = async (id, bookData) => {
  try {
    // Gọi đúng hàm updateBook từ api.js
    const data = await api.updateBook(id, bookData);
    return data;
  } catch (error) {
    console.error(`Error updating book with id ${id}:`, error);
    throw error;
  }
};

export const deleteBook = async (id) => {
  try {
    // Gọi đúng hàm deleteBook từ api.js
    await api.deleteBook(id);
  } catch (error) {
    console.error(`Error deleting book with id ${id}:`, error);
    throw error;
  }
};

export const searchBooks = async (query, token) => {
  try {
    const data = await api.searchBooks(query, token);
    return data;
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

// Add book to favorites
export const addFavorite = async (bookId, token) => {
  try {
    const data = await api.addFavoriteApi(bookId, token);
    return data;
  } catch (error) {
    console.error('Error adding book to favorites:', error);
    throw error;
  }
};

// Remove book from favorites
export const removeFavorite = async (bookId, token) => {
  try {
    const data = await api.removeFavoriteApi(bookId, token);
    return data;
  } catch (error) {
    console.error('Error removing book from favorites:', error);
    throw error;
  }
};

// Get all favorite books for the user
export const getFavorites = async (token) => {
  try {
    const data = await api.getFavoritesApi(token);
    return data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};
