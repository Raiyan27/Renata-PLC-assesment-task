import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import type { CategorySummary } from "../types";
import { useFormat } from "../FormatContext";

interface Props {
  data: CategorySummary[];
  failureCategories: string[];
}

export default function ParetoChart({ data, failureCategories }: Props) {
  const { formatTime } = useFormat();

  // Filter only failure categories, sort descending
  const failures = data
    .filter(d => failureCategories.includes(d.reason))
    .sort((a, b) => b.total_hours - a.total_hours);

  if (failures.length === 0) {
    return null; // Don't render if no failures
  }

  const totalFailureHours = failures.reduce((sum, d) => sum + d.total_hours, 0);

  let cumulative = 0;
  const chartData = failures.map(d => {
    cumulative += d.total_hours;
    return {
      name: d.reason,
      hours: Math.round(d.total_hours * 10) / 10,
      cumulativePercent: totalFailureHours > 0 
        ? Math.round((cumulative / totalFailureHours) * 100) 
        : 0
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const hoursData = payload.find((p: any) => p.dataKey === 'hours');
      const percentData = payload.find((p: any) => p.dataKey === 'cumulativePercent');
      
      return (
        <div className="bg-white border border-slate-100 rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),_0_4px_6px_-4px_rgba(0,0,0,0.1)] p-4 text-sm min-w-[180px]">
          <p className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">{label}</p>
          {hoursData && (
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-rose-500">Lost Time:</span>
              <span className="font-bold text-slate-700">{formatTime(hoursData.value)}</span>
            </div>
          )}
          {percentData && (
            <div className="flex justify-between items-center">
              <span className="font-medium text-indigo-500">Cumulative:</span>
              <span className="font-bold text-slate-700">{percentData.value}%</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-6 shadow-sm mt-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Downtime Pareto Chart</h2>
        <p className="text-xs text-slate-500 mt-1">Identifies the vital few issues causing the majority of lost time (80/20 Rule).</p>
      </div>
      <div className="overflow-x-auto overflow-y-hidden rounded-lg border border-slate-100 pb-2">
        <div style={{ minWidth: `max(100%, ${chartData.length * 60}px)`, height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }} 
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
                tick={{ fill: "#818cf8", fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
              <Bar yAxisId="left" dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? "#f43f5e" : "#fb7185"} className="hover:brightness-110 transition-all" />
                ))}
              </Bar>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulativePercent"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
