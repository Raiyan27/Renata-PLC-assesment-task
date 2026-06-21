import type { Filters } from "../types";

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  categories: string[];
}

export default function FilterBar({ filters, onChange, categories }: Props) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="filter-reason">Category</label>
        <select
          id="filter-reason"
          value={filters.reason || ""}
          onChange={(e) =>
            onChange({ ...filters, reason: e.target.value || undefined })
          }
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-from">From</label>
        <input
          id="filter-from"
          type="date"
          value={filters.dateFrom || ""}
          onChange={(e) =>
            onChange({ ...filters, dateFrom: e.target.value || undefined })
          }
        />
      </div>

      <div className="filter-group">
        <label htmlFor="filter-to">To</label>
        <input
          id="filter-to"
          type="date"
          value={filters.dateTo || ""}
          onChange={(e) =>
            onChange({ ...filters, dateTo: e.target.value || undefined })
          }
        />
      </div>

      <div className="filter-group filter-toggle">
        <label htmlFor="filter-valid">
          <input
            id="filter-valid"
            type="checkbox"
            checked={filters.validOnly || false}
            onChange={(e) =>
              onChange({ ...filters, validOnly: e.target.checked })
            }
          />
          Valid records only
        </label>
      </div>
    </div>
  );
}
