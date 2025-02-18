import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "../../styles/main.css";

const supabaseUrl = "https://pvuzvnemuhutrdmpchmi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dXp2bmVtdWh1dHJkbXBjaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwNzgsImV4cCI6MjA0ODk4MzA3OH0.fB_b1Oe_2ckp9FGh6vmEs2jIRHjdDoaqzHVsM8NRZRY";
const supabase = createClient(supabaseUrl, supabaseKey);

// -------------------------------------
// MAIN DraftRoom COMPONENT
// -------------------------------------
const DraftRoom = () => {
  // 1) Retrieve navigation state
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedTeams, locations, rounds, timePerPick, draftYear } = location.state;

  // 2) Determine user teams
  const userTeams = selectedTeams.map((i) => locations[i]);
  const primaryUserTeam = userTeams[0];

  // 3) Refs
  const globalPickRef = useRef(1); // global pick counter
  const timerRef = useRef(null);
  const availablePlayersRef = useRef([]); // for quick picking

  // 4) Basic states
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [isDraftStarted, setIsDraftStarted] = useState(false);
  const [userPickModalOpen, setUserPickModalOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRoundPaused, setIsRoundPaused] = useState(false);
  const [isDraftComplete, setIsDraftComplete] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  // 5) Orders and players
  const [allDraftOrders, setAllDraftOrders] = useState([]);
  const [currentRoundOrdersState, setCurrentRoundOrdersState] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [draftedPicks, setDraftedPicks] = useState([]);

  // Build positions dropdown
  const positions = useMemo(() => {
    if (!availablePlayers || availablePlayers.length === 0) return ["All"];
    const posSet = new Set(availablePlayers.map((p) => p.position));
    return ["All", ...Array.from(posSet)];
  }, [availablePlayers]);

  // Group picks by round for display
  const groupedPicks = useMemo(() => {
    return draftedPicks.reduce((acc, pick) => {
      const rStr = String(pick.round);
      if (!acc[rStr]) acc[rStr] = [];
      acc[rStr].push(pick);
      return acc;
    }, {});
  }, [draftedPicks]);

  // Keep availablePlayersRef in sync with availablePlayers
  useEffect(() => {
    availablePlayersRef.current = availablePlayers;
  }, [availablePlayers]);

  // ------------------------------
  // Fetch data on mount
  // ------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) fetch players
        const { data: players, error: playersErr } = await supabase
          .from("db_draftclasses")
          .select("*")
          .eq("year", draftYear);
        if (playersErr) {
          console.error("Players fetch error:", playersErr);
        } else {
          setAvailablePlayers(players);
        }

        // 2) fetch orders
        const { data: orders, error: ordersErr } = await supabase
          .from("db_draftorders")
          .select("*")
          .eq("year", draftYear);
        if (ordersErr) {
          console.error("Draft order fetch error:", ordersErr);
        } else if (orders) {
          const filteredOrders = orders.filter((o) => Number(o.round) <= rounds);
          console.log("Fetched Orders:", filteredOrders);
          setAllDraftOrders(filteredOrders);
          console.log("Draft order state updated with fetched orders:", filteredOrders);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, [draftYear, rounds]);

  // ------------------------------
  // When allDraftOrders/currentRound changes => filter for that round
  // ------------------------------
  useEffect(() => {
    const roundOrders = allDraftOrders.filter((o) => Number(o.round) === currentRound);
    console.log("Recalc currentRoundOrdersState =>", roundOrders);
    setCurrentRoundOrdersState(roundOrders);
  }, [allDraftOrders, currentRound]);

  // ------------------------------
  // On round change, start picking from index 0 if not paused
  // ------------------------------
  useEffect(() => {
    if (isDraftStarted && !isPaused && !isRoundPaused) {
      processNextPick(0);
    }
    // eslint-disable-next-line
  }, [currentRound]);

  // ------------------------------
  // On unpause, resume
  // ------------------------------
  useEffect(() => {
    if (isDraftStarted && !isPaused && !isRoundPaused) {
      processNextPick(currentPickIndex);
    }
    // eslint-disable-next-line
  }, [isPaused]);

  // ------------------------------
  // UI helper for coloring teams
  // ------------------------------
  const getTeamClass = (order, idx) => {
    if (userTeams.includes(order.team)) return "bg-blue-500";
    if (idx < currentPickIndex) return "bg-green-500";
    if (idx === currentPickIndex) return "bg-orange-500";
    return "bg-gray-800";
  };

  // ------------------------------
  // Start the draft
  // ------------------------------
  const startDraft = () => {
    setIsDraftStarted(true);
    processNextPick(0);
  };

  // ------------------------------
  // Main pick logic
  // ------------------------------
  const processNextPick = (index = currentPickIndex) => {
    if (index >= currentRoundOrdersState.length) {
      // End of this round
      if (currentRound < rounds) {
        setIsRoundPaused(true);
      } else {
        setTimeout(() => setIsDraftComplete(true), 3000);
      }
      return;
    }
    if (isPaused) return;

    const order = currentRoundOrdersState[index];
    console.log("processNextPick => currentPickIndex:", index);
    console.log("processNextPick => order:", order);
    setCurrentTeam(order);

    // If user controls the team => open pick modal
    if (userTeams.includes(order.team)) {
      console.log("User-controlled pick -> open user pick modal");
      setUserPickModalOpen(true);
    } else {
      // CPU pick
      timerRef.current = setTimeout(() => {
        if (isPaused) return;
        const cpuPlayer = pickBestAvailable();
        console.log("CPU picked:", cpuPlayer);
        recordPick(order.team, cpuPlayer, currentRound);

        const nextIdx = index + 1;
        setCurrentPickIndex(nextIdx);
        processNextPick(nextIdx);
      }, 1000);
    }
  };

  // ------------------------------
  // pickBestAvailable
  // ------------------------------
  const pickBestAvailable = () => {
    const players = availablePlayersRef.current;
    if (!players || players.length === 0) return { name: "No Available Player" };
    const best = players.reduce((prev, curr) =>
      Number(prev.id) < Number(curr.id) ? prev : curr
    );
    const remaining = players.filter((p) => p.id !== best.id);
    availablePlayersRef.current = remaining;
    setAvailablePlayers(remaining);
    return best;
  };

  // ------------------------------
  // recordPick
  // ------------------------------
  const recordPick = (team, player, roundNum) => {
    const pickNumber = globalPickRef.current;
    const newPick = {
      round: roundNum,
      pickNumber,
      team,
      playerName: player ? player.name : "No Pick",
      id: player?.id || pickNumber,
    };
    setDraftedPicks((prev) => [...prev, newPick]);
    console.log(`Recorded pick #${pickNumber}: ${team} selects ${player?.name || "No Pick"}`);
    globalPickRef.current = pickNumber + 1;
  };

  // ------------------------------
  // handleUserPick
  // ------------------------------
  const handleUserPick = (player) => {
    console.log("User selected player:", player);
    recordPick(currentTeam.team, player, currentRound);
    setAvailablePlayers((prev) => prev.filter((p) => p.id !== player.id));
    availablePlayersRef.current = availablePlayersRef.current.filter((p) => p.id !== player.id);

    setUserPickModalOpen(false);
    const nextIdx = currentPickIndex + 1;
    setCurrentPickIndex(nextIdx);
    processNextPick(nextIdx);
  };

  // ------------------------------
  // handleUserAutoPick
  // ------------------------------
  const handleUserAutoPick = () => {
    const autoPlayer = pickBestAvailable();
    console.log("Auto-pick triggered. Selected:", autoPlayer);
    recordPick(currentTeam.team, autoPlayer, currentRound);

    setUserPickModalOpen(false);
    const nextIdx = currentPickIndex + 1;
    setCurrentPickIndex(nextIdx);
    processNextPick(nextIdx);
  };

  // ------------------------------
  // Pause/resume
  // ------------------------------
  const togglePause = () => {
    setIsPaused((prev) => {
      const newVal = !prev;
      if (newVal && timerRef.current) {
        clearTimeout(timerRef.current);
      }
      console.log("Draft pause toggled:", newVal);
      return newVal;
    });
  };

  // ------------------------------
  // Begin next round
  // ------------------------------
  const beginNextRound = () => {
    setCurrentRound((prev) => prev + 1);
    setCurrentPickIndex(0);
    setIsRoundPaused(false);
  };

  // ------------------------------
  // handleTradeSubmit
  // ------------------------------
  const handleTradeSubmit = (tradePartner, userPicks, partnerPicks) => {
    console.log("handleTradeSubmit =>", { tradePartner, userPicks, partnerPicks });

    // 1) Build updated orders
    const updatedOrders = allDraftOrders.map((order) => {
      if (partnerPicks.includes(order.id)) {
        // Partner's picks => user acquires them
        return { ...order, team: primaryUserTeam };
      }
      if (userPicks.includes(order.id)) {
        // User's picks => partner acquires them
        return { ...order, team: tradePartner };
      }
      return order;
    });
    console.log("Updated Orders =>", updatedOrders);

    // 2) Update local states immediately
    setAllDraftOrders(updatedOrders);
    setIsTradeModalOpen(false);

    // 3) Derive new round slice right away
    const updatedRoundOrders = updatedOrders.filter((o) => Number(o.round) === currentRound);
    console.log("updatedRoundOrders =>", updatedRoundOrders);
    setCurrentRoundOrdersState(updatedRoundOrders);

    // 4) Check who now owns the current pick
    const currentOrder = updatedRoundOrders[currentPickIndex];
    console.log("currentOrder after trade =>", currentOrder);

    if (!currentOrder) {
      // If there's no pick at the current index, move forward
      console.log("No updatedCurrentOrder found, resuming normal processing.");
      setUserPickModalOpen(false);
      processNextPick(currentPickIndex);
      return;
    }

    // If user lost the pick => CPU picks next
    if (userPicks.includes(currentOrder.id)) {
      console.log("User lost the current pick => CPU picking now.");
      setUserPickModalOpen(false);
      const cpuPlayer = pickBestAvailable();
      recordPick(tradePartner, cpuPlayer, currentRound);

      const newIndex = currentPickIndex + 1;
      setCurrentPickIndex(newIndex);
      processNextPick(newIndex);
    }
    // If the user gained (or kept) the pick => open user pick modal
    else if (
      partnerPicks.includes(currentOrder.id) ||
      currentOrder.team === primaryUserTeam
    ) {
      console.log("User gained/owns the pick => open user pick modal");
      setUserPickModalOpen(true);
    }
    // Otherwise => let CPU proceed
    else {
      console.log("Pick belongs to another CPU team => normal processing");
      setUserPickModalOpen(false);
      processNextPick(currentPickIndex);
    }
  };

  return (
    <div className="draft-room-container min-h-screen bg-gray-900 text-white p-6">
      <header className="mb-6 flex flex-col sm:flex-row items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Draft Room – {draftYear}
          </h1>
          <p className="mt-2 text-xl">Current Round: {currentRound}</p>
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Round {currentRound} Order:</h2>
            <ul className="flex flex-wrap gap-2 mt-2">
              {currentRoundOrdersState.map((order, idx) => (
                <li
                  key={order.id}
                  className={`${getTeamClass(order, idx)} px-3 py-1 rounded shadow`}
                >
                  {order.team}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isDraftStarted && (
          <div className="flex items-center">
            {!isRoundPaused && (
              <button
                onClick={togglePause}
                className="mt-2 sm:mt-0 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg shadow hover:from-yellow-500 hover:to-orange-600 transition duration-300"
              >
                {isPaused ? "Resume Draft" : "Pause Draft"}
              </button>
            )}
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

        {isRoundPaused && currentRound < rounds && (
          <button
            onClick={beginNextRound}
            className="px-8 py-3 bg-gradient-to-r from-blue-400 to-green-500 text-black rounded-lg shadow-lg hover:from-blue-500 hover:to-green-600 transition duration-300"
          >
            Begin Round {currentRound + 1}
          </button>
        )}
      </div>

      {isDraftStarted && (
        <section className="mt-8">
          <h2 className="text-3xl font-bold mb-4">Drafted Picks</h2>
          {Array.from({ length: currentRound }, (_, i) => i + 1).map((round) => (
            <div key={round} className="mb-6">
              <h3 className="text-2xl font-semibold mb-2">Round {round}:</h3>
              <div className="grid grid-cols-4 gap-2">
                {groupedPicks[String(round)] && groupedPicks[String(round)].length > 0 ? (
                  groupedPicks[String(round)].map((pick) => (
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

      {userPickModalOpen && (
        <UserPickModal
          availablePlayers={availablePlayers}
          timePerPick={timePerPick}
          onPick={handleUserPick}
          onTimeout={handleUserAutoPick}
          currentTeam={currentTeam}
          allDraftOrders={allDraftOrders}
          currentRound={currentRound}
          currentPickIndex={currentPickIndex}
          currentRoundOrders={currentRoundOrdersState}
          openTradeModal={() => setIsTradeModalOpen(true)}
          onAcceptCpuTradeProposal={handleTradeSubmit}
        />
      )}

      {isTradeModalOpen && currentTeam && (
        <TradeModal
          currentTeam={currentTeam}
          allDraftOrders={allDraftOrders}
          currentRound={currentRound}
          currentPickIndex={currentPickIndex}
          currentRoundOrders={currentRoundOrdersState}
          onSubmitTrade={handleTradeSubmit}
          onCancelTrade={() => setIsTradeModalOpen(false)}
        />
      )}

      {isDraftComplete && (
        <DraftCompletedModal
          onSave={() => alert("Mock draft saved!")}
          onReturnDraft={() => setIsDraftComplete(false)}
          onReturnHome={() => navigate("/mockdraft")}
        />
      )}
    </div>
  );
};

// -------------------------------------
// USER PICK MODAL
// -------------------------------------
const UserPickModal = ({
  availablePlayers,
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

  // Build positions dropdown
  const positions = useMemo(() => {
    if (!availablePlayers || availablePlayers.length === 0) return ["All"];
    const posSet = new Set(availablePlayers.map((p) => p.position));
    return ["All", ...Array.from(posSet)];
  }, [availablePlayers]);

  // Filter the player list
  useEffect(() => {
    let players = availablePlayers.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (selectedPosition !== "All") {
      players = players.filter((p) => p.position === selectedPosition);
    }
    setFilteredPlayers(players);
  }, [searchTerm, selectedPosition, availablePlayers]);

  // Timer for user picks
  useEffect(() => {
    if (timer <= 0) {
      onTimeout();
      return;
    }
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, onTimeout]);

  // Generate CPU trade proposals
  useEffect(() => {
    if (
      !currentTeam ||
      !allDraftOrders ||
      currentPickIndex === undefined ||
      !currentRoundOrders
    ) {
      return;
    }

    const tradePartnerSet = new Set(allDraftOrders.map((o) => o.team));
    tradePartnerSet.delete(currentTeam.team);
    const tradePartners = Array.from(tradePartnerSet);

    const proposalCount = Math.floor(Math.random() * 4); // up to 3 proposals
    const userFuturePicks = allDraftOrders.filter((order) => {
      return (
        order.team === currentTeam.team &&
        (
          Number(order.round) > currentRound ||
          (
            Number(order.round) === currentRound &&
            currentRoundOrders.findIndex((o) => o.id === order.id) >= currentPickIndex
          )
        )
      );
    });

    let proposals = [];
    for (let i = 0; i < proposalCount; i++) {
      if (tradePartners.length === 0) break;
      const partner = tradePartners[Math.floor(Math.random() * tradePartners.length)];

      const partnerAvailable = allDraftOrders.filter((order) => {
        return (
          order.team === partner &&
          (
            Number(order.round) > currentRound ||
            (
              Number(order.round) === currentRound &&
              currentRoundOrders.findIndex((o) => o.id === order.id) >= currentPickIndex
            )
          )
        );
      });
      if (partnerAvailable.length === 0) continue;

      let userPicks = [];
      let partnerPicks = [];

      // CPU wants your current pick
      partnerPicks.push(currentTeam.id);

      // Optionally pick one future user pick
      const nonCurrentUserPicks = userFuturePicks.filter((x) => x.id !== currentTeam.id);
      if (nonCurrentUserPicks.length) {
        const randomUserPick =
          nonCurrentUserPicks[Math.floor(Math.random() * nonCurrentUserPicks.length)].id;
        userPicks.push(randomUserPick);
      }

      // Possibly add an extra partner pick
      const numAdditional = Math.floor(Math.random() * 2); // 0-1
      const shuffled = [...partnerAvailable].sort(() => 0.5 - Math.random());
      const additionalPartnerPicks = shuffled.slice(0, numAdditional).map((o) => o.id);
      partnerPicks = partnerPicks.concat(additionalPartnerPicks);

      proposals.push({
        id: i,
        tradePartner: partner,
        userPicks,
        partnerPicks,
      });
    }

    console.log("Generated CPU trade proposals:", proposals);
    setCpuTradeProposals(proposals);
  }, [currentTeam, allDraftOrders, currentRound, currentPickIndex, currentRoundOrders]);

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="modal-content bg-gray-800 p-4 rounded-lg shadow-xl w-11/12 max-w-[150vh] max-h-[95vh] overflow-y-scroll">
        <h2 className="text-2xl font-bold mb-2 text-center">
          {currentTeam && currentTeam.team} – Your Pick
        </h2>
        <p className="mb-4 text-center">Time remaining: {timer} sec</p>

        <div className="flex justify-center mb-4">
          <button
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={openTradeModal}
          >
            Propose Trade
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
          <input
            type="text"
            placeholder="Search by name..."
            className="flex-grow border p-2 rounded-lg bg-gray-700 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="mt-2 md:mt-0">
            <label className="mr-2">Position:</label>
            <select
              className="border p-2 rounded-lg bg-gray-700 text-white"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
            >
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="player-list mb-4 max-h-64 overflow-y-auto border p-4 rounded-lg bg-gray-700">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="player-item p-2 border-b cursor-pointer hover:bg-gray-600"
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
          <h3 className="font-semibold text-lg mb-2">CPU Trade Proposals:</h3>
          {cpuTradeProposals.length > 0 ? (
            cpuTradeProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="trade-proposal border p-2 my-2 rounded bg-gray-600"
              >
                <p>
                  CPU wants to trade **your** pick(s): [{proposal.userPicks.join(", ")}]
                  <br />
                  for CPU's pick(s): [{proposal.partnerPicks.join(", ")}] ({proposal.tradePartner})
                </p>
                <div className="mt-2 space-x-2">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() =>
                      onAcceptCpuTradeProposal(
                        proposal.tradePartner,
                        proposal.userPicks,
                        proposal.partnerPicks
                      )
                    }
                  >
                    Accept Proposal
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() =>
                      setCpuTradeProposals((prev) => prev.filter((p) => p.id !== proposal.id))
                    }
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No trade proposals.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------
// TRADE MODAL
// -------------------------------------
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
    if (selectedUserPicks.length === 0 && selectedPartnerPicks.length === 0) {
      alert("Must select at least one pick from either side.");
      return;
    }
    console.log("Submitting trade:", {
      tradePartner: selectedTradePartner,
      selectedUserPicks,
      selectedPartnerPicks,
    });
    onSubmitTrade(selectedTradePartner, selectedUserPicks, selectedPartnerPicks);
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="modal-content bg-gray-800 p-4 rounded-lg shadow-xl w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Propose Trade</h2>
        <div className="mb-4">
          <label className="mr-2">Team to trade with:</label>
          <select
            value={selectedTradePartner}
            onChange={(e) => setSelectedTradePartner(e.target.value)}
            className="border p-2 rounded-lg bg-gray-700 text-white"
          >
            {tradePartnerOptions.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* USER PICK SIDE */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">Your Available Picks</h3>
            {availableUserPicks.length > 0 ? (
              <ul>
                {availableUserPicks.map((order) => (
                  <li key={order.id} className="border p-2 mb-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUserPicks.includes(order.id)}
                      onChange={() => toggleUserPick(order.id)}
                      className="mr-2"
                    />
                    <span>{getPickLabel(order)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No available picks.</p>
            )}
          </div>

          {/* PARTNER PICK SIDE */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">Partner's Available Picks</h3>
            {availablePartnerPicks.length > 0 ? (
              <ul>
                {availablePartnerPicks.map((order) => (
                  <li key={order.id} className="border p-2 mb-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPartnerPicks.includes(order.id)}
                      onChange={() => togglePartnerPick(order.id)}
                      className="mr-2"
                    />
                    <span>{getPickLabel(order)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No available picks from partner.</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={handleSubmitTrade}
            className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-600"
          >
            Submit Trade
          </button>
          <button
            onClick={onCancelTrade}
            className="px-4 py-2 bg-red-500 text-black rounded hover:bg-red-600"
          >
            Cancel Trade
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------
// DRAFT COMPLETED MODAL
// -------------------------------------
const DraftCompletedModal = ({ onSave, onReturnDraft, onReturnHome }) => {
  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-50">
      <div className="modal-content bg-gradient-to-br from-purple-600 to-blue-500 p-4 rounded-lg shadow-2xl w-11/12 max-w-md text-center">
        <h2 className="text-4xl font-bold mb-4">DRAFT COMPLETED!</h2>
        <div className="space-x-4 flex flex-wrap justify-center">
          <button
            className="px-4 py-2 bg-green-400 text-black rounded-lg shadow hover:bg-green-500"
            onClick={onSave}
          >
            Save Mock Draft
          </button>
          <button
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg shadow hover:bg-yellow-500"
            onClick={onReturnDraft}
          >
            Return to Draft
          </button>
          <button
            className="px-4 py-2 bg-red-400 text-black rounded-lg shadow hover:bg-red-500"
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
