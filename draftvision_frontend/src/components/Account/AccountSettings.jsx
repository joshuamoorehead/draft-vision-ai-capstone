// src/components/Account/AccountSettings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/api';
import PageTransition from '../Common/PageTransition';

const AccountSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const [profile, setProfile] = useState({
    email: user?.email || '',
    favorite_team: '',
    notification_preferences: {
      draft_reminders: true,
      draft_results: true,
    }
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile(prev => ({
            ...prev,
            ...data
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#5A6BB0] transition-all duration-300">
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Account Settings</h1>
            
            {message && (
              <div className={`p-4 mb-4 rounded ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

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
                    <option value="SF">San Francisco 49ers</option>
                    <option value="CHI">Chicago Bears</option>
                    {/* Add all NFL teams */}
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
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default AccountSettings;