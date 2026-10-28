// src/App.tsx
import { OpenTicketPage } from "./pages/OpenTicketPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { StaffPage } from "./pages/StaffPage";
import { TrackTicketPage } from "./pages/TrackTicketPage";

// Poucas telas: o endereço decide qual mostrar.
// Se o app crescer (detalhe do chamado, relatórios), trocar por um roteador.
const path = window.location.pathname;
const isStaffArea = path.startsWith("/painel");
const isTrackArea = path.startsWith("/consulta");
const isPrivacyArea = path.startsWith("/privacidade");
const isOpenArea = !isStaffArea && !isTrackArea && !isPrivacyArea;

// Topo de cada página: etiqueta + título + texto, no padrão do portfólio
const PAGE_HERO = isStaffArea
  ? { eyebrow: "área do TI", title: "Painel de chamados", lead: "" }
  : isTrackArea
    ? {
        eyebrow: "acompanhar",
        title: "Como está o seu chamado?",
        lead: "Informe o protocolo e o primeiro nome usado na abertura.",
      }
    : isPrivacyArea
      ? {
          eyebrow: "privacidade",
          title: "Como usamos seus dados",
          lead: "O mínimo necessário para resolver o seu chamado.",
        }
      : {
          eyebrow: "suporte de TI",
          title: "Como o TI pode ajudar?",
          lead: "Conte o que está acontecendo. Você recebe um protocolo para acompanhar o atendimento.",
        };

function CurrentPage() {
  if (isStaffArea) return <StaffPage />;
  if (isTrackArea) return <TrackTicketPage />;
  if (isPrivacyArea) return <PrivacyPage />;
  return <OpenTicketPage />;
}

export function App(): React.ReactElement {
  const containerClass = `app-container${isStaffArea ? " is-wide" : ""}`;

  return (
    <>
      <header className="topbar">
        <div className={`${containerClass} topbar-inner`}>
          <a className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              TI
            </span>
            HelpTI
          </a>
          {!isStaffArea && (
            <nav className="topbar-nav" aria-label="Principal">
              <ul>
                <li>
                  <a href="/" aria-current={isOpenArea ? "page" : undefined}>
                    Abrir chamado
                  </a>
                </li>
                <li>
                  <a
                    href="/consulta"
                    aria-current={isTrackArea ? "page" : undefined}
                  >
                    Acompanhar
                  </a>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </header>

      <div className="page-shell">
        <div className={containerClass}>
          <div className="page-hero">
            <span className="eyebrow">{PAGE_HERO.eyebrow}</span>
            <h1>{PAGE_HERO.title}</h1>
            {PAGE_HERO.lead && <p className="lead">{PAGE_HERO.lead}</p>}
          </div>
          <main>
            <CurrentPage />
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
