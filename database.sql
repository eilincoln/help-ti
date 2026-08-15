-- Inicio da criação de chamados do HelpTI
CREATE TABLE chamados(
  id BITGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  setor TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status TEXT DEFAULT 'Pendente',
  data_abertura TIMESTAMPTZ DEFAULT NOW(),
  retorno_tecnico TEXT DEFAULT NULL 
);

--Ativa a segurança de RLS 
ALTER TABLE chamados ENABLE ROW LEVEL SECURITY;


-- Cria uma regra de segurança : Quem tiver a chave pública anônima pode APENAS criar chamaos
CREATE POLICY "Permitir inserção anônima" 
ON chamados 
FOR INSERT 
WITH CHECK (true);