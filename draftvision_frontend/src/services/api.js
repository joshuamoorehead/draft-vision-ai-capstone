// services/api.js
import { createClient } from '@supabase/supabase-js';
const { GoogleGenerativeAI } = require("@google/generative-ai");
const prevPlayer = "";
const prevBio = "";
const SUPABASE_URL = 'https://pvuzvnemuhutrdmpchmi.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dXp2bmVtdWh1dHJkbXBjaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwNzgsImV4cCI6MjA0ODk4MzA3OH0.fB_b1Oe_2ckp9FGh6vmEs2jIRHjdDoaqzHVsM8NRZRY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export { supabase };
export const fetchPlayers = async () => {
  try {
    const { data, error } = await supabase
      .from('db_playerprofile')
      .select('*')
      .range(0, 99999);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching players:', error.message);
    throw error;
  }
};

// returns all players from 2024 (made for the large list)
// joins players with their xAV rating in the predictions_2024 table. 
export const fetch2024Players = async(position = null) => {
  try {
    const playersQuery = supabase.from('db_playerprofile').select('*').eq('year_drafted', 2024).range(0,9999);

    const predictionsQuery = supabase.from('db_predictions_2024').select("*").range(0,9999); 

    const [{data: players, error: playerError}, { data: predictions, error: predictionsError }] = await Promise.all([
      playersQuery, predictionsQuery
    ])

    if (playerError) throw playerError; 
    if (predictionsError) throw predictionsError; 

    const data = players.map(player => ({
      ...player, 
      predictions: predictions.find(prediction => prediction.player_id === player.id) || {xAV: parseFloat(( 11.31 / (player.draft_round + 0.5) + 1.51).toFixed(2))} 
    }));
    return data; 
  } catch (error) {
    console.error('Error fetching players: ', error.message);
    throw error; 
  }
}

export const getPredictions = async (position = null) => {
  try {
    const query = supabase.from('db_predictions_2024').select('*').range(0,99999);
    if (position) query.eq('position', position); 
    const { data, error } = await query; 
    if (error) throw error; 
    return data; 
  } catch (error) {
    console.error("Error fetching predictions: ", error.message); 
    throw error; 
  }
}

export const getRankings = async (position = null) => {
  try {
    const query = supabase.from('db_prospect_rankings').select('*');
    if (position) query.eq('position', position);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching rankings:', error.message);
    throw error;
  }
};

export const fetchPlayerDetails = async (playerId) => {
  try {
    const { data, error } = await supabase
      .from('db_playerprofile')
      .select('*')
      .eq('id', playerId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching player details:', error.message);
    throw error;
  }
};

// Fetch stats based on player position.
export const fetchPlayerStats = async (playerId, position) => {
  let tableName = '';
  if (position.toLowerCase() === 'qb') {
    tableName = 'db_passingleaders';
  } else if (position.toLowerCase() === 'rb') {
    tableName = 'db_rbstats';
  } else if (['wr', 'te'].includes(position.toLowerCase())) {
    tableName = 'db_recstats';
  } else if (['dl', 'de', 'dt', 'nt'].includes(position.toLowerCase())) {
    tableName = 'db_defensivepositionalstats';
  } else if (['lb', 'ilb', 'olb'].includes(position.toLowerCase())) {
    tableName = 'db_defensivepositionalstats';
  } else if (['db', 'cb', 's'].includes(position.toLowerCase())) {
    tableName = 'db_defensivepositionalstats';
  } 
  else {
    // For other positions (like TE), return null or handle accordingly.
    return null;
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('playerid_id', playerId);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching stats from ${tableName}:`, error.message);
    throw error;
  }
};

export const generatePlayerBio = async (player) => {
 
  // If a bio already exists, return it.
  if (player.bio && player.bio.trim() != null) {
    return player.bio;
  }
  const apikey = "AIzaSyAzCxuWZ8jrggVUZjRGbZ7EKPjbrn2dtOA";
  const genAI = new GoogleGenerativeAI(apikey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Generate a 1000-character biography about the college football career of a player named ${player.name}. He played as a ${player.position} for ${player.school} Mention key aspects of his career. Write as if you are a sports journalist. Focus on stats, acheivements, and big moments from their college career. ONLY TALK ABOUT THEIR COLLEGE CAREER. Use as many of the 1000 characters as you can.`;

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
  const generatedBio = result.response.text();
  // Only update the database if a non-empty bio is generated.
  if (generatedBio) {
    const { error } = await supabase
      .from('db_playerprofile')
      .update({ bio: generatedBio })
      .eq('id', player.id);
    if (error) {
      console.error('Error updating player bio in database:', error.message);
    }
    return generatedBio;
  } else {
    // If nothing was generated, return null so that the bio remains unset.
    return null;
  }
};
