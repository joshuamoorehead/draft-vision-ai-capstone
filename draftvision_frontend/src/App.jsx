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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
