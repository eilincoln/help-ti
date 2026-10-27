// src/components/TicketList.tsx
import { useEffect, useState, type ChangeEvent } from "react";
import { fetchTickets, updateTicketStatus } from "../lib/tickets";
import type { StaffTicket, TicketNote, TicketStatus } from "../types/ticket";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  formatDateTime,
} from "../utils/labels";
import { TicketNotes } from "./TicketNotes";
import "./TicketList.css";

type View = "fila" | "resolvidos";

// Object.keys perde o tipo (vira string[]), por isso o "as"
const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as TicketStatus[];

export function TicketList() {
  const [tickets, setTickets] = useState<StaffTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [view, setView] = useState<View>("fila");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    fetchTickets()
      .then(setTickets)
      .catch((error) => {
        console.error("Erro ao carregar chamados:", error);
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleStatusChange(
    ticket: StaffTicket,
    e: ChangeEvent<HTMLSelectElement>,
  ) {
    const status = e.target.value as TicketStatus;
    setSavingId(ticket.id);
    setUpdateError("");

    try {
      const updated = await updateTicketStatus(ticket.id, status);
      // Troca só o chamado alterado, sem buscar a lista inteira de novo
      setTickets((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      setUpdateError(
        `Não foi possível atualizar o chamado ${ticket.protocol}. Tente novamente.`,
      );
    } finally {
      setSavingId(null);
    }
  }

  // Acrescenta a observação nova no histórico do chamado certo
  function handleNoteAdded(note: TicketNote) {
    setTickets((prev) =>
      prev.map((item) =>
        item.id === note.ticketId
          ? { ...item, notes: [...item.notes, note] }
          : item,
      ),
    );
  }

  if (isLoading)
    return <p className="ticket-list-message">Carregando chamados...</p>;

  if (hasError) {
    return (
      <p className="ticket-list-message" role="alert">
        Não foi possível carregar os chamados. Recarregue a página.
      </p>
    );
  }

  // Valores derivados: calculados a cada render, sem useState extra
  const queue = tickets.filter((t) => t.status !== "resolvido");
  const resolved = tickets.filter((t) => t.status === "resolvido");
  const visible = view === "fila" ? queue : resolved;

  return (
    <div className="ticket-list-wrapper">
      <div
        className="ticket-tabs ticket-tabs-sub"
        role="group"
        aria-label="Filtrar chamados"
      >
        <button
          type="button"
          className="ticket-tab"
          aria-pressed={view === "fila"}
          onClick={() => setView("fila")}
        >
          Na fila ({queue.length})
        </button>
        <button
          type="button"
          className="ticket-tab"
          aria-pressed={view === "resolvidos"}
          onClick={() => setView("resolvidos")}
        >
          Resolvidos ({resolved.length})
        </button>
      </div>

      {updateError && (
        <p className="form-error" role="alert">
          {updateError}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="ticket-list-message">
          {view === "fila"
            ? "Nenhum chamado na fila. Tudo em dia!"
            : "Nenhum chamado resolvido ainda."}
        </p>
      ) : (
        <ul className="ticket-list">
          {visible.map((ticket) => (
            <li key={ticket.id}>
              <article className="ticket-card">
                <header className="ticket-card-header">
                  <h3 className="ticket-card-protocol">{ticket.protocol}</h3>
                  <span
                    className={`badge-priority priority-${ticket.priority}`}
                  >
                    {PRIORITY_LABELS[ticket.priority]}
                  </span>
                </header>

                <p className="ticket-card-description">{ticket.description}</p>

                <footer className="ticket-card-meta">
                  <span>
                    {ticket.requesterName} · {ticket.department}
                  </span>
                  <span>{CATEGORY_LABELS[ticket.category]}</span>
                  <span>
                    Aberto em{" "}
                    <time dateTime={ticket.createdAt}>
                      {formatDateTime(ticket.createdAt)}
                    </time>
                  </span>
                  {ticket.resolvedAt && (
                    <span>
                      Resolvido em{" "}
                      <time dateTime={ticket.resolvedAt}>
                        {formatDateTime(ticket.resolvedAt)}
                      </time>
                    </span>
                  )}
                </footer>

                <div className="ticket-card-actions">
                  <label htmlFor={`status-${ticket.id}`}>Status</label>
                  <select
                    id={`status-${ticket.id}`}
                    className={`status-select status-${ticket.status}`}
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket, e)}
                    disabled={savingId === ticket.id}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                  {savingId === ticket.id && (
                    <span className="ticket-card-saving">Salvando...</span>
                  )}
                </div>
                <TicketNotes
                  ticketId={ticket.id}
                  notes={ticket.notes}
                  onNoteAdded={handleNoteAdded}
                />
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
