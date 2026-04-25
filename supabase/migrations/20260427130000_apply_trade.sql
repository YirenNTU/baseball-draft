-- 選秀完成後 1:1 交換：A 陣一員 與 B 陣一員互換隊籍
create or replace function public.apply_trade(p_slug_from_a text, p_slug_from_b text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  st draft_state%rowtype;
  pa players%rowtype;
  pb players%rowtype;
begin
  if p_slug_from_a is null or p_slug_from_b is null
     or trim(p_slug_from_a) = '' or trim(p_slug_from_b) = ''
     or p_slug_from_a = p_slug_from_b
  then
    return jsonb_build_object('ok', false, 'error', 'invalid_slugs');
  end if;

  select * into st from public.draft_state where id = 1 for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'no_draft_state');
  end if;
  if st.is_complete is not true then
    return jsonb_build_object('ok', false, 'error', 'draft_not_complete');
  end if;

  select * into pa from public.players where slug = p_slug_from_a for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found', 'side', 'a');
  end if;
  select * into pb from public.players where slug = p_slug_from_b for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found', 'side', 'b');
  end if;

  if not coalesce(pa.picked, false) or pa.team_key is distinct from 'a' then
    return jsonb_build_object('ok', false, 'error', 'not_on_team_a');
  end if;
  if not coalesce(pb.picked, false) or pb.team_key is distinct from 'b' then
    return jsonb_build_object('ok', false, 'error', 'not_on_team_b');
  end if;

  update public.players set team_key = 'b' where id = pa.id;
  update public.players set team_key = 'a' where id = pb.id;

  return jsonb_build_object('ok', true, 'a', p_slug_from_a, 'b', p_slug_from_b);
end;
$$;

grant execute on function public.apply_trade(text, text) to service_role;
