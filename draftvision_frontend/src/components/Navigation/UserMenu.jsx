import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * UserMenu Component
 * Displays different UI based on authentication state
 * - If user is authenticated: shows profile picture/initial and dropdown menu
 * - If user is not authenticated: shows login/signup buttons
 */
const UserMenu = () => {
  // Get auth context for user and signOut function
  const { user, signOut } = useAuth();
  // State to track if dropdown menu is open
  const [isOpen, setIsOpen] = useState(false);
  // Hook for navigation
  const navigate = useNavigate();

  /**
   * Handles user sign out
   * 1. Calls signOut function from auth context
   * 2. Closes dropdown menu
   * 3. Navigates to home page
   */
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  /**
   * Toggles the dropdown menu open/closed
   */
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {user ? (
        // User is authenticated - show profile and dropdown menu
        <>
          {/* Profile button/avatar */}
          <button
            onClick={toggleMenu}
            className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
              {/* Show user's avatar if available, otherwise show initial */}
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                // Display first letter of email as fallback
                user.email.charAt(0).toUpperCase()
              )}
            </div>
          </button>
          
          {/* Dropdown menu - only shown when isOpen is true */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
              {/* User's email at top of dropdown */}
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
              </div>
              
              {/* Link to account settings */}
              <Link
                to="/account-settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Account Settings
              </Link>
              
              {/* Link to saved drafts */}
              <Link
                to="/saved-drafts"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Saved Drafts
              </Link>
              
              {/* Sign out button */}
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          )}
        </>
      ) : (
        // User is not authenticated - show login/signup buttons
        <div className="flex items-center space-x-4">
          {/* Login button */}
          <Link
            to="/login"
            className="text-white text-lg font-roboto-condensed transition-all duration-200 hover:opacity-80"
          >
            Login
          </Link>
          
          {/* Sign up button */}
          <Link
            to="/signup"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserMenu;