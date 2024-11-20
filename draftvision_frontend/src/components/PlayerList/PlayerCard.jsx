// src/components/PlayerList/PlayerCard.jsx

import React from 'react';

const PlayerCard = ({ player, onClose }) => {
  if (!player) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full">
        <div className="flex mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden">
            <img 
              src="/api/placeholder/128/128"
              alt={player.name}
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="ml-6">
            <h2 className="text-3xl font-bold">{player.name}</h2>
            <p className="text-xl">{player.school}</p>
            <p className="text-xl">{player.position}</p>
          </div>
        </div>

        {/* Player Stats Section */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Statistics:</h3>
          <div className="grid grid-cols-2 gap-4">
            {player.stats && Object.entries(player.stats).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          className="px-6 py-2 bg-red-200 rounded-lg"
          onClick={onClose}
        >
          Return to Large List
        </button>
      </div>
    </div>
  );
};

export default PlayerCard;
