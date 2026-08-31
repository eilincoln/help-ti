// src/App.tsx
import { TicketForm } from "./components/TicketForm";
import type { CreateTicketDTO } from "./types/ticket";

export function App(): React.ReactElement {
  function handleCreateTicket(data: CreateTicketDTO) {
    console.log("Dados do chamado recebidos:", data);
    alert(
      `Chamado recebido com sucesso para o solicitante: ${data.requesterName}`,
    );
  }

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>HelpTI</h1>
        <p>Central de Atendimento e Suporte de TI</p>
      </header>
      <main>
        <TicketForm onSubmitTicket={handleCreateTicket} />
      </main>
    </div>
  );
}

export default App;
