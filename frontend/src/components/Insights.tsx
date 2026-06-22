import React from "react";
import type { AnalyticsSummary, EfficiencyResponse, QualityResponse } from "../types";
import { useFormat } from "../FormatContext";

interface Props {
  summary: AnalyticsSummary | null;
  efficiency: EfficiencyResponse | null;
  quality: QualityResponse | null;
}

interface Insight {
  title: string;
  description: React.ReactNode;
  action: string;
  severity: "high" | "medium" | "info";
  icon: React.ReactNode;
}

const HighIcon = () => (
  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const MediumIcon = () => (
  <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-5 h-5 text-indigo-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function generateInsights(
  summary: AnalyticsSummary,
  efficiency: EfficiencyResponse,
  quality: QualityResponse,
  formatTime: (val: number | string) => string,
  formatDate: (val: string) => string
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
      description: (
        <>
          <strong className="text-slate-800">{formatDate(worst.date)}</strong> had <strong className="text-slate-800">{formatTime(worst.failureHours)}</strong> of failures.
        </>
      ),
      action: "Investigate root causes and schedule preventive maintenance.",
      severity: "high",
      icon: <HighIcon />,
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
      title: "Leading Failure",
      description: (
        <>
          <strong className="text-slate-800">{top.reason}</strong> caused <strong className="text-slate-800">{formatTime(top.total_hours)}</strong> ({pct}% of total) across {top.count} events.
        </>
      ),
      action: `Prioritize ${top.reason.toLowerCase()} reduction initiatives.`,
      severity: "high",
      icon: <HighIcon />,
    });
  }

  // Insight 3: Data reliability
  const dataIssueRateNum = (quality.flagged_records / quality.total_records) * 100;
  const dataIssueRate = dataIssueRateNum.toFixed(1);
  if (quality.flagged_records > 0) {
    let severity: "high" | "medium" | "info" = "medium";
    let icon = <MediumIcon />;
    let action = "Implement strict validation during data entry to prevent ongoing errors.";
    let descriptionText = "have quality issues.";

    if (dataIssueRateNum > 30) {
      severity = "high";
      icon = <HighIcon />;
      action = "Immediate action required: Halt analysis until data capture protocols are completely overhauled.";
      descriptionText = "are corrupted or severely flawed.";
    } else if (dataIssueRateNum < 5) {
      severity = "info";
      icon = <InfoIcon />;
      action = "Continue monitoring. Data quality is generally acceptable.";
      descriptionText = "contain minor quality discrepancies.";
    }

    insights.push({
      title: dataIssueRateNum > 30 ? "Critical Data Corruption" : "Data Reliability",
      description: (
        <>
          <strong className="text-slate-800">{quality.flagged_records}</strong> out of {quality.total_records} records (<strong className="text-slate-800">{dataIssueRate}%</strong>) {descriptionText}
        </>
      ),
      action: action,
      severity: severity,
      icon: icon,
    });
  }

  // Insight 4: Most active category
  const productive = summary.by_category
    .filter((c) => !efficiency.failure_categories.includes(c.reason))
    .sort((a, b) => b.total_hours - a.total_hours);

  if (productive.length > 0) {
    const top = productive[0];
    insights.push({
      title: "Top Productive Activity",
      description: (
        <>
          <strong className="text-slate-800">{top.reason}</strong> leads with <strong className="text-slate-800">{formatTime(top.total_hours)}</strong>.
        </>
      ),
      action: "Evaluate if time is appropriately allocated.",
      severity: "info",
      icon: <InfoIcon />,
    });
  }

  // Insight 5: Micro-stoppages
  const microStoppages = summary.by_category
    .filter((c) => efficiency.failure_categories.includes(c.reason))
    .filter((c) => c.count >= 3 && (c.total_hours / c.count) <= 0.75)
    .sort((a, b) => b.count - a.count);

  if (microStoppages.length > 0) {
    const topMicro = microStoppages[0];
    const avgMins = Math.round((topMicro.total_hours / topMicro.count) * 60);
    insights.push({
      title: "Frequent Micro-Stoppages",
      description: (
        <>
          <strong className="text-slate-800">{topMicro.reason}</strong> occurred <strong className="text-slate-800">{topMicro.count} times</strong>, averaging just <strong className="text-slate-800">{avgMins} mins</strong> per event.
        </>
      ),
      action: "Investigate rapid, recurring disruptions.",
      severity: "medium",
      icon: <MediumIcon />,
    });
  }

  // Insight 6: Operational Health
  if (efficiency.efficiency_score < 65 && efficiency.total_hours > 0) {
    insights.push({
      title: "Critical Efficiency Drop",
      description: (
        <>
          Overall efficiency is at <strong className="text-slate-800">{efficiency.efficiency_score.toFixed(1)}%</strong>, significantly below healthy standards.
        </>
      ),
      action: "Immediate management review required.",
      severity: "high",
      icon: <HighIcon />,
    });
  } else if (efficiency.efficiency_score >= 85 && efficiency.total_hours > 0) {
    insights.push({
      title: "Excellent Operational Health",
      description: (
        <>
          Overall efficiency is strong at <strong className="text-slate-800">{efficiency.efficiency_score.toFixed(1)}%</strong>, indicating minimal disruptions.
        </>
      ),
      action: "Acknowledge team performance and maintain processes.",
      severity: "info",
      icon: <InfoIcon />,
    });
  } else if (efficiency.total_hours > 0) {
    insights.push({
      title: "Suboptimal Efficiency",
      description: (
        <>
          Overall efficiency is at <strong className="text-slate-800">{efficiency.efficiency_score.toFixed(1)}%</strong>, showing room for improvement to reach the 85% target.
        </>
      ),
      action: "Evaluate operational workflows and consider additional operator training to reduce downtime.",
      severity: "medium",
      icon: <MediumIcon />,
    });
  }

  return insights;
}

const severityStyles: Record<string, string> = {
  high: "border-red-200 bg-red-50/30",
  medium: "border-amber-200 bg-amber-50/30",
  info: "border-indigo-200 bg-indigo-50/30",
};

const actionStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  info: "bg-indigo-100 text-indigo-700",
};

export default function Insights({ summary, efficiency, quality }: Props) {
  const { formatTime, formatDate } = useFormat();
  if (!summary || !efficiency || !quality) return null;

  const insights = generateInsights(summary, efficiency, quality, formatTime, formatDate);

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
      <h2 className="text-lg font-semibold mb-6 text-slate-800">
        Operational Insights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins, i) => (
          <div
            key={i}
            className={`p-5 rounded-xl border flex gap-4 items-start ${severityStyles[ins.severity]} transition-colors hover:bg-white`}
          >
            <div className="shrink-0">{ins.icon}</div>
            <div className="flex flex-col h-full">
              <h3 className="text-[0.95rem] font-bold text-slate-800 mb-1">
                {ins.title}
              </h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                {ins.description}
              </p>
              <div className="mt-auto">
                <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide ${actionStyles[ins.severity]}`}>
                  Action: {ins.action}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
