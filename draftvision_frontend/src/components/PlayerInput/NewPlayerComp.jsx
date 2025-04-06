import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import '../../styles/main.css';
import { dvailogo } from '../Logos';
import PageTransition from '../Common/PageTransition';
import { createClient } from "@supabase/supabase-js";
import { fetchPlayers } from '../../services/api';
import { useAuth } from "../../context/AuthContext"; // Import Auth Context

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const NewPlayerComp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Retrieve player data from location state
  const playerName = location.state?.name || 'Unknown Player';
  const playerPosition = location.state?.position || "Unknown Position";
  const playerYear = location.state?.year || "Unknown Year";
  const draftRound = location.state?.draftRound || "Unknown Round";
  
  // Get current user id (uuid) from AuthContext
  const { uuid } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proCompName, setProCompName] = useState("");
  const [proCompTeam, setProCompTeam] = useState("");
  const [players, setPlayers] = useState([]);

  const returnToPage = () => {
    navigate("/playerinput");
  };

  // Fetch basic player data that match the player's position and draft round
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: playerData, error: playerErr } = await supabase
          .from("db_playerprofile")
          .select('name, position, nfl_team, draft_round')
          .eq("position", playerPosition)
          .eq("draft_round", draftRound);
          
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
  }, [draftRound, playerPosition]);

  // Compute the best match for pro comparison from the fetched players
  useEffect(() => {
    const getProComparison = () => {
      let bestMatch = null;
      let bestScore = Infinity;
      let score = 0;
      
      players.forEach(player => {
        // For now we use a simple scoring system
        // You can extend this switch if you have more positions or criteria.
        switch(playerPosition) {
          default:
            score = 10;
            const proDefRound = player.draft_round || 0;
            if(proDefRound === draftRound) {
              score = 0;
            }
        }

        if (score < bestScore) {
          bestScore = score;
          bestMatch = player;
        }
      });
      
      if(bestMatch) {
        setProCompName(bestMatch.name);
        setProCompTeam(bestMatch.nfl_team);
        console.log("ProComped:", bestMatch.name);
      }
      
      return bestMatch;
    };
    
    // Run the pro comparison only if players data is available
    if(players.length > 0) {
      getProComparison();
    }
  }, [players, draftRound, playerPosition]);

  // New function: Increment the predictions column in user_stats table
  const incrementPredictionCount = async () => {
    if (!uuid) return;
    try {
      // Fetch current predictions count, using maybeSingle to handle missing rows
      const { data: stats, error: statsError } = await supabase
        .from("user_stats")
        .select("predictions")
        .eq("user_id", uuid)
        .maybeSingle();
      
      if (statsError) {
        console.error("Error fetching user stats for predictions increment:", statsError);
        return;
      }
      
      // If a row exists, increment; otherwise start with 1
      const newPredictions = stats && stats.predictions !== undefined && stats.predictions !== null
        ? stats.predictions + 1
        : 1;
      
      // Upsert the new value. Ensure the table has a unique constraint on user_id.
      const { error } = await supabase
        .from("user_stats")
        .upsert({ user_id: uuid, predictions: newPredictions }, { onConflict: 'user_id' });
      
      if (error) {
        console.error("Error upserting predictions:", error);
      } else {
        console.log("User predictions incremented successfully");
      }
    } catch (err) {
      console.error("Error in incrementPredictionCount:", err);
    }
  };

  // Call incrementPredictionCount once when a valid player is created
  useEffect(() => {
    if (playerName !== "Unknown Player") {
      incrementPredictionCount();
    }
  }, [playerName, uuid]);

  // Helper function for draft round suffix
  const getRoundSuffix = (round) => {
    const lastDigit = round % 10;
    switch (lastDigit) {
      case 1:
        return `${round}st`;
      case 2:
        return `${round}nd`;
      case 3:
        return `${round}rd`;
      default:
        return `${round}th`;
    }
  };

  // Get position color
  const getPositionColor = (pos) => {
    const positionColors = {
      'QB': 'from-red-500 to-red-600',
      'RB': 'from-blue-500 to-blue-600',
      'WR': 'from-green-500 to-green-600',
      'TE': 'from-yellow-500 to-yellow-600',
      'OL': 'from-purple-500 to-purple-600',
      'DL': 'from-indigo-500 to-indigo-600',
      'LB': 'from-pink-500 to-pink-600',
      'CB': 'from-teal-500 to-teal-600',
      'S': 'from-cyan-500 to-cyan-600'
    };
    
    return positionColors[pos] || 'from-gray-500 to-gray-600';
  };
  
  // Get draft round color
  const getDraftRoundColor = (round) => {
    if (round === 1) return 'from-yellow-400 to-yellow-600';
    if (round === 2) return 'from-blue-400 to-blue-600';
    if (round === 3) return 'from-green-400 to-green-600';
    if (round === 4) return 'from-purple-400 to-purple-600';
    if (round === 5) return 'from-red-400 to-red-600';
    if (round === 6) return 'from-orange-400 to-orange-600';
    return 'from-gray-400 to-gray-600';
  };

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
              Draft <span className="text-blue-400">Results</span>
            </h1>
            <div className="h-1 w-32 bg-blue-400 mx-auto rounded my-4"></div>
          </div>
          
          {/* Result Card */}
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white border-opacity-20 max-w-3xl mx-auto mb-10">
            {/* Player Badge */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center z-10 relative">
                  <div className={`w-28 h-28 rounded-full bg-gradient-to-r ${getPositionColor(playerPosition)} flex items-center justify-center text-4xl font-bold text-white`}>
                    {playerPosition}
                  </div>
                </div>
                <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-1 rounded-full text-sm font-bold shadow-lg">
                  {playerYear}
                </div>
              </div>
            </div>
            
            {/* Player Name */}
            <h2 className="text-3xl relative -bottom-3 font-bold text-white text-center mb-6">
              {playerName}
            </h2>
            
            {/* Draft Result */}
            <div className="text-center mb-8">
              <p className="text-xl text-gray-300 mb-2">Will be drafted in the</p>
              <div className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-1">
                <div className={`bg-gradient-to-r ${getDraftRoundColor(draftRound)} text-white text-4xl font-bold py-3 px-8 rounded-lg shadow-inner`}>
                  {getRoundSuffix(draftRound)} Round
                </div>
              </div>
              <p className="text-xl text-gray-300 mt-2">of the {playerYear} draft</p>
            </div>
            
            {/* Draft Analysis */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-white mb-3">Draft Analysis</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                Based on the player's stats and our prediction model, {playerName} shows the qualities of a {getRoundSuffix(draftRound)} round prospect. 
                {draftRound <= 3 ? 
                  ` As an early-round talent, they demonstrate exceptional ability at the ${playerPosition} position and could make an immediate impact in the NFL.` :
                  ` While not projected as an early pick, they show promising potential and could develop into a valuable contributor with the right coaching and system fit.`}
              </p>
              <h3 className="text-xl font-bold text-white mb-3">Pro Comp: {proCompName}, {proCompTeam}</h3>
            </div>
            
            {/* Button */}
            <div className="text-center">
              <button
                onClick={returnToPage}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
              >
                Create Another Player
              </button>
            </div>
          </div>
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

export default NewPlayerComp;
