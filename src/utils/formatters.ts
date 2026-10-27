const PROTOCOL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Gera sempre 4 caracteres (formato validado no banco: #TI-AAAA-XXXX)
export function generateTicketProtocol(): string {
  const year = new Date().getFullYear();
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const randomCode = Array.from(
    bytes,
    (byte) => PROTOCOL_CHARS[byte % PROTOCOL_CHARS.length],
  ).join("");
  return `#TI-${year}-${randomCode}`;
}

// Aceita "ti-2026-ab12", "#TI-2026-AB12 " etc. e devolve "#TI-2026-AB12"
export function normalizeProtocol(value: string): string {
  const clean = value.trim().toUpperCase().replace(/^#/, "");
  return `#${clean}`;
}

// Duração legível: "45 min", "3 h 20 min", "2 d 4 h"
export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60_000);
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 24) {
    const minutes = totalMinutes % 60;
    return minutes ? `${totalHours} h ${minutes} min` : `${totalHours} h`;
  }

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return hours ? `${days} d ${hours} h` : `${days} d`;
}
