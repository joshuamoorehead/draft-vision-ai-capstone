import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/api';
import PageTransition from '../Common/PageTransition';
import { fetchUserDrafts } from '../../services/api';

const AccountSettings = () => {
  const { user, refreshSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [resetPasswordSent, setResetPasswordSent] = useState(false);
  
  // Draft statistics
  const [draftStats, setDraftStats] = useState({
    totalDrafts: 0,
    highestGrade: null,
    highestScore: null
  });
  
  // Profile state
  const [profile, setProfile] = useState({
    email: '',
    username: '',
    favorite_team: ''
  });

  // Load user profile and draft statistics
  useEffect(() => {
    const loadProfileAndStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Set email from user auth object
        setProfile(prev => ({
          ...prev,
          email: user.email || '',
        }));

        // Load profile data
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          
          // If profile doesn't exist, create one
          if (error.code === 'PGRST116') {
            console.log('Profile not found, creating one...');
            await createProfile();
          } else {
            // Try refreshing the session if there's an auth error
            if (error.status === 401 || error.status === 403) {
              console.log('Auth error, refreshing session...');
              await refreshSession();
              
              // Increment retry attempt and try again if not too many attempts
              if (retryAttempt < 2) {
                setRetryAttempt(prev => prev + 1);
                setLoading(true);
                return;
              }
            }
            
            setMessage({ type: 'error', text: 'Failed to load profile. Please try refreshing the page.' });
          }
        } else if (data) {
          console.log('Profile loaded:', data);
          setProfile(prev => ({
            ...prev,
            username: data.username || '',
            favorite_team: data.favorite_team || ''
          }));
          setMessage(null);
        }

        // Load draft statistics
        try {
          const drafts = await fetchUserDrafts();
          
          // Calculate draft statistics
          const totalDrafts = drafts.length;
          
          // Find the highest grade
          let highestGrade = null;
          let highestScore = null;
          
          if (drafts.length > 0) {
            // Find the draft with the highest score
            const draftWithHighestScore = drafts.reduce((highest, current) => {
              // If current draft has a score and it's higher than our current highest
              if (current.score && (!highest || current.score > highest.score)) {
                return current;
              }
              return highest;
            }, null);
            
            if (draftWithHighestScore) {
              highestGrade = draftWithHighestScore.grade || '';
              highestScore = draftWithHighestScore.score?.toFixed(1) || '';
            }
          }
          
          setDraftStats({
            totalDrafts,
            highestGrade,
            highestScore
          });
        } catch (statsError) {
          console.error('Error loading draft statistics:', statsError);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile. Please try refreshing the page.' });
      } finally {
        setLoading(false);
      }
    };

    // Function to create a new profile
    const createProfile = async () => {
      try {
        const defaultUsername = user.email ? user.email.split('@')[0] : `user_${Math.floor(Math.random() * 10000)}`;
        
        const { error } = await supabase
          .from('user_profiles')
          .insert([{
            user_id: user.id,
            email: user.email,
            username: defaultUsername,
            favorite_team: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) {
          console.error('Error creating profile:', error);
          setMessage({ type: 'error', text: 'Failed to create profile. Please try refreshing the page.' });
        } else {
          console.log('Profile created successfully');
          // Set username in state
          setProfile(prev => ({
            ...prev,
            username: defaultUsername
          }));
          // Reload profile after creation
          loadProfileAndStats();
        }
      } catch (err) {
        console.error('Unexpected error creating profile:', err);
        setMessage({ type: 'error', text: 'An unexpected error occurred. Please try refreshing the page.' });
      }
    };

    loadProfileAndStats();
  }, [user, retryAttempt, refreshSession]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    setUpdating(true);
    setMessage(null);
  
    // Validate username
    if (!profile.username || profile.username.trim() === '') {
      setMessage({ type: 'error', text: 'Username cannot be empty' });
      setUpdating(false);
      return;
    }
  
    // Check username format (only allow letters, numbers, underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(profile.username)) {
      setMessage({ type: 'error', text: 'Username can only contain letters, numbers, and underscores' });
      setUpdating(false);
      return;
    }
  
    try {
      // First check if username is taken (if changed)
      const { data: existingUser, error: checkError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('username', profile.username)
        .neq('user_id', user.id)
        .single();
  
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
  
      if (existingUser) {
        setMessage({ type: 'error', text: 'Username is already taken. Please choose another.' });
        setUpdating(false);
        return;
      }
  
      // Get the profile record to get the actual row id (primary key)
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id, username, email, favorite_team')
        .eq('user_id', user.id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching existing profile:', fetchError);
        throw fetchError;
      }
      
      if (!existingProfile || !existingProfile.id) {
        throw new Error('Could not find your profile in the database');
      }
      
      console.log('Updating profile with primary key id:', existingProfile.id);
      
      // Update the record using the actual primary key 'id'
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          username: profile.username,
          favorite_team: profile.favorite_team,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id); // Using the actual primary key 'id'
        
      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error in profile update process:', error);
      setMessage({ type: 'error', text: `Error updating profile: ${error.message || 'Please try again.'}` });
    } finally {
      setUpdating(false);
    }
  };

  const handleSendPasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        profile.email,
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      
      if (error) throw error;
      
      setResetPasswordSent(true);
      setMessage({ type: 'success', text: 'Password reset link has been sent to your email.' });
    } catch (error) {
      console.error('Error sending password reset:', error);
      setMessage({ type: 'error', text: 'Failed to send reset password email. Please try again.' });
    }
  };

  const NFL_TEAMS = [
    { value: 'ARI', label: 'Arizona Cardinals' },
    { value: 'ATL', label: 'Atlanta Falcons' },
    { value: 'BAL', label: 'Baltimore Ravens' },
    { value: 'BUF', label: 'Buffalo Bills' },
    { value: 'CAR', label: 'Carolina Panthers' },
    { value: 'CHI', label: 'Chicago Bears' },
    { value: 'CIN', label: 'Cincinnati Bengals' },
    { value: 'CLE', label: 'Cleveland Browns' },
    { value: 'DAL', label: 'Dallas Cowboys' },
    { value: 'DEN', label: 'Denver Broncos' },
    { value: 'DET', label: 'Detroit Lions' },
    { value: 'GB', label: 'Green Bay Packers' },
    { value: 'HOU', label: 'Houston Texans' },
    { value: 'IND', label: 'Indianapolis Colts' },
    { value: 'JAX', label: 'Jacksonville Jaguars' },
    { value: 'KC', label: 'Kansas City Chiefs' },
    { value: 'LV', label: 'Las Vegas Raiders' },
    { value: 'LAC', label: 'Los Angeles Chargers' },
    { value: 'LAR', label: 'Los Angeles Rams' },
    { value: 'MIA', label: 'Miami Dolphins' },
    { value: 'MIN', label: 'Minnesota Vikings' },
    { value: 'NE', label: 'New England Patriots' },
    { value: 'NO', label: 'New Orleans Saints' },
    { value: 'NYG', label: 'New York Giants' },
    { value: 'NYJ', label: 'New York Jets' },
    { value: 'PHI', label: 'Philadelphia Eagles' },
    { value: 'PIT', label: 'Pittsburgh Steelers' },
    { value: 'SF', label: 'San Francisco 49ers' },
    { value: 'SEA', label: 'Seattle Seahawks' },
    { value: 'TB', label: 'Tampa Bay Buccaneers' },
    { value: 'TEN', label: 'Tennessee Titans' },
    { value: 'WAS', label: 'Washington Commanders' }
  ];

  const handleRetry = () => {
    setLoading(true);
    setMessage(null);
    setRetryAttempt(prev => prev + 1);
  };

  // Function to get color class based on grade
  const getGradeColorClass = (grade) => {
    if (!grade) return 'from-gray-500 to-gray-600';
    
    const firstChar = grade.charAt(0);
    switch(firstChar) {
      case 'A': return 'from-green-500 to-emerald-600';
      case 'B': return 'from-blue-500 to-indigo-600';
      case 'C': return 'from-yellow-500 to-amber-600';
      case 'D': return 'from-orange-500 to-orange-600';
      default: return 'from-red-500 to-red-600';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white bg-opacity-95 backdrop-filter backdrop-blur-sm p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-6 text-gray-600">Please sign in to access your account settings.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      {/* Enhanced background with animated gradient and subtle pattern */}
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="bg-white bg-opacity-95 backdrop-filter backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-blue-500/20">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">Account Settings</h1>
                  <div className="h-1 w-16 bg-blue-400 rounded"></div>
                </div>
                {loading && (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                )}
              </div>
              
              {message && (
                <div className={`p-4 mb-6 rounded-lg flex items-start ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {message.type === 'success' ? (
                    <svg className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p>{message.text}</p>
                    {message.type === 'error' && (
                      <button 
                        onClick={handleRetry}
                        className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-6"></div>
                  <p className="text-gray-500 text-lg">Loading your profile...</p>
                </div>
              ) : (
                <>
                  {/* Draft Statistics Cards */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Total Drafts Card */}
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105">
                      <div className="flex items-center">
                        <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold opacity-90">Total Mock Drafts</h2>
                          <p className="text-4xl font-bold mt-1">{draftStats.totalDrafts}</p>
                        </div>
                      </div>
                      <div className="mt-4 text-sm opacity-80">
                        {draftStats.totalDrafts === 0 ? 
                          "Create your first mock draft to get started!" : 
                          `You've created ${draftStats.totalDrafts} mock ${draftStats.totalDrafts === 1 ? 'draft' : 'drafts'} so far.`
                        }
                      </div>
                    </div>

                    {/* Highest Draft Grade Card */}
                    <div className={`bg-gradient-to-br ${getGradeColorClass(draftStats.highestGrade)} rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105`}>
                      <div className="flex items-center">
                        <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold opacity-90">Highest Draft Grade</h2>
                          <div className="flex items-baseline mt-1">
                            <p className="text-4xl font-bold">
                              {draftStats.highestGrade || "—"}
                            </p>
                            {draftStats.highestScore && (
                              <span className="ml-2 text-sm opacity-90">
                                ({draftStats.highestScore}/100)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 text-sm opacity-80">
                        {!draftStats.highestGrade ? 
                          "Complete a draft to receive a grade!" : 
                          `Your highest graded draft received ${draftStats.highestGrade}.`
                        }
                      </div>
                    </div>
                  </div>

                  {/* Account Settings Form */}
                  <form onSubmit={handleUpdateProfile} className="bg-white rounded-xl p-6 shadow-md space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
                    
                    {/* Email (non-editable) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          disabled
                          value={profile.email}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-500"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={profile.username}
                          onChange={(e) => setProfile({...profile, username: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Choose a username"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        This will be displayed on your drafts and in community features.
                      </p>
                    </div>

                    {/* Favorite Team */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Favorite Team
                      </label>
                      <div className="relative">
                        <select
                          value={profile.favorite_team}
                          onChange={(e) => setProfile({...profile, favorite_team: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all duration-200"
                        >
                          <option value="">Select a team</option>
                          {NFL_TEAMS.map(team => (
                            <option key={team.value} value={team.value}>
                              {team.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Password Reset Button */}
                    <div className="border-t border-gray-200 pt-6">
                      <button
                        type="button"
                        onClick={handleSendPasswordReset}
                        disabled={resetPasswordSent}
                        className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none focus:underline disabled:text-gray-400 transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        {resetPasswordSent ? 'Password reset email sent' : 'Reset Password'}
                      </button>
                      <p className="mt-1 text-xs text-gray-500">
                        We'll send a password reset link to your email address.
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={updating}
                        className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                      >
                        {updating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
        
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
          .bg-grid-pattern {
            background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 40px 40px;
          }
        `}</style>
      </div>
    </PageTransition>
  );
};

export default AccountSettings;