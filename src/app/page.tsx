"use client"
import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysis = async () => {
    setIsLoading(true);
    setAnalysis(null);
    try {
      const res = await fetch('/api/youtube');
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setAnalysis('Failed to fetch analysis.');
    }
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {!session ? (
        <button onClick={() => signIn('google')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Connect your Google account
        </button>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome, {session.user?.name}</h1>
          <button onClick={handleAnalysis} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'See who you are?'}
          </button>
          <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4">
            Sign out
          </button>
          {analysis && (
            <div className="mt-8 p-4 border rounded-lg shadow-md bg-black text-white">
              <h2 className="text-xl font-semibold mb-2">Analysis Result</h2>
              <p className="text-left whitespace-pre-wrap">{analysis}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}