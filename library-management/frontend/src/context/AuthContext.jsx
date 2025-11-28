// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios'; // Import axios

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_BASE_URL + '/users'; // Define API_URL

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user & token from localStorage when app starts
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (err) {
      console.error('Error parsing stored auth data', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  // New function to refresh user data from the backend
  const refreshUser = async () => {
    if (!token) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${API_URL}/profile`, config);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      // If refresh fails, potentially clear user data or handle re-authentication
      logout();
      return null;
    }
  };


  const login = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);

    try {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', tokenValue);
    } catch (err) {
      console.error('Error saving auth data to localStorage', err);
    }
  };
  // Update partial user information (e.g., after membership upgrade)
  const updateUser = (partialUser) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...partialUser };
      try {
        localStorage.setItem('user', JSON.stringify(next));
      } catch (err) {
        console.error('Error updating user in localStorage', err);
      }
      return next;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (err) {
      console.error('Error clearing auth data from localStorage', err);
    }
  };

  //Membership helpers 
  const membershipTier = user?.membershipTier || 'bronze';
  const membershipExpiresAt = user?.membershipExpiresAt || null;
  const isMembershipActive = user?.isMembershipActive ?? false;

  let hasActiveMembership = false;
  if (membershipExpiresAt && isMembershipActive) {
    const now = new Date();
    const expires = new Date(membershipExpiresAt);
    hasActiveMembership = expires > now;
  }

  const value = {user, token, loading, login, logout, updateUser, refreshUser, membershipTier, membershipExpiresAt, isMembershipActive, hasActiveMembership,};

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};