-- Dating app schema with likes and matches

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  google_id text unique not null,
  email text,
  name text,
  avatar_url text,
  
  -- Profile data
  core_traits text,
  potential_career_interests text,
  dream_date_profile text,
  ideal_date text,
  ideal_partner text,
  unique_scoring_chart text,
  summary text,
  core_personality_traits text,
  interests text,
  
  created_at timestamptz not null default now()
);

-- Drop existing tables if they exist (to avoid conflicts)
drop table if exists matches cascade;
drop table if exists likes cascade;

-- Likes table to track who liked whom
create table likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  target_id uuid,
  liked boolean not null default true,
  created_at timestamptz not null default now(),
  
  -- Ensure one like record per user pair
  unique(user_id, target_id)
);

-- Matches table to track mutual likes
create table matches (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid,
  user2_id uuid,
  created_at timestamptz not null default now(),
  
  -- Ensure no duplicate matches
  unique(user1_id, user2_id)
);

-- Indexes for performance
create index idx_likes_user_id on likes(user_id);
create index idx_likes_target_id on likes(target_id);
create index idx_matches_user1_id on matches(user1_id);
create index idx_matches_user2_id on matches(user2_id);
