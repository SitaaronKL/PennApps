"use client";

interface ProfileCardProps {
  profileData: any;
  userInfo: {
    name: string;
    avatar_url?: string;
  };
  onContinue: () => void;
  onSaveToDatabase: () => void;
}

export default function ProfileCard({ profileData, userInfo, onContinue, onSaveToDatabase }: ProfileCardProps) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header with photo */}
      <div className="relative h-48 bg-gradient-to-br from-pink-500 to-purple-600">
        <div className="absolute inset-0 flex items-center justify-center">
          {userInfo.avatar_url ? (
            <img
              src={userInfo.avatar_url}
              alt={userInfo.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-300 flex items-center justify-center text-4xl">
              👤
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-6">
          <h2 className="text-white text-2xl font-bold">{userInfo.name}</h2>
        </div>
      </div>

      {/* Profile content */}
      <div className="p-6 text-gray-800">
        {/* Core interests */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Your Vibe</h3>
          <div className="flex flex-wrap gap-2">
            {profileData.core_interests?.slice(0, 4).map((interest: string, index: number) => (
              <span
                key={index}
                className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Personality */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">✨ Your Energy</h3>
          <div className="flex flex-wrap gap-2">
            {profileData.personality_traits?.slice(0, 3).map((trait: string, index: number) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Dream Date */}
        {profileData.dream_date && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💕 Your Dream Date</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {profileData.dream_date.ideal_date}
              </p>
            </div>
          </div>
        )}

        {/* Ideal Partner */}
        {profileData.dream_date?.ideal_partner && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💫 Your Ideal Match</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {profileData.dream_date.ideal_partner}
              </p>
            </div>
          </div>
        )}

        {/* Content Preferences */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🎬 What You Love</h3>
          <div className="space-y-2">
            {profileData.content_preferences && Object.entries(profileData.content_preferences)
              .filter(([_, value]) => (value as number) > 0.5)
              .slice(0, 3)
              .map(([type, score], index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-gray-700">{type}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${(score as number) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onSaveToDatabase}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-lg"
          >
            Save to Database 💾
          </button>
          
          <button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            Start Finding Matches 💖
          </button>
        </div>
      </div>
    </div>
  );
}