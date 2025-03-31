import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";
import "../../styles/main.css";
import { useAuth } from '../../context/AuthContext';

// Import extracted components
import DraftCompletedModal from "./DraftCompletedModal";
import UserPickModal from "./UserPickModal";
import TradeModal from "./TradeModal";

// Supabase client setup
const supabaseUrl = "https://pvuzvnemuhutrdmpchmi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dXp2bmVtdWh1dHJkbXBjaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwNzgsImV4cCI6MjA0ODk4MzA3OH0.fB_b1Oe_2ckp9FGh6vmEs2jIRHjdDoaqzHVsM8NRZRY";
const supabase = createClient(supabaseUrl, supabaseKey);

// -------------------------------------
// MAIN DraftRoom COMPONENT
// -------------------------------------
const DraftRoom = () => {
  // Navigation and authentication
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Refs
  const globalPickRef = useRef(1); // global pick counter
  const timerRef = useRef(null);
  const availablePlayersRef = useRef([]); // for quick picking
  const picksEndRef = useRef(null); // for auto-scrolling

  // Basic states
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [isDraftStarted, setIsDraftStarted] = useState(false);
  const [userPickModalOpen, setUserPickModalOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRoundPaused, setIsRoundPaused] = useState(false);
  const [isDraftComplete, setIsDraftComplete] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const { draftId } = useParams();
  const [isViewingDetails, setIsViewingDetails] = useState(false);

  // New state to track when the current pick started
  const [pickStartTime, setPickStartTime] = useState(Date.now());

  // Draft data states
  const [allDraftOrders, setAllDraftOrders] = useState([]);
  const [currentRoundOrdersState, setCurrentRoundOrdersState] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [draftedPicks, setDraftedPicks] = useState([]);
  
  // Configuration state
  const [draftConfig, setDraftConfig] = useState({
    selectedTeams: [],
    locations: [],
    rounds: 3,
    timePerPick: 30,
    draftYear: 2024
  });
  
  // User teams based on config
  const [userTeams, setUserTeams] = useState([]);
  const [primaryUserTeam, setPrimaryUserTeam] = useState('');

  // Check for required state and redirect if missing
  useEffect(() => {
    if (!location.state || !location.state.selectedTeams) {
      console.warn("Missing required state, redirecting to mock draft setup");
      navigate("/mockdraft");
      return;
    }
    
    // If we have valid state, update our configuration
    if (location.state) {
      const { selectedTeams, locations, rounds = 3, timePerPick = 30, draftYear = 2024 } = location.state;
      
      setDraftConfig({
        selectedTeams,
        locations,
        rounds,
        timePerPick,
        draftYear
      });
      
      // Set user teams
      const teams = selectedTeams.map((i) => locations[i]);
      setUserTeams(teams);
      setPrimaryUserTeam(teams[0]);
    }
  }, [location.state, navigate]);

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

  // Sync availablePlayersRef with availablePlayers
  useEffect(() => {
    availablePlayersRef.current = availablePlayers;
  }, [availablePlayers]);

  // Fetch draft data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const { draftYear } = draftConfig;
        console.log("Fetching draft data for year:", draftYear);
        
        // fetch players with error handling
        const { data: players, error: playersErr } = await supabase
          .from("db_draftclasses")
          .select("*")
          .eq("year", draftYear);
          
        if (playersErr) {
          console.error("Players fetch error:", playersErr);
          setFetchError("Failed to load players data. Please try again.");
          return;
        }
        
        if (!players || players.length === 0) {
          console.warn("No players found for year:", draftYear);
          setFetchError(`No players found for draft year ${draftYear}.`);
          return;
        }
        
        setAvailablePlayers(players);
        console.log(`Loaded ${players.length} players for year ${draftYear}`);
  
        // fetch draft orders with error handling
        const { data: orders, error: ordersErr } = await supabase
          .from("db_draftorders")
          .select("*")
          .eq("year", draftYear);
          
        if (ordersErr) {
          console.error("Draft order fetch error:", ordersErr);
          setFetchError("Failed to load draft order data. Please try again.");
          return;
        }
        
        if (!orders || orders.length === 0) {
          console.warn("No draft orders found for year:", draftYear);
          setFetchError(`No draft order data found for year ${draftYear}.`);
          return;
        }
        
        const filteredOrders = orders.filter((o) => Number(o.round) <= draftConfig.rounds);
        console.log(`Loaded ${filteredOrders.length} draft order entries for ${draftConfig.rounds} rounds`);
        setAllDraftOrders(filteredOrders);
        
      } catch (err) {
        console.error("Unexpected fetch error:", err);
        setFetchError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (draftConfig.draftYear) {
      fetchData();
    }
  }, [draftConfig]);

  // Group orders by round
  const ordersByRound = useMemo(() => {
    const grouped = {};
    allDraftOrders.forEach((order) => {
      const roundNum = Number(order.round);
      if (!grouped[roundNum]) grouped[roundNum] = [];
      grouped[roundNum].push(order);
    });
    return grouped;
  }, [allDraftOrders]);

  // Update current round orders when round changes
  useEffect(() => {
    setCurrentRoundOrdersState(ordersByRound[currentRound] || []);
    if (currentPickIndex !== 0) {
      setCurrentPickIndex(currentPickIndex);
    }
  }, [ordersByRound, currentRound]);

  // Auto-pause and resume when round changes
  useEffect(() => {
    if (isDraftStarted) {
      setIsPaused(true);
      setTimeout(() => {
        setIsPaused(false);
      }, 100);
    }
  }, [currentRound]);
  
  // Resume processing when unpausing
  useEffect(() => {
    if (isDraftStarted && !isPaused && !isRoundPaused) {
      processNextPick(currentPickIndex);
    }
    // eslint-disable-next-line
  }, [isPaused]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Check if draft is complete
  useEffect(() => {
    if (currentRound > draftConfig.rounds && isDraftStarted) {
      console.log("Draft is now complete - all rounds finished");
      setIsDraftComplete(true);
    }
  }, [currentRound, draftConfig.rounds, isDraftStarted]);

  useEffect(() => {
    if (draftId) {
      const fetchSavedDraft = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('user_drafts')
            .select('*')
            .eq('id', draftId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            // Populate the draft data from the saved draft
            setDraftedPicks(data.draft_results || []);
            setDraftConfig({
              selectedTeams: data.selected_teams || [],
              locations: data.locations || [],
              rounds: data.rounds || 3,
              timePerPick: 30,
              draftYear: data.draft_year || 2024
            });
            
            // Set user teams
            setUserTeams(data.selected_teams || []);
            
            // When in details view, mark draft as started and complete
            setIsDraftStarted(true);
            setIsDraftComplete(true);
            setIsViewingDetails(true);
          }
        } catch (error) {
          console.error('Error fetching saved draft:', error);
          setFetchError('This draft could not be loaded. It may have been deleted.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSavedDraft();
    }
  }, [draftId]);

  // Helper for displaying colored squares
  const getTeamClass = (order, idx) => {
    if (userTeams.includes(order.team)) return "bg-blue-500";
    if (idx < currentPickIndex) return "bg-green-500";
    if (idx === currentPickIndex) return "bg-orange-500";
    return "bg-gray-800";
  };

  // Start the draft
  const startDraft = () => {
    // Don't start if we don't have draft orders or players
    if (allDraftOrders.length === 0 || availablePlayers.length === 0) {
      console.error("Cannot start draft - missing data");
      setFetchError("Cannot start draft. Missing required data. Please try again.");
      return;
    }
  
    console.log("Starting draft");
    setIsDraftStarted(true);
    setIsDraftComplete(false);  // Explicitly set to false when starting
    setIsRoundPaused(false);
    setIsPaused(false);
    globalPickRef.current = 1;  // Reset global pick counter
    processNextPick(0);
  };

  // Main pick logic
  const processNextPick = (index = currentPickIndex) => {
    if (index >= currentRoundOrdersState.length) {
      if (currentRound < draftConfig.rounds) {
        setIsRoundPaused(true);
      } else {
        setTimeout(() => setIsDraftComplete(true), 3000);
      }
      return;
    }
    if (isPaused) return;
    
    const order = currentRoundOrdersState[index];
    console.log("processNextPick => order:", order);
    setCurrentTeam(order);

    // When starting a new pick, update pickStartTime so that the timer remains in sync
    if (userTeams.includes(order.team)) {
      setPickStartTime(Date.now());
      console.log("User controlled pick. Opening user pick modal.");
      setUserPickModalOpen(false);
      setUserPickModalOpen(true);
    } else {
      setUserPickModalOpen(false);
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

  // Pick best available player
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

  // Record pick
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
    console.log(`Recorded pick ${pickNumber}: ${team} selects ${player?.name || "No Pick"}`, newPick);
    globalPickRef.current = pickNumber + 1;
  };

  // When user makes a pick
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

  // Auto pick on timeout
  const handleUserAutoPick = () => {
    const autoPlayer = pickBestAvailable();
    console.log("Auto pick triggered. Selected:", autoPlayer);
    recordPick(currentTeam.team, autoPlayer, currentRound);
    setUserPickModalOpen(false);
    const nextIdx = currentPickIndex + 1;
    setCurrentPickIndex(nextIdx);
    processNextPick(nextIdx);
  };

  // Pause/resume draft
  const togglePause = () => {
    setIsPaused((prev) => {
      const newVal = !prev;
      if (newVal && timerRef.current) {
        clearTimeout(timerRef.current);
      }
      console.log("Draft pause toggled. New pause state:", newVal);
      return newVal;
    });
  };

  // Begin next round: simply increment the round.
  const beginNextRound = () => {
    setCurrentPickIndex(0);
    setIsRoundPaused(true);
    setCurrentRound((prev) => prev + 1);
    setIsRoundPaused(false);
  };

  // Handle trade submission
  const handleTradeSubmit = (tradePartner, userPicks, partnerPicks) => {
    console.log("handleTradeSubmit =>", { tradePartner, userPicks, partnerPicks });
  
    // Update orders: assign partner picks to currentTeam and user picks to tradePartner
    const updatedOrders = allDraftOrders.map((order) => {
      if (partnerPicks.includes(order.id)) {
        console.log(`Order ${order.id} => from ${order.team} => ${currentTeam.team}`);
        return { ...order, team: currentTeam.team };
      } else if (userPicks.includes(order.id)) {
        console.log(`Order ${order.id} => from ${order.team} => ${tradePartner}`);
        return { ...order, team: tradePartner };
      }
      return order;
    });
    console.log("Updated Orders =>", updatedOrders);
  
    // Update state
    setAllDraftOrders(updatedOrders);
    setIsTradeModalOpen(false);
    setUserPickModalOpen(false);
  
    // Update current round orders
    setCurrentRoundOrdersState(
      updatedOrders.filter((o) => Number(o.round) === currentRound)
    );
  
    // Clear any CPU pick timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  
    // Pause then auto-resume to allow the updated ownership to commit
    setIsPaused(true);
    console.log("Draft is now paused after trade—auto-resuming in 100ms...");
    setTimeout(() => {
      setIsPaused(false);
    }, 100);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl">Loading draft data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-red-900 p-6 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4">Error Loading Draft</h2>
          <p className="mb-6">{fetchError}</p>
          <button
            onClick={() => navigate("/mockdraft")}
            className="px-6 py-2 bg-red-700 hover:bg-red-800 rounded-lg transition"
          >
            Return to Mock Draft
          </button>
        </div>
      </div>
    );
  }
  
  // Compute remaining time for the current pick so that the TradeModal timer stays in sync
  const computedRemainingTime = Math.max(
    draftConfig.timePerPick - Math.floor((Date.now() - pickStartTime) / 1000),
    0
  );
  
  // Main draft room UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header section with controls */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Draft Room – {draftConfig.draftYear}
              </h1>
              <p className="mt-2 text-xl text-gray-200">Current Round: {currentRound}</p>
            </div>
            
            <div className="flex gap-3">
              {isDraftStarted && !isRoundPaused && (
                <button
                  onClick={togglePause}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isPaused 
                      ? "bg-green-500 hover:bg-green-600 text-white" 
                      : "bg-yellow-500 hover:bg-yellow-600 text-black"
                  }`}
                >
                  {isPaused ? "Resume Draft" : "Pause Draft"}
                </button>
              )}
              <button
                onClick={() => navigate("/mockdraft")}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
              >
                Exit Draft
              </button>
            </div>
          </div>
          
          {/* Round order indicator */}
          <div className="mt-6 bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-3">Round {currentRound} Order:</h2>
            <div className="flex flex-wrap gap-2">
              {currentRoundOrdersState.map((order, idx) => (
                <div 
                  key={order.id} 
                  className={`px-3 py-2 rounded-md font-medium flex items-center ${
                    userTeams.includes(order.team) 
                      ? "bg-blue-600" 
                      : idx < currentPickIndex 
                        ? "bg-green-600"
                        : idx === currentPickIndex
                          ? "bg-amber-500 text-black"
                          : "bg-gray-700"
                  }`}
                >
                  <span className="mr-1">{idx + 1}.</span>
                  {order.team}
                </div>
              ))}
            </div>
            {/* Conditional messages for any user team with no picks this round */}
            {userTeams
              .filter(team => !currentRoundOrdersState.some(order => order.team === team))
              .map(team => (
                <p key={team} className="mt-2 text-gray-400">{team} has no picks this round.</p>
              ))
            }
          </div>
        </header>

        {/* Draft start/next round controls */}
        <div className="mb-8 text-center">
          {!isDraftStarted && (
            <div className="bg-gray-800 bg-opacity-40 rounded-xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6">Ready to start the draft?</h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={startDraft}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow-lg hover:from-green-600 hover:to-blue-600 font-bold transition-all"
                >
                  Start Draft
                </button>
                <button
                  onClick={() => navigate("/mockdraft")}
                  className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-all"
                >
                  Return to Setup
                </button>
              </div>
            </div>
          )}
          
          {isRoundPaused && currentRound < draftConfig.rounds && (
            <div className="bg-gray-800 bg-opacity-40 rounded-xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6">Round {currentRound} Complete</h2>
              <button
                onClick={beginNextRound}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-600 font-bold transition-all"
              >
                Begin Round {currentRound + 1}
              </button>
            </div>
          )}
        </div>

        {/* Drafted picks section */}
        {isDraftStarted && (
          <section className="mt-8">
            <h2 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">Draft Results</h2>
            
            {Array.from({ length: currentRound }, (_, i) => i + 1).map((round) => (
              <div key={round} className="mb-8">
                <h3 className="text-2xl font-semibold mb-4 text-blue-300">Round {round}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {groupedPicks[String(round)] && groupedPicks[String(round)].length > 0 ? (
                    groupedPicks[String(round)].map((pick) => (
                      <div
                        key={pick.pickNumber}
                        className={`p-3 rounded-lg shadow-md text-sm ${
                          userTeams.includes(pick.team) 
                            ? "bg-blue-900 bg-opacity-60" 
                            : "bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="font-bold text-lg mr-2">{pick.pickNumber}.</span>
                          <span className="text-gray-400 mr-2">{pick.team}:</span>
                          <span className="font-medium">{pick.playerName}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-4 text-gray-400">No picks yet in round {round}.</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* An invisible anchor to scroll into view */}
            <div ref={picksEndRef} />
          </section>
        )}

        {/* Modals - using our extracted components */}
        {userPickModalOpen && (
          <UserPickModal
            availablePlayers={availablePlayers}
            timePerPick={draftConfig.timePerPick}
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
            timePerPick={draftConfig.timePerPick}
            remainingTime={computedRemainingTime}
          />
        )}

        {isDraftComplete && (
          <DraftCompletedModal
            onReturnDraft={() => setIsDraftComplete(false)}
            onReturnHome={() => navigate("/mockdraft")}
            draftedPicks={draftedPicks}
            userTeams={userTeams}
            rounds={draftConfig.rounds}
          />
        )}
      </div>
    </div>
  );
};

export default DraftRoom;
