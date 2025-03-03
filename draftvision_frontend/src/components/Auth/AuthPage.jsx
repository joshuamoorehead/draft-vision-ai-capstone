import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageTransition from '../Common/PageTransition';
import NavBar from '../Navigation/NavBar';

// Password validation requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireNumber: true,
  requireSpecialChar: true
};

// Password validation function
const validatePassword = (password) => {
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return "Password must be at least 8 characters long";
  }
  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    return "Password must contain at least one number";
  }
  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*]/.test(password)) {
    return "Password must contain at least one special character";
  }
  return null;
};

const AuthPage = () => {
  // Determine if we're in login or signup mode based on URL
  const location = useLocation();
  const initialIsLogin = location.pathname !== '/signup';
  
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError(null);
    setLoading(true);

    // Validate password for signup
    if (!isLogin) {
      const pwError = validatePassword(password);
      if (pwError) {
        setPasswordError(pwError);
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // Handle login
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/');
      } else {
        // Handle signup
        const { error } = await signUp(email, password);
        if (error) throw error;
        setError('Please check your email for verification link!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#5A6BB0]">
      <NavBar />
      <div className="pt-32 min-h-screen flex items-center justify-center px-4">
        <PageTransition>
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
            {/* Page title */}
            <div>
              <h2 className="text-3xl font-bold text-center mb-8">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Google sign in button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mb-4"
            >
              <img 
                className="h-5 w-5 mr-2" 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google logo"
              />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                />
                {!isLogin && (
                  <p className="mt-1 text-sm text-gray-500">
                    Password must be at least 8 characters long and contain numbers and special characters
                  </p>
                )}
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            {/* Toggle between login and signup */}
            <div className="text-center mt-4">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
};

export default AuthPage;