import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageTransition from '../Common/PageTransition';
import NavBar from '../Navigation/NavBar';

const SavedDrafts = () => {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrafts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('saved_drafts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDrafts(data || []);
      } catch (error) {
        console.error('Error fetching drafts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#5A6BB0] transition-all duration-300">
      <NavBar />
      <PageTransition>
        <div className="container mx-auto px-4 py-8 pt-40">
          <div className="container mx-auto px-4 h-full flex items-center">
            <h1 className="text-4xl font-bold text-white">Saved Drafts</h1>
          </div>
          
          {/* Main Content */}
          <div className="container mx-auto px-4 py-8">
            {!user ? (
              <div className="bg-white text-center p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
                <p className="mb-6">You need to sign in to view your saved drafts.</p>
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center p-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              </div>
            ) : drafts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="bg-white text-black p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">
                        {draft.draft_name || `Draft from ${new Date(draft.created_at).toLocaleDateString()}`}
                      </h3>
                      <span className="text-gray-600 font-semibold">
                        {draft.rounds} Rounds
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">
                      {draft.selected_teams ? 
                        `Teams: ${draft.selected_teams.slice(0, 3).join(', ')}${draft.selected_teams.length > 3 ? '...' : ''}` 
                        : 'Custom draft'}
                    </p>
                    <div className="mt-4 flex justify-between">
                      <Link 
                        to={`/draftroom?id=${draft.id}`} 
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        View Draft
                      </Link>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {/* Delete functionality */}}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                <p className="text-xl mb-6">You haven't saved any drafts yet.</p>
                <Link
                  to="/mockdraft"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start a New Mock Draft
                </Link>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default SavedDrafts;