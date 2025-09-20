"use client";

import { useState, useEffect } from 'react';
import MatchPopup from './MatchPopup';

interface DiscoverUser {
  id: string;
  name: string;
  avatar_url?: string;
  core_traits: string;
  dream_date_profile: string;
  ideal_partner: string;
  interests: string;
  compatibility_score: number;
  compatibility_reasons: string[];
  personality_match: number;
  interests_match: number;
  dating_goals_match: number;
}

export default function DiscoverInterface() {
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchedUser, setMatchedUser] = useState<{ name: string; avatar_url?: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/discover');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (userId: string) => {
    try {
      const response = await fetch('/api/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId: userId,
          didLike: true,
        }),
      });

      const result = await response.json();
      
      if (result.matched) {
        const user = users.find(u => u.id === userId);
        if (user) {
          setMatchedUser({
            name: user.name,
            avatar_url: user.avatar_url
          });
          setShowMatchPopup(true);
        }
      } else {
        // Show a subtle success message
        const user = users.find(u => u.id === userId);
        console.log(`Like sent to ${user?.name}! 💖`);
      }
    } catch (error) {
      console.error('Error sending like:', error);
      alert('Failed to send like. Please try again.');
    }
  };

  const handleStartConversation = () => {
    // For now, just navigate to matches tab
    console.log('Starting conversation with', matchedUser?.name);
    // You can add navigation logic here later
  };

  const handleCloseMatchPopup = () => {
    setShowMatchPopup(false);
    setMatchedUser(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading potential matches...</div>
      </div>
    );
  }

  if (error) {
    const isProfileError = error.includes('create your profile');
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-white max-w-md">
          <div className="text-xl mb-4 text-red-400">
            {isProfileError ? '📝 Profile Required' : 'Error'}
          </div>
          <p className="text-gray-300 mb-6">{error}</p>
          {isProfileError ? (
            <p className="text-sm text-gray-400 mb-4">
              Go to the "Refresh Profile" tab to create your dating profile first!
            </p>
          ) : (
            <button
              onClick={fetchUsers}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-white">
          <div className="text-xl mb-4">No users available to discover!</div>
          <button
            onClick={fetchUsers}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-pink-500 transition-all duration-300"
          >
            {/* User Avatar & Name */}
            <div className="flex items-center mb-4">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-12 h-12 rounded-full mr-3"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-600 rounded-full mr-3 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
            </div>

            {/* Compatibility Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 font-medium">Compatibility</span>
                <span className={`text-xl font-bold ${getScoreColor(user.compatibility_score)}`}>
                  {user.compatibility_score}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getScoreBarColor(user.compatibility_score)}`}
                  style={{ width: `${user.compatibility_score}%` }}
                ></div>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Personality</span>
                <span className={getScoreColor(user.personality_match)}>
                  {user.personality_match}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Interests</span>
                <span className={getScoreColor(user.interests_match)}>
                  {user.interests_match}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Dating Goals</span>
                <span className={getScoreColor(user.dating_goals_match)}>
                  {user.dating_goals_match}%
                </span>
              </div>
            </div>

            {/* Core Traits */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Core Traits</h4>
              <p className="text-sm text-gray-400 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'}}>{user.core_traits}</p>
            </div>

            {/* Compatibility Reasons */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Why You Match</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                {user.compatibility_reasons.slice(0, 3).map((reason, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-pink-400 mr-2">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Dating Persona */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Dating Persona</h4>
              <p className="text-sm text-gray-400 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{user.dream_date_profile}</p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleLike(user.id)}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
            >
              💖 Like
            </button>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-8 text-center text-white">
        <div className="text-lg">
          {users.length} potential matches found
        </div>
        <button
          onClick={fetchUsers}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Refresh Matches
        </button>
      </div>

      {/* Match Popup */}
      {matchedUser && (
        <MatchPopup
          isOpen={showMatchPopup}
          matchedUser={matchedUser}
          onClose={handleCloseMatchPopup}
          onStartConversation={handleStartConversation}
        />
      )}
    </div>
  );
}