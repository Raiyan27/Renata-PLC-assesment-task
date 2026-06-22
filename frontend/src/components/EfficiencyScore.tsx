import type { EfficiencyResponse } from "../types";
import { useFormat } from "../FormatContext";

interface Props {
  data: EfficiencyResponse | null;
}

export default function EfficiencyScore({ data }: Props) {
  const { formatTime } = useFormat();
  if (!data) return null;

  const { efficiency_score, productive_hours, total_hours, failure_categories } =
    data;

  const color =
    efficiency_score >= 80
      ? "text-emerald-500"
      : efficiency_score >= 60
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm text-center">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">
        Operational Efficiency
      </h2>
      <div className={`text-6xl font-bold leading-none my-2 mb-4 ${color}`}>
        {efficiency_score.toFixed(1)}%
      </div>
      <div className="flex justify-center gap-8">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            Productive
          </span>
          <span className="text-lg font-semibold text-slate-800">
            {formatTime(productive_hours)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            Total
          </span>
          <span className="text-lg font-semibold text-slate-800">
            {formatTime(total_hours)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            Non-productive
          </span>
          <span className="text-lg font-semibold text-slate-800">
            {formatTime(total_hours - productive_hours)}
          </span>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Non-productive = {failure_categories.join(", ")}
      </p>
    </div>
  );
}
