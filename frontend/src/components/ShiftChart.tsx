import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DailySummary } from "../types";

const COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#84cc16",
  "#e11d48", "#7c3aed",
];

interface Props {
  data: DailySummary[];
  categories: string[];
}

export default function ShiftChart({ data, categories }: Props) {
  if (!data.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm text-slate-400 text-center">
        No shift data to display.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: d.date.slice(5),
    ...d.categories,
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm mt-6">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">
        Shift Activity by Date
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 12 }}
            label={{
              value: "Hours",
              angle: -90,
              position: "insideLeft",
              fill: "#64748b",
            }}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              color: "#334155",
            }}
          />
          <Legend />
          {categories.map((cat, i) => (
            <Bar
              key={cat}
              dataKey={cat}
              stackId="a"
              fill={COLORS[i % COLORS.length]}
              radius={i === categories.length - 1 ? [4, 4, 0, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
