import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetch2024Players, fetchPlayers, fetchPlayerStats, generatePlayerBio, getPredictions } from '../../services/api';
import { dvailogo } from '../Logos';
import '../../styles/main.css';
import PlayerCard from './LLPlayerCard';


// creating variables
const LargeList = () => {
  const [position, setPosition] = useState(''); 
  const [team, setTeam] = useState(''); 
  const [nflteam, setNflTeam] = useState([]); 
  const [allPlayers, setAllPlayers] = useState([]); 
  const [players, setPlayers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlayerStats, setSelectedPlayerStats] = useState(null);
  const [extraPlayerData, setExtraPlayerData] = useState({});

  
// loads all players into the list
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const data = await fetch2024Players(); 
        const fetchedPlayers = data.results || data; 
        console.log('fetched successfully'); 
        fetchedPlayers.sort((a, b) => a.draft_pick - b.draft_pick);
        setAllPlayers(fetchedPlayers); 
        setPlayers(fetchedPlayers); 
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false); 
      }
    };
    loadPlayers(); 

  }, []);

  // filtering based on position, NFL Team, college
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
          const playerNFLTeam = player.nfl_team; 
          return playerNFLTeam.includes(nflteam); 
        });
      }
      setPlayers(filteredPlayers);
    }, [position, team, nflteam, allPlayers]);

  const handlePlayerSelect = async (playerId) => {
      const playerData = allPlayers.find((player) => player.id === playerId);
      if (playerData) {
        setSelectedPlayer(playerData);
        try {
          const stats = await fetchPlayerStats(playerId, playerData.position);
          setSelectedPlayerStats(stats);
        } catch (err) {
          console.error('Error fetching player stats:', err.message);
        }
      } else {
        console.error('Player not found:', playerId);
      }
    };


  // Callback to update a player's bio when it is generated -- not implemented yet 
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
            <Link to="/" className="text-2xl font-roboto-condensed opacity-50">Player List</Link>
            <Link to="/about" className="text-2xl font-roboto-condensed opacity-50">About Us</Link>
            <Link to="/mockdraft" className="text-2xl font-roboto-condensed opacity-50">Mock Draft</Link>
            <Link to="/largelist" className="text-2xl font-roboto-condensed underline">Large List</Link>
            <Link to="/playercompare" className="text-2xl font-roboto-condensed opacity-50">Player Comparison</Link>
            <Link to="/playerinput" className="text-2xl font-roboto-condensed opacity-50">Player Input</Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-8">
        <div className="mb-8">
          <h3 className="text-2xl text-center mb-4">2024 Draft Large List</h3>
          <h4 className='text-2x1 text-center mb-4'>Predicting the Impact of the Most Recent Draft Class</h4>
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
                    <option value="OL">Offensive Line (OL)</option>
                    <option value="DL">Defensive Line (DL)</option>
                    <option value="LB">Linebacker (LB)</option>
                    <option value="DB">Defensive Back (DB)</option>
                  </select>
                </div>
                {/*Filtering for NCAA Team  */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">College</label>
                  <input
                    type="text"
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="w-full p-2 border-2 border-black rounded bg-white"
                    placeholder="Enter NCAA team name"
                  />
                </div>
                {/* Filtering for NFL Team */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">NFL Team</label>
                  <input
                    type="text"
                    value={nflteam}
                    onChange={(e) => setNflTeam(e.target.value)}
                    className="w-full p-2 border-2 border-black rounded bg-white"
                    placeholder="Enter NFL team name"
                  />
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
                  <div className="w-16 text-center text-xl font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium">{player.name}</h3>
                    <p className="text-lg">{player.school}</p>
                    <p className="text-lg">{player.position}</p>
                  </div>
                  <div className="text-right mr-8">
                    <p className="text-xl font-medium">Round {player.draft_round} Pick {player.draft_pick} ({player.nfl_team})</p>
                    <p className="text-xl font-medium">Expected Yearly Impact Rating</p>
                    <p className="text-lg">{player.predictions.xAV}</p>
                  </div>
                  <button className="w-12 h-12 border-4 border-black rounded">
                    →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Popup for Selected Player using PlayerCard */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-4xl relative">
            <button
              className="absolute top-2 right-2 text-red-600 text-3xl font-bold cursor-pointer"
              onClick={closePopup}
            >
              ×
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
    </div>
  );


};

export default LargeList;
