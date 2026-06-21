from fastapi import APIRouter, Query
from database import get_db
from models import AnalyticsSummary, CategorySummary, DailySummary, EfficiencyResponse
from collections import defaultdict

router = APIRouter(prefix="/api/analytics")

FAILURE_CATEGORIES = ["Breakdown", "Unknown Failure"]


def build_where(reason: str | None, date_from: str | None, date_to: str | None) -> tuple[str, list]:
    clauses = ["is_valid = 1"]
    params = []
    if reason:
        clauses.append("reason = ?")
        params.append(reason)
    if date_from:
        clauses.append("day_date >= ?")
        params.append(date_from)
    if date_to:
        clauses.append("day_date <= ?")
        params.append(date_to)
    return " AND ".join(clauses), params


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(
    reason: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
):
    conn = get_db()
    where, params = build_where(reason, date_from, date_to)

    rows = conn.execute(
        f"SELECT * FROM shifts WHERE {where} ORDER BY day_date, start_time",
        params,
    ).fetchall()
    conn.close()

    by_category = defaultdict(lambda: {"hours": 0.0, "count": 0})
    by_date = defaultdict(lambda: defaultdict(float))

    for r in rows:
        hours = r["computed_hours"] if r["computed_hours"] is not None else (r["reported_hours"] or 0)
        cat = r["reason"]
        by_category[cat]["hours"] += hours
        by_category[cat]["count"] += 1
        if r["day_date"]:
            by_date[r["day_date"]][cat] += hours

    categories = sorted(by_category.keys())

    return AnalyticsSummary(
        total_records=len(rows),
        total_hours=round(sum(c["hours"] for c in by_category.values()), 2),
        by_category=[
            CategorySummary(reason=k, total_hours=round(v["hours"], 2), count=v["count"])
            for k, v in sorted(by_category.items())
        ],
        by_date=[
            DailySummary(date=d, total_hours=round(sum(cats.values()), 2), categories=dict(cats))
            for d, cats in sorted(by_date.items())
        ],
        categories=categories,
    )


@router.get("/efficiency", response_model=EfficiencyResponse)
def get_efficiency(
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
):
    conn = get_db()
    where, params = build_where(None, date_from, date_to)

    rows = conn.execute(
        f"SELECT reason, computed_hours, reported_hours FROM shifts WHERE {where}",
        params,
    ).fetchall()
    conn.close()

    total = 0.0
    productive = 0.0

    for r in rows:
        hours = r["computed_hours"] if r["computed_hours"] is not None else (r["reported_hours"] or 0)
        if hours < 0:
            continue
        total += hours
        if r["reason"] not in FAILURE_CATEGORIES:
            productive += hours

    score = (productive / total * 100) if total > 0 else 0

    return EfficiencyResponse(
        productive_hours=round(productive, 2),
        total_hours=round(total, 2),
        efficiency_score=round(score, 1),
        failure_categories=FAILURE_CATEGORIES,
    )
