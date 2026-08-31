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

// Interface completa do chamado como será gravado no banco de dados
export interface Ticket extends CreateTicketDTO {
  id: string;
  protocol: string;
  status: TicketStatus;
  createdAt: string;
  resolvedAt?: string;
}
