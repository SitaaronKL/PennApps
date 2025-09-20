-- Simple dating app schema - ONLY users table needed for MVP

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
