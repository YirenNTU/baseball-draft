-- Baseball draft: players + state + atomic pick
-- Run in Supabase SQL Editor or via `supabase db push`

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_path text not null,
  title text not null,
  blurb text not null,
  fun_power int not null check (fun_power between 0 and 100),
  quirk text not null,
  news_headline text not null,
  display_order int not null,
  team_key text check (team_key in ('a', 'b') or team_key is null),
  picked boolean not null default false,
  picked_at timestamptz
);

create table if not exists public.draft_state (
  id int primary key default 1,
  current_team_key text not null check (current_team_key in ('a', 'b')),
  is_complete boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.draft_state (id, current_team_key, is_complete)
values (1, 'a', false)
on conflict (id) do nothing;

-- Atomic pick: prevents double-pick and wrong-turn races
create or replace function public.apply_pick(p_slug text, p_team text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  st draft_state%rowtype;
  pl players%rowtype;
  total_picked int;
begin
  if p_team is null or p_team not in ('a', 'b') then
    return jsonb_build_object('ok', false, 'error', 'invalid_team');
  end if;

  select * into st from public.draft_state where id = 1 for update;
  select * into pl from public.players where slug = p_slug for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  if pl.picked then
    return jsonb_build_object('ok', false, 'error', 'already_picked');
  end if;
  if st.current_team_key is distinct from p_team then
    return jsonb_build_object('ok', false, 'error', 'wrong_turn', 'current', st.current_team_key);
  end if;

  update public.players
  set
    team_key = p_team,
    picked = true,
    picked_at = now()
  where id = pl.id;

  select count(*)::int into total_picked from public.players where picked;
  if total_picked = 12 then
    update public.draft_state
    set
      is_complete = true,
      updated_at = now()
    where id = 1;
  else
    update public.draft_state
    set
      current_team_key = case p_team when 'a' then 'b' else 'a' end,
      updated_at = now()
    where id = 1;
  end if;

  return jsonb_build_object('ok', true, 'picks', total_picked);
end;
$$;

-- Reset draft (for parties / re-run)
create or replace function public.reset_draft()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.players
  set
    team_key = null,
    picked = false,
    picked_at = null
  where true;
  update public.draft_state
  set
    current_team_key = 'a',
    is_complete = false,
    updated_at = now()
  where id = 1;
end;
$$;

grant select on public.players to anon, authenticated;
grant select on public.draft_state to anon, authenticated;

-- Service role (used by server API) bypasses RLS by default; we still enable RLS for direct anon
alter table public.players enable row level security;
alter table public.draft_state enable row level security;

create policy "Anyone can read players" on public.players
  for select to anon, authenticated
  using (true);

create policy "Anyone can read draft_state" on public.draft_state
  for select to anon, authenticated
  using (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'players'
  ) then
    alter publication supabase_realtime add table public.players;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'draft_state'
  ) then
    alter publication supabase_realtime add table public.draft_state;
  end if;
end;
$$;

grant usage on schema public to anon, authenticated;
grant execute on function public.apply_pick(text, text) to service_role;
grant execute on function public.reset_draft() to service_role;
