// components/PlayerCard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { generatePlayerBio } from '../../services/api';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

const PlayerCard = ({ player, stats, onBioGenerated, players }) => {
  const [activeView, setActiveView] = useState('profile');
  // Initialize bio state from player.bio if available.
  const [bio, setBio] = useState(player.bio || '');
  // Prevent multiple requests within the same session.
  const bioRequestedRef = useRef(false);

  useEffect(() => {
    if (activeView === 'biography' && !bio && !bioRequestedRef.current) {
      bioRequestedRef.current = true;
      const fetchBio = async () => {
        try {
          const generatedBio = await generatePlayerBio(player);
          if (generatedBio) {
            setBio(generatedBio);
            // Notify the parent so that the player's data is updated with the new bio.
            if (onBioGenerated) {
              onBioGenerated(player.id, generatedBio);
            }
          }
        } catch (err) {
          console.error("Error generating bio:", err.message);
        }
      };
      fetchBio();
    }
  }, [activeView, bio, player, onBioGenerated]);

  // Get position color
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
      if (pos?.toLowerCase().includes(key.toLowerCase())) {
        return positionColors[key];
      }
    }
    return 'from-gray-500 to-gray-600';
  };

  // Get NFL team color
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

  // shows default profile tab.
  const renderProfileView = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <div className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center bg-gradient-to-br ${getPositionColor(player.position)} text-white text-xl font-bold`}>
          {player.position}
        </div>
        <div className="ml-4">
          <h2 className="text-3xl font-bold text-gray-100">{player.name}</h2>
          <div className="flex items-center mt-1">
            <span className={`px-3 py-1 rounded-full text-sm text-white font-medium bg-gradient-to-r ${getNFLTeamColor(player.nfl_team)}`}>
              {player.nfl_team || 'Undrafted'}
            </span>
            <span className="ml-2 text-gray-400">
              Round {player.draft_round || 'N/A'} Pick {player.draft_pick || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm font-medium mb-2">School</h3>
          <p className="text-white text-lg font-medium">{player.school}</p>
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Years in NCAA</h3>
          <p className="text-white text-lg font-medium">
            {Array.isArray(player.years_ncaa)
              ? player.years_ncaa.join(', ')
              : typeof player.years_ncaa === 'string'
              ? player.years_ncaa.split(',').map((y) => y.trim()).join(', ')
              : 'N/A'}
          </p>
        </div>
      </div>

      <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
        <h3 className="text-gray-400 text-sm font-medium mb-2">Player Rating</h3>
        <div className="flex items-center">
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" 
              style={{ width: `${Math.min(100, (player.predictions?.xAV || 0) * 8)}%` }}
            ></div>
          </div>
          <span className="ml-3 text-xl font-bold text-blue-400">{player.predictions?.xAV?.toFixed(1) || 'N/A'}</span>
        </div>
        <p className="text-gray-400 text-xs mt-1">Expected Value (xAV)</p>
      </div>

      <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
        <h3 className="text-white text-lg font-medium mb-2">Draft Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Year Drafted</p>
            <p className="text-white">{player.year_drafted || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Position</p>
            <p className="text-white">{player.position}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // the "stats" tab of the card. custom-made for each position group 
  const renderStatsView = () => {
    if (!stats || stats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg text-gray-400">No stats available for this player.</p>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-2xl font-bold mb-6 text-white">Player Statistics</h3>
        <div className="space-y-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-white font-bold text-lg">Season {stat.year || 'N/A'}</h4>
                {stat.awards && (
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs rounded-full font-medium">
                    {stat.awards}
                  </span>
                )}
              </div>
              
              {player.position.toLowerCase() === 'qb' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Passing Yards/Game</p>
                    <p className="text-white font-medium">{stat.yds_g}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Passing TDs</p>
                    <p className="text-white font-medium">{stat.td}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Passer Rating</p>
                    <p className="text-white font-medium">{stat.ratings}</p>
                  </div>
                </div>
              )}
              
              {['rb'].includes(player.position.toLowerCase()) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Rushing Yards/Game</p>
                    <p className="text-white font-medium">{stat.rush_ypg}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Rushing TDs</p>
                    <p className="text-white font-medium">{stat.rush_td}</p>
                  </div>
                </div>
              )}
              
              {['wr', 'te'].includes(player.position.toLowerCase()) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Yards/Game</p>
                    <p className="text-white font-medium">{stat.ypg}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Touchdowns</p>
                    <p className="text-white font-medium">{stat.td}</p>
                  </div>
                </div>
              )}
              
              {['ol', 'ot', 'g', 'c', 'og', 't'].includes(player.position.toLowerCase()) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Rushing Yards</p>
                    <p className="text-white font-medium">{stat.rush_yds}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Rushing First Downs</p>
                    <p className="text-white font-medium">{stat.rush_first_downs}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Rushing TDs</p>
                    <p className="text-white font-medium">{stat.rush_td}</p>
                  </div>
                </div>
              )}
              
              {['dl', 'de', 'dt', 'nt'].includes(player.position.toLowerCase()) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Tackles For Loss</p>
                    <p className="text-white font-medium">{stat.TFL}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Sacks</p>
                    <p className="text-white font-medium">{stat.sacks}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">QB Hurries</p>
                    <p className="text-white font-medium">{stat.hur}</p>
                  </div>
                </div>
              )}
              
              {['lb', 'ilb', 'olb'].includes(player.position.toLowerCase()) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Tackles For Loss</p>
                    <p className="text-white font-medium">{stat.TFL}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Sacks</p>
                    <p className="text-white font-medium">{stat.sacks}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Tackles</p>
                    <p className="text-white font-medium">{stat.tot}</p>
                  </div>
                </div>
              )}
              
              {['db','cb', 's'].includes(player.position.toLowerCase()) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Pass Deflections</p>
                    <p className="text-white font-medium">{stat.pd}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Tackles</p>
                    <p className="text-white font-medium">{stat.tot}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Touchdowns</p>
                    <p className="text-white font-medium">{stat.td}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // not implemented yet- api issues 
  const renderBiographyView = () => (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-white">Biography</h3>
      {bio ? (
        <p className="text-gray-300 leading-relaxed">{bio}</p>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
          <p className="text-gray-400 mt-4">Generating player biography...</p>
        </div>
      )}
    </div>
  );

  // Impact Graph tab. 
  const renderImpactGraph = () => {
    const filteredPlayers = players.filter(p => p.position === player.position); 
    const data = filteredPlayers.map(p => ({
      draftPosition: p.draft_pick,
      impactRating: p.predictions?.xAV || 5,
      name: p.name,
      id: p.id
    }));

    return (
      <div className="h-full">
        <h3 className="text-2xl font-bold mb-4 text-white">Impact Analysis</h3>
        <p className="text-gray-400 mb-4">
          This graph shows the projected impact of all {player.position} players in relation to their draft position.
        </p>
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 60, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                type="number" 
                dataKey="draftPosition" 
                name="Draft Position" 
                label={{ value: "Draft Position", position: "bottom", fill: "#9CA3AF" }} 
                reversed 
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                type="number" 
                dataKey="impactRating" 
                name="Impact Rating" 
                label={{ value: "Impact Rating", angle: -90, position: "left", fill: "#9CA3AF" }} 
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: "3 3" }} 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="bg-gray-800 p-2 border border-gray-700 rounded shadow-lg">
                        <p className="text-white"><strong>Name:</strong> {dataPoint.name}</p>
                        <p className="text-gray-300"><strong>Draft Position:</strong> {dataPoint.draftPosition}</p>
                        <p className="text-blue-400"><strong>Impact Rating:</strong> {dataPoint.impactRating?.toFixed(1)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              <Scatter name="Players" data={data} fill="#6366F1" opacity={0.7} />
              
              {player && (
                <Scatter
                  name="Selected Player"
                  data={[{
                    draftPosition: player.draft_pick,
                    impactRating: player.predictions?.xAV,
                    name: player.name
                  }]}
                  fill="#EF4444"
                  shape="circle"
                  r={8}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center mt-4 text-sm text-gray-400">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></div>
            <span>Other {player.position}s</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span>{player.name}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderViewToggles = () => (
    <div className="bg-gray-800 bg-opacity-50 rounded-xl p-5 flex flex-col space-y-3 h-full">
      <button
        className={`py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
          activeView === 'profile'
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
            : 'bg-gray-700 bg-opacity-70 text-gray-300 hover:bg-opacity-100'
        }`}
        onClick={() => setActiveView('profile')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Profile
      </button>
      <button
        className={`py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
          activeView === 'stats'
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
            : 'bg-gray-700 bg-opacity-70 text-gray-300 hover:bg-opacity-100'
        }`}
        onClick={() => setActiveView('stats')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Stats
      </button>
      <button 
        className={`py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
          activeView === 'impact' 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
          : 'bg-gray-700 bg-opacity-70 text-gray-300 hover:bg-opacity-100'
        }`} 
        onClick={() => setActiveView('impact')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        Impact
      </button>
      <button
        className={`py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
          activeView === 'biography'
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
            : 'bg-gray-700 bg-opacity-70 text-gray-300 hover:bg-opacity-100'
        }`}
        onClick={() => setActiveView('biography')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Bio
      </button>
      <button
        className={`py-2 px-4 rounded transition-colors ${
          activeView === 'biography'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-300 text-gray-800'
        }`}
        onClick={() => setActiveView('biography')}
      >
        Biography
      </button>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row bg-gray-900 bg-opacity-90 rounded-xl shadow-2xl border border-indigo-500 border-opacity-30 overflow-hidden w-full h-[500px]">
      <div className="flex-1 p-6 overflow-y-auto">
        {activeView === 'profile' ? renderProfileView()
        : activeView === 'stats' ? renderStatsView()
        : activeView === 'impact' ? renderImpactGraph()
        : renderBiographyView()}
      </div>
      <div className="md:w-48 p-2">{renderViewToggles()}</div>
    </div>
  );
};

export default PlayerCard;