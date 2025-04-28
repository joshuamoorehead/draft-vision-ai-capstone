import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/api';
import { fetchPlayerStats } from '../../services/api';

import PageTransition from '../Common/PageTransition';
import PlayerCard from './PlayerCard';

/**
 * PlayerView component for displaying a player's profile and stats
 * allows us to have a page for each player in the Player list, can copy/paste url to share 
 * calls player card component and passes in player and stats
 */
const PlayerView = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlayer = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all players first
        const { data: players, error: playersError } = await supabase
          .from('db_playerprofile')
          .select('*')
          .order('draft_round', { ascending: true })
          .order('draft_pick', { ascending: true });

        if (playersError) throw playersError;

        setAllPlayers(players);

        // Find the specific player
        const foundPlayer = players.find(p => p.id === parseInt(playerId));
        if (!foundPlayer) {
          throw new Error('Player not found');
        }
        setPlayer(foundPlayer);
        const playerStats = await fetchPlayerStats(foundPlayer.id, foundPlayer.position);
        setStats(playerStats);
      } catch (err) {
        console.error('Error loading player:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPlayer();
  }, [playerId]);

  // Handle bio generation
  const handleBioGenerated = (playerId, generatedBio) => {
    setPlayer(prev => ({
      ...prev,
      bio: generatedBio
    }));
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center">
          <div className="text-white text-2xl flex flex-col items-center">
            <svg className="animate-spin mb-4 h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Loading player...</p>
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
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-2xl font-bold mb-4 text-white">Error Loading Player</h2>
            <p className="mb-4 text-gray-300">{error}</p>
            <button
              onClick={() => navigate('/playerlist')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              Return to List
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/playerlist')}
            className="mb-6 text-white hover:text-blue-400 transition-colors duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to List
          </button>
          <div className="bg-gray-800 bg-opacity-70 p-6 rounded-2xl shadow-2xl border border-indigo-500 border-opacity-30">
            <PlayerCard
              player={player}
              stats={stats}
              players={allPlayers}
              onBioGenerated={handleBioGenerated}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PlayerView; 