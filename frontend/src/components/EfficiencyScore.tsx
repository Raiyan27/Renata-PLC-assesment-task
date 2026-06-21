import type { EfficiencyResponse } from "../types";

interface Props {
  data: EfficiencyResponse | null;
}

export default function EfficiencyScore({ data }: Props) {
  if (!data) return null;

  const { efficiency_score, productive_hours, total_hours, failure_categories } =
    data;

  const color =
    efficiency_score >= 80
      ? "#10b981"
      : efficiency_score >= 60
        ? "#f59e0b"
        : "#ef4444";

  return (
    <div className="card efficiency-card">
      <h2>Operational Efficiency</h2>
      <div className="efficiency-score" style={{ color }}>
        {efficiency_score.toFixed(1)}%
      </div>
      <div className="efficiency-details">
        <div className="detail">
          <span className="detail-label">Productive</span>
          <span className="detail-value">{productive_hours.toFixed(1)}h</span>
        </div>
        <div className="detail">
          <span className="detail-label">Total</span>
          <span className="detail-value">{total_hours.toFixed(1)}h</span>
        </div>
        <div className="detail">
          <span className="detail-label">Non-productive</span>
          <span className="detail-value">
            {(total_hours - productive_hours).toFixed(1)}h
          </span>
        </div>
      </div>
      <p className="efficiency-note">
        Non-productive = {failure_categories.join(", ")}
      </p>
    </div>
  );
}
