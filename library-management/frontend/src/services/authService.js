import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/users';

const register = (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};

const login = (userData) => {
  return axios.post(`${API_URL}/login`, userData);
};

const verifyEmail = (token) => {
  return axios.get(`${API_URL}/verify-email?token=${token}`);
};

const authService = {
  register,
  login,
  verifyEmail,
};

export default authService;
