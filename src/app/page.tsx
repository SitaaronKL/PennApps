'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

interface LikedVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
  };
}

interface LikedVideosData {
  likedVideos: LikedVideo[];
  totalResults: number;
}

export default function Home() {
  const { data: session } = useSession()
  const [inferredProfile, setInferredProfile] = useState<string | null>(null)
  const [likedVideosData, setLikedVideosData] = useState<LikedVideosData | null>(null) // eslint-disable-line @typescript-eslint/no-unused-vars

  const fetchInferredProfile = async () => { // Renamed function for clarity
    const res = await fetch('/api/youtube')
    const data = await res.json()
    setInferredProfile(data.inferredProfile)
    setLikedVideosData(null); // Clear liked videos data when fetching inferred profile
  }

  const fetchLikedVideos = async () => { // New function to fetch liked videos
    const res = await fetch('/api/youtube?type=likedVideos')
    const data = await res.json()
    setLikedVideosData(data)
    setInferredProfile(null); // Clear inferred profile data when fetching liked videos
    console.log("Liked Videos:", data); // Log to browser console
  }

  if (session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4">
          Sign out
        </button>
        <button onClick={fetchInferredProfile} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">
          Fetch Inferred Profile
        </button>
        <button onClick={fetchLikedVideos} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mt-4">
          Fetch Liked Videos
        </button>
        {inferredProfile && (
          <pre className="mt-4" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{inferredProfile}</pre>
        )}
        {/* No direct display for likedVideosData on frontend as per user request, but it's logged to console */}
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <button onClick={() => signIn('google')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Connect with Google
      </button>
    </main>
  )
}
