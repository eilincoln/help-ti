import { supabase } from "./supabase";
import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "../types/ticket";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "../utils/labels";

export type DashboardPeriod = "mes_atual" | "mes_passado" | "90_dias" | "tudo";

export const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  mes_atual: "Este mês",
  mes_passado: "Mês passado",
  "90_dias": "Últimos 90 dias",
  tudo: "Tudo",
};

export interface CountItem {
  label: string;
  count: number;
}

export interface DashboardStats {
  total: number;
  resolved: number;
  open: number;
  // null quando nenhum chamado do período foi resolvido ainda
  avgResolutionMs: number | null;
  byCategory: CountItem[];
  byDepartment: CountItem[];
  byPriority: CountItem[];
}

// Só as colunas que viram número: nome, descrição e protocolo
// nem saem do banco (minimização de dados, LGPD).
interface DashboardRow {
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  department: string;
  created_at: string;
  resolved_at: string | null;
}

const DASHBOARD_COLUMNS =
  "category, priority, status, department, created_at, resolved_at";

// Setores além deste limite são somados em "Outros"
const MAX_DEPARTMENTS = 8;

// Início e fim do período no fuso do navegador (fim exclusivo)
function getPeriodRange(period: DashboardPeriod, now: Date) {
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (period) {
    case "mes_atual":
      return { start: new Date(year, month, 1) };
    case "mes_passado":
      return {
        start: new Date(year, month - 1, 1),
        end: new Date(year, month, 1),
      };
    case "90_dias":
      return { start: new Date(year, month, now.getDate() - 90) };
    case "tudo":
      return {};
  }
}

// O setor é digitado à mão: "Financeiro", "financeiro " e "Financeíro"
// viram a mesma chave (sem acento, minúsculo, sem espaços nas pontas).
function departmentKey(name: string): string {
  return name.trim().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function countDepartments(rows: DashboardRow[]): CountItem[] {
  // Guarda o primeiro jeito que o setor foi escrito, para exibir
  const groups = new Map<string, CountItem>();
  for (const row of rows) {
    const key = departmentKey(row.department);
    const group = groups.get(key);
    if (group) group.count++;
    else groups.set(key, { label: row.department.trim(), count: 1 });
  }

  const sorted = [...groups.values()].sort((a, b) => b.count - a.count);
  if (sorted.length <= MAX_DEPARTMENTS) return sorted;

  const others = sorted
    .slice(MAX_DEPARTMENTS - 1)
    .reduce((sum, item) => sum + item.count, 0);
  return [
    ...sorted.slice(0, MAX_DEPARTMENTS - 1),
    { label: "Outros", count: others },
  ];
}

// Função pura: só recebe linhas e devolve números (fácil de testar)
export function computeDashboard(rows: DashboardRow[]): DashboardStats {
  const resolvedRows = rows.filter(
    (row) => row.status === "resolvido" && row.resolved_at,
  );
  const totalResolutionMs = resolvedRows.reduce(
    (sum, row) =>
      sum + Date.parse(row.resolved_at!) - Date.parse(row.created_at),
    0,
  );

  const byCategory = (Object.keys(CATEGORY_LABELS) as TicketCategory[])
    .map((category) => ({
      label: CATEGORY_LABELS[category],
      count: rows.filter((row) => row.category === category).length,
    }))
    .sort((a, b) => b.count - a.count);

  // Prioridade tem ordem natural (baixa → urgente): não reordena
  const byPriority = (Object.keys(PRIORITY_LABELS) as TicketPriority[]).map(
    (priority) => ({
      label: PRIORITY_LABELS[priority],
      count: rows.filter((row) => row.priority === priority).length,
    }),
  );

  const resolvedCount = rows.filter((row) => row.status === "resolvido").length;

  return {
    total: rows.length,
    resolved: resolvedCount,
    open: rows.length - resolvedCount,
    avgResolutionMs:
      resolvedRows.length > 0 ? totalResolutionMs / resolvedRows.length : null,
    byCategory,
    byDepartment: countDepartments(rows),
    byPriority,
  };
}

// Só técnicos recebem linhas: a RLS filtra no banco
export async function fetchDashboard(
  period: DashboardPeriod,
): Promise<DashboardStats> {
  const { start, end } = getPeriodRange(period, new Date());

  let query = supabase.from("tickets").select(DASHBOARD_COLUMNS);
  if (start) query = query.gte("created_at", start.toISOString());
  if (end) query = query.lt("created_at", end.toISOString());

  const { data, error } = await query.returns<DashboardRow[]>();
  if (error) throw error;
  return computeDashboard(data);
}
