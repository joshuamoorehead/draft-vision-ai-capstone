import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const DraftRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location || {};
  const {
    selectedTeams = [],
    locations = [],
    timePerPick = 30,
    rounds = 1,
  } = state || {};

  // Full 7-Round Draft Order
  const draftOrder = [
    // Round 1
    { team: "Carolina Panthers", round: 1 },
    { team: "Houston Texans", round: 1 },
    { team: "Arizona Cardinals", round: 1 },
    { team: "Indianapolis Colts", round: 1 },
    { team: "Seattle Seahawks", round: 1 },
    { team: "Detroit Lions", round: 1 },
    { team: "Las Vegas Raiders", round: 1 },
    { team: "Atlanta Falcons", round: 1 },
    { team: "Chicago Bears", round: 1 },
    { team: "Philadelphia Eagles", round: 1 },
    { team: "Tennessee Titans", round: 1 },
    { team: "Houston Texans", round: 1 },
    { team: "Green Bay Packers", round: 1 },
    { team: "New England Patriots", round: 1 },
    { team: "New York Jets", round: 1 },
    { team: "Washington Commanders", round: 1 },
    { team: "Pittsburgh Steelers", round: 1 },
    { team: "Detroit Lions", round: 1 },
    { team: "Tampa Bay Buccaneers", round: 1 },
    { team: "Seattle Seahawks", round: 1 },
    { team: "Los Angeles Chargers", round: 1 },
    { team: "Baltimore Ravens", round: 1 },
    { team: "Minnesota Vikings", round: 1 },
    { team: "Jacksonville Jaguars", round: 1 },
    { team: "New York Giants", round: 1 },
    { team: "Dallas Cowboys", round: 1 },
    { team: "Buffalo Bills", round: 1 },
    { team: "Cincinnati Bengals", round: 1 },
    { team: "New Orleans Saints", round: 1 },
    { team: "Philadelphia Eagles", round: 1 },
    { team: "Kansas City Chiefs", round: 1 },
  
    // Round 2
    { team: "Pittsburgh Steelers", round: 2 },
    { team: "Houston Texans", round: 2 },
    { team: "Arizona Cardinals", round: 2 },
    { team: "Indianapolis Colts", round: 2 },
    { team: "Seattle Seahawks", round: 2 },
    { team: "Las Vegas Raiders", round: 2 },
    { team: "Carolina Panthers", round: 2 },
    { team: "New Orleans Saints", round: 2 },
    { team: "Tennessee Titans", round: 2 },
    { team: "Green Bay Packers", round: 2 },
    { team: "New York Jets", round: 2 },
    { team: "Atlanta Falcons", round: 2 },
    { team: "Green Bay Packers", round: 2 },
    { team: "New England Patriots", round: 2 },
    { team: "Washington Commanders", round: 2 },
    { team: "Detroit Lions", round: 2 },
    { team: "Pittsburgh Steelers", round: 2 },
    { team: "Tampa Bay Buccaneers", round: 2 },
    { team: "Seattle Seahawks", round: 2 },
    { team: "Miami Dolphins", round: 2 },
    { team: "Los Angeles Chargers", round: 2 },
    { team: "Chicago Bears", round: 2 },
    { team: "Kansas City Chiefs", round: 2 },
    { team: "Jacksonville Jaguars", round: 2 },
    { team: "New York Giants", round: 2 },
    { team: "Dallas Cowboys", round: 2 },
    { team: "Buffalo Bills", round: 2 },
    { team: "Cincinnati Bengals", round: 2 },
    { team: "Chicago Bears", round: 2 },
    { team: "Philadelphia Eagles", round: 2 },
    { team: "Kansas City Chiefs", round: 2 },
  
    // Round 3
    { team: "Chicago Bears", round: 3 },
    { team: "Houston Texans", round: 3 },
    { team: "Arizona Cardinals", round: 3 },
    { team: "Denver Broncos", round: 3 },
    { team: "Los Angeles Rams", round: 3 },
    { team: "Indianapolis Colts", round: 3 },
    { team: "Los Angeles Rams", round: 3 },
    { team: "Seattle Seahawks", round: 3 },
    { team: "Las Vegas Raiders", round: 3 },
    { team: "Carolina Panthers", round: 3 },
    { team: "New Orleans Saints", round: 3 },
    { team: "Tennessee Titans", round: 3 },
    { team: "Green Bay Packers", round: 3 },
    { team: "Miami Dolphins", round: 3 },
    { team: "New York Jets", round: 3 },
    { team: "Atlanta Falcons", round: 3 },
    { team: "New England Patriots", round: 3 },
    { team: "Washington Commanders", round: 3 },
    { team: "Detroit Lions", round: 3 },
    { team: "Tampa Bay Buccaneers", round: 3 },
    { team: "Seattle Seahawks", round: 3 },
    { team: "Miami Dolphins", round: 3 },
    { team: "Los Angeles Chargers", round: 3 },
    { team: "Baltimore Ravens", round: 3 },
    { team: "Dallas Cowboys", round: 3 },
    { team: "Jacksonville Jaguars", round: 3 },
    { team: "New York Giants", round: 3 },
    { team: "Buffalo Bills", round: 3 },
    { team: "Cincinnati Bengals", round: 3 },
    { team: "Carolina Panthers", round: 3 },
    { team: "Philadelphia Eagles", round: 3 },
    { team: "Kansas City Chiefs", round: 3 },
  
    // Round 4
    { team: "Chicago Bears", round: 4 },
    { team: "Houston Texans", round: 4 },
    { team: "Indianapolis Colts", round: 4 },
    { team: "Arizona Cardinals", round: 4 },
    { team: "Cleveland Browns", round: 4 },
    { team: "Seattle Seahawks", round: 4 },
    { team: "Baltimore Ravens", round: 4 },
    { team: "Los Angeles Chargers", round: 4 },
    { team: "Cleveland Browns", round: 4 },
    { team: "New England Patriots", round: 4 },
    { team: "New York Jets", round: 4 },
    { team: "Las Vegas Raiders", round: 4 },
    { team: "Atlanta Falcons", round: 4 },
    { team: "Carolina Panthers", round: 4 },
    { team: "New Orleans Saints", round: 4 },
    { team: "Green Bay Packers", round: 4 },
    { team: "Washington Commanders", round: 4 },
    { team: "Minnesota Vikings", round: 4 },
    { team: "Jacksonville Jaguars", round: 4 },
    { team: "New York Giants", round: 4 },
    { team: "Dallas Cowboys", round: 4 },
    { team: "Buffalo Bills", round: 4 },
    { team: "Cincinnati Bengals", round: 4 },
    { team: "Pittsburgh Steelers", round: 4 },
    { team: "Detroit Lions", round: 4 },
    { team: "Tampa Bay Buccaneers", round: 4 },
    { team: "Seattle Seahawks", round: 4 },
    { team: "Miami Dolphins", round: 4 },
    { team: "Los Angeles Chargers", round: 4 },
    { team: "Baltimore Ravens", round: 4 },
    { team: "San Francisco 49ers", round: 4 },
  
  // Round 5
  { team: "Chicago Bears", round: 5 },
  { team: "Buffalo Bills", round: 5 },
  { team: "Indianapolis Colts", round: 5 },
  { team: "Arizona Cardinals", round: 5 },
  { team: "Denver Broncos", round: 5 },
  { team: "Cleveland Browns", round: 5 },
  { team: "Seattle Seahawks", round: 5 },
  { team: "Los Angeles Chargers", round: 5 },
  { team: "Baltimore Ravens", round: 5 },
  { team: "Los Angeles Rams", round: 5 },
  { team: "New England Patriots", round: 5 },
  { team: "New York Jets", round: 5 },
  { team: "Las Vegas Raiders", round: 5 },
  { team: "Atlanta Falcons", round: 5 },
  { team: "Carolina Panthers", round: 5 },
  { team: "New Orleans Saints", round: 5 },
  { team: "Green Bay Packers", round: 5 },
  { team: "Washington Commanders", round: 5 },
  { team: "Minnesota Vikings", round: 5 },
  { team: "Jacksonville Jaguars", round: 5 },
  { team: "New York Giants", round: 5 },
  { team: "Dallas Cowboys", round: 5 },
  { team: "Buffalo Bills", round: 5 },
  { team: "Cincinnati Bengals", round: 5 },
  { team: "San Francisco 49ers", round: 5 },
  { team: "Pittsburgh Steelers", round: 5 },
  { team: "Detroit Lions", round: 5 },
  { team: "Tampa Bay Buccaneers", round: 5 },
  { team: "Seattle Seahawks", round: 5 },
  { team: "Miami Dolphins", round: 5 },
  { team: "Green Bay Packers", round: 5 },
  
  // Round 6
  { team: "Chicago Bears", round: 6 },
  { team: "Buffalo Bills", round: 6 },
  { team: "Indianapolis Colts", round: 6 },
  { team: "Arizona Cardinals", round: 6 },
  { team: "Denver Broncos", round: 6 },
  { team: "Cleveland Browns", round: 6 },
  { team: "Seattle Seahawks", round: 6 },
  { team: "Los Angeles Chargers", round: 6 },
  { team: "Baltimore Ravens", round: 6 },
  { team: "Kansas City Chiefs", round: 6 },
  { team: "New England Patriots", round: 6 },
  { team: "New York Jets", round: 6 },
  { team: "Las Vegas Raiders", round: 6 },
  { team: "Atlanta Falcons", round: 6 },
  { team: "Carolina Panthers", round: 6 },
  { team: "New Orleans Saints", round: 6 },
  { team: "Green Bay Packers", round: 6 },
  { team: "Washington Commanders", round: 6 },
  { team: "Minnesota Vikings", round: 6 },
  { team: "Jacksonville Jaguars", round: 6 },
  { team: "New York Giants", round: 6 },
  { team: "Dallas Cowboys", round: 6 },
  { team: "Buffalo Bills", round: 6 },
  { team: "Cincinnati Bengals", round: 6 },
  { team: "San Francisco 49ers", round: 6 },
  { team: "Pittsburgh Steelers", round: 6 },
  { team: "Detroit Lions", round: 6 },
  { team: "Tampa Bay Buccaneers", round: 6 },
  { team: "Seattle Seahawks", round: 6 },
  { team: "Miami Dolphins", round: 6 },
  { team: "Green Bay Packers", round: 6 },
  
  // Round 7
  { team: "Chicago Bears", round: 7 },
  { team: "Arizona Cardinals", round: 7 },
  { team: "Indianapolis Colts", round: 7 },
  { team: "Buffalo Bills", round: 7 },
  { team: "Denver Broncos", round: 7 },
  { team: "Cleveland Browns", round: 7 },
  { team: "Seattle Seahawks", round: 7 },
  { team: "Los Angeles Chargers", round: 7 },
  { team: "Baltimore Ravens", round: 7 },
  { team: "Los Angeles Rams", round: 7 },
  { team: "New England Patriots", round: 7 },
  { team: "New York Jets", round: 7 },
  { team: "Las Vegas Raiders", round: 7 },
  { team: "Atlanta Falcons", round: 7 },
  { team: "Carolina Panthers", round: 7 },
  { team: "New Orleans Saints", round: 7 },
  { team: "Green Bay Packers", round: 7 },
  { team: "Minnesota Vikings", round: 7 },
  { team: "Jacksonville Jaguars", round: 7 },
  { team: "New York Giants", round: 7 },
  { team: "Dallas Cowboys", round: 7 },
  { team: "Buffalo Bills", round: 7 },
  { team: "Cincinnati Bengals", round: 7 },
  { team: "San Francisco 49ers", round: 7 },
  { team: "Kansas City Chiefs", round: 7 },
  { team: "Los Angeles Rams", round: 7 },
  { team: "Detroit Lions", round: 7 },
  { team: "Tampa Bay Buccaneers", round: 7 },
  { team: "Miami Dolphins", round: 7 },
  { team: "Seattle Seahawks", round: 7 },
  { team: "Los Angeles Chargers", round: 7 },
  { team: "Green Bay Packers", round: 7 },
  ];

  const filteredDraftOrder = draftOrder.filter((pick) => pick.round <= rounds);

  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [draftClass, setDraftClass] = useState([
      {'name': 'Bryce Young', 'position': 'QB', 'college': 'Alabama'}, {'name': 'C.J. Stroud', 'position': 'QB', 'college': 'Ohio St.'}, {'name': 'Will Anderson', 'position': 'LB', 'college': 'Alabama'}, {'name': 'Anthony Richardson', 'position': 'QB', 'college': 'Florida'}, {'name': 'Devon Witherspoon', 'position': 'DB', 'college': 'Illinois'}, {'name': 'Paris Johnson', 'position': 'OL', 'college': 'Ohio St.'}, {'name': 'Tyree Wilson', 'position': 'OLB', 'college': 'Texas Tech'}, {'name': 'Bijan Robinson', 'position': 'RB', 'college': 'Texas'}, {'name': 'Jalen Carter', 'position': 'DL', 'college': 'Georgia'}, {'name': 'Darnell Wright', 'position': 'OL', 'college': 'Tennessee'}, {'name': 'Peter Skoronski', 'position': 'OL', 'college': 'Northwestern'}, {'name': 'Jahmyr Gibbs', 'position': 'RB', 'college': 'Alabama'}, {'name': 'Lukas Van Ness', 'position': 'DL', 'college': 'Iowa'}, {'name': 'Broderick Jones', 'position': 'OL', 'college': 'Georgia'}, {'name': 'Will McDonald', 'position': 'DE', 'college': 'Iowa St.'}, {'name': 'Emmanuel Forbes', 'position': 'CB', 'college': 'Mississippi St.'}, {'name': 'Christian Gonzalez', 'position': 'DB', 'college': 'Oregon'}, {'name': 'Jack Campbell', 'position': 'LB', 'college': 'Iowa'}, {'name': 'Calijah Kancey', 'position': 'DL', 'college': 'Pittsburgh'}, {'name': 'Jaxon Smith-Njigba', 'position': 'WR', 'college': 'Ohio St.'}, {'name': 'Quentin Johnston', 'position': 'WR', 'college': 'TCU'}, {'name': 'Zay Flowers', 'position': 'WR', 'college': 'Boston Col.'}, {'name': 'Jordan Addison', 'position': 'WR', 'college': 'USC'}, {'name': 'Deonte Banks', 'position': 'DB', 'college': 'Maryland'}, {'name': 'Dalton Kincaid', 'position': 'TE', 'college': 'Utah'}, {'name': 'Mazi Smith', 'position': 'DL', 'college': 'Michigan'}, {'name': 'Anton Harrison', 'position': 'OL', 'college': 'Oklahoma'}, {'name': 'Myles Murphy', 'position': 'DE', 'college': 'Clemson'}, {'name': 'Bryan Bresee', 'position': 'DT', 'college': 'Clemson'}, {'name': 'Nolan Smith', 'position': 'OLB', 'college': 'Georgia'}, {'name': 'Felix Anudike-Uzomah', 'position': 'DE', 'college': 'Kansas St.'}, {'name': 'Joey Porter Jr.', 'position': 'CB', 'college': 'Penn St.'}, {'name': 'Will Levis', 'position': 'QB', 'college': 'Kentucky'}, {'name': 'Sam LaPorta', 'position': 'TE', 'college': 'Iowa'}, {'name': 'Michael Mayer', 'position': 'TE', 'college': 'Notre Dame'}, {'name': 'Steve Avila', 'position': 'C', 'college': 'TCU'}, {'name': 'Derick Hall', 'position': 'DE', 'college': 'Auburn'}, {'name': 'Matthew Bergeron', 'position': 'OL', 'college': 'Syracuse'}, {'name': 'Jonathan Mingo', 'position': 'WR', 'college': 'Mississippi'}, {'name': 'Isaiah Foskey', 'position': 'DL', 'college': 'Notre Dame'}, {'name': 'BJ Ojulari', 'position': 'DE', 'college': 'LSU'}, {'name': 'Luke Musgrave', 'position': 'TE', 'college': 'Oregon St.'}, {'name': 'Joe Tippmann', 'position': 'OL', 'college': 'Wisconsin'}, {'name': 'Julius Brents', 'position': 'DB', 'college': 'Kansas St.'}, {'name': 'Brian Branch', 'position': 'DB', 'college': 'Alabama'}, {'name': 'Keion White', 'position': 'DL', 'college': 'Georgia Tech'}, {'name': 'Quan Martin', 'position': 'DB', 'college': 'Illinois'}, {'name': 'Cody Mauch', 'position': 'T', 'college': 'North Dakota St.'}, {'name': 'Keeanu Benton', 'position': 'NT', 'college': 'Wisconsin'}, {'name': 'Jayden Reed', 'position': 'WR', 'college': 'Michigan St.'}, {'name': 'Cam Smith', 'position': 'DB', 'college': 'South Carolina'}, {'name': 'Zach Charbonnet', 'position': 'RB', 'college': 'UCLA'}, {'name': 'Gervon Dexter', 'position': 'DL', 'college': 'Florida'}, {'name': 'Tuli Tuipulotu', 'position': 'DL', 'college': 'USC'}, {'name': 'Rashee Rice', 'position': 'WR', 'college': 'SMU'}, {'name': 'Tyrique Stevenson', 'position': 'CB', 'college': 'Miami (FL)'}, {'name': 'John Michael Schmitz', 'position': 'OL', 'college': 'Minnesota'}, {'name': 'Luke Schoonmaker', 'position': 'TE', 'college': 'Michigan'}, {'name': "O'Cyrus Torrence", 'position': 'OL', 'college': 'Florida'}, {'name': 'DJ Turner', 'position': 'DB', 'college': 'Michigan'}, {'name': 'Brenton Strange', 'position': 'TE', 'college': 'Penn St.'}, {'name': 'Juice Scruggs', 'position': 'OL', 'college': 'Penn St.'}, {'name': 'Marvin Mims', 'position': 'WR', 'college': 'Oklahoma'}, {'name': 'Zacch Pickens', 'position': 'DL', 'college': 'South Carolina'}, {'name': 'Tyler Steen', 'position': 'OL', 'college': 'Alabama'}, {'name': 'Sydney Brown', 'position': 'DB', 'college': 'Illinois'}, {'name': 'Drew Sanders', 'position': 'LB', 'college': 'Arkansas'}, {'name': 'Hendon Hooker', 'position': 'QB', 'college': 'Tennessee'}, {'name': 'Tank Dell', 'position': 'WR', 'college': 'Houston'}, {'name': 'Byron Young', 'position': 'DL', 'college': 'Alabama'}, {'name': 'Kendre Miller', 'position': 'RB', 'college': 'TCU'}, {'name': 'Garrett Williams', 'position': 'DB', 'college': 'Syracuse'}, {'name': 'Jalin Hyatt', 'position': 'WR', 'college': 'Tennessee'}, {'name': 'Cedric Tillman', 'position': 'WR', 'college': 'Tennessee'}, {'name': 'Zach Harrison', 'position': 'DE', 'college': 'Ohio St.'}, {'name': 'Marte Mapu', 'position': 'DB', 'college': 'Sacramento St.'}, {'name': 'Byron Young', 'position': 'LB', 'college': 'Tennessee'}, {'name': 'Tucker Kraft', 'position': 'TE', 'college': 'South Dakota St.'}, {'name': 'Josh Downs', 'position': 'WR', 'college': 'North Carolina'}, {'name': 'DJ Johnson', 'position': 'OLB', 'college': 'Oregon'}, {'name': 'Tyjae Spears', 'position': 'RB', 'college': 'Tulane'}, {'name': 'YaYa Diaby', 'position': 'DL', 'college': 'Louisville'}, {'name': 'Riley Moss', 'position': 'DB', 'college': 'Iowa'}, {'name': "De'Von Achane", 'position': 'RB', 'college': 'Texas A&M'}, {'name': 'Daiyan Henley', 'position': 'LB', 'college': 'Washington St.'}, {'name': 'Trenton Simpson', 'position': 'LB', 'college': 'Clemson'}, {'name': "Ji'Ayir Brown", 'position': 'S', 'college': 'Penn St.'}, {'name': 'Tank Bigsby', 'position': 'RB', 'college': 'Auburn'}, {'name': 'Kobie Turner', 'position': 'DT', 'college': 'Wake Forest'}, {'name': 'DeMarvion Overshown', 'position': 'LB', 'college': 'Texas'}, {'name': 'Dorian Williams', 'position': 'LB', 'college': 'Tulane'}, {'name': 'Wanya Morris', 'position': 'OL', 'college': 'Oklahoma'}, {'name': 'Darnell Washington', 'position': 'TE', 'college': 'Georgia'}, {'name': 'Michael Wilson', 'position': 'WR', 'college': 'Stanford'}, {'name': 'Jordan Battle', 'position': 'DB', 'college': 'Alabama'}, {'name': 'Brodric Martin', 'position': 'DT', 'college': 'Western Kentucky'}, {'name': 'Ricky Stromberg', 'position': 'OL', 'college': 'Arkansas'}, {'name': 'Siaki Ika', 'position': 'DL', 'college': 'Baylor'}, {'name': 'Jake Moody', 'position': 'K', 'college': 'Michigan'}, {'name': 'Tre Tucker', 'position': 'WR', 'college': 'Cincinnati'}, {'name': 'Cameron Latu', 'position': 'TE', 'college': 'Alabama'}, {'name': 'Mekhi Blackmon', 'position': 'CB', 'college': 'USC'}, {'name': 'Nick Saldiveri', 'position': 'OL', 'college': 'Old Dominion'}, {'name': 'Jakorian Bennett', 'position': 'DB', 'college': 'Maryland'}, {'name': 'Kelee Ringo', 'position': 'DB', 'college': 'Georgia'}, {'name': 'Blake Freeland', 'position': 'OL', 'college': 'BYU'}, {'name': 'Jake Andrews', 'position': 'OL', 'college': 'Troy'}, {'name': 'Anthony Bradford', 'position': 'OL', 'college': 'LSU'}, {'name': 'Dylan Horton', 'position': 'DL', 'college': 'TCU'}, {'name': 'Adetomiwa Adebawore', 'position': 'DL', 'college': 'Northwestern'}, {'name': 'Dawand Jones', 'position': 'OL', 'college': 'Ohio St.'}, {'name': 'Chad Ryland', 'position': 'K', 'college': 'Maryland'}, {'name': 'Clark Phillips', 'position': 'CB', 'college': 'Utah'}, {'name': 'Chandler Zavala', 'position': 'G', 'college': 'North Carolina St.'}, {'name': 'Roschon Johnson', 'position': 'RB', 'college': 'Texas'}, {'name': 'Colby Wooden', 'position': 'DE', 'college': 'Auburn'}, {'name': 'Sidy Sow', 'position': 'OL', 'college': 'Eastern Michigan'}, {'name': 'Braeden Daniels', 'position': 'OL', 'college': 'Utah'}, {'name': 'Chamarri Conner', 'position': 'DB', 'college': 'Virginia Tech'}, {'name': 'Carter Warren', 'position': 'OL', 'college': 'Pittsburgh'}, {'name': 'Ventrell Miller', 'position': 'LB', 'college': 'Florida'}, {'name': 'Jon Gaines', 'position': 'OL', 'college': 'UCLA'}, {'name': 'Cameron Young', 'position': 'DT', 'college': 'Mississippi St.'}, {'name': 'Tavius Robinson', 'position': 'DE', 'college': 'Mississippi'}, {'name': 'Derius Davis', 'position': 'WR', 'college': 'TCU'}, {'name': 'Isaiah McGuire', 'position': 'DL', 'college': 'Missouri'}, {'name': 'Jake Haener', 'position': 'QB', 'college': 'Fresno St.'}, {'name': 'Stetson Bennett', 'position': 'QB', 'college': 'Georgia'}, {'name': 'Viliami Fehoko', 'position': 'DL', 'college': 'San Jose St.'}, {'name': 'Tyler Lacy', 'position': 'DE', 'college': 'Oklahoma St.'}, {'name': 'Charlie Jones', 'position': 'WR', 'college': 'Purdue'}, {'name': 'Nick Herbig', 'position': 'OLB', 'college': 'Wisconsin'}, {'name': 'Tyler Scott', 'position': 'WR', 'college': 'Cincinnati'}, {'name': 'Jay Ward', 'position': 'S', 'college': 'LSU'}, {'name': "Aidan O'Connell", 'position': 'QB', 'college': 'Purdue'}, {'name': 'Yasir Abdullah', 'position': 'LB', 'college': 'Louisville'}, {'name': 'K.J. Henry', 'position': 'DE', 'college': 'Clemson'}, {'name': 'Darius Rush', 'position': 'DB', 'college': 'South Carolina'}, {'name': 'Clayton Tune', 'position': 'QB', 'college': 'Houston'}, {'name': 'Dorian Thompson-Robinson', 'position': 'QB', 'college': 'UCLA'}, {'name': 'Jaquelin Roy', 'position': 'DT', 'college': 'LSU'}, {'name': 'Cameron Mitchell', 'position': 'DB', 'college': 'Northwestern'}, {'name': 'Israel Abanikanda', 'position': 'RB', 'college': 'Pittsburgh'}, {'name': 'Atonio Mafi', 'position': 'OL', 'college': 'UCLA'}, {'name': 'Jammie Robinson', 'position': 'DB', 'college': 'Florida St.'}, {'name': 'Jordan Howden', 'position': 'DB', 'college': 'Minnesota'}, {'name': 'Josh Whyle', 'position': 'TE', 'college': 'Cincinnati'}, {'name': 'Noah Sewell', 'position': 'LB', 'college': 'Oregon'}, {'name': 'Sean Clifford', 'position': 'QB', 'college': 'Penn St.'}, {'name': 'Justin Shorter', 'position': 'WR', 'college': 'Florida'}, {'name': 'Mike Morris', 'position': 'DE', 'college': 'Michigan'}, {'name': 'Colby Sorsdal', 'position': 'OL', 'college': 'William & Mary'}, {'name': 'SirVocea Dennis', 'position': 'LB', 'college': 'Pittsburgh'}, {'name': 'Olusegun Oluwatimi', 'position': 'C', 'college': 'Michigan'}, {'name': 'Darrell Luter', 'position': 'CB', 'college': 'South Alabama'}, {'name': 'Jordan McFadden', 'position': 'OL', 'college': 'Clemson'}, {'name': 'Kyu Blu Kelly', 'position': 'CB', 'college': 'Stanford'}, {'name': 'Daniel Scott', 'position': 'S', 'college': 'California'}, {'name': 'Dontayvion Wicks', 'position': 'WR', 'college': 'Virginia'}, {'name': 'Antonio Johnson', 'position': 'DB', 'college': 'Texas A&M'}, {'name': 'Nick Hampton', 'position': 'OLB', 'college': 'Appalachian St.'}, {'name': 'Will Mallory', 'position': 'TE', 'college': 'Miami (FL)'}, {'name': 'Chase Brown', 'position': 'RB', 'college': 'Illinois'}, {'name': 'Jaren Hall', 'position': 'QB', 'college': 'BYU'}, {'name': 'Terell Smith', 'position': 'DB', 'college': 'Minnesota'}, {'name': 'BJ Thompson', 'position': 'DE', 'college': 'S.F. Austin'}, {'name': "Henry To'oTo'o", 'position': 'LB', 'college': 'Alabama'}, {'name': 'Owen Pappoe', 'position': 'LB', 'college': 'Auburn'}, {'name': 'Asim Richards', 'position': 'OL', 'college': 'North Carolina'}, {'name': 'Christopher Smith', 'position': 'DB', 'college': 'Georgia'}, {'name': 'Payne Durham', 'position': 'TE', 'college': 'Purdue'}, {'name': 'Eric Gray', 'position': 'RB', 'college': 'Oklahoma'}, {'name': 'Robert Beal', 'position': 'OLB', 'college': 'Georgia'}, {'name': 'Warren McClendon', 'position': 'OL', 'college': 'Georgia'}, {'name': 'Davis Allen', 'position': 'TE', 'college': 'Clemson'}, {'name': 'Evan Hull', 'position': 'RB', 'college': 'Northwestern'}, {'name': 'Puka Nacua', 'position': 'WR', 'college': 'BYU'}, {'name': 'Eric Scott', 'position': 'DB', 'college': 'Southern Miss'}, {'name': 'Karl Brooks', 'position': 'DT', 'college': 'Bowling Green'}, {'name': "Kei'Trel Clark", 'position': 'DB', 'college': 'Louisville'}, {'name': 'Josh Hayes', 'position': 'CB', 'college': 'Kansas St.'}, {'name': "Tre'Vius Tomlinson", 'position': 'CB', 'college': 'TCU'}, {'name': 'JL Skinner', 'position': 'S', 'college': 'Boise St.'}, {'name': 'Zaire Barnes', 'position': 'LB', 'college': 'Western Michigan'}, {'name': 'Parker Washington', 'position': 'WR', 'college': 'Penn St.'}, {'name': 'Jaelyn Duncan', 'position': 'OL', 'college': 'Maryland'}, {'name': 'Kayshon Boutte', 'position': 'WR', 'college': 'LSU'}, {'name': 'Tanner McKee', 'position': 'QB', 'college': 'Stanford'}, {'name': 'Ochaun Mathis', 'position': 'DE', 'college': 'Nebraska'}, {'name': 'Luke Wypler', 'position': 'OL', 'college': 'Ohio St.'}, {'name': 'Trey Palmer', 'position': 'WR', 'college': 'Nebraska'}, {'name': 'Bryce Baringer', 'position': 'P', 'college': 'Michigan St.'}, {'name': 'Chris Rodriguez', 'position': 'RB', 'college': 'Kentucky'}, {'name': 'Keondre Coburn', 'position': 'DT', 'college': 'Texas'}, {'name': 'A.T. Perry', 'position': 'WR', 'college': 'Wake Forest'}, {'name': 'Jose Ramirez', 'position': 'DL', 'college': 'Eastern Michigan'}, {'name': 'Elijah Higgins', 'position': 'WR', 'college': 'Stanford'}, {'name': 'Jerrick Reed', 'position': 'S', 'college': 'New Mexico'}, {'name': 'Malaesala Aumavae-Laulu', 'position': 'OL', 'college': 'Oregon'}, {'name': 'Scott Matlock', 'position': 'DT', 'college': 'Boise St.'}, {'name': 'Jarrett Patterson', 'position': 'OL', 'college': 'Notre Dame'}, {'name': 'Christian Braswell', 'position': 'DB', 'college': 'Rutgers'}, {'name': 'Amari Burney', 'position': 'LB', 'college': 'Florida'}, {'name': 'Jarrick Bernard-Converse', 'position': 'CB', 'college': 'LSU'}, {'name': 'Xavier Hutchinson', 'position': 'WR', 'college': 'Iowa St.'}, {'name': 'Andrei Iosivas', 'position': 'WR', 'college': 'Princeton'}, {'name': 'Anders Carlson', 'position': 'K', 'college': 'Auburn'}, {'name': 'Erick Hallett', 'position': 'DB', 'college': 'Pittsburgh'}, {'name': 'Tre Hawkins', 'position': 'CB', 'college': 'Old Dominion'}, {'name': 'Demario Douglas', 'position': 'WR', 'college': 'Liberty'}, {'name': 'Titus Leo', 'position': 'LB', 'college': 'Wagner'}, {'name': 'Deuce Vaughn', 'position': 'RB', 'college': 'Kansas St.'}, {'name': 'Dante Stills', 'position': 'DT', 'college': 'West Virginia'}, {'name': 'Ameer Speed', 'position': 'CB', 'college': 'Michigan St.'}, {'name': 'Zach Evans', 'position': 'RB', 'college': 'Mississippi'}, {'name': 'Dee Winters', 'position': 'LB', 'college': 'TCU'}, {'name': 'Brad Robbins', 'position': 'P', 'college': 'Michigan'}, {'name': 'Travis Bell', 'position': 'DL', 'college': 'Kennesaw St.'}, {'name': 'Antoine Green', 'position': 'WR', 'college': 'North Carolina'}, {'name': 'Zack Kuntz', 'position': 'TE', 'college': 'Old Dominion'}, {'name': 'Jaylon Jones', 'position': 'DB', 'college': 'Texas A&M'}, {'name': 'DeWayne McBride', 'position': 'RB', 'college': 'Ala-Birmingham'}, {'name': 'Ethan Evans', 'position': 'P', 'college': 'Wingate'}, {'name': 'DeMarcco Hellams', 'position': 'DB', 'college': 'Alabama'}, {'name': 'Jovaughn Gwyn', 'position': 'OL', 'college': 'South Carolina'}
    
  ]);
  const [draftResults, setDraftResults] = useState([...filteredDraftOrder]);
  const [isDraftRunning, setIsDraftRunning] = useState(false);
  const [isUserPicking, setIsUserPicking] = useState(false);
  const [isDraftComplete, setIsDraftComplete] = useState(false);
  const [userPickTimeLeft, setUserPickTimeLeft] = useState(timePerPick);

  const userTeams = new Set(selectedTeams.map((index) => locations[index]));

  const handleStartDraft = () => {
    setCurrentPickIndex(0);
    setDraftResults([...filteredDraftOrder]);
    setIsDraftRunning(true);
    setIsUserPicking(false);
    setIsDraftComplete(false);
  };

  const simulateNextPick = () => {
    if (currentPickIndex >= draftResults.length) {
      setIsDraftRunning(false);
      setIsDraftComplete(true);
      return;
    }

    const currentTeam = draftResults[currentPickIndex].team;

    if (userTeams.has(currentTeam)) {
      setIsUserPicking(true);
    } else {
      makeCpuPick(() => {
        if (currentPickIndex === draftResults.length - 1) {
          setIsDraftRunning(false);
          setIsDraftComplete(true);
        }
      });
    }
  };

  const makeCpuPick = (callback) => {
    const topPlayer = draftClass[0];
    if (topPlayer) {
      const updatedDraftClass = draftClass.slice(1);
      const updatedDraftResults = [...draftResults];
      updatedDraftResults[currentPickIndex] = {
        ...draftResults[currentPickIndex],
        player: `${topPlayer.name} (${topPlayer.position})`,
      };

      setDraftClass(updatedDraftClass);
      setDraftResults(updatedDraftResults);

      // Move to the next pick after 1 second
      setTimeout(() => {
        setCurrentPickIndex((prevIndex) => prevIndex + 1);
        if (callback) callback(); // Trigger the callback after the pick
      }, 1);
    }
  };

  const handleUserPick = (player) => {
    const updatedDraftClass = draftClass.filter((p) => p.name !== player.name);
    const updatedDraftResults = [...draftResults];
    updatedDraftResults[currentPickIndex] = {
      ...draftResults[currentPickIndex],
      player: `${player.name} (${player.position})`,
    };

    setDraftClass(updatedDraftClass);
    setDraftResults(updatedDraftResults);

    setIsUserPicking(false);
    setCurrentPickIndex((prevIndex) => prevIndex + 1);
  };

  useEffect(() => {
    let timer;

    if (isUserPicking && userPickTimeLeft > 0) {
      timer = setInterval(() => {
        setUserPickTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    if (userPickTimeLeft === 0 && isUserPicking) {
      handleUserPick(draftClass[0]); // Auto-pick for the user when time runs out
    }

    return () => clearInterval(timer);
  }, [isUserPicking, userPickTimeLeft]);

  useEffect(() => {
    if (isDraftRunning && !isUserPicking && currentPickIndex < draftResults.length) {
      simulateNextPick();
    }
  }, [isDraftRunning, isUserPicking, currentPickIndex]);

  return (
    <div className="min-h-screen bg-[#5A6BB0] text-white">
      {/* Header */}
      <div className="w-full h-32 bg-black">
        <div className="container mx-auto px-4 h-full flex items-center">
          <h1 className="text-4xl font-bold text-white">Draft Room</h1>
          <div className="ml-auto">
            <Link to="/mockdraft" className="text-xl text-white underline">
              Back to Mock Draft
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-8">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">Draft Information</h2>
          <p className="text-lg">
            <strong>Selected Teams:</strong>{" "}
            {selectedTeams.length > 0
              ? selectedTeams.map((index) => locations[index]).join(", ")
              : "No teams selected"}
          </p>
          <p className="text-lg">
            <strong>Time Per Pick:</strong> {timePerPick} seconds
          </p>
          <p className="text-lg">
            <strong>Number of Rounds:</strong> {rounds}
          </p>
        </div>

        {/* Start Draft Button */}
        {!isDraftRunning && !isDraftComplete && (
          <button
            onClick={handleStartDraft}
            className="mt-8 mb-8 px-6 py-2 bg-white text-black text-lg font-semibold rounded hover:bg-gray-200"
          >
            Start Draft
          </button>
        )}

        <h2 className="text-3xl font-semibold mb-4">Draft Order</h2>
        <ol className="list-decimal ml-6">
          {draftResults.map((pick, index) => (
            <React.Fragment key={index}>
              {index === 0 || pick.round !== draftResults[index - 1].round ? (
                <h3 className="text-2xl font-bold mt-4 mb-2">Round {pick.round}</h3>
              ) : null}
              <li className="text-lg">
                {pick.team} {pick.player ? `- ${pick.player}` : ""}
              </li>
            </React.Fragment>
          ))}
        </ol>

        {/* User Pick Modal */}
        {isUserPicking && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg text-black max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4">
                {draftResults[currentPickIndex].team} is on the clock! Make your selection!
              </h2>
              <p className="text-red-500 font-semibold mb-4">
                Time Remaining: {userPickTimeLeft} seconds
              </p>
              <div
                className="overflow-y-auto"
                style={{ maxHeight: "300px", border: "1px solid #ccc", padding: "8px" }}
              >
                <ul>
                  {draftClass.map((player) => (
                    <li key={player.name} className="mb-2">
                      {player.name} ({player.position}, {player.college}){" "}
                      <button
                        onClick={() => handleUserPick(player)}
                        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
                      >
                        Pick
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Draft Complete Modal */}
        {isDraftComplete && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg text-black max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4">Draft Complete!</h2>
              <div className="flex justify-between">
                <button className="px-4 py-2 bg-blue-500 text-white rounded">
                  Save Draft
                </button>
                <button
                  onClick={() => navigate("/mockdraft")}
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Return to Mock Draft Home
                </button>
                <button
                  onClick={() => setIsDraftComplete(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Return to Draft Room
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftRoom;
