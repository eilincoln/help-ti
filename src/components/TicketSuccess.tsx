import { useEffect } from "react";
import confetti from "canvas-confetti";
import type { SubmittedTicket } from "../types/ticket";
import { buildWhatsAppLink } from "../lib/whatsapp";
import "./TicketSuccess.css";

// Tons de roxo da marca + branco e verde de "deu certo"
const CONFETTI_COLORS = ["#8844ee", "#a674f5", "#9a5ef2", "#ffffff", "#86efac"];

// Dois jatos, um de cada canto de baixo, em direção ao centro
function celebrate() {
  const shared = {
    particleCount: 70,
    spread: 60,
    startVelocity: 55,
    colors: CONFETTI_COLORS,
    // Respeita quem pediu "reduzir movimento" no sistema
    disableForReducedMotion: true,
  };
  confetti({ ...shared, angle: 60, origin: { x: 0, y: 0.9 } });
  confetti({ ...shared, angle: 120, origin: { x: 1, y: 0.9 } });
}

interface TicketSuccessProps {
  ticket: SubmittedTicket;
  onReset: () => void;
}

export function TicketSuccess({ ticket, onReset }: TicketSuccessProps) {
  const whatsAppLink = buildWhatsAppLink(ticket);

  useEffect(() => {
    celebrate();
    // Limpa os confetes se a tela sair antes de eles caírem. No modo de
    // desenvolvimento o React monta 2x (StrictMode): sem isso, seriam 4 jatos.
    return () => {
      confetti.reset();
    };
  }, []);

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

      <p className="success-track-hint">
        Guarde o protocolo. Para acompanhar, use ele e o seu primeiro nome.
      </p>
      <a
        className="track-btn"
        href={`/consulta?protocolo=${encodeURIComponent(ticket.protocol)}`}
      >
        Acompanhar este chamado
      </a>

      {whatsAppLink && (
        <a
          className="whatsapp-btn"
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Avisar o TI no WhatsApp
        </a>
      )}

      <button type="button" className="reset-btn" onClick={onReset}>
        Abrir Outro Chamado
      </button>
    </section>
  );
}
