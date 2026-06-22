import type { StreakResponse, Streak } from "../types";
import { useFormat } from "../FormatContext";

interface Props {
  data: StreakResponse | null;
}

export default function BreakdownStreaks({ data }: Props) {
  const { formatTime, formatDate } = useFormat();
  if (!data) return null;

  const renderTable = (streaks: Streak[], emptyMsg: string, isConsecutive: boolean = false) => {
    const totalEvents = streaks.reduce((sum, s) => sum + s.events, 0);
    const totalHours = streaks.reduce((sum, s) => sum + s.total_hours, 0);

    if (streaks.length === 0) {
      return (
        <p className="text-slate-400 text-center py-6 text-sm">
          {emptyMsg}
        </p>
      );
    }
    return (
      <div className="flex flex-col">
        <div className="overflow-y-auto max-h-[250px] relative">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-200">
              <tr>
              <th className="text-left px-3 py-2 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wide">
                Period
              </th>
              <th className="text-left px-3 py-2 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wide">
                Events
              </th>
              <th className="text-left px-3 py-2 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wide">
                Hours
              </th>
            </tr>
          </thead>
          <tbody>
            {streaks.map((s, i) => (
              <tr
                key={i}
                className="hover:bg-slate-50 transition-colors duration-150"
              >
                <td className="px-3 py-2.5 border-b border-slate-50 text-slate-700">
                  <div className="flex flex-col gap-0.5">
                    <span>
                      {s.start_date === s.end_date
                        ? formatDate(s.start_date)
                        : `${formatDate(s.start_date)} → ${formatDate(s.end_date)}`}
                    </span>
                    {isConsecutive && s.days && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({s.days} consecutive days)
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 border-b border-slate-50 text-slate-700">
                  {s.events}
                </td>
                <td className="px-3 py-2.5 border-b border-slate-50 text-slate-700">
                  {formatTime(s.total_hours)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 bg-slate-50 border-t border-slate-200 z-10 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-200">
            <tr>
              <td className="px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Totals:
              </td>
              <td className="px-3 py-2.5 text-sm font-bold text-slate-700">
                {totalEvents}
              </td>
              <td className="px-3 py-2.5 text-sm font-bold text-slate-700">
                {formatTime(totalHours)}
              </td>
            </tr>
          </tfoot>
        </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-5 text-slate-800">
        Breakdown Streaks & Patterns
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Chained Breakdowns
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Consecutive breakdown events without any other activities in between.
          </p>
          <div className="border border-slate-100 rounded-lg overflow-hidden">
            {renderTable(data.chained_streaks, "No chained events detected.", false)}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Consecutive Days
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Breakdowns occurring on sequential calendar days (ignoring other events).
          </p>
          <div className="border border-slate-100 rounded-lg overflow-hidden">
            {renderTable(data.consecutive_days_streaks, "No consecutive days streaks detected.", true)}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-slate-500 border-t border-slate-100 pt-4 flex flex-col gap-1.5">
        <span>
          <strong className="text-slate-600 font-medium">Total breakdown hours:</strong> {formatTime(data.total_breakdown_hours)}
        </span>
        <span className="text-[11px] text-slate-400">
          <strong className="text-slate-500 font-medium">Methodology:</strong>{" "}
          {data.assumption}
        </span>
      </div>
    </div>
  );
}
