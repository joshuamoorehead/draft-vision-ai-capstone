import React, { useState } from 'react';
import PageTransition from '../Common/PageTransition';
import { Link, useNavigate } from 'react-router-dom';
import {
  AtlantaLogo,
  BaltimoreLogo,
  BuffaloLogo,
  CardinalsLogo,
  CarolinaLogo,
  ChicagoLogo,
  CincinnatiLogo,
  ClevelandLogo,
  DallasLogo,
  DenverLogo,
  DetroitLogo,
  dvailogo,
  GreenBayLogo,
  HoustonLogo,
  IndianapolisLogo,
  KansasCityLogo,
  JacksonvilleLogo,
  LACLogo,
  LARLogo,
  LasVegasLogo,
  MiamiLogo,
  MinnesotaLogo,
  NewEnglandLogo,
  NewOrleansLogo,
  NYGLogo,
  NYJLogo,
  PhiladelphiaLogo,
  PittsburghLogo,
  SeahawksLogo,
  SeattleLogo,
  TampaBayLogo,
  TennesseeLogo,
  WashingtonLogo
} from '../Logos';

import '../../styles/main.css';

const MockDraft = () => {
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [rounds, setRounds] = useState(1);
  const [timePerPick, setTimePerPick] = useState(30); // Default 30 seconds
  const [draftYear, setDraftYear] = useState(2024); // Default draft year
  const navigate = useNavigate();

  // Team logos
  const logos = [
    AtlantaLogo,
    BaltimoreLogo,
    BuffaloLogo,
    CardinalsLogo,
    CarolinaLogo,
    ChicagoLogo,
    CincinnatiLogo,
    ClevelandLogo,
    DallasLogo,
    DenverLogo,
    DetroitLogo,
    GreenBayLogo,
    HoustonLogo,
    IndianapolisLogo,
    KansasCityLogo,
    JacksonvilleLogo,
    LACLogo,
    LARLogo,
    LasVegasLogo,
    MiamiLogo,
    MinnesotaLogo,
    NewEnglandLogo,
    NewOrleansLogo,
    NYGLogo,
    NYJLogo,
    PhiladelphiaLogo,
    PittsburghLogo,
    SeahawksLogo,
    SeattleLogo,
    TampaBayLogo,
    TennesseeLogo,
    WashingtonLogo
  ];

  // Team location names matching the logos array
  const locations = [
    "ATL",
    "BAL",
    "BUF",
    "ARI",
    "CAR",
    "CHI",
    "CIN",
    "CLE",
    "DAL",
    "DEN",
    "DET",
    "GNB",
    "HOU",
    "IND",
    "KAN",
    "JAX",
    "LAC",
    "LAR",
    "LVR",
    "MIA",
    "MIN",
    "NWE",
    "NOR",
    "NYG",
    "NYJ",
    "PHI",
    "PIT",
    "SEA",
    "SFO",
    "TAM",
    "TEN",
    "WAS"
  ];

  // Handle selecting/deselecting team logos
  const handleLogoClick = (index) => {
    setSelectedTeams((prevSelectedTeams) =>
      prevSelectedTeams.includes(index)
        ? prevSelectedTeams.filter((team) => team !== index)
        : [...prevSelectedTeams, index]
    );
  };

  // Select all teams
  const handleSelectAll = () => {
    setSelectedTeams(logos.map((_, index) => index));
  };

  // Deselect all teams
  const handleDeselectAll = () => {
    setSelectedTeams([]);
  };

  // Start the draft and navigate to DraftRoom
  const handleStartDraft = () => {
    navigate("/draftroom", { state: { selectedTeams, locations, rounds, timePerPick, draftYear } });
  };

  return (
    <PageTransition>
      {/* Enhanced background with animated gradient and subtle pattern */}
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 relative overflow-hidden">
        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-40 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pt-16 pb-20 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Mock Draft</h1>
            <div className="h-1 w-24 bg-blue-400 mx-auto rounded my-6"></div>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              A mock draft is a simulation of how an actual draft might unfold. It's a great way to explore team needs and draft strategies.
            </p>
          </div>

          {/* Main content box with glass morphism */}
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white border-opacity-20 max-w-5xl mx-auto">
            <h2 className="text-3xl text-white font-semibold mb-6">Choose Your Team</h2>

            {/* Select All / Deselect All */}
            <div className="flex justify-start items-center mb-6 space-x-6">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 bg-opacity-70 hover:bg-opacity-90 text-white rounded-lg transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 bg-opacity-70 hover:bg-opacity-90 text-white rounded-lg transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Deselect All
              </button>
            </div>

            {/* Logos Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-8">
              {logos.map((Logo, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                    selectedTeams.includes(index) 
                      ? "ring-4 ring-blue-500 shadow-lg bg-blue-500 bg-opacity-20 rounded-lg" 
                      : "bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg"
                  }`}
                  onClick={() => handleLogoClick(index)}
                >
                  <div className="p-2">
                    <img 
                      src={Logo} 
                      alt={locations[index]} 
                      className="w-full h-auto" 
                    />
                    <div className="text-xs text-center text-white mt-1 font-semibold">
                      {locations[index]}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Draft Settings with glass morphism effect */}
            <div className="bg-white bg-opacity-5 backdrop-filter backdrop-blur-sm p-6 rounded-xl shadow-lg mb-8">
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Draft Settings
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Draft Year */}
                <div className="mb-2">
                  <label className="block mb-2 text-white text-sm font-medium">
                    Draft Year
                  </label>
                  <select
                    value={draftYear}
                    onChange={(e) => setDraftYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white bg-opacity-10 text-white border border-gray-500 border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    {[2020, 2021, 2022, 2023, 2024].map((year) => (
                      <option key={year} value={year} className="bg-gray-800 text-white">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Rounds 1-7 */}
                <div className="mb-2">
                  <label className="block mb-2 text-white text-sm font-medium">
                    Number of Rounds
                  </label>
                  <select
                    value={rounds}
                    onChange={(e) => setRounds(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white bg-opacity-10 text-white border border-gray-500 border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    {[...Array(7)].map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-gray-800 text-white">
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time per Pick */}
                <div className="mb-2">
                  <label className="block mb-2 text-white text-sm font-medium">
                    Time per Pick
                  </label>
                  <select
                    value={timePerPick}
                    onChange={(e) => setTimePerPick(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white bg-opacity-10 text-white border border-gray-500 border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    {[...Array(20)].map((_, i) => {
                      const sec = 30 * (i + 1); // 30, 60, 90, ..., 600
                      return (
                        <option key={sec} value={sec} className="bg-gray-800 text-white">
                          {sec} seconds
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Start Draft Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleStartDraft}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
              >
                Enter Draft Room
              </button>
            </div>
          </div>
        </div>
        
        {/* Add custom styling for animations */}
        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .bg-grid-pattern {
            background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 40px 40px;
          }
        `}</style>
      </div>
    </PageTransition>
  );
};

export default MockDraft;