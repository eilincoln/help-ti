import { supabase } from "./supabase";
import type {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "../types/ticket";

// Formato da linha como vem do Postgres (snake_case)
interface TicketRow {
  id: string;
  protocol: string;
  requester_name: string;
  department: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  status: TicketStatus;
  created_at: string;
  resolved_at: string | null;
}

// Converte do formato do banco para o formato do front (camelCase)
function mapTicketRow(row: TicketRow): Ticket {
  return {
    id: row.id,
    protocol: row.protocol,
    requesterName: row.requester_name,
    department: row.department,
    category: row.category,
    priority: row.priority,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at ?? undefined,
  };
}

// Só retorna dados para técnicos: a RLS filtra no banco
export async function fetchTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<TicketRow[]>();

  if (error) throw error;
  return data.map(mapTicketRow);
}
