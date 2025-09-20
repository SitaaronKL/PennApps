# TasteMatch: AI-Powered Dating Platform

A next-generation dating platform that uses AI to create authentic personality profiles from YouTube data and provides intelligent compatibility matching between users.

## 🌟 Overview

TasteMatch revolutionizes online dating by analyzing users' YouTube consumption patterns to create detailed personality profiles, then using AI to calculate compatibility scores between potential matches. Instead of superficial swiping, users discover meaningful connections based on deep personality analysis and shared interests.

## 🚀 Key Features

### 1. **AI-Powered Profile Generation**
- **YouTube Data Analysis**: Analyzes user's subscriptions, liked videos, watch later, and playlists
- **OpenAI Integration**: Generates comprehensive personality profiles using GPT-4o-mini
- **Rich Profile Data**: Creates dating personas, ideal partner descriptions, and personality breakdowns
- **Automatic Refresh**: Users can regenerate profiles with updated YouTube data

### 2. **Smart Compatibility Scoring**
- **AI Compatibility Analysis**: Uses OpenAI to compare user traits and preferences
- **Multi-Dimensional Scoring**: Analyzes personality match, interests alignment, and dating goals
- **Detailed Compatibility Reasons**: Explains why users match with specific examples
- **Color-Coded Results**: Visual indicators for compatibility levels (80%+ green, 60%+ yellow, <60% red)

### 3. **Discover Interface**
- **All-User Display**: Shows all available users instead of algorithm-limited cards
- **Comprehensive Profiles**: Displays core traits, dating personas, and interests
- **Like Functionality**: Send likes with match detection
- **Responsive Design**: Grid layout optimized for desktop and mobile

### 4. **Traditional Features**
- **Google OAuth**: Secure authentication with YouTube API access
- **Profile Management**: View and refresh personal dating profiles
- **Match System**: Track mutual likes and matches
- **Chat Interface**: Communication between matched users

## 🛠 Technical Architecture

### **Frontend (Next.js 15)**
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **NextAuth.js** for authentication
- **Responsive components** with modern UI/UX

### **Backend APIs**
```
/api/youtube        - YouTube data analysis & profile generation
/api/discover       - AI compatibility scoring for all users
/api/profiles       - User profile CRUD operations
/api/swipe         - Like/dislike functionality
/api/matches       - Match management
/api/chat          - Messaging system
/api/embeddings    - Vector embeddings for future features
```

### **Database (Supabase)**
```sql
users (
  id uuid PRIMARY KEY,
  google_id text UNIQUE,
  email text,
  name text,
  avatar_url text,
  core_traits text,
  potential_career_interests text,
  dream_date_profile text,
  ideal_date text,
  ideal_partner text,
  unique_scoring_chart text,
  summary text,
  core_personality_traits text,
  interests text,
  created_at timestamptz
)
```

### **AI Integration**
- **OpenAI GPT-4o-mini**: Personality analysis and compatibility scoring
- **YouTube API v3**: Data fetching (subscriptions, liked videos, playlists)
- **Smart Text Extraction**: Parses AI responses into structured profile data
- **Fallback Systems**: Robust error handling with meaningful default content

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Google Cloud Console project
- OpenAI API account
- Supabase project

### Environment Variables
Create `.env.local` with:

```bash
# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth (YouTube API access required)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OpenAI API
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Supabase Database
SUPABASE_PROJECT_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd PennApps
npm install
```

2. **Set up Google OAuth**:
   - Create project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable YouTube Data API v3
   - Create OAuth 2.0 credentials
   - Add redirect URI: `http://localhost:3000/api/auth/callback/google`

3. **Set up Supabase**:
```bash
# Run the database schema
psql -f database.sql
```

4. **Start development server**:
```bash
npm run dev
```

5. **Populate test data** (optional):
```sql
-- Run fake_profiles.sql in Supabase SQL editor
-- This adds 15 diverse test user profiles
```

## 📱 User Journey

### 1. **Authentication & Profile Creation**
1. User signs in with Google (YouTube access required)
2. System analyzes YouTube data (subscriptions, likes, playlists)
3. OpenAI generates comprehensive personality profile
4. Profile saved to database with all structured fields

### 2. **Discover Compatible Matches**
1. User navigates to "Discover" tab
2. System fetches all available users from database
3. AI analyzes compatibility between current user and each potential match
4. Users displayed in grid with compatibility scores and detailed breakdowns

### 3. **Compatibility Analysis Process**
```
For each potential match:
├── Compare core personality traits
├── Analyze dating preferences alignment
├── Evaluate shared interests and values
├── Generate specific compatibility reasons
└── Calculate overall compatibility score (0-100%)
```

### 4. **Interaction & Matching**
1. User reviews compatibility explanations
2. Sends likes to interesting matches
3. System detects mutual likes (matches)
4. Matched users can begin conversations

## 🎯 AI Components Deep Dive

### **Profile Generation Pipeline**
```
YouTube Data → OpenAI Analysis → Text Parsing → Structured Data → Database
     ↓              ↓              ↓              ↓             ↓
Subscriptions   Personality    Extract        Profile       Supabase
Liked Videos    Analysis       Sections       Object        Storage
Playlists       Career Interests Dating Persona
Watch Later     Ideal Partner   Summary
```

### **Compatibility Scoring Algorithm**
```javascript
// AI analyzes both users and returns:
{
  score: 85,                    // Overall compatibility (0-100)
  reasons: [                    // Specific compatibility factors
    "Shared love of creativity",
    "Similar humor styles", 
    "Compatible energy levels"
  ],
  personality_match: 90,        // Personality alignment
  interests_match: 80,          // Shared interests
  dating_goals_match: 85        // Dating preference compatibility
}
```

### **Profile Data Structure**
```javascript
{
  core_traits: "Personality description (2-3 sentences)",
  potential_career_interests: "Career fields based on content",
  dream_date_profile: "Dating persona and approach",
  ideal_date: "Specific date scenario preferences", 
  ideal_partner: "Detailed partner preferences",
  unique_scoring_chart: "Personality breakdown with percentages",
  summary: "Overall profile summary",
  core_personality_traits: "Key trait keywords",
  interests: "Hobby and interest categories"
}
```

## 🔄 Recent Development Progress

### **Phase 1: Core Dating Platform**
- ✅ Google OAuth with YouTube API integration
- ✅ Basic profile creation from YouTube data
- ✅ User interface with profile cards
- ✅ Match and swipe functionality

### **Phase 2: AI Enhancement**
- ✅ OpenAI integration for personality analysis
- ✅ Structured data extraction from AI responses
- ✅ Database schema optimization
- ✅ Profile refresh functionality

### **Phase 3: Discover Feature** (Recently Completed)
- ✅ Created `/api/discover` endpoint
- ✅ AI-powered compatibility scoring between all users
- ✅ New `DiscoverInterface` component with grid layout
- ✅ Real-time compatibility analysis with detailed breakdowns
- ✅ Visual compatibility indicators and explanations
- ✅ Like functionality with match detection

### **Phase 4: Polish & Debugging** (Recently Completed)
- ✅ Improved error handling and fallback systems
- ✅ Enhanced AI prompts for better profile generation
- ✅ Database refresh functionality for profile updates
- ✅ Comprehensive logging for debugging AI responses
- ✅ Test data generation (15 diverse fake profiles)

### **Phase 5: UI/UX Redesign** (Current)
- ✅ Complete landing page redesign with professional, minimalistic design
- ✅ Brand transformation from "Hinge 2" to "TasteMatch"
- ✅ Modern white-background design inspired by premium dating apps
- ✅ Simplified one-page landing experience without scrolling
- ✅ Fixed navigation header with clean typography
- ✅ Professional sidebar navigation for authenticated users
- ✅ Redesigned profile cards with white backgrounds and gradient headers
- ✅ Fixed hydration errors and improved SSR compatibility
- ✅ Added sign out functionality to profile section

## 🎨 UI/UX Features

### **Profile Cards**
- Beautiful card-based layout
- Personality trait visualization
- Dating persona highlights
- Ideal partner descriptions
- Interactive elements

### **Discover Grid**
- Responsive grid layout (1-3 columns based on screen size)
- Compatibility score bars with color coding
- Detailed breakdown of personality/interests/goals alignment
- Hover effects and smooth transitions
- Like buttons with immediate feedback

### **Visual Design**
- **Modern minimalistic design** with clean white backgrounds
- **Professional color scheme** using gray-900 and pink-500 accents
- **Tinder-level polish** with premium app aesthetics
- **Responsive sidebar navigation** instead of traditional tabs
- **Gradient headers** for profile sections with subtle animations
- **Consistent typography** with proper hierarchy and spacing
- **Mobile-responsive design** that works across all devices
- **Smooth hover effects** and micro-interactions
- **Card-based layouts** with subtle shadows and rounded corners

## 🚀 Future Enhancements

### **Planned Features**
- [ ] Advanced filtering (age, location, interests)
- [ ] Video profile introductions
- [ ] AI conversation starters
- [ ] Compatibility trend analysis
- [ ] Group activity suggestions
- [ ] Real-time messaging improvements

### **Technical Improvements**
- [ ] Vector similarity search for faster matching
- [ ] Caching layer for compatibility scores
- [ ] Advanced analytics dashboard
- [ ] Performance optimizations
- [ ] Enhanced security measures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT-4o-mini API
- **Google** for YouTube Data API v3
- **Supabase** for database infrastructure
- **Next.js** team for the excellent framework
- **Vercel** for deployment platform

---

**Built with ❤️ for PennApps Hackathon**

*TasteMatch represents the future of authentic online dating - where meaningful connections are discovered through deep personality understanding rather than superficial judgments.*