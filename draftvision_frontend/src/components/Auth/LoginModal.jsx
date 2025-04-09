import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Custom notification component
const Notification = ({ message, type, onClose }) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 animate-fadeIn">
      <div className={`flex items-center p-4 rounded-lg shadow-lg ${getBackgroundColor()} text-white max-w-md`}>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="inline-flex text-white focus:outline-none"
            onClick={onClose}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// LoginModal component - Renders a modal dialog for user login
const LoginModal = ({ isOpen, onClose, switchToSignup, onLoginSuccess }) => {
  // State for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  // Local error state for this modal
  const [localError, setLocalError] = useState('');
  
  // Get auth functions and state from context
  const { signIn, resetPassword, signInWithGoogle, setError } = useAuth();
  
  // Refs for form elements (for potential focus management)
  const emailRef = useRef();
  const passwordRef = useRef();
  
  // Use navigate for redirection
  const navigate = useNavigate();

  // Clear local error when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setLocalError('');
      setError(''); // Also clear global error
    }
  }, [isOpen, setError]);

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  // Handler to prevent clicks inside modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };
  
  // Helper to show notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handler for login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    // Set loading state and attempt login
    setIsLoggingIn(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setLocalError(error.message || 'Login failed');
        return;
      }
      
      // If successful, clear form and close modal
      setEmail('');
      setPassword('');
      setLocalError('');
      if (onLoginSuccess) onLoginSuccess();
      onClose();
    } catch (err) {
      setLocalError(err.message || 'An unexpected error occurred');
    } finally {
      // Always reset loading state
      setIsLoggingIn(false);
    }
  };

  // Handler for Google sign in
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setLocalError('Failed to sign in with Google');
      }
      // The redirect will happen automatically
    } catch (err) {
      setLocalError('Failed to sign in with Google');
    }
  };

  // Handler for password reset form submission
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      setLocalError('Please enter your email address');
      return;
    }

    try {
      // Send password reset email
      const { error } = await resetPassword(email);
      if (error) {
        setLocalError(error.message || 'Failed to send reset email');
        return;
      }
      
      setLocalError('');
      showNotification('Password reset email sent. Check your inbox.', 'success');
      setShowForgotPassword(false);
    } catch (error) {
      console.error('Error sending reset email:', error);
      showNotification(error.message || 'Failed to send reset email', 'error');
    }
  };
  
  // Handler to navigate to the dedicated forgot password page
  const goToForgotPassword = () => {
    onClose(); // Close the modal
    navigate('/forgot-password'); // Navigate to the forgot password page
  };

  return (
    // Modal backdrop - clicking here closes the modal
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      {/* Custom notification */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      {/* Modal container - clicking here doesn't close the modal */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md" onClick={handleModalClick}>
        {/* Modal title */}
        <h2 className="text-2xl font-bold mb-6 text-center">
          {showForgotPassword ? 'Reset Password' : 'Login to DraftVision AI'}
        </h2>
        
        {/* Error message display - now using localError */}
        {localError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{localError}</div>}
        
        {/* Google Sign In Button - Show only on login screen, not password reset */}
        {!showForgotPassword && (
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
        )}
        
        {/* Divider between Google and email login - Only show on login screen */}
        {!showForgotPassword && (
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
        )}
        
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
                onClick={goToForgotPassword}
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
                  onClick={() => {
                    setLocalError(''); // Clear local error when switching
                    setError(''); // Also clear global error
                    switchToSignup();
                  }}
                  type="button"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        )}
        
        {/* Close button in top-right corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Add animation styles */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoginModal;