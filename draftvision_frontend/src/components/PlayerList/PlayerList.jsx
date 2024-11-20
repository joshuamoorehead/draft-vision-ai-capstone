// src/components/PlayerList/PlayerList.jsx

import React from 'react';

const PlayerList = ({ players, onSelectPlayer }) => {
  return (
    <div className="space-y-4">
      {players.map((player, index) => (
        <div 
          key={player.id}
          className="w-full bg-gray-100 border-2 border-black p-4 flex items-center cursor-pointer"
          onClick={() => onSelectPlayer(player.id)}
        >
          <div className="w-16 text-center text-xl font-semibold">
            {index + 1}
          </div>
          
          <div className="w-24 h-24 rounded-full overflow-hidden mx-4">
            <img 
              src="/api/placeholder/96/96"
              alt={player.name}
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium">{player.name}</h3>
            <p className="text-lg">{player.school}</p>
            <p className="text-lg">{player.position}</p>
          </div>
          
          <div className="text-right mr-8">
            <p className="text-lg">Player Rating:</p>
            <p className="text-3xl font-medium">{player.rating}</p>
          </div>
          
          <button className="w-12 h-12 border-4 border-black rounded">
            →
          </button>
        </div>
      ))}
    </div>
  );
};

export default PlayerList;
