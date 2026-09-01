// src/App.tsx
import { useState } from "react";
import { TicketForm } from "./components/TicketForm";
import { TicketSuccess } from "./components/TicketSuccess";
import { generateTicketProtocol } from "./utils/formatters";
import type { CreateTicketDTO, Ticket } from "./types/ticket";

export function App(): React.ReactElement {
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  function handleCreateTicket(data: CreateTicketDTO) {
    const newTicket: Ticket = {
      ...data,
      id: crypto.randomUUID(),
      protocol: generateTicketProtocol(),
      status: "aberto",
      createdAt: new Date().toISOString(),
    };

    setCreatedTicket(newTicket);
  }

  function handleReset() {
    setCreatedTicket(null);
  }

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>HelpTI</h1>
        <p>Central de Atendimento e Suporte de TI</p>
      </header>
      <main>
        {createdTicket ? (
          <TicketSuccess ticket={createdTicket} onReset={handleReset} />
        ) : (
          <TicketForm onSubmitTicket={handleCreateTicket} />
        )}
      </main>
    </div>
  );
}

export default App;
