import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/api';
import PageTransition from '../Common/PageTransition';
import Auth from '../Auth/Auth';
import { generateDraftReport } from '../../utils/DraftAnalysis';
import DraftCard from './DraftCard';
import DraftDetailModal from './DraftDetailModal';

/**
 * Get the color class for a grade
 */
const getGradeColor = (grade) => {
  switch(grade) {
    case 'A+': case 'A': return 'bg-green-600';
    case 'A-': case 'B+': return 'bg-green-500';
    case 'B': return 'bg-blue-600';
    case 'B-': case 'C+': return 'bg-blue-500';
    case 'C': return 'bg-yellow-600';
    case 'C-': case 'D+': return 'bg-yellow-500';
    case 'D': case 'D-': return 'bg-red-500';
    case 'F': return 'bg-red-600';
    default: return 'bg-gray-600';
  }
};

/**
 * Generate an analysis for a draft
 */
const generateAnalysis = (draft) => {
  return "This draft shows good balance between addressing team needs and selecting the best available talent. The early round picks demonstrate solid value assessment.";
};

/**
 * Generate strengths for a draft
 */
const generateStrengths = (draft) => {
  return [
    "Good value selections in the early rounds",
    "Addressed key positional needs",
    "Balance between offense and defense"
  ];
};

/**
 * Generate weaknesses for a draft
 */
const generateWeaknesses = (draft) => {
  return [
    "Could have addressed secondary depth earlier",
    "Potential reach in middle rounds"
  ];
};

const Community = () => {
  const { user } = useAuth();
  const [communityDrafts, setCommunityDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('popular'); // 'popular', 'recent', 'score', 'liked'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginModal, setIsLoginModal] = useState(true);
  const [expandedDraft, setExpandedDraft] = useState(null);
  const [viewingDraftDetails, setViewingDraftDetails] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [draftComments, setDraftComments] = useState({});
  const [commentLoading, setCommentLoading] = useState(false);
  const [userLikedDrafts, setUserLikedDrafts] = useState({});

  useEffect(() => {
    fetchCommunityDrafts();
  }, [filter]);

  // Track which drafts the user has liked
  useEffect(() => {
    if (user) {
      fetchUserLikedDrafts();
    } else {
      setUserLikedDrafts({});
      // Reset filter if it was 'liked' and user logs out
      if (filter === 'liked') {
        setFilter('popular');
      }
    }
  }, [user]);

  const fetchUserLikedDrafts = async () => {
    if (!user) return;
    
    try {
      // Fetch which drafts the current user has liked
      const { data, error } = await supabase
        .from('user_draft_likes')
        .select('draft_id')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error fetching user liked drafts:', error);
        return;
      }
      
      const likedDrafts = {};
      if (data) {
        data.forEach(like => {
          likedDrafts[like.draft_id] = true;
        });
      }
      
      setUserLikedDrafts(likedDrafts);
    } catch (error) {
      console.error('Error in fetchUserLikedDrafts:', error);
    }
  };

  const fetchCommunityDrafts = async () => {
    setLoading(true);
    console.log("Fetching community drafts with filter:", filter);
    
    try {
      let drafts = [];
      
      // Special handling for "liked" filter
      if (filter === 'liked') {
        if (!user) {
          setCommunityDrafts([]);
          setLoading(false);
          return;
        }
        
        // First get all drafts the user has liked
        const { data: likedData, error: likedError } = await supabase
          .from('user_draft_likes')
          .select('draft_id')
          .eq('user_id', user.id);
          
        if (likedError) {
          console.error('Error fetching liked drafts:', likedError);
          setCommunityDrafts([]);
          setLoading(false);
          return;
        }
        
        if (!likedData || likedData.length === 0) {
          console.log("No liked drafts found");
          setCommunityDrafts([]);
          setLoading(false);
          return;
        }
        
        // Get the actual draft data for each liked draft
        const likedDraftIds = likedData.map(like => like.draft_id);
        const { data: likedDrafts, error: draftError } = await supabase
          .from('user_drafts')
          .select('*')
          .in('id', likedDraftIds)
          .eq('is_public', true);
          
        if (draftError) {
          console.error('Error fetching liked draft data:', draftError);
          setCommunityDrafts([]);
          setLoading(false);
          return;
        }
        
        drafts = likedDrafts || [];
      } else {
        // Base query for other filters
        let query = supabase
          .from('user_drafts')
          .select('*')
          .eq('is_public', true);
        
        // Apply sorting based on filter
        if (filter === 'popular') {
          query = query.order('likes', { ascending: false });
        } else if (filter === 'recent') {
          query = query.order('created_at', { ascending: false });
        } else if (filter === 'score') {
          // First try to filter by score if score exists and is non-null
          const { data: scoreData, error: scoreError } = await query
            .not('score', 'is', null)
            .order('score', { ascending: false })
            .limit(20);
          
          if (!scoreError && scoreData && scoreData.length > 0) {
            drafts = scoreData;
            console.log("Found drafts with scores:", drafts.length);
            
            // Early return with sorted data
            const enhancedDrafts = await enhanceDrafts(drafts);
            setCommunityDrafts(enhancedDrafts);
            setLoading(false);
            
            // Fetch comments if needed
            if (enhancedDrafts.length > 0) {
              fetchCommentsForDrafts(enhancedDrafts.map(d => d.id));
            }
            return;
          } else {
            console.log("No drafts with scores found or error occurred, using grade fallback");
            // Fallback to using grades if available
            const { data: gradeData, error: gradeError } = await query
              .not('grade', 'is', null)
              .limit(20);
              
            if (!gradeError && gradeData && gradeData.length > 0) {
              // Sort manually by grade
              drafts = gradeData.sort((a, b) => {
                const gradeValues = {
                  'A+': 12, 'A': 11, 'A-': 10,
                  'B+': 9, 'B': 8, 'B-': 7,
                  'C+': 6, 'C': 5, 'C-': 4,
                  'D+': 3, 'D': 2, 'D-': 1,
                  'F': 0
                };
                return (gradeValues[b.grade] || 0) - (gradeValues[a.grade] || 0);
              });
              console.log("Found drafts with grades, sorting manually:", drafts.length);
              
              // Early return with manually sorted data
              const enhancedDrafts = await enhanceDrafts(drafts);
              setCommunityDrafts(enhancedDrafts);
              setLoading(false);
              
              // Fetch comments if needed
              if (enhancedDrafts.length > 0) {
                fetchCommentsForDrafts(enhancedDrafts.map(d => d.id));
              }
              return;
            }
          }
          
          // If we reach here, fall back to sorting by likes
          console.log("No drafts with scores or grades found, falling back to sorting by likes");
          query = query.order('likes', { ascending: false });
        }
        
        // Fetch drafts with the applied sort order
        const { data, error } = await query.limit(20);
        
        if (error) {
          console.error("Error fetching drafts:", error);
          setCommunityDrafts([]);
          setLoading(false);
          return;
        }
        
        drafts = data || [];
      }
      
      if (drafts.length === 0) {
        console.log("No drafts found");
        setCommunityDrafts([]);
        setLoading(false);
        return;
      }
      
      const enhancedDrafts = await enhanceDrafts(drafts);
      setCommunityDrafts(enhancedDrafts);
      
      // Fetch comments if needed
      if (enhancedDrafts.length > 0) {
        fetchCommentsForDrafts(enhancedDrafts.map(d => d.id));
      }
    } catch (error) {
      console.error("Error fetching community drafts:", error);
      setCommunityDrafts([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to enhance drafts with profile data
  const enhanceDrafts = async (drafts) => {
    // Get user IDs from drafts
    const userIds = [...new Set(drafts.map(draft => draft.user_id))];
    
    // Fetch profiles in a separate query
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .in('user_id', userIds);
    
    console.log("Profiles query:", {
      success: !profilesError,
      count: profiles?.length || 0,
      error: profilesError?.message
    });
    
    // Create a map for quick profile lookup
    const profileMap = {};
    if (profiles && profiles.length > 0) {
      profiles.forEach(profile => {
        profileMap[profile.user_id] = profile;
      });
    }
    
    // Helper function to inflate views and likes based on grade
    const inflateEngagement = (draft) => {
      // Only apply inflation for display, not for database values
      const baseViews = draft.views || 0;
      const baseLikes = draft.likes || 0;
      
      // Define grade multipliers for inflation
      const gradeMultipliers = {
        'A+': { views: 5.0, likes: 4.0 },
        'A': { views: 4.5, likes: 3.5 },
        'A-': { views: 4.0, likes: 3.0 },
        'B+': { views: 3.5, likes: 2.5 },
        'B': { views: 3.0, likes: 2.0 },
        'B-': { views: 2.5, likes: 1.8 },
        'C+': { views: 2.0, likes: 1.5 },
        'C': { views: 1.8, likes: 1.3 },
        'C-': { views: 1.5, likes: 1.2 },
        'D+': { views: 1.3, likes: 1.1 },
        'D': { views: 1.2, likes: 1.0 },
        'D-': { views: 1.1, likes: 1.0 },
        'F': { views: 1.0, likes: 1.0 }
      };
      
      // Default multiplier if grade isn't found
      const defaultMultiplier = { views: 1.0, likes: 1.0 };
      const multiplier = gradeMultipliers[draft.grade] || defaultMultiplier;
      
      // Calculate inflated values
      // Add base values to avoid grades with 0 engagement
      const baseAdd = {
        views: draft.grade ? (20 - Object.keys(gradeMultipliers).indexOf(draft.grade) * 1.5) : 0,
        likes: draft.grade ? (10 - Object.keys(gradeMultipliers).indexOf(draft.grade) * 0.75) : 0
      };
      
      // Apply inflation formula: (base + baseAdd) * multiplier
      const inflatedViews = Math.round((baseViews + baseAdd.views) * multiplier.views);
      const inflatedLikes = Math.round((baseLikes + baseAdd.likes) * multiplier.likes);
      
      // Return the inflated values
      return {
        displayViews: inflatedViews,
        displayLikes: inflatedLikes,
        // Keep original values for database operations
        actualViews: baseViews,
        actualLikes: baseLikes
      };
    };
    
    // Enhance drafts with profile data and inflated engagement metrics
    return drafts.map(draft => {
      const profile = profileMap[draft.user_id];
      const engagement = inflateEngagement(draft);
      
      return {
        ...draft,
        report: draft.grade ? {
          letter: draft.grade,
          score: draft.score || 85,
          displayScore: Math.round(draft.score) || '85',
          color: getGradeColor(draft.grade),
          analysis: generateAnalysis(draft),
          strengths: generateStrengths(draft),
          weaknesses: generateWeaknesses(draft)
        } : generateDraftReport(draft),
        username: profile?.username || `drafter_${draft.user_id.substring(0, 5)}`,
        avatar_url: profile?.avatar_url || null,
        selected_teams: Array.isArray(draft.selected_teams) ? draft.selected_teams : 
                      (draft.selected_teams ? [draft.selected_teams] : []),
        // Use inflated values for display
        views: engagement.displayViews,
        likes: engagement.displayLikes,
        // Keep track of actual database values
        actualViews: engagement.actualViews,
        actualLikes: engagement.actualLikes,
        userLiked: userLikedDrafts[draft.id] || false
      };
    });
  };

  const fetchCommentsForDrafts = async (draftIds) => {
    if (!draftIds || draftIds.length === 0) return;
    console.log("Fetching comments for drafts:", draftIds);
    
    try {
      // Fetch comments from the database - now including username column
      const { data: comments, error: commentsError } = await supabase
        .from('draft_comments')
        .select(`
          id,
          draft_id,
          user_id,
          username,
          comment,
          created_at,
          likes
        `)
        .in('draft_id', draftIds)
        .order('created_at', { ascending: false });
        
      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        return;
      }
      
      if (!comments || comments.length === 0) {
        console.log("No comments found for these drafts");
        return;
      }
      
      console.log("Comments fetched:", comments.length);
      
      // Get all user IDs from comments
      const userIds = [...new Set(comments.map(comment => comment.user_id))];
      
      // Still fetch profiles for avatar URLs
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, avatar_url')
        .in('user_id', userIds);
        
      if (profilesError) {
        console.error('Error fetching comment user profiles:', profilesError);
      }
      
      // Create a map for quick profile lookup (just for avatar URLs now)
      const profileMap = {};
      if (profiles && profiles.length > 0) {
        profiles.forEach(profile => {
          profileMap[profile.user_id] = profile;
        });
      }
      
      // Check if current user has liked any comments
      let userLikedComments = {};
      if (user) {
        const commentIds = comments.map(comment => comment.id);
        const { data: userLikes, error: userLikesError } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);
          
        if (!userLikesError && userLikes) {
          userLikes.forEach(like => {
            userLikedComments[like.comment_id] = true;
          });
        }
      }
      
      // Enhance comments with avatar URLs and like status
      const enhancedComments = comments.map(comment => {
        const profile = profileMap[comment.user_id];
        
        // Use the stored username, but for the current user show "You"
        let displayUsername = comment.username;
        if (user && comment.user_id === user.id) {
          displayUsername = 'You';
        }
        
        // If no username was stored, generate a fallback (for legacy comments)
        if (!displayUsername) {
          displayUsername = `User_${comment.user_id.substring(0, 8)}`;
        }
        
        return {
          ...comment,
          username: displayUsername,
          avatar_url: profile?.avatar_url || null,
          userLiked: userLikedComments[comment.id] || false
        };
      });
      
      // Organize comments by draft_id
      const commentsByDraft = {};
      enhancedComments.forEach(comment => {
        if (!commentsByDraft[comment.draft_id]) {
          commentsByDraft[comment.draft_id] = [];
        }
        commentsByDraft[comment.draft_id].push(comment);
      });
      
      setDraftComments(commentsByDraft);
    } catch (error) {
      console.error('Error in fetchCommentsForDrafts:', error);
    }
  };
  

  const ensureUserProfileExists = async (userId, email) => {
    if (!userId) return;
    
    try {
      // Check if profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', userId)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create one with default username from email
        const defaultUsername = email ? email.split('@')[0] : `User_${userId.substring(0, 8)}`;
        
        await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            email: email,
            username: defaultUsername,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
        
        console.log("Created new user profile with username:", defaultUsername);
      } else if (!existingProfile?.username || existingProfile.username.trim() === '') {
        // Profile exists but username is empty, update it
        const defaultUsername = email ? email.split('@')[0] : `User_${userId.substring(0, 8)}`;
        
        await supabase
          .from('user_profiles')
          .update({ 
            username: defaultUsername,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        console.log("Updated empty username to:", defaultUsername);
      }
    } catch (error) {
      console.error("Error ensuring user profile exists:", error);
    }
  };

  const handleFilterChange = (newFilter) => {
    // If trying to switch to 'liked' filter but not logged in
    if (newFilter === 'liked' && !user) {
      setIsLoginModal(true);
      setShowAuthModal(true);
      return;
    }
    
    setFilter(newFilter);
  };

  const handleLike = async (draftId) => {
  if (!user) {
    setIsLoginModal(true);
    setShowAuthModal(true);
    return;
  }
  
  console.log("Handling like for draft:", draftId);
  
  try {
    // Find the draft to get actual likes value
    const draft = communityDrafts.find(d => d.id === draftId);
    if (!draft) {
      console.error("Draft not found for like action");
      return;
    }
    
    // Check if user already liked this draft
    const alreadyLiked = userLikedDrafts[draftId];
    
    if (alreadyLiked) {
      // Unlike the draft - remove from user_draft_likes table
      const { error: unlikeError } = await supabase
        .from('user_draft_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('draft_id', draftId);
        
      if (unlikeError) {
        console.error('Error unliking draft:', unlikeError);
        return;
      }
      
      // Try to decrement the likes count using the SECURITY DEFINER function
      try {
        const { error: rpcError } = await supabase.rpc(
          'decrement_draft_likes_simple', 
          { p_draft_id: draftId }
        );
        
        if (rpcError) {
          console.error('Error calling decrement_draft_likes_simple:', rpcError);
        } else {
          console.log(`Successfully decremented likes for draft ${draftId}`);
        }
      } catch (rpcError) {
        console.error('Error calling decrement_draft_likes_simple:', rpcError);
      }
      
      // Get current draft to find current likes count for UI
      const { data: currentDraft, error: fetchError } = await supabase
        .from('user_drafts')
        .select('likes')
        .eq('id', draftId)
        .single();
        
      const actualLikes = !fetchError && currentDraft ? currentDraft.likes : 0;
      console.log(`Draft ${draftId} unliked. Current likes in database:`, actualLikes);
      
      // Update local state
      setUserLikedDrafts(prev => {
        const updated = { ...prev };
        delete updated[draftId];
        return updated;
      });
      
      // If we're in the 'liked' filter and user unlikes a draft, 
      // remove it from the displayed list
      if (filter === 'liked') {
        setCommunityDrafts(prevDrafts => 
          prevDrafts.filter(draft => draft.id !== draftId)
        );
      } else {
        // Re-apply inflation to the new actual likes value
        setCommunityDrafts(prevDrafts => 
          prevDrafts.map(draft => {
            if (draft.id === draftId) {
              // Get the grade-based multiplier
              const gradeMultipliers = {
                'A+': { likes: 4.0 },
                'A': { likes: 3.5 },
                'A-': { likes: 3.0 },
                'B+': { likes: 2.5 },
                'B': { likes: 2.0 },
                'B-': { likes: 1.8 },
                'C+': { likes: 1.5 },
                'C': { likes: 1.3 },
                'C-': { likes: 1.2 },
                'D+': { likes: 1.1 },
                'D': { likes: 1.0 },
                'D-': { likes: 1.0 },
                'F': { likes: 1.0 }
              };
              
              const baseAdd = draft.grade ? (10 - Object.keys(gradeMultipliers).indexOf(draft.grade) * 0.75) : 0;
              const multiplier = (gradeMultipliers[draft.grade] || { likes: 1.0 }).likes;
              
              // Calculate new inflated likes
              const displayLikes = Math.round((actualLikes + baseAdd) * multiplier);
              
              return { 
                ...draft, 
                likes: displayLikes, 
                actualLikes, 
                userLiked: false 
              };
            }
            return draft;
          })
        );
      }
    } else {
      // Like the draft - add to user_draft_likes table
      const { error: likeError } = await supabase
        .from('user_draft_likes')
        .insert({
          user_id: user.id,
          draft_id: draftId
        });
        
      if (likeError) {
        console.error('Error liking draft:', likeError);
        return;
      }
      
      // Try to increment the likes count using the SECURITY DEFINER function
      try {
        const { error: rpcError } = await supabase.rpc(
          'increment_draft_likes_simple', 
          { p_draft_id: draftId }
        );
        
        if (rpcError) {
          console.error('Error calling increment_draft_likes_simple:', rpcError);
        } else {
          console.log(`Successfully incremented likes for draft ${draftId}`);
        }
      } catch (rpcError) {
        console.error('Error calling increment_draft_likes_simple:', rpcError);
      }
      
      // Get current draft to find current likes count for UI
      const { data: currentDraft, error: fetchError } = await supabase
        .from('user_drafts')
        .select('likes')
        .eq('id', draftId)
        .single();
        
      const actualLikes = !fetchError && currentDraft ? currentDraft.likes : 1;
      console.log(`Draft ${draftId} liked. Current likes in database:`, actualLikes);
      
      // Update local state
      setUserLikedDrafts(prev => ({
        ...prev,
        [draftId]: true
      }));
      
      // Re-apply inflation to the new actual likes value
      setCommunityDrafts(prevDrafts => 
        prevDrafts.map(draft => {
          if (draft.id === draftId) {
            // Get the grade-based multiplier
            const gradeMultipliers = {
              'A+': { likes: 4.0 },
              'A': { likes: 3.5 },
              'A-': { likes: 3.0 },
              'B+': { likes: 2.5 },
              'B': { likes: 2.0 },
              'B-': { likes: 1.8 },
              'C+': { likes: 1.5 },
              'C': { likes: 1.3 },
              'C-': { likes: 1.2 },
              'D+': { likes: 1.1 },
              'D': { likes: 1.0 },
              'D-': { likes: 1.0 },
              'F': { likes: 1.0 }
            };
            
            const baseAdd = draft.grade ? (10 - Object.keys(gradeMultipliers).indexOf(draft.grade) * 0.75) : 0;
            const multiplier = (gradeMultipliers[draft.grade] || { likes: 1.0 }).likes;
            
            // Calculate new inflated likes
            const displayLikes = Math.round((actualLikes + baseAdd) * multiplier);
            
            return { 
              ...draft, 
              likes: displayLikes, 
              actualLikes, 
              userLiked: true 
            };
          }
          return draft;
        })
      );
    }
  } catch (error) {
    console.error('Error handling draft like:', error);
    // Fallback update for UI if database operations fail
    // (simplified here to focus on the core functionality)
    const alreadyLiked = userLikedDrafts[draftId];
    
    if (alreadyLiked) {
      setUserLikedDrafts(prev => {
        const updated = { ...prev };
        delete updated[draftId];
        return updated;
      });
      
      if (filter === 'liked') {
        setCommunityDrafts(prevDrafts => 
          prevDrafts.filter(draft => draft.id !== draftId)
        );
      } else {
        setCommunityDrafts(prevDrafts => 
          prevDrafts.map(draft => 
            draft.id === draftId 
              ? { 
                  ...draft, 
                  likes: Math.max(0, draft.likes - 1), 
                  actualLikes: Math.max(0, draft.actualLikes - 1),
                  userLiked: false 
                }
              : draft
          )
        );
      }
    } else {
      setUserLikedDrafts(prev => ({
        ...prev,
        [draftId]: true
      }));
      
      setCommunityDrafts(prevDrafts => 
        prevDrafts.map(draft => 
          draft.id === draftId 
            ? { 
                ...draft, 
                likes: draft.likes + 1, 
                actualLikes: (draft.actualLikes || 0) + 1,
                userLiked: true 
              }
            : draft
        )
      );
    }
  }
};


// 2. Fixed handleCommentLike function that properly updates draft_comments.likes
const handleCommentLike = async (commentId) => {
  if (!user) {
    setIsLoginModal(true);
    setShowAuthModal(true);
    return;
  }
  
  console.log("Handling like for comment:", commentId);
  
  try {
    // Find the comment to determine if it's already liked and which draft it belongs to
    let isLiked = false;
    let commentDraftId = null;
    let foundComment = null;
    
    // Search through all drafts' comments to find the one we want to like
    Object.keys(draftComments).forEach(draftId => {
      draftComments[draftId].forEach(comment => {
        if (comment.id === commentId) {
          isLiked = comment.userLiked;
          commentDraftId = draftId;
          foundComment = comment;
        }
      });
    });
    
    if (!foundComment) {
      console.error('Comment not found:', commentId);
      return;
    }
    
    console.log('Found comment to like:', { 
      commentId, 
      draftId: commentDraftId, 
      currentlyLiked: isLiked,
      currentLikes: foundComment.likes 
    });
    
    if (isLiked) {
      // Unlike the comment - remove from comment_likes table
      const { error: unlikeError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('comment_id', commentId);
        
      if (unlikeError) {
        console.error('Error unliking comment:', unlikeError);
        return;
      }
      
      // Get current comment likes
      const { data: currentComment, error: fetchError } = await supabase
        .from('draft_comments')
        .select('likes')
        .eq('id', commentId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching current comment:', fetchError);
        return;
      }
      
      // Calculate new likes count (never go below 0)
      const currentLikes = currentComment?.likes || 0;
      const newLikes = Math.max(0, currentLikes - 1);
      
      // Update likes count in draft_comments table
      const { error: updateError } = await supabase
        .from('draft_comments')
        .update({ likes: newLikes })
        .eq('id', commentId);
        
      if (updateError) {
        console.error('Error updating comment likes:', updateError);
        return;
      }
      
      console.log(`Comment ${commentId} unliked. Likes decreased from ${currentLikes} to ${newLikes}`);
      
      // Update UI state
      setDraftComments(prevComments => {
        const updatedComments = { ...prevComments };
        
        if (updatedComments[commentDraftId]) {
          updatedComments[commentDraftId] = updatedComments[commentDraftId].map(comment => 
            comment.id === commentId 
              ? { ...comment, likes: newLikes, userLiked: false }
              : comment
          );
        }
        
        return updatedComments;
      });
    } else {
      // Like the comment - add to comment_likes table
      const { error: likeError } = await supabase
        .from('comment_likes')
        .insert({
          user_id: user.id,
          comment_id: commentId
        });
        
      if (likeError) {
        console.error('Error liking comment:', likeError);
        return;
      }
      
      // Get current comment likes
      const { data: currentComment, error: fetchError } = await supabase
        .from('draft_comments')
        .select('likes')
        .eq('id', commentId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching current comment:', fetchError);
        return;
      }
      
      // Calculate new likes count
      const currentLikes = currentComment?.likes || 0;
      const newLikes = currentLikes + 1;
      
      // Update likes count in draft_comments table
      const { error: updateError } = await supabase
        .from('draft_comments')
        .update({ likes: newLikes })
        .eq('id', commentId);
        
      if (updateError) {
        console.error('Error updating comment likes:', updateError);
        return;
      }
      
      console.log(`Comment ${commentId} liked. Likes increased from ${currentLikes} to ${newLikes}`);
      
      // Update UI state
      setDraftComments(prevComments => {
        const updatedComments = { ...prevComments };
        
        if (updatedComments[commentDraftId]) {
          updatedComments[commentDraftId] = updatedComments[commentDraftId].map(comment => 
            comment.id === commentId 
              ? { ...comment, likes: newLikes, userLiked: true }
              : comment
          );
        }
        
        return updatedComments;
      });
    }
  } catch (error) {
    console.error('Error handling comment like:', error);
  }
};
  
const addComment = async (draftId) => {
  if (!user) {
    setIsLoginModal(true);
    setShowAuthModal(true);
    return;
  }
  if (!newComment.trim()) return;
  setCommentLoading(true);
  console.log("Adding comment to draft:", draftId);
  
  try {
    // First, get the user's profile to ensure we have the correct username
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('username, avatar_url')
      .eq('user_id', user.id)
      .single();
    
    // Determine username, falling back if needed
    let username = 'Anonymous';
    let avatar_url = null;
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Create a default username from email
      username = user.email ? user.email.split('@')[0] : `User_${user.id.substring(0, 8)}`;
      
      // Since we couldn't find a profile, let's create/update one for future use
      try {
        await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            email: user.email,
            username: username,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
      } catch (profileCreateError) {
        console.error('Error creating profile:', profileCreateError);
        // Continue anyway - we'll use the fallback username
      }
    } else if (profileData) {
      username = profileData.username || (user.email ? user.email.split('@')[0] : `User_${user.id.substring(0, 8)}`);
      avatar_url = profileData.avatar_url;
      
      // If username was empty, update the profile
      if (!profileData.username || profileData.username.trim() === '') {
        try {
          const updatedUsername = user.email ? user.email.split('@')[0] : `User_${user.id.substring(0, 8)}`;
          await supabase
            .from('user_profiles')
            .update({ username: updatedUsername })
            .eq('user_id', user.id);
          username = updatedUsername;
        } catch (updateError) {
          console.error('Error updating empty username:', updateError);
          // Continue with the fallback username
        }
      }
    }
    
    console.log("Using username for comment:", username);
    
    // Add the comment to the database - now including the username
    const { data, error } = await supabase
      .from('draft_comments')
      .insert({
        draft_id: draftId,
        user_id: user.id,
        username: username, // Store the username in the comments table
        comment: newComment.trim(),
        likes: 0
      })
      .select();
      
    if (error) {
      console.error('Error adding comment to database:', error);
      return;
    }
    
    console.log("Comment added successfully:", data);
    
    // Add the new comment to the UI state with the correct username
    setDraftComments(prevComments => {
      const newCommentObj = {
        ...data[0],
        username,  // Use the username we just determined
        avatar_url,
        userLiked: false
      };
      
      const updatedComments = { ...prevComments };
      if (!updatedComments[draftId]) {
        updatedComments[draftId] = [];
      }
      updatedComments[draftId] = [newCommentObj, ...updatedComments[draftId]];
      return updatedComments;
    });
    
    // Clear the comment input
    setNewComment('');
  } catch (error) {
    console.error('Error adding comment:', error);
    alert('Failed to add comment. Please try again.');
  } finally {
    setCommentLoading(false);
  }
};

  const toggleExpandDraft = (draftId) => {
    if (expandedDraft === draftId) {
      setExpandedDraft(null);
    } else {
      setExpandedDraft(draftId);
    }
  };
  
  const viewDraftDetails = async (draftId) => {
    try {
      // Find the draft in the current data
      const draft = communityDrafts.find(d => d.id === draftId);
      if (!draft) {
        console.error("Draft not found");
        return;
      }
      
      // Increment view count in database
      const { error: viewError } = await supabase
        .from('user_drafts')
        .update({ views: supabase.rpc('increment', { x: 1 }) })
        .eq('id', draftId);
        
      if (viewError) {
        console.error('Error incrementing view count:', viewError);
        // Continue even if view counting fails
      } else {
        // Update local state with actual database value
        const actualViews = (draft.actualViews || 0) + 1;
        
        // Re-apply the inflation for display
        const gradeMultipliers = {
          'A+': { views: 5.0 },
          'A': { views: 4.5 },
          'A-': { views: 4.0 },
          'B+': { views: 3.5 },
          'B': { views: 3.0 },
          'B-': { views: 2.5 },
          'C+': { views: 2.0 },
          'C': { views: 1.8 },
          'C-': { views: 1.5 },
          'D+': { views: 1.3 },
          'D': { views: 1.2 },
          'D-': { views: 1.1 },
          'F': { views: 1.0 }
        };
        
        const baseAdd = draft.grade ? (20 - Object.keys(gradeMultipliers).indexOf(draft.grade) * 1.5) : 0;
        const multiplier = (gradeMultipliers[draft.grade] || { views: 1.0 }).views;
        
        // Calculate new inflated views
        const displayViews = Math.round((actualViews + baseAdd) * multiplier);
        
        // Update both displayed and actual views
        setCommunityDrafts(prevDrafts => 
          prevDrafts.map(d => 
            d.id === draftId ? 
            { ...d, views: displayViews, actualViews } : 
            d
          )
        );
      }
      
      // Make a copy of the draft to process
      let processedDraft = {...draft};
      
      // Ensure we have draft_results for the view
      processedDraft.draft_results = processedDraft.results;
      
      console.log("Viewing community draft details:", processedDraft);
      setViewingDraftDetails(processedDraft);
    } catch (error) {
      console.error('Error processing draft details:', error);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 md:mb-0">Community Mock Drafts</h1>
            
            {user && (
              <div>
                <Link
                  to="/saved-drafts"
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg shadow hover:from-purple-600 hover:to-violet-700 transition-all transform hover:scale-105"
                >
                  My Drafts
                </Link>
              </div>
            )}
          </div>
          
          {/* Filter Controls */}
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white border-opacity-20 mb-8">
            <div className="flex flex-wrap gap-3">
              <button 
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${filter === 'popular' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'}`}
                onClick={() => handleFilterChange('popular')}
              >
                Most Popular
              </button>
              <button 
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${filter === 'recent' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'}`}
                onClick={() => handleFilterChange('recent')}
              >
                Most Recent
              </button>
              <button 
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${filter === 'score' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'}`}
                onClick={() => handleFilterChange('score')}
              >
                Top Scored
              </button>
              {user && (
                <button 
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${filter === 'liked' 
                    ? 'bg-gradient-to-r from-pink-500 to-red-600 text-white shadow-lg' 
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'}`}
                  onClick={() => handleFilterChange('liked')}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 015.656 0 4 4 0 010 5.656l-6.828 6.829-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    Liked Drafts
                  </span>
                </button>
              )}
            </div>
          </div>
          
          {/* Draft List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
          ) : communityDrafts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {communityDrafts.map((draft) => (
                <DraftCard
                  key={draft.id}
                  draft={draft}
                  expandedDraft={expandedDraft}
                  toggleExpandDraft={toggleExpandDraft}
                  viewDraftDetails={viewDraftDetails}
                  handleLike={handleLike}
                  user={user}
                  draftComments={draftComments}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  addComment={addComment}
                  handleCommentLike={handleCommentLike}
                  commentLoading={commentLoading}
                  setShowAuthModal={setShowAuthModal}
                  setIsLoginModal={setIsLoginModal}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-lg border border-white border-opacity-20 text-center">
              <svg className="h-16 w-16 mx-auto mb-4 text-white opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-xl text-white mb-6">
                {filter === 'liked' 
                  ? "You haven't liked any drafts yet. Browse the community and like drafts you enjoy!" 
                  : "No community drafts found. Be the first to share yours!"}
              </p>
              <Link
                to="/mockdraft"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105"
              >
                Create a Mock Draft
              </Link>
            </div>
          )}
          
          {/* Call-to-action for non-logged-in users */}
          {!user && !loading && (
            <div className="mt-10 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white border-opacity-20 text-center">
              <h3 className="text-xl font-bold text-white mb-3">Want to share your mock drafts?</h3>
              <p className="text-gray-300 mb-6">Sign in or create an account to publish your mock drafts and get draft grades!</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => {
                    setIsLoginModal(true);
                    setShowAuthModal(true);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => {
                    setIsLoginModal(false);
                    setShowAuthModal(true);
                  }}
                  className="px-6 py-2 bg-white bg-opacity-20 text-white rounded-lg shadow hover:bg-opacity-30 transition-all transform hover:scale-105"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Auth modal for login/signup when needed */}
        {showAuthModal && (
          <Auth
            isLoginOpen={isLoginModal}
            isSignupOpen={!isLoginModal}
            closeModals={() => setShowAuthModal(false)}
          />
        )}
        
        {/* Draft Details Modal */}
        {viewingDraftDetails && (
          <DraftDetailModal
            draft={viewingDraftDetails}
            onClose={() => setViewingDraftDetails(null)}
            user={user}
            draftComments={draftComments}
            newComment={newComment}
            setNewComment={setNewComment}
            addComment={addComment}
            handleCommentLike={handleCommentLike}
            commentLoading={commentLoading}
            setShowAuthModal={setShowAuthModal}
            setIsLoginModal={setIsLoginModal}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default Community;