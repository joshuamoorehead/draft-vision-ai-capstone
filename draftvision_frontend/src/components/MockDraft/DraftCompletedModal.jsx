import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Auth from '../Auth/Auth';
import { supabase } from '../../services/api';

const DraftCompletedModal = ({ onReturnDraft, onReturnHome, draftedPicks, userTeams, rounds }) => {
  const [draftName, setDraftName] = useState(`Draft ${new Date().toLocaleDateString()}`);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  const saveDraft = async (draftData) => {
    try {
      console.log("Saving draft with data:", draftData);
      
      if (!user?.id) {
        throw new Error("You must be logged in to save drafts");
      }

      // Format data exactly as per our new table structure
      const dataToInsert = {
        user_id: user.id,
        name: draftData.name,
        rounds: draftData.rounds,
        selected_teams: draftData.selectedTeams, 
        results: draftData.results,
        is_public: false
      };
      
      console.log("Formatted data to insert:", dataToInsert);
      
      // Insert into the NEW table we created
      const { data, error } = await supabase
        .from('user_drafts') // Using the new table name
        .insert([dataToInsert]);
        
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Draft save response:", data);
      return data;
    } catch (error) {
      console.error("Error in saveDraft:", error);
      throw error;
    }
  };

  const handleSaveDraft = async () => {
    if (!user) {
      setError("You must be logged in to save drafts");
      setShowAuthModal(true);
      return;
    }

    if (!draftName.trim()) {
      setError("Please enter a name for your draft");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Organize the draft data
      const draftData = {
        name: draftName,
        rounds: rounds,
        selectedTeams: userTeams,
        results: draftedPicks
      };

      // Call the saveDraft function
      await saveDraft(draftData);
      
      console.log("Draft saved successfully");
      setSuccess(true);
      
      // Wait a moment before returning to show success message
      setTimeout(() => {
        onReturnHome();
      }, 2000);
    } catch (err) {
      console.error("Error saving draft:", err);
      setError("Failed to save draft: " + (err.message || "Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-black bg-opacity-95 backdrop-filter backdrop-blur-sm flex justify-center items-center z-50">
      {/* Animated floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="modal-content bg-gray-800 bg-opacity-70 p-8 rounded-2xl shadow-2xl border border-indigo-500 border-opacity-30 w-11/12 max-w-md relative z-10">
        {/* Success confetti animation */}
        {success && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="confetti-container">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2 text-white">
            Draft <span className="text-blue-400">Completed!</span>
          </h2>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full my-4"></div>
          
          {/* Trophy icon */}
          <div className="flex justify-center my-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M5 3h14a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-1.5v3c0 2.79-1.637 5.172-4 6.3v1.7h3a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h3v-1.7c-2.363-1.128-4-3.51-4-6.3v-3h-1.5a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2z" />
              </svg>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900 bg-opacity-20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6 text-center">
            Draft saved successfully!
          </div>
        )}
        
        {user ? (
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="draftName">
              Draft Name
            </label>
            <div className="relative">
              <input
                id="draftName"
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                disabled={saving}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 mb-6 text-center">
            You need to be logged in to save your draft results!
          </p>
        )}
        
        <div className="flex flex-wrap justify-center gap-4">
          {user ? (
            <button
              className={`px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center ${saving ? 'opacity-70 cursor-not-allowed' : 'transform hover:scale-105'}`}
              onClick={handleSaveDraft}
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  Save Mock Draft
                </>
              )}
            </button>
          ) : (
            <button
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 flex items-center"
              onClick={() => setShowAuthModal(true)}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              Log In to Save
            </button>
          )}
          
          <button
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-medium rounded-lg shadow-lg hover:from-yellow-600 hover:to-amber-700 transition-all duration-200 transform hover:scale-105 flex items-center"
            onClick={onReturnDraft}
            disabled={saving}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Return to Draft
          </button>
          
          <button
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-medium rounded-lg shadow-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-200 transform hover:scale-105 flex items-center"
            onClick={onReturnHome}
            disabled={saving}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Return Home
          </button>
        </div>
      </div>
      
      {/* Auth modal for login/signup when needed */}
      {showAuthModal && (
        <Auth 
          isLoginOpen={true} 
          isSignupOpen={false} 
          closeModals={closeAuthModal}
        />
      )}
      
      {/* Custom styling for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(600px) rotate(90deg);
            opacity: 0;
          }
        }
        .confetti-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: -1;
        }
        .confetti {
          position: absolute;
          top: -10px;
          border-radius: 0;
          animation: confetti-fall 5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DraftCompletedModal;