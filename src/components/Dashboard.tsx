// src/components/Dashboard.tsx
import { useEffect, useState } from "react";
import {
  PERIOD_LABELS,
  fetchDashboard,
  type CountItem,
  type DashboardPeriod,
  type DashboardStats,
} from "../lib/dashboard";
import { formatDuration } from "../utils/formatters";
import "./Dashboard.css";

const PERIOD_OPTIONS = Object.keys(PERIOD_LABELS) as DashboardPeriod[];

// Resultado guardado junto com o período que o gerou: se o técnico
// trocar de período rápido, a resposta antiga não aparece na tela nova.
type DashboardResult =
  | { period: DashboardPeriod; stats: DashboardStats }
  | { period: DashboardPeriod; error: true };

export function Dashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("mes_atual");
  const [result, setResult] = useState<DashboardResult | null>(null);

  useEffect(() => {
    let isCurrent = true;
    fetchDashboard(period)
      .then((stats) => {
        if (isCurrent) setResult({ period, stats });
      })
      .catch((error) => {
        console.error("Erro ao carregar resultados:", error);
        if (isCurrent) setResult({ period, error: true });
      });
    // Cleanup: roda quando o período muda antes da resposta chegar
    return () => {
      isCurrent = false;
    };
  }, [period]);

  const isLoading = !result || result.period !== period;

  return (
    <div className="dashboard">
      <div className="ticket-tabs" role="group" aria-label="Período">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className="ticket-tab"
            aria-pressed={period === option}
            onClick={() => setPeriod(option)}
          >
            {PERIOD_LABELS[option]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="dashboard-message">Calculando resultados...</p>
      ) : "error" in result ? (
        <p className="dashboard-message" role="alert">
          Não foi possível carregar os resultados. Recarregue a página.
        </p>
      ) : result.stats.total === 0 ? (
        <p className="dashboard-message">
          Nenhum chamado aberto neste período.
        </p>
      ) : (
        <DashboardContent stats={result.stats} />
      )}
    </div>
  );
}

function DashboardContent({ stats }: { stats: DashboardStats }) {
  return (
    <>
      <dl className="stat-grid">
        <StatTile label="Chamados abertos" value={String(stats.total)} />
        <StatTile label="Resolvidos" value={String(stats.resolved)} />
        <StatTile label="Ainda em aberto" value={String(stats.open)} />
        <StatTile
          label="Tempo médio de resolução"
          value={
            stats.avgResolutionMs === null
              ? "—"
              : formatDuration(stats.avgResolutionMs)
          }
        />
      </dl>

      <div className="bar-grid">
        <BarList
          title="Por categoria"
          items={stats.byCategory}
          total={stats.total}
        />
        <BarList
          title="Por setor"
          items={stats.byDepartment}
          total={stats.total}
        />
        <BarList
          title="Por prioridade"
          items={stats.byPriority}
          total={stats.total}
        />
      </div>

      <p className="dashboard-hint">
        Considera os chamados abertos no período escolhido.
      </p>
    </>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-tile">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

interface BarListProps {
  title: string;
  items: CountItem[];
  total: number;
}

// Barra horizontal em CSS puro: largura = quantidade / maior quantidade.
// O número fica escrito ao lado, então a barra nunca é a única informação.
function BarList({ title, items, total }: BarListProps) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <section className="bar-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => {
          const percent = Math.round((item.count / total) * 100);
          return (
            <li
              key={item.label}
              className="bar-row"
              title={`${item.label}: ${item.count} chamado(s), ${percent}% do total`}
            >
              <span className="bar-label">{item.label}</span>
              <span className="bar-track" aria-hidden="true">
                <span
                  className="bar-fill"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </span>
              <span className="bar-value">
                {item.count} <small>({percent}%)</small>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
