import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPlayers } from '../../services/api';
import Papa from 'papaparse';
import { dvailogo } from '../Logos';
import '../../styles/main.css';

const PlayerList = () => {
  const [position, setPosition] = useState(''); // Selected position
  const [team, setTeam] = useState(''); // Selected team
  const [years, setYears] = useState(()=> []);
  const [allPlayers, setAllPlayers] = useState([]); // All players data
  const [players, setPlayers] = useState([]); // Filtered players
  const [predictions, setPredictions] = useState([]); // Predicted results from CSV
  const [selectedPlayer, setSelectedPlayer] = useState(null); // For popup
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const data = await fetchPlayers();
        const fetchedPlayers = data.results || data;

        fetchedPlayers.sort((a, b) => b.career_av - a.career_av);

        setAllPlayers(fetchedPlayers);
        setPlayers(fetchedPlayers); // Initially display all players
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

  useEffect(() => {
    let filteredPlayers = allPlayers;

    if (position) {
      console.log('Filtering by position:', position);
      filteredPlayers = filteredPlayers.filter((player) => 
        player.position?.toLowerCase().includes(position.toLowerCase())
      );
    }

    if (team) {
      console.log('Filtering by team:', team);
      console.log('Teams in data:', allPlayers.map((player) => player.school));

      filteredPlayers = filteredPlayers.filter((player) => {
        const playerTeam = player.school?.toLowerCase() || '';
        const matches = playerTeam.includes(team.toLowerCase());
        console.log(`Player: ${player.name}, Team: ${playerTeam}, Matches: ${matches}`);
        return matches;
      });
    }

    if (years.length > 0) {


      filteredPlayers = filteredPlayers.filter((player) => {
        const playerYears = Array.isArray(player.years_ncaa)
          ? player.years_ncaa.join(', ')
          : (typeof player.years_ncaa === 'string' ? player.years_ncaa : '');

        //console.log('Player:', player.name, 'Player Years as String:', playerYears);

        const matches = years.some((year) => playerYears.includes(year));
        //console.log(`Player: ${player.name}, Matches: ${matches}`);
        return matches;
      });
    }

    console.log('Final Filtered Players:', filteredPlayers);
    setPlayers(filteredPlayers);
  }, [position, team, years, allPlayers]);

  const handlePlayerSelect = (playerId) => {
    const playerData = allPlayers.find((player) => player.id === playerId);
    if (playerData) {
      setSelectedPlayer(playerData);
    } else {
      console.error('Player not found:', playerId);
    }
  };

  const closePopup = () => {
    setSelectedPlayer(null);
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
          ? player.years_ncaa.map((y) => String(y).trim()) // Convert numbers to strings
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
            <Link to="/" className="text-2xl font-roboto-condensed underline">Player List</Link>
            <Link to="/about" className="text-2xl font-roboto-condensed opacity-50">About Us</Link>
            <Link to="/mockdraft" className="text-2xl font-roboto-condensed opacity-50">Mock Draft</Link>
            <Link to="/largelist" className="text-2xl font-roboto-condensed opacity-50">Large List</Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-8">
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
                  {availableYears.map((year) => {
  //console.log(`Year: ${year}, Checked: ${years.includes(year)}`);
  console.log('Year Type:', typeof year);
  return (
    <label key={year} className="checkbox-label flex items-center">
      <input
        type="checkbox"
        value={year}
        checked={years.includes(year)} // Dynamically check if the year is in the state
        onChange={(e) => {
          const selectedYear = e.target.value;
          console.log('Selected Year:', selectedYear, 'Type:', typeof selectedYear);
        
          setYears((prevYears) => {
            const updatedYears = prevYears.includes(selectedYear)
              ? prevYears.filter((y) => y !== selectedYear) // Remove if already selected
              : [...prevYears, selectedYear]; // Add if not already selected
        
            console.log('Previous Years (from prevYears):', prevYears);
            console.log('Updated Years:', updatedYears);
            return updatedYears; // Return the updated array
          });
        }}
        className="custom-checkbox"
      />
      <span>{year}</span>
    </label>
  );
})}
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

      {/* Popup for Selected Player */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">{selectedPlayer.name}</h2>
            <p className="text-lg">School: {selectedPlayer.school}</p>
            <p className="text-lg">Position: {selectedPlayer.position}</p>
            <p className="text-lg">Career AV: {selectedPlayer.career_av}</p>
            <p className="text-lg">Years in NCAA: {Array.isArray(selectedPlayer.years_ncaa)
              ? selectedPlayer.years_ncaa.join(', ')
              : (typeof selectedPlayer.years_ncaa === 'string'
                ? selectedPlayer.years_ncaa.split(',').map((year) => year.trim()).join(', ')
                : 'N/A')}</p>
            <p className="text-lg">Biography: {selectedPlayer.biography}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              onClick={closePopup}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerList;
