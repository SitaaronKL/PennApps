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
        <div className="text-gray-900 text-xl">Loading your matches...</div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center text-gray-900">
        <div className="text-6xl mb-4">💝</div>
        <h3 className="text-xl mb-2">No matches yet!</h3>
        <p className="text-gray-600 mb-6">
          Keep swiping to find people who share your interests.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid gap-6">
        {matches.map((match) => (
          <div key={match.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Match Header */}
            <div className="p-6 flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden flex-shrink-0 border-3 border-pink-500">
                  {match.avatar_url ? (
                    <img
                      src={match.avatar_url}
                      alt={match.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-2xl">
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
                <h3 className="text-gray-900 font-bold text-xl flex items-center gap-2">
                  {match.name}
                  <span className="text-pink-500">🎉</span>
                </h3>
                <p className="text-gray-600 text-sm">
                  Matched on {new Date(match.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-pink-600 text-sm mt-1">
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
              <div style={{borderTop: '1px solid #f0f0f0', padding: '24px', backgroundColor: '#fafafa'}}>
                <h4 style={{color: '#333', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span>💭</span>
                  Conversation Starters
                </h4>
                <div style={{display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
                  {conversationStarters.map((starter) => (
                    <button
                      key={starter.id}
                      onClick={() => handleSendMessage(match.id, starter.text)}
                      style={{
                        textAlign: 'left',
                        padding: '16px',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef7f7';
                        e.currentTarget.style.borderColor = '#f8c8c8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#e0e0e0';
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'flex-start', gap: '12px'}}>
                        <span style={{fontSize: '20px'}}>
                          {starter.emoji}
                        </span>
                        <p style={{color: '#666', fontSize: '14px', lineHeight: '1.5', margin: 0}}>
                          {starter.text}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div style={{marginTop: '16px', padding: '16px', backgroundColor: '#fef7f7', borderRadius: '8px', border: '1px solid #f8c8c8'}}>
                  <p style={{color: '#d63384', fontSize: '14px', textAlign: 'center', margin: 0}}>
                    💡 Choose a conversation starter above, or write your own message!
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{textAlign: 'center', marginTop: '32px', padding: '24px', backgroundColor: '#fafafa', borderRadius: '12px', border: '1px solid #f0f0f0'}}>
        <div style={{fontSize: '48px', marginBottom: '16px'}}>
          {matches.length > 0 ? '🎉' : '💝'}
        </div>
        <p style={{color: '#333', fontSize: '18px', fontWeight: '600', marginBottom: '8px'}}>
          {matches.length > 0 
            ? `${matches.length} ${matches.length === 1 ? 'Match' : 'Matches'} Found!`
            : 'No Matches Yet'
          }
        </p>
        <p style={{color: '#666', fontSize: '16px', margin: 0}}>
          {matches.length > 0 
            ? 'Start meaningful conversations with your compatible matches above!'
            : 'Keep exploring the Discover section to find your perfect matches.'
          }
        </p>
      </div>
    </div>
  );
}