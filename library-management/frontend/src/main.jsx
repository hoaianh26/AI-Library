import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './index.css';
import App from './App.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import BookDetails from './pages/BookDetails.jsx';
import EditBook from './pages/EditBook.jsx';
import Favorites from './pages/Favorites.jsx'; // Import Favorites
import History from './pages/History.jsx'; // Import History
import CategoryPage from './pages/CategoryPage.jsx'; // Import CategoryPage
import AIPage from './pages/AIPage.jsx'; // Import AIPage
import Layout from './layouts/Layout'; // Import the new Layout
import './styles/pageAnimations.css';

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Standalone routes without Navbar */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />

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
          <Route path="history" element={<History />} />
          <Route path="ai" element={<AIPage />} /> {/* New AI Page Route */}
          <Route path="category/:categoryName" element={<CategoryPage />} /> {/* New Category Page Route */}
          <Route 
            path="admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
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
