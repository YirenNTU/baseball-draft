-- Supabase 可能要求 UPDATE 必須帶 WHERE；補上 where true 以重設全表列
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
    picked_at = null,
    wants_trade = false
  where true;
  update public.draft_state
  set
    current_team_key = 'a',
    is_complete = false,
    updated_at = now()
  where id = 1;
end;
$$;

grant execute on function public.reset_draft() to service_role;
