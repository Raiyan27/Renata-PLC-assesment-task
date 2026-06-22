import { useState, useRef, useEffect } from "react";
import type { Filters } from "../types";
import { useFormat } from "../FormatContext";

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  categories: string[];
}

export default function FilterBar({ filters, onChange, categories }: Props) {
  const { timeFormat, setTimeFormat, dateFormat, setDateFormat } = useFormat();
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setIsCatOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setIsDateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedReasons = filters.reason || [];
  const allSelected = selectedReasons.length === categories.length;

  const toggleReason = (c: string) => {
    const newReasons = selectedReasons.includes(c)
      ? selectedReasons.filter((r) => r !== c)
      : [...selectedReasons, c];
    onChange({
      ...filters,
      reason: newReasons.length > 0 ? newReasons : undefined,
    });
  };



  const selectAllReasons = () => {
    onChange({ ...filters, reason: undefined });
  };

  const clearFilters = () => {
    onChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 px-5 bg-white border border-slate-200 rounded-xl mb-6 shadow-sm relative z-20">
      {/* Category Dropdown */}
      <div className="relative" ref={catRef}>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Category
          </label>
          <button
            onClick={() => setIsCatOpen(!isCatOpen)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none text-left min-w-[200px] flex justify-between items-center hover:border-indigo-400 transition-colors"
          >
            <span className="truncate pr-4">
              {selectedReasons.length === 0 || allSelected
                ? "All Categories"
                : `${selectedReasons.length} selected`}
            </span>
            <svg
              className="w-4 h-4 text-slate-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {isCatOpen && (
          <div className="absolute z-30 top-full mt-1 left-0 w-64 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl p-2">
            <label className="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-slate-100 mb-1">
              <input
                type="checkbox"
                checked={allSelected || selectedReasons.length === 0}
                onChange={selectAllReasons}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
              <span className="text-sm font-semibold text-slate-700">
                Select All
              </span>
            </label>
            {categories.map((c) => (
              <label
                key={c}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedReasons.length > 0 ? selectedReasons.includes(c) : true}
                  onChange={() => toggleReason(c)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
                <span className="text-sm text-slate-600">{c}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Date Range Dropdown */}
      <div className="relative" ref={dateRef}>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Date Range
          </label>
          <button
            onClick={() => setIsDateOpen(!isDateOpen)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none text-left min-w-[220px] flex justify-between items-center hover:border-indigo-400 transition-colors"
          >
            <span>
              {filters.dateFrom || filters.dateTo
                ? `${filters.dateFrom || "Start"} to ${
                    filters.dateTo || "End"
                  }`
                : "All Time"}
            </span>
            <svg
              className="w-4 h-4 text-slate-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>

        {isDateOpen && (
          <div className="absolute z-30 top-full mt-1 left-0 w-[300px] bg-white border border-slate-200 rounded-xl shadow-xl p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    dateFrom: e.target.value || undefined,
                  })
                }
                onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none w-full cursor-pointer focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    dateTo: e.target.value || undefined,
                  })
                }
                onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none w-full cursor-pointer focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>



      <div className="flex items-center gap-4 ml-2 pl-4 border-l border-slate-200 h-full pt-1">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Time Format</span>
          <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
            <button
              onClick={() => setTimeFormat("h_m")}
              className={`px-2 py-1 text-[11px] font-medium rounded ${timeFormat === 'h_m' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Hrs/Mins
            </button>
            <button
              onClick={() => setTimeFormat("decimal")}
              className={`px-2 py-1 text-[11px] font-medium rounded ${timeFormat === 'decimal' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Decimal
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Date Format</span>
          <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
            <button
              onClick={() => setDateFormat("dd_mmm_yy")}
              className={`px-2 py-1 text-[11px] font-medium rounded ${dateFormat === 'dd_mmm_yy' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              DD-MMM-YY
            </button>
            <button
              onClick={() => setDateFormat("iso")}
              className={`px-2 py-1 text-[11px] font-medium rounded ${dateFormat === 'iso' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              YYYY-MM-DD
            </button>
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="flex-1 flex justify-end items-center h-full mt-auto pt-4">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors rounded-lg font-medium"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
