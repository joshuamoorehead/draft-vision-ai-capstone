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
// export {supabase}

// Function to reconnect the realtime client
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

// Helper function to check if a username is already taken
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

// Auth functions - simplifies working with Supabase auth
export const signUp = async (email, password, username = '') => {
  try {
    // Generate a default username if none provided
    const defaultUsername = username || email.split('@')[0];
    
    // Check if username is already taken
    if (username) {
      const { available, error: checkError } = await checkUsernameAvailability(username);
      if (checkError) throw checkError;
      if (!available) {
        return { 
          data: null, 
          error: { message: 'Username is already taken. Please choose another.' }
        };
      }
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // For development, you can enable auto-confirm to bypass email verification
        emailRedirectTo: `${process.env.REACT_APP_APP_URL}/auth/callback`,
        data: {
          // Additional user metadata if needed
          username: defaultUsername,
          registered_at: new Date().toISOString(),
        }
      }
    });
    
    if (!error && data?.user) {
      // Create user profile record
      await supabase.from('user_profiles').upsert({
        user_id: data.user.id,
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
    
    return { data, error };
  } catch (e) {
    console.error("Error in signUp function:", e);
    return { data: null, error: e };
  }
};

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

export const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.REACT_APP_APP_URL}/auth/callback`,
      // Enable auto-confirm to bypass email verification
      // This is useful for development, can be removed in production
      skipBrowserRedirect: false
    }
  });
};

// Sign Out
export const signOut = async () => {
  try {
    // Call Supabase signOut
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear any local storage items related to auth
    // This is important to ensure the UI updates properly
    localStorage.removeItem('supabase.auth.token');
    
    // Return success
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error.message);
    return { error };
  }
};

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

// Get user profile by ID
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

// Get username by user ID
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

// Data fetching functions
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

// Save a user's draft
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

// Get user's saved drafts
export const fetchUserDrafts = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('saved_drafts')
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

// Fetch community drafts (public drafts from all users)
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

export const generatePlayerBio = async (player) => {
 
  // If a bio already exists, return it.
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

export { supabase };