import { useState, useEffect, useCallback } from "react";
import type {
  Filters,
  AnalyticsSummary,
  EfficiencyResponse,
  StreakResponse,
  QualityResponse,
} from "./types";
import { fetchSummary, fetchEfficiency, fetchStreaks, fetchQuality } from "./api";
import FilterBar from "./components/Filters";
import EfficiencyScore from "./components/EfficiencyScore";
import ShiftChart from "./components/ShiftChart";
import CategoryBreakdown from "./components/CategoryBreakdown";
import BreakdownStreaks from "./components/BreakdownStreaks";
import Insights from "./components/Insights";
import DataQuality from "./components/DataQuality";

export default function App() {
  const [filters, setFilters] = useState<Filters>({});
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [efficiency, setEfficiency] = useState<EfficiencyResponse | null>(null);
  const [streaks, setStreaks] = useState<StreakResponse | null>(null);
  const [quality, setQuality] = useState<QualityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, e, st, q] = await Promise.all([
        fetchSummary(filters),
        fetchEfficiency(filters),
        fetchStreaks(),
        fetchQuality(),
      ]);
      setSummary(s);
      setEfficiency(e);
      setStreaks(st);
      setQuality(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <div className="app">
        <header>
          <h1>Shift Analytics Dashboard</h1>
        </header>
        <div className="error-banner">
          <p>Error: {error}</p>
          <p>Make sure the backend is running on http://localhost:8000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Shift Analytics Dashboard</h1>
        <p className="subtitle">Operational performance analysis & insights</p>
      </header>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        categories={summary?.categories || []}
      />

      {loading ? (
        <div className="loading">Loading data...</div>
      ) : (
        <>
          <div className="grid-2">
            <EfficiencyScore data={efficiency} />
            <CategoryBreakdown data={summary?.by_category || []} />
          </div>

          <ShiftChart
            data={summary?.by_date || []}
            categories={summary?.categories || []}
          />

          <BreakdownStreaks data={streaks} />

          <Insights
            summary={summary}
            efficiency={efficiency}
            quality={quality}
          />

          <DataQuality data={quality} />
        </>
      )}
    </div>
  );
}
