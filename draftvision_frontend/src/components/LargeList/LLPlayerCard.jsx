// components/PlayerCard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { generatePlayerBio } from '../../services/api';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";


const PlayerCard = ({ player, stats, onBioGenerated, players }) => {

  // bio isn't ready yet -- not implemented. 

  const [activeView, setActiveView] = useState('profile');
  // Initialize bio state from player.bio if available.
  const [bio, setBio] = useState(player.bio || '');
  // Prevent multiple requests within the same session.
  const bioRequestedRef = useRef(false);

  useEffect(() => {
    if (activeView === 'biography' && !bio && !bioRequestedRef.current) {
      bioRequestedRef.current = true;
      const fetchBio = async () => {
        try {
          const generatedBio = await generatePlayerBio(player);
          if (generatedBio) {
            setBio(generatedBio);
            // Notify the parent so that the player's data is updated with the new bio.
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

  // shows default profile tab.
  const renderProfileView = () => (
    <div>
      <h2 className="text-3xl font-bold mb-4">{player.name}</h2>
      <p className="text-lg mb-2">
        <span className="font-semibold">Position:</span> {player.position}
      </p>
      <p className="text-lg mb-2">
        <span className="font-semibold">School:</span> {player.school}
      </p>
      <p className="text-lg mb-2">
        <span className="font-semibold">Years in NCAA:</span>{' '}
        {Array.isArray(player.years_ncaa)
          ? player.years_ncaa.join(', ')
          : typeof player.years_ncaa === 'string'
          ? player.years_ncaa.split(',').map((y) => y.trim()).join(', ')
          : 'N/A'}
      </p>
      <p className="text-lg mb-2">
        <span className="font-semibold">Year Drafted:</span> {player.year_drafted || 'N/A'}
      </p>
      <p className="text-lg mb-2">
  <   span className="font-semibold">Drafted:</span> Round {player.draft_round || 'N/A'} Pick {player.draft_pick || 'N/A'}
      </p>
    </div>
  );

  // the "stats" tab of the card. custom-made for each position group 
  const renderStatsView = () => {
    if (!stats || stats.length === 0) {
      return <p className="text-lg">No stats available for this player.</p>;
    }
    return (
      <div>
        <h3 className="text-2xl font-bold mb-4">Player Stats</h3>
        {stats.map((stat, index) => (
          <div key={index} className="mb-4 border-b pb-2">
            <p className="font-semibold">Season: {stat.year || 'N/A'}</p>
            {player.position.toLowerCase() === 'qb' && (
              <div>
                <p className="text-lg">Passing Yards per Game: {stat.yds_g}</p>
                <p className="text-lg">Passing Yards per Game: {stat.td}</p>
                <p className="text-lg">Passer Rating: {stat.ratings}</p>
                <p className="text-lg">Awards: {stat.awards}</p>
              </div>
            )}
            {['rb'].includes(player.position.toLowerCase()) && (
              <div>
                <p className="text-lg">Awards: {stat.awards}</p>
                <p className="text-lg">Rushing Yds per Game: {stat.rush_ypg}</p>
                <p className="text-lg">Rushing Touchdowns: {stat.rush_td}</p>
              </div>
            )}
            {['wr', 'te'].includes(player.position.toLowerCase()) && (
              <div>
                <p className="text-lg">Awards: {stat.awards}</p>
                <p className="text-lg">Yds per Game: {stat.ypg}</p>
                <p className="text-lg">Touchdowns: {stat.td}</p>
              </div>
            )}
            {['ol', 'ot', 'g', 'c', 'og', 't'].includes(player.position.toLowerCase()) && (
              <div>
                <p className="text-lg">Rushing Yards: {stat.rush_yds}</p>
                <p className="text-lg">Rushing First Downs: {stat.rush_first_downs}</p>
                <p className="text-lg">Rushing Touchdowns: {stat.rush_td}</p>
              </div>
            )}
            {['dl', 'de', 'dt', 'nt'].includes(player.position.toLowerCase()) && (
              <div>
                <p className="text-lg">TFL: {stat.TFL}</p>
                <p className="text-lg">Sacks: {stat.sacks}</p>
                <p className="text-lg">QB Hurries: {stat.hur}</p>
              </div>
            )}
            {['lb', 'ilb', 'olb'].includes(player.position.toLowerCase()) && (
              <div>
                <p className="text-lg">TFL: {stat.TFL}</p>
                <p className="text-lg">Sacks: {stat.sacks}</p>
                <p className="text-lg">Tackles {stat.tot}</p>
              </div>
            )}
            {['db','cb', 's'].includes(player.position.toLowerCase()) && (
              <div>
                <p className="text-lg">Pass Deflections: {stat.pd}</p>
                <p className="text-lg">Tackles: {stat.tot}</p>
                <p className="text-lg">Touchdowns: {stat.td}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // not implemented yet- api issues 
  const renderBiographyView = () => (
    <div>
      <h3 className="text-2xl font-bold mb-4">Biography</h3>
      <p className="text-lg">{bio || "Loading biography..."}</p>
    </div>
  );

  // Impact Graph tab. 
  const renderImpactGraph = () => {
    const filteredPlayers = players.filter(p => p.position === player.position); 
    const data = filteredPlayers.map(p => ({
      draftPosition: p.draft_pick,
      impactRating: p.predictions?.xAV || 5,
      name: p.name,
      id: p.id
    }));

    // scatter chart portion. 
    return (
      <ResponsiveContainer width="100%" height='100%'>
        <ScatterChart margin={{top:10, right:20, bottom:60, left:20}}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="draftPosition" name="Draft Position" label={{ value: "Draft Position", position: "bottom", }} reversed />
          <YAxis type="number" dataKey="impactRating" name="Impact Rating" label={{ value: "Impact Rating", angle: -90, position: "left" }} />
          <Tooltip 
            cursor={{ strokeDasharray: "3 3" }} 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const dataPoint = payload[0].payload;
                return (
                  <div className="bg-white p-2 border rounded shadow-md">
                    <p><strong>Name:</strong> {dataPoint.name}</p>
                    <p><strong>Draft Position:</strong> {dataPoint.draftPosition}</p>
                    <p><strong>Impact Rating:</strong> {dataPoint.impactRating}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Scatter name="Players" data={data} fill="#8884d8"/>
          
          {player && (
            <Scatter
              name="Selected Player"
              data={[{
                draftPosition: player.draft_pick,
                impactRating: player.predictions.xAV,
                name: player.name
              }]}
              fill="red"
              shape="circle"
              r={8}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  const renderViewToggles = () => (
    <div className="flex flex-col space-y-4 bg-gray-100 p-4">
      <button
        className={`py-2 px-4 rounded transition-colors ${
          activeView === 'profile'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-300 text-gray-800'
        }`}
        onClick={() => setActiveView('profile')}
      >
        Profile
      </button>
      <button
        className={`py-2 px-4 rounded transition-colors ${
          activeView === 'stats'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-300 text-gray-800'
        }`}
        onClick={() => setActiveView('stats')}
      >
        Stats
      </button>
      <button 
        className={`py-2 px-4 rounded transition-colors ${
          activeView === 'impact' 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-300 text-gray-800'
        }`} 
        onClick={() => setActiveView('impact')}
      >
        Impact Graph
      </button>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-xl overflow-hidden w-[800px] h-[400px]">
      <div className="flex-1 p-6 overflow-y-auto">
        {activeView === 'profile'
          ? renderProfileView()
          : activeView === 'stats'
          ? renderStatsView()
          : renderImpactGraph()}
      </div>
      <div className="md:w-32">{renderViewToggles()}</div>
    </div>
  );
};

export default PlayerCard;
