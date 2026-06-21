from fastapi import APIRouter, Query
from database import get_db
from models import ShiftRecord, ShiftResponse

router = APIRouter(prefix="/api")


@router.get("/shifts", response_model=ShiftResponse)
def get_shifts(
    reason: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    valid_only: bool = Query(False),
):
    conn = get_db()

    query = "SELECT * FROM shifts WHERE 1=1"
    params = []

    if reason:
        query += " AND reason = ?"
        params.append(reason)
    if date_from:
        query += " AND day_date >= ?"
        params.append(date_from)
    if date_to:
        query += " AND day_date <= ?"
        params.append(date_to)
    if valid_only:
        query += " AND is_valid = 1"

    query += " ORDER BY day_date, start_time"

    rows = conn.execute(query, params).fetchall()
    conn.close()

    records = [
        ShiftRecord(
            id=r["id"],
            day_date=r["day_date"],
            start_time=r["start_time"],
            end_time=r["end_time"],
            reported_hours=r["reported_hours"],
            computed_hours=r["computed_hours"],
            reason=r["reason"],
            is_valid=bool(r["is_valid"]),
            issues=r["issues"].split(",") if r["issues"] else [],
        )
        for r in rows
    ]

    return ShiftResponse(total=len(records), records=records)
