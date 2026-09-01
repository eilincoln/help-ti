export function generateTicketProtocol(): string {
  const year = new Date().getFullYear();
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `#TI-${year}-${randomCode}`;
}
