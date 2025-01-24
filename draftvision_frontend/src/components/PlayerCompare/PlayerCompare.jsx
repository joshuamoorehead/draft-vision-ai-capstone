import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/main.css';


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
        <div>
        {/* Header */}
              <div className="w-full h-32 bg-black">
                <div className="container mx-auto px-4 h-full flex items-center">
                  <img src={dvailogo} alt="Draft Vision AI Logo" className="h-32 w-32" />
                  <div className="flex space-x-8 text-white ml-12">
                    <Link to="/" className="text-2xl font-roboto-condensed opacity-50">Player List</Link>
                    <Link to="/about" className="text-2xl font-roboto-condensed opacity-50">About Us</Link>
                    <Link to="/mockdraft" className="text-2xl font-roboto-condensed opacity-50">Mock Draft</Link>
                    <Link to="/largelist" className="text-2xl font-roboto-condensed opacity-50">Large List</Link>
                    <Link to="/PlayerCompare" className="text-2xl font-roboto-condensed underline">Player Comparison</Link>
                  </div>
                </div>
              </div>
        <div>
            <h1>Player Comparison</h1>
            <div>
                <label>Player 1:</label>
                <select onChange={(e) => setPlayer1(players.find(p => p.id === parseInt(e.target.value)))}>
                    <option value="">Select a player</option>
                    {players.map(player => (
                        <option key={player.id} value={player.id}>{player.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Player 2:</label>
                <select onChange={(e) => setPlayer2(players.find(p => p.id === parseInt(e.target.value)))}>
                    <option value="">Select a player</option>
                    {players.map(player => (
                        <option key={player.id} value={player.id}>{player.name}</option>
                    ))}
                </select>
            </div>

            {player1 && player2 && (
                <div>
                    <h2>{player1.name} vs {player2.name}</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Stat</th>
                                <th>{player1.name}</th>
                                <th>{player2.name}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Position</td>
                                <td>{player1.position}</td>
                                <td>{player2.position}</td>
                            </tr>
                            <tr>
                                <td>School</td>
                                <td>{player1.school}</td>
                                <td>{player2.school}</td>
                            </tr>
                            <tr>
                                <td>Height</td>
                                <td>{player1.height}</td>
                                <td>{player2.height}</td>
                            </tr>
                            <tr>
                                <td>Weight</td>
                                <td>{player1.weight}</td>
                                <td>{player2.weight}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        </div>
    );
};

export default PlayerComparison;
