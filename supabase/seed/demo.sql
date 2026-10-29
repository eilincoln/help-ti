-- =====================================================================
-- Seed de demonstração (dados 100% fictícios)
--
-- Uso: gravar vídeo e tirar prints do portfólio SEM dados reais.
-- Rodar no SQL Editor do Supabase (papel postgres ignora RLS e permite
-- definir created_at/resolved_at no passado, para a aba Resultados
-- ter números em "Este mês" e "Mês passado").
--
-- NUNCA rodar em banco com chamados reais.
-- Para desfazer: supabase/seed/demo_remove.sql
-- =====================================================================

begin;

insert into public.tickets
  (protocol, requester_name, department, category, priority, description,
   status, created_at, resolved_at)
values
  -- Chamado "vitrine" da consulta pública: protocolo + "Mariana"
  ('#TI-2026-K3M8', 'Mariana Souza', 'Financeiro', 'software', 'alta',
   'O sistema de boletos fecha sozinho quando tento gerar a remessa do banco.',
   'em_andamento', now() - interval '1 day 3 hours', null),

  ('#TI-2026-P9X2', 'Carlos Menezes', 'Comercial', 'hardware', 'media',
   'Notebook muito lento para ligar, demora uns 10 minutos para abrir o e-mail.',
   'aberto', now() - interval '2 hours', null),

  ('#TI-2026-R4T7', 'Juliana Prado', 'Recursos Humanos', 'acesso', 'urgente',
   'Colaboradora nova começa amanhã e ainda não tem usuário de rede nem e-mail.',
   'aberto', now() - interval '40 minutes', null),

  ('#TI-2026-W2B5', 'Roberto Lima', 'Compras', 'rede', 'alta',
   'Wi-Fi da sala de reunião caindo toda hora durante as chamadas de vídeo.',
   'aguardando', now() - interval '3 days', null),

  ('#TI-2026-H6N1', 'Fernanda Alves', 'Recepção', 'hardware', 'baixa',
   'Impressora da recepção imprimindo com manchas no canto da folha.',
   'resolvido', now() - interval '6 days', now() - interval '5 days 20 hours'),

  ('#TI-2026-T8Q3', 'André Castro', 'Financeiro', 'acesso', 'media',
   'Preciso de acesso à pasta compartilhada de notas fiscais.',
   'resolvido', now() - interval '9 days', now() - interval '8 days 22 hours'),

  ('#TI-2026-M1Z6', 'Patrícia Nunes', 'Contabilidade', 'software', 'alta',
   'Planilha de fechamento travando ao abrir, aparece erro de arquivo corrompido.',
   'resolvido', now() - interval '12 days', now() - interval '11 days 18 hours'),

  ('#TI-2026-C5V9', 'Lucas Ferreira', 'Comercial', 'rede', 'urgente',
   'Sem internet em todo o setor comercial desde as 8h.',
   'resolvido', now() - interval '15 days', now() - interval '14 days 23 hours'),

  ('#TI-2026-J7D4', 'Beatriz Rocha', 'Diretoria', 'outro', 'baixa',
   'Instalar um segundo monitor na mesa da diretoria.',
   'resolvido', now() - interval '20 days', now() - interval '18 days'),

  ('#TI-2026-F3G8', 'Thiago Martins', 'Compras', 'software', 'media',
   'Atualização do Windows pedindo reinício toda hora e atrapalhando o trabalho.',
   'resolvido', now() - interval '33 days', now() - interval '32 days 20 hours'),

  ('#TI-2026-L2S6', 'Camila Duarte', 'Recursos Humanos', 'hardware', 'alta',
   'Teclado com várias teclas falhando, não consigo digitar a folha de ponto.',
   'resolvido', now() - interval '38 days', now() - interval '37 days 22 hours'),

  ('#TI-2026-E9U1', 'Gustavo Pires', 'Financeiro', 'rede', 'media',
   'Não consigo acessar o sistema do banco, diz que o site não é seguro.',
   'resolvido', now() - interval '42 days', now() - interval '41 days 19 hours'),

  ('#TI-2026-Y4K7', 'Renata Gomes', 'Recepção', 'acesso', 'baixa',
   'Esqueci a senha do computador da recepção.',
   'resolvido', now() - interval '47 days', now() - interval '46 days 23 hours'),

  ('#TI-2026-N8A2', 'Diego Ribeiro', 'Contabilidade', 'software', 'urgente',
   'Sistema contábil não abre e hoje é o último dia de entrega das guias.',
   'resolvido', now() - interval '51 days', now() - interval '50 days 22 hours');

-- Observações: públicas aparecem na /consulta, internas só no painel
insert into public.ticket_notes (ticket_id, body, is_public, created_at)
select t.id, n.body, n.is_public, now() - n.ago
from (values
  ('#TI-2026-K3M8', 'Recebemos seu chamado e já estamos analisando o sistema de boletos.',
   true,  interval '1 day 2 hours'),
  ('#TI-2026-K3M8', 'Erro acontece só na versão 4.2; testar reinstalação limpa.',
   false, interval '1 day 1 hour'),
  ('#TI-2026-K3M8', 'Encontramos a causa. A correção será aplicada hoje à tarde.',
   true,  interval '3 hours'),
  ('#TI-2026-W2B5', 'Roteador com defeito. Aguardando a entrega do equipamento novo.',
   true,  interval '2 days'),
  ('#TI-2026-H6N1', 'Cilindro do toner trocado. Impressão normalizada.',
   true,  interval '5 days 20 hours')
) as n(protocol, body, is_public, ago)
join public.tickets t on t.protocol = n.protocol;

commit;
