import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailySummary } from "../types";
import { useFormat } from "../FormatContext";

interface Props {
  data: DailySummary[];
  failureCategories: string[];
}

export default function EfficiencyTrend({ data, failureCategories }: Props) {
  const { formatDate } = useFormat();

  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data.map(day => {
    let productiveHours = 0;
    Object.entries(day.categories).forEach(([catName, catData]) => {
      if (!failureCategories.includes(catName)) {
        productiveHours += catData.hours;
      }
    });

    const efficiency = day.total_hours > 0 
      ? (productiveHours / day.total_hours) * 100 
      : 0;

    return {
      date: day.date,
      efficiency: Math.round(efficiency * 10) / 10
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const colorClass = val >= 80 ? "text-emerald-500" : val >= 65 ? "text-amber-500" : "text-red-500";
      
      return (
        <div className="bg-white border border-slate-100 rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),_0_4px_6px_-4px_rgba(0,0,0,0.1)] p-4 text-sm min-w-[150px]">
          <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">{formatDate(label)}</p>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-500">Efficiency:</span>
            <span className={`font-bold text-lg ${colorClass}`}>{val}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate dynamic gradient color based on average
  const avgEfficiency = chartData.reduce((sum, d) => sum + d.efficiency, 0) / (chartData.length || 1);
  const strokeColor = avgEfficiency >= 80 ? "#10b981" : avgEfficiency >= 65 ? "#f59e0b" : "#ef4444";
  const gradientId = "colorEfficiency";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-6 shadow-sm mt-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Daily Efficiency Trend</h2>
        <p className="text-xs text-slate-500 mt-1">Tracks operational health trajectory day over day.</p>
      </div>
      <div className="overflow-x-auto overflow-y-hidden rounded-lg border border-slate-100 pb-2">
        <div style={{ minWidth: `max(100%, ${chartData.length * 45}px)`, height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: strokeColor, strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Area
                type="monotone"
                dataKey="efficiency"
                stroke={strokeColor}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                activeDot={{ r: 6, strokeWidth: 0, fill: strokeColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
