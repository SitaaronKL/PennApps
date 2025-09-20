"use client"

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import ChatInterface from '@/app/components/ChatInterface';
import SwipeInterface from '@/app/components/SwipeInterface';
import MatchesList from '@/app/components/MatchesList';



export default function Home() {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'profile' | 'swipe' | 'matches'>('profile');

  const handleAnalysis = async () => {
    setIsLoading(true);
    setAnalysis(null);
    try {
      // Now, perform the analysis (we can adapt this part later)
      const res = await fetch('/api/youtube');
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error fetching or saving data:', error);
      setAnalysis('Failed to process and analyze data.');
    }
    setIsLoading(false);
  };

  

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-gray-900 text-white">
      {!session ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-center mb-4">Hinge 2</h1>
          <p className="text-lg text-gray-400 text-center mb-8">
            Find people who share your actual personality.
          </p>
          <button onClick={() => signIn('google')} className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 ease-in-out">
            Start Dating with Hinge 2
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Welcome, {session.user?.name}</h1>
            <div className="flex gap-4">
              <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ease-in-out">
                Sign Out
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800 rounded-lg p-2 flex gap-2">
              <button
                onClick={() => setCurrentView('profile')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'profile' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setCurrentView('swipe')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'swipe' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                disabled={!analysis}
              >
                Discover
              </button>
              <button
                onClick={() => setCurrentView('matches')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'matches' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                disabled={!analysis}
              >
                Matches
              </button>
            </div>
          </div>
          {/* Profile View */}
          {currentView === 'profile' && (
            <>
              <div className="text-center">
                <h2 className="text-4xl font-bold text-center mb-4">Setup Your Dating Profile</h2>
                <p className="text-lg text-gray-400 text-center mb-8">
                  We'll analyze your YouTube subscriptions and likes to find people with similar interests.
                </p>
                <div className="flex justify-center gap-4">
                  <button onClick={handleAnalysis} className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 ease-in-out" disabled={isLoading}>
                    {isLoading ? 'Setting up...' : 'Create My Dating Profile'}
                  </button>
                </div>
              </div>

              {isLoading && !analysis && (
                <div className="w-full max-w-2xl mx-auto p-8 mt-8 text-center">
                  <p className="text-lg text-gray-400">Analyzing... this may take a moment.</p>
                </div>
              )}

              {analysis && (
                <div className="w-full mx-auto p-8 mt-8 bg-gray-800 rounded-lg shadow-lg text-center">
                  <h2 className="text-3xl font-bold mb-6">Profile Created! 🎉</h2>
                  <p className="text-gray-300 mb-6">Your YouTube data has been analyzed. Ready to find your matches!</p>
                  <button 
                    onClick={() => setCurrentView('swipe')}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg"
                  >
                    Start Swiping
                  </button>
                </div>
              )}
            </>
          )}

          {/* Swipe/Discover View */}
          {currentView === 'swipe' && analysis && (
            <div>
              <h2 className="text-3xl font-bold text-center mb-8">Discover People Like You</h2>
              <SwipeInterface />
            </div>
          )}

          {/* Matches View */}
          {currentView === 'matches' && analysis && (
            <div>
              <h2 className="text-3xl font-bold text-center mb-8">Your Matches</h2>
              <MatchesList />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
