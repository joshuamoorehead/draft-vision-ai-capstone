// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PlayerList from './components/PlayerList/PlayerList';
import ResultsList from './components/PlayerList/ResultsList';
import './styles/main.css';
import AboutPage from './components/aboutpage/aboutpage'
import MockDraft from './components/MockDraft/MockDraft'
import DraftRoom from './components/MockDraft/DraftRoom.jsx'
import LargeList from './components/LargeList/LargeList'
import PlayerCompare from './components/PlayerCompare/PlayerCompare.jsx'
import PlayerInput from './components/PlayerInput/PlayerInput.jsx'
import NewPlayerComp from './components/PlayerInput/NewPlayerComp.jsx'
function App() {
  return (
    <Router>
      <div>
        {/* Page Routes */}
        <Routes>
          <Route path="/" element={<PlayerList />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/mockdraft" element={<MockDraft />} />
          <Route path="/largelist" element={<LargeList />} />
          <Route path="/draftroom" element={<DraftRoom />} />
          <Route path="/playercompare" element={<PlayerCompare />} />
          <Route path="/playerinput" element={<PlayerInput />} />
          <Route path="/newplayercomp" element={<NewPlayerComp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
