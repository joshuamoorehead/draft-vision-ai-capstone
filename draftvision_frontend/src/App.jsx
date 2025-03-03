import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PlayerList from './components/PlayerList/PlayerList';
import ResultsList from './components/PlayerList/ResultsList';
import './styles/main.css';
import AboutPage from './components/aboutpage/aboutpage';
import MockDraft from './components/MockDraft/MockDraft';
import DraftRoom from './components/MockDraft/DraftRoom';
import LargeList from './components/LargeList/LargeList';
import PlayerCompare from './components/PlayerCompare/PlayerCompare';
import PlayerInput from './components/PlayerInput/PlayerInput';
import NewPlayerComp from './components/PlayerInput/NewPlayerComp';
import NavBar from './components/Navigation/NavBar';
import AuthPage from './components/Auth/AuthPage';
import SavedDrafts from './components/SavedDrafts/SavedDrafts';
import AccountSettings from './components/Account/AccountSettings';
import Community from './components/Community/Community';
import { supabase } from './services/api';

// Wrapper to conditionally display the NavBar
const AppContent = () => {
  const location = useLocation();
  
  // Routes where the NavBar should be hidden
  const hideNavbarRoutes = ['/draftroom'];
  
  // Check if current path should hide the navbar
  const shouldHideNavbar = hideNavbarRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  // For debugging: Log Supabase session on app startup to verify authentication
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Initial session check:", data);
    };
    checkSession();
  }, []);
  
  return (
    <div className="min-h-screen bg-[#5A6BB0]">
      {/* Conditionally render NavBar */}
      {!shouldHideNavbar && <NavBar />}
      
      {/* Main content area with conditional padding for fixed navbar */}
      <div className={!shouldHideNavbar ? "pt-20" : ""}>
        <Routes>
          {/* Redirect root to about page */}
          <Route path="/" element={<Navigate to="/about" />} />
          
          {/* Public Routes */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/playerlist" element={<PlayerList />} />
          <Route path="/mockdraft" element={<MockDraft />} />
          <Route path="/largelist" element={<LargeList />} />
          <Route path="/draftroom" element={<DraftRoom />} />
          <Route path="/playercompare" element={<PlayerCompare />} />
          <Route path="/playerinput" element={<PlayerInput />} />
          <Route path="/newplayercomp" element={<NewPlayerComp />} />
          <Route path="/community" element={<Community />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          
          {/* Protected Routes */}
          <Route path="/saved-drafts" element={<SavedDrafts />} />
          <Route path="/account-settings" element={<AccountSettings />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;