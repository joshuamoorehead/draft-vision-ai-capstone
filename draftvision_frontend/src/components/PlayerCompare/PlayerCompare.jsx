import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/main.css';
import PageTransition from '../Common/PageTransition';

const PlayerComparison = () => {
  const [players, setPlayers] = useState([]);
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);

  useEffect(() => {
    fetch('/api/players/')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setPlayers(data))
      .catch((error) => console.error("Error fetching players:", error));
  }, []);

  return (
    <div className="min-h-screen bg-[#5A6BB0] transition-all duration-300">
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-center mb-8">Player Comparison</h1>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Player 1 Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Player 1:</label>
                <select 
                  onChange={(e) => setPlayer1(players.find(p => p.id === parseInt(e.target.value)))}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">Select a player</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
              </div>

              {/* Player 2 Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Player 2:</label>
                <select 
                  onChange={(e) => setPlayer2(players.find(p => p.id === parseInt(e.target.value)))}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">Select a player</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Table */}
            {player1 && player2 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-center mb-6">
                  {player1.name} vs {player2.name}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-4 border border-gray-300">Stat</th>
                        <th className="p-4 border border-gray-300">{player1.name}</th>
                        <th className="p-4 border border-gray-300">{player2.name}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50">
                        <td className="p-4 border border-gray-300 font-medium">Position</td>
                        <td className="p-4 border border-gray-300">{player1.position}</td>
                        <td className="p-4 border border-gray-300">{player2.position}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-4 border border-gray-300 font-medium">School</td>
                        <td className="p-4 border border-gray-300">{player1.school}</td>
                        <td className="p-4 border border-gray-300">{player2.school}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-4 border border-gray-300 font-medium">Height</td>
                        <td className="p-4 border border-gray-300">{player1.height}</td>
                        <td className="p-4 border border-gray-300">{player2.height}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-4 border border-gray-300 font-medium">Weight</td>
                        <td className="p-4 border border-gray-300">{player1.weight}</td>
                        <td className="p-4 border border-gray-300">{player2.weight}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default PlayerComparison;