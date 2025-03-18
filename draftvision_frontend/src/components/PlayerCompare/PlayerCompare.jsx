import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "../../styles/main.css";
import { fetchPlayers } from '../../services/api';
import PageTransition from '../Common/PageTransition';
import { dvailogo } from '../Logos';

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
    const [stats1, setStats1] = useState(null);
    const [stats2, setStats2] = useState(null);
    const [dropdown1, setDropdown1] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const timeoutRef = useRef(null);
    const maxVisiblePlayers = 20;
    
    const [dropdown2, setDropdown2] = useState(false);
    

    const statKeyMap = {
        QB: { td: "td", yards: "yds" },
        default: { td: "tot_td", yards: "tot_yds"}
    };
    
    // Modify your initial fetch
useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch just the basic player data first
            const { data: playerData, error: playerErr } = await supabase
                .from("db_playerprofile")
                .select('id, name, position, school, nfl_team')
                .in("position", ["QB", "TE", "WR", "RB"]);
                
            if (playerErr) {
                console.error("Player fetch error:", playerErr);
                throw new Error("Failed to load player data");
            }
            
            setPlayers(playerData);
            console.log("Loaded", playerData.length, "players successfully");
        } catch (err) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };
    
    fetchData();
    // Cleanup function
}, []);

        useEffect(() => {
            // Set a timeout to prevent perpetual loading
            const timeoutId = setTimeout(() => {
                if (loading) {
                    setLoading(false);
                    setError("Request timed out. Please try refreshing the page.");
                }
            }, 10000); // 10-second timeout

            return () => clearTimeout(timeoutId);
        }, [loading]);
    const fetchPlayerInfo = async (playerId) => {
        try {
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
        } catch (err) {
            console.error("Error in fetchPlayerInfo:", err);
            return null;
        }
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
            case "TE":
                statsTable = "db_recstats";
                break;
            default:
                console.error("No stats table found for position:", player.position);
                return null;
        }
    
        try {
            const { data, error } = await supabase
                .from(statsTable)
                .select("*")
                .eq("playerid_id", player.id);
                
            if (error) {
                console.error(`Error fetching stats from ${statsTable}:`, error);
                return null;
            }
            
            return data && data.length > 0 ? data[0] : null;
        } catch (err) {
            console.error("Error in fetchPlayerStats:", err);
            return null;
        }
    };

   
// handlePlayerSelect function to fetch complete player data
const handlePlayerSelect = async (player, setPlayerState, setStatsState, isFirstPlayer = true) => {
    try {
        setLoadingStats(true);
        
        // Get detailed player data with relationships
        const { data: fullPlayerData, error: playerErr } = await supabase
            .from("db_playerprofile")
            .select(`
                *,
                db_combine(*),
                db_rbstats(*),
                db_passingleaders(*),
                db_recstats(*)
            `)
            .eq('id', player.id)
            .single();
            
        if (playerErr) {
            console.error("Detailed player fetch error:", playerErr);
            throw new Error("Failed to load player details");
        }
        
        console.log("Fetched detailed player data:", fullPlayerData);
        
        // Update state with detailed player data
        setPlayerState(fullPlayerData);
        
        // For backward compatibility, still fetch separate stats
        const stats = await fetchPlayerStats(player);
        setStatsState(stats);
        
        // Close the appropriate dropdown
        if (isFirstPlayer) {
            setDropdown1(false);
        } else {
            setDropdown2(false);
        }
    } catch (err) {
        console.error("Error selecting player:", err);
    } finally {
        setLoadingStats(false);
    }
};

    const resolveStatKey = (key, position) => {
        const mapping = statKeyMap[position] || statKeyMap.default;
        return mapping[key] || key;
    };

    const getPlayerStat = (player, key) => {
        if (!player) return "N/A";
        
        // Direct properties on player object
        if (player[key] !== undefined && player[key] !== null) {
            return player[key];
        }
        
        // Handle specific fields based on position
        switch(key) {
            case "height":
                return player.db_combine?.[0]?.height ?? "N/A";
                
            case "weight":
                return player.db_combine?.[0]?.weight ?? "N/A";
                
            case "yds":
                if (player.position === "QB") {
                    return player.db_passingleaders?.[0]?.yds ?? "N/A";
                } else if (player.position === "RB") {
                    return player.db_rbstats?.[0]?.tot_yds ?? "N/A";
                } else if (player.position === "TE" || player.position === "WR") {
                    return player.db_recstats?.[0]?.tot_yds ?? "N/A";
                }
                return "N/A";
                
            case "td":
                if (player.position === "QB") {
                    return player.db_passingleaders?.[0]?.td ?? "N/A";
                } else if (player.position === "RB") {
                    return player.db_rbstats?.[0]?.tot_td ?? "N/A";
                } else if (player.position === "TE" || player.position === "WR") {
                    return player.db_recstats?.[0]?.tot_td ?? "N/A";
                }
                return "N/A";
                
            default:
                return "N/A";
        }
    };

    // Get position color
    const getPositionColor = (pos) => {
        const positionColors = {
            'QB': 'from-red-500 to-red-600',
            'RB': 'from-blue-500 to-blue-600',
            'WR': 'from-green-500 to-green-600',
            'TE': 'from-yellow-500 to-yellow-600',
        };
        
        if (!pos) return 'from-gray-500 to-gray-600';
        
        for (const key in positionColors) {
            if (pos.includes(key)) {
                return positionColors[key];
            }
        }
        return 'from-gray-500 to-gray-600';
    };

    const filteredPlayers1 = players.filter(p => 
        p.name && p.name.toLowerCase().includes(search1.toLowerCase())
    ).slice(0, maxVisiblePlayers);
    
    const filteredPlayers2 = players.filter(p => 
        p.name && p.name.toLowerCase().includes(search2.toLowerCase())
    ).slice(0, maxVisiblePlayers);

    // Show loading state
    if (loading) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center">
                    <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white border-opacity-20 text-center">
                        <div className="flex justify-center mb-4">
                            <svg className="animate-spin h-12 w-12 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Loading Players</h2>
                        <p className="text-gray-300">Please wait while we fetch player data.</p>
                        <div className="w-full bg-gray-800 rounded-full h-1.5 mt-4 overflow-hidden">
                            <div className="bg-blue-500 h-1.5 rounded-full w-3/4 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    // Show error state
    if (error) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center">
                    <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white border-opacity-20 text-center max-w-md">
                        <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Error Loading Data</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 relative overflow-hidden">
                {/* Animated floating shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                    <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                </div>
                
                <div className="container mx-auto px-4 py-12 relative z-10">
                    <div className="text-center mb-10">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
                            Player <span className="text-blue-400">Comparison</span>
                        </h1>
                        <div className="h-1 w-32 bg-blue-400 mx-auto rounded my-4"></div>
                        <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                            Compare statistics between two players to make data-driven decisions
                        </p>
                    </div>
                    
                    <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white border-opacity-20 mb-10 max-w-5xl mx-auto">
                        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
                            {/* Player 1 Search */}
                            <div className="w-full lg:w-1/2">
                                <div className="relative">
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Player 1
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                                            placeholder="Search for a player..."
                                            value={search1}
                                            onChange={(e) => {
                                                setSearch1(e.target.value);
                                                setDropdown1(true);
                                            }}
                                        />
                                    </div>
                                    
                                    {search1 && (
                                        <ul className="absolute z-10 mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                            {filteredPlayers1.length > 0 ? (
                                                filteredPlayers1.map((player) => (
                                                    <li
                                                        key={player.id}
                                                        className="border-b border-gray-700 last:border-b-0 transition-colors duration-150"
                                                        onClick={() => {
                                                            handlePlayerSelect(player, setPlayer1, setStats1);
                                                            setSearch1(player.name);
                                                        }}
                                                    >
                                                        <button className="w-full text-left px-4 py-3 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none">
                                                            <div className="flex items-center">
                                                                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getPositionColor(player.position)} flex items-center justify-center mr-3 text-xs font-bold`}>
                                                                    {player.position}
                                                                </div>
                                                                <div>
                                                                    <div className="text-white font-medium">{player.name}</div>
                                                                    <div className="text-gray-400 text-sm">{player.school}</div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="px-4 py-3 text-gray-400 text-center">No players found</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                                
                                {player1 && (
                                    <div className="mt-4 p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
                                        <div className="flex items-center">
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getPositionColor(player1.position)} flex items-center justify-center mr-3 text-sm font-bold shadow-lg`}>
                                                {player1.position}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{player1.name}</h3>
                                                <p className="text-gray-300">{player1.school}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Player 2 Search */}
                            <div className="w-full lg:w-1/2">
                                <div className="relative">
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Player 2
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                                            placeholder="Search for a player..."
                                            value={search2}
                                            onChange={(e) => setSearch2(e.target.value)}
                                        />
                                    </div>
                                    
                                    {search2 && (
                                        <ul className="absolute z-10 mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                            {filteredPlayers2.length > 0 ? (
                                                filteredPlayers2.map((player) => (
                                                    <li
                                                        key={player.id}
                                                        className="border-b border-gray-700 last:border-b-0 transition-colors duration-150"
                                                        onClick={() => {
                                                            handlePlayerSelect(player, setPlayer2, setStats2);
                                                            setSearch2(player.name);
                                                        }}
                                                    >
                                                        <button className="w-full text-left px-4 py-3 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none">
                                                            <div className="flex items-center">
                                                                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getPositionColor(player.position)} flex items-center justify-center mr-3 text-xs font-bold`}>
                                                                    {player.position}
                                                                </div>
                                                                <div>
                                                                    <div className="text-white font-medium">{player.name}</div>
                                                                    <div className="text-gray-400 text-sm">{player.school}</div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="px-4 py-3 text-gray-400 text-center">No players found</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                                
                                {player2 && (
                                    <div className="mt-4 p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
                                        <div className="flex items-center">
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getPositionColor(player2.position)} flex items-center justify-center mr-3 text-sm font-bold shadow-lg`}>
                                                {player2.position}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{player2.name}</h3>
                                                <p className="text-gray-300">{player2.school}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Loading indicator when fetching player stats */}
                    {loadingStats && (
                        <div className="flex justify-center my-8">
                            <svg className="animate-spin h-10 w-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}
                    
                    {/* Comparison Results */}
                    {player1 && player2 && !loadingStats && (
                        <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-indigo-500 border-opacity-30 max-w-5xl mx-auto">
                            <div className="relative mb-10">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg shadow-lg">
                                        {`${player1.db_passingleaders?.[0]?.year 
                                            ?? player1.db_rbstats?.[0]?.year
                                            ?? player1.db_recstats?.[0]?.year
                                            ?? ""} ${player1.name} `} 
                                        vs 
                                        {` ${player2.db_passingleaders?.[0]?.year 
                                            ?? player2.db_rbstats?.[0]?.year
                                            ?? player2.db_recstats?.[0]?.year
                                            ?? ""} ${player2.name}`}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Player Cards at Top */}
                            <div className="flex flex-col md:flex-row justify-between mb-8">
                                {/* Player 1 Card */}
                                <div className="w-full md:w-5/12 bg-gray-800 bg-opacity-50 rounded-lg p-4 flex items-center">
                                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getPositionColor(player1.position)} flex items-center justify-center mr-4 text-xl font-bold shadow-lg`}>
                                        {player1.position}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{player1.name}</h3>
                                        <p className="text-blue-400">{player1.school}</p>
                                    </div>
                                </div>
                                
                                {/* VS Badge */}
                                <div className="hidden md:flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold shadow-lg">
                                        VS
                                    </div>
                                </div>
                                
                                {/* Player 2 Card */}
                                <div className="w-full md:w-5/12 bg-gray-800 bg-opacity-50 rounded-lg p-4 flex items-center justify-end mt-4 md:mt-0">
                                    <div className="text-right mr-4">
                                        <h3 className="text-2xl font-bold text-white">{player2.name}</h3>
                                        <p className="text-blue-400">{player2.school}</p>
                                    </div>
                                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getPositionColor(player2.position)} flex items-center justify-center text-xl font-bold shadow-lg`}>
                                        {player2.position}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Stats Comparison */}
<div className="space-y-4">
    {[
        { label: "Position", key: "position" },
        { label: "School", key: "school" },
        { label: "NFL Team", key: "nfl_team" },
        { label: "Height", key: "height" },
        { label: "Weight", key: "weight" },
        { label: "Total Yards", key: "yds" },
        { label: "Total Touchdowns", key: "td" },
    ].map(({ label, key }) => {
        const stat1 = getPlayerStat(player1, key);
        const stat2 = getPlayerStat(player2, key);

        const isNumeric = !isNaN(parseFloat(stat1)) && !isNaN(parseFloat(stat2));
        const stat1Value = isNumeric ? parseFloat(stat1) : stat1;
        const stat2Value = isNumeric ? parseFloat(stat2) : stat2;
        const isStat1Better = isNumeric ? stat1Value > stat2Value : false;
        const isStat2Better = isNumeric ? stat2Value > stat1Value : false;

        return (
            <div key={key} className="bg-gray-800 bg-opacity-50 rounded-lg p-2">
                <div className="grid grid-cols-3 items-center">
                    {/* Player 1 Stat */}
                    <div className={`text-right px-4 py-2 ${isStat1Better ? 'text-green-400' : 'text-white'}`}>
                        <span className="font-medium text-lg">
                            {stat1}
                            {isStat1Better && (
                                <span className="ml-2 text-green-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            )}
                        </span>
                    </div>
                    
                    {/* Stat Label (Center) */}
                    <div className="flex justify-center">
                        <div className="bg-gray-700 px-4 py-2 rounded-full shadow-lg">
                            <span className="text-white font-medium">{label}</span>
                        </div>
                    </div>
                    
                    {/* Player 2 Stat */}
                    <div className={`text-left px-4 py-2 ${isStat2Better ? 'text-green-400' : 'text-white'}`}>
                        <span className="font-medium text-lg">
                            {isStat2Better && (
                                <span className="mr-2 text-green-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            )}
                            {stat2}
                        </span>
                    </div>
                </div>
            </div>
        );
    })}
</div>
                            
                            {/* Compare Another Button */}
                            <div className="mt-10 text-center">
                                <button
                                    onClick={() => {
                                        setPlayer1(null);
                                        setPlayer2(null);
                                        setSearch1("");
                                        setSearch2("");
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                                >
                                    Compare Different Players
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Custom styling for animations */}
                <style jsx>{`
                    @keyframes blob {
                        0% {
                            transform: translate(0px, 0px) scale(1);
                        }
                        33% {
                            transform: translate(30px, -50px) scale(1.1);
                        }
                        66% {
                            transform: translate(-20px, 20px) scale(0.9);
                        }
                        100% {
                            transform: translate(0px, 0px) scale(1);
                        }
                    }
                    .animate-blob {
                        animation: blob 7s infinite;
                    }
                    .animation-delay-2000 {
                        animation-delay: 2s;
                    }
                    .animation-delay-4000 {
                        animation-delay: 4s;
                    }
                    .bg-grid-pattern {
                        background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                                            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
                        background-size: 40px 40px;
                    }
                `}</style>
            </div>
        </PageTransition>
    );
};

export default PlayerComparison;