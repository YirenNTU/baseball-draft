-- 綁選：指名任一人，另一人同隊同次一併入選；仍只交換一輪（與 BOUND_SLUG_PAIRS 一致）
create or replace function public.apply_pick(p_slug text, p_team text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  st draft_state%rowtype;
  pl players%rowtype;
  pl2 players%rowtype;
  partner_slug text;
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

  partner_slug := case p_slug
    when 'huang-ze-rui' then 'song-wen-yu'
    when 'song-wen-yu' then 'huang-ze-rui'
    when 'zhang-shu-han' then 'zeng-gui-hong'
    when 'zeng-gui-hong' then 'zhang-shu-han'
    else null
  end;

  if partner_slug is not null then
    select * into pl2 from public.players where slug = partner_slug for update;
    if not found then
      return jsonb_build_object('ok', false, 'error', 'bound_partner_missing');
    end if;
    if pl2.picked then
      return jsonb_build_object('ok', false, 'error', 'bound_partner_picked');
    end if;
  end if;

  update public.players
  set
    team_key = p_team,
    picked = true,
    picked_at = now()
  where id = pl.id;

  if partner_slug is not null then
    update public.players
    set
      team_key = p_team,
      picked = true,
      picked_at = now()
    where id = pl2.id;
  end if;

  select count(*)::int into pool_size from public.players;

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
