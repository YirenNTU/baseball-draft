-- 選秀結束條件：已選人數 = players 表總筆數（人數可變）
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
  pool_size int;
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

  select count(*)::int into pool_size from public.players;

  update public.players
  set
    team_key = p_team,
    picked = true,
    picked_at = now()
  where id = pl.id;

  select count(*)::int into total_picked from public.players where picked;
  if total_picked >= pool_size then
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

  return jsonb_build_object('ok', true, 'picks', total_picked, 'pool', pool_size);
end;
$$;

grant execute on function public.apply_pick(text, text) to service_role;
