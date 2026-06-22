import type { Filters } from "../types";

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  categories: string[];
}

export default function FilterBar({ filters, onChange, categories }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-4 p-4 px-5 bg-white border border-slate-200 rounded-xl mb-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-reason"
          className="text-xs uppercase tracking-wide text-slate-500 font-semibold"
        >
          Category
        </label>
        <select
          id="filter-reason"
          value={filters.reason || ""}
          onChange={(e) =>
            onChange({ ...filters, reason: e.target.value || undefined })
          }
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-[inherit] text-sm outline-none transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-from"
          className="text-xs uppercase tracking-wide text-slate-500 font-semibold"
        >
          From
        </label>
        <input
          id="filter-from"
          type="date"
          value={filters.dateFrom || ""}
          onChange={(e) =>
            onChange({ ...filters, dateFrom: e.target.value || undefined })
          }
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-[inherit] text-sm outline-none transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-to"
          className="text-xs uppercase tracking-wide text-slate-500 font-semibold"
        >
          To
        </label>
        <input
          id="filter-to"
          type="date"
          value={filters.dateTo || ""}
          onChange={(e) =>
            onChange({ ...filters, dateTo: e.target.value || undefined })
          }
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-[inherit] text-sm outline-none transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-valid"
          className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer py-2"
        >
          <input
            id="filter-valid"
            type="checkbox"
            checked={filters.validOnly || false}
            onChange={(e) =>
              onChange({ ...filters, validOnly: e.target.checked })
            }
            className="w-4 h-4 accent-indigo-500 cursor-pointer"
          />
          Valid records only
        </label>
      </div>
    </div>
  );
}
