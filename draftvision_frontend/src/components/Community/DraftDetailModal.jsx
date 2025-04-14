import React from 'react';

/**
 * Format a date string into a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Checks if a pick belongs to one of the user's selected teams
 */
const isUserTeamPick = (pick, selectedTeams) => {
  if (!selectedTeams || !Array.isArray(selectedTeams)) return false;
  return selectedTeams.includes(pick.team);
};

/**
 * Modal component for displaying detailed draft information
 */
const DraftDetailModal = ({ 
  draft, 
  onClose,
  user,
  draftComments,
  newComment,
  setNewComment,
  addComment,
  handleCommentLike,
  commentLoading,
  setShowAuthModal,
  setIsLoginModal
}) => {
  if (!draft) return null;
  
  const showLoginPrompt = () => {
    setIsLoginModal(true);
    setShowAuthModal(true);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">
              {draft.name || `Draft from ${formatDate(draft.created_at)}`}
            </h2>
            <button
              onClick={onClose}
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
                <p className="text-gray-300"><span className="font-medium">Created:</span> {formatDate(draft.created_at)}</p>
                <p className="text-gray-300"><span className="font-medium">Rounds:</span> {draft.rounds || 1}</p>
                <p className="text-gray-300"><span className="font-medium">Created by:</span> {draft.username || "Anonymous"}</p>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-white mb-2">Teams</h3>
                <div className="flex flex-wrap gap-2">
                  {draft.selected_teams && Array.isArray(draft.selected_teams) ? (
                    draft.selected_teams.map((team, idx) => (
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
          
          {draft.report && (
            <div className="mb-6">
              <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Draft Analysis</h3>
                  <div className={`${draft.report.color || 'bg-blue-600'} px-3 py-1 rounded-full text-white font-bold`}>
                    {draft.report.letter || 'B'} ({draft.report.displayScore || '85'})
                  </div>
                </div>
                
                <p className="text-gray-200 mb-4">{draft.report.analysis}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {draft.report.strengths && draft.report.strengths.length > 0 && (
                    <div>
                      <h4 className="text-green-400 font-medium mb-2">Strengths</h4>
                      <ul className="list-disc pl-5 text-gray-300">
                        {draft.report.strengths.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {draft.report.weaknesses && draft.report.weaknesses.length > 0 && (
                    <div>
                      <h4 className="text-red-400 font-medium mb-2">Areas for Improvement</h4>
                      <ul className="list-disc pl-5 text-gray-300">
                        {draft.report.weaknesses.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {draft.report.comparison && (
                  <div className="mt-4 text-blue-300 italic">
                    {draft.report.comparison}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Comments section for the modal */}
          <div className="mb-6">
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-white mb-4">Comments</h3>
              
              {/* Add comment in modal */}
              {user ? (
                <div className="flex mb-4">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-grow px-3 py-2 bg-gray-800 bg-opacity-50 text-white rounded-l-lg focus:outline-none"
                  />
                  <button
                    onClick={() => addComment(draft.id)}
                    disabled={commentLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                  >
                    {commentLoading ? 
                      <span className="block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 
                      'Post'
                    }
                  </button>
                </div>
              ) : (
                <div className="mb-4 text-center p-3 bg-gray-800 bg-opacity-40 rounded-lg">
                  <p className="text-gray-300">
                    <button 
                      onClick={() => {
                        setIsLoginModal(true);
                        setShowAuthModal(true);
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Sign in
                    </button> or 
                    <button 
                      onClick={() => {
                        setIsLoginModal(false);
                        setShowAuthModal(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 ml-1"
                    >
                      create an account
                    </button> to comment
                  </p>
                </div>
              )}
              
              {/* Comments list in modal */}
              {draftComments[draft.id] && draftComments[draft.id].length > 0 ? (
                <div className="space-y-4">
                  {draftComments[draft.id].map((comment) => (
                    <div key={comment.id} className="bg-gray-800 bg-opacity-50 p-3 rounded">
                      <div className="flex items-center mb-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {comment.avatar_url ? (
                            <img src={comment.avatar_url} alt="User" className="h-8 w-8 rounded-full" />
                          ) : (
                            <span>{comment.username?.charAt(0).toUpperCase() || "U"}</span>
                          )}
                        </div>
                        <span className="ml-2 font-medium text-white">{comment.username}</span>
                        <span className="ml-2 text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-white">{comment.comment}</p>
                      <div className="mt-2 flex justify-end">
                        <button 
                          onClick={() => user ? handleCommentLike(comment.id) : showLoginPrompt()}
                          className={`flex items-center text-sm ${comment.userLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          <span>{comment.likes || 0}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
          
          {/* Draft Picks Section */}
          {draft.draft_results && Array.isArray(draft.draft_results) && draft.draft_results.length > 0 ? (
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4">Draft Picks</h3>
              {Array.from({length: draft.rounds || 1}, (_, i) => i + 1).map(round => {
                const roundPicks = draft.draft_results.filter(pick => pick.round === round);
                return (
                  <div key={round} className="mb-6">
                    <h4 className="text-xl font-medium text-white mb-2">Round {round}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {roundPicks.length > 0 ? (
                        roundPicks.sort((a, b) => a.pickNumber - b.pickNumber).map((pick, idx) => {
                          const isUsersTeamPick = isUserTeamPick(pick, draft.selected_teams);
                          
                          return (
                            <div 
                              key={idx} 
                              className={`${
                                isUsersTeamPick ? 'bg-blue-900' : 'bg-gray-900'
                              } p-3 rounded text-white transition-all duration-300 ${
                                isUsersTeamPick ? 'border border-blue-500' : ''
                              }`}
                            >
                              <div className="flex items-center">
                                <span className="font-bold mr-2">{pick.pickNumber}.</span>
                                <span className={`mr-1 ${isUsersTeamPick ? 'text-blue-300' : 'text-gray-400'}`}>
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
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftDetailModal;