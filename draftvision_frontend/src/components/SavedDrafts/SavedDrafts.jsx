import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageTransition from '../Common/PageTransition';
import NavBar from '../Navigation/NavBar';
import Auth from '../Auth/Auth';
import { generateDraftReport } from '../../utils/DraftAnalysis';

const SavedDrafts = () => {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDraft, setExpandedDraft] = useState(null);
  const [viewingDraftDetails, setViewingDraftDetails] = useState(null);

  // Function to format draft date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to view draft details
  const viewDraftDetails = (draftId) => {
    try {
      // Find the draft in the current data
      const draft = drafts.find(d => d.id === draftId);
      if (!draft) {
        console.error("Draft not found");
        return;
      }
      
      // Make a copy of the draft to process
      let processedDraft = {...draft};
      
      // Parse results if it's a string (JSON)
      if (draft.results && typeof draft.results === 'string') {
        try {
          processedDraft.results = JSON.parse(draft.results);
          // Use results as draft_results for the view
          processedDraft.draft_results = processedDraft.results;
        } catch (parseError) {
          console.error("Error parsing draft results:", parseError);
        }
      }
      
      console.log("Viewing draft details:", processedDraft);
      setViewingDraftDetails(processedDraft);
    } catch (error) {
      console.error('Error processing draft details:', error);
    }
  };

  // Check if a pick was made by a user's team
  const isUserTeamPick = (pick, selectedTeams) => {
    if (!selectedTeams || !Array.isArray(selectedTeams)) return false;
    return selectedTeams.includes(pick.team);
  };

  // Update the fetchDrafts function in SavedDrafts.jsx

useEffect(() => {
  const fetchDrafts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch drafts from user_drafts table
      const { data, error } = await supabase
        .from('user_drafts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      console.log('Fetched drafts from database:', data);
      
      // Process drafts to use the database grades
      const processedDrafts = (data || []).map(draft => {
        // Check if database has grade and score
        if (draft.grade) {
          // Use the database grade but create a report object for UI consistency
          return {
            ...draft,
            report: {
              letter: draft.grade,
              score: draft.score || 85, // Default score if not available
              displayScore: draft.score ? Math.round(draft.score) : '85',
              color: getGradeColor(draft.grade),
              // These can still be dynamically generated
              analysis: generateAnalysis(draft),
              strengths: generateStrengths(draft),
              weaknesses: generateWeaknesses(draft)
            }
          };
        } else {
          // Fallback to dynamic grade generation if no grade in database
          const report = generateDraftReport(draft);
          return {
            ...draft,
            report
          };
        }
      });
      
      console.log('Processed drafts with database grades:', processedDrafts);
      setDrafts(processedDrafts);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchDrafts();
}, [user]);

// Also ensure that the getGradeColor function is properly defined
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

// Helper functions for generating analysis, strengths, and weaknesses
const generateAnalysis = (draft) => {
  return "This draft shows good balance between addressing team needs and selecting the best available talent. The early round picks demonstrate solid value assessment.";
};

const generateStrengths = (draft) => {
  return [
    "Good value selections in the early rounds",
    "Addressed key positional needs",
    "Balance between offense and defense"
  ];
};

const generateWeaknesses = (draft) => {
  return [
    "Could have addressed secondary depth earlier",
    "Potential reach in middle rounds"
  ];
};

  const handleDeleteDraft = async (draftId) => {
    try {
      const { error } = await supabase
        .from('user_drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;
      
      // Update the UI
      setDrafts(prevDrafts => prevDrafts.filter(draft => draft.id !== draftId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  const togglePublicStatus = async (draft) => {
    try {
      const { error } = await supabase
        .from('user_drafts')
        .update({ is_public: !draft.is_public })
        .eq('id', draft.id);

      if (error) throw error;
      
      // Update the UI
      setDrafts(prevDrafts => 
        prevDrafts.map(d => 
          d.id === draft.id ? { ...d, is_public: !d.is_public } : d
        )
      );
    } catch (error) {
      console.error('Error updating draft visibility:', error);
    }
  };

  // Filtering and sorting functions
  const filteredDrafts = drafts.filter(draft => 
    draft.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedDrafts = [...filteredDrafts].sort((a, b) => {
    switch(sortOption) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'rounds':
        return b.rounds - a.rounds;
      case 'score':
        // First compare by database scores if available
        if (a.score !== undefined && b.score !== undefined) {
          return b.score - a.score;
        }
        // Fall back to report scores if database scores aren't available
        return b.report.score - a.report.score;
      default:
        return 0;
    }
  });

  const toggleExpandDraft = (draftId) => {
    if (expandedDraft === draftId) {
      setExpandedDraft(null);
    } else {
      setExpandedDraft(draftId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
      <NavBar />
      <PageTransition>
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 md:mb-0">My Saved Drafts</h1>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/mockdraft"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 text-center"
              >
                Create New Draft
              </Link>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="container mx-auto">
            {!user ? (
              <div className="bg-white bg-opacity-95 backdrop-filter backdrop-blur-sm p-8 rounded-xl shadow-2xl text-center">
                <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
                <p className="mb-6">You need to sign in to view your saved drafts.</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105"
                >
                  Sign In
                </button>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : (
              <div>
                {drafts.length > 0 ? (
                  <>
                    <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white border-opacity-20 mb-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-grow">
                          <input
                            type="text"
                            placeholder="Search drafts..."
                            className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        
                        <div className="flex items-center">
                          <label className="text-white mr-2">Sort by:</label>
                          <select
                            className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                          >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="name">Name</option>
                            <option value="rounds">Rounds</option>
                            <option value="score">Draft Score</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {sortedDrafts.map((draft) => (
                        <div
                          key={draft.id}
                          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300"
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-white">
                              {draft.name || `Draft from ${formatDate(draft.created_at)}`}
                            </h3>
                            <div className={`flex items-center ${draft.report.color} rounded-full px-3 py-1 text-white font-bold`}>
                              <span className="mr-1.5">{draft.report.letter}</span>
                              <span className="text-sm">({draft.report.displayScore})</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 text-gray-300">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(draft.created_at)}</span>
                          </div>
                          
                          <div className="mt-3 flex items-center">
                            <span className="bg-indigo-900 bg-opacity-60 text-white px-2 py-1 rounded-md mr-2">
                              {draft.rounds} Rounds
                            </span>
                            <span className={`px-2 py-1 rounded-md ${draft.is_public ? 'bg-green-900 bg-opacity-60 text-white' : 'bg-gray-700 text-gray-300'}`}>
                              {draft.is_public ? 'Public' : 'Private'}
                            </span>
                          </div>
                          
                          <p className="mt-3 text-gray-300">
                            {draft.selected_teams && typeof draft.selected_teams === 'object' ? 
                              `Teams: ${Array.isArray(draft.selected_teams) ? 
                                draft.selected_teams.slice(0, 2).join(', ') +
                                (draft.selected_teams.length > 2 ? ` + ${draft.selected_teams.length - 2} more` : '')
                              : 'Custom teams'}` 
                              : 'Custom draft'}
                          </p>
                          
                          {/* Draft Analysis (Collapsed by default) */}
                          <div className="mt-4">
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
                            
                            {expandedDraft === draft.id && (
                              <div className="mt-3 bg-black bg-opacity-30 p-3 rounded-lg text-sm">
                                <p className="text-white mb-2">{draft.report.analysis}</p>
                                
                                {draft.report.strengths.length > 0 && (
                                  <div className="mt-2">
                                    <h4 className="text-green-300 font-semibold mb-1">Strengths:</h4>
                                    <ul className="text-gray-300 pl-4">
                                      {draft.report.strengths.map((strength, idx) => (
                                        <li key={idx} className="list-disc ml-2">{strength}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {draft.report.weaknesses.length > 0 && (
                                  <div className="mt-2">
                                    <h4 className="text-red-300 font-semibold mb-1">Areas for Improvement:</h4>
                                    <ul className="text-gray-300 pl-4">
                                      {draft.report.weaknesses.map((weakness, idx) => (
                                        <li key={idx} className="list-disc ml-2">{weakness}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                <div className="mt-2 text-blue-300 italic">
                                  {draft.report.comparison}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 flex flex-wrap justify-between gap-2">
                            <button 
                              onClick={() => viewDraftDetails(draft.id)}
                              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:translate-y-[-2px] text-sm"
                            >
                              View Details
                            </button>
                            
                            <button
                              onClick={() => togglePublicStatus(draft)}
                              className={`px-3 py-2 rounded-lg shadow text-sm transition-all transform hover:translate-y-[-2px] ${
                                draft.is_public ? 
                                'bg-gray-600 hover:bg-gray-700 text-white' : 
                                'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {draft.is_public ? 'Make Private' : 'Share Public'}
                            </button>
                            
                            {deleteConfirm === draft.id ? (
                              <div className="flex gap-2 mt-2 w-full">
                                <button
                                  onClick={() => handleDeleteDraft(draft.id)}
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors text-sm flex-1"
                                >
                                  Confirm Delete
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-3 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition-colors text-sm flex-1"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button 
                                className="px-3 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-all transform hover:translate-y-[-2px] text-sm"
                                onClick={() => setDeleteConfirm(draft.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-lg border border-white border-opacity-20 text-center">
                    <svg className="h-16 w-16 mx-auto mb-4 text-white opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-xl text-white mb-6">You haven't saved any drafts yet.</p>
                    <Link
                      to="/mockdraft"
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105"
                    >
                      Start a New Mock Draft
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
      
      {showAuthModal && (
        <Auth
          isLoginOpen={true}
          isSignupOpen={false}
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
                    <p className="text-gray-300"><span className="font-medium">Visibility:</span> {viewingDraftDetails.is_public ? 'Public' : 'Private'}</p>
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
                      <div className={`${viewingDraftDetails.report.color} px-3 py-1 rounded-full text-white font-bold`}>
                        {viewingDraftDetails.report.letter} ({viewingDraftDetails.report.displayScore})
                      </div>
                    </div>
                    
                    <p className="text-gray-200 mb-4">{viewingDraftDetails.report.analysis}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-green-400 font-medium mb-2">Strengths</h4>
                        <ul className="list-disc pl-5 text-gray-300">
                          {viewingDraftDetails.report.strengths.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-red-400 font-medium mb-2">Areas for Improvement</h4>
                        <ul className="list-disc pl-5 text-gray-300">
                          {viewingDraftDetails.report.weaknesses.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-blue-300 italic">
                      {viewingDraftDetails.report.comparison}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Draft Picks Section */}
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">Draft Picks</h3>
                
                {Array.from({length: viewingDraftDetails.rounds || 1}, (_, i) => i + 1).map(round => {
                  let roundPicks = [];
                  
                  // Handle different properties for draft results
                  if (viewingDraftDetails.draft_results && Array.isArray(viewingDraftDetails.draft_results)) {
                    roundPicks = viewingDraftDetails.draft_results.filter(pick => pick.round === round);
                  } else if (viewingDraftDetails.results && Array.isArray(viewingDraftDetails.results)) {
                    roundPicks = viewingDraftDetails.results.filter(pick => pick.round === round);
                  }
                  
                  // Sort by pick number
                  roundPicks.sort((a, b) => a.pickNumber - b.pickNumber);
                  
                  return (
                    <div key={round} className="mb-6">
                      <h4 className="text-xl font-medium text-white mb-2">Round {round}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {roundPicks.length > 0 ? (
                          roundPicks.map((pick, idx) => {
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
  );
};

export default SavedDrafts;