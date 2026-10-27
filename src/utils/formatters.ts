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
