-- ============================================================
-- VENIA MVP — SUPABASE SCHEMA
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- IDEAS TABLE
create table if not exists public.ideas (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  pitch       text,
  problem     text,
  solution    text,
  why_now     text,
  path        text default 'build' check (path in ('build', 'license')),
  framework   text,
  raw_idea    text,
  answers     jsonb,
  status      text default 'draft' check (status in ('draft', 'live', 'funded', 'licensed')),
  goal_amount integer default 0,
  raised      integer default 0,
  backers     integer default 0,
  days_left   integer default 30,
  category    text
);

-- Row Level Security — users can only see/edit their own ideas
alter table public.ideas enable row level security;

create policy "Users can view their own ideas"
  on public.ideas for select
  using (auth.uid() = user_id);

create policy "Users can insert their own ideas"
  on public.ideas for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own ideas"
  on public.ideas for update
  using (auth.uid() = user_id);

create policy "Users can delete their own ideas"
  on public.ideas for delete
  using (auth.uid() = user_id);

-- Public ideas are visible to everyone (for the browse feed)
create policy "Public live ideas are viewable by all"
  on public.ideas for select
  using (status = 'live');

-- PROFILES TABLE (extends auth.users)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  created_at    timestamptz default now(),
  full_name     text,
  avatar_url    text,
  bio           text,
  location      text,
  reliability_score integer default 0
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger for ideas
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger ideas_updated_at
  before update on public.ideas
  for each row execute procedure public.handle_updated_at();
