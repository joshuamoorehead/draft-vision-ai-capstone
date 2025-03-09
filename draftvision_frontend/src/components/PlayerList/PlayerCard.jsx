// components/PlayerCard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { generatePlayerBio } from '../../services/api';

const PlayerCard = ({ player, stats, onBioGenerated }) => {
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
      'S': 'from-cyan-500 to-cyan-600',
      'CB': 'from-emerald-500 to-emerald-600'
    };
    
    if (!pos) return 'from-gray-500 to-gray-600';
    
    for (const key in positionColors) {
      if (pos.toLowerCase().includes(key.toLowerCase())) {
        return positionColors[key];
      }
    }
    return 'from-gray-500 to-gray-600';
  };

  const renderProfileView = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <div className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center bg-gradient-to-br ${getPositionColor(player.position)} text-white text-xl font-bold`}>
          {player.position}
        </div>
        <div className="ml-4">
          <h2 className="text-3xl font-bold text-gray-100">{player.name}</h2>
          <p className="text-blue-400">{player.school || 'Unknown School'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Year Drafted</h3>
          <p className="text-white text-lg font-medium">{player.year_drafted || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
        <h3 className="text-gray-400 text-sm font-medium mb-2">Draft Position</h3>
        <div className="flex items-center">
          <div className="bg-gray-700 px-3 py-1 rounded-lg">
            <span className="text-white font-medium">Round {player.draft_round || 'N/A'}</span>
          </div>
          <div className="mx-2 text-gray-500">•</div>
          <div className="bg-gray-700 px-3 py-1 rounded-lg">
            <span className="text-white font-medium">Pick {player.draft_pick || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      {player.nfl_team && (
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm font-medium mb-2">NFL Team</h3>
          <p className="text-white text-lg font-medium">{player.nfl_team}</p>
        </div>
      )}
    </div>
  );

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
                    <p className="text-gray-400 text-sm">Passer Rating</p>
                    <p className="text-white font-medium">{stat.ratings}</p>
                  </div>
                </div>
              )}
              
              {['rb', 'wr', 'te'].includes(player.position.toLowerCase()) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Conference</p>
                    <p className="text-white font-medium">{stat.conference_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Team</p>
                    <p className="text-white font-medium">{stat.team_id || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

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
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row bg-gray-900 bg-opacity-90 rounded-xl shadow-2xl border border-indigo-500 border-opacity-30 overflow-hidden w-full h-[500px]">
      <div className="flex-1 p-6 overflow-y-auto">
        {activeView === 'profile'
          ? renderProfileView()
          : activeView === 'stats'
          ? renderStatsView()
          : renderBiographyView()}
      </div>
      <div className="md:w-40 p-2">{renderViewToggles()}</div>
    </div>
  );
};

export default PlayerCard;