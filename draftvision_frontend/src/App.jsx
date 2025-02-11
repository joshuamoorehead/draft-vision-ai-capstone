// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navigation/NavBar';
import PlayerList from './components/PlayerList/PlayerList';
import AboutPage from './components/aboutpage/aboutpage';
import MockDraft from './components/MockDraft/MockDraft';
import DraftRoom from './components/MockDraft/DraftRoom.jsx';
import LargeList from './components/LargeList/LargeList';
import PlayerCompare from './components/PlayerCompare/PlayerCompare.jsx';
import Auth from './components/Auth/Auth';
import SavedDrafts from './components/SavedDrafts/SavedDrafts';
import AccountSettings from './components/Account/AccountSettings';
import './styles/main.css';

// Create wrapper component for conditional navbar rendering
const AppContent = () => {
  const location = useLocation();
  const routesWithoutNavbar = ['/draftroom', '/login'];
  const shouldShowNavbar = !routesWithoutNavbar.includes(location.pathname);

  return (
    <div>
      <div className={`transform transition-all duration-300 ease-in-out ${shouldShowNavbar ? 'translate-y-0' : '-translate-y-32'}`}>
        <Navbar />
      </div>
      <div className={`transition-all duration-300 ease-in-out ${shouldShowNavbar ? 'pt-32' : 'pt-0'}`}>
        <Routes>
          <Route path="/" element={<PlayerList />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/mockdraft" element={<MockDraft />} />
          <Route path="/draftroom" element={<DraftRoom />} />
          <Route path="/largelist" element={<LargeList />} />
          <Route path="/playercompare" element={<PlayerCompare />} />
          <Route path="/saved-drafts" element={<SavedDrafts />} />
          <Route path="/account" element={<AccountSettings />} />
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
