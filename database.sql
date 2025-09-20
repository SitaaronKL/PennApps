-- === Extensions ===
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists vector;     -- pgvector

-- === Users ===
create table if not exists app_users (
  id         uuid primary key default gen_random_uuid(),
  google_id  text unique not null,
  email      text,
  name       text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- === Taste + Vector (Gemini-only; pick 768 or 1536 to match your embedding) ===
create table if not exists user_profiles (
  user_id      uuid primary key references app_users(id) on delete cascade,
  pref_vec     vector(768),                -- or vector(1536) if you embed 1536-dim
  subs         text[] not null default '{}',   -- store channel titles (or ids) as strings
  likes        text[] not null default '{}',   -- store liked video titles (or ids) as strings
  subs_count   int not null default 0,
  likes_count  int not null default 0,
  shorts_ratio real,                           -- optional heuristic
  last_synced  timestamptz not null default now()
);

create index if not exists user_profiles_pref_vec_hnsw
  on user_profiles using hnsw (pref_vec vector_cosine_ops);

-- === Swipes / Matches / Blocks ===
create table if not exists swipes (
  user_id    uuid not null references app_users(id) on delete cascade,
  target_id  uuid not null references app_users(id) on delete cascade,
  did_like   boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, target_id),
  check (user_id <> target_id)
);
create or replace function set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists swipes_updated_at on swipes;
create trigger swipes_updated_at before update on swipes
for each row execute procedure set_updated_at();

create table if not exists blocks (
  user_id    uuid not null references app_users(id) on delete cascade,
  blocked_id uuid not null references app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, blocked_id),
  check (user_id <> blocked_id)
);

create table if not exists matches (
  id        uuid primary key default gen_random_uuid(),
  user_a    uuid not null references app_users(id) on delete cascade,
  user_b    uuid not null references app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);

-- === Atomic yes/no + auto-match when mutual yes ===
create or replace function like_and_maybe_match(p_user uuid, p_target uuid, p_like boolean)
returns table (matched boolean, match_id uuid)
language plpgsql as $$
declare a uuid; b uuid;
begin
  insert into swipes(user_id, target_id, did_like)
  values (p_user, p_target, p_like)
  on conflict (user_id, target_id) do update
    set did_like = excluded.did_like, updated_at = now();

  matched := false; match_id := null;

  if p_like then
    if exists (
      select 1 from swipes s
      where s.user_id = p_target and s.target_id = p_user and s.did_like = true
    ) then
      a := least(p_user, p_target); b := greatest(p_user, p_target);
      insert into matches(user_a, user_b) values (a, b)
      on conflict (user_a, user_b) do nothing
      returning id into match_id;

      if match_id is null then
        select id into match_id from matches where user_a = a and user_b = b;
      end if;
      matched := true;
    end if;
  end if;

  return next;
end $$;

-- === Candidate deck: vector NN, excluding seen/matched/blocked, with shared subs preview ===
create or replace function deck_candidates(p_user uuid, p_limit int default 20, p_offset int default 0)
returns table (candidate_id uuid, similarity real, shared_channels text[])
language sql as $$
  with me as (
    select pref_vec, subs from user_profiles where user_id = p_user
  )
  select
    u2.user_id as candidate_id,
    (1 - (u2.pref_vec <=> (select pref_vec from me)))::real as similarity,
    coalesce(
      (
        select array(
          select distinct s
          from unnest((select subs from me)) s
          join unnest(u2.subs) t on t = s
          limit 3
        )
      ),
      '{}'
    ) as shared_channels
  from user_profiles u2
  where u2.user_id <> p_user
    and exists (select 1 from me)
    and not exists (select 1 from swipes s where s.user_id = p_user and s.target_id = u2.user_id)
    and not exists (select 1 from matches m where (m.user_a = least(p_user, u2.user_id) and m.user_b = greatest(p_user, u2.user_id)))
    and not exists (select 1 from blocks b where (b.user_id = p_user and b.blocked_id = u2.user_id)
                                     or (b.user_id = u2.user_id and b.blocked_id = p_user))
  order by u2.pref_vec <=> (select pref_vec from me)
  limit p_limit offset p_offset;
$$;
