import type { QualityResponse } from "../types";

interface Props {
  data: QualityResponse | null;
}

const ISSUE_LABELS: Record<string, string> = {
  missing_start: "Missing start timestamp",
  missing_end: "Missing end timestamp",
  invalid_start_timestamp: "Invalid start timestamp",
  invalid_end_timestamp: "Invalid end timestamp",
  invalid_date: "Invalid date",
  invalid_hours: "Invalid hours value",
  negative_duration: "Negative duration",
  duration_mismatch: "Duration mismatch",
  unrealistic_duration: "Unrealistic duration (>24h)",
  cross_midnight_or_multiday: "Cross-midnight / multi-day",
  end_before_start: "End before start",
  date_inferred_from_start: "Date inferred from start",
  missing_reason: "Missing reason",
  duplicate_record: "Duplicate record",
};

function formatIssue(issue: string): string {
  return ISSUE_LABELS[issue] || issue.replace(/_/g, " ");
}

export default function DataQuality({ data }: Props) {
  if (!data) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">
        Data Quality Report
      </h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[100px] py-3 px-4 bg-slate-50 rounded-lg text-center">
          <span className="block text-2xl font-bold text-slate-700">
            {data.total_records}
          </span>
          <span className="block text-xs text-slate-500 mt-1">
            Total Records
          </span>
        </div>
        <div className="flex-1 min-w-[100px] py-3 px-4 bg-emerald-50 rounded-lg text-center">
          <span className="block text-2xl font-bold text-emerald-500">
            {data.valid_records}
          </span>
          <span className="block text-xs text-slate-500 mt-1">Valid</span>
        </div>
        <div className="flex-1 min-w-[100px] py-3 px-4 bg-red-50 rounded-lg text-center">
          <span className="block text-2xl font-bold text-red-500">
            {data.flagged_records}
          </span>
          <span className="block text-xs text-slate-500 mt-1">Flagged</span>
        </div>
        <div className="flex-1 min-w-[100px] py-3 px-4 bg-amber-50 rounded-lg text-center">
          <span className="block text-2xl font-bold text-amber-500">
            {data.duplicates_removed}
          </span>
          <span className="block text-xs text-slate-500 mt-1">
            Duplicates Removed
          </span>
        </div>
      </div>

      {data.issue_summary.length > 0 && (
        <>
          <h3 className="text-[0.95rem] font-semibold mt-5 mb-3 text-slate-500">
            Issue Breakdown
          </h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2.5 border-b-2 border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                  Issue Type
                </th>
                <th className="text-left px-3 py-2.5 border-b-2 border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                  Count
                </th>
              </tr>
            </thead>
            <tbody>
                {data.issue_summary.map((issue) => (
                  <tr
                    key={issue.issue_type}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-3 py-2.5 border-b border-slate-100 text-slate-700">
                      {formatIssue(issue.issue_type)}
                    </td>
                    <td className="px-3 py-2.5 border-b border-slate-100 text-slate-700">
                      {issue.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </>
      )}

      {data.flagged.length > 0 && (
        <>
          <h3 className="text-[0.95rem] font-semibold mt-5 mb-3 text-slate-500">
            Flagged Records
          </h3>
          <div className="overflow-y-auto max-h-[400px] border border-slate-200 rounded-lg relative">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-200">
                <tr>
                  <th className="text-left px-3 py-2.5 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                    ID
                  </th>
                  <th className="text-left px-3 py-2.5 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-3 py-2.5 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                    Reason
                  </th>
                  <th className="text-left px-3 py-2.5 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                    Hours
                  </th>
                  <th className="text-left px-3 py-2.5 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                    Issues
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.flagged.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-3 py-2.5 border-b border-slate-100 text-slate-700">
                      {r.id}
                    </td>
                    <td className="px-3 py-2.5 border-b border-slate-100 text-slate-700">
                      {r.day_date || "—"}
                    </td>
                    <td className="px-3 py-2.5 border-b border-slate-100 text-slate-700">
                      {r.reason}
                    </td>
                    <td className="px-3 py-2.5 border-b border-slate-100 text-slate-700">
                      {r.reported_hours ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 border-b border-slate-100">
                      {r.issues.map((issue, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs mr-1 mb-0.5"
                        >
                          {formatIssue(issue)}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
