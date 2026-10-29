-- =====================================================================
-- Remove SÓ os chamados do seed de demonstração (supabase/seed/demo.sql)
--
-- Filtra pela lista exata de protocolos do seed: chamados reais nunca
-- entram nesse delete. Rodar no SQL Editor do Supabase.
-- =====================================================================

begin;

create temp table demo_protocols (protocol text) on commit drop;
insert into demo_protocols values
  ('#TI-2026-K3M8'), ('#TI-2026-P9X2'), ('#TI-2026-R4T7'), ('#TI-2026-W2B5'),
  ('#TI-2026-H6N1'), ('#TI-2026-T8Q3'), ('#TI-2026-M1Z6'), ('#TI-2026-C5V9'),
  ('#TI-2026-J7D4'), ('#TI-2026-F3G8'), ('#TI-2026-L2S6'), ('#TI-2026-E9U1'),
  ('#TI-2026-Y4K7'), ('#TI-2026-N8A2');

-- Observações primeiro: a FK é "on delete restrict"
delete from public.ticket_notes
where ticket_id in (
  select t.id from public.tickets t
  join demo_protocols d on d.protocol = t.protocol
);

delete from public.tickets
where protocol in (select protocol from demo_protocols);

delete from public.ticket_lookup_attempts
where protocol in (select protocol from demo_protocols);

commit;
