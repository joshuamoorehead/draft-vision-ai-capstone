import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, signUp, signIn, signInWithGoogle, resetPassword } from '../services/api';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children, signupStateHandler }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginModal, setIsLoginModal] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);

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
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setIsSigningUp(false);
      if (signupStateHandler) signupStateHandler(false);
    }
  };

  const handleSignIn = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      console.log("Signing in:", email);
      const { data, error } = await signIn(email, password);
      if (error) throw error;
      console.log("Signin successful");
      setShowAuthModal(false);
      return { data, error: null };
    } catch (err) {
      console.error("Signin error:", err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      setError('');
      setLoading(true);
      console.log("Signing in with Google");
      const { data, error } = await signInWithGoogle();
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
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
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      window.location.replace('/about');
    } catch (err) {
      console.error("Sign out error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (email) => {
    try {
      setError('');
      setLoading(true);
      console.log("Resetting password for:", email);
      const { error } = await resetPassword(email);
      if (error) throw error;
      console.log("Password reset email sent");
      return { error: null };
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
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
      if (!isSigningUp) {
        setLoading(false);
      }
    }
  };

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

  // Include the user's UUID (using user.id) in the context value
  const value = {
    user,
    uuid: user?.id,
    setUser,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    refreshSession,
    error,
    setError,
    loading,
    isSigningUp,
    showAuthModal,
    isLoginModal,
    openLoginModal,
    openSignupModal,
    closeAuthModals
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
