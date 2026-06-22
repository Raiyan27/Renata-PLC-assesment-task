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
  if (filters.reason && filters.reason.length > 0) {
    filters.reason.forEach(r => params.append("reason", r));
  }
  if (filters.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters.dateTo) params.set("date_to", filters.dateTo);

  return params.toString();
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
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

export async function uploadDataset(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    body: formData,
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Upload failed: ${res.status}`);
  }
  return res.json();
}

export async function refreshDefaultDataset() {
  const res = await fetch(`${BASE}/refresh-default`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Refresh failed: ${res.status}`);
  }
  return res.json();
}
