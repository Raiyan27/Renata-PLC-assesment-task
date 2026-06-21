from fastapi import APIRouter
from database import get_db
from models import QualityResponse, QualityIssue, FlaggedRecord
from collections import Counter

router = APIRouter(prefix="/api")


@router.get("/data-quality", response_model=QualityResponse)
def get_quality():
    conn = get_db()
    rows = conn.execute("SELECT * FROM shifts").fetchall()
    conn.close()

    total = len(rows)
    valid = sum(1 for r in rows if r["is_valid"])
    flagged = total - valid

    issue_counter = Counter()
    flagged_records = []

    for r in rows:
        if not r["is_valid"]:
            issues = r["issues"].split(",") if r["issues"] else []
            for issue in issues:
                issue_counter[issue] += 1
            flagged_records.append(
                FlaggedRecord(
                    id=r["id"],
                    day_date=r["day_date"],
                    reported_hours=r["reported_hours"],
                    reason=r["reason"],
                    issues=issues,
                )
            )

    # Count duplicates removed (from CSV total vs DB total)
    import pandas as pd
    from database import CSV_PATH, detect_duplicates
    df = pd.read_csv(str(CSV_PATH), keep_default_na=False)
    duplicates_removed = len(detect_duplicates(df))

    return QualityResponse(
        total_records=total,
        valid_records=valid,
        flagged_records=flagged,
        duplicates_removed=duplicates_removed,
        issue_summary=[
            QualityIssue(issue_type=k, count=v)
            for k, v in sorted(issue_counter.items())
        ],
        flagged=flagged_records,
    )
