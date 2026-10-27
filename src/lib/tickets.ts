import { supabase } from "./supabase";
import type {
  StaffTicket,
  TicketCategory,
  TicketNote,
  TicketPriority,
  TicketStatus,
} from "../types/ticket";

// Formato das linhas como vêm do Postgres (snake_case)
interface TicketNoteRow {
  id: string;
  ticket_id: string;
  body: string;
  is_public: boolean;
  created_at: string;
}

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
  ticket_notes: TicketNoteRow[];
}

// Traz o chamado e, pela chave estrangeira, as observações dele
// em uma única requisição (o PostgREST faz o "join")
const TICKET_WITH_NOTES =
  "*, ticket_notes(id, ticket_id, body, is_public, created_at)";

// Converte do formato do banco para o formato do front (camelCase)
function mapNoteRow(row: TicketNoteRow): TicketNote {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    body: row.body,
    isPublic: row.is_public,
    createdAt: row.created_at,
  };
}

function mapTicketRow(row: TicketRow): StaffTicket {
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
    notes: row.ticket_notes
      .map(mapNoteRow)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

// Só retorna dados para técnicos: a RLS filtra no banco
export async function fetchTickets(): Promise<StaffTicket[]> {
  const { data, error } = await supabase
    .from("tickets")
    .select(TICKET_WITH_NOTES)
    .order("created_at", { ascending: false })
    .returns<TicketRow[]>();

  if (error) throw error;
  return data.map(mapTicketRow);
}

// Devolve o chamado atualizado: o resolved_at vem do trigger no banco
export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<StaffTicket> {
  const { data, error } = await supabase
    .from("tickets")
    .update({ status })
    .eq("id", id)
    .select(TICKET_WITH_NOTES)
    .single<TicketRow>();

  if (error) throw error;
  return mapTicketRow(data);
}

export async function addTicketNote(
  ticketId: string,
  body: string,
  isPublic: boolean,
): Promise<TicketNote> {
  const { data, error } = await supabase
    .from("ticket_notes")
    .insert({ ticket_id: ticketId, body: body.trim(), is_public: isPublic })
    .select("id, ticket_id, body, is_public, created_at")
    .single<TicketNoteRow>();

  if (error) throw error;
  return mapNoteRow(data);
}
