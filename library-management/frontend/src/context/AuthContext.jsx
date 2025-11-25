// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user & token từ localStorage khi app khởi động
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
  // Cập nhật một phần thông tin user (vd: sau khi upgrade membership)
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

  const value = {user, token, loading, login, logout, updateUser, membershipTier, membershipExpiresAt, isMembershipActive, hasActiveMembership,};

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
