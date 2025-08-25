import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './index.css';
import App from './App.jsx';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import BookDetails from './components/BookDetails.jsx';
import EditBook from './components/EditBook.jsx';
import Favorites from './components/Favorites.jsx'; // Import Favorites
import Layout from './components/Layout'; // Import the new Layout
import './styles/pageAnimations.css';

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Standalone routes without Navbar */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Routes wrapped by the Layout (with Navbar) */}
        <Route 
          path="/*" 
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<App />} />
          <Route path="books/:id" element={<BookDetails />} />
          <Route path="edit-book/:id" element={<EditBook />} />
          <Route path="favorites" element={<Favorites />} /> {/* Use Favorites component */}
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  </StrictMode>
);
