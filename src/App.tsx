// src/App.tsx
import { useState } from "react";
import { TicketForm } from "./components/TicketForm";
import { TicketSuccess } from "./components/TicketSuccess";
import { generateTicketProtocol } from "./utils/formatters";
import { supabase } from "./lib/supabase";
import type { CreateTicketDTO, Ticket } from "./types/ticket";

export function App(): React.ReactElement {
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateTicket(data: CreateTicketDTO) {
    setIsSubmitting(true);

    const protocol = generateTicketProtocol();

    const { data: insertedData, error } = await supabase
      .from("tickets")
      .insert([
        {
          protocol,
          requester_name: data.requesterName,
          department: data.department,
          category: data.category,
          priority: data.priority,
          description: data.description,
          status: "aberto",
        },
      ])
      .select()
      .single();

    setIsSubmitting(false);

    if (error) {
      console.error("Erro ao registrar chamado:", error);
      alert("Houve um erro ao registrar sua solicitação. Tente novamente.");
      return;
    }

    if (insertedData) {
      setCreatedTicket({
        id: insertedData.id,
        protocol: insertedData.protocol,
        requesterName: insertedData.requester_name,
        department: insertedData.department,
        category: insertedData.category,
        priority: insertedData.priority,
        description: insertedData.description,
        status: insertedData.status,
        createdAt: insertedData.created_at,
      });
    }
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
          <TicketForm
            onSubmitTicket={handleCreateTicket}
            isLoading={isSubmitting}
          />
        )}
      </main>
    </div>
  );
}

export default App;
