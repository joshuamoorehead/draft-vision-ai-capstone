import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import '../../styles/main.css';
import { dvailogo } from '../Logos';
import PageTransition from '../Common/PageTransition';

const NewPlayerComp = () => {

  const location = useLocation();
  const playerName = location.state?.name || 'Unknown Player';
  const playerPosition = location.state?.position || "Unknown Position";
  const playerYear = location.state?.year || "Unknown Year";
  const draftRound = location.state?.draftRound || "Unknown Round";
  const navigate = useNavigate();

  const returnToPage = () => { 
    navigate("/playerinput");
  };

  const getRoundSuffix = (round) => {
    //if (round >= 11 && round <= 13) return `${round}th`;
    const lastDigit = round % 10;

    switch (lastDigit) {
        case 1:
            return `${round}st`;
        case 2:
            return `${round}nd`;
        case 3:
            return `${round}rd`;
        default:
            return `${round}th`;
    }
};

  
  return(
    <PageTransition>
    <div className="min-h-screen bg-[#5A6BB0]">
           
            <h1 className="text-2xl font-bold mb-4 text-white text-center mt-4">
            {playerPosition} {playerName} would be drafted in the {getRoundSuffix(draftRound)} round of the {playerYear} draft.
            </h1>


            <div className="container mx-auto px-4 mt-8 text-center">
            {/* Return to other page */}
            <button
            onClick={returnToPage}
            className="mt-8 px-6 py-2 bg-white text-black text-lg font-semibold rounded hover:bg-gray-200"
            >
            Return to Player Input
            </button>
            </div>
      </div>
      </PageTransition>
  );
};

export default NewPlayerComp;