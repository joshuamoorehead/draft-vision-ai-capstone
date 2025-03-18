import React, { useState, useMemo } from 'react';

const TradeModal = ({
  currentTeam,
  allDraftOrders,
  currentRound,
  currentPickIndex,
  currentRoundOrders,
  onSubmitTrade,
  onCancelTrade,
}) => {
  const getPickLabel = (order) => {
    const ordersInRound = allDraftOrders.filter((o) => Number(o.round) === Number(order.round));
    const pickNumber = ordersInRound.findIndex((o) => o.id === order.id) + 1;
    return `Round ${order.round} Pick ${pickNumber} - ${order.team}`;
  };

  const tradePartnerOptions = useMemo(() => {
    const teams = new Set(allDraftOrders.map((o) => o.team));
    teams.delete(currentTeam.team);
    return Array.from(teams);
  }, [allDraftOrders, currentTeam.team]);

  const [selectedUserPicks, setSelectedUserPicks] = useState([]);
  const [selectedPartnerPicks, setSelectedPartnerPicks] = useState([]);
  const [selectedTradePartner, setSelectedTradePartner] = useState(tradePartnerOptions[0] || "");

  const availableUserPicks = useMemo(() => {
    return allDraftOrders.filter((order) => {
      if (order.team !== currentTeam.team) return false;
      const orderRound = Number(order.round);
      if (orderRound === currentRound) {
        const idx = currentRoundOrders.findIndex((o) => o.id === order.id);
        return idx >= currentPickIndex;
      }
      return orderRound > currentRound;
    });
  }, [allDraftOrders, currentTeam.team, currentRound, currentPickIndex, currentRoundOrders]);

  const availablePartnerPicks = useMemo(() => {
    return allDraftOrders.filter((order) => {
      if (order.team !== selectedTradePartner) return false;
      const orderRound = Number(order.round);
      if (orderRound === currentRound) {
        const idx = currentRoundOrders.findIndex((o) => o.id === order.id);
        return idx >= currentPickIndex;
      }
      return orderRound > currentRound;
    });
  }, [allDraftOrders, selectedTradePartner, currentRound, currentPickIndex, currentRoundOrders]);

  const toggleUserPick = (orderId) => {
    setSelectedUserPicks((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };
  
  const togglePartnerPick = (orderId) => {
    setSelectedPartnerPicks((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSubmitTrade = () => {
    if (selectedUserPicks.length === 0 || selectedPartnerPicks.length === 0) {
      alert("Must select at least one pick from both sides.");
      return;
    }
    console.log("Submitting trade with:", { selectedTradePartner, selectedUserPicks, selectedPartnerPicks });
    onSubmitTrade(selectedTradePartner, selectedUserPicks, selectedPartnerPicks);
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-black bg-opacity-95 backdrop-filter backdrop-blur-sm flex justify-center items-center z-50">
      <div className="modal-content bg-gray-800 bg-opacity-70 p-6 rounded-2xl shadow-2xl border border-indigo-500 border-opacity-30 w-11/12 max-w-3xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white">
            Propose <span className="text-blue-400">Trade</span>
          </h2>
          <div className="h-1 w-24 bg-blue-400 mx-auto rounded mt-3"></div>
        </div>
        
        {/* Trade partner selector */}
        <div className="mb-6">
          <label className="text-gray-300 text-sm font-medium mb-2 block">Team to trade with:</label>
          <div className="relative">
            <select
              value={selectedTradePartner}
              onChange={(e) => setSelectedTradePartner(e.target.value)}
              className="w-full appearance-none bg-gradient-to-r from-blue-900 to-indigo-900 text-white border border-indigo-500 border-opacity-50 rounded-lg py-3 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all duration-200"
            >
              {tradePartnerOptions.map((team) => (
                <option key={team} value={team} className="bg-indigo-900 text-white">
                  {team}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Trade picks selection area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* USER AVAILABLE PICKS */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4 border border-indigo-500 border-opacity-20 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3 text-sm font-bold">
                {currentTeam.team ? currentTeam.team.substring(0, 3).toUpperCase() : "YOU"}
              </div>
              <h3 className="text-xl font-semibold text-white">Your Picks to Trade</h3>
            </div>
            
            {availableUserPicks.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {availableUserPicks.map((order) => (
                  <div 
                    key={order.id} 
                    className={`border border-gray-700 p-3 rounded-lg flex items-center transition-all duration-200 ${
                      selectedUserPicks.includes(order.id) 
                        ? 'bg-blue-900 bg-opacity-40 border-blue-500' 
                        : 'hover:bg-gray-700 hover:bg-opacity-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative mr-3">
                        <input
                          type="checkbox"
                          id={`user-pick-${order.id}`}
                          checked={selectedUserPicks.includes(order.id)}
                          onChange={() => toggleUserPick(order.id)}
                          className="opacity-0 absolute h-5 w-5 cursor-pointer"
                        />
                        <div className={`border-2 rounded-md w-5 h-5 flex flex-shrink-0 justify-center items-center mr-2 ${
                          selectedUserPicks.includes(order.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                        }`}>
                          <svg className={`fill-current w-3 h-3 text-white pointer-events-none ${selectedUserPicks.includes(order.id) ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 20 20">
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        </div>
                      </div>
                      <label htmlFor={`user-pick-${order.id}`} className="cursor-pointer text-gray-200">
                        {getPickLabel(order)}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-400 italic">No available picks.</p>
            )}
          </div>
          
          {/* PARTNER AVAILABLE PICKS */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4 border border-indigo-500 border-opacity-20 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mr-3 text-sm font-bold">
                {selectedTradePartner ? selectedTradePartner.substring(0, 3).toUpperCase() : "TM"}
              </div>
              <h3 className="text-xl font-semibold text-white">{selectedTradePartner}'s Picks</h3>
            </div>
            
            {availablePartnerPicks.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {availablePartnerPicks.map((order) => (
                  <div 
                    key={order.id} 
                    className={`border border-gray-700 p-3 rounded-lg flex items-center transition-all duration-200 ${
                      selectedPartnerPicks.includes(order.id) 
                        ? 'bg-purple-900 bg-opacity-40 border-purple-500' 
                        : 'hover:bg-gray-700 hover:bg-opacity-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative mr-3">
                        <input
                          type="checkbox"
                          id={`partner-pick-${order.id}`}
                          checked={selectedPartnerPicks.includes(order.id)}
                          onChange={() => togglePartnerPick(order.id)}
                          className="opacity-0 absolute h-5 w-5 cursor-pointer"
                        />
                        <div className={`border-2 rounded-md w-5 h-5 flex flex-shrink-0 justify-center items-center mr-2 ${
                          selectedPartnerPicks.includes(order.id) ? 'bg-purple-500 border-purple-500' : 'border-gray-400'
                        }`}>
                          <svg className={`fill-current w-3 h-3 text-white pointer-events-none ${selectedPartnerPicks.includes(order.id) ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 20 20">
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        </div>
                      </div>
                      <label htmlFor={`partner-pick-${order.id}`} className="cursor-pointer text-gray-200">
                        {getPickLabel(order)}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-400 italic">No available picks from partner.</p>
            )}
          </div>
        </div>
        
        {/* Trade Summary */}
        <div className="mt-6 bg-gray-800 bg-opacity-30 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-medium text-center text-gray-300 mb-2">Trade Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">You trade away:</p>
              {selectedUserPicks.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-gray-300">
                  {selectedUserPicks.map(id => {
                    const order = availableUserPicks.find(o => o.id === id);
                    return order ? (
                      <li key={id}>{getPickLabel(order)}</li>
                    ) : null;
                  })}
                </ul>
              ) : (
                <p className="text-gray-500 italic text-sm">No picks selected</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">You receive:</p>
              {selectedPartnerPicks.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-gray-300">
                  {selectedPartnerPicks.map(id => {
                    const order = availablePartnerPicks.find(o => o.id === id);
                    return order ? (
                      <li key={id}>{getPickLabel(order)}</li>
                    ) : null;
                  })}
                </ul>
              ) : (
                <p className="text-gray-500 italic text-sm">No picks selected</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleSubmitTrade}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Submit Trade
            </div>
          </button>
          <button
            onClick={onCancelTrade}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Cancel
            </div>
          </button>
        </div>
      </div>
      
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
};

export default TradeModal;