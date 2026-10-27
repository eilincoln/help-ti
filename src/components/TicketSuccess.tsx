import type { SubmittedTicket } from "../types/ticket";
import "./TicketSuccess.css";

interface TicketSuccessProps {
  ticket: SubmittedTicket;
  onReset: () => void;
}

export function TicketSuccess({ ticket, onReset }: TicketSuccessProps) {
  return (
    <section className="success-container" aria-live="polite">
      <div className="success-badge">✓</div>

      <h2>Chamado Aberto com Sucesso!</h2>
      <p className="success-subtitle">
        Sua solicitação técnica foi registrada na fila de atendimento.
      </p>

      {/* Caixa de Destaque do Protocolo */}
      <div className="protocol-box">
        <span>Número do Protocolo</span>
        <strong>{ticket.protocol}</strong>
      </div>

      {/* Resumo dos Dados Registrados */}
      <div className="summary-list">
        <div className="summary-item">
          <span>Solicitante:</span>
          <strong>
            {ticket.requesterName} ({ticket.department})
          </strong>
        </div>
        <div className="summary-item">
          <span>Categoria:</span>
          <strong className="capitalize">{ticket.category}</strong>
        </div>
        <div className="summary-item">
          <span>Prioridade:</span>
          <strong className={`badge-priority priority-${ticket.priority}`}>
            {ticket.priority.toUpperCase()}
          </strong>
        </div>
      </div>

      <button type="button" className="reset-btn" onClick={onReset}>
        Abrir Outro Chamado
      </button>
    </section>
  );
}
