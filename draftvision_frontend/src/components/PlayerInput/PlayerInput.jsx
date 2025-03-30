import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/main.css';
import PageTransition from '../Common/PageTransition';

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const PlayerInput = () => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [year, setYear] = useState('2024');
  const [draftRound, setDraftRound] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Stats states for different positions
  const [statQBPassYds, setStatQBPassYds] = useState('');
  const [statQBRushYds, setStatQBRushYds] = useState('');
  const [statQBTds, setStatQBTds] = useState('');
  const [statQBInt, setStatQBInt] = useState('');

  const [statRBRushYds, setStatRBRushYds] = useState('');
  const [statRBCarries, setStatRBCarries] = useState('');
  const [statRBTds, setStatRBTds] = useState('');

  const [statWRRecYds, setStatWRRecYds] = useState('');
  const [statWRRec, setStatWRRec] = useState('');
  const [statWRTds, setStatWRTds] = useState('');

  const [statTERecYds, setStatTERecYds] = useState('');
  const [statTERec, setStatTERec] = useState('');
  const [statTETds, setStatTETds] = useState('');

  const [statOL40, setStatOL40] = useState('');
  const [statOLCone, setStatOLCone] = useState('');
  const [statOLShuttle, setStatOLShuttle] = useState('');
  const [statOLBench, setStatOLBench] = useState('');

  const [statDefTackles, setStatDefTackles] = useState('');
  const [statDefInt, setStatDefInt] = useState('');

  const [proCompName, setProCompName] = useState('');
  const [proCompTeam, setProCompTeam] = useState('');

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

  // Render fields based on selected position
  const renderPositionSpecificFields = () => {
    switch (position) {
      case 'QB':
        return (
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getPositionColor('QB')} flex items-center justify-center mr-3 text-xs font-bold`}>
                QB
              </div>
              Quarterback Stats
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Passing Yards</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full pl-4 pr-10 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                    placeholder="Enter passing yards" 
                    value={statQBPassYds}
                    onChange={(e) => setStatQBPassYds(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">yds</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Rushing Yards</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full pl-4 pr-10 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                    placeholder="Enter rushing yards" 
                    value={statQBRushYds}
                    onChange={(e) => setStatQBRushYds(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">yds</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Touchdowns</label>
                <input 
                  type="number" 
                  className="w-full pl-4 pr-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                  placeholder="Enter touchdowns" 
                  value={statQBTds}
                  onChange={(e) => setStatQBTds(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Interceptions</label>
                <input 
                  type="number" 
                  className="w-full pl-4 pr-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                  placeholder="Enter interceptions" 
                  value={statQBInt}
                  onChange={(e) => setStatQBInt(e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 'RB':
        return (
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getPositionColor('RB')} flex items-center justify-center mr-3 text-xs font-bold`}>
                RB
              </div>
              Running Back Stats
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Rushing Yards</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full pl-4 pr-10 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                    placeholder="Enter rushing yards" 
                    value={statRBRushYds}
                    onChange={(e) => setStatRBRushYds(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">yds</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Carries</label>
                <input 
                  type="number" 
                  className="w-full pl-4 pr-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                  placeholder="Enter rushing attempts" 
                  value={statRBCarries}
                  onChange={(e) => setStatRBCarries(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Touchdowns</label>
                <input 
                  type="number" 
                  className="w-full pl-4 pr-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                  placeholder="Enter touchdowns" 
                  value={statRBTds}
                  onChange={(e) => setStatRBTds(e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 'WR':
        return (
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getPositionColor('WR')} flex items-center justify-center mr-3 text-xs font-bold`}>
                WR
              </div>
              Wide Receiver Stats
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Receiving Yards</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full pl-4 pr-10 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                    placeholder="Enter receiving yards" 
                    value={statWRRecYds}
                    onChange={(e) => setStatWRRecYds(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">yds</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Receptions</label>
                <input 
                  type="number" 
                  className="w-full pl-4 pr-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                  placeholder="Enter receptions" 
                  value={statWRRec}
                  onChange={(e) => setStatWRRec(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Touchdowns</label>
                <input 
                  type="number" 
                  className="w-full pl-4 pr-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                  placeholder="Enter touchdowns" 
                  value={statWRTds}
                  onChange={(e) => setStatWRTds(e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 'TE':
        return (
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getPositionColor('TE')} flex items-center justify-center mr-3 text-xs font-bold`}>
                TE
              </div>
              Tight End Stats
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Receiving Yards</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full pl-4 pr-10 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                    placeholder="Enter receiving yards" 
                    value={statTERecYds}
                    onChange={(e) => setStatTERecYds(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">yds</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Receptions</label>
                <input 
                  type="number" 
                  className="w-full pl-4 pr-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                  placeholder="Enter receptions" 
                  value={statTERec}
                  onChange={(e) => setStatTERec(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Touchdowns</label>
                <input 
                  type="number" 
                  className="w-full pl-4 pr-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                  placeholder="Enter touchdowns" 
                  value={statTETds}
                  onChange={(e) => setStatTETds(e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 'LB':
      case 'DL':
      case 'CB':
      case 'S':
        return (
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getPositionColor(position)} flex items-center justify-center mr-3 text-xs font-bold`}>
                {position}
              </div>
              Defensive Stats
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Tackles</label>
                <input 
                  type="number" 
                  className="w-full pl-4 pr-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                  placeholder="Enter tackles" 
                  value={statDefTackles}
                  onChange={(e) => setStatDefTackles(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Interceptions</label>
                <input 
                  type="number" 
                  className="w-full pl-4 pr-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                  placeholder="Enter interceptions" 
                  value={statDefInt}
                  onChange={(e) => setStatDefInt(e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 'OL':
        return (
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getPositionColor('OL')} flex items-center justify-center mr-3 text-xs font-bold`}>
                OL
              </div>
              Offensive Line Combine Results
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">40-yard Dash</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full pl-4 pr-10 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                    placeholder="Enter 40 time" 
                    value={statOL40}
                    onChange={(e) => setStatOL40(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">sec</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Three-cone Drill</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full pl-4 pr-10 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                    placeholder="Enter three-cone time" 
                    value={statOLCone}
                    onChange={(e) => setStatOLCone(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">sec</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">20-yard Shuttle Drill</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full pl-4 pr-10 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                    placeholder="Enter shuttle time" 
                    value={statOLShuttle}
                    onChange={(e) => setStatOLShuttle(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">sec</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Bench Press</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full pl-4 pr-10 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                    placeholder="Enter reps of 225" 
                    value={statOLBench}
                    onChange={(e) => setStatOLBench(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">reps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Validate inputs before navigating
  const validateInputs = () => {
    if (!name.trim()) {
      setError("Player name is required");
      return false;
    }
    
    if (!position) {
      setError("Please select a position");
      return false;
    }
    
    // Validate position-specific stats
    if (position === 'QB' && (!statQBPassYds && !statQBRushYds && !statQBTds)) {
      setError("Please enter at least one QB stat");
      return false;
    }
    
    if (position === 'RB' && (!statRBRushYds && !statRBCarries && !statRBTds)) {
      setError("Please enter at least one RB stat");
      return false;
    }
    
    if (position === 'WR' && (!statWRRecYds && !statWRRec && !statWRTds)) {
      setError("Please enter at least one WR stat");
      return false;
    }
    
    if (position === 'TE' && (!statTERecYds && !statTERec && !statTETds)) {
      setError("Please enter at least one TE stat");
      return false;
    }
    
    return true;
  };

  // Handle creating a player with full stats
  const handleNewPlayer = () => {
    if (!validateInputs()) return;
    
    try {
      navigate("/newplayercomp", { 
        state: { name, position, year, draftRound } 
      });
    } catch (err) {
      setError("Navigation error: " + err.message);
    }
  };

  // Handle creating a player with simplified stats and calculate draft round
  const handleSimplePlayer = async () => {
    if (!validateInputs()) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      let score = getRawScore();
      console.log("Calculated score:", score);
      const round = getDraftRound(score);
      setDraftRound(round);
      //await handleProComp();
      console.log("Pro Comparison player: ", proCompName);
      navigate("/newplayercomp", { 
        state: { name, position, year, draftRound: round, proCompName, proCompTeam} 
      });
    } catch (err) {
      setError("Error creating player: " + err.message);
      setSubmitting(false);
    }
  };

  const getProComparison = async (position) => {
    try {
        // Fetch all players of the same position
        /*const { data: players, error } = await supabase
            .from("db_playerprofile")
            .select(`
                name, position, draft_round, nfl_team, 
                db_combine(*),
                db_rbstats(*),
                db_passingleaders(*),
                db_recstats(*)
            `)
            .eq("position", position);*/

        const {data : players, error} = await supabase
              .from("db_playerprofile")
              .select('name, position, draft_round, nfl_team')
              .eq("position", position);

        if (error) {
            console.error("Error fetching players:", error);
            return null;
        }

        if (!players || players.length === 0) {
            console.warn("No players found for position:", position);
            return null;
        }

        let bestMatch = null;
        let bestScore = Infinity;
        let score = 0;

        console.log("Fetched Players:", players);


        players.forEach(player => {
            switch(position) {
              case "QB1":
                let proPassingYards = player.db_passingleaders?.passing_yards || 0;
                let proRushingYards = player.db_passingleaders?.rushing_yards || 0;
                let proTouchdowns = player.db_passingleaders?.touchdowns || 0;
                let proInterceptions = player.db_passingleaders?.interceptions || 0;

                score = 0;
                score += Math.pow(statQBPassYds - proPassingYards, 2);
                score += Math.pow(statQBRushYds - proRushingYards, 2);
                score += Math.pow(statQBTds - proTouchdowns, 2);
                score += Math.pow(statQBInt - proInterceptions, 2);
                score = Math.sqrt(score);
                break;
              case "RB1":
                let proRBRushYards = player.db_rbstats?.rushing_yards || 0;
                let proRBCarries = player.db_rbstats?.carries || 0;
                let proRBTouchdowns = player.db_rbstats?.touchdowns || 0;

                score = 0;
                score += Math.pow(statRBRushYds - proRBRushYards, 2);
                score += Math.pow(statRBCarries - proRBCarries, 2);
                score += Math.pow(statRBTds - proRBTouchdowns, 2);
                score = Math.sqrt(score);
                break;

              case "WR1":
                let proWRReceivingYards = player.db_recstats?.receiving_yards || 0;
                let proWRReceptions =  player.db_recstats?.receptions || 0;
                let proWRRecTouchdowns =  player.db_recstats?.touchdowns || 0;

                score = 0;
                score += Math.pow(statTERecYds - proWRReceivingYards, 2);
                score += Math.pow(statTERec - proWRReceptions, 2);
                score += Math.pow(statTETds - proWRRecTouchdowns, 2);
                score = Math.sqrt(score);
                break;
              case "TE1":
                let proReceivingYards = player.db_recstats?.receiving_yards || 0;
                let proReceptions =  player.db_recstats?.receptions || 0;
                let proRecTouchdowns =  player.db_recstats?.touchdowns || 0;

                score = 0;
                score += Math.pow(statTERecYds - proReceivingYards, 2);
                score += Math.pow(statTERec - proReceptions, 2);
                score += Math.pow(statTETds - proRecTouchdowns, 2);
                score = Math.sqrt(score);
                break;
              case "OL1":

                let proOL40 = player.db_combine?.forty || 0;
                let proOLCone = player.db_combine?.threecone || 0;
                let proOLShuttle = player.db_combine?.shuttle || 0;
                let proOLBench = player.db_combine?.bench || 0;

                score = 0;
                score += Math.pow(statOL40 - proOL40, 2);
                score += Math.pow(statOLCone - proOLCone, 2);
                score += Math.pow(statOLShuttle - proOLShuttle, 2);
                score += Math.pow(statOLBench - proOLBench, 2);
                score = Math.sqrt(score);
                break;

              default:
                score = 10;
                let proDefRound = player.draft_round || 0;
                //console.log("New Player Name: ", player.name);
                if(proDefRound === draftRound) {
                  score = 0;
                }
            }

            if (score < bestScore) {
                bestScore = score;
                bestMatch = player;
                //setProCompName(bestMatch.name);
                //setProCompTeam(bestMatch.nfl_team);
                //console.log("ProComped: ", proCompName);
            }
            
        }
      );
        //setProCompName(bestMatch.name);
        //setProCompTeam(bestMatch.nfl_team);
        return bestMatch;
    } catch (err) {
        console.error("Error in getProComparison:", err);
        return null;
    }
};

const handleProComp = async () => {
  const proPlayer = await getProComparison(position);
  setProCompName(proPlayer.name);
  setProCompTeam(proPlayer.nfl_team);
}

  // Calculate raw score based on position and stats
  const getRawScore = () => {
    let score = 0;
    switch(position) {
        case 'QB': 
          score = (parseFloat(statQBPassYds) * 0.01) + 
                  (parseFloat(statQBTds) * 0.8) + 
                  (parseFloat(statQBRushYds) * 0.02) - 
                  (parseFloat(statQBInt) * 0.4); 
          break;
        case 'RB': 
          score = (parseFloat(statRBRushYds) * 0.04) + 
                  (parseFloat(statRBCarries) * 0.02) + 
                  (parseFloat(statRBTds) * 0.8); 
          break;
        case 'WR': 
          score = (parseFloat(statWRRecYds) * 0.04) + 
                  (parseFloat(statWRRec) * 0.02) + 
                  (parseFloat(statWRTds) * 0.8); 
          break;
        case 'TE': 
          score = (parseFloat(statTERecYds) * 0.04) + 
                  (parseFloat(statTERec) * 0.02) + 
                  (parseFloat(statTETds) * 0.8); 
          break;
        case 'LB': 
        case 'DL':
        case 'CB':
        case 'S': 
          score = (parseFloat(statDefTackles) * 0.5) + 
                  (parseFloat(statDefInt) * 5); 
          break;
        case 'OL': 
          score = (parseFloat(statOL40) * -0.5) + 
                  (parseFloat(statOLCone) * -0.5) + 
                  (parseFloat(statOLShuttle) * -0.5) + 
                  (parseFloat(statOLBench) * 2);
          break;
        default: 
          score = 0;
    }
    
    // Convert NaN values to 0
    return isNaN(score) ? 0 : score;
  };

  // Determine draft round based on score
  const getDraftRound = (score) => {
    if (score >= 90) return 1;
    if (score >= 75) return 2;
    if (score >= 60) return 3;
    if (score >= 45) return 4;
    if (score >= 30) return 5;
    if (score >= 15) return 6;
    return 7;
  };

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
              Create Your <span className="text-blue-400">Player</span>
            </h1>
            <div className="h-1 w-32 bg-blue-400 mx-auto rounded my-4"></div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Design your own player with custom stats and see where they would get drafted in the NFL.
            </p>
          </div>
          
          {/* Main Form Area */}
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white border-opacity-20 max-w-4xl mx-auto mb-10">
            {/* Error message */}
            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 px-6 py-4 rounded-lg mb-6">
                <div className="flex items-center">
                <svg className="w-6 h-6 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
</svg>
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {/* Basic Player Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Player Name</label>
                <input 
                  type="text" 
                  className="w-full pl-4 pr-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200" 
                  placeholder="Enter player name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Position</label>
                <div className="relative">
                  <select 
                    className="appearance-none w-full pl-4 pr-10 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all duration-200" 
                    value={position} 
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    <option value="" className="bg-gray-800">Select a Position</option>
                    <option value="QB" className="bg-gray-800">Quarterback (QB)</option>
                    <option value="RB" className="bg-gray-800">Running Back (RB)</option>
                    <option value="WR" className="bg-gray-800">Wide Receiver (WR)</option>
                    <option value="TE" className="bg-gray-800">Tight End (TE)</option>
                    <option value="OL" className="bg-gray-800">Offensive Line (OL)</option>
                    <option value="CB" className="bg-gray-800">Cornerback (CB)</option>
                    <option value="S" className="bg-gray-800">Safety (S)</option>
                    <option value="LB" className="bg-gray-800">Linebacker (LB)</option>
                    <option value="DL" className="bg-gray-800">Defensive Line (DL)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Draft Year</label>
                <div className="relative">
                  <select 
                    className="appearance-none w-full pl-4 pr-10 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all duration-200" 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)}
                  >
                    {[...Array(14)].map((_, i) => {
                      const yearValue = 2024 - i;
                      return <option key={yearValue} value={yearValue} className="bg-gray-800">{yearValue}</option>;
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Position-specific fields */}
            {renderPositionSpecificFields()}
            
            {/* Submit Button */}
            <div className="mt-10 text-center">
              <button
                onClick={handleSimplePlayer}
                disabled={submitting}
                className={`px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  submitting ? "opacity-70 cursor-not-allowed" : "hover:from-blue-600 hover:to-indigo-700"
                }`}
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Player...
                  </div>
                ) : (
                  <>Create Player</>
                )}
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

export default PlayerInput;