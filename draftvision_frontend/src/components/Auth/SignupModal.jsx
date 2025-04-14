import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti'; // You may need to install this package

/**
 * SignupModal component with smooth transition after signup
 */
const SignupModal = ({ 
  isOpen, 
  onClose, 
  switchToLogin, 
  onRegistrationSuccess,
  onSuccessClose,
  showRegistrationSuccess = false
}) => {
  // State for form fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [localError, setLocalError] = useState(''); // Local general error state
  const [successMessage, setSuccessMessage] = useState('');
  
  // State for success animation
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  // Get auth functions and state from context
  const { signUp, signInWithGoogle, setError } = useAuth();
  const navigate = useNavigate();
  
  // Refs for form elements
  const emailRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const modalRef = useRef(null);

  // Clear errors when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setLocalError('');
      setEmailError('');
      setUsernameError('');
      setError(''); // Also clear global error
    }
  }, [isOpen, setError]);

  // Effect to prevent navigation during registration
  useEffect(() => {
    const blockNavigation = (event) => {
      if (isRegistering) {
        event.preventDefault();
        return false;
      }
    };
    
    window.addEventListener('beforeunload', blockNavigation);
    
    return () => {
      window.removeEventListener('beforeunload', blockNavigation);
    };
  }, [isRegistering]);

  // Effect to handle success animation timing and prevent automatic redirect
  useEffect(() => {
    let timer;
    if (showSuccessPopup) {
      // Trigger confetti when popup shows
      fireworkConfetti();
      
      // Set a timer to control the transition
      timer = setTimeout(() => {
        // After showing the success popup, simply close the modal
        // and skip any callbacks that might show additional modals
        onClose();
        
        // No need to call onRegistrationSuccess or reload the page
        // The auth state change will automatically update the UI
      }, 2500); // Show for 2.5 seconds
    }
    
    return () => clearTimeout(timer);
  }, [showSuccessPopup, onClose]);

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  // Enhanced confetti animation that looks like fireworks
  const fireworkConfetti = () => {
    // Base confetti burst
    const duration = 2500; // Match the display duration
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    
    // Create multiple bursts for a firework effect
    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }
    
    // Initial big burst
    confetti({
      particleCount: 150,
      spread: 120,
      origin: { x: 0.5, y: 0.5 }
    });
    
    // Create an interval to continuously fire confetti for the duration
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      
      // Calculate particle count based on how much time is left
      const particleCount = 50 * (timeLeft / duration);
      
      // Random colors and positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
      });
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#ffff00', '#ff00ff', '#00ffff', '#ffffff'],
      });
      
      // Create occasional bursts from the center
      if (Math.random() < 0.3) {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { x: randomInRange(0.4, 0.6), y: randomInRange(0.4, 0.6) }
        });
      }
    }, 250);
  };

  // Handler to prevent clicks inside modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
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

  // Password validation function
  const validatePassword = (password) => {
    // At least 8 characters, with at least one letter and one number
    return password.length >= 8 && 
           /[A-Za-z]/.test(password) && 
           /[0-9]/.test(password);
  };

  // Email validation function - check format only
  const validateEmail = (email) => {
    // Basic format validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError('');
    return true;
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
    setLocalError('');
    setUsernameError('');
    setEmailError('');
    setSuccessMessage('');
    
    // Validate inputs
    if (!email || !username || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    // Validate username
    if (!validateUsername(username)) {
      return;
    }
    
    // Validate email format
    if (!validateEmail(email)) {
      return;
    }
    
    // Check password strength
    if (!validatePassword(password)) {
      setLocalError('Password must be at least 8 characters long and contain at least one letter and one number');
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    // Use local loading state
    setIsRegistering(true);
    
    try {
      const result = await signUp(email, password, username);
      
      const { error, data } = result || {};
      
      if (error) {
        // Handle specific error cases
        if (error.message && error.message.toLowerCase().includes('email already registered')) {
          setEmailError('This email is already registered. Please login instead.');
        } else if (error.message && error.message.toLowerCase().includes('username is already taken')) {
          setUsernameError(error.message);
        } else {
          setLocalError(error.message || 'Failed to create account');
        }
        return;
      }
      
      // Clear form fields on success
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      
      // If we have a successful signup
      if (data && (data.user || data.session)) {
        // Show the success popup with welcome message
        setShowSuccessPopup(true);
        
        // The useEffect watching showSuccessPopup will handle the rest of the flow
      } else {
        // If we don't have user data but also don't have an error,
        // something unusual happened - notify the user
        setLocalError('Signup completed but login failed. Please try logging in manually.');
      }
    } catch (err) {
      setLocalError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };
  
  return (
    <>
      {/* Modal backdrop - allow closing when clicked unless showing success popup */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
        onClick={!showSuccessPopup ? onClose : undefined}
      >
        {/* Modal container */}
        <div 
          ref={modalRef}
          className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md" 
          onClick={handleModalClick}
          style={{ position: 'relative' }}
        >
          {showSuccessPopup ? (
            <div className="p-8 text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Draft Vision AI!</h2>
            </div>
          ) : (
            <>
              {/* Modal title */}
              <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
              
              {/* Error message displays - now using local error states */}
              {localError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{localError}</div>}
              {emailError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{emailError}</div>}
              {usernameError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{usernameError}</div>}

              {/* Success message */}
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
                  {successMessage}
                </div>
              )}
              
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  handleGoogleSignIn();
                }}
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
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${emailError ? 'border-red-500' : ''}`}
                    id="signup-email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
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
                      onClick={(event) => {
                        event.preventDefault();
                        setLocalError(''); // Clear local error when switching
                        setError(''); // Also clear global error
                        switchToLogin();
                      }}
                      type="button"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
              
              {/* Close button in the corner */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SignupModal;