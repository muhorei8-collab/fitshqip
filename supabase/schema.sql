-- ============================================================================
-- FITSHQIP — Skema e Supabase (auth reale + admin i verifikuar në databazë)
-- Xhiro këtë të gjithën një herë te: Supabase → SQL Editor → New query → Run
-- ============================================================================

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  age int not null default 18,
  height numeric not null default 170,
  weight numeric not null default 70,
  level text not null default 'Fillestar',
  unit text not null default 'kg',
  avatar_color text not null default '#E5352B',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper i sigurt: kontrollon nëse useri aktual është admin, pa shkaktuar
-- rekursion në RLS (security definer e anashkalon RLS brenda vetes).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Të gjithë userat e loguar mund të shohin listën e profileve (për leaderboard
-- dhe panelin e adminit). Të dhëna jo-sensitive (emër, email, nivel).
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  to authenticated
  using (true);

-- Useri redakton VETËM profilin e vet, dhe NUK mund të ndryshojë is_admin
-- (kolona mbetet gjithmonë siç është ruajtur në databazë, pavarësisht ç'dërgon klienti).
drop policy if exists "profiles_update_own_not_admin" on public.profiles;
create policy "profiles_update_own_not_admin"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid())
  );

-- Krijimi automatik i profilit kur regjistrohet një user i ri.
-- is_admin bëhet TRUE vetëm nëse email-i përputhet saktësisht me adminin real.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, age, height, weight, level, unit, avatar_color, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce((new.raw_user_meta_data->>'age')::int, 18),
    coalesce((new.raw_user_meta_data->>'height')::numeric, 170),
    coalesce((new.raw_user_meta_data->>'weight')::numeric, 70),
    coalesce(new.raw_user_meta_data->>'level', 'Fillestar'),
    'kg',
    coalesce(new.raw_user_meta_data->>'avatar_color', '#E5352B'),
    (lower(new.email) = 'muhorei8@gmail.com')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- WORKOUT SESSIONS ----------
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_name text not null,
  date timestamptz not null default now(),
  duration_sec int not null default 0,
  exercises jsonb not null default '[]',
  total_volume numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.workout_sessions enable row level security;

drop policy if exists "sessions_select_own_or_admin" on public.workout_sessions;
create policy "sessions_select_own_or_admin"
  on public.workout_sessions for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "sessions_insert_own" on public.workout_sessions;
create policy "sessions_insert_own"
  on public.workout_sessions for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "sessions_delete_own" on public.workout_sessions;
create policy "sessions_delete_own"
  on public.workout_sessions for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------- ROUTINES (rutina të krijuara nga userat; ato "sistem" mbeten në kod) ----------
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  exercises jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.routines enable row level security;

drop policy if exists "routines_select_own_or_admin" on public.routines;
create policy "routines_select_own_or_admin"
  on public.routines for select
  to authenticated
  using (auth.uid() = owner_id or public.is_admin());

drop policy if exists "routines_insert_own" on public.routines;
create policy "routines_insert_own"
  on public.routines for insert
  to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "routines_delete_own" on public.routines;
create policy "routines_delete_own"
  on public.routines for delete
  to authenticated
  using (auth.uid() = owner_id);

-- ---------- BODY METRICS ----------
create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date timestamptz not null default now(),
  weight numeric not null,
  created_at timestamptz not null default now()
);

alter table public.body_metrics enable row level security;

drop policy if exists "metrics_select_own_or_admin" on public.body_metrics;
create policy "metrics_select_own_or_admin"
  on public.body_metrics for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "metrics_insert_own" on public.body_metrics;
create policy "metrics_insert_own"
  on public.body_metrics for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "metrics_delete_own" on public.body_metrics;
create policy "metrics_delete_own"
  on public.body_metrics for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------- GOALS (një rresht për user) ----------
create table if not exists public.goals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  target_weight numeric not null default 0,
  target_lifts jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

alter table public.goals enable row level security;

drop policy if exists "goals_select_own_or_admin" on public.goals;
create policy "goals_select_own_or_admin"
  on public.goals for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "goals_upsert_own" on public.goals;
create policy "goals_upsert_own"
  on public.goals for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own"
  on public.goals for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- Shënim sigurie: kolona is_admin te "profiles" NUK mund të ndryshohet kurrë
-- nga app-i (policy "profiles_update_own_not_admin" e bllokon në nivel databaze).
-- Për të bërë dikë admin, e ndryshon VETËM ti manualisht:
--   Supabase → Table Editor → profiles → gjej rreshtin → is_admin = true
-- ============================================================================
