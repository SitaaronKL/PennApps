"use client";

import { useState } from 'react';

interface MatchPopupProps {
  isOpen: boolean;
  matchedUser: {
    name: string;
    avatar_url?: string;
  };
  onClose: () => void;
  onStartConversation: () => void;
}

export default function MatchPopup({ isOpen, matchedUser, onClose, onStartConversation }: MatchPopupProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  if (!isOpen) return null;

  const handleStartConversation = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onStartConversation();
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fadeIn">
      {/* Background Hearts Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-pink-400 opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              fontSize: `${Math.random() * 20 + 20}px`
            }}
          >
            💖
          </div>
        ))}
      </div>

      {/* Main Popup */}
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-3xl p-8 text-center max-w-md w-full mx-4 shadow-2xl border border-pink-500/20 animate-scaleIn">
        {/* Match Icon */}
        <div className="text-8xl mb-4 animate-bounce">
          🎉
        </div>

        {/* Match Text */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
          IT'S A MATCH!
        </h1>
        
        <p className="text-gray-300 text-lg mb-6">
          You and {matchedUser.name} liked each other!
        </p>

        {/* User Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {matchedUser.avatar_url ? (
              <img
                src={matchedUser.avatar_url}
                alt={matchedUser.name}
                className="w-24 h-24 rounded-full border-4 border-pink-500 shadow-lg animate-pulse"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full border-4 border-pink-500 shadow-lg flex items-center justify-center animate-pulse">
                <span className="text-2xl font-bold text-white">
                  {matchedUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Sparkle Effect */}
            <div className="absolute -top-2 -right-2 text-yellow-400 animate-spin">
              ✨
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleStartConversation}
            className={`w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
              isAnimating ? 'animate-pulse' : ''
            }`}
          >
            💬 Start Conversation
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
          >
            Keep Exploring
          </button>
        </div>

        {/* Fun Fact */}
        <div className="mt-6 p-3 bg-pink-500/10 rounded-lg border border-pink-500/20">
          <p className="text-sm text-pink-300">
            💕 Fun fact: You both swiped right! This is destiny calling.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.5);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}