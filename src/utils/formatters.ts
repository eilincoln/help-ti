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
