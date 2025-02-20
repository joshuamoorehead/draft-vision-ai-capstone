//import React, { useState, useEffect } from 'react';
//import { Link, useNavigate } from 'react-router-dom';
//import '../../styles/main.css';
import { dvailogo } from '../Logos';

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "../../styles/main.css";
import { fetchPlayers } from '../../services/api';

let globalUpdatedOrders = []; // global reference (though not strictly necessary)

// Initialize Supabase client
const supabaseUrl = "https://pvuzvnemuhutrdmpchmi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dXp2bmVtdWh1dHJkbXBjaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwNzgsImV4cCI6MjA0ODk4MzA3OH0.fB_b1Oe_2ckp9FGh6vmEs2jIRHjdDoaqzHVsM8NRZRY";
const supabase = createClient(supabaseUrl, supabaseKey);


const PlayerComparison = () => {
    const [players, setPlayers] = useState([]);
    const [player1, setPlayer1] = useState(null);
    const [player2, setPlayer2] = useState(null);
    const [search1, setSearch1] = useState("");
    const [search2, setSearch2] = useState("");
    const [dropdown1, setDropdown1] = useState(false);
    const maxVisiblePlayers = 20;

    useEffect(() => {
        const loadPlayers = async () => {
            try {
              const data = await fetchPlayers();
              const fetchedPlayers = data.results || data;
      
              fetchedPlayers.sort((a, b) => b.career_av - a.career_av);
      
              setPlayers(fetchedPlayers);
            } catch (err) {
                console.error("Fetch error:", err);
            }
          };
          loadPlayers();
      }, []);

      // TODO something not working with fetching players, cant see some players, can only see up to drafted in 2021 inclusive

    const filteredPlayers1 = players.filter(p => p.name.toLowerCase().includes(search1.toLowerCase()));
    const filteredPlayers2 = players.filter(p => p.name.toLowerCase().includes(search2.toLowerCase()));

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
                    <Link to="/largelist" className="text-2xl font-roboto-condensed opacity-50">Large List</Link>
                    <Link to="/playercompare" className="text-2xl font-roboto-condensed underline">Player Comparison</Link>
                    <Link to="/playerinput" className="text-2xl font-roboto-condensed opacity-50">Player Input</Link>
                  </div>
                </div>
              </div>

        <h1 className="text-2xl text-white">Player Comparison</h1>
        <div className="mt-4 flex justify-between">

            {/* Search for player 1*/}
            <div className="container w-1/2 pr-2 px-8 mt-2">
                <label className="text-white block">Player 1: </label>
                <input
                    type="text"
                    className="bg-white text-black p-2 rounded w-[500px]"
                    placeholder="Search for a player..."
                    value={search1}
                    onChange={(e) => {
                        setSearch1(e.target.value);
                        setDropdown1(true);}
                    }
                />
                {search1 && (
                    <ul className="absolute bg-white rounded shadow-lg mt-1 w-[500px] max-h-40 overflow-y-auto">
                    {filteredPlayers1.length > 0 ? (
                        filteredPlayers1.map((player, index) => (
                            <li
                                key={player.id}
                                className={`p-2 hover:bg-gray-200 cursor-pointer `}
                                onClick={() => {
                                    setPlayer1(player);
                                    setSearch1(player.name);
                                    setDropdown1(false);
                                }}
                            >
                                {player.name}
                            </li>
                        ))
                    ) : (
                        <li className="p-2 text-gray-500">No players found</li>
                    )}
                </ul>
                )}
            </div>

            {/* Search for player 2*/}
            <div className="container px-8 mt-2 w-1/2 pr-2">
                <label className="text-white block">Player 2: </label>
                <input
                    type="text"
                    className="bg-white text-black p-2 w-[500px] rounded"
                    placeholder="Search for a player..."
                    value={search2}
                    onChange={(e) => setSearch2(e.target.value)}
                />
                {search2 && (
                    <ul className="absolute bg-white rounded shadow-lg mt-1 w-[500px] max-h-40 overflow-y-auto">
                    {filteredPlayers2.length > 0 ? (
                        filteredPlayers2.map((player, index) => (
                            <li
                                key={player.id}
                                className={`p-2 hover:bg-gray-200 cursor-pointer`}
                                onClick={() => {
                                    setPlayer2(player);
                                    setSearch2(player.name);
                                }}
                            >
                                {player.name}
                            </li>
                        ))
                    ) : (
                        <li className="p-2 text-gray-500">No players found</li>
                    )}
                </ul>
                )}
            </div>
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
        
    );
};

export default PlayerComparison;
