import { supabase } from "./supabase";
import { normalizeProtocol } from "../utils/formatters";
import type {
  PublicTicketStatus,
  TicketCategory,
  TicketStatus,
} from "../types/ticket";

// Formato do JSON montado pela função get_ticket_status no banco
interface PublicTicketStatusRow {
  protocol: string;
  category: TicketCategory;
  status: TicketStatus;
  created_at: string;
  resolved_at: string | null;
  notes: { body: string; created_at: string }[];
}

// null = protocolo e nome não conferem (não dizemos qual dos dois)
export async function fetchPublicTicketStatus(
  protocol: string,
  firstName: string,
): Promise<PublicTicketStatus | null> {
  const { data, error } = await supabase.rpc("get_ticket_status", {
    p_protocol: normalizeProtocol(protocol),
    p_first_name: firstName.trim(),
  });

  if (error) throw error;
  if (!data) return null;

  const row = data as PublicTicketStatusRow;
  return {
    protocol: row.protocol,
    category: row.category,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at ?? undefined,
    notes: row.notes.map((note) => ({
      body: note.body,
      createdAt: note.created_at,
    })),
  };
}
