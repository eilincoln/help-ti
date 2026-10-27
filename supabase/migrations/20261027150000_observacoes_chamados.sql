-- =====================================================================
-- Migration: histórico de observações dos chamados
--
-- Cada observação é uma linha nova (nada é sobrescrito nem apagado).
-- is_public = true -> poderá aparecer para quem abriu o chamado
-- is_public = false -> nota interna, só a equipe de TI vê
-- =====================================================================

begin;

create table if not exists public.ticket_notes (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.tickets (id) on delete restrict,
  author_id  uuid default auth.uid() references auth.users (id) on delete set null,
  body       text not null,
  is_public  boolean not null default true,
  created_at timestamptz not null default now(),

  constraint ticket_notes_body_length
    check (char_length(trim(body)) between 1 and 1000)
);

-- Acelera a busca das observações de um chamado
create index if not exists ticket_notes_ticket_id_idx
  on public.ticket_notes (ticket_id);

-- Permissões: técnico lê e cria; author_id, id e data vêm do banco
revoke all on public.ticket_notes from anon, authenticated;
grant select on public.ticket_notes to authenticated;
grant insert (ticket_id, body, is_public) on public.ticket_notes to authenticated;

alter table public.ticket_notes enable row level security;

drop policy if exists "Tecnico le observacoes" on public.ticket_notes;
create policy "Tecnico le observacoes"
  on public.ticket_notes for select
  to authenticated
  using ((select public.is_staff()));

drop policy if exists "Tecnico cria observacoes" on public.ticket_notes;
create policy "Tecnico cria observacoes"
  on public.ticket_notes for insert
  to authenticated
  with check (
    (select public.is_staff())
    and author_id = (select auth.uid())
  );

-- Sem policies de UPDATE/DELETE: o histórico é só de inclusão.

commit;
