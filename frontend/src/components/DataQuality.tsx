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
};

function formatIssue(issue: string): string {
  return ISSUE_LABELS[issue] || issue.replace(/_/g, " ");
}

export default function DataQuality({ data }: Props) {
  if (!data) return null;

  return (
    <div className="card">
      <h2>Data Quality Report</h2>

      <div className="quality-summary">
        <div className="quality-stat">
          <span className="stat-value">{data.total_records}</span>
          <span className="stat-label">Total Records</span>
        </div>
        <div className="quality-stat good">
          <span className="stat-value">{data.valid_records}</span>
          <span className="stat-label">Valid</span>
        </div>
        <div className="quality-stat bad">
          <span className="stat-value">{data.flagged_records}</span>
          <span className="stat-label">Flagged</span>
        </div>
        <div className="quality-stat warn">
          <span className="stat-value">{data.duplicates_removed}</span>
          <span className="stat-label">Duplicates Removed</span>
        </div>
      </div>

      {data.issue_summary.length > 0 && (
        <>
          <h3>Issue Breakdown</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Issue Type</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {data.issue_summary.map((issue) => (
                <tr key={issue.issue_type}>
                  <td>{formatIssue(issue.issue_type)}</td>
                  <td>{issue.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {data.flagged.length > 0 && (
        <>
          <h3>Flagged Records</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Hours</th>
                <th>Issues</th>
              </tr>
            </thead>
            <tbody>
              {data.flagged.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.day_date || "—"}</td>
                  <td>{r.reason}</td>
                  <td>{r.reported_hours ?? "—"}</td>
                  <td>
                    {r.issues.map((issue, i) => (
                      <span key={i} className="issue-badge">
                        {formatIssue(issue)}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
