// src/App.tsx
import { OpenTicketPage } from "./pages/OpenTicketPage";
import { StaffPage } from "./pages/StaffPage";

// Duas telas só: o endereço decide qual mostrar.
// Se o app crescer (detalhe do chamado, relatórios), trocar por um roteador.
const isStaffArea = window.location.pathname.startsWith("/painel");

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
      <main>{isStaffArea ? <StaffPage /> : <OpenTicketPage />}</main>
    </div>
  );
}

export default App;
