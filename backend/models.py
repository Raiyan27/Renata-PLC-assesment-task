from pydantic import BaseModel


class ShiftRecord(BaseModel):
    id: int
    day_date: str | None
    start_time: str | None
    end_time: str | None
    reported_hours: float | None
    computed_hours: float | None
    reason: str
    is_valid: bool
    issues: list[str]


class ShiftResponse(BaseModel):
    total: int
    records: list[ShiftRecord]


class CategorySummary(BaseModel):
    reason: str
    total_hours: float
    count: int


class DailySummary(BaseModel):
    date: str
    total_hours: float
    categories: dict[str, dict]


class AnalyticsSummary(BaseModel):
    total_records: int
    total_hours: float
    by_category: list[CategorySummary]
    by_date: list[DailySummary]
    categories: list[str]


class EfficiencyResponse(BaseModel):
    productive_hours: float
    total_hours: float
    efficiency_score: float
    failure_categories: list[str]


class Streak(BaseModel):
    start_date: str
    end_date: str
    events: int
    total_hours: float
    days: int | None = None


class StreakResponse(BaseModel):
    chained_streaks: list[Streak]
    consecutive_days_streaks: list[Streak]
    total_breakdown_hours: float
    assumption: str


class QualityIssue(BaseModel):
    issue_type: str
    count: int


class FlaggedRecord(BaseModel):
    id: int
    day_date: str | None
    reported_hours: float | None
    reason: str
    issues: list[str]


class QualityResponse(BaseModel):
    total_records: int
    valid_records: int
    flagged_records: int
    duplicates_removed: int
    issue_summary: list[QualityIssue]
    flagged: list[FlaggedRecord]
