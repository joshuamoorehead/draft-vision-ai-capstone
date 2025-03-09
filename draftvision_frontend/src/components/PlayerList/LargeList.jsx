import React, { useState, useEffect } from 'react';
import { fetchPlayers } from '../../services/api';
import Papa from 'papaparse';
import PlayerCard from "./PlayerCard";
import PageTransition from '../Common/PageTransition';

const LargeList = () => {
  const [position, setPosition] = useState(''); // Selected position
  const [allPlayers, setAllPlayers] = useState([]); // All players data
  const [filteredPlayers, setFilteredPlayers] = useState([]); // Filtered players
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
        const fetchedPlayers = data?.results || data || dummyPlayers;

        // Sort players by career_av in descending order
        const sortedPlayers = [...fetchedPlayers].sort((a, b) => b.career_av - a.career_av);

        setAllPlayers(sortedPlayers);
        setFilteredPlayers(sortedPlayers); // Initially display all players
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
      setFilteredPlayers(allPlayers.filter((player) => player.position.includes(position)));
    } else {
      setFilteredPlayers(allPlayers);
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
  
  const handleCloseCard = () => {
    setSelectedPlayer(null); // Close the card
  };

  // Get position color for badges
  const getPositionColor = (pos) => {
    if (pos.includes('QB')) return 'from-red-500 to-red-600';
    if (pos.includes('RB')) return 'from-blue-500 to-blue-600';
    if (pos.includes('WR')) return 'from-green-500 to-green-600';
    if (pos.includes('TE')) return 'from-yellow-500 to-yellow-600';
    return 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center">
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white border-opacity-20 text-center">
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-12 w-12 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading Players</h2>
            <p className="text-gray-300">Please wait while we fetch player data.</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center">
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white border-opacity-20 text-center max-w-md">
            <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Error Loading Data</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 relative overflow-hidden">
        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
              Player <span className="text-blue-400">Rankings</span>
            </h1>
            <div className="h-1 w-32 bg-blue-400 mx-auto rounded my-4"></div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Explore top college football prospects and their predicted NFL success
            </p>
          </div>

          {/* Predictions Table */}
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white border-opacity-20 mb-10 max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">2024 QB Predicted Career AV</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900 bg-opacity-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Prediction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {predictions.map((pred, index) => (
                    <tr key={index} className="bg-gray-800 bg-opacity-30 hover:bg-gray-700 hover:bg-opacity-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-200">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{pred.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-400 font-bold">{pred.prediction_2024}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Player List Section */}
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white border-opacity-20 mb-10 max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Player Rankings</h3>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Filters Panel */}
              <div className="md:w-64 bg-gray-900 bg-opacity-50 rounded-lg p-5 h-fit">
                <h4 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-gray-700">Filters</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Position</label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {filteredPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden border border-gray-700 hover:bg-opacity-70 transition duration-200 transform hover:scale-[1.02] cursor-pointer"
                    onClick={() => handlePlayerSelect(player.id)}
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getPositionColor(player.position)} flex items-center justify-center mr-3 text-xs font-bold`}>
                            {player.position}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white">{player.name}</h3>
                            <p className="text-gray-300">{player.school}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Career AV</p>
                        <p className="text-2xl font-bold text-blue-400">{player.career_av}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Player Detail Modal */}
        {selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm">
            <div className="bg-gray-900 bg-opacity-90 rounded-xl shadow-2xl border border-blue-500 border-opacity-30 max-w-3xl w-full overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-3xl font-bold text-white">{selectedPlayer.name}</h2>
                  <button 
                    onClick={handleCloseCard}
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className={`h-32 w-32 mx-auto rounded-full bg-gradient-to-r ${getPositionColor(selectedPlayer.position)} flex items-center justify-center`}>
                      <span className="text-3xl font-bold text-white">{selectedPlayer.position}</span>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-xl text-blue-400">{selectedPlayer.school}</p>
                      <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-400">Career AV Rating</p>
                        <p className="text-4xl font-bold text-blue-400">{selectedPlayer.career_av}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3">
                    <h3 className="text-xl font-semibold text-white mb-2">Player Biography</h3>
                    <p className="text-gray-300">{selectedPlayer.biography}</p>
                    
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-400">Position</p>
                        <p className="text-lg font-semibold text-white">{selectedPlayer.position}</p>
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-400">School</p>
                        <p className="text-lg font-semibold text-white">{selectedPlayer.school}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-800 flex justify-end">
                <button 
                  onClick={handleCloseCard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Custom styling for animations */}
        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .bg-grid-pattern {
            background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 40px 40px;
          }
        `}</style>
      </div>
    </PageTransition>
  );
};

export default LargeList;