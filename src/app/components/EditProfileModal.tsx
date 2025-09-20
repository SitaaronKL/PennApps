"use client";

import { useState } from 'react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  onSave: (updatedData: any) => void;
}

export default function EditProfileModal({ isOpen, onClose, profileData, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState(profileData);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profiles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSave(formData);
        onClose();
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              About Me
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={3}
              placeholder="Write a brief summary about yourself..."
            />
          </div>

          {/* Core Traits */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Core Traits
            </label>
            <textarea
              value={formData.core_traits}
              onChange={(e) => handleChange('core_traits', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={3}
              placeholder="Describe your core personality traits..."
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Interests
            </label>
            <textarea
              value={formData.interests}
              onChange={(e) => handleChange('interests', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={3}
              placeholder="What are you passionate about?"
            />
          </div>

          {/* Career Interests */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Career Goals
            </label>
            <textarea
              value={formData.potential_career_interests}
              onChange={(e) => handleChange('potential_career_interests', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={3}
              placeholder="What are your professional aspirations?"
            />
          </div>

          {/* Dating Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dating Style
            </label>
            <textarea
              value={formData.dream_date_profile}
              onChange={(e) => handleChange('dream_date_profile', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={3}
              placeholder="How do you approach dating?"
            />
          </div>

          {/* Ideal Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Perfect Date
            </label>
            <textarea
              value={formData.ideal_date}
              onChange={(e) => handleChange('ideal_date', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={3}
              placeholder="Describe your ideal romantic experience..."
            />
          </div>

          {/* Ideal Partner */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Looking For
            </label>
            <textarea
              value={formData.ideal_partner}
              onChange={(e) => handleChange('ideal_partner', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={3}
              placeholder="What qualities do you look for in a partner?"
            />
          </div>

          {/* Personality Traits */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Personality Insights
            </label>
            <textarea
              value={formData.core_personality_traits}
              onChange={(e) => handleChange('core_personality_traits', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={3}
              placeholder="Deep personality analysis..."
            />
          </div>

          {/* Compatibility Chart */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Compatibility Profile
            </label>
            <textarea
              value={formData.unique_scoring_chart}
              onChange={(e) => handleChange('unique_scoring_chart', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={4}
              placeholder="How you match with others..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}