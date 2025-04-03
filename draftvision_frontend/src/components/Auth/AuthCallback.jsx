import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, reconnectRealtimeClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { refreshSession } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Processing authentication callback...");
        // Get the access token from the URL
        const hash = window.location.hash;
        
        if (!hash) {
          console.log("No hash found in URL, checking session");
          // Wait for Supabase to process the OAuth callback
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            throw error;
          }
          
          if (data?.session) {
            console.log("Session found after callback");
            // Refresh the session in the auth context
            await refreshSession();
            // Ensure realtime connection is established
            await reconnectRealtimeClient();
            // Navigate to home page after successful authentication
            navigate('/about');
          } else {
            console.log("No session found after callback");
            navigate('/about');
          }
        } else {
          console.log("Hash found in URL, waiting for Supabase to process");
          // If hash exists, Supabase will handle it via onAuthStateChange in AuthContext
          // Wait a short time for Supabase to process
          setTimeout(async () => {
            // Check if we have a valid session
            const { data } = await supabase.auth.getSession();
            
            if (data?.session) {
              // Ensure realtime connection is established
              await reconnectRealtimeClient();
              // Refresh the session in the auth context
              await refreshSession();
              // Navigate to home page
              navigate('/about');
            } else {
              // If no session, there might have been an error with the OAuth flow
              console.warn("No session found after OAuth callback");
              navigate('/about');
            }
          }, 1500);
        }
      } catch (err) {
        console.error("Error in auth callback:", err);
        setError(err.message);
        navigate('/about');
      }
    };

    handleAuthCallback();
  }, [navigate, refreshSession]);

  return (
    <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
      <h2 className="text-xl font-semibold mb-2">Completing Authentication</h2>
      <p className="text-indigo-200">Please wait while we sign you in...</p>
      {error && (
        <div className="mt-4 p-3 bg-red-500 bg-opacity-20 rounded">
          <p>Error: {error}</p>
          <button
            className="mt-2 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
            onClick={() => navigate('/about')}
          >
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;