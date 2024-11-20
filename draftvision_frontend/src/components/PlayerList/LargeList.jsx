// src/components/PlayerList/LargeList.jsx
import React, { useState, useEffect } from 'react';
import { fetchPlayers, fetchPlayerDetails } from '../../services/api';

const LargeList = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dummy data for development
  const dummyPlayers = [
    {
      id: 1,
      name: 'Travis Hunter',
      school: 'Colorado',
      position: 'WR/CB',
      rating: 99.8,
      biography: 'Travis Hunter is a highly regarded American football player known for his exceptional skills as both a wide receiver and cornerback.'
    },
    {
      id: 2,
      name: 'Raheim Sanders',
      school: 'South Carolina',
      position: 'RB',
      rating: 97.6,
      biography: 'Explosive running back known for his combination of speed and power.'
    },
    {
      id: 3,
      name: 'Kyle McCord',
      school: 'Syracuse',
      position: 'QB',
      rating: 95.9,
      biography: 'Former Ohio State quarterback known for his strong arm and pocket presence.'
    },
    {
      id: 4,
      name: 'Seven McGee',
      school: 'Albany',
      position: 'WR',
      rating: 95.4,
      biography: 'Dynamic playmaker with exceptional speed and agility.'
    },
    {
      id: 5,
      name: 'Shedeur Sanders',
      school: 'Colorado',
      position: 'QB',
      rating: 93.7,
      biography: 'Talented quarterback who has shown exceptional leadership and passing ability.'
    }
  ];

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const data = await fetchPlayers();
        // If your API returns results array, you might need to access it like:
        setPlayers(data.results || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    loadPlayers();
  }, []);

  const handlePlayerSelect = async (playerId) => {
    try {
      // For development, find player in dummy data
      const playerData = dummyPlayers.find(p => p.id === playerId);
      setSelectedPlayer(playerData);
      // Uncomment below when backend is ready
      // const playerData = await fetchPlayerDetails(playerId);
      // setSelectedPlayer(playerData);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#5A6BB0] flex items-center justify-center">
        <div className="text-white text-2xl">Loading players...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#5A6BB0] flex items-center justify-center">
        <div className="text-white text-2xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#5A6BB0]">
      {/* Header */}
      <div className="w-full h-32 bg-black">
        <div className="container mx-auto px-4 h-full flex items-center">
          <img 
            src="/api/placeholder/128/128"
            alt="Draft Vision AI Logo"
            className="h-32 w-32" 
          />
          {/* Navigation links disabled for PoC */}
          <div className="flex space-x-8 text-white ml-12">
            <span className="text-2xl font-roboto-condensed underline">Large List</span>
            <span className="text-2xl font-roboto-condensed opacity-50">Mock Draft</span>
            <span className="text-2xl font-roboto-condensed opacity-50">Players</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-medium bg-gray-100 inline-block px-8 py-2 rounded-xl border-2 border-black">
            2025 Draft Large List
          </h2>
        </div>

        {/* Player List */}
        <div className="flex gap-4">
          {/* Filters Panel - Static for PoC */}
          <div className="w-60 h-[624px] bg-gray-100 border-2 border-black p-4">
            <h3 className="text-center text-xl mb-4">Filters</h3>
            <div className="space-y-6">
              {['Year', 'Position', 'Conference', 'Team'].map((filter) => (
                <div key={filter} className="space-y-2">
                  <label className="text-sm font-medium">{filter}</label>
                  <select 
                    disabled 
                    className="w-full p-2 border-2 border-black rounded bg-white"
                  >
                    <option>Select</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Players List */}
          <div className="flex-1 space-y-4">
            {players.map((player, index) => (
              <div 
                key={player.id}
                className="w-full bg-gray-100 border-2 border-black p-4 flex items-center cursor-pointer"
                onClick={() => handlePlayerSelect(player.id)}
              >
                <div className="w-16 text-center text-xl font-semibold">
                  {index + 1}
                </div>
                
                <div className="w-24 h-24 rounded-full overflow-hidden mx-4">
                  <img 
                    src="/api/placeholder/96/96"
                    alt={player.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-medium">{player.name}</h3>
                  <p className="text-lg">{player.school}</p>
                  <p className="text-lg">{player.position}</p>
                </div>
                
                <div className="text-right mr-8">
                  <p className="text-lg">Player Rating:</p>
                  <p className="text-3xl font-medium">{player.rating}</p>
                </div>
                
                <button className="w-12 h-12 border-4 border-black rounded">
                  →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player Card Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full">
            <div className="flex mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden">
                <img 
                  src="/api/placeholder/128/128"
                  alt={selectedPlayer.name}
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <div className="ml-6">
                <h2 className="text-3xl font-bold">{selectedPlayer.name}</h2>
                <p className="text-xl">{selectedPlayer.school}</p>
                <p className="text-xl">{selectedPlayer.position}</p>
                <p className="text-lg mt-2">Age: 21 | Height: 6'1" | Weight: 185</p>
              </div>
            </div>

            {/* Biography Section */}
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-2">Biography:</h3>
              <p className="text-lg">{selectedPlayer.biography || 'Player biography not available.'}</p>
            </div>

            {/* Return Button */}
            <button
              className="px-6 py-2 bg-red-200 rounded-lg"
              onClick={() => setSelectedPlayer(null)}
            >
              Return to Large List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LargeList;