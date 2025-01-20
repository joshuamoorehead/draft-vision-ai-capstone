import React from 'react'; 
import { useLocation } from 'react-router-dom';

const DraftRoom = () => {
  const location = useLocation();
  const selectedTeams = location.state?.selectedTeams || [];
  const teamLocations = [
    "Atlanta",
    "Baltimore",
    "Buffalo",
    "Arizona",
    "Carolina",
    "Chicago",
    "Cincinnati",
    "Cleveland",
    "Dallas",
    "Denver",
    "Detroit",
    "Green Bay",
    "Houston",
    "Indianapolis",
    "Kansas City",
    "Jacksonville",
    "Los Angeles (Chargers)",
    "Los Angeles (Rams)",
    "Las Vegas",
    "Miami",
    "Minnesota",
    "New England",
    "New Orleans",
    "New York (Giants)",
    "New York (Jets)",
    "Philadelphia",
    "Pittsburgh",
    "Seattle",
    "San Francisco",
    "Tampa Bay",
    "Tennessee",
    "Washington",
  ];

  return (
    <div className="min-h-screen bg-[#5A6BB0] text-white text-center p-8">
      <h1 className="text-4xl font-bold mb-4">Draft Room</h1>
      <p className="text-lg mb-8">Welcome to the draft room!</p>
      {selectedTeams.length > 0 ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Selected Teams:</h2>
          <ul className="list-disc list-inside">
            {selectedTeams.map((teamIndex) => (
              <li key={teamIndex}>{teamLocations[teamIndex]}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-lg">No teams selected. You can still proceed with the draft.</p>
      )}
    </div>
  );
};

export default DraftRoom;
