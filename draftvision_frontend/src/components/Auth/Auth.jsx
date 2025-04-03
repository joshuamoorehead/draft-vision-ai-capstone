import React, { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const Auth = ({
  isLoginOpen,
  isSignupOpen,
  closeModals,
  onRegistrationSuccess,
  onRegistrationComplete,
  registrationSuccess: externalRegistrationSuccess,
  onAuthSuccess // Added new callback for successful authentication
}) => {
  const [showLogin, setShowLogin] = useState(isLoginOpen || false);
  const [showSignup, setShowSignup] = useState(isSignupOpen || false);
  const [registrationSuccess, setRegistrationSuccess] = useState(externalRegistrationSuccess || false);

  // This effect ensures modals update when props change
  useEffect(() => {
    setShowLogin(isLoginOpen || false);
    setShowSignup(isSignupOpen || false);
  }, [isLoginOpen, isSignupOpen]);

  // This effect ensures registration success state syncs with parent component
  useEffect(() => {
    setRegistrationSuccess(externalRegistrationSuccess || false);
  }, [externalRegistrationSuccess]);

  const switchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const switchToLogin = () => {
    // If there was a successful registration, notify parent component
    if (registrationSuccess && onRegistrationComplete) {
      onRegistrationComplete();
    }
    setShowSignup(false);
    setShowLogin(true);
  };

  const handleClose = () => {
    setShowLogin(false);
    setShowSignup(false);
    if (closeModals) closeModals();
  };

  // Method to be called from SignupModal on successful registration
  const handleRegistrationSuccess = () => {
    setRegistrationSuccess(true);
    // Also notify parent component
    if (onRegistrationSuccess) {
      onRegistrationSuccess();
    }
  };

  // Allow closing success message and switching to login
  const handleSuccessClose = () => {
    setRegistrationSuccess(false);
    // Also notify parent component
    if (onRegistrationComplete) {
      onRegistrationComplete();
    }
    switchToLogin();
  };

  // New handler for login success
  const handleLoginSuccess = () => {
    // Notify parent component about successful authentication
    if (onAuthSuccess) {
      onAuthSuccess();
    }
    handleClose();
  };

  return (
    <>
      <LoginModal
        isOpen={showLogin}
        onClose={handleClose}
        switchToSignup={switchToSignup}
        onLoginSuccess={handleLoginSuccess} // Pass the new handler to LoginModal
      />
      <SignupModal
        isOpen={showSignup}
        onClose={handleClose}
        switchToLogin={switchToLogin}
        onRegistrationSuccess={handleRegistrationSuccess}
        onSuccessClose={handleSuccessClose}
        showRegistrationSuccess={registrationSuccess}
      />
    </>
  );
};

export default Auth;