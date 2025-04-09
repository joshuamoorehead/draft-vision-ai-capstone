/**
 * Draft analysis utilities - shared functions for grading and analyzing drafts
 * Uses a 0-100 numerical scoring system for more granular draft evaluation
 */

import { supabase } from '../services/api'; // Adjust path as needed

// Keep track of players we've already looked up to avoid repeated database calls
const playerCache = {};

/**
 * Generate a numerical score (0-100) for a draft
 * Enhanced to consider player draft_av when available
 * 
 * @param {Object} draft - The draft object
 * @returns {number} - Score between 0-100
 */
export const generateDraftScore = (draft) => {
  if (!draft || !draft.id) return 75.0; // Default average score
  
  // Use the draft's id as a seed for consistent scoring (legacy approach)
  let seed;
  if (typeof draft.id === 'string') {
    // Sum character codes and use as seed
    seed = draft.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  } else {
    seed = Number(draft.id);
  }
  
  // Check if this draft has picks that we can evaluate
  if (draft.results && Array.isArray(draft.results) && draft.results.length > 0) {
    // Try to factor in real player data without making it async
    let enhancedScore = lookupCachedPlayerData(draft);
    if (enhancedScore !== null) {
      // If we have enhanced data, use it but keep some randomness
      // This gives a blend of data-driven + deterministic scoring
      const variationFactor = 0.15; // 15% variation based on draft ID
      const baseFactor = 0.85; // 85% from real data
      const variation = ((seed % 20) - 10) * variationFactor;
      
      return Math.min(100, Math.max(0, (enhancedScore * baseFactor) + variation));
    }
    
    // If we don't have cache data, trigger a background fetch for next time
    setTimeout(() => {
      fetchAndCachePlayerData(draft);
    }, 0);
  }
  
  // Create a pseudo-random but deterministic score based on seed (legacy approach)
  const baseScore = (seed % 31) * 3.1 + 5; // Base range approximately 5-100
  const variation = (seed % 17) * 0.5;
  
  // Combine and ensure in valid range 0-100
  const rawScore = baseScore + variation;
  const finalScore = Math.min(100, Math.max(0, rawScore));
  
  // Return with 2 decimal places
  return parseFloat(finalScore.toFixed(2));
};

/**
 * Look up cached player data to enhance scoring
 * 
 * @param {Object} draft - The draft object
 * @returns {number|null} - Enhanced score or null if no data available
 */
function lookupCachedPlayerData(draft) {
  if (!draft.results || !Array.isArray(draft.results)) return null;
  
  let totalAV = 0;
  let playerCount = 0;
  
  // Check if we have cached data for the players in this draft
  draft.results.forEach(pick => {
    if (!pick.playerName) return;
    
    const playerName = pick.playerName.trim();
    if (playerCache[playerName] && playerCache[playerName].draft_av) {
      totalAV += playerCache[playerName].draft_av;
      playerCount++;
    }
  });
  
  // If we have data for at least some players, calculate a score
  if (playerCount > 0) {
    // Simple score calculation based on average AV
    // You may want to adjust this formula based on your AV distribution
    const avgAV = totalAV / playerCount;
    
    // Convert AV to a 0-100 score (adjust scaling as needed)
    const enhancedScore = Math.min(100, Math.max(50, 65 + (avgAV * 5)));
    return enhancedScore;
  }
  
  return null;
}

/**
 * Fetches player data from the database and caches it for future use
 * This is called in the background and doesn't affect the current calculation
 * 
 * @param {Object} draft - The draft object
 */
async function fetchAndCachePlayerData(draft) {
  try {
    if (!draft.results || !Array.isArray(draft.results)) return;
    
    // Get player names that aren't already cached
    const playerNames = draft.results
      .map(pick => pick.playerName?.trim())
      .filter(name => name && !playerCache[name]);
    
    if (playerNames.length === 0) return;
    
    // Fetch player data from database
    const { data, error } = await supabase
      .from('db_playerprofile')
      .select('name, draft_av, draft_round, position')
      .in('name', playerNames);
    
    if (error || !data) {
      console.warn('Error fetching player data for cache:', error);
      return;
    }
    
    // Update cache with fetched data
    data.forEach(player => {
      if (player.name) {
        playerCache[player.name.trim()] = player;
      }
    });
    
    // Console log for debugging
    console.log(`Cached data for ${data.length} players`);
  } catch (error) {
    console.error('Error in fetchAndCachePlayerData:', error);
  }
}

/**
 * Convert a numerical score to a letter grade
 * 
 * @param {number} score - Numerical score (0-100)
 * @returns {string} - Letter grade
 */
export const scoreToGrade = (score) => {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
};

/**
 * Get a full draft grade object with both numerical score and letter grade
 * 
 * @param {Object} draft - The draft object 
 * @returns {Object} - Object with numerical score and letter grade
 */
export const getDraftGrade = (draft) => {
  const score = generateDraftScore(draft);
  const letter = scoreToGrade(score);
  
  return {
    score,
    letter,
    displayScore: score.toFixed(2)
  };
};

/**
 * Get CSS class for grade badge coloring based on score
 * 
 * @param {number} score - Numerical score (0-100)
 * @returns {string} - CSS class for the score
 */
export const getScoreColor = (score) => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 80) return 'bg-blue-500';
  if (score >= 70) return 'bg-yellow-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-red-500';
};

/**
 * Generate detailed analysis text for a draft based on score
 * 
 * @param {number} score - Numerical score (0-100)
 * @returns {string} - Analysis text
 */
export const generateDraftAnalysis = (score) => {
  // Score ranges and their analyses
  if (score >= 95) return "Elite draft with exceptional value and perfect team need alignment across all rounds.";
  if (score >= 90) return "Outstanding draft with excellent value selections and strong team need consideration.";
  if (score >= 85) return "Very strong draft with high-value picks addressing key team needs.";
  if (score >= 80) return "Good draft with solid value picks and most important team needs addressed.";
  if (score >= 75) return "Above average draft with good value in several rounds.";
  if (score >= 70) return "Decent draft with some good value selections, but some missed opportunities.";
  if (score >= 65) return "Average draft with a mix of good picks and questionable selections.";
  if (score >= 60) return "Below average draft with several reaches and missed opportunities.";
  if (score >= 55) return "Poor draft with multiple questionable selections and limited value.";
  if (score >= 50) return "Very poor draft with many reaches and little consideration for value or team needs.";
  return "Extremely poor draft with severe reaches and virtually no value consideration.";
};

/**
 * Generate key strengths for a draft based on score
 * 
 * @param {number} score - Numerical score (0-100)
 * @param {Object} draft - The draft object
 * @returns {string[]} - Array of strength points
 */
export const generateDraftStrengths = (score, draft) => {
  // Base strengths that could apply to any draft
  const allStrengths = [
    "Excellent value in early rounds",
    "Great balance of offense and defense",
    "Addressed key positional needs",
    "Strong focus on high-character players",
    "Good mix of immediate starters and developmental prospects",
    "Excellent value in middle rounds",
    "Strong foundation pieces selected early",
    "Great depth added at critical positions",
    "Solid athletic traits across all selections",
    "Good balance of floor and ceiling players",
    "Maximized draft capital with smart trades",
    "Selected scheme-appropriate players",
    "Added significant speed and athleticism",
    "Focused on physical and tough players",
    "Secured potential franchise-changing talent"
  ];
  
  // Select number of strengths based on score
  const strengthCount = Math.max(1, Math.min(5, Math.floor(score / 20)));
  
  // Use a deterministic approach based on draft ID to select strengths
  const seed = typeof draft.id === 'string' 
    ? draft.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : Number(draft.id);
  
  const selectedStrengths = [];
  for (let i = 0; i < strengthCount; i++) {
    const index = (seed + i * 17) % allStrengths.length;
    selectedStrengths.push(allStrengths[index]);
  }
  
  return selectedStrengths;
};

/**
 * Generate key weaknesses for a draft based on score
 * 
 * @param {number} score - Numerical score (0-100)
 * @param {Object} draft - The draft object 
 * @returns {string[]} - Array of weakness points
 */
export const generateDraftWeaknesses = (score, draft) => {
  // Base weaknesses that could apply to any draft
  const allWeaknesses = [
    "Reached for players in early rounds",
    "Failed to address key positional needs",
    "Overvalued certain positions",
    "Too many projects with limited immediate impact",
    "Insufficient attention to offensive line",
    "Overlooked defensive secondary needs",
    "Limited athleticism in selections",
    "Too many redundant player profiles",
    "Medical concerns with multiple picks",
    "Questionable character selections",
    "Poor value management across rounds",
    "Failed to address pass rush adequately",
    "Missed opportunities for higher-ceiling players",
    "Prioritized less valuable positions early",
    "Insufficient attention to quarterback development"
  ];
  
  // Calculate number of weaknesses based on score (higher score = fewer weaknesses)
  const maxWeaknesses = 5;
  const weaknessCount = Math.max(1, maxWeaknesses - Math.floor(score / 20));
  
  // Use a deterministic approach based on draft ID to select weaknesses
  const seed = typeof draft.id === 'string' 
    ? draft.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : Number(draft.id);
  
  const selectedWeaknesses = [];
  for (let i = 0; i < weaknessCount; i++) {
    const index = (seed + i * 23) % allWeaknesses.length;
    selectedWeaknesses.push(allWeaknesses[index]);
  }
  
  return selectedWeaknesses;
};

/**
 * Get a draft comparison to average based on score
 * 
 * @param {number} score - Numerical score (0-100)
 * @returns {string} - Comparison text
 */
export const getDraftComparison = (score) => {
  const averageScore = 75;
  const difference = score - averageScore;
  
  if (difference >= 15) return "This draft is substantially better than average.";
  if (difference >= 10) return "This draft is significantly better than average.";
  if (difference >= 5) return "This draft is better than average.";
  if (difference >= -5) return "This draft is about average.";
  if (difference >= -10) return "This draft is below average.";
  if (difference >= -15) return "This draft is significantly below average.";
  return "This draft is substantially below average.";
};

/**
 * Generate a complete draft report object with grade and analysis
 * 
 * @param {Object} draft - The draft object 
 * @returns {Object} - Complete draft report
 */
export const generateDraftReport = (draft) => {
  const { score, letter, displayScore } = getDraftGrade(draft);
  
  return {
    score,
    letter,
    displayScore,
    color: getScoreColor(score),
    analysis: generateDraftAnalysis(score),
    strengths: generateDraftStrengths(score, draft),
    weaknesses: generateDraftWeaknesses(score, draft),
    comparison: getDraftComparison(score)
  };
};