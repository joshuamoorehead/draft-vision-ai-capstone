import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageTransition from '../Common/PageTransition';

const AboutPage = () => {
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);
    
    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
      setSuccess(true);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#5A6BB0]">
        {/* Note: Removed the hardcoded header/navigation */}
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-16 pb-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              <h1 className="text-5xl font-bold text-white mb-6">Welcome to Draft Vision AI</h1>
              <p className="text-xl text-white mb-8 leading-relaxed">
                Your go-to platform for insightful and data-driven predictions in the world of sports. 
                Our mission is to revolutionize the way scouting and drafting decisions are made using 
                advanced AI models.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#features" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Explore Features
                </a>
                <a href="#signup" className="bg-white hover:bg-gray-100 text-blue-700 px-6 py-3 rounded-lg font-medium transition-colors">
                  Sign Up Now
                </a>
              </div>
            </div>
            
            {/* Sign Up Box */}
            <div id="signup" className="lg:w-2/5 bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Join Draft Vision AI</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-4">
                  Account created! Please check your email for verification.
                </div>
              )}
              
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mb-4"
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
              
              <form onSubmit={handleSignUp}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    minLength={8}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters with numbers and special characters.
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {loading ? 'Creating Account...' : 'Create Free Account'}
                </button>
              </form>
              
              <p className="mt-4 text-sm text-center text-gray-600">
                Already have an account? <a href="/login" className="text-blue-600 hover:text-blue-500">Sign in</a>
              </p>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div id="features" className="bg-gray-900 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Our Features</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="bg-blue-600 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI-Powered Predictions</h3>
                <p className="text-gray-300">
                  Leverage advanced machine learning models to forecast draft positions and player performance potential.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="bg-blue-600 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Custom Mock Drafts</h3>
                <p className="text-gray-300">
                  Create, save, and share your own mock drafts with precision team needs analysis and player comparisons.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="bg-blue-600 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Community Insights</h3>
                <p className="text-gray-300">
                  Connect with other football enthusiasts, compare draft strategies, and discuss prospects in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Our Vision Section */}
        <div className="py-16 bg-[#4A5BA0]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Our Vision</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-white text-center leading-relaxed">
                We aim to empower teams, analysts, and enthusiasts with cutting-edge tools
                to analyze player performance and potential, ensuring better decisions and a
                deeper understanding of the game. Our commitment to accuracy, transparency, and
                innovation drives everything we do at Draft Vision AI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AboutPage;