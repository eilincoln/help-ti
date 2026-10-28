-- =====================================================================
-- Migration: limite de tentativas na consulta pública
--
-- Sem limite, dá para testar milhares de nomes por segundo contra um
-- protocolo até acertar (força bruta). Agora cada tentativa ERRADA fica
-- registrada e, depois de 5 erros em 15 minutos no mesmo protocolo,
-- a consulta desse protocolo fica bloqueada até a janela passar.
--
-- Por que por protocolo e não por IP: dentro do banco o IP chega por
-- cabeçalho, que o próprio visitante consegue falsificar. O protocolo é
-- exatamente o alvo que queremos proteger.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Registro das tentativas erradas (fechado para o público)
-- ---------------------------------------------------------------------
create table if not exists public.ticket_lookup_attempts (
  id           bigint generated always as identity primary key,
  protocol     text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists ticket_lookup_attempts_protocol_idx
  on public.ticket_lookup_attempts (protocol, attempted_at);

create index if not exists ticket_lookup_attempts_attempted_at_idx
  on public.ticket_lookup_attempts (attempted_at);

-- RLS ligado e nenhuma policy = ninguém lê nem escreve pela API.
-- Só a função abaixo (security definer) mexe nesta tabela.
alter table public.ticket_lookup_attempts enable row level security;
revoke all on public.ticket_lookup_attempts from anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. get_ticket_status agora conta as tentativas
--    Retornos possíveis:
--      { "blocked": true }  → muitas tentativas, tente mais tarde
--      null                 → protocolo e nome não conferem
--      { protocol, ... }    → chamado encontrado (igual antes)
-- ---------------------------------------------------------------------
create or replace function public.get_ticket_status(
  p_protocol   text,
  p_first_name text
)
returns jsonb
language plpgsql
volatile -- deixou de ser "stable" porque agora grava tentativas
security definer
set search_path = ''
as $$
declare
  v_protocol text := upper(trim(p_protocol));
  v_failures int;
  v_result   jsonb;
begin
  -- Formato inválido nunca encontra nada: responde sem gravar lixo
  if v_protocol !~ '^#TI-[0-9]{4}-[A-Z0-9]{4}$' then
    return null;
  end if;

  -- Faxina: tentativas com mais de 1 dia não servem para nada
  delete from public.ticket_lookup_attempts
  where attempted_at < now() - interval '1 day';

  select count(*) into v_failures
  from public.ticket_lookup_attempts a
  where a.protocol = v_protocol
    and a.attempted_at > now() - interval '15 minutes';

  if v_failures >= 5 then
    return jsonb_build_object('blocked', true);
  end if;

  select jsonb_build_object(
    'protocol',    t.protocol,
    'category',    t.category,
    'status',      t.status,
    'created_at',  t.created_at,
    'resolved_at', t.resolved_at,
    'notes', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('body', n.body, 'created_at', n.created_at)
          order by n.created_at
        )
        from public.ticket_notes n
        where n.ticket_id = t.id
          and n.is_public
      ),
      '[]'::jsonb
    )
  )
  into v_result
  from public.tickets t
  where t.protocol = v_protocol
    and split_part(lower(extensions.unaccent(trim(t.requester_name))), ' ', 1)
      = split_part(lower(extensions.unaccent(trim(p_first_name))), ' ', 1)
    and char_length(trim(p_first_name)) >= 2;

  if v_result is null then
    insert into public.ticket_lookup_attempts (protocol) values (v_protocol);
  end if;

  return v_result;
end;
$$;

revoke execute on function public.get_ticket_status(text, text) from public;
grant execute on function public.get_ticket_status(text, text) to anon, authenticated;

commit;
