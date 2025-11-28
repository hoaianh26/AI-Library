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

const updateProfile = (name, email, token) => {
  return axios.put(
    `${API_URL}/profile`,
    { name, email },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const changePassword = (currentPassword, newPassword, token) => {
  return axios.put(
    `${API_URL}/profile/change-password`,
    { currentPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const uploadAvatar = (file, token) => {
  const formData = new FormData();
  formData.append('avatar', file);

  return axios.post(
    `${API_URL}/profile/avatar`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const authService = {
  register,
  login,
  verifyEmail,
  updateProfile,
  changePassword,
  uploadAvatar,
};

export { register, login, verifyEmail, updateProfile, changePassword, uploadAvatar };
