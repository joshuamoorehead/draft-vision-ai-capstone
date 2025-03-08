import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

// SignupModal component - Renders a modal dialog for user registration
// Props:
// - isOpen: boolean to control visibility of modal
// - onClose: function to call when modal is closed
// - switchToLogin: function to switch to login modal
const SignupModal = ({ isOpen, onClose, switchToLogin }) => {
  // State for form fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [usernameError, setUsernameError] = useState('');
  
  // Get auth functions and state from context
  const { signUp, signInWithGoogle, error, setError } = useAuth();
  
  // Refs for form elements (for potential focus management)
  const emailRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  // Handler to prevent clicks inside modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // Handler for Google sign in
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // The redirect will happen automatically
    } catch (err) {
      setError('Failed to sign in with Google');
    }
  };

  // Password validation function
  // Checks if password meets minimum security requirements
  const validatePassword = (password) => {
    // At least 8 characters, with at least one letter and one number
    return password.length >= 8 && 
           /[A-Za-z]/.test(password) && 
           /[0-9]/.test(password);
  };

  // Username validation function
  const validateUsername = (username) => {
    // Check if username is empty
    if (!username || username.trim() === '') {
      setUsernameError('Username is required');
      return false;
    }

    // Check length (3-20 characters)
    if (username.length < 3 || username.length > 20) {
      setUsernameError('Username must be between 3 and 20 characters');
      return false;
    }

    // Check characters (letters, numbers, underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    setUsernameError('');
    return true;
  };

  // Handler for signup form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setUsernameError('');
    setSuccessMessage('');
    
    // Validate inputs
    if (!email || !username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    // Validate username
    if (!validateUsername(username)) {
      return;
    }
    
    // Check password strength
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and contain at least one letter and one number');
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Set loading state and attempt registration
    setIsRegistering(true);
    try {
      const { error } = await signUp(email, password, username);
      if (error) throw error;
      
      // If successful, show success message and clear form
      setSuccessMessage('Registration successful! Please check your email to verify your account.');
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      
      // Don't close the modal yet so user can see the success message
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      // Always reset loading state
      setIsRegistering(false);
    }
  };

  return (
    // Modal backdrop - clicking here closes the modal
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      {/* Modal container - clicking here doesn't close the modal */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md" onClick={handleModalClick}>
        {/* Modal title */}
        <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
        
        {/* Error message display */}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}
        
        {/* Success message display */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
            {successMessage}
            <div className="mt-2 text-center">
              <button
                onClick={switchToLogin}
                className="text-blue-500 hover:text-blue-800 font-medium"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
        
        {/* Only show the form if there's no success message */}
        {!successMessage && (
          <>
            {/* Google Sign In Button */}
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
            
            {/* Divider between Google and email signup */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
            
            {/* Signup form */}
            <form onSubmit={handleSignup}>
              {/* Email field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-email">
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="signup-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  ref={emailRef}
                  required
                />
              </div>

              {/* Username field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-username">
                  Username
                </label>
                <input
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${usernameError ? 'border-red-500' : ''}`}
                  id="signup-username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (usernameError) validateUsername(e.target.value);
                  }}
                  ref={usernameRef}
                  required
                />
                {usernameError && (
                  <p className="text-red-500 text-xs mt-1">{usernameError}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>
              
              {/* Password field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-password">
                  Password
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="signup-password"
                  type="password"
                  placeholder="******************"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  ref={passwordRef}
                  required
                />
                {/* Password requirements hint */}
                <p className="text-gray-500 text-xs mt-1">
                  Password must be at least 8 characters long and contain at least one letter and one number
                </p>
              </div>
              
              {/* Confirm password field */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="confirm-password"
                  type="password"
                  placeholder="******************"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  ref={confirmPasswordRef}
                  required
                />
              </div>
              
              {/* Submit button */}
              <div className="flex items-center justify-center mb-4">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                  type="submit"
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </div>
                  ) : 'Sign Up'}
                </button>
              </div>
              
              {/* Link to switch to login */}
              <div className="text-center mt-4">
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <button
                    className="text-blue-500 hover:text-blue-800"
                    onClick={switchToLogin}
                    type="button"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SignupModal;