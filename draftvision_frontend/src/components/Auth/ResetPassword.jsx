import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../Common/PageTransition';

const ResetPassword = () => {
  const navigate = useNavigate();
  
  // Listen for auth state changes and handle redirection
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'PASSWORD_RECOVERY') {
        // User has accessed the page with recovery token
        console.log('Password recovery flow started');
      } else if (event === 'USER_UPDATED') {
        // Password has been successfully reset
        console.log('User updated, password reset successful');
        // Navigate to your own page instead of letting Supabase redirect
        navigate('/about');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white bg-opacity-95 backdrop-filter backdrop-blur-sm p-8 rounded-xl shadow-2xl relative z-10">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Reset Your Password</h2>
          <div className="h-1 w-16 bg-blue-400 rounded mt-2 mx-auto mb-6"></div>
          
          {/* Global styles to hide unwanted UI elements */}
          <style jsx global>{`
            /* Hide specific UI elements we don't want */
            .supabase-auth-ui_ui-anchor[href="#auth-sign-in"],
            .supabase-auth-ui_ui-button[data-sm="true"] {
              display: none !important;
            }
            .supabase-auth-ui_ui-footer {
              display: none !important;
            }
          `}</style>
          
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4F46E5',
                    brandAccent: '#4338CA',
                  },
                },
              },
              style: {
                button: {
                  borderRadius: '8px',
                  backgroundColor: '#4F46E5',
                  backgroundImage: 'linear-gradient(to right, #4F46E5, #6366F1)',
                  color: 'white',
                  fontWeight: '600',
                  padding: '8px 16px',
                },
                input: {
                  borderRadius: '8px',
                },
                anchor: {
                  color: '#4F46E5',
                }
              },
            }}
            view="update_password"
            redirectTo={`${window.location.origin}/about`}
          />
        </div>
        
        {/* Animated backgrounds */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Animation styles */}
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
        `}</style>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;