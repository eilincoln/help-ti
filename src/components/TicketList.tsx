// src/components/TicketList.tsx
import { useEffect, useState } from "react";
import { fetchTickets } from "../lib/tickets";
import type { Ticket } from "../types/ticket";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  formatDateTime,
} from "../utils/labels";
import "./TicketList.css";

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    fetchTickets()
      .then(setTickets)
      .catch((error) => {
        console.error("Erro ao carregar chamados:", error);
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading)
    return <p className="ticket-list-message">Carregando chamados...</p>;

  if (hasError) {
    return (
      <p className="ticket-list-message" role="alert">
        Não foi possível carregar os chamados. Recarregue a página.
      </p>
    );
  }

  if (tickets.length === 0) {
    return <p className="ticket-list-message">Nenhum chamado registrado.</p>;
  }

  return (
    <ul className="ticket-list">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <article className="ticket-card">
            <header className="ticket-card-header">
              <h3 className="ticket-card-protocol">{ticket.protocol}</h3>
              <div className="ticket-card-badges">
                <span className={`badge-priority priority-${ticket.priority}`}>
                  {PRIORITY_LABELS[ticket.priority]}
                </span>
                <span className={`badge-status status-${ticket.status}`}>
                  {STATUS_LABELS[ticket.status]}
                </span>
              </div>
            </header>

            <p className="ticket-card-description">{ticket.description}</p>

            <footer className="ticket-card-meta">
              <span>
                {ticket.requesterName} · {ticket.department}
              </span>
              <span>{CATEGORY_LABELS[ticket.category]}</span>
              <time dateTime={ticket.createdAt}>
                {formatDateTime(ticket.createdAt)}
              </time>
            </footer>
          </article>
        </li>
      ))}
    </ul>
  );
}
