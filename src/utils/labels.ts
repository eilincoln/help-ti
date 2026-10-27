import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "../types/ticket";

// Record<Chave, Valor> obriga a ter um texto para CADA valor do tipo:
// se um status novo for criado, o TypeScript aponta o que falta aqui.
export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  hardware: "Hardware",
  software: "Software",
  rede: "Rede / Internet",
  acesso: "Acessos & Senhas",
  outro: "Outro",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  aguardando: "Aguardando",
  resolvido: "Resolvido",
};

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}
