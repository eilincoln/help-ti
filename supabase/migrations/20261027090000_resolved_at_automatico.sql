-- =====================================================================
-- Migration: resolved_at preenchido pelo próprio banco
--
-- O técnico só muda o status. A data de resolução vem do relógio do
-- servidor (não do computador de quem clicou) e não pode ser forjada.
-- =====================================================================

begin;

create or replace function public.set_resolved_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'resolvido' and old.status is distinct from 'resolvido' then
    new.resolved_at := now();
  elsif new.status <> 'resolvido' then
    new.resolved_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists tickets_set_resolved_at on public.tickets;
create trigger tickets_set_resolved_at
  before update of status on public.tickets
  for each row
  execute function public.set_resolved_at();

-- Técnico passa a poder alterar SÓ o status (a data é responsabilidade do trigger)
revoke update on public.tickets from authenticated;
grant update (status) on public.tickets to authenticated;

commit;
