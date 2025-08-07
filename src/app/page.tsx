"use client"

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import ChatInterface from '@/app/components/ChatInterface';

interface Email {
  id: string;
  subject: string;
  from: string;
  snippet: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
          <h1 className="text-4xl font-bold text-center mb-4">Discover Your Digital Fingerprint</h1>
          <p className="text-lg text-gray-400 text-center mb-8">
            Connect your Google account to uncover your interests and personality traits based on your YouTube activity.
          </p>
          <button onClick={() => signIn('google')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 ease-in-out">
            Connect your Google account
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Welcome, {session.user?.name}</h1>
            <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ease-in-out">
              Sign Out
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-center mb-4">Discover Your Digital Fingerprint</h2>
            <p className="text-lg text-gray-400 text-center mb-8">
              Uncover your interests and personality traits based on your YouTube activity. Our AI analyzes your liked videos and subscriptions to create a unique profile of who you are.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={handleAnalysis} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 ease-in-out" disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Reveal My Profile'}
              </button>
            </div>
          </div>

          {isLoading && !analysis && (
            <div className="w-full max-w-2xl mx-auto p-8 mt-8 text-center">
              <p className="text-lg text-gray-400">Analyzing... this may take a moment.</p>
            </div>
          )}

          {analysis && (
            <div className="w-full mx-auto p-8 mt-8 bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold text-center mb-6">Your Digital Fingerprint</h2>
              <p className="text-left whitespace-pre-wrap text-gray-300">{analysis}</p>
            </div>
          )}

          {analysis && (
            <ChatInterface />
          )}
        </div>
      )}
    </main>
  );
}
