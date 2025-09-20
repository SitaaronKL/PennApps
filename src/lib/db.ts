import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;

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
  last_synced: Date;
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