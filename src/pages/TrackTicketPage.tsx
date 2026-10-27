// src/pages/TrackTicketPage.tsx
import { useState, type FormEvent } from "react";
import { fetchPublicTicketStatus } from "../lib/publicTicket";
import type { PublicTicketStatus } from "../types/ticket";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  formatDateTime,
} from "../utils/labels";
import "../components/TicketForm.css";
import "./TrackTicketPage.css";

// Permite links prontos: /consulta?protocolo=TI-2026-AB12
const initialProtocol =
  new URLSearchParams(window.location.search).get("protocolo") ?? "";

export function TrackTicketPage() {
  const [protocol, setProtocol] = useState(initialProtocol);
  const [firstName, setFirstName] = useState("");
  const [result, setResult] = useState<PublicTicketStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setResult(null);

    try {
      const ticket = await fetchPublicTicketStatus(protocol, firstName);
      if (ticket) {
        setResult(ticket);
      } else {
        setErrorMessage(
          "Chamado não encontrado. Confira o protocolo e o primeiro nome usado na abertura.",
        );
      }
    } catch (error) {
      console.error("Erro ao consultar chamado:", error);
      setErrorMessage("Não foi possível consultar agora. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="track-page">
      <form className="ticket-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="protocol">Protocolo</label>
            <input
              type="text"
              id="protocol"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              placeholder="Ex: #TI-2026-AB12"
              autoCapitalize="characters"
              spellCheck={false}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="firstName">Primeiro nome</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ex: João"
              autoComplete="given-name"
              minLength={2}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {errorMessage && (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        )}

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? "Consultando..." : "Consultar"}
        </button>
      </form>

      {result && (
        <section className="track-result" aria-live="polite">
          <header className="track-result-header">
            <div>
              <span className="track-result-label">Protocolo</span>
              <h3 className="track-result-protocol">{result.protocol}</h3>
            </div>
            <span className={`badge-status status-${result.status}`}>
              {STATUS_LABELS[result.status]}
            </span>
          </header>

          <dl className="track-result-details">
            <div>
              <dt>Categoria</dt>
              <dd>{CATEGORY_LABELS[result.category]}</dd>
            </div>
            <div>
              <dt>Aberto em</dt>
              <dd>
                <time dateTime={result.createdAt}>
                  {formatDateTime(result.createdAt)}
                </time>
              </dd>
            </div>
            {result.resolvedAt && (
              <div>
                <dt>Resolvido em</dt>
                <dd>
                  <time dateTime={result.resolvedAt}>
                    {formatDateTime(result.resolvedAt)}
                  </time>
                </dd>
              </div>
            )}
          </dl>

          <h4 className="track-result-subtitle">
            Atualizações da equipe de TI
          </h4>
          {result.notes.length === 0 ? (
            <p className="track-result-empty">
              Ainda não há atualizações. Seu chamado está na fila de
              atendimento.
            </p>
          ) : (
            <ol className="track-timeline">
              {result.notes.map((note, index) => (
                <li key={`${note.createdAt}-${index}`}>
                  <time dateTime={note.createdAt}>
                    {formatDateTime(note.createdAt)}
                  </time>
                  <p>{note.body}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      <p className="page-link">
        <a href="/">Abrir um novo chamado</a>
      </p>
    </div>
  );
}
