import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/api';
import PageTransition from '../Common/PageTransition';

const Community = () => {
  const { user } = useAuth();
  const [communityDrafts, setCommunityDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('popular'); // 'popular', 'recent', 'highest-rated'

  useEffect(() => {
    fetchCommunityDrafts();
  }, [filter]);

  const fetchCommunityDrafts = async () => {
    setLoading(true);
    try {
      // This is where you would fetch community drafts from your database
      // Adjust the query based on the current filter
      let query = supabase
        .from('saved_drafts')
        .select(`
          id,
          user_id,
          draft_name,
          created_at,
          rounds,
          selected_teams,
          likes,
          user_profiles(username, avatar_url)
        `)
        .eq('is_public', true)
        .limit(20);

      if (filter === 'popular') {
        query = query.order('likes', { ascending: false });
      } else if (filter === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (filter === 'highest-rated') {
        query = query.order('average_rating', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // For demonstration purposes, if no data, create sample drafts
      if (!data || data.length === 0) {
        const sampleDrafts = [
          {
            id: 1,
            draft_name: "John's 2025 Mock",
            created_at: "2025-02-20T15:30:00",
            rounds: 3,
            likes: 156,
            user_profiles: { username: "john_draft_master", avatar_url: null }
          },
          {
            id: 2,
            draft_name: "Early QB Focus Draft",
            created_at: "2025-02-18T12:15:00",
            rounds: 7,
            likes: 89,
            user_profiles: { username: "draft_enthusiast", avatar_url: null }
          },
          {
            id: 3,
            draft_name: "Defense First Strategy",
            created_at: "2025-02-22T09:45:00",
            rounds: 5,
            likes: 127,
            user_profiles: { username: "defense_wins", avatar_url: null }
          }
        ];
        setCommunityDrafts(sampleDrafts);
      } else {
        setCommunityDrafts(data);
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

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Community Mock Drafts</h1>
        
        {/* Filter Controls */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded-md ${filter === 'popular' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterChange('popular')}
          >
            Most Popular
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${filter === 'recent' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterChange('recent')}
          >
            Most Recent
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${filter === 'highest-rated' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterChange('highest-rated')}
          >
            Highest Rated
          </button>
        </div>
        
        {/* Draft List */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {communityDrafts.map((draft) => (
              <div key={draft.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                      {draft.user_profiles?.avatar_url ? (
                        <img src={draft.user_profiles.avatar_url} alt="User" className="h-10 w-10 rounded-full" />
                      ) : (
                        <span>{draft.user_profiles?.username?.charAt(0).toUpperCase() || "U"}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{draft.user_profiles?.username || "Anonymous"}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(draft.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold mb-2">{draft.draft_name}</h2>
                  <p className="text-gray-600 mb-3">{draft.rounds} Round{draft.rounds !== 1 ? 's' : ''}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="flex items-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {Math.floor(Math.random() * 500) + 50} views
                    </span>
                    <span className="flex items-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {draft.likes || Math.floor(Math.random() * 200) + 1} likes
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 border-t">
                  <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                    View Draft
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Show message if not logged in */}
        {!user && (
          <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
            <h3 className="text-lg font-semibold mb-2">Want to share your mock drafts?</h3>
            <p className="mb-4">Sign in or create an account to publish your mock drafts to the community.</p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => {/* Open login modal */}}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sign In
              </button>
              <button 
                onClick={() => {/* Open signup modal */}}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Create Account
              </button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Community;