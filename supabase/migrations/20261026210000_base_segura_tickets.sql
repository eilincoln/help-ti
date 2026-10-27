-- =====================================================================
-- Migration: base segura da tabela de chamados
--
-- Regras de acesso:
--   * visitante anônimo  -> só ABRE chamado (insert), não lê nada
--   * técnico (staff)    -> lê e atualiza status dos chamados
--   * ninguém            -> apaga chamados (histórico preservado)
--
-- Idempotente: pode rodar em um banco novo ou no banco que já existe.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Tabela de chamados
-- ---------------------------------------------------------------------
create table if not exists public.tickets (
  id             uuid primary key default gen_random_uuid(),
  protocol       text not null,
  requester_name text not null,
  department     text not null,
  category       text not null,
  priority       text not null,
  description    text not null,
  status         text not null default 'aberto',
  created_at     timestamptz default now(),
  resolved_at    timestamptz
);

-- Regras de integridade: o banco recusa dados fora do contrato,
-- mesmo que alguém chame a API sem passar pelo formulário.
-- Os valores espelham os tipos de src/types/ticket.ts.
alter table public.tickets
  drop constraint if exists tickets_protocol_key,
  drop constraint if exists tickets_protocol_format,
  drop constraint if exists tickets_category_check,
  drop constraint if exists tickets_priority_check,
  drop constraint if exists tickets_status_check,
  drop constraint if exists tickets_requester_name_length,
  drop constraint if exists tickets_department_length,
  drop constraint if exists tickets_description_length;

alter table public.tickets
  add constraint tickets_protocol_key unique (protocol),
  add constraint tickets_protocol_format
    check (protocol ~ '^#TI-[0-9]{4}-[A-Z0-9]{4}$'),
  add constraint tickets_category_check
    check (category in ('hardware', 'software', 'rede', 'acesso', 'outro')),
  add constraint tickets_priority_check
    check (priority in ('baixa', 'media', 'alta', 'urgente')),
  add constraint tickets_status_check
    check (status in ('aberto', 'em_andamento', 'aguardando', 'resolvido')),
  add constraint tickets_requester_name_length
    check (char_length(trim(requester_name)) between 2 and 120),
  add constraint tickets_department_length
    check (char_length(trim(department)) between 2 and 80),
  add constraint tickets_description_length
    check (char_length(trim(description)) between 5 and 2000);

-- ---------------------------------------------------------------------
-- 2. Lista de técnicos autorizados
-- ---------------------------------------------------------------------
-- Estar logado (authenticated) NÃO basta: só quem está nesta tabela
-- é considerado técnico. Defesa extra caso o cadastro público seja
-- reativado por engano.
create table if not exists public.staff (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.staff enable row level security;

-- Técnico pode confirmar que ele mesmo é staff (útil para o front-end).
drop policy if exists "Tecnico ve o proprio registro" on public.staff;
create policy "Tecnico ve o proprio registro"
  on public.staff for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Função auxiliar usada nas policies.
-- security definer: roda com permissão do dono, então consegue ler
-- public.staff sem depender das policies dela (evita recursão).
-- search_path vazio: impede que alguém "sequestre" nomes de tabela.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

-- ---------------------------------------------------------------------
-- 3. Permissões de coluna (GRANT)
-- ---------------------------------------------------------------------
-- Antes da RLS, o Postgres verifica se o papel pode tocar na coluna.
-- Quem abre chamado só envia os campos do formulário; id, status e
-- datas ficam sempre com o valor padrão do banco.
revoke all on public.tickets from anon, authenticated;

grant insert (protocol, requester_name, department, category, priority, description)
  on public.tickets to anon, authenticated;

grant select on public.tickets to authenticated;
grant update (status, resolved_at) on public.tickets to authenticated;

revoke all on public.staff from anon, authenticated;
grant select on public.staff to authenticated;

-- ---------------------------------------------------------------------
-- 4. Row Level Security dos chamados
-- ---------------------------------------------------------------------
alter table public.tickets enable row level security;

-- Remove as policies antigas (a de leitura expunha todos os chamados).
drop policy if exists "Permitir insercao publica de chamados" on public.tickets;
drop policy if exists "Permitir leitura de chamados" on public.tickets;
drop policy if exists "Apenas admin autenticado pode atualizar chamados" on public.tickets;
drop policy if exists "Qualquer pessoa abre chamado" on public.tickets;
drop policy if exists "Tecnico le chamados" on public.tickets;
drop policy if exists "Tecnico atualiza chamados" on public.tickets;

create policy "Qualquer pessoa abre chamado"
  on public.tickets for insert
  to anon, authenticated
  with check (status = 'aberto' and resolved_at is null);

create policy "Tecnico le chamados"
  on public.tickets for select
  to authenticated
  using ((select public.is_staff()));

create policy "Tecnico atualiza chamados"
  on public.tickets for update
  to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

-- Sem policy de DELETE: ninguém apaga chamado pela API.

commit;
