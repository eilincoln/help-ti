// src/App.tsx
import { OpenTicketPage } from "./pages/OpenTicketPage";
import { StaffPage } from "./pages/StaffPage";
import { TrackTicketPage } from "./pages/TrackTicketPage";

// Poucas telas: o endereço decide qual mostrar.
// Se o app crescer (detalhe do chamado, relatórios), trocar por um roteador.
const path = window.location.pathname;
const isStaffArea = path.startsWith("/painel");
const isTrackArea = path.startsWith("/consulta");

function CurrentPage() {
  if (isStaffArea) return <StaffPage />;
  if (isTrackArea) return <TrackTicketPage />;
  return <OpenTicketPage />;
}

export function App(): React.ReactElement {
  return (
    <div className="app-container">
      <header className="main-header">
        <h1>HelpTI</h1>
        <p>
          {isStaffArea
            ? "Painel da Equipe de TI"
            : "Central de Atendimento e Suporte de TI"}
        </p>
      </header>
      <main>
        <CurrentPage />
      </main>
    </div>
  );
}

export default App;
