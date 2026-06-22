import type { StreakResponse } from "../types";

interface Props {
  data: StreakResponse | null;
}

export default function BreakdownStreaks({ data }: Props) {
  if (!data) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">
        Breakdown Streaks
      </h2>
      {data.streaks.length === 0 ? (
        <p className="text-slate-400 text-center py-8">
          No breakdown streaks detected.
        </p>
      ) : (
        <>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2.5 border-b-2 border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                  Period
                </th>
                <th className="text-left px-3 py-2.5 border-b-2 border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                  Events
                </th>
                <th className="text-left px-3 py-2.5 border-b-2 border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                  Total Hours
                </th>
              </tr>
            </thead>
            <tbody>
              {data.streaks.map((s, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="px-3 py-2.5 border-b border-slate-100 text-slate-700">
                    {s.start_date === s.end_date
                      ? s.start_date
                      : `${s.start_date} → ${s.end_date}`}
                  </td>
                  <td className="px-3 py-2.5 border-b border-slate-100 text-slate-700">
                    {s.events}
                  </td>
                  <td className="px-3 py-2.5 border-b border-slate-100 text-slate-700">
                    {s.total_hours.toFixed(1)}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-sm text-slate-500">
            <span>
              Total breakdown hours: {data.total_breakdown_hours.toFixed(1)}h
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-400 italic">
            <strong className="text-slate-500">Assumption:</strong>{" "}
            {data.assumption}
          </p>
        </>
      )}
    </div>
  );
}
