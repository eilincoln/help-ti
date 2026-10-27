import type { SubmittedTicket } from "../types/ticket";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "../utils/labels";

// Só dígitos, com DDI + DDD (ex.: 55 11 9XXXXXXXX). Fica no .env.local,
// não no código. Atenção: VITE_ vai para o JavaScript público do site.
const itWhatsAppNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.replace(
  /\D/g,
  "",
);

// Monta o link do WhatsApp com a mensagem já escrita.
// Sem número configurado, devolve null e a tela esconde o botão.
export function buildWhatsAppLink(ticket: SubmittedTicket): string | null {
  if (!itWhatsAppNumber) return null;

  const trackUrl = `${window.location.origin}/consulta?protocolo=${encodeURIComponent(ticket.protocol)}`;
  // *texto* vira negrito no WhatsApp. O link fica sozinho na última
  // linha para o app reconhecer e deixar clicável.
  const message = [
    "👋 Olá, TI!",
    "Acabei de abrir um chamado no *HelpTI*.",
    "",
    `🎫 *Protocolo:* ${ticket.protocol}`,
    `📂 *Categoria:* ${CATEGORY_LABELS[ticket.category]}`,
    `⚡ *Prioridade:* ${PRIORITY_LABELS[ticket.priority]}`,
    "",
    "🔎 Acompanhe por aqui:",
    trackUrl,
  ].join("\n");

  // api.whatsapp.com direto, e não wa.me: o redirecionamento do wa.me
  // troca os emojis por "�" no meio do caminho.
  const params = new URLSearchParams({
    phone: itWhatsAppNumber,
    text: message,
  });
  return `https://api.whatsapp.com/send?${params}`;
}
