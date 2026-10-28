// src/pages/PrivacyPage.tsx
import "./PrivacyPage.css";

// Aviso de privacidade (LGPD): só promete o que o sistema já garante
export function PrivacyPage() {
  return (
    <div className="privacy-page">
      <article className="privacy-card">
        <section>
          <h2>O que coletamos</h2>
          <p>
            Ao abrir um chamado, você informa seu nome, setor, a categoria do
            problema, a prioridade e uma descrição. Não pedimos documentos,
            e-mail nem telefone.
          </p>
        </section>

        <section>
          <h2>Para que usamos</h2>
          <p>
            Só para atender o seu chamado e manter o histórico de atendimentos
            do TI. Números gerais, como a quantidade de chamados por categoria,
            ajudam a melhorar o suporte, sem identificar ninguém.
          </p>
        </section>

        <section>
          <h2>Quem vê</h2>
          <p>
            Apenas a equipe de TI, com login. A consulta pública de andamento
            mostra só o protocolo, a categoria, o status, as datas e as
            respostas do TI, nunca o seu nome ou a descrição.
          </p>
        </section>

        <section>
          <h2>Onde ficam guardados</h2>
          <p>
            Em um banco de dados na nuvem com acesso restrito. Os dados não são
            vendidos nem compartilhados com terceiros.
          </p>
        </section>

        <section>
          <h2>Seus direitos</h2>
          <p>
            Pela LGPD (Lei 13.709/2018), você pode pedir para ver, corrigir ou
            excluir seus dados. Basta falar com o TI.
          </p>
        </section>
      </article>

      <p className="page-link">
        <a href="/">Abrir um chamado</a>
      </p>
    </div>
  );
}
