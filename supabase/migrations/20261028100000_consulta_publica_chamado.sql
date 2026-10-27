-- =====================================================================
-- Migration: consulta pública do andamento de um chamado
--
-- O visitante continua SEM acesso às tabelas. Ele só pode chamar esta
-- função, que exige protocolo + primeiro nome e devolve apenas:
-- protocolo, categoria, status, datas e observações PÚBLICAS.
-- Nome, setor e descrição nunca saem daqui.
-- =====================================================================

begin;

-- Remove acentos para comparar "João" com "joao"
create extension if not exists unaccent with schema extensions;

create or replace function public.get_ticket_status(
  p_protocol   text,
  p_first_name text
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
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
  from public.tickets t
  where t.protocol = upper(trim(p_protocol))
    and split_part(lower(extensions.unaccent(trim(t.requester_name))), ' ', 1)
      = split_part(lower(extensions.unaccent(trim(p_first_name))), ' ', 1)
    and char_length(trim(p_first_name)) >= 2;
$$;

-- Só esta função fica aberta ao público; as tabelas continuam fechadas
revoke execute on function public.get_ticket_status(text, text) from public;
grant execute on function public.get_ticket_status(text, text) to anon, authenticated;

commit;
