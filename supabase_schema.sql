-- ==============================================================================
-- Clash of Code - Supabase Database Schema
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. USER CREDENTIALS & PROFILES TABLE (Simple Email + Pwd Auth & Stats)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null,
  player_name text not null default 'NeoPilot',
  level integer not null default 0,
  xp integer not null default 0,
  max_xp integer not null default 100,
  code_points integer not null default 0,
  clan text default null,
  ranked_wins integer not null default 0,
  ranked_losses integer not null default 0,
  clan_war_contributions integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Indexes for fast email login and player lookups
create index if not exists idx_users_email on public.users (email);
create index if not exists idx_users_player_name on public.users (player_name);

-- Direct access without RLS restrictions
alter table public.users disable row level security;


-- 2. RANKED DUEL ROOMS (1v1 Territory Conquest)
create table if not exists public.ranked_rooms (
  id uuid primary key default gen_random_uuid(),
  room_id text unique not null,
  host_id text not null,
  host_name text not null default 'Player 1',
  guest_id text,
  guest_name text,
  territories jsonb not null default '[]'::jsonb,
  blue_score integer not null default 1,
  red_score integer not null default 1,
  status text not null default 'waiting' check (status in ('waiting', 'active', 'completed')),
  winner text,
  version integer not null default 1,
  last_move_by text,
  last_conquered_sector integer,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Indexes for fast room_id lookups
create index if not exists idx_ranked_rooms_room_id on public.ranked_rooms (room_id);
create index if not exists idx_ranked_rooms_status on public.ranked_rooms (status);


-- 3. CLAN / GUILD WAR ROOMS (50-Territory Weekly Syndicate Raid)
create table if not exists public.clan_war_rooms (
  id uuid primary key default gen_random_uuid(),
  room_id text unique not null,
  home_clan text not null default 'BitKnights',
  rival_clan text not null default 'CyberDragons',
  territories jsonb not null default '[]'::jsonb,
  home_score integer not null default 1,
  rival_score integer not null default 1,
  member_attempts jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'completed')),
  winner text,
  version integer not null default 1,
  last_move_by text,
  last_conquered_sector integer,
  start_time timestamptz not null default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Indexes for fast clan war lookups
create index if not exists idx_clan_war_rooms_room_id on public.clan_war_rooms (room_id);
create index if not exists idx_clan_war_rooms_status on public.clan_war_rooms (status);


-- 4. ENABLE ROW LEVEL SECURITY (RLS) FOR GAME ROOMS
alter table public.ranked_rooms enable row level security;
alter table public.clan_war_rooms enable row level security;

-- Permissive policies for peer-to-peer gameplay via anon key
create policy "Allow anonymous read access to ranked rooms" 
  on public.ranked_rooms for select using (true);

create policy "Allow anonymous create access to ranked rooms" 
  on public.ranked_rooms for insert with check (true);

create policy "Allow anonymous update access to ranked rooms" 
  on public.ranked_rooms for update using (true);

create policy "Allow anonymous read access to clan war rooms" 
  on public.clan_war_rooms for select using (true);

create policy "Allow anonymous create access to clan war rooms" 
  on public.clan_war_rooms for insert with check (true);

create policy "Allow anonymous update access to clan war rooms" 
  on public.clan_war_rooms for update using (true);


-- 5. ENABLE REALTIME SUBSCRIPTIONS
-- This allows clients to receive instant WebSocket updates on database changes
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table public.ranked_rooms, public.clan_war_rooms, public.users;
commit;


-- 6. AUTOMATIC TIMESTAMP TRIGGER
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

drop trigger if exists set_ranked_rooms_updated_at on public.ranked_rooms;
create trigger set_ranked_rooms_updated_at
  before update on public.ranked_rooms
  for each row execute function public.handle_updated_at();

drop trigger if exists set_clan_war_rooms_updated_at on public.clan_war_rooms;
create trigger set_clan_war_rooms_updated_at
  before update on public.clan_war_rooms
  for each row execute function public.handle_updated_at();
