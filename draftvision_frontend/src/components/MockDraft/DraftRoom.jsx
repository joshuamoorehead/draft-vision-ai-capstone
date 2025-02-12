// DraftRoom.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "../../styles/main.css";

// Initialize Supabase client (replace with your actual credentials or use env variables)
const supabaseUrl = "https://pvuzvnemuhutrdmpchmi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dXp2bmVtdWh1dHJkbXBjaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwNzgsImV4cCI6MjA0ODk4MzA3OH0.fB_b1Oe_2ckp9FGh6vmEs2jIRHjdDoaqzHVsM8NRZRY";
const supabase = createClient(supabaseUrl, supabaseKey);

const DraftRoom = () => {
  // Retrieve draft settings from navigation state.
  const location = useLocation();
  const navigate = useNavigate();
  // "rounds" is the total number of rounds.
  const { selectedTeams, locations, rounds, timePerPick, draftYear } = location.state;
  const userTeams = selectedTeams.map((i) => locations[i]);

  // Global pick counter ref.
  const globalPickRef = useRef(1);

  // Local round state – we start at round 1.
  const [currentRound, setCurrentRound] = useState(1);
  const [allDraftOrders, setAllDraftOrders] = useState([]); // full order objects from the DB

  // Group orders by their DB round field.
  const groupedOrders = useMemo(() => {
    return allDraftOrders.reduce((acc, order) => {
      const r = Number(order.round);
      if (!acc[r]) acc[r] = [];
      acc[r].push(order);
      return acc;
    }, {});
  }, [allDraftOrders]);

  // Determine current round orders using the local currentRound.
  const currentRoundOrders = useMemo(() => {
    return allDraftOrders.filter(order => Number(order.round) === currentRound);
  }, [allDraftOrders, currentRound]);

  // Other states.
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const availablePlayersRef = useRef([]);
  const [currentPickIndex, setCurrentPickIndex] = useState(0); // index within currentRoundOrders
  // draftedPicks records the round, pickNumber, team, and playerName.
  const [draftedPicks, setDraftedPicks] = useState([]);
  const [isDraftStarted, setIsDraftStarted] = useState(false);
  const [userPickModalOpen, setUserPickModalOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRoundPaused, setIsRoundPaused] = useState(false); // waiting for user to begin next round
  const [isDraftComplete, setIsDraftComplete] = useState(false);

  // Ref for CPU pick timeout.
  const timerRef = useRef(null);

  // Sync availablePlayersRef with availablePlayers.
  useEffect(() => {
    availablePlayersRef.current = availablePlayers;
  }, [availablePlayers]);

  // Fetch players and draft orders from Supabase.
  useEffect(() => {
    const fetchData = async () => {
      // Fetch players.
      const { data: players, error: playersError } = await supabase
        .from("db_draftclasses")
        .select("*")
        .eq("year", draftYear);
      if (playersError) {
        console.error("Players fetch error:", playersError);
      } else {
        setAvailablePlayers(players);
      }
      // Fetch draft orders.
      const { data: orders, error: ordersError } = await supabase
        .from("db_draftorders")
        .select("*")
        .eq("year", draftYear);
      if (ordersError) {
        console.error("Draft order fetch error:", ordersError);
      } else {
        // Only include orders for rounds up to the selected number.
        const filteredOrders = orders.filter(order => Number(order.round) <= rounds);
        setAllDraftOrders(filteredOrders);
      }
    };

    fetchData();
  }, [draftYear, rounds]);

  // Build positions dropdown (for the modal).
  const positions = useMemo(() => {
    if (!availablePlayers || availablePlayers.length === 0) return ["All"];
    const posSet = new Set(availablePlayers.map(p => p.position));
    return ["All", ...Array.from(posSet)];
  }, [availablePlayers]);

  // When a new round is started, resume picks from index 0.
  useEffect(() => {
    if (isDraftStarted && !isPaused && !isRoundPaused) {
      processNextPick(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound]);

  // When resuming from pause, resume from the last pick index.
  useEffect(() => {
    if (isDraftStarted && !isPaused && !isRoundPaused) {
      processNextPick(currentPickIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  // Helper: get a CSS class for each team box.
  // If the team is a user team, it will be blue.
  const getTeamClass = (order, idx) => {
    if (userTeams.includes(order.team)) return "bg-blue-500";
    if (idx < currentPickIndex) return "bg-green-500";
    else if (idx === currentPickIndex) return "bg-orange-500";
    else return "bg-gray-800";
  };

  // Start the draft simulation.
  const startDraft = () => {
    setIsDraftStarted(true);
    processNextPick(0);
  };

  // Process the next pick within the current round.
  const processNextPick = (index = currentPickIndex) => {
    // If we've reached the end of the round:
    if (index >= currentRoundOrders.length) {
      if (currentRound < rounds) {
        setIsRoundPaused(true); // Wait for user to begin the next round.
      } else {
        // Last round complete – wait 3 seconds so the user can see the last pick,
        // then show the draft complete modal.
        setTimeout(() => {
          setIsDraftComplete(true);
        }, 3000);
      }
      return;
    }
    // If paused, do nothing.
    if (isPaused) return;

    const currentPick = currentRoundOrders[index];
    setCurrentTeam(currentPick);

    if (userTeams.includes(currentPick.team)) {
      // Show modal for user-controlled pick.
      setUserPickModalOpen(true);
    } else {
      // For CPU picks, schedule the pick after 1 second.
      timerRef.current = setTimeout(() => {
        if (isPaused) return;
        const player = pickBestAvailable();
        recordPick(currentPick.team, player, currentRound);
        const nextIndex = index + 1;
        setCurrentPickIndex(nextIndex);
        processNextPick(nextIndex);
      }, 1000);
    }
  };

  // Choose the best available player (by lowest id).
  const pickBestAvailable = () => {
    const currentPlayers = availablePlayersRef.current;
    if (!currentPlayers || currentPlayers.length === 0)
      return { name: "No Available Player" };
    const best = currentPlayers.reduce((prev, curr) =>
      Number(prev.id) < Number(curr.id) ? prev : curr
    );
    const newPlayers = currentPlayers.filter(p => p.id !== best.id);
    availablePlayersRef.current = newPlayers;
    setAvailablePlayers(newPlayers);
    return best;
  };

  // Record a pick with the current round.
  const recordPick = (team, player, roundNum) => {
    const pickNumber = globalPickRef.current;
    setDraftedPicks(prev => [
      ...prev,
      { round: roundNum, pickNumber, team, playerName: player ? player.name : "No Pick" }
    ]);
    globalPickRef.current = pickNumber + 1;
  };

  // When the user selects a player.
  const handleUserPick = (player) => {
    recordPick(currentTeam.team, player, currentRound);
    setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));
    availablePlayersRef.current = availablePlayersRef.current.filter(p => p.id !== player.id);
    setUserPickModalOpen(false);
    const nextIndex = currentPickIndex + 1;
    setCurrentPickIndex(nextIndex);
    processNextPick(nextIndex);
  };

  // On timeout, auto-pick for the user.
  const handleUserAutoPick = () => {
    const player = pickBestAvailable();
    recordPick(currentTeam.team, player, currentRound);
    setUserPickModalOpen(false);
    const nextIndex = currentPickIndex + 1;
    setCurrentPickIndex(nextIndex);
    processNextPick(nextIndex);
  };

  // Toggle pause/resume.
  const togglePause = () => {
    setIsPaused(prev => {
      const newVal = !prev;
      if (newVal === true && timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return newVal;
    });
  };

  // When the user clicks "Begin Round X", increment the round.
  const beginNextRound = () => {
    setCurrentRound(prev => prev + 1);
    setCurrentPickIndex(0);
    setIsRoundPaused(false);
    // The useEffect watching currentRound will call processNextPick(0)
  };

  // Group recorded picks by round.
  const groupedPicks = useMemo(() => {
    return draftedPicks.reduce((acc, pick) => {
      const key = String(pick.round);
      if (!acc[key]) acc[key] = [];
      acc[key].push(pick);
      return acc;
    }, {});
  }, [draftedPicks]);

  // Create an array of rounds from 1 to currentRound.
  const roundsToDisplay = useMemo(() => {
    return Array.from({ length: currentRound }, (_, i) => i + 1);
  }, [currentRound]);

  const handleSaveDraft = () => {
    alert("Mock draft saved!");
  };

  const handleReturnToDraft = () => {
    setIsDraftComplete(false);
  };

  const handleReturnHome = () => {
    navigate("/mockdraft");
  };

  return (
    <div className="draft-room-container min-h-screen bg-gray-900 text-white p-6">
      <header className="mb-6 flex flex-col sm:flex-row items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Draft Room – {draftYear}
          </h1>
          <p className="mt-2 text-xl">Current Round: {currentRound}</p>
          {/* Display current round orders */}
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Round {currentRound} Order:</h2>
            <ul className="flex flex-wrap gap-2 mt-2">
              {currentRoundOrders.map((order, idx) => (
                <li key={idx} className={`${getTeamClass(order, idx)} px-3 py-1 rounded shadow`}>
                  {order.team}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {isDraftStarted && (
          <div className="flex items-center">
            {/* Show the pause/resume button if the round is not paused */}
            {!isRoundPaused && (
              <button
                onClick={togglePause}
                className="mt-2 sm:mt-0 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg shadow hover:from-yellow-500 hover:to-orange-600 transition duration-300"
              >
                {isPaused ? "Resume Draft" : "Pause Draft"}
              </button>
            )}
            {/* Always show the Exit Draft button */}
            <button
              onClick={() => navigate("/mockdraft")}
              className="ml-2 mt-2 sm:mt-0 px-4 py-2 bg-red-500 text-black rounded-lg shadow hover:bg-red-600 transition duration-300"
            >
              Exit Draft
            </button>
          </div>
        )}
      </header>

      <div className="mb-6 text-center">
        {!isDraftStarted && (
          <div className="flex justify-center gap-4">
            <button
              onClick={startDraft}
              className="px-8 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-black rounded-lg shadow-lg hover:from-green-500 hover:to-blue-600 transition duration-300"
            >
              Enter Draft
            </button>
            <button
              onClick={() => navigate("/mockdraft")}
              className="px-8 py-3 bg-red-500 text-black rounded-lg shadow-lg hover:bg-red-600 transition duration-300"
            >
              Exit Draft
            </button>
          </div>
        )}
        {/* Only show "Begin Round" if the round is paused and there are rounds left */}
        {isRoundPaused && currentRound < rounds && (
          <button
            onClick={beginNextRound}
            className="px-8 py-3 bg-gradient-to-r from-blue-400 to-green-500 text-black rounded-lg shadow-lg hover:from-blue-500 hover:to-green-600 transition duration-300"
          >
            Begin Round {currentRound + 1}
          </button>
        )}
      </div>

      {/* Render drafted picks grouped by round */}
      {isDraftStarted && (
        <section className="mt-8">
          <h2 className="text-3xl font-bold mb-4">Drafted Picks</h2>
          {roundsToDisplay.map(round => (
            <div key={round} className="mb-6">
              <h3 className="text-2xl font-semibold mb-2">Round {round}:</h3>
              <div className="grid grid-cols-4 gap-2">
                {groupedPicks[String(round)] && groupedPicks[String(round)].length > 0 ? (
                  groupedPicks[String(round)].map(pick => (
                    <div
                      key={pick.pickNumber}
                      className="p-1 h-9 bg-gray-800 rounded shadow-sm text-sm flex items-center"
                    >
                      <span className="mr-1">{pick.pickNumber}.</span>
                      <strong>{pick.team}:</strong>
                      <span>&nbsp;</span>
                      {pick.playerName}
                    </div>
                  ))
                ) : (
                  <p className="col-span-4 text-gray-400">No picks yet.</p>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* User Pick Modal */}
      {userPickModalOpen && (
        <UserPickModal
          availablePlayers={availablePlayers}
          timePerPick={timePerPick}
          onPick={handleUserPick}
          onTimeout={handleUserAutoPick}
          // Here we reference currentTeam.team to display a string instead of the object
          currentTeam={currentTeam}
          openTradeModal={() => alert("Trade modal placeholder")}
        />
      )}

      {/* Draft Completed Modal */}
      {isDraftComplete && (
        <DraftCompletedModal
          onSave={handleSaveDraft}
          onReturnDraft={handleReturnToDraft}
          onReturnHome={handleReturnHome}
        />
      )}
    </div>
  );
};

const UserPickModal = ({
  availablePlayers,
  timePerPick,
  onPick,
  onTimeout,
  currentTeam,
  openTradeModal,
}) => {
  const [timer, setTimer] = useState(timePerPick);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [filteredPlayers, setFilteredPlayers] = useState(availablePlayers);
  const [cpuTradeProposals, setCpuTradeProposals] = useState([]);

  const positions = useMemo(() => {
    if (!availablePlayers || availablePlayers.length === 0) return ["All"];
    const posSet = new Set(availablePlayers.map(p => p.position));
    return ["All", ...Array.from(posSet)];
  }, [availablePlayers]);

  useEffect(() => {
    const proposalCount = Math.floor(Math.random() * 3) + 1;
    const proposals = [];
    for (let i = 0; i < proposalCount; i++) {
      if (availablePlayers.length > 0) {
        const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
        proposals.push({
          id: i,
          offeringTeam: `CPU Team ${i + 1}`,
          offeredPlayer: randomPlayer,
        });
      }
    }
    setCpuTradeProposals(proposals);
  }, [availablePlayers]);

  useEffect(() => {
    let players = availablePlayers.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (selectedPosition !== "All") {
      players = players.filter(player => player.position === selectedPosition);
    }
    setFilteredPlayers(players);
  }, [searchTerm, selectedPosition, availablePlayers]);

  useEffect(() => {
    if (timer <= 0) {
      onTimeout();
      return;
    }
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, onTimeout]);

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="modal-content bg-gray-800 p-4 rounded-lg shadow-xl w-11/12 max-w-[150vh] max-h-[95vh] overflow-y-scroll transform transition-all duration-300">
        {/* Use currentTeam.team so that a string is rendered */}
        <h2 className="text-2xl font-bold mb-2 text-center">
          {currentTeam && currentTeam.team} – Your Pick
        </h2>
        <p className="mb-4 text-center">Time remaining: {timer} sec</p>
        <div className="flex justify-center mb-4">
          <button
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
            onClick={openTradeModal}
          >
            Propose Trade
          </button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
          <input
            type="text"
            placeholder="Search by name..."
            className="flex-grow border p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="mt-2 md:mt-0">
            <label className="mr-2">Position:</label>
            <select
              className="border p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPosition}
              onChange={e => setSelectedPosition(e.target.value)}
            >
              {positions.map(pos => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="player-list mb-4 max-h-64 overflow-y-auto border p-4 rounded-lg bg-gray-700">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map(player => (
              <div
                key={player.id}
                className="player-item p-2 border-b cursor-pointer hover:bg-gray-600 transition duration-200"
                onClick={() => onPick(player)}
              >
                {player.name} – {player.position} – Rating: {player.rating}
              </div>
            ))
          ) : (
            <p className="text-center">No players found.</p>
          )}
        </div>
        <div className="cpu-trade-proposals border-t pt-2">
          <h3 className="font-semibold text-lg mb-2">Trade Proposals from CPU:</h3>
          {cpuTradeProposals.map(proposal => (
            <div key={proposal.id} className="trade-proposal border p-2 my-2 rounded bg-gray-600">
              <p>
                Offer from {proposal.offeringTeam}: {proposal.offeredPlayer.name} (
                {proposal.offeredPlayer.position}, Rating: {proposal.offeredPlayer.rating})
              </p>
              <div className="mt-2 space-x-2">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                  onClick={() => onPick(proposal.offeredPlayer)}
                >
                  Accept Trade
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
                  onClick={() =>
                    setCpuTradeProposals(prev =>
                      prev.filter(p => p.id !== proposal.id)
                    )
                  }
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DraftCompletedModal = ({ onSave, onReturnDraft, onReturnHome }) => {
  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-50">
      <div className="modal-content bg-gradient-to-br from-purple-600 to-blue-500 p-4 rounded-lg shadow-2xl w-11/12 max-w-md text-center">
        <h2 className="text-4xl font-bold mb-4">DRAFT COMPLETED!</h2>
        <div className="space-x-4 flex flex-wrap justify-center">
          <button
            className="px-4 py-2 bg-green-400 text-black rounded-lg shadow hover:bg-green-500 transition duration-300"
            onClick={onSave}
          >
            Save Mock Draft
          </button>
          <button
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg shadow hover:bg-yellow-500 transition duration-300"
            onClick={onReturnDraft}
          >
            Return to Draft
          </button>
          <button
            className="px-4 py-2 bg-red-400 text-black rounded-lg shadow hover:bg-red-500 transition duration-300"
            onClick={onReturnHome}
          >
            Return to Mock Draft Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftRoom;
