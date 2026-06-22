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
      <div className="max-w-[1100px] mx-auto px-6 py-8 pb-16 min-h-screen bg-slate-50">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            Shift Analytics Dashboard
          </h1>
        </header>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <p className="text-slate-500 text-sm mt-2">
            Make sure the backend is running on http://localhost:8000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 pb-16 min-h-screen bg-slate-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          Shift Analytics Dashboard
        </h1>
        <p className="text-slate-500 text-[0.95rem] mt-1">
          Operational performance analysis &amp; insights
        </p>
      </header>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        categories={summary?.categories || []}
      />

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-base">
          Loading data...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
