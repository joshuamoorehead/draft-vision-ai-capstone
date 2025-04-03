import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, signUp, signIn, signInWithGoogle, resetPassword } from '../services/api';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children, signupStateHandler }) => {
  // State to track the current authenticated user
  const [user, setUser] = useState(null);
  // State to track loading status while checking if a user is already logged in
  const [loading, setLoading] = useState(true);
  // State to track any authentication errors
  const [error, setError] = useState('');
  // State to control auth modals display
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginModal, setIsLoginModal] = useState(true);
  // State to track if we're in a signup process
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Check for existing session and set up auth listener on component mount
  useEffect(() => {
    console.log("AuthProvider initializing");
  
    const checkSession = async () => {
      try {
        const storedSession = JSON.parse(localStorage.getItem("supabase.auth.token"));
        if (storedSession) {
          setUser(storedSession.user);
        }
  
        const { data, error } = await supabase.auth.getSession();
        console.log("Session check result:", data?.session?.user || "No session");
  
        if (error) throw error;
        
        if (data?.session) {
          setUser(data.session.user);
          localStorage.setItem("supabase.auth.token", JSON.stringify(data.session));
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    checkSession();
  
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (session) {
        setUser(session.user);
        localStorage.setItem("supabase.auth.token", JSON.stringify(session));
      } else {
        setUser(null);
        localStorage.removeItem("supabase.auth.token");
      }
    });
  
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);
  
  // Set up a periodic session refresh
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      if (user) {
        try {
          console.log("Attempting session refresh...");
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            console.warn("Session refresh error:", error);
            if (error.message.includes('expired')) {
              await supabase.auth.signOut();
              window.location.reload();
            }
          } else if (data?.session) {
            setUser(data.session.user);
            localStorage.setItem("supabase.auth.token", JSON.stringify(data.session));
          }
        } catch (err) {
          console.error("Error during session refresh:", err);
        }
      }
    }, 60000); // Every 1 minute instead of 4 minutes
  
    return () => clearInterval(refreshInterval);
  }, [user]);
  
  // Create a wrapper for the signUp function with error handling
  const handleSignUp = async (email, password, username) => {
    try {
      // Track signup state locally
      setIsSigningUp(true);
      
      // Also update parent component if handler exists
      if (signupStateHandler) signupStateHandler(true);
      
      // Clear any previous errors
      setError('');
      console.log("Signing up:", email);
      
      // Call signUp function from api.js
      const { data, error } = await signUp(email, password, username);
      
      // If there was an error, throw it to be caught
      if (error) throw error;
      
      console.log("Signup successful");
      return { data, error: null };
    } catch (err) {
      // Set error state and return error for component handling
      console.error("Signup error:", err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      // Reset signup tracking
      setIsSigningUp(false);
      if (signupStateHandler) signupStateHandler(false);
    }
  };

  // Create a wrapper for the signIn function with error handling
  const handleSignIn = async (email, password) => {
    try {
      // Clear any previous errors
      setError('');
      setLoading(true);
      console.log("Signing in:", email);
      
      // Call signIn function from api.js
      const { data, error } = await signIn(email, password);
      
      // If there was an error, throw it to be caught
      if (error) throw error;
      
      console.log("Signin successful");
      // Close modal on successful login
      setShowAuthModal(false);
      return { data, error: null };
    } catch (err) {
      // Set error state and return error for component handling
      console.error("Signin error:", err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Create a wrapper for the signInWithGoogle function with error handling
  const handleSignInWithGoogle = async () => {
    try {
      // Clear any previous errors
      setError('');
      setLoading(true);
      console.log("Signing in with Google");
      
      // Call signInWithGoogle function from api.js
      const { data, error } = await signInWithGoogle();
      
      // If there was an error, throw it to be caught
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      // Set error state and return error for component handling
      console.error("Google signin error:", err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setError('');
      setLoading(true);
      
      console.log("Signing out user");
      
      // Properly sign out from Supabase first
      await supabase.auth.signOut();
  
      // Clear storage
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // Redirect to login page
      window.location.replace('/about');
    } catch (err) {
      console.error("Sign out error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a wrapper for the resetPassword function with error handling
  const handleResetPassword = async (email) => {
    try {
      // Clear any previous errors
      setError('');
      setLoading(true);
      console.log("Resetting password for:", email);
      
      // Call resetPassword function from api.js
      const { error } = await resetPassword(email);
      
      // If there was an error, throw it to be caught
      if (error) throw error;
      
      console.log("Password reset email sent");
      return { error: null };
    } catch (err) {
      // Set error state and return error for component handling
      console.error("Password reset error:", err);
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // Refresh the session data
  const refreshSession = async () => {
    try {
      // Don't set loading state if we're in a signup process
      if (!isSigningUp) {
        setLoading(true);
      }
      
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      setUser(data?.session?.user || null);
      return { data, error: null };
    } catch (err) {
      console.error("Session refresh error:", err);
      return { data: null, error: err };
    } finally {
      // Only reset loading if we set it earlier
      if (!isSigningUp) {
        setLoading(false);
      }
    }
  };

  // Modal control functions
  const openLoginModal = () => {
    setIsLoginModal(true);
    setShowAuthModal(true);
  };

  const openSignupModal = () => {
    setIsLoginModal(false);
    setShowAuthModal(true);
  };

  const closeAuthModals = () => {
    setShowAuthModal(false);
  };

  // Create value object with all auth functions and state to be provided by context
  const value = {
    user,                  // Current authenticated user
    setUser,
    signUp: handleSignUp, // Function to register new users
    signIn: handleSignIn, // Function to login existing users
    signInWithGoogle: handleSignInWithGoogle, // Function to login with Google
    signOut: handleSignOut, // Function to logout
    resetPassword: handleResetPassword, // Function to reset password
    refreshSession,       // Function to refresh session data
    error,                // Any auth errors
    setError,             // Function to set/clear errors
    loading,              // Loading state
    isSigningUp,          // Whether signup is in progress
    // Modal control
    showAuthModal,        // Whether auth modal is showing
    isLoginModal,         // Whether in login or signup mode
    openLoginModal,       // Function to open login modal
    openSignupModal,      // Function to open signup modal
    closeAuthModals       // Function to close auth modals
  };

  // Provide the auth context value to children components
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;