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

// "not_found" = protocolo e nome não conferem (não dizemos qual dos dois)
// "blocked"   = muitas tentativas erradas nesse protocolo; esperar 15 min
export type PublicTicketLookup =
  | { kind: "found"; ticket: PublicTicketStatus }
  | { kind: "not_found" }
  | { kind: "blocked" };

export async function fetchPublicTicketStatus(
  protocol: string,
  firstName: string,
): Promise<PublicTicketLookup> {
  const { data, error } = await supabase.rpc("get_ticket_status", {
    p_protocol: normalizeProtocol(protocol),
    p_first_name: firstName.trim(),
  });

  if (error) throw error;
  if (!data) return { kind: "not_found" };
  if ((data as { blocked?: boolean }).blocked) return { kind: "blocked" };

  const row = data as PublicTicketStatusRow;
  return {
    kind: "found",
    ticket: {
      protocol: row.protocol,
      category: row.category,
      status: row.status,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at ?? undefined,
      notes: row.notes.map((note) => ({
        body: note.body,
        createdAt: note.created_at,
      })),
    },
  };
}
