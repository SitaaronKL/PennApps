"use client";

import { useState } from 'react';

interface Candidate {
  id: string;
  name: string;
  avatar_url?: string;
  similarity: number;
  shared_channels: string[];
}

interface SwipeCardProps {
  candidate: Candidate;
  onSwipe: (candidateId: string, didLike: boolean) => void;
  isTop: boolean;
}

export default function SwipeCard({ candidate, onSwipe, isTop }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isTop) return;
    setDragOffset({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(candidate.id, dragOffset.x > 0);
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  const handleLike = () => {
    onSwipe(candidate.id, true);
  };

  const handlePass = () => {
    onSwipe(candidate.id, false);
  };

  const cardRotation = isTop ? dragOffset.x / 10 : 0;
  const cardOpacity = Math.abs(dragOffset.x) > 50 ? 0.8 : 1;

  return (
    <div
      className={`absolute w-80 h-96 bg-white rounded-xl shadow-lg cursor-grab ${
        isTop ? 'z-20' : 'z-10'
      } ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{
        transform: `translate(${isTop ? dragOffset.x : 0}px, ${isTop ? dragOffset.y : 0}px) rotate(${cardRotation}deg)`,
        opacity: cardOpacity,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Like/Pass indicators */}
      {isTop && Math.abs(dragOffset.x) > 50 && (
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
          <div
            className={`bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-lg ${
              dragOffset.x > 0 ? 'opacity-100' : 'opacity-0'
            } transition-opacity`}
          >
            LIKE
          </div>
          <div
            className={`bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg ${
              dragOffset.x < 0 ? 'opacity-100' : 'opacity-0'
            } transition-opacity`}
          >
            PASS
          </div>
        </div>
      )}

      {/* Profile Image */}
      <div className="w-full h-72 bg-gray-200 rounded-t-xl overflow-hidden">
        {candidate.avatar_url ? (
          <img
            src={candidate.avatar_url}
            alt={candidate.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-6xl">
            👤
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="p-4 text-black">
        <h3 className="text-2xl font-bold mb-2">{candidate.name}</h3>
        
        {/* Shared Channels Badge */}
        {candidate.shared_channels.length > 0 && (
          <div className="mb-4">
            <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
              You both subscribe to {candidate.shared_channels[0]}
              {candidate.shared_channels.length > 1 && ` +${candidate.shared_channels.length - 1} more`}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {isTop && (
          <div className="flex gap-4 justify-center">
            <button
              onClick={handlePass}
              className="bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors"
            >
              ✕
            </button>
            <button
              onClick={handleLike}
              className="bg-green-500 hover:bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors"
            >
              ♡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}