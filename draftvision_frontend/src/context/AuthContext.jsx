import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, signUp, signIn, signInWithGoogle, signOut, resetPassword } from '../services/api';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  // State to track the current authenticated user
  const [user, setUser] = useState(null);
  // State to track loading status while checking if a user is already logged in
  const [loading, setLoading] = useState(true);
  // State to track any authentication errors
  const [error, setError] = useState('');

  // Check for existing session on component mount
  useEffect(() => {
    // Log when the auth provider initializes
    console.log("AuthProvider initializing");
    
    // Function to check if user has an active session
    const checkSession = async () => {
      try {
        // Get current session from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        console.log("Session check result:", data?.session?.user || "No session");
        
        if (error) {
          throw error;
        }
        
        // Set user from session if it exists, otherwise null
        setUser(data?.session?.user || null);
      } catch (err) {
        console.error('Error checking session:', err);
        setError(err.message);
      } finally {
        // Mark loading as complete regardless of outcome
        setLoading(false);
      }
    };

    // Check for existing session when component mounts
    checkSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        // Update user state when auth state changes
        setUser(session?.user || null);
        setLoading(false);
        
        // If user logs in, create or update their profile
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Check if user profile exists
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
              
            // If profile doesn't exist, create one
            if (!profile) {
              await supabase.from('user_profiles').insert({
                user_id: session.user.id,
                email: session.user.email,
                updated_at: new Date().toISOString()
              });
            }
          } catch (err) {
            console.error('Error managing user profile:', err);
          }
        }
      }
    );

    // Cleanup: unsubscribe when component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Create a wrapper for the signUp function with error handling
  const handleSignUp = async (email, password) => {
    try {
      // Clear any previous errors
      setError('');
      console.log("Signing up:", email);
      
      // Call signUp function from api.js
      const { data, error } = await signUp(email, password);
      
      // If there was an error, throw it to be caught
      if (error) throw error;
      
      console.log("Signup successful");
      return { data, error: null };
    } catch (err) {
      // Set error state and return error for component handling
      console.error("Signup error:", err);
      setError(err.message);
      return { data: null, error: err };
    }
  };

  // Create a wrapper for the signIn function with error handling
  const handleSignIn = async (email, password) => {
    try {
      // Clear any previous errors
      setError('');
      console.log("Signing in:", email);
      
      // Call signIn function from api.js
      const { data, error } = await signIn(email, password);
      
      // If there was an error, throw it to be caught
      if (error) throw error;
      
      console.log("Signin successful");
      return { data, error: null };
    } catch (err) {
      // Set error state and return error for component handling
      console.error("Signin error:", err);
      setError(err.message);
      return { data: null, error: err };
    }
  };

  // Create a wrapper for the signInWithGoogle function with error handling
  const handleSignInWithGoogle = async () => {
    try {
      // Clear any previous errors
      setError('');
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
    }
  };

  // Create a wrapper for the signOut function with error handling
  const handleSignOut = async () => {
    try {
      // Clear any previous errors
      setError('');
      console.log("Signing out");
      
      // Call signOut function from api.js
      const { error } = await signOut();
      
      // If there was an error, throw it to be caught
      if (error) throw error;
      
      console.log("Signout successful");
      return { error: null };
    } catch (err) {
      // Set error state and return error for component handling
      console.error("Signout error:", err);
      setError(err.message);
      return { error: err };
    }
  };

  // Create a wrapper for the resetPassword function with error handling
  const handleResetPassword = async (email) => {
    try {
      // Clear any previous errors
      setError('');
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
    }
  };

  // Create value object with all auth functions and state to be provided by context
  const value = {
    user,                 // Current authenticated user
    signUp: handleSignUp, // Function to register new users
    signIn: handleSignIn, // Function to login existing users
    signInWithGoogle: handleSignInWithGoogle, // Function to login with Google
    signOut: handleSignOut, // Function to logout
    resetPassword: handleResetPassword, // Function to reset password
    error,                // Any auth errors
    setError,             // Function to set/clear errors
    loading               // Loading state
  };

  // Provide the auth context value to children components
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;