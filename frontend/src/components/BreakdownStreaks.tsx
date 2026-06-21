import type { StreakResponse } from "../types";

interface Props {
  data: StreakResponse | null;
}

export default function BreakdownStreaks({ data }: Props) {
  if (!data) return null;

  return (
    <div className="card">
      <h2>Breakdown Streaks</h2>
      {data.streaks.length === 0 ? (
        <p className="empty-text">No breakdown streaks detected.</p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Events</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {data.streaks.map((s, i) => (
                <tr key={i}>
                  <td>
                    {s.start_date === s.end_date
                      ? s.start_date
                      : `${s.start_date} → ${s.end_date}`}
                  </td>
                  <td>{s.events}</td>
                  <td>{s.total_hours.toFixed(1)}h</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="streak-summary">
            <span>Total breakdown hours: {data.total_breakdown_hours.toFixed(1)}h</span>
          </div>
          <p className="assumption-text">
            <strong>Assumption:</strong> {data.assumption}
          </p>
        </>
      )}
    </div>
  );
}
