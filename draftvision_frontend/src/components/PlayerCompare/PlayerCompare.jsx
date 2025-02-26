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
    const [rbstats, setRBs] = useState([]);
    const [rb1, setRB1] = useState(null);
    const [player1, setPlayer1] = useState(null);
    const [player2, setPlayer2] = useState(null);
    const [search1, setSearch1] = useState("");
    const [search2, setSearch2] = useState("");
    const [stats1, setStats1] = useState([]);
    const [stats2, setStats2] = useState("");
    const [dropdown1, setDropdown1] = useState(false);
    const maxVisiblePlayers = 20;

    const statKeyMap = {
        QB: { td: "td", yards: "yds" },
        default: { td: "tot_td", yards: "tot_yds"}
    };
    
    useEffect(() => {
        /*const loadPlayers = async () => {
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
      }, []);*/

      const fetchData = async () => {
        try {
          // fetch players
          const { data: players, error: playersErr } = await supabase
            .from("db_playerprofile")
            .select("*, db_combine(*), db_rbstats(*), db_passingleaders(*), db_recstats(*)")
            .in("position", ["QB", "TE", "WR", "RB"])
          if (playersErr) {
            console.error("Players fetch error:", playersErr);
          } else {
            setPlayers(players);
          }
        } catch (err) {
            console.error("Fetch error:", err);
          }
        };
        fetchData();

    }, []);

    const fetchPlayerInfo = async (playerId) => {
        const { data, error } = await supabase
            .from("db_playerprofile")
            .select("id, name, position, school, height, weight") 
            .eq("id", playerId)
            .single(); // Get one player
    
        if (error) {
            console.error("Error fetching player info:", error);
            return null;
        }
    
        return data; // Returns player object with position
    };

    const fetchPlayerStats = async (player) => {
        let statsTable = "";
    
        switch (player.position) {
            case "QB":
                statsTable = "db_passingleaders";
                break;
            case "RB":
                statsTable = "db_rbstats";
                break;
            case "WR":
                statsTable = "db_recstats";
                break;
            default:
                console.error("No stats table found for position:", player.position);
                return null;
        }
    
        const { data, error } = await supabase
            .from(statsTable)
            .select("*")
            .eq("playerid_id", player.id)
            .single(); // Get stats for the specific player
    
        if (error) {
            console.error(`Error fetching stats from ${statsTable}:`, error);
            return null;
        }
    
        return data;
    };

    const handlePlayerSelect = async (playerId, setPlayer) => {
        const player = await fetchPlayerInfo(playerId);
        if (!player) return;
    
        const stats = await fetchPlayerStats(player);
        setPlayer({ ...player, stats }); // Merge player info with stats
    };

    const playerStatSelect1 = async (player) => {
        const stats1 = await fetchPlayerStats(player);
    }

    const playerStatSelect2 = async (player) => {
        const stats2 = await fetchPlayerStats(player);
    }

    const resolveStatKey = (key, position) => {
        const mapping = statKeyMap[position] || statKeyMap.default;
        return mapping[key] || key;
    };

    const getPlayerStat = (player, key, position) => {
        const resolvedKey = resolveStatKey(key, position);
    
        return player?.[resolvedKey] 
            ?? player?.db_combine?.[0]?.[resolvedKey] 
            ?? player?.db_passingleaders?.[0]?.[resolvedKey] 
            ?? player?.db_rbstats?.[0]?.[resolvedKey]
            ?? player?.db_recstats?.[0]?.[resolvedKey]
            ?? "N/A";
    };
    
    
    
    

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

        <h1 className="text-4xl text-white font-bold mb-4 mt-8 text-center">Player Comparison</h1>
        <p className="text-white text-lg mb-4 text-center">
          A tool to help compare seasons of football players
        </p>
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
                                    //const stats1 = fetchPlayerStats(player);
                                    setStats1(fetchPlayerStats(player));
                                    //handlePlayerSelect(player.id, setPlayer1); // or setPlayer2 based on selection
                                    //setSearch1(player.name); // Show chosen player in input field
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
                                    setStats2(fetchPlayerStats(player));
                                    //handlePlayerSelect(player.id, setPlayer2); // or setPlayer2 based on selection
                                    //setSearch2(player.name); // Show chosen player in input field
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

            {/*When both players picked*/}
            {/*TODO database picks earliest year on file need to change for best year on file*/}
            {player1 && player2 && (
    <div className="mt-16 bg-gray-900 p-6 rounded-lg text-white">
        <h2 className="text-center text-2xl font-bold mb-4">
            {`${player1.db_passingleaders?.[0]?.year 
            ?? player1.db_rbstats?.[0]?.year
            ?? player1.db_recstats?.[0]?.year
            ?? ""} ${player1.name} `} 
            vs {`${player2.db_passingleaders?.[0]?.year 
            ?? player2.db_rbstats?.[0]?.year
            ?? player2.db_recstats?.[0]?.year
            ?? ""} ${player2.name}`}</h2>

        {/* Stats Table */}
        <div className="grid grid-cols-1 gap-4 text-lg mt-1">
            {[
                { label: "Position", key: "position" },
                { label: "School", key: "school" },
                { label: "NFL Team", key: "nfl_team"},
                { label: "Height", key: "height"},
                { label: "Weight", key: "weight"},
                { label: "Total Yards", key: "yds"},
                { label: "Total Touchdowns", key: "td"},

            ].map(({ label, key }) => {
                //const stat1 = stats1[key];
                //const stat2 = stats2[key];

                //const stat1 = player1?.db_combine[key] ?? "N/A";
                //const stat2 = player2?.db_combine[key] ?? "N/A";

                //const stat1 = player1?.db_combine?.[0]?.[key] ?? "N/A";
                //const stat2 = player2?.db_combine?.[0]?.[key] ?? "N/A";

                //const stat1 = player1?.[key] ?? player1?.db_combine?.[0]?.[key] ?? player1?.db_rbstats?.[0]?.[key]
                // ?? player1?.db_passingleaders?.[0]?.[key] ?? player1?.db_recstats?.[0]?.[key] ?? "N/A";

                //const stat2 = player2?.[key] ?? player2?.db_combine?.[0]?.[key] ?? player2?.db_rbstats?.[0]?.[key] ?? 
                //player2?.db_passingleaders?.[0]?.[key] ?? player2?.db_recstats?.[0]?.[key] ?? "N/A";

                const stat1 = getPlayerStat(player1, key, player1?.position);
                const stat2 = getPlayerStat(player2, key, player2?.position);


                const isNumeric = !isNaN(stat1) && !isNaN(stat2);



                return (
                    <div key={key} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg mt-1">
                        {/* Player 1 Stat */}
                        <div className={`w-1/3 text-left ${stat1 > stat2 ? "font-bold text-green-400" : "opacity-70"}`}>
                            {stat1}
                        </div>

                        {/* Centered Stat Label */}
                        <div className="w-1/3 text-center font-semibold">{label}</div>

                        {/* Player 2 Stat */}
                        <div className={`w-1/3 text-right ${stat2 > stat1 ? "font-bold text-green-400" : "opacity-70"}`}>
                            {stat2}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
)}

        </div>
        
    );
};

export default PlayerComparison;
