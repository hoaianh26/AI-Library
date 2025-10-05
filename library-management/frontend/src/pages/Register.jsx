import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft, BookOpen, Sparkles, AlertCircle, Phone, Calendar, Fingerprint, Image, List, User as UserIcon } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    gender: '',
    address: '',
    phoneNumber: '',
    dateOfBirth: '',
    libraryId: '',
    avatar: '',
    favoriteCategories: [], // Changed to array
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formElements, setFormElements] = useState({
    brand: false,
    form: false,
    links: false
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  // Staggered animation effect
  useEffect(() => {
    setIsVisible(true);
    
    const timeouts = [
      setTimeout(() => setFormElements(prev => ({ ...prev, brand: true })), 200),
      setTimeout(() => setFormElements(prev => ({ ...prev, form: true })), 400),
      setTimeout(() => setFormElements(prev => ({ ...prev, links: true })), 600)
    ];

    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, []);

  const { name, email, password, confirmPassword, role, gender, address, phoneNumber, dateOfBirth, libraryId, avatar, favoriteCategories } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      favoriteCategories: checked
        ? [...prevFormData.favoriteCategories, value]
        : prevFormData.favoriteCategories.filter(category => category !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', {
        name, email, password, role, gender, address, phoneNumber, dateOfBirth, libraryId, avatar, 
        favoriteCategories,
      });
      // Add exit animation before navigation
      setIsVisible(false);
      setTimeout(() => {
        login(res.data, res.data.token);
        navigate('/');
      }, 300);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (path) => {
    setIsVisible(false);
    setTimeout(() => navigate(path), 300);
  };

  return (
    <PageTransition isVisible={isVisible} direction="fade">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Enhanced floating shapes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-5 h-5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-60 animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 right-20 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-60 animate-pulse" style={{animationDelay: '3s'}}></div>

        <div className="flex items-center justify-center min-h-screen p-6 relative z-10">
          <div className="w-full max-w-md">
            {/* Logo/Brand section with animation */}
            <PageTransition isVisible={formElements.brand} direction="slideDown">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
                      <BookOpen className="w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-left">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Digital Library
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Create your account!</p>
                  </div>
                </div>
              </div>
            </PageTransition>

            {/* Register form with animation */}
            <PageTransition isVisible={formElements.form} direction="scale">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 hover:bg-white/80 transition-all duration-500 hover:shadow-3xl">
                  <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Sign Up for an Account
                  </h2>

                  {/* Error message with animation */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-2xl animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-rose-500 rounded-full flex items-center justify-center text-white animate-bounce">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <p className="text-red-700 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Name field */}
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                      Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                        <UserIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter your name..."
                        id="name"
                        name="name"
                        value={name}
                        onChange={onChange}
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 hover:border-indigo-300 hover:bg-white/90"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                        <Mail className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type="email"
                        placeholder="Enter your email..."
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 hover:border-indigo-300 hover:bg-white/90"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password..."
                        id="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        className="w-full pl-12 pr-14 py-4 border-2 border-slate-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 hover:border-indigo-300 hover:bg-white/90"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors hover:scale-110 active:scale-95"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password field */}
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password..."
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={onChange}
                        className="w-full pl-12 pr-14 py-4 border-2 border-slate-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 hover:border-indigo-300 hover:bg-white/90"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors hover:scale-110 active:scale-95"
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Role field */}
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                      Role
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                        <UserIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <select
                        id="role"
                        name="role"
                        value={role}
                        onChange={onChange}
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 hover:border-indigo-300 hover:bg-white/90"
                        disabled={loading}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </div>
                  </div>

                  {/* Gender field */}
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                      Gender
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                        <UserIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <select
                        id="gender"
                        name="gender"
                        value={gender}
                        onChange={onChange}
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 hover:border-indigo-300 hover:bg-white/90"
                        disabled={loading}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Address field */}
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                      Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                        <UserIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter your address..."
                        id="address"
                        name="address"
                        value={address}
                        onChange={onChange}
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 hover:border-indigo-300 hover:bg-white/90"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Phone Number field */}
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                        <Phone className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter your phone number..."
                        id="phoneNumber"
                        name="phoneNumber"
                        value={phoneNumber}
                        onChange={onChange}
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 hover:border-indigo-300 hover:bg-white/90"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Date of Birth field */}
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                        <Calendar className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={dateOfBirth}
                        onChange={onChange}
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 hover:border-indigo-300 hover:bg-white/90"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Library ID field */}
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                      Library ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                        <Fingerprint className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter your library ID..."
                        id="libraryId"
                        name="libraryId"
                        value={libraryId}
                        onChange={onChange}
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 hover:border-indigo-300 hover:bg-white/90"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Avatar URL field */}
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                      Avatar URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                        <Image className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter URL for your avatar..."
                        id="avatar"
                        name="avatar"
                        value={avatar}
                        onChange={onChange}
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 hover:border-indigo-300 hover:bg-white/90"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Favorite Categories checkboxes */}
                  <div className="mb-6 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                      Favorite Categories
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-4 border-2 border-slate-200 rounded-2xl bg-white/80 max-h-60 overflow-y-auto">
                      {CATEGORIES.map((category) => (
                        <div key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            id={category}
                            name="favoriteCategories"
                            value={category}
                            checked={favoriteCategories.includes(category)}
                            onChange={handleCategoryChange}
                            className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out rounded focus:ring-indigo-500"
                            disabled={loading}
                          />
                          <label htmlFor={category} className="ml-2 text-slate-700 text-sm">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Register button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 hover:scale-105 group"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        <span>Register</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </PageTransition>

            {/* Enhanced Login link */}
            <PageTransition isVisible={formElements.links} direction="slideUp">
              <div className="text-center mt-8">
                <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/40 hover:bg-white/70 transition-all duration-300 hover:shadow-2xl">
                  <p className="text-slate-600 mb-4">Already have an account?</p>
                  <button
                    onClick={() => handleLinkClick('/login')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-2xl font-semibold hover:from-slate-200 hover:to-slate-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95 hover:scale-105 group"
                  >
                    <UserPlus className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    Login to Your Account
                  </button>
                </div>
              </div>

              {/* Back to home link */}
              <div className="text-center mt-6">
                <button
                  onClick={() => handleLinkClick('/')}
                  className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors duration-300 font-medium group"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <span>Back to Library</span>
                </button>
              </div>
            </PageTransition>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Register;