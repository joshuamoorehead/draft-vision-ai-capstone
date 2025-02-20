import React, { useState } from 'react';
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
    <div className="min-h-screen bg-[#5A6BB0]">
      {/* Header */}
      <div className="w-full h-32 bg-black">
        <div className="container mx-auto px-4 h-full flex items-center">
          <img src={dvailogo} alt="Draft Vision AI Logo" className="h-32 w-32" />
          <div className="flex space-x-8 text-white ml-12">
            <Link to="/" className="text-2xl font-roboto-condensed opacity-50">Player List</Link>
            <Link to="/about" className="text-2xl font-roboto-condensed opacity-50">About Us</Link>
            <Link to="/mockdraft" className="text-2xl font-roboto-condensed underline">Mock Draft</Link>
            <Link to="/largelist" className="text-2xl font-roboto-condensed opacity-50">Large List</Link>
            <Link to="/PlayerCompare" className="text-2xl font-roboto-condensed opacity-50">Player Comparison</Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-8 text-center">
        <h1 className="text-4xl text-white font-bold mb-4">Mock Draft</h1>
        <p className="text-white text-lg mb-8">
          A mock draft is a simulation of how an actual draft might unfold. It's a great way to
          explore team needs and draft strategies.
        </p>
        <h2 className="text-2xl text-white font-semibold mb-4">Choose Your Team</h2>

        {/* Select All / Deselect All */}
        <div className="flex justify-start items-center mb-4 space-x-2">
          <button
            onClick={handleSelectAll}
            className="w-6 h-6 border-2 border-black rounded-full bg-gray-300"
          />
          <span className="text-white">Select All</span>
          <button
            onClick={handleDeselectAll}
            className="w-6 h-6 border-2 border-black rounded-full bg-gray-300"
          />
          <span className="text-white">Deselect All</span>
        </div>

        {/* Logos Grid */}
        <div className="grid grid-cols-8 gap-2">
          {logos.map((Logo, index) => (
            <div
              key={index}
              className={`border-8 ${
                selectedTeams.includes(index) ? "border-black" : "border-transparent"
              } cursor-pointer`}
              onClick={() => handleLogoClick(index)}
            >
              <img src={Logo} alt={locations[index]} className="w-full h-auto" />
            </div>
          ))}
        </div>

        {/* Draft Settings */}
        <div className="text-black text-left mb-6 mt-8">
          <h3 className="text-xl font-semibold mb-2">Draft Settings:</h3>
          {/* Draft Year */}
          <label className="block mb-2">
            Draft Year:
            <select
              value={draftYear}
              onChange={(e) => setDraftYear(Number(e.target.value))}
              className="ml-2 px-2 py-1 bg-gray-200 rounded"
            >
              {[2020, 2021, 2022, 2023, 2024].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          {/* Rounds 1-7 */}
          <label className="block mb-2">
            Number of Rounds:
            <select
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="ml-2 px-2 py-1 bg-gray-200 rounded"
            >
              {[...Array(7)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>

          {/* Time per Pick: 30 up to 600 in increments of 30 */}
          <label className="block mb-2">
            Time per Pick (seconds):
            <select
              value={timePerPick}
              onChange={(e) => setTimePerPick(Number(e.target.value))}
              className="ml-2 px-2 py-1 bg-gray-200 rounded"
            >
              {[...Array(20)].map((_, i) => {
                const sec = 30 * (i + 1); // 30, 60, 90, ..., 600
                return (
                  <option key={sec} value={sec}>
                    {sec} seconds
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        {/* Start Draft Button */}
        <button
          onClick={handleStartDraft}
          className="mt-8 px-6 py-2 bg-white text-black text-lg font-semibold rounded hover:bg-gray-200"
        >
          Enter Draft
        </button>
      </div>
    </div>
  );
};

export default MockDraft;
