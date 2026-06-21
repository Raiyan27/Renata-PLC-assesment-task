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
    return <div className="card empty">No category data to display.</div>;
  }

  const chartData = data.map((d) => ({
    name: d.reason,
    value: Math.round(d.total_hours * 10) / 10,
  }));

  return (
    <div className="card">
      <h2>Hours by Category</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={{ stroke: "#666" }}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#1e1e2e",
              border: "1px solid #333",
              borderRadius: 8,
            }}
            formatter={(value: number) => [`${value}h`, "Hours"]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
