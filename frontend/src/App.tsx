import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Filters,
  AnalyticsSummary,
  EfficiencyResponse,
  StreakResponse,
  QualityResponse,
} from "./types";
import {
  fetchSummary,
  fetchEfficiency,
  fetchStreaks,
  fetchQuality,
} from "./api";
import FilterBar from "./components/Filters";
import EfficiencyScore from "./components/EfficiencyScore";
import ShiftChart from "./components/ShiftChart";
import CategoryBreakdown from "./components/CategoryBreakdown";
import BreakdownStreaks from "./components/BreakdownStreaks";
import Insights from "./components/Insights";
import DataQuality from "./components/DataQuality";
import UploadModal from "./components/UploadModal";
import ParetoChart from "./components/ParetoChart";
import EfficiencyTrend from "./components/EfficiencyTrend";
import { refreshDefaultDataset } from "./api";

export default function App() {
  const [filters, setFilters] = useState<Filters>({});
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [efficiency, setEfficiency] = useState<EfficiencyResponse | null>(null);
  const [streaks, setStreaks] = useState<StreakResponse | null>(null);
  const [quality, setQuality] = useState<QualityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCustomDataset, setIsCustomDataset] = useState(false);

  const loadData = useCallback(async (currentFilters: Filters) => {
    setLoading(true);
    setError(null);
    try {
      const [s, e, st, q] = await Promise.all([
        fetchSummary(currentFilters),
        fetchEfficiency(currentFilters),
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
  }, []);

  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      loadData(filters);
      isFirstLoad.current = false;
      return;
    }
    const handler = setTimeout(() => {
      loadData(filters);
    }, 300);
    return () => clearTimeout(handler);
  }, [filters, loadData]);

  if (error) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-8 pb-16 min-h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            Shift Analytics Dashboard
          </h1>
        </header>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <p className="text-slate-500 text-sm mt-2">
            Make sure the backend is running and accessible at{" "}
            {import.meta.env.VITE_API_URL || "http://localhost:8000"}
          </p>
        </div>
      </div>
    );
  }

  const handleRefreshDefault = async () => {
    setIsRefreshing(true);
    try {
      await refreshDefaultDataset();
      setIsCustomDataset(false);
      await loadData(filters);
    } catch (err: any) {
      setError(err.message || "Failed to reset to default dataset.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 pb-16 min-h-screen">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            Shift Analytics Dashboard
          </h1>
          <p className="text-slate-500 text-[0.95rem] mt-1">
            Operational performance analysis &amp; insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshDefault}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-500" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isCustomDataset ? "Restore Default Dataset" : "Refresh Dataset"}
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Upload Data
          </button>
        </div>
      </header>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        categories={summary?.categories || []}
      />

      {filters.reason && filters.reason.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-200 rounded-xl mb-6 shadow-sm">
          <svg
            className="w-12 h-12 text-slate-300 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <p className="text-slate-600 font-medium text-lg">
            No categories selected
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Please select at least one category to view analytics.
          </p>
        </div>
      ) : summary === null ? (
        <div className="text-center py-12 text-slate-400 text-base">
          Loading data...
        </div>
      ) : (
        <div
          className={`transition-opacity duration-300 ease-in-out ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EfficiencyScore data={efficiency} />
            <CategoryBreakdown
              data={summary?.by_category || []}
              failureCategories={efficiency?.failure_categories || []}
            />
          </div>

          <ShiftChart
            data={summary?.by_date || []}
            categories={summary?.categories || []}
            failureCategories={efficiency?.failure_categories || []}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EfficiencyTrend
              data={summary?.by_date || []}
              failureCategories={efficiency?.failure_categories || []}
            />
            <ParetoChart
              data={summary?.by_category || []}
              failureCategories={efficiency?.failure_categories || []}
            />
          </div>

          <BreakdownStreaks data={streaks} />

          <Insights
            summary={summary}
            efficiency={efficiency}
            quality={quality}
          />

          <DataQuality data={quality} />
        </div>
      )}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          setIsCustomDataset(true);
          loadData(filters);
        }}
      />
    </div>
  );
}
