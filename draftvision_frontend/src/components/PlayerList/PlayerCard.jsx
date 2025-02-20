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

  const renderProfileView = () => (
    <div>
      <h2 className="text-3xl font-bold mb-4">{player.name}</h2>
      <p className="text-lg mb-2">
        <span className="font-semibold">Position:</span> {player.position}
      </p>
      <p className="text-lg mb-2">
        <span className="font-semibold">School:</span> {player.school}
      </p>
      <p className="text-lg mb-2">
        <span className="font-semibold">Years in NCAA:</span>{' '}
        {Array.isArray(player.years_ncaa)
          ? player.years_ncaa.join(', ')
          : typeof player.years_ncaa === 'string'
          ? player.years_ncaa.split(',').map((y) => y.trim()).join(', ')
          : 'N/A'}
      </p>
      <p className="text-lg mb-2">
        <span className="font-semibold">Year Drafted:</span> {player.year_drafted || 'N/A'}
      </p>
      <p className="text-lg mb-2">
        <span className="font-semibold">Draft Round:</span> {player.draft_round || 'N/A'}
      </p>
      <p className="text-lg mb-2">
        <span className="font-semibold">Draft Pick Age:</span> {player.draft_pick_age || 'N/A'}
      </p>
      <p className="text-lg mb-2">
        <span className="font-semibold">Value at Draft:</span> {player.draft_av || 'N/A'}
      </p>
    </div>
  );

  const renderStatsView = () => {
    if (!stats || stats.length === 0) {
      return <p className="text-lg">No stats available.</p>;
    }
    return (
      <div>
        <h3 className="text-2xl font-bold mb-4">Player Stats</h3>
        {stats.map((stat, index) => (
          <div key={index} className="mb-4 border-b pb-2">
            <p className="font-semibold">Season: {stat.year || 'N/A'}</p>
            {player.position.toLowerCase() === 'qb' && (
              <div>
                <p className="text-lg">Passing Yards per Game: {stat.yds_g}</p>
                <p className="text-lg">Ratings: {stat.ratings}</p>
                <p className="text-lg">Awards: {stat.awards}</p>
              </div>
            )}
            {['rb', 'wr', 'te'].includes(player.position.toLowerCase()) && (
              <div>
                <p className="text-lg">Awards: {stat.awards}</p>
                <p className="text-lg">Conference ID: {stat.conference_id}</p>
                <p className="text-lg">Team ID: {stat.team_id}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderBiographyView = () => (
    <div>
      <h3 className="text-2xl font-bold mb-4">Biography</h3>
      <p className="text-lg">{bio || "Loading biography..."}</p>
    </div>
  );

  const renderViewToggles = () => (
    <div className="flex flex-col space-y-4 bg-gray-100 p-4">
      <button
        className={`py-2 px-4 rounded transition-colors ${
          activeView === 'profile'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-300 text-gray-800'
        }`}
        onClick={() => setActiveView('profile')}
      >
        Profile
      </button>
      <button
        className={`py-2 px-4 rounded transition-colors ${
          activeView === 'stats'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-300 text-gray-800'
        }`}
        onClick={() => setActiveView('stats')}
      >
        Stats
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
    <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-xl overflow-hidden w-[800px] h-[400px]">
      <div className="flex-1 p-6 overflow-y-auto">
        {activeView === 'profile'
          ? renderProfileView()
          : activeView === 'stats'
          ? renderStatsView()
          : renderBiographyView()}
      </div>
      <div className="md:w-32">{renderViewToggles()}</div>
    </div>
  );
};

export default PlayerCard;
