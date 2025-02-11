// components/Navigation/NavBar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { dvailogo } from '../Logos';
import UserMenu from './UserMenu';

const NavBar = () => {
  const location = useLocation();

  return (
    <div className="fixed top-0 left-0 right-0 w-full h-32 bg-black z-50 transform transition-transform duration-300 ease-in-out">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="transform hover:scale-105 transition-transform duration-200">
            <img src={dvailogo} alt="Draft Vision AI Logo" className="h-32 w-32" />
          </Link>
          <div className="flex space-x-8 ml-12">
            {[
              { path: '/', label: 'Player List' },
              { path: '/mockdraft', label: 'Mock Draft' },
              { path: '/largelist', label: 'Big Board' },
              { path: '/saved-drafts', label: 'My Drafts' },
              { path: '/about', label: 'About' }
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`text-white text-2xl font-roboto-condensed transition-all duration-200 
                  ${location.pathname === path 
                    ? 'opacity-100 border-b-2 border-blue-500' 
                    : 'opacity-50 hover:opacity-100 hover:border-b-2 hover:border-blue-500'}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <UserMenu />
      </div>
    </div>
  );
};

export default NavBar;