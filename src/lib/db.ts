import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_PROJECT_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// For backwards compatibility with pg queries
const db = {
  query: async (text: string, params?: any[]) => {
    console.log('Executing query:', text, 'with params:', params);
    throw new Error('Use Supabase client instead of raw SQL queries');
  }
};

export default db;

export interface User {
  id: string;
  google_id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  created_at: Date;
}

export interface UserProfile {
  user_id: string;
  pref_vec?: number[];
  subs: string[];
  likes: string[];
  subs_count: number;
  likes_count: number;
  shorts_ratio?: number;
  profile_data?: ProfileData;
  interests: string[];
  personality: string[];
  content_types: string[];
  niches: string[];
  last_synced: Date;
}

export interface ProfileData {
  core_interests: string[];
  personality_traits: string[];
  content_preferences: {
    educational: number;
    entertainment: number;
    gaming: number;
    music: number;
    tech: number;
    lifestyle: number;
  };
  viewing_patterns: {
    binge_watches: boolean;
    discovers_new: boolean;
    follows_trends: boolean;
  };
  social_aspects: {
    shares_content: boolean;
    comments_actively: boolean;
    builds_playlists: boolean;
  };
  dream_date?: {
    persona: string;
    ideal_date: string;
    ideal_partner: string;
  };
  compatibility_factors: string[];
}

export interface Swipe {
  user_id: string;
  target_id: string;
  did_like: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Match {
  id: string;
  user_a: string;
  user_b: string;
  created_at: Date;
}

export interface Candidate {
  candidate_id: string;
  similarity: number;
  shared_channels: string[];
}