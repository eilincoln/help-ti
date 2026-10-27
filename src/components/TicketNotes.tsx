// src/components/TicketNotes.tsx
import { useState, type FormEvent } from "react";
import { addTicketNote } from "../lib/tickets";
import type { TicketNote } from "../types/ticket";
import { formatDateTime } from "../utils/labels";
import "./TicketNotes.css";

interface TicketNotesProps {
  ticketId: string;
  notes: TicketNote[];
  onNoteAdded: (note: TicketNote) => void;
}

const MAX_LENGTH = 1000;

export function TicketNotes({
  ticketId,
  notes,
  onNoteAdded,
}: TicketNotesProps) {
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body.trim()) return;

    setIsSaving(true);
    setErrorMessage("");

    try {
      const note = await addTicketNote(ticketId, body, isPublic);
      onNoteAdded(note);
      setBody("");
      setIsPublic(true);
    } catch (error) {
      console.error("Erro ao salvar observação:", error);
      setErrorMessage("Não foi possível salvar a observação. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <details className="ticket-notes">
      <summary>Observações ({notes.length})</summary>

      {notes.length > 0 && (
        <ol className="ticket-notes-list">
          {notes.map((note) => (
            <li key={note.id} className="ticket-note">
              <div className="ticket-note-meta">
                <time dateTime={note.createdAt}>
                  {formatDateTime(note.createdAt)}
                </time>
                {!note.isPublic && (
                  <span className="ticket-note-private">Interna</span>
                )}
              </div>
              <p className="ticket-note-body">{note.body}</p>
            </li>
          ))}
        </ol>
      )}

      <form className="ticket-notes-form" onSubmit={handleSubmit}>
        <label htmlFor={`note-${ticketId}`}>Nova observação</label>
        <textarea
          id={`note-${ticketId}`}
          rows={2}
          maxLength={MAX_LENGTH}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Ex: Aguardando aprovação do gestor para compra da peça."
          disabled={isSaving}
        />

        <div className="ticket-notes-form-footer">
          <label className="ticket-notes-checkbox">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isSaving}
            />
            Visível para o solicitante
          </label>
          <button
            type="submit"
            className="ticket-notes-submit"
            disabled={isSaving || !body.trim()}
          >
            {isSaving ? "Salvando..." : "Adicionar"}
          </button>
        </div>

        {errorMessage && (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </details>
  );
}
