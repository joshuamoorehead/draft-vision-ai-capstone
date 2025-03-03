import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

// LoginModal component - Renders a modal dialog for user login
// Props:
// - isOpen: boolean to control visibility of modal
// - onClose: function to call when modal is closed
// - switchToSignup: function to switch to signup modal
const LoginModal = ({ isOpen, onClose, switchToSignup }) => {
  // State for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Get auth functions and state from context
  const { signIn, resetPassword, error, setError } = useAuth();
  
  // Refs for form elements (for potential focus management)
  const emailRef = useRef();
  const passwordRef = useRef();

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  // Handler to prevent clicks inside modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // Handler for login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Set loading state and attempt login
    setIsLoggingIn(true);
    try {
      const { error } = await signIn(email, password);
      if (!error) {
        // If successful, clear form and close modal
        setEmail('');
        setPassword('');
        onClose();
      }
    } finally {
      // Always reset loading state
      setIsLoggingIn(false);
    }
  };

  // Handler for password reset form submission
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      // Send password reset email
      const { error } = await resetPassword(email);
      if (!error) {
        setError('');
        alert('Password reset email sent. Check your inbox.');
        setShowForgotPassword(false);
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
    }
  };

  return (
    // Modal backdrop - clicking here closes the modal
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      {/* Modal container - clicking here doesn't close the modal */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md" onClick={handleModalClick}>
        {/* Modal title */}
        <h2 className="text-2xl font-bold mb-6 text-center">
          {showForgotPassword ? 'Reset Password' : 'Login to DraftVision AI'}
        </h2>
        
        {/* Error message display */}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}
        
        {/* Conditional rendering based on whether user is resetting password or logging in */}
        {showForgotPassword ? (
          // Password reset form
          <form onSubmit={handleForgotPassword}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="reset-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                ref={emailRef}
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Send Reset Link
              </button>
              <button
                className="text-blue-500 hover:text-blue-800 text-sm"
                onClick={() => setShowForgotPassword(false)}
                type="button"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          // Login form
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                ref={emailRef}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="******************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                ref={passwordRef}
                required
              />
            </div>
            
            {/* Login and Forgot Password buttons */}
            <div className="flex items-center justify-between mb-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Logging in...' : 'Sign In'}
              </button>
              <button
                className="text-blue-500 hover:text-blue-800 text-sm"
                onClick={() => setShowForgotPassword(true)}
                type="button"
              >
                Forgot Password?
              </button>
            </div>
            
            {/* Link to switch to signup */}
            <div className="text-center mt-4">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <button
                  className="text-blue-500 hover:text-blue-800"
                  onClick={switchToSignup}
                  type="button"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;