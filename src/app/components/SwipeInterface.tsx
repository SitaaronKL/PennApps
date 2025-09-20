"use client";

import { useState, useEffect } from 'react';
import SwipeCard from './SwipeCard';

interface Candidate {
  id: string;
  name: string;
  avatar_url?: string;
  similarity: number;
  shared_channels: string[];
}

export default function SwipeInterface() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<string[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [lastMatchName, setLastMatchName] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/deck?limit=10');
      const data = await response.json();
      setCandidates(data.candidates || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (candidateId: string, didLike: boolean) => {
    try {
      const response = await fetch('/api/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId: candidateId,
          didLike,
        }),
      });

      const result = await response.json();
      
      if (result.matched) {
        setMatches(prev => [...prev, candidateId]);
        setLastMatchName(candidates[currentIndex]?.name || 'Someone');
        setShowMatchModal(true);
      }

      // Move to next candidate
      setCurrentIndex(prev => prev + 1);

      // Load more candidates if running low
      if (currentIndex >= candidates.length - 3) {
        fetchCandidates();
      }
    } catch (error) {
      console.error('Error processing swipe:', error);
    }
  };

  const closeMatchModal = () => {
    setShowMatchModal(false);
  };

  if (isLoading && candidates.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading potential matches...</div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-white">
          <div className="text-xl mb-4">No more potential matches!</div>
          <button
            onClick={fetchCandidates}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const visibleCandidates = candidates.slice(currentIndex, currentIndex + 2);

  return (
    <div className="relative">
      <div className="flex justify-center items-center h-96 relative">
        <div className="relative">
          {visibleCandidates.map((candidate, index) => (
            <SwipeCard
              key={candidate.id}
              candidate={candidate}
              onSwipe={handleSwipe}
              isTop={index === 0}
            />
          ))}
        </div>
      </div>

      {/* Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center text-black max-w-sm">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">It's a Match!</h2>
            <p className="text-gray-600 mb-6">
              You and {lastMatchName} liked each other!
            </p>
            <button
              onClick={closeMatchModal}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg"
            >
              Continue Swiping
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 text-center text-white">
        <div className="text-lg">
          {matches.length} matches • {currentIndex} profiles viewed
        </div>
      </div>
    </div>
  );
}