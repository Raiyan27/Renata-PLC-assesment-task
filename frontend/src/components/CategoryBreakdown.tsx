import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { CategorySummary } from "../types";

const COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#84cc16",
  "#e11d48", "#7c3aed",
];

interface Props {
  data: CategorySummary[];
}

export default function CategoryBreakdown({ data }: Props) {
  if (!data.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm text-slate-400 text-center">
        No category data to display.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.reason,
    value: Math.round(d.total_hours * 10) / 10,
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">
        Hours by Category
      </h2>
      <div className="flex items-center justify-center py-4">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              outerRadius={110}
              innerRadius={50}
              dataKey="value"
              paddingAngle={2}
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={{ stroke: "#94a3b8" }}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                color: "#334155",
              }}
              formatter={((value: number) => [`${value}h`, "Hours"]) as never}
            />
            <Legend
              wrapperStyle={{ paddingTop: "16px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
