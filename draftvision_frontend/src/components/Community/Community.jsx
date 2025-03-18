import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/api';
import PageTransition from '../Common/PageTransition';
import Auth from '../Auth/Auth';
import { generateDraftReport } from '../../utils/DraftAnalysis';

const Community = () => {
  const { user } = useAuth();
  const [communityDrafts, setCommunityDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('popular'); // 'popular', 'recent', 'score'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginModal, setIsLoginModal] = useState(true);
  const [expandedDraft, setExpandedDraft] = useState(null);
  const [viewingDraftDetails, setViewingDraftDetails] = useState(null);

  useEffect(() => {
    fetchCommunityDrafts();
  }, [filter]);

  const fetchCommunityDrafts = async () => {
    setLoading(true);
    try {
      // Fetch from the user_drafts table for public drafts
      let query = supabase
        .from('user_drafts')
        .select(`
          id,
          user_id,
          name,
          created_at,
          rounds,
          selected_teams,
          results,
          is_public
        `)
        .eq('is_public', true)
        .limit(20);

      // Add sorting based on filter
      if (filter === 'recent') {
        query = query.order('created_at', { ascending: false });
      }
      // Note: 'popular' and 'score' would ideally use different DB fields
      // For now, we'll simulate them with client-side sorting

      const { data, error } = await query;
      
      if (error) throw error;

      // For demonstration, create sample drafts if none found
      if (!data || data.length === 0) {
        const sampleDrafts = [
          {
            id: '1a2b3c',
            name: "2025 First Round Focus",
            created_at: "2025-02-20T15:30:00",
            rounds: 3,
            selected_teams: ["Arizona Cardinals", "Chicago Bears"],
            user_id: "sample1",
            is_public: true
          },
          {
            id: '4d5e6f',
            name: "QB-Heavy Strategy",
            created_at: "2025-02-18T12:15:00",
            rounds: 7,
            selected_teams: ["Miami Dolphins", "New York Jets"],
            user_id: "sample2",
            is_public: true
          },
          {
            id: '7g8h9i',
            name: "Defense First Approach",
            created_at: "2025-02-22T09:45:00",
            rounds: 5,
            selected_teams: ["Baltimore Ravens", "Pittsburgh Steelers"],
            user_id: "sample3",
            is_public: true
          }
        ];
        
        // Add draft report to each draft
        const enhancedSampleDrafts = sampleDrafts.map(draft => {
          const report = generateDraftReport(draft);
          return {
            ...draft,
            report,
            views: Math.floor(Math.random() * 500) + 50,
            likes: Math.floor(Math.random() * 200) + 1,
            // Generate a pseudo-username based on user_id
            username: `user_${draft.user_id.substring(0, 5)}`,
            avatar_url: null
          };
        });
        
        setCommunityDrafts(enhancedSampleDrafts);
      } else {
        // Enhance actual data with grades, analysis, and simulated stats
        const enhancedDrafts = data.map(draft => {
          const report = generateDraftReport(draft);
          
          // Parse results if it's a string
          let parsedResults = draft.results;
          if (typeof draft.results === 'string') {
            try {
              parsedResults = JSON.parse(draft.results);
            } catch (parseError) {
              console.error("Error parsing draft results:", parseError);
              parsedResults = [];
            }
          }
          
          return {
            ...draft,
            results: parsedResults,
            report,
            views: Math.floor(Math.random() * 500) + 50,
            likes: Math.floor(Math.random() * 200) + 1,
            // Create a username from the first part of their email if available
            username: user && draft.user_id === user.id 
              ? 'You' 
              : `drafter_${draft.user_id.substring(0, 5)}`
          };
        });
        
        // Client-side sort for 'popular' and 'score' filters
        if (filter === 'popular') {
          enhancedDrafts.sort((a, b) => b.likes - a.likes);
        } else if (filter === 'score') {
          enhancedDrafts.sort((a, b) => (b.report?.score || 0) - (a.report?.score || 0));
        }
        
        setCommunityDrafts(enhancedDrafts);
      }
    } catch (error) {
      console.error('Error fetching community drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const isUserTeamPick = (pick, selectedTeams) => {
    if (!selectedTeams || !Array.isArray(selectedTeams)) return false;
    return selectedTeams.includes(pick.team);
  };

  const handleLike = async (draftId) => {
    if (!user) {
      setIsLoginModal(true);
      setShowAuthModal(true);
      return;
    }
    
    // In a real implementation, you would send this to your backend
    // For now we'll just update the UI
    setCommunityDrafts(prevDrafts => 
      prevDrafts.map(draft => 
        draft.id === draftId 
          ? { ...draft, likes: (draft.likes || 0) + 1, userLiked: true }
          : draft
      )
    );
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleExpandDraft = (draftId) => {
    if (expandedDraft === draftId) {
      setExpandedDraft(null);
    } else {
      setExpandedDraft(draftId);
    }
  };
  
  const viewDraftDetails = (draftId) => {
    try {
      // Find the draft in the current data
      const draft = communityDrafts.find(d => d.id === draftId);
      if (!draft) {
        console.error("Draft not found");
        return;
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
            </div>
          </div>
          
          {/* Draft List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {communityDrafts.map((draft) => (
                <div 
                  key={draft.id} 
                  className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {draft.avatar_url ? (
                        <img src={draft.avatar_url} alt="User" className="h-10 w-10 rounded-full" />
                      ) : (
                        <span>{draft.username?.charAt(0).toUpperCase() || "D"}</span>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-white">{draft.username || "Anonymous"}</p>
                      <p className="text-sm text-gray-300">{formatDate(draft.created_at)}</p>
                    </div>
                    <div className="ml-auto">
                      <div className={`flex items-center ${draft.report?.color || 'bg-gray-600'} rounded-full px-3 py-1 text-white font-bold`}>
                        <span className="mr-1.5">{draft.report?.letter || 'B'}</span>
                        <span className="text-sm">({draft.report?.displayScore || '85'})</span>
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-2">{draft.name || "Unnamed Draft"}</h2>
                  
                  <div className="flex gap-2 mb-3">
                    <span className="bg-indigo-900 bg-opacity-60 text-white px-2 py-1 rounded-md text-sm">
                      {draft.rounds || 1} Round{draft.rounds !== 1 ? 's' : ''}
                    </span>
                    
                    {Array.isArray(draft.selected_teams) && draft.selected_teams.length > 0 && (
                      <span className="bg-purple-900 bg-opacity-60 text-white px-2 py-1 rounded-md text-sm truncate max-w-[150px]">
                        {draft.selected_teams.slice(0, 1).join(', ')}
                        {draft.selected_teams.length > 1 ? `+${draft.selected_teams.length-1}` : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <button 
                      onClick={() => toggleExpandDraft(draft.id)}
                      className="text-blue-300 hover:text-blue-400 text-sm flex items-center"
                    >
                      <svg 
                        className={`h-4 w-4 mr-1 transform transition-transform ${expandedDraft === draft.id ? 'rotate-90' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Draft Analysis
                    </button>
                    
                    {expandedDraft === draft.id && draft.report && (
                      <div className="mt-3 bg-black bg-opacity-30 p-3 rounded-lg text-sm">
                        <p className="text-white mb-2">{draft.report.analysis}</p>
                        
                        {draft.report.strengths && draft.report.strengths.length > 0 && (
                          <div className="mt-2">
                            <h4 className="text-green-300 font-semibold mb-1">Strengths:</h4>
                            <ul className="text-gray-300 pl-4">
                              {draft.report.strengths.map((strength, idx) => (
                                <li key={idx} className="list-disc ml-2">{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {draft.report.weaknesses && draft.report.weaknesses.length > 0 && (
                          <div className="mt-2">
                            <h4 className="text-red-300 font-semibold mb-1">Areas for Improvement:</h4>
                            <ul className="text-gray-300 pl-4">
                              {draft.report.weaknesses.map((weakness, idx) => (
                                <li key={idx} className="list-disc ml-2">{weakness}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {draft.report.comparison && (
                          <div className="mt-2 text-blue-300 italic">
                            {draft.report.comparison}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleLike(draft.id)}
                        className={`flex items-center ${draft.userLiked ? 'text-red-400' : 'text-gray-300 hover:text-red-400'} transition-colors`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span>{draft.likes || 0}</span>
                      </button>
                      
                      <div className="flex items-center text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        <span>{draft.views || 0}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => viewDraftDetails(draft.id)}
                      className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:translate-y-[-2px] text-sm"
                    >
                      View Draft
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Show message if no drafts are found */}
          {!loading && communityDrafts.length === 0 && (
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-lg border border-white border-opacity-20 text-center">
              <svg className="h-16 w-16 mx-auto mb-4 text-white opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-xl text-white mb-6">No community drafts found. Be the first to share yours!</p>
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
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-white">
                    {viewingDraftDetails.name || `Draft from ${formatDate(viewingDraftDetails.created_at)}`}
                  </h2>
                  <button
                    onClick={() => setViewingDraftDetails(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                      <h3 className="text-xl font-semibold text-white mb-2">Draft Info</h3>
                      <p className="text-gray-300"><span className="font-medium">Created:</span> {formatDate(viewingDraftDetails.created_at)}</p>
                      <p className="text-gray-300"><span className="font-medium">Rounds:</span> {viewingDraftDetails.rounds || 1}</p>
                      <p className="text-gray-300"><span className="font-medium">Created by:</span> {viewingDraftDetails.username || "Anonymous"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                      <h3 className="text-xl font-semibold text-white mb-2">Teams</h3>
                      <div className="flex flex-wrap gap-2">
                        {viewingDraftDetails.selected_teams && Array.isArray(viewingDraftDetails.selected_teams) ? (
                          viewingDraftDetails.selected_teams.map((team, idx) => (
                            <span key={idx} className="bg-blue-900 px-2 py-1 rounded text-white text-sm">
                              {team}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-300">No team data available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {viewingDraftDetails.report && (
                  <div className="mb-6">
                    <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white">Draft Analysis</h3>
                        <div className={`${viewingDraftDetails.report.color || 'bg-blue-600'} px-3 py-1 rounded-full text-white font-bold`}>
                          {viewingDraftDetails.report.letter || 'B'} ({viewingDraftDetails.report.displayScore || '85'})
                        </div>
                      </div>
                      
                      <p className="text-gray-200 mb-4">{viewingDraftDetails.report.analysis}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {viewingDraftDetails.report.strengths && viewingDraftDetails.report.strengths.length > 0 && (
                          <div>
                            <h4 className="text-green-400 font-medium mb-2">Strengths</h4>
                            <ul className="list-disc pl-5 text-gray-300">
                              {viewingDraftDetails.report.strengths.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {viewingDraftDetails.report.weaknesses && viewingDraftDetails.report.weaknesses.length > 0 && (
                          <div>
                            <h4 className="text-red-400 font-medium mb-2">Areas for Improvement</h4>
                            <ul className="list-disc pl-5 text-gray-300">
                              {viewingDraftDetails.report.weaknesses.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      {viewingDraftDetails.report.comparison && (
                        <div className="mt-4 text-blue-300 italic">
                          {viewingDraftDetails.report.comparison}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Draft Picks Section */}
                {viewingDraftDetails.draft_results && Array.isArray(viewingDraftDetails.draft_results) && viewingDraftDetails.draft_results.length > 0 ? (
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Draft Picks</h3>
                    {Array.from({length: viewingDraftDetails.rounds || 1}, (_, i) => i + 1).map(round => {
                      const roundPicks = viewingDraftDetails.draft_results.filter(pick => pick.round === round);
                      return (
                        <div key={round} className="mb-6">
                          <h4 className="text-xl font-medium text-white mb-2">Round {round}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {roundPicks.length > 0 ? (
                              roundPicks.sort((a, b) => a.pickNumber - b.pickNumber).map((pick, idx) => {
                                const isUserPick = isUserTeamPick(pick, viewingDraftDetails.selected_teams);
                                
                                return (
                                  <div 
                                    key={idx} 
                                    className={`${
                                      isUserPick ? 'bg-blue-900' : 'bg-gray-900'
                                    } p-3 rounded text-white transition-all duration-300 ${
                                      isUserPick ? 'border border-blue-500' : ''
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <span className="font-bold mr-2">{pick.pickNumber}.</span>
                                      <span className={`mr-1 ${isUserPick ? 'text-blue-300' : 'text-gray-400'}`}>
                                        {pick.team}:
                                      </span>
                                      <span className="font-medium">{pick.playerName}</span>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-gray-400 col-span-4">No picks for this round</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <p className="text-gray-400">No draft pick data available</p>
                  </div>
                )}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setViewingDraftDetails(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
                </div>
                </div>
                </div>
                )}
                </div>
                </PageTransition>
                );
                };

export default Community;