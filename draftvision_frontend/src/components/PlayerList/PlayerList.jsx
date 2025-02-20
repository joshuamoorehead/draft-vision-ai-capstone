// components/PlayerList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPlayers, fetchPlayerStats, generatePlayerBio } from '../../services/api';
import Papa from 'papaparse';
import { dvailogo } from '../Logos';
import '../../styles/main.css';
import PlayerCard from './PlayerCard';
// Import supabase so we can subscribe to realtime changes
import { supabase } from '../../services/api';

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
  const [error, setError] = useState(null);

  // Fetch players and predictions on mount.
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const data = await fetchPlayers();
        const fetchedPlayers = data.results || data;
        console.log("Fetched players:", fetchedPlayers);
        // Sort by career_av descending
        fetchedPlayers.sort((a, b) => b.career_av - a.career_av);
        setAllPlayers(fetchedPlayers);
        setPlayers(fetchedPlayers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

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
          console.log('Player updated:', payload);
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
    <div className="min-h-screen bg-[#5A6BB0]">
      {/* Header */}
      <div className="w-full h-32 bg-black">
        <div className="container mx-auto px-4 h-full flex items-center">
          <img src={dvailogo} alt="Draft Vision AI Logo" className="h-32 w-32" />
          <div className="flex space-x-8 text-white ml-12">
            <Link to="/" className="text-2xl font-roboto-condensed underline">
              Player List
            </Link>
            <Link to="/about" className="text-2xl font-roboto-condensed opacity-50">
              About Us
            </Link>
            <Link to="/mockdraft" className="text-2xl font-roboto-condensed opacity-50">
              Mock Draft
            </Link>
            <Link to="/largelist" className="text-2xl font-roboto-condensed opacity-50">
              Large List
            </Link>
            <Link to="/PlayerCompare" className="text-2xl font-roboto-condensed opacity-50">
              Player Comparison
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-8">
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Team</label>
                  <input
                    type="text"
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="w-full p-2 border-2 border-black rounded bg-white"
                    placeholder="Enter team name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Years</label>
                  <div className="grid grid-cols-2 gap-y-2">
                    {availableYears.map((year) => (
                      <label key={year} className="checkbox-label flex items-center">
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
                          className="custom-checkbox"
                        />
                        <span>{year}</span>
                      </label>
                    ))}
                  </div>
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
                    <p className="text-lg">Player Rating (Career AV):</p>
                    <p className="text-3xl font-medium">{player.career_av}</p>
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
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerList;
