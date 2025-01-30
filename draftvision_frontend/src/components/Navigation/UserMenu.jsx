// components/Navigation/UserMenu.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserCircle } from 'lucide-react';
import { supabase } from '../../services/api';


const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut(); // Explicitly sign out from Supabase
      navigate('/'); // Redirect to home page
      window.location.reload(); // Force refresh to clear session
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  

  return (
    <div className="relative">
      {user ? (
        <>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity"
          >
            {user.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <UserCircle className="w-8 h-8" />
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              
              <Link 
                to="/saved-drafts"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
        <Link 
          to="/login"
          className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity"
        >
          <UserCircle className="w-8 h-8" />
        </Link>
      )}
    </div>
  );
};

export default UserMenu;
