"use client";

import { useState, useEffect } from 'react';

interface ProfileCardsProps {
  profileData: {
    core_traits: string;
    potential_career_interests: string;
    dream_date_profile: string;
    ideal_date: string;
    ideal_partner: string;
    unique_scoring_chart: string;
    summary: string;
    core_personality_traits: string;
    interests: string;
  };
  userInfo: {
    name: string;
    avatar_url?: string;
  };
  onContinue: () => void;
  onSignOut?: () => void;
  onProfileUpdate?: (updatedData: any) => void;
  onEditToggle?: () => void;
  isEditing?: boolean;
}

export default function ProfileCards({ profileData, userInfo, onContinue, onSignOut, onProfileUpdate, isEditing = false, onEditToggle }: ProfileCardsProps) {
  const [mounted, setMounted] = useState(false);
  const [editedData, setEditedData] = useState(profileData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setEditedData(profileData);
  }, [profileData]);

  const handleCancel = () => {
    // Reset to original data
    setEditedData(profileData);
    if (onEditToggle) {
      onEditToggle();
    }
  };

  const handleSaveChanges = async () => {
    console.log('🔄 Starting profile save...', editedData);
    setIsSaving(true);
    try {
      const response = await fetch('/api/profiles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData),
      });

      console.log('📡 API Response:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Profile updated successfully:', result);
        if (onProfileUpdate) {
          onProfileUpdate(editedData);
        }
        if (onEditToggle) {
          onEditToggle();
        }
        alert('✅ Profile updated successfully!');
      } else {
        const errorText = await response.text();
        console.error('❌ Update failed:', errorText);
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-100 rounded-3xl shadow-2xl p-8 mb-8 animate-pulse">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-300"></div>
            <div className="text-center md:text-left">
              <div className="h-8 w-48 bg-gray-300 rounded mb-2"></div>
              <div className="flex gap-2 justify-center md:justify-start">
                <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                <div className="h-6 w-24 bg-gray-300 rounded-full"></div>
                <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/30 shadow-xl">
                {userInfo.avatar_url ? (
                  <img src={userInfo.avatar_url} alt={userInfo.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">👤</div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">{userInfo.name}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">✨ AI Analyzed</span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">🎯 Personality Matched</span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">💖 Ready to Date</span>
                </div>
              </div>
            </div>
            
            {/* Edit/Save/Cancel Buttons */}
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <span>💾</span>
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="bg-white/10 hover:bg-white/20 disabled:bg-white/5 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <span>❌</span>
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={onEditToggle}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <span>✏️</span>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-white"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        
        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📝</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">About Me</h3>
                <p className="text-sm text-gray-500">Your personality summary</p>
              </div>
            </div>
            {isEditing ? (
              <textarea
                value={editedData.summary}
                onChange={(e) => handleFieldChange('summary', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-700 leading-relaxed resize-none"
                rows={3}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{editedData.summary}</p>
            )}
          </div>
        </div>

        {/* Core Traits Card */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">✨</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Core Traits</h3>
                <p className="text-sm text-gray-500">What makes you unique</p>
              </div>
            </div>
            {isEditing ? (
              <textarea
                value={editedData.core_traits}
                onChange={(e) => handleFieldChange('core_traits', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-700 leading-relaxed resize-none"
                rows={3}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{editedData.core_traits}</p>
            )}
          </div>
        </div>

        {/* Interests Card */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🎯</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Interests</h3>
                <p className="text-sm text-gray-500">Things you're passionate about</p>
              </div>
            </div>
            {isEditing ? (
              <textarea
                value={editedData.interests}
                onChange={(e) => handleFieldChange('interests', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-700 leading-relaxed resize-none"
                rows={3}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{editedData.interests}</p>
            )}
          </div>
        </div>

        {/* Career Interests Card */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">💼</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Career Goals</h3>
                <p className="text-sm text-gray-500">Professional aspirations</p>
              </div>
            </div>
            {isEditing ? (
              <textarea
                value={editedData.potential_career_interests}
                onChange={(e) => handleFieldChange('potential_career_interests', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-700 leading-relaxed resize-none"
                rows={3}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{editedData.potential_career_interests}</p>
            )}
          </div>
        </div>

        {/* Dating Persona Card */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">💕</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Dating Style</h3>
                <p className="text-sm text-gray-500">How you approach dating</p>
              </div>
            </div>
            {isEditing ? (
              <textarea
                value={editedData.dream_date_profile}
                onChange={(e) => handleFieldChange('dream_date_profile', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-700 leading-relaxed resize-none"
                rows={3}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{editedData.dream_date_profile}</p>
            )}
          </div>
        </div>

        {/* Ideal Date Card */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🌟</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Perfect Date</h3>
                <p className="text-sm text-gray-500">Your ideal romantic experience</p>
              </div>
            </div>
            {isEditing ? (
              <textarea
                value={editedData.ideal_date}
                onChange={(e) => handleFieldChange('ideal_date', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-700 leading-relaxed resize-none"
                rows={3}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{editedData.ideal_date}</p>
            )}
          </div>
        </div>

        {/* Ideal Partner Card */}
        <div className="lg:col-span-2 xl:col-span-1 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">💫</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Looking For</h3>
                <p className="text-sm text-gray-500">Your ideal partner</p>
              </div>
            </div>
            {isEditing ? (
              <textarea
                value={editedData.ideal_partner}
                onChange={(e) => handleFieldChange('ideal_partner', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-700 leading-relaxed resize-none"
                rows={3}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{editedData.ideal_partner}</p>
            )}
          </div>
        </div>

        {/* Personality Traits Card */}
        <div className="lg:col-span-2 xl:col-span-2 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🎭</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Personality Insights</h3>
                <p className="text-sm text-gray-500">Deep personality analysis</p>
              </div>
            </div>
            {isEditing ? (
              <textarea
                value={editedData.core_personality_traits}
                onChange={(e) => handleFieldChange('core_personality_traits', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-700 leading-relaxed resize-none"
                rows={3}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{editedData.core_personality_traits}</p>
            )}
          </div>
        </div>

        {/* Compatibility Chart Card */}
        <div className="lg:col-span-2 xl:col-span-3 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Compatibility Profile</h3>
                <p className="text-sm text-gray-500">How you match with others</p>
              </div>
            </div>
            {isEditing ? (
              <textarea
                value={editedData.unique_scoring_chart}
                onChange={(e) => handleFieldChange('unique_scoring_chart', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-700 leading-relaxed resize-none"
                rows={4}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{editedData.unique_scoring_chart}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Find Love?</h3>
          <p className="text-gray-600">Your AI-powered profile is complete. Let's find your perfect match!</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onContinue}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg flex items-center justify-center gap-2"
          >
            <span>🔍</span>
            Start Discovering Matches
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-8 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 text-lg flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            Refresh Profile
          </button>
        </div>
        
        <div className="mt-6 flex justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span>✨</span>
            AI-Powered Matching
          </span>
          <span className="flex items-center gap-1">
            <span>🎯</span>
            Personality-Based
          </span>
          <span className="flex items-center gap-1">
            <span>💖</span>
            Real Connections
          </span>
        </div>
      </div>

    </div>
  );
}