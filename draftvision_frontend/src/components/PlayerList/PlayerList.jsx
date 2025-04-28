import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPlayers, fetchPlayerStats, generatePlayerBio } from '../../services/api';
import Papa from 'papaparse';
import { dvailogo } from '../Logos';
import '../../styles/main.css';
import PlayerCard from './PlayerCard';
// Import supabase so we can subscribe to realtime changes
import { supabase } from '../../services/api';
import PageTransition from '../Common/PageTransition';

/**
 * Player List component for the player list page
 * displays all players in a grid
 * allows us to filter by position, team, and years
 * calls player card component and passes in player and stats
 */
const PlayerList = () => {
  const [position, setPosition] = useState('');
  const [team, setTeam] = useState('');
  const [years, setYears] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlayerStats, setSelectedPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  // Fetch players and predictions on mount.
  useEffect(() => {
    // Set a timeout to prevent perpetual loading
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Request timed out. Please try refreshing the page.");
      }
    }, 15000); // 15-second timeout

    const loadPlayers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchPlayers();
        const fetchedPlayers = data.results || data;
        
        if (!fetchedPlayers || fetchedPlayers.length === 0) {
          throw new Error("No players found in the database");
        }
        
        // Sort by career_av descending
        fetchedPlayers.sort((a, b) => b.career_av - a.career_av);
        setAllPlayers(fetchedPlayers);
        setPlayers(fetchedPlayers);
      } catch (err) {
        console.error("Error loading players:", err);
        setError(err.message || "Failed to load player data");
      } finally {
        setLoading(false);
        
        // Clear the timeout since we got a response
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    const loadPredictions = async () => {
      try {
        const response = await fetch('/2024pred.csv');
        if (!response.ok) {
          console.warn("Failed to load predictions CSV:", response.status);
          return;
        }
        
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { 
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        if (parsed.errors && parsed.errors.length > 0) {
          console.warn("CSV parsing had errors:", parsed.errors);
        }
        
        setPredictions(parsed.data || []);
      } catch (err) {
        console.error('Failed to load predictions:', err.message);
        // Non-critical, so we don't set main error state
      }
    };

    loadPlayers();
    loadPredictions();
    
    // Cleanup function to clear timeout if component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Filtering effect based on position, team, and years.
  useEffect(() => {
    let filteredPlayers = allPlayers;
    if (position) {
      filteredPlayers = filteredPlayers.filter((player) =>
        player.position?.toLowerCase().includes(position.toLowerCase())
      );
    }
    if (team) {
      filteredPlayers = filteredPlayers.filter((player) => {
        const playerTeam = player.school?.toLowerCase() || '';
        return playerTeam.includes(team.toLowerCase());
      });
    }
    if (years.length > 0) {
      filteredPlayers = filteredPlayers.filter((player) => {
        const playerYears = Array.isArray(player.years_ncaa)
          ? player.years_ncaa.join(', ')
          : typeof player.years_ncaa === 'string'
          ? player.years_ncaa
          : '';
        return years.some((year) => playerYears.includes(year));
      });
    }
    setPlayers(filteredPlayers);
  }, [position, team, years, allPlayers]);

  // Realtime subscription to listen for updates on the player profile table.
  useEffect(() => {
    const channel = supabase
      .channel('public:db_playerprofile')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'db_playerprofile',
        },
        (payload) => {
          setAllPlayers(prev =>
            prev.map((player) =>
              player.id === payload.new.id ? payload.new : player
            )
          );
          setPlayers(prev =>
            prev.map((player) =>
              player.id === payload.new.id ? payload.new : player
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePlayerSelect = (playerId) => {
    navigate(`/playerlist/${playerId}`);
  };

  // Callback to update a player's bio when it is generated.
  const handleBioGenerated = (playerId, generatedBio) => {
    setAllPlayers(prev =>
      prev.map(player =>
        player.id === playerId ? { ...player, bio: generatedBio } : player
      )
    );
    setPlayers(prev =>
      prev.map(player =>
        player.id === playerId ? { ...player, bio: generatedBio } : player
      )
    );
  };

  const closePopup = () => {
    setSelectedPlayer(null);
    setSelectedPlayerStats(null);
  };

  // Loading state with spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-800 to-indigo-900 flex items-center justify-center">
                    <div className="bg-slate-800 bg-opacity-50 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg text-center border border-amber-500 border-opacity-30">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white">Loading players...</h2>
          <p className="text-gray-200 mt-2">Please wait while we fetch player data.</p>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center">
                    <div className="bg-slate-800 bg-opacity-50 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg text-center max-w-md border border-rose-500 border-opacity-30">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-200 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-rose-600 text-white font-medium rounded-lg shadow-lg hover:from-amber-600 hover:to-rose-700 focus:ring-4 focus:ring-amber-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const availableYears = Array.from(
    new Set(
      allPlayers.flatMap((player) =>
        Array.isArray(player.years_ncaa)
          ? player.years_ncaa.map((y) => String(y).trim())
          : typeof player.years_ncaa === 'string'
          ? player.years_ncaa.split(',').map((y) => String(y).trim())
          : []
      )
    )
  ).sort();

  return (
    <PageTransition>
      {/* Main Container with animated gradient background */}
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 relative overflow-hidden">
        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-10 right-20 w-64 h-64 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-40 right-0 w-72 h-72 bg-rose-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="relative mb-10 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
              Player <span className="relative">
                <span className="relative z-10">Directory</span>
                <span className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 to-amber-500 opacity-75 z-0"></span>
              </span>
            </h1>
            <div className="h-1 w-24 bg-amber-400 rounded mx-auto mt-4"></div>
            <p className="text-xl text-gray-200 mt-6 max-w-3xl mx-auto">
              Discover detailed profiles and statistics of top NFL prospects from colleges across the nation.
            </p>
          </div>
          
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filters Panel */}
              <div className="w-full lg:w-80 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-6 rounded-xl shadow-lg border border-amber-500 border-opacity-20 self-start hover:border-opacity-30 transition-all duration-300">
                <h3 className="text-center text-2xl font-semibold mb-6 text-white">Filters</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Position</label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full p-2 bg-white bg-opacity-20 border border-white border-opacity-30 text-black placeholder-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="">All Positions</option>
                      <option value="QB">Quarterback (QB)</option>
                      <option value="RB">Running Back (RB)</option>
                      <option value="WR">Wide Receiver (WR)</option>
                      <option value="TE">Tight End (TE)</option>
                      <option value="OL">Offensive Line (OL)</option>
                      <option value="DL">Defensive Line (DL)</option>
                      <option value="LB">Linebacker (LB)</option>
                      <option value="DB">Defensive Back (DB)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Team</label>
                    <input
                      type="text"
                      value={team}
                      onChange={(e) => setTeam(e.target.value)}
                      className="w-full p-2 bg-white bg-opacity-20 border border-white border-opacity-30 text-black rounded-lg placeholder-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="Enter team name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Years</label>
                    <div className="max-h-48 overflow-y-auto bg-slate-800 bg-opacity-50 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-y-2">
                        {availableYears.map((year) => (
                          <label key={year} className="checkbox-label flex items-center text-gray-200">
                            <input
                              type="checkbox"
                              value={year}
                              checked={years.includes(year)}
                              onChange={(e) => {
                                const selectedYear = e.target.value;
                                setYears((prevYears) =>
                                  prevYears.includes(selectedYear)
                                    ? prevYears.filter((y) => y !== selectedYear)
                                    : [...prevYears, selectedYear]
                                );
                              }}
                              className="mr-2 form-checkbox text-blue-500 focus:ring-blue-500 focus:ring-opacity-50"
                            />
                            <span>{year}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Players List */}
              <div className="flex-1">
                {players.length > 0 ? (
                  <div className="space-y-4">
                    {players.map((player, index) => (
                      <div
                        key={player.id}
                        className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-20 rounded-xl shadow-lg p-4 flex items-center cursor-pointer hover:bg-white hover:bg-opacity-20 transition-colors transform transition-transform hover:scale-[1.01] duration-200"
                        onClick={() => handlePlayerSelect(player.id)}
                      >
                        <div className="w-12 h-12 flex items-center justify-center bg-slate-700 text-white rounded-full mr-4 font-bold shadow-lg">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-medium text-white">{player.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-sm bg-slate-700 bg-opacity-60 px-2 py-1 rounded-md text-gray-200">{player.school}</span>
                            <span className={`text-sm px-2 py-1 rounded-md text-white ${
                              player.position === 'QB' ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                              player.position === 'RB' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                              player.position === 'WR' ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                              player.position === 'TE' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                              player.position === 'OL' ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 
                              player.position === 'DL' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' : 
                              player.position === 'LB' ? 'bg-gradient-to-r from-pink-500 to-pink-600' : 
                              player.position === 'DB' ? 'bg-gradient-to-r from-teal-500 to-teal-600' : 
                              'bg-gradient-to-r from-gray-500 to-gray-600'
                            }`}>{player.position}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-300">Player Rating</p>
                          <p className={`text-2xl font-bold ${
                            player.career_av >= 90 ? "text-emerald-400" :
                            player.career_av >= 80 ? "text-amber-400" :
                            player.career_av >= 70 ? "text-rose-400" :
                            "text-gray-400"
                          }`}>{player.career_av}</p>
                        </div>
                        <div className="ml-4 w-10 h-10 flex items-center justify-center bg-white bg-opacity-20 rounded-full group-hover:bg-opacity-30 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-20 rounded-xl shadow-lg p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-200">No players match your filter criteria. Try adjusting your filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Popup for Selected Player using PlayerCard with glassmorphism effect */}
        {selectedPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border border-amber-500 border-opacity-30">
              <button
                className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors"
                onClick={closePopup}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {loadingStats ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mb-4"></div>
                  <p className="text-gray-200">Loading player stats...</p>
                </div>
              ) : (
                <PlayerCard
                  player={selectedPlayer}
                  stats={selectedPlayerStats}
                  onBioGenerated={handleBioGenerated}
                  players={players}
                />
              )}
            </div>
          </div>
        )}

        {/* Add custom styling for animations */}
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

export default PlayerList;