import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/api';
import PageTransition from '../Common/PageTransition';

const AccountSettings = () => {
  const { user, refreshSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [profile, setProfile] = useState({
    email: '',
    username: '',
    favorite_team: '',
    notification_preferences: {
      draft_reminders: true,
      draft_results: true,
    }
  });

  useEffect(() => {
    const loadProfile = async () => {
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

        console.log('Fetching profile for user:', user.id);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          
          // If profile doesn't exist, create one
          if (error.code === 'PGRST116') { // "Row not found" error code
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
            favorite_team: data.favorite_team || '',
            notification_preferences: {
              ...prev.notification_preferences,
              ...(data.notification_preferences || {})
            }
          }));
          setMessage(null);
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
            notification_preferences: {
              draft_reminders: true,
              draft_results: true
            },
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
          loadProfile();
        }
      } catch (err) {
        console.error('Unexpected error creating profile:', err);
        setMessage({ type: 'error', text: 'An unexpected error occurred. Please try refreshing the page.' });
      }
    };

    loadProfile();
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

      console.log('Updating profile with:', {
        user_id: user.id,
        username: profile.username,
        favorite_team: profile.favorite_team,
        notification_preferences: profile.notification_preferences
      });
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: profile.email,
          username: profile.username,
          favorite_team: profile.favorite_team,
          notification_preferences: profile.notification_preferences,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error from Supabase:', error);
        throw error;
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Error updating profile. Please try again.' });
    } finally {
      setUpdating(false);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-[#5A6BB0] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-4">Please sign in to access your account settings.</p>
          <button 
            onClick={() => window.location.href = '/about'}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#5A6BB0] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              )}
            </div>
            
            {message && (
              <div className={`p-4 mb-6 rounded flex items-start ${
                message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
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
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500">Loading your profile...</p>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Email (non-editable) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Choose a username"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This will be displayed on your drafts and in community features.
                  </p>
                </div>

                {/* Favorite Team */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Favorite Team
                  </label>
                  <select
                    value={profile.favorite_team}
                    onChange={(e) => setProfile({...profile, favorite_team: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a team</option>
                    {NFL_TEAMS.map(team => (
                      <option key={team.value} value={team.value}>
                        {team.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notification Preferences */}
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Notification Preferences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.notification_preferences.draft_reminders}
                        onChange={(e) => setProfile({
                          ...profile,
                          notification_preferences: {
                            ...profile.notification_preferences,
                            draft_reminders: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Draft Reminders</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.notification_preferences.draft_results}
                        onChange={(e) => setProfile({
                          ...profile,
                          notification_preferences: {
                            ...profile.notification_preferences,
                            draft_results: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Draft Results</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AccountSettings;