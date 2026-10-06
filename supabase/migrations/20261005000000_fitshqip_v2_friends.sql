-- ============================================================================
-- FITSHQIP V2 — Palestra me Miqtë: Personal ID + kërkesa/miqësi
-- Migrim ADITIV: nuk fshin, nuk ndryshon asnjë tabelë/policy ekzistuese
-- (përveç shtimit të kolonës personal_id te profiles).
-- Xhiro një herë te: Supabase → SQL Editor → New query → Run
-- ============================================================================

-- ---------- 1. PERSONAL ID (10 shifra, unik, i përhershëm) ----------

-- Gjeneron 10 shifra (shifra e parë 1-9), e ri-provon nëse ekziston tashmë.
create or replace function public.generate_personal_id()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
begin
  loop
    candidate := (1 + floor(random() * 9))::int::text
              || lpad(floor(random() * 1000000000)::bigint::text, 9, '0');
    exit when not exists (select 1 from public.profiles where personal_id = candidate);
  end loop;
  return candidate;
end;
$$;

alter table public.profiles add column if not exists personal_id text;

-- Backfill për userat ekzistues (një nga një, që mos ketë përplasje).
do $$
declare r record;
begin
  for r in select id from public.profiles where personal_id is null loop
    update public.profiles set personal_id = public.generate_personal_id() where id = r.id;
  end loop;
end;
$$;

-- Tani që të gjithë e kanë: default për userat e rinj (handle_new_user mbetet i pandryshuar).
alter table public.profiles alter column personal_id set default public.generate_personal_id();
alter table public.profiles alter column personal_id set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_personal_id_format') then
    alter table public.profiles
      add constraint profiles_personal_id_format check (personal_id ~ '^[1-9][0-9]{9}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_personal_id_key') then
    alter table public.profiles add constraint profiles_personal_id_key unique (personal_id);
  end if;
end;
$$;

-- ID nuk ndryshohet kurrë: pavarësisht ç'dërgon klienti, mbetet vlera e vjetër.
create or replace function public.lock_personal_id()
returns trigger
language plpgsql
as $$
begin
  new.personal_id := old.personal_id;
  return new;
end;
$$;

drop trigger if exists profiles_lock_personal_id on public.profiles;
create trigger profiles_lock_personal_id
  before update on public.profiles
  for each row execute function public.lock_personal_id();

-- ---------- 2. FRIENDSHIPS (kërkesë + miqësi në një tabelë) ----------
-- status: 'pending' (kërkesë e dërguar) → 'accepted' (miq).
-- Refuzimi / heqja = fshirje e rreshtit (kështu mund të dërgohet kërkesë përsëri).
-- Një tabelë e vetme mjafton për të ardhmen: sfida, klasifikim miqsh, stërvitje
-- të përbashkëta etj. mund të lidhen me friendships.id ose me is_friend_with().

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friendships_not_self check (requester_id <> addressee_id)
);

-- Një çift personash ka maksimumi një rresht, pavarësisht drejtimit.
create unique index if not exists friendships_pair_uniq
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists friendships_requester_idx on public.friendships (requester_id, status);
create index if not exists friendships_addressee_idx on public.friendships (addressee_id, status);

alter table public.friendships enable row level security;

-- Klienti nuk shkruan direkt: krijimi dhe pranimi kalojnë vetëm nga funksionet më poshtë.
revoke all on public.friendships from anon;
revoke insert, update on public.friendships from authenticated;

drop policy if exists "friendships_select_involved" on public.friendships;
create policy "friendships_select_involved"
  on public.friendships for select
  to authenticated
  using (auth.uid() in (requester_id, addressee_id));

-- Secili nga të dy mund ta fshijë (anulo kërkesën / refuzo / hiq mikun).
drop policy if exists "friendships_delete_involved" on public.friendships;
create policy "friendships_delete_involved"
  on public.friendships for delete
  to authenticated
  using (auth.uid() in (requester_id, addressee_id));

-- ---------- 3. FUNKSIONET (security definer, gjithmonë me auth.uid()) ----------

-- Dërgon kërkesë me Personal ID. Kthen një kod që UI e përkthen në shqip:
-- sent | accepted | invalid_id | self | not_found | already_friends | already_sent | unauthorized
create or replace function public.send_friend_request(p_personal_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  target uuid;
  existing public.friendships%rowtype;
begin
  if me is null then return 'unauthorized'; end if;

  p_personal_id := btrim(coalesce(p_personal_id, ''));
  if p_personal_id !~ '^[0-9]{10}$' then return 'invalid_id'; end if;

  select id into target from public.profiles where personal_id = p_personal_id;
  if target is null then return 'not_found'; end if;
  if target = me then return 'self'; end if;

  select * into existing from public.friendships
   where least(requester_id, addressee_id) = least(me, target)
     and greatest(requester_id, addressee_id) = greatest(me, target);

  if found then
    if existing.status = 'accepted' then return 'already_friends'; end if;
    if existing.requester_id = me then return 'already_sent'; end if;
    -- Ai/ajo na kishte dërguar kërkesë më parë → pranohet direkt.
    update public.friendships
       set status = 'accepted', responded_at = now()
     where id = existing.id;
    return 'accepted';
  end if;

  insert into public.friendships (requester_id, addressee_id) values (me, target);
  return 'sent';
exception
  when unique_violation then return 'already_sent';
end;
$$;

-- Pranon ose refuzon një kërkesë drejtuar meje. Kthen: accepted | declined | not_found
create or replace function public.respond_friend_request(p_request_id uuid, p_accept boolean)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  affected int;
begin
  if me is null then return 'not_found'; end if;

  if p_accept then
    update public.friendships
       set status = 'accepted', responded_at = now()
     where id = p_request_id and addressee_id = me and status = 'pending';
    get diagnostics affected = row_count;
    return case when affected > 0 then 'accepted' else 'not_found' end;
  else
    delete from public.friendships
     where id = p_request_id and addressee_id = me and status = 'pending';
    get diagnostics affected = row_count;
    return case when affected > 0 then 'declined' else 'not_found' end;
  end if;
end;
$$;

-- Miqtë e mi. Nuk kthen UUID të auth, email, peshë etj. — vetëm çfarë shfaqet në kartë.
create or replace function public.my_friends()
returns table (
  friendship_id uuid,
  personal_id text,
  full_name text,
  avatar_color text,
  level text,
  since timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select f.id, p.personal_id, p.full_name, p.avatar_color, p.level,
         coalesce(f.responded_at, f.created_at)
    from public.friendships f
    join public.profiles p
      on p.id = case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end
   where f.status = 'accepted'
     and auth.uid() in (f.requester_id, f.addressee_id)
   order by p.full_name;
$$;

-- Kërkesat në pritje: direction = 'incoming' (drejtuar meje) ose 'outgoing' (dërguar nga unë).
create or replace function public.my_friend_requests()
returns table (
  request_id uuid,
  direction text,
  personal_id text,
  full_name text,
  avatar_color text,
  level text,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select f.id,
         case when f.addressee_id = auth.uid() then 'incoming' else 'outgoing' end,
         p.personal_id, p.full_name, p.avatar_color, p.level, f.created_at
    from public.friendships f
    join public.profiles p
      on p.id = case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end
   where f.status = 'pending'
     and auth.uid() in (f.requester_id, f.addressee_id)
   order by f.created_at desc;
$$;

-- Për funksione të ardhshme (sfida, klasifikim miqsh) dhe RLS-në e tyre:
-- tregon vetëm nëse JAM mik me përdoruesin tjetër, jo miqësitë e të tjerëve.
create or replace function public.is_friend_with(other uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.friendships f
     where f.status = 'accepted'
       and ((f.requester_id = auth.uid() and f.addressee_id = other)
         or (f.addressee_id = auth.uid() and f.requester_id = other))
  );
$$;

-- Vetëm userat e loguar mund t'i thërrasin.
revoke execute on function public.send_friend_request(text) from public, anon;
revoke execute on function public.respond_friend_request(uuid, boolean) from public, anon;
revoke execute on function public.my_friends() from public, anon;
revoke execute on function public.my_friend_requests() from public, anon;
revoke execute on function public.is_friend_with(uuid) from public, anon;
grant execute on function public.send_friend_request(text) to authenticated;
grant execute on function public.respond_friend_request(uuid, boolean) to authenticated;
grant execute on function public.my_friends() to authenticated;
grant execute on function public.my_friend_requests() to authenticated;
grant execute on function public.is_friend_with(uuid) to authenticated;

-- ============================================================================
-- Shënim: policy-t ekzistuese të profiles/sessions/routines/etj. NUK janë prekur.
-- ============================================================================
