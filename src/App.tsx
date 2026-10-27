// src/App.tsx
import { useState } from "react";
import { TicketForm } from "./components/TicketForm";
import { TicketSuccess } from "./components/TicketSuccess";
import { generateTicketProtocol } from "./utils/formatters";
import { supabase } from "./lib/supabase";
import type { CreateTicketDTO, SubmittedTicket } from "./types/ticket";

// Código do Postgres para violação de UNIQUE (protocolo repetido)
const UNIQUE_VIOLATION = "23505";
const MAX_ATTEMPTS = 3;

export function App(): React.ReactElement {
  const [createdTicket, setCreatedTicket] = useState<SubmittedTicket | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateTicket(data: CreateTicketDTO) {
    setIsSubmitting(true);

    // Sem .select(): o visitante só tem permissão de inserir, não de ler.
    // Status, id e datas ficam com os valores padrão do banco.
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const protocol = generateTicketProtocol();

      const { error } = await supabase.from("tickets").insert({
        protocol,
        requester_name: data.requesterName.trim(),
        department: data.department.trim(),
        category: data.category,
        priority: data.priority,
        description: data.description.trim(),
      });

      if (!error) {
        setIsSubmitting(false);
        setCreatedTicket({ ...data, protocol });
        return;
      }

      if (error.code !== UNIQUE_VIOLATION) {
        console.error("Erro ao registrar chamado:", error);
        break;
      }
    }

    setIsSubmitting(false);
    alert("Houve um erro ao registrar sua solicitação. Tente novamente.");
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
