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
    return <div className="min-h-screen bg-white"></div>;
  }

  return (
    <main className="min-h-screen bg-white">
      {!session ? (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">💖</span>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium">About</a>
              <a href="#safety" className="text-gray-600 hover:text-gray-900 font-medium">Safety</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 font-medium">Contact</a>
            </nav>
            
            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => signIn('google')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Log In
              </button>
              <button 
                onClick={() => signIn('google')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300"
              >
                Sign Up
              </button>
            </div>
          </header>

          {/* Hero Section */}
          <section className="flex flex-col items-center justify-center px-8 py-20 text-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-32 h-32 bg-pink-100 rounded-full opacity-20"></div>
              <div className="absolute top-40 right-20 w-24 h-24 bg-purple-100 rounded-full opacity-30"></div>
              <div className="absolute bottom-40 left-20 w-20 h-20 bg-pink-200 rounded-full opacity-25"></div>
              <div className="absolute bottom-20 right-10 w-36 h-36 bg-purple-100 rounded-full opacity-20"></div>
            </div>
            
            <div className="relative z-10 max-w-4xl mx-auto">
              {/* Main Title */}
              <h1 className="text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  TasteMatch
                </span>
              </h1>
              
              {/* Subtitle */}
              <h2 className="text-4xl font-bold text-gray-800 mb-8">
                Find Your Perfect Match
              </h2>
              
              {/* Description */}
              <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto leading-relaxed">
                It's basically Hinge but with your actual personality via your Youtube usage.
              </p>
              
              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-12 mb-16">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white text-2xl">👥</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Matching</h3>
                  <p className="text-gray-600 text-center">Advanced AI analyzes your personality to find compatible matches</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white text-2xl">💬</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Safe Chat</h3>
                  <p className="text-gray-600 text-center">Secure messaging with verified profiles and safety features</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-purple-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white text-2xl">⭐</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Real Connections</h3>
                  <p className="text-gray-600 text-center">Quality over quantity - meaningful relationships that last</p>
                </div>
              </div>
              
              {/* CTA Button */}
              <button 
                onClick={() => signIn('google')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started
              </button>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 mt-16 text-gray-500">
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>100% Free to Join</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Safe & Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Real Profiles</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 flex">
          {/* Sidebar */}
          {hasProfile && (
            <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
              {/* Logo/Brand */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">💖</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">TasteMatch</span>
                </div>
              </div>

              {/* User Info */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    {mounted && session.user?.image ? (
                      <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-lg">👤</div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{mounted ? session.user?.name : 'Loading...'}</p>
                    <p className="text-sm text-gray-500">Premium Member</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4">
                <div className="space-y-2">
                  <button
                    onClick={() => setCurrentView('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      currentView === 'profile' 
                        ? 'bg-pink-50 text-pink-700 border-l-4 border-pink-500' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">👤</span>
                    <span className="font-medium">My Profile</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('swipe')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      currentView === 'swipe' 
                        ? 'bg-pink-50 text-pink-700 border-l-4 border-pink-500' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">🔍</span>
                    <span className="font-medium">Discover</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('matches')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      currentView === 'matches' 
                        ? 'bg-pink-50 text-pink-700 border-l-4 border-pink-500' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">💕</span>
                    <span className="font-medium">Matches</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('setup')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      currentView === 'setup' 
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">🔄</span>
                    <span className="font-medium">Refresh Profile</span>
                  </button>
                </div>
              </nav>

              {/* Sign Out */}
              <div className="p-4 border-t border-gray-200">
                <button 
                  onClick={() => signOut()} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                >
                  <span className="text-lg">🚪</span>
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {mounted && currentView === 'profile' && 'My Profile'}
                    {mounted && currentView === 'swipe' && 'Discover'}
                    {mounted && currentView === 'matches' && 'Matches'}
                    {mounted && currentView === 'setup' && 'Profile Setup'}
                    {!mounted && 'Loading...'}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {mounted && currentView === 'profile' && 'Your dating profile overview'}
                    {mounted && currentView === 'swipe' && 'Find your perfect match'}
                    {mounted && currentView === 'matches' && 'People who liked you back'}
                    {mounted && currentView === 'setup' && 'Create or refresh your profile'}
                    {!mounted && 'Please wait...'}
                  </p>
                </div>
                {!hasProfile && mounted && (
                  <button 
                    onClick={() => signOut()} 
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
              {/* Setup View */}
              {currentView === 'setup' && (
                <div className="p-8">
                  <div className="max-w-2xl mx-auto text-center">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <span className="text-white text-2xl">🎯</span>
                      </div>
                      <h2 className="text-3xl font-bold mb-4 text-gray-900">Create Your Dating Profile</h2>
                      <p className="text-lg text-gray-600 mb-8">
                        We'll analyze your YouTube data to understand your personality and interests.
                      </p>
                      
                      <button 
                        onClick={createProfile} 
                        disabled={isLoading}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        {isLoading ? 'Creating Profile...' : 'Create My Dating Profile'}
                      </button>

                      {isLoading && (
                        <div className="mt-8">
                          <div className="flex justify-center mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                          </div>
                          <p className="text-gray-600">Analyzing your YouTube data and saving to database...</p>
                        </div>
                      )}

                      {error && (
                        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700">Error: {error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile View */}
              {currentView === 'profile' && profileData && (
                <div className="p-8">
                  <ProfileCards 
                    profileData={profileData}
                    userInfo={{
                      name: session.user?.name || 'User',
                      avatar_url: session.user?.image || undefined
                    }}
                    onContinue={() => setCurrentView('swipe')}
                    onSignOut={() => signOut()}
                  />
                </div>
              )}

              {/* Discover View */}
              {currentView === 'swipe' && (
                <div className="p-8">
                  <DiscoverInterface />
                </div>
              )}

              {/* Matches View */}
              {currentView === 'matches' && (
                <div className="p-8">
                  <MatchesList />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}