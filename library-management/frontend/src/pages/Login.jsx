import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formElements, setFormElements] = useState({
    brand: false,
    form: false,
    links: false
  });
  
  const { login } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Add exit animation before navigation
      setIsVisible(false);
      setTimeout(() => {
        login(data, data.token);
        navigate('/');
      }, 300);
      
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
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
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                    📚
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Digital Library
                    </h1>
                    <p className="text-slate-500 text-sm">Welcome back!</p>
                  </div>
                </div>
              </div>
            </PageTransition>

            {/* Login form with animation */}
            <PageTransition isVisible={formElements.form} direction="scale">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 hover:bg-white/80 transition-all duration-500 hover:shadow-3xl">
                  <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Sign In to Your Account
                  </h2>

                  {/* Error message with animation */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-2xl animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-rose-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-bounce">
                          ⚠️
                        </div>
                        <p className="text-red-700 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Email field with enhanced focus effects */}
                  <div className="mb-6 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 group-hover:text-indigo-500">
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        placeholder="Enter your email..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 hover:border-indigo-300 hover:bg-white/90"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password field with enhanced effects */}
                  <div className="mb-8 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-14 py-4 border-2 border-slate-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 hover:border-indigo-300 hover:bg-white/90"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors hover:scale-110 active:scale-95"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Login button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 hover:scale-105"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </PageTransition>

            {/* Enhanced Register link */}
            <PageTransition isVisible={formElements.links} direction="slideUp">
              <div className="text-center mt-8">
                <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/40 hover:bg-white/70 transition-all duration-300 hover:shadow-2xl">
                  <p className="text-slate-600 mb-4">Don't have an account yet?</p>
                  <button
                    onClick={() => handleLinkClick('/register')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-2xl font-semibold hover:from-slate-200 hover:to-slate-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95 hover:scale-105 group"
                  >
                    <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create New Account
                  </button>
                </div>
              </div>

              {/* Back to home link */}
              <div className="text-center mt-6">
                <button
                  onClick={() => handleLinkClick('/')}
                  className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors duration-300 font-medium group"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Library</span>
                </button>
              </div>
            </PageTransition>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Login;