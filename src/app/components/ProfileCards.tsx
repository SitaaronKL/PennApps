"use client";

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
}

export default function ProfileCards({ profileData, userInfo, onContinue }: ProfileCardsProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
          {userInfo.avatar_url ? (
            <img src={userInfo.avatar_url} alt={userInfo.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-2xl">👤</div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{userInfo.name}</h2>
        <p className="text-gray-600">Profile Created ✅ Saved to Database</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Summary Card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-3">📝 Summary</h3>
          <p className="text-sm leading-relaxed">{profileData.summary}</p>
        </div>

        {/* Core Traits Card */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-3">✨ Core Traits</h3>
          <p className="text-sm leading-relaxed">{profileData.core_traits}</p>
        </div>

        {/* Interests Card */}
        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-3">🎯 Interests</h3>
          <p className="text-sm leading-relaxed">{profileData.interests}</p>
        </div>

        {/* Career Interests Card */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-3">💼 Career Interests</h3>
          <p className="text-sm leading-relaxed">{profileData.potential_career_interests}</p>
        </div>

        {/* Dream Date Profile Card */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-3">💕 Dating Persona</h3>
          <p className="text-sm leading-relaxed">{profileData.dream_date_profile}</p>
        </div>

        {/* Ideal Date Card */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-3">🌟 Ideal Date</h3>
          <p className="text-sm leading-relaxed">{profileData.ideal_date}</p>
        </div>

        {/* Ideal Partner Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-3">💫 Ideal Partner</h3>
          <p className="text-sm leading-relaxed">{profileData.ideal_partner}</p>
        </div>

        {/* Personality Traits Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-3">🎭 Personality</h3>
          <p className="text-sm leading-relaxed">{profileData.core_personality_traits}</p>
        </div>

        {/* Unique Scoring Chart Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-3">📊 Unique Scoring Chart</h3>
          <p className="text-sm leading-relaxed">{profileData.unique_scoring_chart}</p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="text-center">
        <button
          onClick={onContinue}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-8 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg text-lg"
        >
          Start Finding Matches 💖
        </button>
      </div>
    </div>
  );
}