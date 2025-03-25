import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import '../../styles/main.css';
import { dvailogo } from '../Logos';
import PageTransition from '../Common/PageTransition';

const NewPlayerComp = () => {
  const location = useLocation();
  const playerName = location.state?.name || 'Unknown Player';
  const playerPosition = location.state?.position || "Unknown Position";
  const playerYear = location.state?.year || "Unknown Year";
  const draftRound = location.state?.draftRound || "Unknown Round";
  const navigate = useNavigate();
  
  const returnToPage = () => {
    navigate("/playerinput");
  };
  
  const getRoundSuffix = (round) => {
    //if (round >= 11 && round <= 13) return `${round}th`;
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
  
  return(
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
              <p className="text-gray-300 leading-relaxed">
                Based on the player's stats and our prediction model, {playerName} shows the qualities of a {getRoundSuffix(draftRound)} round prospect. 
                {draftRound <= 3 ? 
                  ` As an early-round talent, they demonstrate exceptional ability at the ${playerPosition} position and could make an immediate impact in the NFL.` :
                  ` While not projected as an early pick, they show promising potential and could develop into a valuable contributor with the right coaching and system fit.`
                }
              </p>
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