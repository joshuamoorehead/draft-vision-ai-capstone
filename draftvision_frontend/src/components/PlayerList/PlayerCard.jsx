import React, { useState } from 'react';

const PlayerCard = ({ rank, name, position, school, value_score }) => {
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {/* Player Card */}
      <div
        className="p-4 border rounded shadow hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-gray-400">#{rank}</span>
            <div>
              <h3 className="text-lg font-semibold">{name}</h3>
              <p className="text-gray-600">{school}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2 py-1 bg-gray-200 rounded">{position}</span>
            <p className="mt-1 font-semibold text-blue-600">{value_score.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Modal for Player Details */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={closeModal}
            >
              ✕
            </button>

            {/* Player Details */}
            <div className="flex gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{name}</h2>
                <p className="text-gray-600 mb-4">{school} - {position}</p>
                <div className="text-sm text-gray-600">
                  <p><strong>Rank:</strong> #{rank}</p>
                  <p><strong>Value Score:</strong> {value_score.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlayerCard;
