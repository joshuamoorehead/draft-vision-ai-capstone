// src/components/SavedDrafts/SavedDrafts.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageTransition from '../Common/PageTransition';

const SavedDrafts = () => {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const { data, error } = await supabase
          .from('saved_drafts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDrafts(data);
      } catch (error) {
        console.error('Error fetching drafts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  return (
    <div className="min-h-screen bg-[#5A6BB0] transition-all duration-300">
        <PageTransition>
            <div className="container mx-auto px-4 py-8">
                <div className="container mx-auto px-4 h-full flex items-center">
                <h1 className="text-4xl font-bold">Saved Drafts</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                <p>Loading your drafts...</p>
                ) : drafts.length > 0 ? (
                <div className="grid gap-4">
                    {drafts.map((draft) => (
                    <div 
                        key={draft.id} 
                        className="bg-white text-black p-4 rounded-lg shadow"
                    >
                        <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">
                            Draft from {new Date(draft.draft_date).toLocaleDateString()}
                        </h3>
                        <span className="text-gray-600">
                            {draft.rounds} Rounds
                        </span>
                        </div>
                        <p className="mt-2">Teams: {draft.selected_teams.join(', ')}</p>
                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                        View Details
                        </button>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="text-center">
                    <p className="text-xl">You haven't saved any drafts yet.</p>
                    <Link 
                    to="/mockdraft"
                    className="mt-4 inline-block bg-white text-black px-6 py-2 rounded"
                    >
                    Start a New Mock Draft
                    </Link>
                </div>
                )}
            </div>
      </PageTransition>
    </div>
  );
};

export default SavedDrafts;


