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
import { useFormat } from "../FormatContext";

const COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#84cc16",
  "#e11d48", "#7c3aed",
];

interface Props {
  data: DailySummary[];
  categories: string[];
}

const CustomTooltip = ({ active, payload, label, formatTime, formatDate }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),_0_4px_6px_-4px_rgba(0,0,0,0.1)] p-4 text-sm min-w-[180px]">
        <p className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">{formatDate(label)}</p>
        {payload.map((entry: any, index: number) => {
          const original = entry.payload.original[entry.dataKey];
          const timeText = (original && original.start && original.end) 
            ? `${original.start} to ${original.end}` 
            : null;
            
          return (
            <div key={index} className="mb-2 last:mb-0">
              <div className="flex items-center justify-between gap-4">
                <span style={{ color: entry.color }} className="font-medium">
                  {entry.name}
                </span>
                <span className="font-bold text-slate-700">
                  {formatTime(entry.value)}
                </span>
              </div>
              {timeText && (
                <div className="text-[11px] text-slate-400 mt-0.5 font-medium tracking-wide">
                  {timeText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function ShiftChart({ data, categories }: Props) {
  const { formatTime, formatDate } = useFormat();
  if (!data.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm text-slate-400 text-center">
        No shift data to display.
      </div>
    );
  }

  const chartData = data.map((d) => {
    // Flatten data for Recharts, keeping original object for the tooltip
    const row: any = { 
      date: d.date,
      original: d.categories 
    };
    
    Object.keys(d.categories).forEach(cat => {
      row[cat] = d.categories[cat].hours;
    });
    
    return row;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-6 shadow-sm mt-6">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">
        Shift Activity by Date
      </h2>
      <div className="overflow-x-auto overflow-y-hidden rounded-lg border border-slate-100 pb-2">
        <div style={{ minWidth: `max(100%, ${chartData.length * 45}px)`, height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => formatDate(val)} 
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }} 
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <Tooltip 
                content={<CustomTooltip formatTime={formatTime} formatDate={formatDate} />} 
                cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} 
              />
              <Legend 
                verticalAlign="bottom" 
                wrapperStyle={{ paddingTop: "20px", fontSize: "13px", fontWeight: 500, color: "#475569" }}
                iconType="circle"
                iconSize={10}
              />
              {categories.map((cat, i) => (
                <Bar
                  key={cat}
                  dataKey={cat}
                  stackId="a"
                  fill={COLORS[i % COLORS.length]}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  className="hover:brightness-110 transition-all"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
