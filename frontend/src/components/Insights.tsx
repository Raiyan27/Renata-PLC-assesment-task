import type { AnalyticsSummary, EfficiencyResponse, QualityResponse } from "../types";

interface Props {
  summary: AnalyticsSummary | null;
  efficiency: EfficiencyResponse | null;
  quality: QualityResponse | null;
}

interface Insight {
  title: string;
  description: string;
  action: string;
  severity: "high" | "medium" | "info";
}

function generateInsights(
  summary: AnalyticsSummary,
  efficiency: EfficiencyResponse,
  quality: QualityResponse
): Insight[] {
  const insights: Insight[] = [];

  // Insight 1: Peak failure day
  const failureDays = summary.by_date
    .map((d) => {
      const failureHours = efficiency.failure_categories.reduce(
        (sum, cat) => sum + (d.categories[cat]?.hours || 0),
        0
      );
      return { date: d.date, failureHours };
    })
    .filter((d) => d.failureHours > 0)
    .sort((a, b) => b.failureHours - a.failureHours);

  if (failureDays.length > 0) {
    const worst = failureDays[0];
    insights.push({
      title: "Peak Failure Day",
      description: `${worst.date} had ${worst.failureHours.toFixed(1)} hours of failures (${efficiency.failure_categories.join(", ")}).`,
      action:
        "Schedule preventive maintenance before this recurring period. Investigate root causes for this date.",
      severity: "high",
    });
  }

  // Insight 2: Dominant failure category
  const failureCategories = summary.by_category
    .filter((c) => efficiency.failure_categories.includes(c.reason))
    .sort((a, b) => b.total_hours - a.total_hours);

  if (failureCategories.length > 0) {
    const top = failureCategories[0];
    const pct = ((top.total_hours / summary.total_hours) * 100).toFixed(1);
    insights.push({
      title: `${top.reason} is the Leading Failure`,
      description: `${top.reason} accounts for ${top.total_hours.toFixed(1)}h (${pct}% of total hours) across ${top.count} events.`,
      action: `Prioritize ${top.reason.toLowerCase()} reduction initiatives. Consider equipment upgrades or predictive maintenance.`,
      severity: "high",
    });
  }

  // Insight 3: Data reliability
  const dataIssueRate = (
    (quality.flagged_records / quality.total_records) *
    100
  ).toFixed(1);
  if (quality.flagged_records > 0) {
    insights.push({
      title: "Data Reliability Concern",
      description: `${quality.flagged_records} of ${quality.total_records} records (${dataIssueRate}%) have data quality issues. ${quality.duplicates_removed} duplicate(s) were also removed.`,
      action:
        "Improve shift logging procedures. Implement validation at data entry to prevent missing timestamps and duration errors.",
      severity: "medium",
    });
  }

  // Insight 4: Most active category
  const productive = summary.by_category
    .filter((c) => !efficiency.failure_categories.includes(c.reason))
    .sort((a, b) => b.total_hours - a.total_hours);

  if (productive.length > 0) {
    const top = productive[0];
    insights.push({
      title: `${top.reason} Dominates Productive Time`,
      description: `${top.reason} is the top productive activity with ${top.total_hours.toFixed(1)}h across ${top.count} shifts.`,
      action: `Evaluate if ${top.reason.toLowerCase()} time can be optimized or if resources are appropriately allocated.`,
      severity: "info",
    });
  }

  return insights;
}

const severityStyles: Record<string, string> = {
  high: "border-l-red-500 bg-red-50/60",
  medium: "border-l-amber-500 bg-amber-50/60",
  info: "border-l-indigo-500 bg-indigo-50/60",
};

export default function Insights({ summary, efficiency, quality }: Props) {
  if (!summary || !efficiency || !quality) return null;

  const insights = generateInsights(summary, efficiency, quality);

  if (insights.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm text-slate-400 text-center">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">
          Operational Insights
        </h2>
        <p>Not enough data to generate insights.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">
        Operational Insights
      </h2>
      <div className="flex flex-col gap-4">
        {insights.map((ins, i) => (
          <div
            key={i}
            className={`p-4 px-5 rounded-lg border-l-4 ${severityStyles[ins.severity]}`}
          >
            <h3 className="text-[0.95rem] font-semibold mb-1.5 text-slate-800">
              {ins.title}
            </h3>
            <p className="text-sm text-slate-500 my-1">
              {ins.description}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              <strong className="text-slate-600">Recommended action:</strong>{" "}
              {ins.action}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
