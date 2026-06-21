import type {
  AnalyticsSummary,
  EfficiencyResponse,
  StreakResponse,
  QualityResponse,
  Filters,
} from "./types";

const BASE = "http://localhost:8000/api";

function buildParams(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.reason) params.set("reason", filters.reason);
  if (filters.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters.dateTo) params.set("date_to", filters.dateTo);
  if (filters.validOnly) params.set("valid_only", "true");
  return params.toString();
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function fetchSummary(filters: Filters) {
  const qs = buildParams(filters);
  return fetchJSON<AnalyticsSummary>(`${BASE}/analytics/summary?${qs}`);
}

export function fetchEfficiency(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters.dateTo) params.set("date_to", filters.dateTo);
  return fetchJSON<EfficiencyResponse>(
    `${BASE}/analytics/efficiency?${params}`
  );
}

export function fetchStreaks() {
  return fetchJSON<StreakResponse>(`${BASE}/analytics/streaks`);
}

export function fetchQuality() {
  return fetchJSON<QualityResponse>(`${BASE}/data-quality`);
}
