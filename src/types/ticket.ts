// Tipos literais estritos para categorias e prioridades
export type TicketCategory =
  | "hardware"
  | "software"
  | "rede"
  | "acesso"
  | "outro";
export type TicketPriority = "baixa" | "media" | "alta" | "urgente";
export type TicketStatus =
  | "aberto"
  | "em_andamento"
  | "aguardando"
  | "resolvido";

// Interface que define a estrutura de dados para criar um novo chamado
export interface CreateTicketDTO {
  requesterName: string;
  department: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
}

// O que quem abriu o chamado pode ver: os próprios dados + protocolo.
// (Visitante anônimo não tem permissão de leitura no banco.)
export interface SubmittedTicket extends CreateTicketDTO {
  protocol: string;
}

// Interface completa do chamado como será gravado no banco de dados
export interface Ticket extends CreateTicketDTO {
  id: string;
  protocol: string;
  status: TicketStatus;
  createdAt: string;
  resolvedAt?: string;
}

// Observação registrada pelo técnico no histórico do chamado
export interface TicketNote {
  id: string;
  ticketId: string;
  body: string;
  isPublic: boolean;
  createdAt: string;
}

// Chamado como o técnico vê no painel: dados + histórico
export interface StaffTicket extends Ticket {
  notes: TicketNote[];
}

// O que a consulta pública devolve: sem nome, setor ou descrição
export interface PublicTicketStatus {
  protocol: string;
  category: TicketCategory;
  status: TicketStatus;
  createdAt: string;
  resolvedAt?: string;
  notes: { body: string; createdAt: string }[];
}
