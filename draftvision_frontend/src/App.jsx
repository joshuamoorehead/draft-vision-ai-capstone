import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './services/api';
import PlayerList from './components/PlayerList/PlayerList';
import './styles/main.css';
import AboutPage from './components/aboutpage/aboutpage';
import MockDraft from './components/MockDraft/MockDraft';
import DraftRoom from './components/MockDraft/DraftRoom';
import LargeList from './components/LargeList/LargeList';
import PlayerCompare from './components/PlayerCompare/PlayerCompare';
import PlayerInput from './components/PlayerInput/PlayerInput';
import NewPlayerComp from './components/PlayerInput/NewPlayerComp';
import NavBar from './components/Navigation/NavBar';
import AuthCallback from './components/Auth/AuthCallback';
import SavedDrafts from './components/SavedDrafts/SavedDrafts';
import AccountSettings from './components/Account/AccountSettings';
import Community from './components/Community/Community';
import { reconnectRealtimeClient } from './services/api';

// Recovery button component
const RecoveryButton = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  
  const handleRecover = async () => {
    setIsRecovering(true);
    await reconnectRealtimeClient();
    setIsRecovering(false);
  };
  
  return (
    <button
      onClick={handleRecover}
      disabled={isRecovering}
      className="fixed bottom-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center"
      title="Fix connection issues"
    >
      {isRecovering ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Recovering...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Fix Connection
        </>
      )}
    </button>
  );
};

// Wrapper to conditionally display the NavBar
const AppContent = () => {
  const location = useLocation();
  const { loading, setUser } = useAuth(); // Only use loading from auth context
  const [showRecoveryButton, setShowRecoveryButton] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Routes where the NavBar should be hidden
  const hideNavbarRoutes = ['/draftroom', '/auth/callback'];
  
  // Check if current path should hide the navbar
  const shouldHideNavbar = hideNavbarRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  // Initialize visibility change handler
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab became visible, refreshing connection");
  
        // Force session refresh when tab is reactivated
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.warn("Session refresh error:", error);
          if (error.message.includes('expired')) {
            await supabase.auth.signOut();
            window.location.reload();
          }
        } else if (data?.session) {
          setUser(data.session.user); // ✅ Ensure setUser is correctly updated
          localStorage.setItem("supabase.auth.token", JSON.stringify(data.session));
        }
  
        await reconnectRealtimeClient();
      }
    };
  
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setUser]); // ✅ Add setUser to dependency array
  

  // Show recovery button after extended loading
  useEffect(() => {
    let timer;
    
    if (loading) {
      // Show recovery button after 5 seconds of loading
      timer = setTimeout(() => {
        setLoadingTimeout(true);
        setShowRecoveryButton(true);
      }, 5000);
    } else {
      setLoadingTimeout(false);
      // Hide recovery button after 10 seconds when not loading
      timer = setTimeout(() => {
        setShowRecoveryButton(false);
      }, 10000);
    }
    
    return () => clearTimeout(timer);
  }, [loading]);

  // Standard loading indicator with timeout detection
  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
        <div className="text-white text-center">
          <p className="mb-2">{loadingTimeout ? "Loading is taking longer than expected..." : "Loading..."}</p>
          
          {loadingTimeout && (
            <div className="mt-4">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-white text-indigo-900 rounded hover:bg-gray-100 mr-2"
              >
                Reload Page
              </button>
              <button 
                onClick={() => reconnectRealtimeClient()} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Fix Connection
              </button>
            </div>
          )}
        </div>
        
        {/* Always show the recovery button during loading */}
        {showRecoveryButton && <RecoveryButton />}
      </div>
    );
  }

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
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected Routes */}
          <Route path="/saved-drafts" element={<SavedDrafts />} />
          <Route path="/mockdraft/:draftId" element={<DraftRoom />} />
          <Route path="/account-settings" element={<AccountSettings />} />
        </Routes>
      </div>
      
      {/* Show the recovery button conditionally */}
      {showRecoveryButton && <RecoveryButton />}
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