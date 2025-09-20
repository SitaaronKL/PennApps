"use client";

import { useState, useEffect } from 'react';

interface Match {
  id: string;
  userId: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export default function MatchesList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/matches');
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading your matches...</div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center text-white">
        <div className="text-6xl mb-4">💝</div>
        <h3 className="text-xl mb-2">No matches yet!</h3>
        <p className="text-gray-400 mb-6">
          Keep swiping to find people who share your interests.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid gap-4">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-gray-800 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-700 transition-colors"
          >
            <div className="w-16 h-16 bg-gray-600 rounded-full overflow-hidden flex-shrink-0">
              {match.avatar_url ? (
                <img
                  src={match.avatar_url}
                  alt={match.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                  👤
                </div>
              )}
            </div>
            
            <div className="flex-grow">
              <h3 className="text-white font-semibold text-lg">{match.name}</h3>
              <p className="text-gray-400 text-sm">
                Matched {new Date(match.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors">
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <p className="text-gray-400">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
        </p>
      </div>
    </div>
  );
}