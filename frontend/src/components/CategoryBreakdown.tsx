import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { CategorySummary } from "../types";
import { useFormat } from "../FormatContext";

const COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#84cc16",
  "#e11d48", "#7c3aed",
];

interface Props {
  data: CategorySummary[];
  failureCategories?: string[];
}

export default function CategoryBreakdown({ data, failureCategories }: Props) {
  const { formatTime } = useFormat();
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  if (!data.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm text-slate-400 text-center flex items-center justify-center min-h-[200px]">
        No category data to display.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.reason,
    value: Math.round(d.total_hours * 10) / 10,
  }));

  const totalHours = data.reduce((sum, d) => sum + d.total_hours, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Hours by Category
        </h2>
        {failureCategories && failureCategories.length > 0 && selectedSegments.length === 0 && (
          <button
            onClick={() => setSelectedSegments(failureCategories)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            Highlight Downtime
          </button>
        )}
        {selectedSegments.length > 0 && (
          <div className="flex items-center gap-3">
            {selectedSegments.length === 1 && (
              <span className="text-[11px] text-slate-400 italic">Tip: Alt + Click to select multiple</span>
            )}
            <button
              onClick={() => setSelectedSegments([])}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors bg-rose-100 text-rose-700 hover:bg-rose-200"
            >
              Clear Highlight
            </button>
          </div>
        )}
      </div>
      <div className="relative flex items-center justify-center">
        {/* Center Text for Donut Chart */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-[40px]">
          <span className="text-4xl font-extrabold text-slate-800">
            {formatTime(totalHours)}
          </span>
          <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mt-1.5">
            Total Hours
          </span>
        </div>

        <ResponsiveContainer width="100%" height={380}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={105}
              outerRadius={150}
              dataKey="value"
              paddingAngle={4}
              stroke="none"
              cornerRadius={4}
              label={false}
              onClick={(data: any, index: number, e: any) => {
                const name = data.name;
                const event = e || index; // Handle different Recharts versions
                const isAlt = event && event.altKey;

                if (isAlt) {
                  if (selectedSegments.includes(name)) {
                    setSelectedSegments(selectedSegments.filter((s) => s !== name));
                  } else {
                    setSelectedSegments([...selectedSegments, name]);
                  }
                } else {
                  if (selectedSegments.length === 1 && selectedSegments[0] === name) {
                    setSelectedSegments([]);
                  } else {
                    setSelectedSegments([name]);
                  }
                }
              }}
            >
              {chartData.map((entry, i) => (
                <Cell 
                  key={i} 
                  fill={
                    selectedSegments.length > 0 && !selectedSegments.includes(entry.name)
                      ? "#e2e8f0" 
                      : COLORS[i % COLORS.length]
                  } 
                  className="hover:opacity-80 transition-opacity outline-none cursor-pointer" 
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #f1f5f9",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                color: "#1e293b",
                fontWeight: 600,
                padding: "10px 14px",
              }}
              itemStyle={{ color: "#475569", fontWeight: 500 }}
              formatter={((value: number) => {
                const percentage = ((value / totalHours) * 100).toFixed(1);
                return [`${formatTime(value)} (${percentage}%)`, "Duration"];
              }) as never}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: "24px", fontSize: "13px", fontWeight: 500, color: "#475569" }}
              iconType="circle"
              iconSize={10}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
