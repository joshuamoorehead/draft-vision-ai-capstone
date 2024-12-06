import React, { useState, useEffect } from 'react';
import { fetchPlayers, fetchPlayerDetails } from '../../services/api';
import dvailogo from '../dvailogo.png';

const LargeList = () => {
  const [position, setPosition] = useState(''); // Selected position
  const [allPlayers, setAllPlayers] = useState([]); // All players data
  const [players, setPlayers] = useState([]); // Filtered players
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
      biography:
        'Travis Hunter is a highly regarded American football player known for his exceptional skills as both a wide receiver and cornerback.',
    },
    {
      id: 2,
      name: 'Raheim Sanders',
      school: 'South Carolina',
      position: 'RB',
      rating: 97.6,
      biography: 'Explosive running back known for his combination of speed and power.',
    },
    {
      id: 3,
      name: 'Kyle McCord',
      school: 'Syracuse',
      position: 'QB',
      rating: 95.9,
      biography: 'Former Ohio State quarterback known for his strong arm and pocket presence.',
    },
    {
      id: 4,
      name: 'Seven McGee',
      school: 'Albany',
      position: 'WR',
      rating: 95.4,
      biography: 'Dynamic playmaker with exceptional speed and agility.',
    },
    {
      id: 5,
      name: 'Shedeur Sanders',
      school: 'Colorado',
      position: 'QB',
      rating: 93.7,
      biography: 'Talented quarterback who has shown exceptional leadership and passing ability.',
    },
  ];

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const data = await fetchPlayers();
        setAllPlayers(data.results || data); // Assuming your API returns a `results` array
        setPlayers(data.results || data); // Initially display all players
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  // Filter players based on selected position
  useEffect(() => {
    if (position) {
      setPlayers(allPlayers.filter((player) => player.position.includes(position)));
    } else {
      setPlayers(allPlayers);
    }
  }, [position, allPlayers]);

  const handlePlayerSelect = (playerId) => {
    // Find the player object from the list using the ID
  const playerData = allPlayers.find((player) => player.id === playerId);
  if (playerData) {
    console.log('Selected Player Data:', playerData); // Debug
    setSelectedPlayer(playerData);
  } else {
    console.error('Player not found:', playerId);
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
          <img src={dvailogo} alt="Draft Vision AI Logo" className="h-32 w-32" />
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
          {/* Filters Panel */}
          <div className="w-60 h-[624px] bg-gray-100 border-2 border-black p-4">
            <h3 className="text-center text-xl mb-4">Filters</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full p-2 border-2 border-black rounded bg-white"
                >
                  <option value="">All Positions</option>
                  <option value="QB">Quarterback (QB)</option>
                  <option value="RB">Running Back (RB)</option>
                  <option value="WR">Wide Receiver (WR)</option>
                  <option value="TE">Tight End (TE)</option>
                </select>
              </div>
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
                <div className="w-16 text-center text-xl font-semibold">{index + 1}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium">{player.name}</h3>
                  <p className="text-lg">{player.school}</p>
                  <p className="text-lg">{player.position}</p>
                </div>
                <div className="text-right mr-8">
                  <p className="text-lg">Player Rating:</p>
                  <p className="text-3xl font-medium">{player.career_av}</p>
                </div>
                <button className="w-12 h-12 border-4 border-black rounded">→</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player Card Modal */}
{selectedPlayer && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    {console.log(selectedPlayer)} {/* Log selectedPlayer object */}
    <div className="bg-white rounded-xl p-6 max-w-4xl w-full relative">
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        onClick={() => setSelectedPlayer(null)}
      >
        ✕
      </button>
      {/* Player Details */}
      {/* Player Details */}
<div className="flex gap-6 mb-6">
  <div>
    <h2 className="text-3xl font-bold">{selectedPlayer.name}</h2>
    <p className="text-xl text-gray-600">{selectedPlayer.school}</p>
    <p className="text-lg">{selectedPlayer.position}</p>
    <div className="text-sm text-gray-600 mt-4">
      <p><strong>Year Drafted:</strong> {selectedPlayer.year_drafted || 'N/A'}</p>
      <p><strong>Draft Pick:</strong> {selectedPlayer.draft_pick || 'N/A'}</p>
      <p><strong>Years in NCAA:</strong> {selectedPlayer.years_ncaa?.join(', ') || 'N/A'}</p>
      <p><strong>Career AV:</strong> {selectedPlayer.career_av || 'N/A'}</p>
    </div>
  </div>
</div>

      {/* Player Stats */}
      <div>
        {/*
        <h3 className="text-xl font-semibold mb-3">Player Stats</h3>
        {selectedPlayer.stats && Object.keys(selectedPlayer.stats).length > 0 ? (
  <ul className="space-y-2">
    {Object.entries(selectedPlayer.stats).map(([key, value]) => (
      <li key={key} className="flex justify-between border-b pb-2">
        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
        <span className="font-semibold text-gray-800">{value}</span>
      </li>
    ))}
  </ul>
) : (
  <p className="text-gray-600">Stats not available for this player.</p>
)}
  */}
      </div>

      {/* Return Button */}
      <div className="mt-6 text-right">
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={() => setSelectedPlayer(null)}
        >
          Return to Large List
        </button>
      </div>
    </div>
  </div>
      )}
    </div>
  );
};

export default LargeList;
