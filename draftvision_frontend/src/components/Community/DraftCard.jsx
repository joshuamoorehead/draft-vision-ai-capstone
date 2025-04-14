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
 * Draft card component displaying a single draft in the community view
 */
const DraftCard = ({ 
  draft, 
  expandedDraft, 
  toggleExpandDraft, 
  viewDraftDetails,
  handleLike,
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
  const showLoginPrompt = () => {
    setIsLoginModal(true);
    setShowAuthModal(true);
  };
  
  return (
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
      
      {/* Comments section */}
      <div className="mt-4">
        <button 
          onClick={() => toggleExpandDraft(`comments-${draft.id}`)}
          className="text-blue-300 hover:text-blue-400 text-sm flex items-center"
        >
          <svg 
            className={`h-4 w-4 mr-1 transform transition-transform ${expandedDraft === `comments-${draft.id}` ? 'rotate-90' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Comments ({draftComments[draft.id]?.length || 0})
        </button>
        
        {expandedDraft === `comments-${draft.id}` && (
          <div className="mt-3 bg-black bg-opacity-30 p-3 rounded-lg">
            {/* Comment input - only show when logged in */}
            {user ? (
              <div className="flex mb-3">
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
                  className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                >
                  {commentLoading ? 
                    <span className="block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 
                    'Post'
                  }
                </button>
              </div>
            ) : (
              <div className="mb-3 text-center p-2 bg-gray-800 bg-opacity-40 rounded-lg">
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
            
            {/* Comments list */}
            {draftComments[draft.id] && draftComments[draft.id].length > 0 ? (
              <div className="space-y-3">
                {draftComments[draft.id].map((comment) => (
                  <div key={comment.id} className="bg-gray-800 bg-opacity-50 p-2 rounded">
                    <div className="flex items-center mb-1">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                        {comment.avatar_url ? (
                          <img src={comment.avatar_url} alt="User" className="h-6 w-6 rounded-full" />
                        ) : (
                          <span>{comment.username?.charAt(0).toUpperCase() || "U"}</span>
                        )}
                      </div>
                      <span className="ml-2 text-sm font-medium text-white">{comment.username}</span>
                      <span className="ml-2 text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-white">{comment.comment}</p>
                    <div className="mt-1 flex justify-end">
                      <button 
                        onClick={() => user ? handleCommentLike(comment.id) : showLoginPrompt()}
                        className={`flex items-center text-xs ${comment.userLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
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
              <p className="text-sm text-gray-400">No comments yet. Be the first to comment!</p>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => user ? handleLike(draft.id) : showLoginPrompt()}
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
  );
};

export default DraftCard;