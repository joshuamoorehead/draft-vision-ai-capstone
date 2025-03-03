import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/api';
import PageTransition from '../Common/PageTransition';
import NavBar from '../Navigation/NavBar';

const AccountSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const [profile, setProfile] = useState({
    email: '',
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
        setProfile(prev => ({
          ...prev,
          email: user.email || '',
        }));

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "row not found" which is expected for new users
          throw error;
        }

        if (data) {
          setProfile(prev => ({
            ...prev,
            ...data,
            notification_preferences: {
              ...prev.notification_preferences,
              ...(data.notification_preferences || {})
            }
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    setUpdating(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          favorite_team: profile.favorite_team,
          notification_preferences: profile.notification_preferences
        });

      if (error) throw error;
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

  if (!user) {
    return (
      <div className="min-h-screen bg-[#5A6BB0]">
        <NavBar />
        <div className="container mx-auto px-4 py-8 pt-40">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p>Please sign in to access your account settings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#5A6BB0] transition-all duration-300">
      <NavBar />
      <PageTransition>
        <div className="container mx-auto px-4 py-8 pt-40">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Account Settings</h1>
            
            {message && (
              <div className={`p-4 mb-4 rounded ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center p-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-6">
                  {/* Email (non-editable) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                    />
                  </div>

                  {/* Favorite Team */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Favorite Team
                    </label>
                    <select
                      value={profile.favorite_team}
                      onChange={(e) => setProfile({...profile, favorite_team: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
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
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                    <div className="mt-2 space-y-2">
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
                          className="h-4 w-4 text-blue-600"
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
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-gray-700">Draft Results</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={updating}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                      {updating ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default AccountSettings;