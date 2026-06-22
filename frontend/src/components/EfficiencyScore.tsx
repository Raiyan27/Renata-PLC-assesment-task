import type { EfficiencyResponse } from "../types";
import { useFormat } from "../FormatContext";

interface Props {
  data: EfficiencyResponse | null;
}

export default function EfficiencyScore({ data }: Props) {
  const { formatTime } = useFormat();
  if (!data) return null;

  const { efficiency_score, productive_hours, total_hours, failure_categories } = data;

  const colorClass =
    efficiency_score >= 80
      ? "text-emerald-500"
      : efficiency_score >= 60
        ? "text-amber-500"
        : "text-red-500";

  const strokeColor =
    efficiency_score >= 80
      ? "#10b981"
      : efficiency_score >= 60
        ? "#f59e0b"
        : "#ef4444";

  // SVG calculations for the circular progress
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (efficiency_score / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-6 text-slate-800 w-full text-left">
        Operational Efficiency
      </h2>

      <div className="relative flex items-center justify-center mb-8">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            stroke="#f1f5f9"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={strokeColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease-in-out" }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold ${colorClass}`}>
            {efficiency_score.toFixed(1)}
            <span className="text-xl">%</span>
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Health</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full">
        <div className="flex flex-col items-center justify-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 mb-1">
            Productive
          </span>
          <span className="text-lg font-bold text-emerald-700">
            {formatTime(productive_hours)}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
            Total Logged
          </span>
          <span className="text-lg font-bold text-slate-700">
            {formatTime(total_hours)}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-lg border border-red-100">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-red-600 mb-1">
            Lost Time
          </span>
          <span className="text-lg font-bold text-red-700">
            {formatTime(total_hours - productive_hours)}
          </span>
        </div>
      </div>

      {failure_categories.length > 0 && (
        <div className="w-full mt-4 flex flex-wrap items-center gap-2 justify-center">
          <span className="text-xs text-slate-400 font-medium">Lost time comprises:</span>
          {failure_categories.map((cat, i) => (
            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium border border-slate-200">
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
