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
    return <div className="card empty">No shift data to display.</div>;
  }

  const chartData = data.map((d) => ({
    date: d.date.slice(5),
    ...d.categories,
  }));

  return (
    <div className="card">
      <h2>Shift Activity by Date</h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" tick={{ fill: "#aaa", fontSize: 12 }} />
          <YAxis
            tick={{ fill: "#aaa", fontSize: 12 }}
            label={{
              value: "Hours",
              angle: -90,
              position: "insideLeft",
              fill: "#aaa",
            }}
          />
          <Tooltip
            contentStyle={{
              background: "#1e1e2e",
              border: "1px solid #333",
              borderRadius: 8,
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
