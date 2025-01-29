import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const SUPABASE_URL = 'https://pvuzvnemuhutrdmpchmi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dXp2bmVtdWh1dHJkbXBjaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwNzgsImV4cCI6MjA0ODk4MzA3OH0.fB_b1Oe_2ckp9FGh6vmEs2jIRHjdDoaqzHVsM8NRZRY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Fetch all players
export const fetchPlayers = async () => {
  try {
    const { data, error } = await supabase
      .from('db_playerprofile')
      .select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching players:', error.message);
    throw error;
  }
};

// Fetch rankings with optional position filter
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

// Fetch player details by ID
export const fetchPlayerDetails = async (playerId) => {
  try {
    const { data, error } = await supabase
      .from('db_playerprofile')
      .select('*')
      .eq('id', playerId)
      .single(); // Assume single result for a specific player ID
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching player details:', error.message);
    throw error;
  }
};

// Sign Up
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing up:', error.message);
    throw error;
  }
};

// Sign In
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
};

// Sign Out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
};

// Get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting session:', error.message);
    throw error;
  }
};