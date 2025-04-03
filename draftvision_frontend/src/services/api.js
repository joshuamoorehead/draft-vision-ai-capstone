// services/api.js
import { createClient } from '@supabase/supabase-js';
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Remove unused variables
// eslint-disable-next-line no-unused-vars
const prevPlayer = "";
// eslint-disable-next-line no-unused-vars
const prevBio = "";

// Supabase credentials
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client with explicit storage options
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Reconnects the realtime client to ensure live data updates work properly
 * @returns {Promise<boolean>} Success status of reconnection attempt
 */
export const reconnectRealtimeClient = async () => {
  try {
    console.log("Attempting to reconnect realtime client...");
    
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    
    if (session?.access_token) {
      // First disconnect if needed
      try {
        supabase.realtime.disconnect();
      } catch (e) {
        console.log("No active connection to disconnect", e);
      }
      
      // Short delay before reconnecting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reconnect with current token
      supabase.realtime.setAuth(session.access_token);
      supabase.realtime.connect();
      
      console.log("Realtime client reconnected");
      return true;
    } else {
      console.log("No valid session found for reconnection");
      return false;
    }
  } catch (error) {
    console.error("Failed to reconnect realtime client:", error);
    return false;
  }
};

/**
 * Checks if a username is already taken
 * @param {string} username - The username to check
 * @returns {Promise<Object>} Object containing availability status
 */
export const checkUsernameAvailability = async (username) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // No records found, username is available
      return { available: true };
    } else if (error) {
      throw error;
    }
    
    // Username exists
    return { available: false };
  } catch (error) {
    console.error('Error checking username availability:', error);
    return { available: false, error };
  }
};

/**
 * Registers a new user in the system
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} username - User's username
 * @returns {Promise<Object>} Registration result with data or error
 */
export const signUp = async (email, password, username) => {
  try {
    // Check if email already exists
    const { data: existingEmailData } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('email', email);
    
    if (existingEmailData && existingEmailData.length > 0) {
      return { 
        data: null, 
        error: { message: 'Email already registered. Please login instead.' }
      };
    }
    
    // Check if username is already taken
    const { data: existingUsernameData } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username);
    
    if (existingUsernameData && existingUsernameData.length > 0) {
      return { 
        data: null, 
        error: { message: 'Username is already taken. Please choose another.' }
      };
    }
    
    // Sign up the user through Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });
    
    if (error) {
      return { data: null, error };
    }
    
    // Create user profile in the database
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          email: email,
          username: username,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      
      if (profileError) {
        console.error("Error creating user profile:", profileError);
        return { data, error: profileError };
      }
    }
    
    return { data, error: null };
  } catch (e) {
    console.error("Error in signUp function:", e);
    return { data: null, error: { message: e.message || 'Unknown error' } };
  }
};

/**
 * Signs in an existing user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Sign-in result with data or error
 */
export const signIn = async (email, password) => {
  const result = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  // Ensure profile exists after sign in
  if (result.data?.session) {
    await reconnectRealtimeClient();
    
    // Check if user profile exists, create one if it doesn't
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', result.data.user.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create one with default username
        const defaultUsername = email.split('@')[0];
        
        await supabase.from('user_profiles').insert({
          user_id: result.data.user.id,
          email: email,
          username: defaultUsername,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          notification_preferences: {
            draft_reminders: true,
            draft_results: true
          }
        });
      }
    } catch (err) {
      console.error("Error checking/creating user profile on signin:", err);
    }
  }
  
  return result;
};

/**
 * Initiates Google OAuth sign-in
 * @returns {Promise<Object>} OAuth redirect response
 */
export const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.REACT_APP_APP_URL}/auth/callback`,
      skipBrowserRedirect: false
    }
  });
};

/**
 * Signs out the current user
 * @returns {Promise<Object>} Sign-out result
 */
export const signOut = async () => {
  try {
    // Call Supabase signOut
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear any local storage items related to auth
    localStorage.removeItem('supabase.auth.token');
    
    // Return success
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error.message);
    return { error };
  }
};

/**
 * Sends a password reset email
 * @param {string} email - User's email
 * @returns {Promise<Object>} Result of password reset request
 */
export const resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error resetting password:', error.message);
    return { data: null, error };
  }
};

/**
 * Retrieves a user's profile by ID
 * @param {string} userId - User ID to fetch profile for
 * @returns {Promise<Object|null>} User profile or null if not found
 */
export const getUserProfile = async (userId) => {
  try {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Gets username for a user by their ID
 * @param {string} userId - User ID to fetch username for
 * @returns {Promise<string|null>} Username or null if not found
 */
export const getUsernameById = async (userId) => {
  try {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist
        return null;
      }
      throw error;
    }
    
    return data.username;
  } catch (error) {
    console.error('Error fetching username:', error);
    return null;
  }
};

/**
 * Fetches all player data from the database
 * @returns {Promise<Array>} Array of player objects
 */
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

/**
 * Fetches 2024 draft players with predictions
 * @param {string|null} position - Optional position filter
 * @returns {Promise<Array>} Array of player objects with predictions
 */
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

/**
 * Fetches player predictions for 2024 draft
 * @param {string|null} position - Optional position filter
 * @returns {Promise<Array>} Array of prediction objects
 */
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

/**
 * Fetches player rankings
 * @param {string|null} position - Optional position filter
 * @returns {Promise<Array>} Array of ranking objects
 */
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

/**
 * Fetches detailed information for a specific player by ID
 * @param {number} playerId - Player ID to fetch
 * @returns {Promise<Object>} Player details
 */
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

/**
 * Fetches detailed information for a specific player by name
 * @param {string} playerName - Player name to fetch
 * @returns {Promise<Object>} Player details
 */
export const fetchPlayerDetails2 = async (playerName) => {
  try {
    const { data, error } = await supabase
      .from('db_playerprofile')
      .select('*')
      .eq('name', playerName)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching player details:', error.message);
    throw error;
  }
};

/**
 * Fetches player statistics based on position
 * @param {number} playerId - Player ID to fetch stats for
 * @param {string} position - Player position to determine table
 * @returns {Promise<Array|null>} Player stats or null if position not supported
 */
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
    // For positions without specific stat tables
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

/**
 * Saves a user's mock draft
 * @param {Object} draftData - Draft data to save
 * @returns {Promise<Object>} Saved draft result
 */
export const saveDraft = async (draftData) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }
    
    // Get the username for the current user
    const username = await getUsernameById(userData.user.id) || 'Anonymous';
    
    const { data, error } = await supabase
      .from('saved_drafts')
      .insert([
        { 
          user_id: userData.user.id,
          username: username,
          draft_name: draftData.name || `Draft ${new Date().toLocaleDateString()}`,
          rounds: draftData.rounds || 3,
          selected_teams: draftData.selectedTeams || [],
          draft_results: draftData.results || [],
          is_public: draftData.isPublic || false,
          created_at: new Date().toISOString()
        }
      ]);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving draft:', error.message);
    throw error;
  }
};

/**
 * Fetches drafts saved by the current user
 * @returns {Promise<Array>} User's saved drafts
 */
export const fetchUserDrafts = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('user_drafts')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching saved drafts:', error.message);
    return [];
  }
};

/**
 * Fetches public drafts from all users
 * @returns {Promise<Array>} Public drafts from community
 */
export const fetchCommunityDrafts = async () => {
  try {
    const { data, error } = await supabase
      .from('saved_drafts')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching community drafts:', error.message);
    return [];
  }
};

/**
 * Generates an AI-powered player biography if one doesn't exist
 * @param {Object} player - Player object to generate bio for
 * @returns {Promise<string|null>} Generated biography or null
 */
export const generatePlayerBio = async (player) => {
  // If a bio already exists, return it
  if (player.bio && player.bio.trim() != null) {
    return player.bio;
  }
  
  const apikey = 'AIzaSyBTiyxfxwVQ2UU3vVuGvCF_AQbEMoC2ziY';
  const genAI = new GoogleGenerativeAI(apikey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Generate a 1000-character biography about the college football career of a player named ${player.name}. He played as a ${player.position} for ${player.school} Mention key aspects of his career. Write as if you are a sports journalist. Focus on stats, acheivements, and big moments from their college career. ONLY TALK ABOUT THEIR COLLEGE CAREER. Use as many of the 1000 characters as you can.`;

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
  const generatedBio = result.response.text();
  
  // Only update the database if a non-empty bio is generated
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
    // If nothing was generated, return null so that the bio remains unset
    return null;
  }
};

export { supabase };