// src/pages/StaffPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useSession } from "../hooks/useSession";
import { LoginForm } from "../components/LoginForm";
import { TicketList } from "../components/TicketList";
import "./StaffPage.css";

export function StaffPage() {
  const session = useSession();
  const userId = session?.user.id;
  // Guarda de qual usuário é a resposta, para não reaproveitar
  // o resultado de um login anterior
  const [staffCheck, setStaffCheck] = useState<{
    userId: string;
    isStaff: boolean;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Pergunta ao banco se este usuário está na tabela staff.
    // Só melhora a experiência: quem protege os dados é a RLS.
    supabase.rpc("is_staff").then(({ data, error }) => {
      if (error) console.error("Erro ao verificar permissão:", error);
      setStaffCheck({ userId, isStaff: data === true });
    });
  }, [userId]);

  function handleLogout() {
    supabase.auth.signOut();
  }

  if (session === undefined) {
    return <p className="staff-message">Verificando sessão...</p>;
  }

  if (session === null) return <LoginForm />;

  if (!staffCheck || staffCheck.userId !== userId) {
    return <p className="staff-message">Verificando permissão...</p>;
  }

  if (!staffCheck.isStaff) {
    return (
      <section className="staff-message" role="alert">
        <p>Sua conta não tem acesso ao painel de chamados.</p>
        <button type="button" className="staff-logout" onClick={handleLogout}>
          Sair
        </button>
      </section>
    );
  }

  return (
    <section className="staff-panel">
      <header className="staff-panel-header">
        <h2>Fila de Chamados</h2>
        <div className="staff-panel-user">
          <span>{session.user.email}</span>
          <button type="button" className="staff-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>
      <TicketList />
    </section>
  );
}
