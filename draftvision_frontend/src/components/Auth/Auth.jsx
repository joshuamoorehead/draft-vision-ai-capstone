import React, { useState } from 'react';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const Auth = ({ isLoginOpen, isSignupOpen, closeModals }) => {
  const [showLogin, setShowLogin] = useState(isLoginOpen || false);
  const [showSignup, setShowSignup] = useState(isSignupOpen || false);

  const switchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const switchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const handleClose = () => {
    setShowLogin(false);
    setShowSignup(false);
    if (closeModals) closeModals();
  };

  return (
    <>
      <LoginModal 
        isOpen={showLogin} 
        onClose={handleClose} 
        switchToSignup={switchToSignup} 
      />
      <SignupModal 
        isOpen={showSignup} 
        onClose={handleClose} 
        switchToLogin={switchToLogin} 
      />
    </>
  );
};

export default Auth;