create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  avatar_url text not null default '/player-avatar.png',
  position text not null default 'CAM',
  age int,
  location text not null default '',
  pace int not null default 60,
  shooting int not null default 60,
  dribbling int not null default 60,
  passing int not null default 60,
  physicality int not null default 60,
  created_at timestamptz not null default now()
);

create table if not exists public.clips (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  skill_tag text not null default 'full-match',
  video_path text not null default '',
  is_sample boolean not null default false,
  status text not null default 'uploaded', -- uploaded | analyzing | analyzed | sent_to_coach
  -- AI-generated (pose metrics + Claude feedback), never human-authored. Kept
  -- on the clip itself, deliberately separate from coach_notes below, so AI
  -- output can never be confused with a real coach's review.
  metrics jsonb,
  feedback jsonb,
  chat jsonb, -- follow-up Q&A thread about this clip's feedback, capped client+server side
  created_at timestamptz not null default now()
);

-- Replaces the previously-hardcoded feedbackNotes array. coach_id references
-- the static roster in lib/coaches.ts by id, never a free-text name — this is
-- the structural fix for coach names drifting between screens.
create table if not exists public.coach_notes (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  clip_id uuid not null references public.clips (id) on delete cascade,
  coach_id text not null,
  frame int not null default 0, -- 0-100 position on the clip timeline
  type text not null default 'note', -- note | voice | video
  text text not null,
  media_path text,
  duration_sec int,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.session_bookings (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  coach_id text not null,
  starts_at timestamptz not null,
  duration_min int not null default 45,
  focus text[] not null default '{}',
  level text not null default 'Competitive club',
  notes text,
  status text not null default 'booked', -- booked | cancelled
  created_at timestamptz not null default now(),
  unique (user_id, coach_id, starts_at)
);

alter table public.profiles enable row level security;
alter table public.clips enable row level security;
alter table public.coach_notes enable row level security;
alter table public.session_bookings enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own clips" on public.clips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Read-only for players: coach_notes represent feedback FROM a coach, not
-- the player. No insert/update/delete policy is granted here on purpose —
-- without one, only the service-role key (server-side, bypasses RLS) can
-- write a note. Without this, a player could forge their own "coach
-- feedback" through the anon key, since createCoachNote() has no server-side
-- gate of its own today.
create policy "read own coach notes" on public.coach_notes
  for select using (auth.uid() = user_id);

create policy "own bookings" on public.session_bookings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- No storage.objects policies here: video files live in Cloudflare R2, not
-- Supabase Storage. Access control for R2 is enforced in
-- app/api/storage/*/route.ts (verifies the caller's Supabase session before
-- issuing a presigned URL scoped to that user's own key prefix), not RLS.
