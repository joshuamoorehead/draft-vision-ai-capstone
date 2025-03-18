// ConnectionManager.js
import { supabase } from './api';

// Track connection state
let connectionState = {
  isConnecting: false,
  lastConnected: null,
  reconnectAttempts: 0,
  isHealthy: true
};

// Maximum reconnection attempts
const MAX_RECONNECT_ATTEMPTS = 3;

// Timeout for connection attempts (milliseconds)
const CONNECTION_TIMEOUT = 10000;

/**
 * Reset connection state tracking
 */
export const resetConnectionState = () => {
  connectionState = {
    isConnecting: false,
    lastConnected: null,
    reconnectAttempts: 0,
    isHealthy: true
  };
};

/**
 * Check if the client is connected to Supabase
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
export const checkConnection = async () => {
  try {
    // Skip if already trying to connect
    if (connectionState.isConnecting) {
      console.log("Connection check already in progress, skipping");
      return false;
    }

    // Set connecting state
    connectionState.isConnecting = true;
    
    // Set a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Connection check timed out'));
      }, CONNECTION_TIMEOUT);
    });
    
    // Try a simple query to test connection
    const queryPromise = supabase.from('user_profiles').select('count').limit(1);
    
    // Race between query and timeout
    const { error } = await Promise.race([queryPromise, timeoutPromise]);
    
    // Reset connecting state
    connectionState.isConnecting = false;
    
    if (error) {
      console.warn("Connection check failed:", error);
      connectionState.isHealthy = false;
      return false;
    }
    
    // Update state
    connectionState.lastConnected = new Date();
    connectionState.isHealthy = true;
    connectionState.reconnectAttempts = 0;
    
    return true;
  } catch (err) {
    console.error("Error checking connection:", err);
    connectionState.isConnecting = false;
    connectionState.isHealthy = false;
    return false;
  }
};

/**
 * Force reconnection to Supabase
 * @returns {Promise<boolean>} True if reconnection was successful
 */
export const forceReconnect = async () => {
  try {
    // Don't try if too many recent attempts
    if (connectionState.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn(`Too many reconnection attempts (${connectionState.reconnectAttempts}), forcing page reload`);
      window.location.reload();
      return false;
    }
    
    // Increment attempt counter
    connectionState.reconnectAttempts++;
    connectionState.isConnecting = true;
    
    console.log(`Reconnection attempt ${connectionState.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
    
    // First try to get current session
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    
    if (!session) {
      console.log("No session found, can't reconnect authenticated client");
      connectionState.isConnecting = false;
      return false;
    }
    
    // Try to disconnect first
    try {
      console.log("Disconnecting existing realtime connection");
      supabase.realtime.disconnect();
    } catch (e) {
      console.log("No active connection to disconnect:", e);
    }
    
    // Short delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reconnect with session token
    console.log("Reconnecting with session token");
    supabase.realtime.setAuth(session.access_token);
    supabase.realtime.connect();
    
    // Test the connection
    const isConnected = await checkConnection();
    
    connectionState.isConnecting = false;
    
    if (!isConnected && connectionState.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn("Failed to reconnect after multiple attempts, forcing reload");
      window.location.reload();
      return false;
    }
    
    return isConnected;
  } catch (error) {
    console.error("Error during reconnection:", error);
    connectionState.isConnecting = false;
    
    // If we've tried too many times, reload the page
    if (connectionState.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      window.location.reload();
    }
    
    return false;
  }
};

/**
 * Handle tab visibility change
 */
export const handleVisibilityChange = async () => {
  // Only care about tab becoming visible
  if (document.visibilityState === 'visible') {
    console.log("Tab became visible, checking connection status");
    
    // If connection is not healthy, try to reconnect
    if (!connectionState.isHealthy) {
      await forceReconnect();
      return;
    }
    
    // If it's been more than 60 seconds since last connection, check health
    const now = new Date();
    if (!connectionState.lastConnected || 
        (now - connectionState.lastConnected) > 60000) {
      const isConnected = await checkConnection();
      if (!isConnected) {
        await forceReconnect();
      }
    }
  }
};

/**
 * Initialize connection management
 */
export const initConnectionManager = () => {
  // Set initial connection time
  connectionState.lastConnected = new Date();
  
  // Set up visibility change listener
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Set up periodic health checks
  const healthCheckInterval = setInterval(async () => {
    if (document.visibilityState === 'visible' && !connectionState.isConnecting) {
      const isConnected = await checkConnection();
      if (!isConnected) {
        await forceReconnect();
      }
    }
  }, 60000); // Check every minute
  
  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    clearInterval(healthCheckInterval);
  };
};

// Emergency recovery function - can be called by user
export const emergencyRecover = async () => {
  console.log("Emergency recovery initiated");
  resetConnectionState();
  
  // Try reconnection with fresh state
  const success = await forceReconnect();
  
  // If still fails, reload page
  if (!success) {
    console.log("Emergency recovery failed, reloading page");
    window.location.reload();
  }
  
  return success;
};