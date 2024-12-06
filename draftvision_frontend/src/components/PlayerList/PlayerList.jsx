// src/components/PlayerList/PlayerList.jsx
import { useState, useEffect } from 'react';
import { getRankings } from '../../services/api';
import PlayerCard from './PlayerCard';
import React from 'react';
import ResultsList from './ResultsList'

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to load rankings
  const loadRankings = async (position = null) => {
      try {
          setLoading(true);
          const rankings = await getRankings(position);
          setPlayers(rankings);
          setError(null);
      } catch (err) {
          setError('Failed to load rankings');
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  // Load rankings when component mounts or position changes
  useEffect(() => {
      loadRankings(selectedPosition);
  }, [selectedPosition]);

  if (loading) return <div>Loading rankings...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
      <div className="p-4">
          {/* Position filters */}
          <div className="mb-4 flex gap-2">
              <button 
                  onClick={() => setSelectedPosition(null)}
                  className={`px-4 py-2 rounded ${!selectedPosition ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                  All
              </button>
              {['QB', 'WR', 'RB'].map(pos => (
                  <button
                      key={pos}
                      onClick={() => setSelectedPosition(pos)}
                      className={`px-4 py-2 rounded ${selectedPosition === pos ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                      {pos}
                  </button>
              ))}
          </div>

          {/* Rankings list */}
          <div className="space-y-4">
              {players.map((player, index) => (
                  <PlayerCard 
                      key={index}
                      rank={index + 1}
                      {...player}
                  />
              ))}
          </div>
      </div>
  );
};

export default PlayerList;