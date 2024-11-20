// src/services/api.js
const API_URL = 'http://127.0.0.1:8000/api';  // Update this to match your Django backend

export const fetchPlayers = async () => {
  try {
    const response = await fetch(`${API_URL}/players/`);
    if (!response.ok) {
      throw new Error('Failed to fetch players');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};
export const fetchPlayerDetails = async (playerId) => {
  try {
    const response = await fetch(`${API_URL}/players/${playerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch player details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching player details:', error);
    throw error;
  }
};
