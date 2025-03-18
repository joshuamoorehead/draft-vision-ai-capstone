import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageTransition from '../Common/PageTransition';
import Auth from '../Auth/Auth';
import { signUp } from '../../services/api';

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
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle direct signup form submission
  const handleDirectSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validate email
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    // Validate password
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    // Check if password has at least one number and one letter
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    
    if (!hasNumber || !hasLetter) {
      setError('Password must contain at least one letter and one number');
      setLoading(false);
      return;
    }
    
    try {
      // Generate a default username from email
      const username = email.split('@')[0];
      
      // Call the signUp function directly
      const { error } = await signUp(email, password, username);
      
      if (error) throw error;
      
      // Show success message
      setSuccess(true);
      setEmail('');
      setPassword('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
      
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to mock draft page when authenticated user wants to start
  const handleStartMockDraft = () => {
    navigate('/mockdraft');
  };

  return (
    <PageTransition>
      {/* Enhanced background with animated gradient and subtle pattern */}
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 relative overflow-hidden">
        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-40 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-16 pb-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              <div className="relative mb-6">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
                  Welcome to <span className="relative">
                    <span className="relative z-10">Draft Vision AI</span>
                    <span className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-blue-400 to-purple-500 opacity-75 z-0"></span>
                  </span>
                </h1>
                <div className="h-1 w-16 bg-blue-400 rounded mt-4"></div>
              </div>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Your go-to platform for insightful and data-driven predictions in the world of sports. 
                Our mission is to revolutionize the way scouting and drafting decisions are made using 
                advanced AI models.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#features" 
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all transform hover:scale-105">
                  Explore Features
                </a>
                
                {user ? (
                  // Show for authenticated users
                  <button
                    onClick={handleStartMockDraft}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
                  >
                    Start a Mock Draft
                  </button>
                ) : (
                  // Show for unauthenticated users
                  <button
                    onClick={openSignupModal}
                    className="px-8 py-3 bg-white text-blue-700 font-medium rounded-lg shadow-lg hover:bg-gray-100 focus:ring-4 focus:ring-white focus:ring-opacity-50 transition-all transform hover:scale-105"
                  >
                    Sign Up Now
                  </button>
                )}
              </div>
            </div>
            
            {/* Conditional Rendering: Sign Up Box or Feature Highlight */}
            {!user ? (
              // Show Sign Up Box for unauthenticated users
              <div id="signup" className="lg:w-2/5 bg-white bg-opacity-95 backdrop-filter backdrop-blur-sm p-8 rounded-xl shadow-2xl transform transition-all duration-500 hover:shadow-blue-500/20">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Join Draft Vision AI</h2>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4">
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
                
                {/* Direct signup form fields */}
                <form onSubmit={handleDirectSignup}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Must be at least 8 characters with numbers and letters.
                    </p>
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
              // Show a welcome message for authenticated users
              <div className="lg:w-2/5 bg-white bg-opacity-95 backdrop-filter backdrop-blur-sm p-8 rounded-xl shadow-2xl transform transition-all duration-500 hover:shadow-blue-500/20">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Welcome Back!</h2>
                <p className="text-gray-600 mb-6">
                  Ready to create your next mock draft? Access all the premium features of Draft Vision AI.
                </p>
                <div className="space-y-4">
                  <button 
                    onClick={() => navigate('/mockdraft')}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:translate-y-[-2px]"
                  >
                    Create New Mock Draft
                  </button>
                  <button 
                    onClick={() => navigate('/saved-drafts')}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:translate-y-[-2px]"
                  >
                    View Saved Drafts
                  </button>
                  <button 
                    onClick={() => navigate('/playercompare')}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:translate-y-[-2px]"
                  >
                    Compare Players
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Features Section with glass morphism effect */}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
        
        {/* Our Vision Section with parallax effect */}
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
        
        {/* Add Auth modal component */}
        {showAuthModal && (
          <Auth 
            isLoginOpen={isLoginModal}
            isSignupOpen={!isLoginModal}
            closeModals={closeAuthModals}
          />
        )}
        
        {/* Add custom styling for animations */}
        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
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