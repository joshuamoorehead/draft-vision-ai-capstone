import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageTransition from '../Common/PageTransition';

/**
 * AuthPage now serves as a redirector component
 * Instead of rendering its own UI, it will redirect to the previous page
 * and display the appropriate auth modal
 */
const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openLoginModal, openSignupModal } = useAuth();

  // Determine if we're in login or signup mode based on URL
  const isSignup = location.pathname === '/signup';
  
  useEffect(() => {
    // Store the current behavior in localStorage for possible use
    localStorage.setItem('auth_mode', isSignup ? 'signup' : 'login');
    
    // Get the previous page from state, history, or default to home
    const previousPage = 
      location.state?.from || 
      document.referrer || 
      '/about';
      
    // Make sure we're not stuck in a redirect loop
    const targetPath = previousPage.includes('/login') || previousPage.includes('/signup') 
      ? '/about' 
      : previousPage;
    
    // Log what's happening for debugging
    console.log(`Redirecting to ${targetPath} and showing ${isSignup ? 'signup' : 'login'} modal`);
    
    // Navigate to the previous page
    navigate(targetPath, { replace: true });
    
    // Open the appropriate modal after a short delay
    setTimeout(() => {
      if (isSignup) {
        openSignupModal();
      } else {
        openLoginModal();
      }
    }, 100);
  }, [navigate, isSignup, location.state, openLoginModal, openSignupModal]);
  
  // Render a loading state while redirecting
  return (
    <PageTransition>
      <div className="min-h-screen bg-[#5A6BB0] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Redirecting you...</p>
        </div>
      </div>
    </PageTransition>
  );
};

export default AuthPage;