import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/main.css';

const PlayerComparison = () => {
    const [players, setPlayers] = useState([]);
    const [player1, setPlayer1] = useState(null);
    const [player2, setPlayer2] = useState(null);

    useEffect(() => {
        axios.get('players/')
            .then((response) => {
                setPlayers(response.data);
            })
            .catch((error) => console.error("Error fetching players:", error));
    }, []);

    return (
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
                                <td>Passing Yards</td>
                                <td>{player1.passing_yards}</td>
                                <td>{player2.passing_yards}</td>
                            </tr>
                            <tr>
                                <td>Rushing Yards</td>
                                <td>{player1.rushing_yards}</td>
                                <td>{player2.rushing_yards}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PlayerComparison;
