"use client";

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import DiscoverInterface from '@/app/components/DiscoverInterface';
import ProfileCards from '@/app/components/ProfileCards';
import MatchesList from '@/app/components/MatchesList';

export default function Home() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'setup' | 'profile' | 'swipe' | 'matches'>('setup');
  const [hasProfile, setHasProfile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for existing profile when user signs in
  useEffect(() => {
    if (session?.user && mounted) {
      checkExistingProfile();
    }
  }, [session, mounted]);

  const checkExistingProfile = async () => {
    try {
      console.log('🔍 Checking for existing profile...');
      const response = await fetch('/api/profiles');
      if (response.ok) {
        const userData = await response.json();
        console.log('📂 Found existing profile:', userData);
        
        if (userData.core_traits) {
          // User has a complete profile, show it
          const existingProfile = {
            core_traits: userData.core_traits,
            potential_career_interests: userData.potential_career_interests,
            dream_date_profile: userData.dream_date_profile,
            ideal_date: userData.ideal_date,
            ideal_partner: userData.ideal_partner,
            unique_scoring_chart: userData.unique_scoring_chart,
            summary: userData.summary,
            core_personality_traits: userData.core_personality_traits,
            interests: userData.interests
          };
          
          setProfileData(existingProfile);
          setHasProfile(true);
          setCurrentView('profile');
          console.log('✅ Loaded existing profile from database!');
        }
      } else {
        console.log('📝 No existing profile found, will need to create one');
      }
    } catch (error) {
      console.log('📝 No existing profile, will create new one');
    }
  };

  const createProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Creating dating profile...');
      const res = await fetch('/api/youtube');
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      console.log('Full API response:', data);
      console.log('Structured data:', data.structured);
      console.log('Analysis data:', data.analysis);
      
      if (data.structured) {
        setProfileData(data.structured);
        setHasProfile(true);
        setCurrentView('profile');
        console.log('✅ Profile automatically saved to database!');
      } else if (data.analysis) {
        // Extract actual user data from the analysis text
        const analysis = data.analysis;
        console.log('Parsing user analysis:', analysis);
        
        // Parse the actual analysis to extract user-specific data
        const extractSection = (text: string, startMarker: string, endMarker?: string) => {
          const start = text.indexOf(startMarker);
          if (start === -1) return "";
          const content = text.substring(start + startMarker.length);
          const end = endMarker ? content.indexOf(endMarker) : content.length;
          return content.substring(0, end).trim();
        };
        
        const profileFromUserAnalysis = {
          core_traits: extractSection(analysis, "**Core Traits:**", "#### 2.") || extractSection(analysis, "Core Traits:", "\n\n"),
          potential_career_interests: extractSection(analysis, "potential career interests could include:", "#### 5.") || extractSection(analysis, "Career Interests", "\n\n"),
          dream_date_profile: extractSection(analysis, "**Dating Persona:**", "**Ideal Date:**") || extractSection(analysis, "Dating Persona:", "\n"),
          ideal_date: extractSection(analysis, "**Ideal Date:**", "**Ideal Partner:**") || extractSection(analysis, "Ideal Date:", "\n"),
          ideal_partner: extractSection(analysis, "**Ideal Partner:**", "#### 6.") || extractSection(analysis, "Ideal Partner:", "\n"),
          unique_scoring_chart: extractSection(analysis, "| Characteristic", "### Summary") || extractSection(analysis, "Scoring Chart", "\n\n"),
          summary: extractSection(analysis, "### Summary", "") || extractSection(analysis, "Summary", ""),
          core_personality_traits: extractSection(analysis, "Based on the subscriptions and liked videos,", "#### 2.") || "Creative and engaging",
          interests: extractSection(analysis, "subscriptions and liked videos", "suggests") || "Various interests based on YouTube activity"
        };
        
        // Clean up the extracted data
        Object.keys(profileFromUserAnalysis).forEach(key => {
          const typedKey = key as keyof typeof profileFromUserAnalysis;
          profileFromUserAnalysis[typedKey] = profileFromUserAnalysis[typedKey]
            .replace(/\*\*/g, '')
            .replace(/###/g, '')
            .replace(/####/g, '')
            .replace(/\n\n/g, ' ')
            .trim();
        });
        
        console.log('Extracted profile:', profileFromUserAnalysis);
        
        // Save to database
        try {
          console.log('📤 Attempting to save to database...');
          console.log('Profile data being sent:', profileFromUserAnalysis);
          
          const saveResponse = await fetch('/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileFromUserAnalysis)
          });
          
          console.log('📥 Save response status:', saveResponse.status);
          const responseText = await saveResponse.text();
          console.log('📥 Save response body:', responseText);
          
          if (saveResponse.ok) {
            console.log('✅ User profile saved to Supabase!');
            alert('✅ Profile saved to database!');
          } else {
            console.error('❌ Failed to save to database:', responseText);
            alert('❌ Failed to save to database: ' + responseText);
          }
        } catch (saveError) {
          console.error('❌ Error saving to database:', saveError);
          alert('❌ Error saving to database: ' + saveError);
        }
        
        setProfileData(profileFromUserAnalysis);
        setHasProfile(true);
        setCurrentView('profile');
        console.log('✅ Profile created from user analysis!');
      } else {
        throw new Error(`No profile data received. Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Failed to create profile:', error);
      setError(error instanceof Error ? error.message : String(error));
    }
    
    setIsLoading(false);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-gray-900"></div>;
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {!session ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Hinge 2</h1>
            <p className="text-xl text-gray-400 mb-8">
              Find people who share your actual personality.
            </p>
            <button 
              onClick={() => signIn('google')} 
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-colors duration-300"
            >
              Start Dating with Hinge 2
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Welcome, {session.user?.name}!</h1>
            <button 
              onClick={() => signOut()} 
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Sign Out
            </button>
          </div>

          {/* Tab Navigation */}
          {hasProfile && (
            <div className="flex justify-center mb-8">
              <div className="bg-gray-800 rounded-xl p-2 flex gap-2">
                <button
                  onClick={() => setCurrentView('profile')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    currentView === 'profile' 
                      ? 'bg-pink-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => setCurrentView('swipe')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    currentView === 'swipe' 
                      ? 'bg-pink-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Discover
                </button>
                <button
                  onClick={() => setCurrentView('matches')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    currentView === 'matches' 
                      ? 'bg-pink-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Matches
                </button>
                <button
                  onClick={() => setCurrentView('setup')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    currentView === 'setup' 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Refresh Profile
                </button>
              </div>
            </div>
          )}

          {/* Setup View */}
          {currentView === 'setup' && (
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Create Your Dating Profile</h2>
              <p className="text-lg text-gray-400 mb-8">
                We'll analyze your YouTube data to understand your personality and interests.
              </p>
              
              <button 
                onClick={createProfile} 
                disabled={isLoading}
                className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-500 text-white font-bold py-4 px-8 rounded-xl transition-colors duration-300"
              >
                {isLoading ? 'Creating Profile...' : 'Create My Dating Profile'}
              </button>

              {isLoading && (
                <div className="mt-8">
                  <p className="text-gray-400">Analyzing your YouTube data and saving to database...</p>
                </div>
              )}

              {error && (
                <div className="mt-8 p-4 bg-red-900 rounded-lg">
                  <p className="text-red-300">Error: {error}</p>
                </div>
              )}
            </div>
          )}

          {/* Profile View - Beautiful Cards */}
          {currentView === 'profile' && profileData && (
            <ProfileCards 
              profileData={profileData}
              userInfo={{
                name: session.user?.name || 'User',
                avatar_url: session.user?.image || undefined
              }}
              onContinue={() => setCurrentView('swipe')}
            />
          )}

          {/* Discover View */}
          {currentView === 'swipe' && (
            <div>
              <h2 className="text-3xl font-bold text-center mb-8">Discover Compatible Matches</h2>
              <DiscoverInterface />
            </div>
          )}

          {/* Matches View */}
          {currentView === 'matches' && (
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