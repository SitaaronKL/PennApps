"use client";

import { useState, useEffect } from 'react';

interface Match {
  id: string;
  userId: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

interface ConversationStarter {
  id: string;
  text: string;
  emoji: string;
}

export default function MatchesList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [conversationStarters] = useState<ConversationStarter[]>([
    { id: '1', text: "What's the most interesting thing that happened to you this week?", emoji: '✨' },
    { id: '2', text: "If you could have dinner with anyone (dead or alive), who would it be?", emoji: '🍽️' },
    { id: '3', text: "What's your go-to karaoke song?", emoji: '🎤' },
    { id: '4', text: "Coffee or tea? And what's your favorite spot to get it?", emoji: '☕' },
    { id: '5', text: "What's something you've learned recently that blew your mind?", emoji: '🤯' },
    { id: '6', text: "If you could instantly become an expert in anything, what would it be?", emoji: '🎯' },
  ]);

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

  const handleStartConversation = (matchId: string) => {
    setSelectedMatch(selectedMatch === matchId ? null : matchId);
  };

  const handleSendMessage = (matchId: string, message: string) => {
    // For now, just log the message. Later you can implement actual messaging
    const match = matches.find(m => m.id === matchId);
    console.log(`Sending message to ${match?.name}: ${message}`);
    
    // Close the conversation starter panel
    setSelectedMatch(null);
    
    // Show success feedback
    alert(`Message sent to ${match?.name}! 💬`);
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
    <div className="max-w-4xl mx-auto">
      <div className="grid gap-6">
        {matches.map((match) => (
          <div key={match.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {/* Match Header */}
            <div className="p-6 flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-600 rounded-full overflow-hidden flex-shrink-0 border-3 border-pink-500">
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
                {/* Match indicator */}
                <div className="absolute -top-1 -right-1 bg-pink-500 rounded-full p-1">
                  💖
                </div>
              </div>
              
              <div className="flex-grow">
                <h3 className="text-white font-bold text-xl flex items-center gap-2">
                  {match.name}
                  <span className="text-pink-400">🎉</span>
                </h3>
                <p className="text-gray-400 text-sm">
                  Matched on {new Date(match.created_at).toLocaleDateString()}
                </p>
                <p className="text-pink-300 text-sm mt-1">
                  ✨ You both liked each other!
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleStartConversation(match.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    selectedMatch === match.id
                      ? 'bg-pink-600 text-white'
                      : 'bg-pink-500 hover:bg-pink-600 text-white'
                  }`}
                >
                  {selectedMatch === match.id ? '📝 Hide Starters' : '💬 Start Chat'}
                </button>
              </div>
            </div>

            {/* Conversation Starters */}
            {selectedMatch === match.id && (
              <div className="border-t border-gray-700 p-6 bg-gray-900">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>💭</span>
                  Conversation Starters
                </h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {conversationStarters.map((starter) => (
                    <button
                      key={starter.id}
                      onClick={() => handleSendMessage(match.id, starter.text)}
                      className="text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 hover:border-pink-500 transition-all duration-300 group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl group-hover:scale-110 transition-transform">
                          {starter.emoji}
                        </span>
                        <p className="text-gray-300 group-hover:text-white text-sm leading-relaxed">
                          {starter.text}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
                  <p className="text-pink-300 text-sm text-center">
                    💡 Choose a conversation starter above, or write your own message!
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center mt-8 p-6 bg-gray-800 rounded-xl border border-gray-700">
        <div className="text-6xl mb-4">
          {matches.length > 0 ? '🎉' : '💝'}
        </div>
        <p className="text-white text-lg font-semibold mb-2">
          {matches.length > 0 
            ? `${matches.length} ${matches.length === 1 ? 'Match' : 'Matches'} Found!`
            : 'No Matches Yet'
          }
        </p>
        <p className="text-gray-400">
          {matches.length > 0 
            ? 'Start meaningful conversations with your compatible matches above!'
            : 'Keep exploring the Discover section to find your perfect matches.'
          }
        </p>
      </div>
    </div>
  );
}