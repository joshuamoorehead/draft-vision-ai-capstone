import React, { useState, useEffect, useMemo } from 'react';
import PlayerCard from "../../components/LargeList/LLPlayerCard"; // Adjust the path if necessary
import { fetchPlayerStats, fetchPlayerDetails2, fetch2024Players, supabase } from '../../services/api';

// Helper function to format picks 
const formatPicks = (ids, allDraftOrders) => {
  if (!ids || ids.length === 0) return "";
  return ids.map((id) => getPickLabelById(id, allDraftOrders)).join("; ");
};

// Helper: Get a "Round X Pick Y" label from an ID
function getPickLabelById(id, allDraftOrders) {
  const order = allDraftOrders.find((o) => o.id === id);
  if (!order) return `Pick #${id} (not found)`;
  const { round, team } = order;
  const ordersInRound = allDraftOrders.filter((o) => Number(o.round) === Number(round));
  const pickIndex = ordersInRound.findIndex((o) => o.id === id);
  const pickNum = pickIndex + 1;
  return `Round ${round} Pick ${pickNum} - ${team}`;
}

const UserPickModal = ({
  availablePlayers,
  // Parent may pass a full list of players as allPlayers.
  allPlayers,
  timePerPick,
  onPick,
  onTimeout,
  currentTeam,
  openTradeModal,
  allDraftOrders,
  currentRound,
  currentPickIndex,
  currentRoundOrders,
  onAcceptCpuTradeProposal,
}) => {
  const [timer, setTimer] = useState(timePerPick);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [filteredPlayers, setFilteredPlayers] = useState(availablePlayers);
  const [cpuTradeProposals, setCpuTradeProposals] = useState([]);
  const [playerCard, setPlayerCard] = useState(null); // For the player card modal

  // New state: full list of players for impact graphs
  const [fullPlayers, setFullPlayers] = useState(allPlayers || []);

  // If the full list is not provided, fetch it from the API.
  useEffect(() => {
    if (!allPlayers || allPlayers.length === 0) {
      fetch2024Players()
        .then((data) => {
          setFullPlayers(data);
        })
        .catch((err) => console.error("Error fetching full players list:", err));
    } else {
      setFullPlayers(allPlayers);
    }
  }, [allPlayers]);

  // Build positions dropdown
  const positions = useMemo(() => {
    if (!availablePlayers || availablePlayers.length === 0) return ["All"];
    const posSet = new Set(availablePlayers.map((p) => p.position));
    return ["All", ...Array.from(posSet)];
  }, [availablePlayers]);

  // Filter player list based on search term and position
  useEffect(() => {
    let players = availablePlayers.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (selectedPosition !== "All") {
      players = players.filter((p) => p.position === selectedPosition);
    }
    setFilteredPlayers(players);
  }, [searchTerm, selectedPosition, availablePlayers]);

  // Timer effect: if timer runs out, trigger onTimeout and close any open player card modal
  useEffect(() => {
    if (timer <= 0) {
      console.log("Timer reached zero. Triggering onTimeout and closing player card modal.");
      onTimeout();
      setPlayerCard(null);
      return;
    }
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, onTimeout]);

  // When a player card is requested, fetch the full player details by name,
  // then fetch predictions and stats.
  const handlePlayerCardOpen = async (player) => {
    console.log("View button clicked for player:", player);
    try {
      // Get full player details using the player's name
      const fullPlayer = await fetchPlayerDetails2(player.name);
      console.log("Fetched full player details for", player.name, ":", fullPlayer);
      // Fetch predictions for that player
      const { data: predData, error: predError } = await supabase
        .from('db_predictions_2024')
        .select('*')
        .eq('player_id', fullPlayer.id)
        .maybeSingle();
      if (predError) {
        console.error("Error fetching predictions for player", fullPlayer.id, predError.message);
      }
      fullPlayer.predictions = predData || { 
        xAV: parseFloat((11.31 / (fullPlayer.draft_round + 0.5) + 1.51).toFixed(2)) 
      };
      const stats = await fetchPlayerStats(fullPlayer.id, fullPlayer.position);
      console.log("Fetched stats for player", fullPlayer.id, ":", stats);
      setPlayerCard({ ...fullPlayer, stats });
    } catch (err) {
      console.error("Error fetching player details or stats:", err.message);
      setPlayerCard({ ...player, stats: [] });
    }
  };

  // Generate CPU trade proposals
  useEffect(() => {
    if (!currentTeam || !allDraftOrders || !currentRoundOrders || currentPickIndex === undefined)
      return;

    const userFuturePicks = allDraftOrders.filter((order) => {
      return (
        order.team === currentTeam.team &&
        (Number(order.round) > currentRound ||
          (Number(order.round) === currentRound &&
            currentRoundOrders.findIndex((o) => o.id === order.id) >= currentPickIndex))
      );
    });

    const tradePartnerSet = new Set(allDraftOrders.map((o) => o.team));
    tradePartnerSet.delete(currentTeam.team);
    const tradePartners = Array.from(tradePartnerSet);

    const proposalCount = Math.min(Math.floor(Math.random() * 3) + 1, tradePartners.length);
    const proposals = [];
    const shuffleArray = (arr) => arr.sort(() => 0.5 - Math.random());
    const selectedPartners = shuffleArray([...tradePartners]).slice(0, proposalCount);

    selectedPartners.forEach((partner) => {
      const partnerFuturePicks = allDraftOrders.filter((order) => {
        return (
          order.team === partner &&
          (Number(order.round) > currentRound ||
            (Number(order.round) === currentRound &&
              currentRoundOrders.findIndex((o) => o.id === order.id) >= currentPickIndex))
        );
      });

      if (userFuturePicks.length === 0 || partnerFuturePicks.length === 0) return;

      const getCount = (arr) =>
        arr.length >= 2 ? Math.floor(Math.random() * Math.min(2, arr.length - 1)) + 2 : 1;

      const userCount = getCount(userFuturePicks);
      const partnerCount = getCount(partnerFuturePicks);

      const userPicksSelected = shuffleArray([...userFuturePicks])
        .slice(0, userCount)
        .map((order) => order.id);
      const partnerPicksSelected = shuffleArray([...partnerFuturePicks])
        .slice(0, partnerCount)
        .map((order) => order.id);

      proposals.push({
        tradePartner: partner,
        userPicks: userPicksSelected,
        partnerPicks: partnerPicksSelected,
      });
    });

    console.log("Generated CPU trade proposals:", proposals);
    setCpuTradeProposals(proposals);
  }, [currentTeam, allDraftOrders, currentRound, currentPickIndex, currentRoundOrders]);

  return (
    <div className="modal-overlay fixed inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-black bg-opacity-95 backdrop-filter backdrop-blur-sm flex justify-center items-center z-50">
      <div className="modal-content bg-gray-800 bg-opacity-70 p-6 rounded-2xl shadow-2xl border border-indigo-500 border-opacity-30 w-11/12 max-w-[150vh] max-h-[95vh] overflow-y-auto">
        {/* Animated timer bar */}
        <div className="relative h-1 w-full bg-gray-700 rounded-full mb-4 overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-1000"
            style={{ width: `${(timer / timePerPick) * 100}%` }}
          ></div>
        </div>
        
        <h2 className="text-3xl font-bold mb-2 text-center text-white">
          {currentTeam && currentTeam.team} – <span className="text-blue-400">Your Pick</span>
        </h2>
        <p className="mb-6 text-center text-gray-300">
          Time remaining: <span className="text-yellow-400 font-semibold">{timer}</span> sec
        </p>
        
        {/* Trade button */}
        <div className="flex justify-center mb-6">
          <button
            className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
            onClick={openTradeModal}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
              </svg>
              Propose Trade
            </div>
          </button>
        </div>
        
        {/* Search and filter section */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
          <div className="relative flex-grow mb-3 md:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <label className="text-gray-300 mr-2">Position:</label>
            <div className="inline-block relative">
              <select
                className="appearance-none bg-gray-700 bg-opacity-50 border border-gray-600 text-white py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
              >
                {positions.map((pos) => (
                  <option key={pos} value={pos} className="bg-gray-800">
                    {pos}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Player list */}
        <div className="player-list mb-6 max-h-72 overflow-y-auto rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 shadow-inner">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="player-item p-3 border-b border-gray-700 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3 text-xs font-bold">
                    {player.position}
                  </div>
                  <span className="font-medium">{player.name}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onPick(player)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    Draft
                  </button>
                  <button
                    onClick={() => handlePlayerCardOpen(player)}
                    className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center p-4 text-gray-400">No players found.</p>
          )}
        </div>
        
        {/* CPU trade proposals */}
        <div className="cpu-trade-proposals border-t border-gray-600 pt-4">
          <h3 className="font-bold text-xl mb-4 text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
            Trade Proposals
          </h3>
          
          {cpuTradeProposals.length > 0 ? (
            <div className="space-y-4">
              {cpuTradeProposals.map((proposal, idx) => {
                const userPicksFormatted = formatPicks(proposal.userPicks, allDraftOrders);
                const partnerPicksFormatted = formatPicks(proposal.partnerPicks, allDraftOrders);
                return (
                  <div key={idx} className="trade-proposal p-4 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 border border-indigo-500 border-opacity-30 shadow-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3 text-sm font-bold">
                        {proposal.tradePartner.substring(0, 3)}
                      </div>
                      <h4 className="text-lg font-medium text-white">{proposal.tradePartner} Trade Proposal</h4>
                    </div>
                    
                    <div className="mb-4 bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                      <p className="text-green-400 font-medium mb-1">You Receive:</p>
                      <p className="text-gray-300">{partnerPicksFormatted}</p>
                      
                      <p className="text-red-400 font-medium mb-1 mt-3">You Give Up:</p>
                      <p className="text-gray-300">{userPicksFormatted}</p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                        onClick={() =>
                          onAcceptCpuTradeProposal(
                            proposal.tradePartner,
                            proposal.userPicks,
                            proposal.partnerPicks
                          )
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg shadow hover:from-red-600 hover:to-red-700 transition-all duration-200"
                        onClick={() =>
                          setCpuTradeProposals((prev) => prev.filter((p) => p !== proposal))
                        }
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center p-4 text-gray-400 italic bg-gray-800 bg-opacity-30 rounded-lg">
              No trade proposals at this time.
            </p>
          )}
        </div>
      </div>
      
      {/* Player Card Modal */}
      {playerCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-900 p-4 rounded-lg relative max-w-3xl w-full">
            <button
              className="absolute top-2 right-2 text-white text-xl font-bold"
              onClick={() => {
                setPlayerCard(null);
              }}
            >
              &times;
            </button>
            <PlayerCard 
              player={playerCard} 
              stats={playerCard.stats || []} 
              onBioGenerated={() => {}} 
              // Pass the full players list for impact graphs; if not available, fallback to availablePlayers.
              players={fullPlayers.length > 0 ? fullPlayers : availablePlayers} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPickModal;
