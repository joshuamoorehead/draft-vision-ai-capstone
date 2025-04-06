import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageTransition from '../Common/PageTransition';
import Auth from '../Auth/Auth';
import { signUp, supabase } from '../../services/api';
import confetti from 'canvas-confetti';

const AboutPage = () => {
  const { 
    user, 
    signInWithGoogle, 
    showAuthModal, 
    isLoginModal, 
    openLoginModal, 
    openSignupModal, 
    closeAuthModals 
  } = useAuth();
  
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userProfileLoading, setUserProfileLoading] = useState(false);

  // NEW: State for user stats (comparisons and predictions) from user_stats table
  const [userStats, setUserStats] = useState(null);
  const [userStatsLoading, setUserStatsLoading] = useState(false);

  // NEW: State for drafts count from user_drafts table
  const [draftsCount, setDraftsCount] = useState(0);
  const [draftsCountLoading, setDraftsCountLoading] = useState(false);

  // Reference to the confetti canvas element
  const confettiCanvasRef = useRef(null);

  // Fetch user profile data when user is authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && !userProfile) {
        try {
          setUserProfileLoading(true);
          // Try to use session metadata first
          const username = user.user_metadata?.username;
          if (username) {
            setUserProfile({ username });
            setUserProfileLoading(false);
            return;
          }
          // Otherwise fetch from the database
          const { data, error } = await supabase
            .from('user_profiles')
            .select('username')
            .eq('user_id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user profile:', error);
          } else if (data) {
            setUserProfile(data);
          }
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
        } finally {
          setUserProfileLoading(false);
        }
      }
    };
    fetchUserProfile();
  }, [user, userProfile]);

  // Fetch user stats (comparisons and predictions) from the user_stats table
  useEffect(() => {
    const fetchUserStats = async () => {
      if (user) {
        try {
          setUserStatsLoading(true);
          const { data, error } = await supabase
            .from('user_stats')
            .select('comparisons, predictions')
            .eq('user_id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user stats:', error);
          } else if (data) {
            setUserStats(data);
          }
        } catch (err) {
          console.error('Failed to fetch user stats:', err);
        } finally {
          setUserStatsLoading(false);
        }
      }
    };
    fetchUserStats();
  }, [user]);

  // NEW: Fetch count of drafts created from the user_drafts table
  useEffect(() => {
    const fetchDraftsCount = async () => {
      if (user) {
        try {
          setDraftsCountLoading(true);
          const { count, error } = await supabase
            .from('user_drafts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);
          if (error) {
            console.error('Error fetching drafts count:', error);
          } else {
            setDraftsCount(count);
          }
        } catch (err) {
          console.error('Error in fetchDraftsCount:', err);
        } finally {
          setDraftsCountLoading(false);
        }
      }
    };
    fetchDraftsCount();
  }, [user]);

  // Trigger confetti celebration
  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#10B981', '#8B5CF6']
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // Trigger confetti on successful sign in
      triggerConfetti();
    } catch (err) {
      setError(err.message);
    }
  };

  // Validate password
  const validatePassword = (password) => {
    return password.length >= 8 && 
           /[A-Za-z]/.test(password) && 
           /[0-9]/.test(password);
  };

  // Validate email format
  const validateEmail = (email) => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Validate username
  const validateUsername = (username) => {
    if (!username || username.trim() === '') {
      setUsernameError('Username is required');
      return false;
    }
    if (username.length < 3 || username.length > 20) {
      setUsernameError('Username must be between 3 and 20 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    setUsernameError('');
    return true;
  };

  // Handle direct signup
  const handleDirectSignup = async (e) => {
    e.preventDefault();
    setError('');
    setUsernameError('');
    setEmailError('');
    setSuccess(false);
    
    if (!email || !username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (!validateUsername(username)) return;
    if (!validateEmail(email)) return;
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and contain at least one letter and one number');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const { error, data } = await signUp(email, password, username);
      if (error) {
        if (error.message && error.message.toLowerCase().includes('email already registered')) {
          setEmailError('This email is already registered. Please login instead.');
        } else if (error.message && error.message.toLowerCase().includes('username is already taken')) {
          setUsernameError(error.message);
        } else {
          setError(error.message || 'Failed to create account');
        }
        setLoading(false);
        return;
      }
      
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setSuccess(true);
      triggerConfetti();
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to mock draft page
  const handleStartMockDraft = () => {
    navigate('/mockdraft');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-40 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-16 pb-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              <div className="relative mb-6">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
                  {user ? (
                    <>
                      Welcome to <span className="relative">
                        <span className="relative z-10">Draft Vision AI</span>
                        <span className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-blue-400 to-purple-500 opacity-75 z-0"></span>
                      </span>
                      {userProfileLoading ? (
                        <span className="text-green-400 inline-block min-w-[80px]">
                          <span className="animate-pulse">...</span>
                        </span>
                      ) : (
                        <span className="text-green-400">, {userProfile?.username || 'player'}</span>
                      )}
                    </>
                  ) : (
                    <>Welcome to <span className="relative">
                      <span className="relative z-10">Draft Vision AI</span>
                      <span className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-blue-400 to-purple-500 opacity-75 z-0"></span>
                    </span></>
                  )}
                </h1>
                <div className="h-1 w-16 bg-blue-400 rounded mt-4"></div>
              </div>
              
              {user ? (
                <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                  Ready to craft your next mock draft? Your personalized draft board and predictions are waiting.
                </p>
              ) : (
                <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                  Your go-to platform for data-driven predictions in the world of sports.
                </p>
              )}
              
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <>
                    <button
                      onClick={handleStartMockDraft}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
                    >
                      Start a Mock Draft
                    </button>
                    <button
                      onClick={() => navigate('/saved-drafts')}
                      className="px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-medium rounded-lg shadow-lg hover:from-purple-600 hover:to-violet-700 focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
                    >
                      View Saved Drafts
                    </button>
                  </>
                ) : (
                  <>
                    <a href="#features" 
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all transform hover:scale-105">
                      Explore Features
                    </a>
                    <button
                      onClick={openSignupModal}
                      className="px-8 py-3 bg-white text-blue-700 font-medium rounded-lg shadow-lg hover:bg-gray-100 focus:ring-4 focus:ring-white focus:ring-opacity-50 transition-all transform hover:scale-105"
                    >
                      Sign Up Now
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {!user ? (
              <div id="signup" className="lg:w-2/5 bg-white bg-opacity-95 backdrop-filter backdrop-blur-sm p-8 rounded-xl shadow-2xl transform transition-all duration-500 hover:shadow-blue-500/20">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Join Draft Vision AI</h2>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}
                {emailError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {emailError}
                  </div>
                )}
                {usernameError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {usernameError}
                  </div>
                )}
                {success && (
                  <div className="bg-green-100 border border-green-200 text-green-600 px-4 py-3 rounded mb-4">
                    Account created! Please check your email for verification.
                  </div>
                )}
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 mb-4"
                >
                  <img 
                    className="h-5 w-5 mr-2" 
                    src="https://www.svgrepo.com/show/475656/google-color.svg" 
                    alt="Google logo"
                  />
                  Continue with Google
                </button>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                  </div>
                </div>
                <form onSubmit={handleDirectSignup}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${emailError ? 'border-red-500' : ''}`}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${usernameError ? 'border-red-500' : ''}`}
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (usernameError) validateUsername(e.target.value);
                      }}
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      3-20 characters, letters, numbers, and underscores only
                    </p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Must be at least 8 characters with letters and numbers
                    </p>
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Free Account'
                    )}
                  </button>
                </form>
                <p className="mt-4 text-sm text-center text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={openLoginModal}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            ) : (
              <div className="lg:w-2/5">
                <div className="bg-white bg-opacity-95 backdrop-filter backdrop-blur-sm p-8 rounded-xl shadow-2xl transform transition-all duration-500 hover:shadow-blue-500/20">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      {userProfile?.username ? userProfile.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Draft Central</h2>
                      <p className="text-gray-500">Your personalized command center</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-blue-800">Activity Overview</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Last 30 days</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2">
                        <div className="text-2xl font-bold text-blue-600">
                          {draftsCountLoading ? <span className="animate-pulse">...</span> : draftsCount}
                        </div>
                        <div className="text-xs text-gray-500">Drafts Created</div>
                      </div>
                      <div className="p-2">
                        <div className="text-2xl font-bold text-purple-600">
                          {userStatsLoading ? <span className="animate-pulse">...</span> : userStats?.comparisons || 0}
                        </div>
                        <div className="text-xs text-gray-500">Comparisons</div>
                      </div>
                      <div className="p-2">
                        <div className="text-2xl font-bold text-green-600">
                          {userStatsLoading ? <span className="animate-pulse">...</span> : userStats?.predictions || 0}
                        </div>
                        <div className="text-xs text-gray-500">Predictions</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/mockdraft')}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:translate-y-[-2px] flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create New Mock Draft
                    </button>
                    <button 
                      onClick={() => navigate('/saved-drafts')}
                      className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:translate-y-[-2px] flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                        <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                      </svg>
                      View Saved Drafts
                    </button>
                    <button 
                      onClick={() => navigate('/playercompare')}
                      className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:translate-y-[-2px] flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Compare Players
                    </button>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-700">Quick Actions</h3>
                      <a href="/account-settings" className="text-blue-600 text-sm hover:underline">Settings</a>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <button
                        onClick={() => navigate('/playerlist')}
                        className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto mb-1 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs">Player List</span>
                      </button>
                      <button
                        onClick={() => navigate('/largelist')}
                        className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto mb-1 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span className="text-xs">Big Board</span>
                      </button>
                      <button
                        onClick={() => navigate('/playerinput')}
                        className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto mb-1 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs">Prediction</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Features and Vision Sections */}
        <div id="features" className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Our Features</h2>
              <div className="h-1 w-24 bg-blue-400 mx-auto rounded"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-lg border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 flex items-center justify-center rounded-full mb-6 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">AI-Powered Predictions</h3>
                <p className="text-gray-300 leading-relaxed">
                  Leverage advanced machine learning models to forecast draft positions and player performance potential with unparalleled accuracy.
                </p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-lg border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 flex items-center justify-center rounded-full mb-6 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Custom Mock Drafts</h3>
                <p className="text-gray-300 leading-relaxed">
                  Create, save, and share your own mock drafts with precision team needs analysis and detailed player comparisons.
                </p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-lg border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105">
                <div className="bg-gradient-to-br from-purple-500 to-violet-600 w-16 h-16 flex items-center justify-center rounded-full mb-6 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Community Insights</h3>
                <p className="text-gray-300 leading-relaxed">
                  Connect with other football enthusiasts, compare draft strategies, and discuss prospects in real-time in our vibrant community.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="py-20 relative z-10 overflow-hidden">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-10 rounded-2xl shadow-2xl border border-white border-opacity-20">
              <h2 className="text-4xl font-bold text-white text-center mb-8">Our Vision</h2>
              <div className="h-1 w-24 bg-purple-400 mx-auto rounded mb-8"></div>
              <p className="text-xl text-gray-200 text-center leading-relaxed">
                We aim to empower teams, analysts, and enthusiasts with cutting-edge tools
                to analyze player performance and potential, ensuring better decisions and a
                deeper understanding of the game. Our commitment to accuracy, transparency, and
                innovation drives everything we do at Draft Vision AI.
              </p>
            </div>
          </div>
        </div>

        {showAuthModal && (
          <Auth 
            isLoginOpen={isLoginModal}
            isSignupOpen={!isLoginModal}
            closeModals={closeAuthModals}
          />
        )}

        <style jsx>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
          .bg-grid-pattern {
            background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 40px 40px;
          }
        `}</style>
      </div>
    </PageTransition>
  );
};

export default AboutPage;
