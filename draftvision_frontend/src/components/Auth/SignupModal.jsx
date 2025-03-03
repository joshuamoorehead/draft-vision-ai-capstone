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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Get auth functions and state from context
  const { signUp, error, setError } = useAuth();
  
  // Refs for form elements (for potential focus management)
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  // Handler to prevent clicks inside modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // Password validation function
  // Checks if password meets minimum security requirements
  const validatePassword = (password) => {
    // At least 8 characters, with at least one letter and one number
    return password.length >= 8 && 
           /[A-Za-z]/.test(password) && 
           /[0-9]/.test(password);
  };

  // Handler for signup form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Validate inputs
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
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
      const { error } = await signUp(email, password);
      if (!error) {
        // If successful, clear form and close modal
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        onClose();
        // Show success message
        alert('Registration successful! Please check your email to verify your account.');
      }
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
              {isRegistering ? 'Creating Account...' : 'Sign Up'}
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
      </div>
    </div>
  );
};

export default SignupModal;


