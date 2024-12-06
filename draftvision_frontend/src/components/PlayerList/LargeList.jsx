import React, { useState, useEffect } from 'react';
import { fetchPlayers } from '../../services/api';
import Papa from 'papaparse';
import dvailogo from '../dvailogo.png';

const LargeList = () => {
  const [position, setPosition] = useState(''); // Selected position
  const [allPlayers, setAllPlayers] = useState([]); // All players data
  const [players, setPlayers] = useState([]); // Filtered players
  const [predictions, setPredictions] = useState([]); // Predicted results from CSV
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
      career_av: 99.8,
      biography:
        'Travis Hunter is a highly regarded American football player known for his exceptional skills as both a wide receiver and cornerback.',
    },
    {
      id: 2,
      name: 'Raheim Sanders',
      school: 'South Carolina',
      position: 'RB',
      career_av: 97.6,
      biography: 'Explosive running back known for his combination of speed and power.',
    },
    {
      id: 3,
      name: 'Kyle McCord',
      school: 'Syracuse',
      position: 'QB',
      career_av: 95.9,
      biography: 'Former Ohio State quarterback known for his strong arm and pocket presence.',
    },
    {
      id: 4,
      name: 'Seven McGee',
      school: 'Albany',
      position: 'WR',
      career_av: 95.4,
      biography: 'Dynamic playmaker with exceptional speed and agility.',
    },
    {
      id: 5,
      name: 'Shedeur Sanders',
      school: 'Colorado',
      position: 'QB',
      career_av: 93.7,
      biography: 'Talented quarterback who has shown exceptional leadership and passing ability.',
    },
  ];

  useEffect(() => {
    // Load players
    const loadPlayers = async () => {
      try {
        const data = await fetchPlayers();
        const fetchedPlayers = data.results || data || dummyPlayers;

        // Sort players by career_av in descending order
        fetchedPlayers.sort((a, b) => b.career_av - a.career_av);

        setAllPlayers(fetchedPlayers);
        setPlayers(fetchedPlayers); // Initially display all players
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Load predictions from CSV
    const loadPredictions = async () => {
      try {
        const response = await fetch('/2024pred.csv');
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true });
        setPredictions(parsed.data);
      } catch (err) {
        console.error('Failed to load predictions:', err.message);
      }
    };

    loadPlayers();
    loadPredictions();
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
    const playerData = allPlayers.find((player) => player.id === playerId);
    if (playerData) {
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
        {/* Predictions Table */}
        <div className="mb-8">
          <h3 className="text-2xl text-center mb-4">2024 QB Predicted Career AV</h3>
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black px-4 py-2">Rank</th>
                <th className="border border-black px-4 py-2">Name</th>
                <th className="border border-black px-4 py-2">Prediction</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((pred, index) => (
                <tr key={index} style={{ backgroundColor: '#E5E7EB' }}>
                  <td className="border border-black px-4 py-2">{index + 1}</td>
                  <td className="border border-black px-4 py-2">{pred.name}</td>
                  <td className="border border-black px-4 py-2">{pred.prediction_2024}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Full Player List */}
        <div className="mb-8">
          <h3 className="text-2xl text-center mb-4">Full Player List</h3>
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
                    <p className="text-lg">Player Rating (Career AV):</p>
                    <p className="text-3xl font-medium">{player.career_av}</p>
                  </div>
                  <button className="w-12 h-12 border-4 border-black rounded">→</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LargeList;
