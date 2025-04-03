import React, { useEffect, useState } from 'react';
import { fetch2024Players, fetchPlayerStats, generatePlayerBio } from '../../services/api';
import { supabase } from '../../services/api';
import PageTransition from '../Common/PageTransition';
import { useAuth } from '../../context/AuthContext';
import PlayerCard from './LLPlayerCard';

// Import logo images for the first ten players
import calebwilliams from '../Logos/CalebWilliams.png';
import drakemaye from '../Logos/DrakeMaye.jpg';
import joealt from '../Logos/JoeAlt.png';
import jadendaniels from '../Logos/JaydenDaniels.png';
import marvinharrison from '../Logos/MarvinHarrison.png';
import maliknabers from '../Logos/MalikNabers.png';
import jclatham from '../Logos/JCLatham.png';
import michaelpenix from '../Logos/MichaelPenix.png';
import romeodunze from '../Logos/RomeOdunze.png';
import jjmccarthy from '../Logos/JJMcCarthy.png';

// FlipCard Component
const FlipCard = ({ front, back }) => {
  const [flipped, setFlipped] = useState(false);

  // Prevent event propagation so clicking the image doesn't trigger the player box's onClick
  const handleFlip = (e) => {
    e.stopPropagation();
    setFlipped(!flipped);
  };

  return (
    <div className="flip-card" onClick={handleFlip}>
      <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
        <div className="flip-card-front">
          {front}
        </div>
        <div className="flip-card-back flex items-center justify-center">
          {back}
        </div>
      </div>
      <style jsx>{`
        .flip-card {
          perspective: 1000px;
          cursor: pointer;
          width: 12rem; /* Tailwind's w-48 */
          height: 16rem; /* Tailwind's h-64 */
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
        }
        .flip-card-back {
          transform: rotateY(180deg);
          background: white;
          color: black;
          padding: 1rem;
        }
        /* Remove transform transition from the image so the animation can take over */
        .flip-card-front img {
          transition: box-shadow 0.3s ease;
        }
        /* On hover, animate the image with a pop-out and shake effect */
        .flip-card-front img:hover {
          animation: popShake 0.5s infinite ease-in-out;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        @keyframes popShake {
          0% {
            transform: translateZ(30px) scale(1.1) translateX(0);
          }
          25% {
            transform: translateZ(30px) scale(1.1) translateX(-3px);
          }
          50% {
            transform: translateZ(30px) scale(1.1) translateX(3px);
          }
          75% {
            transform: translateZ(30px) scale(1.1) translateX(-3px);
          }
          100% {
            transform: translateZ(30px) scale(1.1) translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

const LargeList = () => {
  const { user } = useAuth();
  const [position, setPosition] = useState('');
  const [team, setTeam] = useState('');
  const [nflteam, setNflTeam] = useState('');
  const [allPlayers, setAllPlayers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlayerStats, setSelectedPlayerStats] = useState(null);

  // Dummy data as fallback (including a one-sentence description for each player)
  const dummyPlayers = [
    {
      id: 1,
      name: 'Travis Hunter',
      school: 'Colorado',
      position: 'WR/CB',
      draft_round: 1,
      draft_pick: 4,
      nfl_team: 'ARI',
      predictions: { xAV: 12.5 },
      biography: 'Travis Hunter is a highly regarded American football player known for his exceptional skills as both a wide receiver and cornerback.',
      description: 'Travis Hunter is an elite WR/CB from Colorado with remarkable versatility.',
    },
    {
      id: 2,
      name: 'Raheim Sanders',
      school: 'South Carolina',
      position: 'RB',
      draft_round: 2,
      draft_pick: 35,
      nfl_team: 'TEN',
      predictions: { xAV: 8.6 },
      biography: 'Explosive running back known for his combination of speed and power.',
      description: 'Raheim Sanders is a dynamic RB from South Carolina known for his speed.',
    },
    {
      id: 3,
      name: 'Kyle McCord',
      school: 'Syracuse',
      position: 'QB',
      draft_round: 3,
      draft_pick: 83,
      nfl_team: 'DAL',
      predictions: { xAV: 7.2 },
      biography: 'Former Ohio State quarterback known for his strong arm and pocket presence.',
      description: 'Kyle McCord is a poised QB from Syracuse with a powerful arm.',
    },
    {
      id: 4,
      name: 'Seven McGee',
      school: 'Albany',
      position: 'WR',
      draft_round: 5,
      draft_pick: 152,
      nfl_team: 'MIA',
      predictions: { xAV: 3.8 },
      biography: 'Dynamic playmaker with exceptional speed and agility.',
      description: 'Seven McGee is a fast and agile WR from Albany.',
    },
    {
      id: 5,
      name: 'Shedeur Sanders',
      school: 'Colorado',
      position: 'QB',
      draft_round: 1,
      draft_pick: 1,
      nfl_team: 'CHI',
      predictions: { xAV: 15.3 },
      biography: 'Talented quarterback who has shown exceptional leadership and passing ability.',
      description: 'Shedeur Sanders is a standout QB from Colorado with top-tier leadership.',
    },
  ];

  // Array of logos corresponding to the first ten players
  // Order: CalebWilliams, JaydenDaniels, DrakeMaye, MarvinHarrison, JoeAlt, MalikNabers, JCLatham, MichaelPenix, RomeOdunze, JJMcCarthy
  const playerLogos = [
    calebwilliams,
    jadendaniels,
    drakemaye,
    marvinharrison,
    joealt,
    maliknabers,
    jclatham,
    michaelpenix,
    romeodunze,
    jjmccarthy,
  ];

  // Load players on component mount
  useEffect(() => {
    const loadPlayers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching 2024 players...');
        let fetchedPlayers = [];
        try {
          const data = await fetch2024Players();
          if (data && data.length > 0) {
            fetchedPlayers = data;
            console.log('Players fetched successfully using fetch2024Players');
          } else {
            throw new Error('No data returned from fetch2024Players');
          }
        } catch (apiError) {
          console.warn('Could not fetch from fetch2024Players:', apiError);
          try {
            const { data, error } = await supabase
              .from('db_playerprofile')
              .select('*, db_predictions_2024(xAV)')
              .eq('year_drafted', 2024)
              .order('draft_round', { ascending: true })
              .order('draft_pick', { ascending: true });
            
            if (error) throw error;
            
            if (data && data.length > 0) {
              fetchedPlayers = data.map(player => ({
                ...player,
                predictions: player.db_predictions_2024 || {
                  xAV: parseFloat((11.31 / (player.draft_round + 0.5) + 1.51).toFixed(2))
                }
              }));
              console.log('Players fetched successfully using direct Supabase query');
            } else {
              throw new Error('No data returned from Supabase query');
            }
          } catch (supabaseError) {
            console.warn('Could not fetch from Supabase:', supabaseError);
            throw new Error('Failed to fetch player data from all sources');
          }
        }
  
        if (!fetchedPlayers || fetchedPlayers.length === 0) {
          console.warn('No player data received from any source, using dummy data');
          fetchedPlayers = dummyPlayers;
        }
  
        // Sort by draft order
        fetchedPlayers.sort((a, b) => {
          if (a.draft_round !== b.draft_round) {
            return a.draft_round - b.draft_round;
          }
          return a.draft_pick - b.draft_pick;
        });
  
        setAllPlayers(fetchedPlayers);
        setPlayers(fetchedPlayers);
      } catch (err) {
        console.error('Error loading players:', err);
        setError(err.message || 'Failed to load player data');
        setAllPlayers(dummyPlayers);
        setPlayers(dummyPlayers);
      } finally {
        setLoading(false);
      }
    };
  
    loadPlayers();
  }, []);
  
  // Filter players when filters change
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
    
    if (nflteam) {
      filteredPlayers = filteredPlayers.filter((player) => {
        const playerNFLTeam = player.nfl_team?.toLowerCase() || '';
        return playerNFLTeam.includes(nflteam.toLowerCase());
      });
    }
    
    setPlayers(filteredPlayers);
  }, [position, team, nflteam, allPlayers]);
  
  // Handle player selection (to open modal)
  const handlePlayerSelect = async (playerId) => {
    const playerData = allPlayers.find((player) => player.id === playerId);
    if (playerData) {
      setSelectedPlayer(playerData);
      try {
        const stats = await fetchPlayerStats(playerId, playerData.position);
        setSelectedPlayerStats(stats);
      } catch (err) {
        console.error('Error fetching player stats:', err.message);
        setSelectedPlayerStats(null);
      }
    } else {
      console.error('Player not found:', playerId);
    }
  };
  
  // Callback to update a player's bio when it is generated
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
  
  // Close player popup
  const closePopup = () => {
    setSelectedPlayer(null);
    setSelectedPlayerStats(null);
  };
  
  // Get position color based on position string
  const getPositionColor = (pos) => {
    const positionColors = {
      'QB': 'from-red-500 to-red-600',
      'RB': 'from-blue-500 to-blue-600',
      'WR': 'from-green-500 to-green-600',
      'TE': 'from-yellow-500 to-yellow-600',
      'OL': 'from-purple-500 to-purple-600',
      'DL': 'from-indigo-500 to-indigo-600',
      'LB': 'from-pink-500 to-pink-600',
      'DB': 'from-teal-500 to-teal-600',
    };
    
    for (const key in positionColors) {
      if (pos?.includes(key)) {
        return positionColors[key];
      }
    }
    return 'from-gray-500 to-gray-600';
  };
  
  // Get NFL team color based on team string
  const getNFLTeamColor = (team) => {
    const teamColors = {
      'ARI': 'from-red-600 to-red-800',
      'ATL': 'from-red-600 to-black',
      'BAL': 'from-purple-800 to-black',
      'BUF': 'from-blue-600 to-red-600',
      'CAR': 'from-blue-600 to-black',
      'CHI': 'from-blue-800 to-orange-600',
      'CIN': 'from-orange-500 to-black',
      'CLE': 'from-orange-600 to-brown-700',
      'DAL': 'from-blue-800 to-gray-400',
      'DEN': 'from-orange-600 to-blue-800',
      'DET': 'from-blue-600 to-gray-500',
      'GB': 'from-green-600 to-yellow-500',
      'HOU': 'from-blue-800 to-red-600',
      'IND': 'from-blue-600 to-white',
      'JAX': 'from-teal-500 to-black',
      'KC': 'from-red-600 to-yellow-500',
      'LAC': 'from-blue-500 to-yellow-400',
      'LA': 'from-blue-600 to-yellow-500',
      'LAR': 'from-blue-600 to-yellow-500',
      'LV': 'from-black to-gray-500',
      'LVR': 'from-black to-gray-500',
      'MIA': 'from-teal-500 to-orange-500',
      'MIN': 'from-purple-700 to-yellow-400',
      'NE': 'from-blue-800 to-red-600',
      'NO': 'from-black to-gold-500',
      'NYG': 'from-blue-700 to-red-600',
      'NYJ': 'from-green-700 to-white',
      'PHI': 'from-green-700 to-gray-300',
      'PIT': 'from-black to-yellow-500',
      'SF': 'from-red-700 to-gold-500',
      'SEA': 'from-blue-600 to-green-500',
      'TB': 'from-red-700 to-gray-500',
      'TEN': 'from-blue-700 to-red-600',
      'WAS': 'from-red-800 to-yellow-500',
    };
    
    for (const key in teamColors) {
      if (team?.includes(key)) {
        return teamColors[key];
      }
    }
    return 'from-gray-600 to-gray-800';
  };
  
  // Get rating color class based on a numeric rating
  const getRatingColorClass = (rating) => {
    if (!rating) return 'text-gray-600';
    if (rating >= 10) return 'text-green-600';
    if (rating >= 7) return 'text-blue-600';
    if (rating >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center">
        <div className="text-white text-2xl flex flex-col items-center">
          <svg className="animate-spin mb-4 h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Loading players...</p>
          <p className="text-sm text-gray-300 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }
  
  if (error && (!players || players.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center">
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white border-opacity-20 text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="text-2xl font-bold mb-4 text-white">Error Loading Players</h2>
          <p className="mb-4 text-gray-300">{error}</p>
          <p className="mb-4 text-gray-300">Please try again later or contact support if the issue persists.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 relative">
        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>
  
        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center mb-10">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">
              2024 Draft <span className="text-blue-400">Analysis</span>
            </h3>
            <div className="h-1 w-32 bg-blue-400 mx-auto rounded my-4"></div>
            <h4 className="text-xl text-gray-200 max-w-3xl mx-auto">
              Predicting the impact and performance of the newest NFL draft class using our advanced AI models
            </h4>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
            {/* Filters Panel */}
            <div className="w-full md:w-80 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-white border-opacity-20 p-6 self-start sticky top-4">
              <h3 className="text-center text-xl font-bold mb-6 text-white">Filter Players</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Position</label>
                  <div className="relative">
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full appearance-none bg-gray-800 bg-opacity-50 border border-gray-600 text-white py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Filtering for NCAA Team */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">College</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={team}
                      onChange={(e) => setTeam(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                      placeholder="Enter NCAA team name"
                    />
                  </div>
                </div>
                
                {/* Filtering for NFL Team */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">NFL Team</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={nflteam}
                      onChange={(e) => setNflTeam(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                      placeholder="Enter NFL team name"
                    />
                  </div>
                </div>
                
                {/* Filter stats */}
                <div className="bg-gray-800 bg-opacity-40 rounded-lg p-4 mt-4">
                  <p className="text-gray-300 text-center">
                    Showing <span className="font-bold text-white">{players.length}</span> of <span className="font-bold text-white">{allPlayers.length}</span> players
                  </p>
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
                      className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg border border-white border-opacity-20 p-4 flex flex-col sm:flex-row sm:items-center cursor-pointer hover:bg-opacity-20 transition-all duration-300 transform hover:scale-[1.01]"
                      onClick={() => handlePlayerSelect(player.id)}
                    >
                      <div className="flex items-center mb-3 sm:mb-0">
                        <div className="w-12 h-12 flex items-center justify-center text-xl font-bold bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-full mr-4 shadow-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{player.name}</h3>
                          {/* Wrap the FlipCard in a container with margin-bottom for separation */}
                          {index < 10 && (
                            <div className="mb-4">
                              <FlipCard
                                front={
                                  <img
                                    src={playerLogos[index]}
                                    alt={`${player.name} logo`}
                                    className="w-48 h-64 my-2"
                                  />
                                }
                                back={
                                  <div className="p-4">
                                    <p className="text-sm">{player.description}</p>
                                  </div>
                                }
                              />
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-sm bg-gray-700 bg-opacity-70 px-2 py-1 rounded-lg text-gray-200">
                              {player.school}
                            </span>
                            <span className={`text-sm bg-gradient-to-r ${getPositionColor(player.position)} px-2 py-1 rounded-lg text-white font-medium`}>
                              {player.position}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1"></div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3 sm:mt-0">
                        <div className="text-center px-3 py-2 bg-gray-800 bg-opacity-70 rounded-lg">
                          <p className="text-xs text-gray-400">Draft Position</p>
                          <p className="text-white font-medium">Round {player.draft_round} Pick {player.draft_pick}</p>
                        </div>
                        <div className="text-center px-3 py-2 bg-gradient-to-r bg-opacity-70 rounded-lg sm:ml-4 min-w-[80px] border border-white border-opacity-10"
                          style={{
                            background: `linear-gradient(to right, ${player.nfl_team ? `#6366f1` : '#4b5563'}, ${player.nfl_team ? `#4f46e5` : '#374151'})`
                          }}
                        >
                          <p className="text-xs text-gray-200">NFL Team</p>
                          <p className="text-white font-bold">{player.nfl_team || 'N/A'}</p>
                        </div>
                        <div className="text-center px-3 py-2 bg-gray-800 bg-opacity-70 rounded-lg sm:ml-4">
                          <p className="text-xs text-gray-400">Expected Value</p>
                          <p className={`font-bold ${getRatingColorClass(player.predictions?.xAV)}`}>
                            {player.predictions?.xAV?.toFixed(1) || 'N/A'}
                          </p>
                        </div>
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-600 bg-opacity-70 rounded-full ml-2 transition-transform transform group-hover:translate-x-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg border border-white border-opacity-20 p-8 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-gray-300 text-lg">No players match your filter criteria.</p>
                  <p className="text-gray-400 mt-2">Try adjusting your filters to see more results.</p>
                  <button 
                    onClick={() => {
                      setPosition('');
                      setTeam('');
                      setNflTeam('');
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 bg-opacity-70 hover:bg-opacity-100 text-white rounded-lg transition-all duration-200"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Popup for Selected Player */}
        {selectedPlayer && (
          <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-black bg-opacity-90 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 bg-opacity-70 p-6 rounded-2xl shadow-2xl border border-indigo-500 border-opacity-30 w-full max-w-4xl max-h-[85vh] overflow-y-auto relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 bg-gray-800 bg-opacity-70 rounded-full p-2"
                onClick={() => closePopup()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <PlayerCard
                player={selectedPlayer}
                stats={selectedPlayerStats}
                onBioGenerated={handleBioGenerated}
                players={allPlayers}
              />
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
