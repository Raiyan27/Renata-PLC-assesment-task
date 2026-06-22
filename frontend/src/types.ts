export interface ShiftRecord {
  id: number;
  day_date: string | null;
  start_time: string | null;
  end_time: string | null;
  reported_hours: number | null;
  computed_hours: number | null;
  reason: string;
  is_valid: boolean;
  issues: string[];
}

export interface ShiftResponse {
  total: number;
  records: ShiftRecord[];
}

export interface CategorySummary {
  reason: string;
  total_hours: number;
  count: number;
}

export interface CategoryTimeSummary {
  hours: number;
  start: string | null;
  end: string | null;
}

export interface DailySummary {
  date: string;
  total_hours: number;
  categories: Record<string, CategoryTimeSummary>;
}

export interface AnalyticsSummary {
  total_records: number;
  total_hours: number;
  by_category: CategorySummary[];
  by_date: DailySummary[];
  categories: string[];
}

export interface EfficiencyResponse {
  productive_hours: number;
  total_hours: number;
  efficiency_score: number;
  failure_categories: string[];
}

export interface Streak {
  start_date: string;
  end_date: string;
  events: number;
  total_hours: number;
}

export interface StreakResponse {
  streaks: Streak[];
  total_breakdown_hours: number;
  assumption: string;
}

export interface QualityIssue {
  issue_type: string;
  count: number;
}

export interface FlaggedRecord {
  id: number;
  day_date: string | null;
  reported_hours: number | null;
  reason: string;
  issues: string[];
}

export interface QualityResponse {
  total_records: number;
  valid_records: number;
  flagged_records: number;
  duplicates_removed: number;
  issue_summary: QualityIssue[];
  flagged: FlaggedRecord[];
}

export interface Filters {
  reason?: string[];
  dateFrom?: string;
  dateTo?: string;
  validOnly?: boolean;
}
