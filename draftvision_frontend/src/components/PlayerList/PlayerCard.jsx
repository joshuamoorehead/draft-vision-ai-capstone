// components/PlayerCard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { generatePlayerBio } from '../../services/api';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

import { createClient } from "@supabase/supabase-js";
import { useNavigate } from 'react-router-dom';


const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const tables = {
  'db_playerprofile': ['draft_round', 'draft_pick', 'career_av', 'draft_av'],
  'db_passingleaders': ['yds','yds_g', 'td', 'int', 'ratings'],
  'db_recstats': ['yds', 'rec', 'td', 'ypc', 'ypg'],
  'db_rbstats': ['yds', 'rush_td', 'rush_ypg', 'yds_att'],
  'db_defensivepositionalstats': ['TFL', 'sacks', 'qb_hits', 'pass_def', 'int', 'td', 'solo', 'pd'],
  'db_combine': ['forty', 'bench', 'vertical', 'broadjump', 'threecone', 'shuttle'],
};

// User-friendly labels for tables
const tableLabels = {
  'db_playerprofile': 'Draft Profile',
  'db_passingleaders': 'Passing Stats',
  'db_recstats': 'Receiving Stats',
  'db_rbstats': 'Rushing Stats',
  'db_defensivepositionalstats': 'Defensive Stats',
  'db_combine': 'Combine Results'
};

// User-friendly labels for columns
const columnLabels = {
  // Player Profile
  'draft_round': 'Draft Round',
  'draft_pick': 'Draft Pick',
  'career_av': 'Career AV',
  'draft_av': 'Draft AV',
  
  // Passing Stats
  'yds': 'Passing Yards',
  'yds_g': 'Yards per Game',
  'td': 'Touchdowns',
  'int': 'Interceptions',
  'ratings': 'Passer Rating',
  
  // Receiving Stats
  'rec': 'Receptions',
  'ypc': 'Yards per Catch',
  'ypg': 'Yards per Game',
  
  // Rushing Stats
  'rush_td': 'Rushing TDs',
  'rush_ypg': 'Rushing YPG',
  'yds_att': 'Yards per Attempt',
  
  // Defensive Stats
  'TFL': 'Tackles for Loss',
  'sacks': 'Sacks',
  'qb_hits': 'QB Hits',
  'pass_def': 'Passes Defended',
  'solo': 'Solo Tackles',
  'pd': 'Passes Defended',
  
  // Combine Results
  'height': 'Height',
  'weight': 'Weight',
  'forty': '40 Yard Dash',
  'bench': 'Bench Press',
  'vertical': 'Vertical Jump',
  'broadjump': 'Broad Jump',
  'threecone': '3 Cone Drill',
  'shuttle': '20 Yard Shuttle'
};

// Map positions to their available tables
const positionTables = {
  'QB': ['db_playerprofile', 'db_passingleaders', 'db_combine'],
  'RB': ['db_playerprofile', 'db_rbstats', 'db_combine'],
  'WR': ['db_playerprofile', 'db_recstats', 'db_combine'],
  'TE': ['db_playerprofile', 'db_recstats', 'db_combine'],
  'OL': ['db_playerprofile', 'db_combine'],
  'OT': ['db_playerprofile', 'db_combine'],
  'OG': ['db_playerprofile', 'db_combine'],
  'C': ['db_playerprofile', 'db_combine'],
  'T': ['db_playerprofile', 'db_combine'],
  'G': ['db_playerprofile', 'db_combine'],
  // Default case for all defensive positions
  'default': ['db_playerprofile', 'db_defensivepositionalstats', 'db_combine']
};

const PlayerCard = ({ player, stats, onBioGenerated, players }) => {
  const [activeView, setActiveView] = useState('profile');
  const [bio, setBio] = useState(player.bio || '');
  const bioRequestedRef = useRef(false);
  
  // Graph state
  const [xTable, setXTable] = useState('db_playerprofile');
  const [xColumn, setXColumn] = useState('draft_round');
  const [yTable, setYTable] = useState('db_playerprofile');
  const [yColumn, setYColumn] = useState('career_av');
  const [graphData, setGraphData] = useState([]);

  // get available tables for the player's position
  const getAvailableTables = (position) => {
    // Check if position is a defensive position (not QB, RB, WR, TE, or OL)
    if (!['QB', 'RB', 'WR', 'TE', 'OL', 'OT', 'OG', 'C', 'T', 'G'].includes(position)) {
      return positionTables['default'];
    }
    return positionTables[position] || positionTables['default'];
  };

  // Get available columns for a table
  const getAvailableColumns = (table) => {
    return tables[table] || [];
  };

  useEffect(() => {
    if (activeView === 'biography' && !bio && !bioRequestedRef.current) {
      bioRequestedRef.current = true;
      const fetchBio = async () => {
        try {
          const generatedBio = await generatePlayerBio(player);
          if (generatedBio) {
            setBio(generatedBio);
            if (onBioGenerated) {
              onBioGenerated(player.id, generatedBio);
            }
          }
        } catch (err) {
          console.error("Error generating bio:", err.message);
        }
      };
      fetchBio();
    }
  }, [activeView, bio, player, onBioGenerated]);

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
      'DB': 'from-teal-500 to-teal-600',
      'S': 'from-cyan-500 to-cyan-600',
      'CB': 'from-emerald-500 to-emerald-600'
    };
    
    if (!pos) return 'from-gray-500 to-gray-600';
    
    for (const key in positionColors) {
      if (pos.toLowerCase().includes(key.toLowerCase())) {
        return positionColors[key];
      }
    }
    return 'from-gray-500 to-gray-600';
  };

  const renderProfileView = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <div className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center bg-gradient-to-br ${getPositionColor(player.position)} text-white text-xl font-bold`}>
          {player.position}
        </div>
        <div className="ml-4">
          <h2 className="text-3xl font-bold text-gray-100">{player.name}</h2>
          <p className="text-blue-400">{player.school || 'Unknown School'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Years in NCAA</h3>
          <p className="text-white text-lg font-medium">
            {Array.isArray(player.years_ncaa)
              ? player.years_ncaa.join(', ')
              : typeof player.years_ncaa === 'string'
              ? player.years_ncaa.split(',').map((y) => y.trim()).join(', ')
              : 'N/A'}
          </p>
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Year Drafted</h3>
          <p className="text-white text-lg font-medium">{player.year_drafted || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
        <h3 className="text-gray-400 text-sm font-medium mb-2">Draft Position</h3>
        <div className="flex items-center">
          <div className="bg-gray-700 px-3 py-1 rounded-lg">
            <span className="text-white font-medium">Round {player.draft_round || 'N/A'}</span>
          </div>
          <div className="mx-2 text-gray-500">•</div>
          <div className="bg-gray-700 px-3 py-1 rounded-lg">
            <span className="text-white font-medium">Pick {player.draft_pick || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      {player.nfl_team && (
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm font-medium mb-2">NFL Team</h3>
          <p className="text-white text-lg font-medium">{player.nfl_team}</p>
        </div>
      )}
    </div>
  );

  const renderStatsView = () => {
    if (!stats || stats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg text-gray-400">No stats available for this player.</p>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-2xl font-bold mb-6 text-white">Player Statistics</h3>
        <div className="space-y-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-white font-bold text-lg">Season {stat.year || 'N/A'}</h4>
                {stat.awards && (
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs rounded-full font-medium">
                    {stat.awards}
                  </span>
                )}
              </div>
              
              {player.position.toLowerCase() === 'qb' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Passing Yards/Game</p>
                    <p className="text-white font-medium">{stat.yds_g}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Passer Rating</p>
                    <p className="text-white font-medium">{stat.ratings}</p>
                  </div>
                </div>
              )}
              
              {['rb', 'wr', 'te'].includes(player.position.toLowerCase()) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Conference</p>
                    <p className="text-white font-medium">{stat.conference_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Team</p>
                    <p className="text-white font-medium">{stat.team_id || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBiographyView = () => (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-white">Biography</h3>
      {bio ? (
        <p className="text-gray-300 leading-relaxed">{bio}</p>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
          <p className="text-gray-400 mt-4">Generating player biography...</p>
        </div>
      )}
    </div>
  );

  const renderGraphView = () => {
    const availableTables = getAvailableTables(player.position);
    
    return (
      <div className="h-full">
        <h3 className="text-2xl font-bold mb-4 text-white">Custom Graph</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-gray-400">X-Axis Table</label>
            <select 
              className="w-full bg-gray-800 text-white rounded p-2"
              value={xTable}
              onChange={(e) => {
                setXTable(e.target.value);
                setXColumn(getAvailableColumns(e.target.value)[0]);
              }}
            >
              {availableTables.map(table => (
                <option key={table} value={table}>{tableLabels[table]}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-gray-400">X-Axis Column</label>
            <select 
              className="w-full bg-gray-800 text-white rounded p-2"
              value={xColumn}
              onChange={(e) => setXColumn(e.target.value)}
            >
              {getAvailableColumns(xTable).map(column => (
                <option key={column} value={column}>{columnLabels[column]}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-gray-400">Y-Axis Table</label>
            <select 
              className="w-full bg-gray-800 text-white rounded p-2"
              value={yTable}
              onChange={(e) => {
                setYTable(e.target.value);
                setYColumn(getAvailableColumns(e.target.value)[0]);
              }}
            >
              {availableTables.map(table => (
                <option key={table} value={table}>{tableLabels[table]}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-gray-400">Y-Axis Column</label>
            <select 
              className="w-full bg-gray-800 text-white rounded p-2"
              value={yColumn}
              onChange={(e) => setYColumn(e.target.value)}
            >
              {getAvailableColumns(yTable).map(column => (
                <option key={column} value={column}>{columnLabels[column]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <button
            onClick={async () => {
              try {
                // First, get all player IDs for the given position from db_playerprofile
                const { data: playerProfiles, error: profileError } = await supabase
                  .from('db_playerprofile')
                  .select('id, name')
                  .eq('position', player.position);

                if (profileError) throw profileError;

                // Extract just the IDs
                const playerIds = playerProfiles.map(profile => profile.id);
                console.log('Player IDs:', playerIds);

                // Create a map of player IDs to names for later use
                const playerNameMap = playerProfiles.reduce((acc, profile) => {
                  acc[profile.id] = profile.name;
                  return acc;
                }, {});

                // Function to fetch data from a specific table
                const fetchTableData = async (table, column) => {
                  if (table === 'db_playerprofile') {
                    // Special handling for playerprofile table
                    const { data, error } = await supabase
                      .from(table)
                      .select('id, ' + column)
                      .in('id', playerIds);
                    
                    if (error) throw error;
                    return data;
                  } else {
                    // Normal handling for other tables
                    const { data, error } = await supabase
                      .from(table)
                      .select('playerid_id, ' + column)
                      .in('playerid_id', playerIds);
                    
                    if (error) throw error;
                    return data;
                  }
                };

                // Fetch X and Y data separately
                const xData = await fetchTableData(xTable, xColumn);
                const yData = await fetchTableData(yTable, yColumn);

                console.log('X Data:', xData);
                console.log('Y Data:', yData);

                // Combine the data
                const formattedData = playerIds.map(playerId => {
                  const xRecord = xData.find(d => 
                    xTable === 'db_playerprofile' ? d.id === playerId : d.playerid_id === playerId
                  );
                  const yRecord = yData.find(d => 
                    yTable === 'db_playerprofile' ? d.id === playerId : d.playerid_id === playerId
                  );

                  if (xRecord && yRecord) {
                    return {
                      xValue: xRecord[xColumn],
                      yValue: yRecord[yColumn],
                      name: playerNameMap[playerId],
                      id: playerId
                    };
                  }
                  return null;
                }).filter(Boolean); // Remove null entries
                
                console.log('Formatted data:', formattedData);
                setGraphData(formattedData);
              } catch (error) {
                console.error("Error fetching players:", error);
              }
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Search Players
          </button>
        </div>

        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 60, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                type="number" 
                dataKey="xValue" 
                name={xColumn} 
                label={{ 
                  value: columnLabels[xColumn], 
                  position: "bottom", 
                  fill: "#9CA3AF",
                  style: { fontSize: '12px' }
                }} 
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                type="number" 
                dataKey="yValue" 
                name={yColumn} 
                label={{ 
                  value: columnLabels[yColumn], 
                  angle: -90, 
                  position: "left", 
                  fill: "#9CA3AF",
                  style: { fontSize: '12px' }
                }} 
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: "3 3" }} 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="bg-gray-800 p-2 border border-gray-700 rounded shadow-lg">
                        <p className="text-white"><strong>Name:</strong> {dataPoint.name}</p>
                        <p className="text-gray-300"><strong>{columnLabels[xColumn]}:</strong> {dataPoint.xValue}</p>
                        <p className="text-blue-400"><strong>{columnLabels[yColumn]}:</strong> {dataPoint.yValue}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              <Scatter 
                name={`Other ${player.position}s`} 
                data={graphData} 
                fill="#6366F1" 
                opacity={0.7} 
              />
              
              {player && (
                <Scatter
                  name={player.name}
                  data={[{
                    xValue: player[xColumn],
                    yValue: player[yColumn],
                    name: player.name
                  }]}
                  fill="#EF4444"
                  shape="circle"
                  r={8}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center mt-4 space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
            <span className="text-sm text-gray-400">Other {player.position}s</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-400">{player.name}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderViewToggles = () => (
    <div className="bg-gray-800 bg-opacity-50 rounded-xl p-5 flex flex-col space-y-3 h-full">
      <button
        className={`py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
          activeView === 'profile'
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
            : 'bg-gray-700 bg-opacity-70 text-gray-300 hover:bg-opacity-100'
        }`}
        onClick={() => setActiveView('profile')}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16 9C16 11.2091 14.2091 13 12 13C9.79086 13 8 11.2091 8 9C8 6.79086 9.79086 5 12 5C14.2091 5 16 6.79086 16 9ZM14 9C14 10.1046 13.1046 11 12 11C10.8954 11 10 10.1046 10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1ZM3 12C3 14.0902 3.71255 16.014 4.90798 17.5417C6.55245 15.3889 9.14627 14 12.0645 14C14.9448 14 17.5092 15.3531 19.1565 17.4583C20.313 15.9443 21 14.0524 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12ZM12 21C9.84977 21 7.87565 20.2459 6.32767 18.9878C7.59352 17.1812 9.69106 16 12.0645 16C14.4084 16 16.4833 17.1521 17.7538 18.9209C16.1939 20.2191 14.1881 21 12 21Z"
            fill="currentColor"
          />
        </svg>
        Profile
      </button>
      <button
        className={`py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
          activeView === 'stats'
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
            : 'bg-gray-700 bg-opacity-70 text-gray-300 hover:bg-opacity-100'
        }`}
        onClick={() => setActiveView('stats')}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
        >
          <path d="M5 9V7H7V9H5Z" fill="currentColor" />
          <path d="M9 9H19V7H9V9Z" fill="currentColor" />
          <path d="M5 15V17H7V15H5Z" fill="currentColor" />
          <path d="M19 17H9V15H19V17Z" fill="currentColor" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1 6C1 4.34315 2.34315 3 4 3H20C21.6569 3 23 4.34315 23 6V18C23 19.6569 21.6569 21 20 21H4C2.34315 21 1 19.6569 1 18V6ZM4 5H20C20.5523 5 21 5.44772 21 6V11H3V6C3 5.44772 3.44772 5 4 5ZM3 13V18C3 18.5523 3.44772 19 4 19H20C20.5523 19 21 18.5523 21 18V13H3Z"
            fill="currentColor"
          />
        </svg>
        Stats
      </button>
      <button
        className={`py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
          activeView === 'biography'
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
            : 'bg-gray-700 bg-opacity-70 text-gray-300 hover:bg-opacity-100'
        }`}
        onClick={() => setActiveView('biography')}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
        >
          <path d="M7 18H17V16H7V18Z" fill="currentColor" />
          <path d="M17 14H7V12H17V14Z" fill="currentColor" />
          <path d="M7 10H11V8H7V10Z" fill="currentColor" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z"
            fill="currentColor"
          />
        </svg>
        Bio
      </button>
      <button 
        className={`py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
          activeView === 'graph' 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
          : 'bg-gray-700 bg-opacity-70 text-gray-300 hover:bg-opacity-100'
        }`} 
        onClick={() => setActiveView('graph')}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M22.775 8C22.9242 8.65461 23 9.32542 23 10H14V1C14.6746 1 15.3454 1.07584 16 1.22504C16.4923 1.33724 16.9754 1.49094 17.4442 1.68508C18.5361 2.13738 19.5282 2.80031 20.364 3.63604C21.1997 4.47177 21.8626 5.46392 22.3149 6.55585C22.5091 7.02455 22.6628 7.5077 22.775 8ZM20.7082 8C20.6397 7.77018 20.5593 7.54361 20.4672 7.32122C20.1154 6.47194 19.5998 5.70026 18.9497 5.05025C18.2997 4.40024 17.5281 3.88463 16.6788 3.53284C16.4564 3.44073 16.2298 3.36031 16 3.2918V8H20.7082Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1 14C1 9.02944 5.02944 5 10 5C10.6746 5 11.3454 5.07584 12 5.22504V12H18.775C18.9242 12.6546 19 13.3254 19 14C19 18.9706 14.9706 23 10 23C5.02944 23 1 18.9706 1 14ZM16.8035 14H10V7.19648C6.24252 7.19648 3.19648 10.2425 3.19648 14C3.19648 17.7575 6.24252 20.8035 10 20.8035C13.7575 20.8035 16.8035 17.7575 16.8035 14Z"
            fill="currentColor"
          />
        </svg>
        Graph
      </button>
      
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row bg-gray-900 bg-opacity-90 rounded-xl shadow-2xl border border-indigo-500 border-opacity-30 overflow-hidden w-full h-[500px]">
      <div className="flex-1 p-6 overflow-y-auto">
        {activeView === 'profile'
          ? renderProfileView()
          : activeView === 'stats'
          ? renderStatsView()
          : activeView === 'graph'
          ? renderGraphView()
          : renderBiographyView()}
      </div>
      <div className="md:w-40 p-2">{renderViewToggles()}</div>
    </div>
  );
};

export default PlayerCard;