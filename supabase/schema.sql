-- Parent-managed accounts: one Supabase auth user (the parent/guardian, or a player
-- 18+ managing themselves) owns one or more `players` rows (their kids). There is no
-- separate "accounts" table -- account-level identity is auth.users itself, exactly
-- like clips.user_id already referenced auth.users directly before this change.
create table if not exists public.players (
  id uuid primary key,
  account_id uuid not null references auth.users (id) on delete cascade,
  name text not null default '',
  avatar_url text not null default '/player-avatar.png',
  position text not null default 'CAM',
  age int,
  experience text not null default 'developing',
  location text not null default '',
  pace int not null default 60,
  shooting int not null default 60,
  dribbling int not null default 60,
  passing int not null default 60,
  physicality int not null default 60,
  -- Stamped by the app at the moment this specific child's info is submitted
  -- (signup, or "+ Add player" later) -- the actual COPPA-relevant consent record.
  -- Never a column default; every player must go through the consent checkbox.
  consented_at timestamptz not null,
  -- Who gave consent for this row: 'guardian' (parent/guardian registering a
  -- child) or 'self' (an 18+ player registering their own account). See the
  -- "Who can create an account" section of the Terms of Service.
  consent_basis text not null default 'guardian',
  created_at timestamptz not null default now()
);

-- Existing installs: add the column if this table already existed before
-- self-registration was introduced. Backfill is a no-op -- every player row
-- created before this feature existed was guardian-consented by definition.
alter table public.players add column if not exists consent_basis text not null default 'guardian';

create table if not exists public.clips (
  id uuid primary key,
  player_id uuid not null references public.players (id) on delete cascade,
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

-- coach_id references the static roster in lib/coaches.ts by id, never a free-text name.
create table if not exists public.coach_notes (
  id uuid primary key,
  player_id uuid not null references public.players (id) on delete cascade,
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
  player_id uuid not null references public.players (id) on delete cascade,
  coach_id text not null,
  starts_at timestamptz not null,
  duration_min int not null default 45,
  focus text[] not null default '{}',
  level text not null default 'Competitive club',
  notes text,
  status text not null default 'booked', -- booked | cancelled
  created_at timestamptz not null default now(),
  unique (player_id, coach_id, starts_at)
);

-- ---------------------------------------------------------------------------
-- One-time migration for projects that already ran the old single-profile
-- schema (profiles.id = auth.users.id, clips/coach_notes/session_bookings
-- keyed by user_id). Must run BEFORE the RLS/policy block below, since those
-- policies reference player_id, which this block is what actually creates on
-- pre-existing tables. Re-runnable: the `if exists (... table_name='profiles')`
-- guard makes this a no-op on fresh projects or once it has already run once
-- (the block ends by dropping `profiles`, so it won't fire twice).
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'profiles') then

    -- Backfill: each existing account's player-shaped columns become its
    -- first players row. consented_at is approximated from created_at --
    -- acceptable for pre-launch test data, not a real user.
    insert into public.players
      (id, account_id, name, avatar_url, position, age, experience, location,
       pace, shooting, dribbling, passing, physicality, consented_at, created_at)
    select gen_random_uuid(), pr.id, pr.name, pr.avatar_url, pr.position, pr.age, pr.experience, pr.location,
           pr.pace, pr.shooting, pr.dribbling, pr.passing, pr.physicality, pr.created_at, pr.created_at
    from public.profiles pr
    where not exists (select 1 from public.players p where p.account_id = pr.id);

    -- Drop the OLD user_id-based policies before dropping user_id -- they
    -- reference that column, so DROP COLUMN would otherwise fail.
    drop policy if exists "own clips" on public.clips;
    drop policy if exists "read own coach notes" on public.coach_notes;
    drop policy if exists "own bookings" on public.session_bookings;

    -- Each of these three tables: add player_id, backfill it via the player
    -- just created for that row's old owning user, then drop user_id
    -- (cascade handles the old unique constraint on session_bookings, which
    -- included user_id, without needing to guess its auto-generated name).
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='clips' and column_name='user_id') then
      alter table public.clips add column if not exists player_id uuid references public.players (id) on delete cascade;
      update public.clips c set player_id = p.id
        from public.players p where p.account_id = c.user_id and c.player_id is null;
      alter table public.clips alter column player_id set not null;
      alter table public.clips drop column user_id cascade;
    end if;

    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='coach_notes' and column_name='user_id') then
      alter table public.coach_notes add column if not exists player_id uuid references public.players (id) on delete cascade;
      update public.coach_notes c set player_id = p.id
        from public.players p where p.account_id = c.user_id and c.player_id is null;
      alter table public.coach_notes alter column player_id set not null;
      alter table public.coach_notes drop column user_id cascade;
    end if;

    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='session_bookings' and column_name='user_id') then
      alter table public.session_bookings add column if not exists player_id uuid references public.players (id) on delete cascade;
      update public.session_bookings c set player_id = p.id
        from public.players p where p.account_id = c.user_id and c.player_id is null;
      alter table public.session_bookings alter column player_id set not null;
      alter table public.session_bookings drop column user_id cascade;
      alter table public.session_bookings add constraint session_bookings_player_id_coach_id_starts_at_key unique (player_id, coach_id, starts_at);
    end if;

    drop table public.profiles;
  end if;
end $$;

alter table public.players enable row level security;
alter table public.clips enable row level security;
alter table public.coach_notes enable row level security;
alter table public.session_bookings enable row level security;

drop policy if exists "own players" on public.players;
create policy "own players" on public.players
  for all using (auth.uid() = account_id) with check (auth.uid() = account_id);

drop policy if exists "own clips" on public.clips;
create policy "own clips" on public.clips
  for all using (
    exists (select 1 from public.players p where p.id = clips.player_id and p.account_id = auth.uid())
  )
  with check (
    exists (select 1 from public.players p where p.id = clips.player_id and p.account_id = auth.uid())
  );

-- Read-only for players: coach_notes represent feedback FROM a coach, not the
-- player. No insert/update/delete policy is granted here on purpose -- without
-- one, only the service-role key (server-side, bypasses RLS) can write a note.
-- Without this, a player could forge their own "coach feedback" through the
-- anon key, since createCoachNote() has no server-side gate of its own today.
drop policy if exists "read own coach notes" on public.coach_notes;
create policy "read own coach notes" on public.coach_notes
  for select using (
    exists (select 1 from public.players p where p.id = coach_notes.player_id and p.account_id = auth.uid())
  );

drop policy if exists "own bookings" on public.session_bookings;
create policy "own bookings" on public.session_bookings
  for all using (
    exists (select 1 from public.players p where p.id = session_bookings.player_id and p.account_id = auth.uid())
  )
  with check (
    exists (select 1 from public.players p where p.id = session_bookings.player_id and p.account_id = auth.uid())
  );

-- No storage.objects policies here: video files live in Cloudflare R2, not
-- Supabase Storage. Access control for R2 is enforced in
-- app/api/storage/*/route.ts (verifies the caller's Supabase session before
-- issuing a presigned URL scoped to that user's own key prefix), not RLS.

-- Baseline grants. Required because project creation was set up with
-- "Automatically expose new tables" OFF (the more secure option, so nothing
-- gets API access by accident) -- which also means these grants aren't
-- automatic and must be explicit here, or RLS above never even gets
-- evaluated (Postgres denies at the privilege check first).
grant usage on schema public to authenticated;

grant select, insert, update, delete on public.players to authenticated;
grant select, insert, update, delete on public.clips to authenticated;
grant select on public.coach_notes to authenticated;
grant select, insert, update, delete on public.session_bookings to authenticated;

-- ---------------------------------------------------------------------------
-- Billing: account-wide subscription state (Stripe). One row per auth.users,
-- not per player -- one subscription unlocks unlimited AI analyses for every
-- player under the account, and the free-analysis pool below is shared across
-- all of an account's players rather than given per-child.
-- ---------------------------------------------------------------------------
create table if not exists public.billing_accounts (
  account_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status text not null default 'none', -- none | active | trialing | past_due | canceled | unpaid | incomplete | incomplete_expired | paused
  free_analyses_used int not null default 0,
  free_analyses_limit int not null default 2,
  -- Entitled (Pro) accounts get a monthly analysis cap too -- "unlimited" in
  -- the marketing copy is a fair-use ceiling, not literally uncapped, so a
  -- $20/mo subscriber can never run up unbounded Anthropic API cost. See
  -- PRO_MONTHLY_ANALYSIS_LIMIT in lib/billing-server.ts for the number and
  -- the cost math behind it. pro_analyses_period is the 'YYYY-MM' the count
  -- applies to; a mismatch against the current month means "reset to 0".
  pro_analyses_used int not null default 0,
  pro_analyses_period text,
  -- Monthly chat-message cap, applied to every account regardless of tier --
  -- a second, independent lever on the same cost guarantee (see
  -- CHAT_MESSAGE_MONTHLY_LIMIT in lib/billing-server.ts).
  chat_messages_used int not null default 0,
  chat_messages_period text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Existing installs: add the monthly-cap columns if this table already
-- existed before those caps were introduced.
alter table public.billing_accounts add column if not exists pro_analyses_used int not null default 0;
alter table public.billing_accounts add column if not exists pro_analyses_period text;
alter table public.billing_accounts add column if not exists chat_messages_used int not null default 0;
alter table public.billing_accounts add column if not exists chat_messages_period text;

alter table public.billing_accounts enable row level security;

-- Read-only for the account owner. No insert/update/delete policy on purpose --
-- writes only happen via the service-role key (usage-gate increments, and the
-- Stripe webhook), same "service-role only" shape as coach_notes writes above.
-- Without this, a user could forge their own "active subscription" through
-- the anon key.
drop policy if exists "own billing_accounts" on public.billing_accounts;
create policy "own billing_accounts" on public.billing_accounts
  for select using (auth.uid() = account_id);

grant select on public.billing_accounts to authenticated;

-- ---------------------------------------------------------------------------
-- Booking cap: at most 1 *booked* session per calendar month per account.
-- session_bookings is written directly from the client via the anon key --
-- there's no server route in front of it the way /api/feedback fronts AI
-- analyses -- so Postgres is the only layer a scripted client can't bypass.
-- Cancelled bookings (status = 'cancelled') don't count, so cancelling frees
-- up the month for a replacement booking.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_booking_monthly_cap()
returns trigger as $$
declare
  v_account_id uuid;
  v_existing int;
begin
  if new.status <> 'booked' then
    return new;
  end if;

  select account_id into v_account_id from public.players where id = new.player_id;

  select count(*) into v_existing
  from public.session_bookings sb
  join public.players p on p.id = sb.player_id
  where p.account_id = v_account_id
    and sb.status = 'booked'
    and date_trunc('month', sb.starts_at) = date_trunc('month', new.starts_at)
    and sb.id <> new.id;

  if v_existing >= 1 then
    raise exception 'booking_monthly_cap_reached' using errcode = 'P0001';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists booking_monthly_cap on public.session_bookings;
create trigger booking_monthly_cap
  before insert on public.session_bookings
  for each row execute function public.enforce_booking_monthly_cap();
