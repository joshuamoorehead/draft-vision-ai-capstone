import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, signUp, signIn, signInWithGoogle, resetPassword } from '../services/api';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children, signupStateHandler, loginStateHandler }) => {
  // State to track the current authenticated user
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginModal, setIsLoginModal] = useState(true);
  // State to track if we're in a signup or login process
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Clear error when modal state changes
  useEffect(() => {
    setError('');
  }, [isLoginModal, showAuthModal]);

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
    }, 60000);
    return () => clearInterval(refreshInterval);
  }, [user]);
  
  const handleSignUp = async (email, password, username) => {
    try {
      setIsSigningUp(true);
      if (signupStateHandler) signupStateHandler(true);
      setError('');
      console.log("Signing up:", email);
      const { data, error } = await signUp(email, password, username);
      if (error) throw error;
      console.log("Signup successful");
      return { data, error: null };
    } catch (err) {
      console.error("Signup error:", err);
      // setError(err.message);
      return { data: null, error: err };
    } finally {
      setIsSigningUp(false);
      if (signupStateHandler) signupStateHandler(false);
    }
  };

  const handleSignIn = async (email, password) => {
    try {
      // Track login state locally
      setIsLoggingIn(true);
      
      // Also update parent component if handler exists
      if (loginStateHandler) loginStateHandler(true);
      
      // Clear any previous errors
      setError('');
      console.log("Signing in:", email);
      const { data, error } = await signIn(email, password);
      if (error) throw error;
      console.log("Signin successful");
      setShowAuthModal(false);
      return { data, error: null };
    } catch (err) {
      console.error("Signin error:", err);
      // setError(err.message);
      return { data: null, error: err };
    } finally {
      // Reset login tracking
      setIsLoggingIn(false);
      if (loginStateHandler) loginStateHandler(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      // Track login state locally
      setIsLoggingIn(true);
      
      // Also update parent component if handler exists
      if (loginStateHandler) loginStateHandler(true);
      
      // Clear any previous errors
      setError('');
      console.log("Signing in with Google");
      const { data, error } = await signInWithGoogle();
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error("Google signin error:", err);
      // setError(err.message);
      return { data: null, error: err };
    } finally {
      // Reset login tracking
      setIsLoggingIn(false);
      if (loginStateHandler) loginStateHandler(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setError('');
      
      // Only set loading if not in an auth process
      if (!isSigningUp && !isLoggingIn) {
        setLoading(true);
      }
      
      console.log("Signing out user");
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      window.location.replace('/about');
    } catch (err) {
      console.error("Sign out error:", err);
      setError(err.message);
    } finally {
      // Only reset loading if we set it earlier
      if (!isSigningUp && !isLoggingIn) {
        setLoading(false);
      }
    }
  };
  
  const handleResetPassword = async (email) => {
    try {
      setError('');
      
      // Only set loading if not in an auth process
      if (!isSigningUp && !isLoggingIn) {
        setLoading(true);
      }
      
      console.log("Resetting password for:", email);
      const { error } = await resetPassword(email);
      if (error) throw error;
      console.log("Password reset email sent");
      return { error: null };
    } catch (err) {
      console.error("Password reset error:", err);
      // Return the error but don't set global error state
      return { error: err };
    } finally {
      // Only reset loading if we set it earlier
      if (!isSigningUp && !isLoggingIn) {
        setLoading(false);
      }
    }
  };

  const refreshSession = async () => {
    try {
      // Don't set loading state if we're in an auth process
      if (!isSigningUp && !isLoggingIn) {
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
      if (!isSigningUp && !isLoggingIn) {
        setLoading(false);
      }
    }
  };

  const openLoginModal = () => {
    setIsLoginModal(true);
    setShowAuthModal(true);
    setError(''); // Clear error when opening modal
  };

  const openSignupModal = () => {
    setIsLoginModal(false);
    setShowAuthModal(true);
    setError(''); // Clear error when opening modal
  };

  const closeAuthModals = () => {
    setShowAuthModal(false);
    setError(''); // Clear error when closing modal
  };

  // Include the user's UUID (using user.id) in the context value
  const value = {
    user,                   // Current authenticated user
    setUser,
    signUp: handleSignUp,   // Function to register new users
    signIn: handleSignIn,   // Function to login existing users
    signInWithGoogle: handleSignInWithGoogle, // Function to login with Google
    signOut: handleSignOut, // Function to logout
    resetPassword: handleResetPassword, // Function to reset password
    refreshSession,         // Function to refresh session data
    error,                  // Any auth errors
    setError,               // Function to set/clear errors
    loading,                // Loading state
    isSigningUp,            // Whether signup is in progress
    isLoggingIn,            // Whether login is in progress
    // Modal control
    showAuthModal,          // Whether auth modal is showing
    isLoginModal,           // Whether in login or signup mode
    openLoginModal,         // Function to open login modal
    openSignupModal,        // Function to open signup modal
    closeAuthModals         // Function to close auth modals
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
