import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { dvailogo } from '../Logos';
import { useAuth } from '../../context/AuthContext';
import Auth from '../Auth/Auth';

// Icons (you may need to install react-icons: npm install react-icons)
import { FaChevronDown, FaTools, FaUsers, FaSave, FaClipboardList } from 'react-icons/fa';

const NavBar = () => {
  // Get current location and user authentication state
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  // States for dropdowns and auth modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginModal, setIsLoginModal] = useState(true);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Refs for handling clicks outside dropdowns
  const toolsDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target)) {
        setShowToolsDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auth modal control functions
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

  // Toggle dropdown menus
  const toggleToolsDropdown = () => {
    setShowToolsDropdown(!showToolsDropdown);
    if (showUserDropdown) setShowUserDropdown(false);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
    if (showToolsDropdown) setShowToolsDropdown(false);
  };

  // Handle logout
  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Check if a path is active (for highlighting)
  const isActive = (path) => {
    if (path === '/about') {
      return location.pathname === '/about' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 w-full h-20 bg-black z-50 shadow-lg">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo - Links to Home/About */}
        <Link to="/about" className="flex items-center">
          <img src={dvailogo} alt="Draft Vision AI Logo" className="h-16 w-auto mr-4" />
        </Link>

        {/* Main Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Mock Draft - Standalone Button */}
          <Link
            to="/mockdraft"
            className={`flex items-center text-white text-lg px-4 py-2 rounded-md font-medium
              ${isActive('/mockdraft') 
                ? 'bg-blue-600' 
                : 'hover:bg-gray-700'}`}
          >
            <FaClipboardList className="mr-2" />
            Mock Draft
          </Link>

          {/* Draft Tools Dropdown */}
          <div className="relative" ref={toolsDropdownRef}>
            <button
              onClick={toggleToolsDropdown}
              className={`flex items-center text-white text-lg px-4 py-2 rounded-md font-medium
                ${(isActive('/playerlist') || isActive('/largelist') || isActive('/playercompare') || isActive('/playerinput'))
                  ? 'bg-blue-600' 
                  : 'hover:bg-gray-700'}`}
              aria-expanded={showToolsDropdown}
            >
              <FaTools className="mr-2" />
              Draft Tools
              <FaChevronDown className="ml-2 h-3 w-3" />
            </button>

            {/* Draft Tools Dropdown Menu */}
            {showToolsDropdown && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10">
                <Link
                  to="/playerlist"
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowToolsDropdown(false)}
                >
                  Player List
                </Link>
                <Link
                  to="/largelist"
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowToolsDropdown(false)}
                >
                  Big Board
                </Link>
                <Link
                  to="/playercompare"
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowToolsDropdown(false)}
                >
                  Player Comparison
                </Link>
                <Link
                  to="/playerinput"
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowToolsDropdown(false)}
                >
                  Player Prediction
                </Link>
              </div>
            )}
          </div>

          {/* Community */}
          <Link
            to="/community"
            className={`flex items-center text-white text-lg px-4 py-2 rounded-md font-medium
              ${isActive('/community') 
                ? 'bg-blue-600' 
                : 'hover:bg-gray-700'}`}
          >
            <FaUsers className="mr-2" />
            Community
          </Link>

          {/* Saved Drafts - Only for authenticated users */}
          {user && (
            <Link
              to="/saved-drafts"
              className={`flex items-center text-white text-lg px-4 py-2 rounded-md font-medium
                ${isActive('/saved-drafts') 
                  ? 'bg-blue-600' 
                  : 'hover:bg-gray-700'}`}
            >
              <FaSave className="mr-2" />
              Saved Drafts
            </Link>
          )}
        </div>

        {/* User Authentication Section */}
        <div className="relative" ref={userDropdownRef}>
          {user ? (
            <>
              {/* User is authenticated - show profile */}
              <button
                onClick={toggleUserDropdown}
                className="flex items-center text-white hover:text-gray-300"
              >
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    user.email.charAt(0).toUpperCase()
                  )}
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-200">
                    {user.email}
                  </div>
                  <Link
                    to="/account-settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    Account Settings
                  </Link>
                  <Link
                    to="/saved-drafts"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    Saved Drafts
                  </Link>
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
            <div className="flex items-center space-x-3">
              <button
                onClick={openLoginModal}
                className="text-white px-4 py-2 rounded text-lg hover:bg-gray-700"
              >
                Log In
              </button>
              <button
                onClick={openSignupModal}
                className="bg-blue-600 text-white px-4 py-2 rounded text-lg hover:bg-blue-700"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button className="text-white hover:text-gray-300">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Auth modals */}
      {showAuthModal && (
        <Auth
          isLoginOpen={isLoginModal}
          isSignupOpen={!isLoginModal}
          closeModals={closeAuthModals}
        />
      )}
    </nav>
  );
};

export default NavBar;