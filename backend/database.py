import sqlite3
import pandas as pd
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent / "shifts.db"
CSV_PATH = Path(__file__).parent.parent / "shift_data.csv"

MISMATCH_THRESHOLD = 0.5  # hours


def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def parse_timestamp(value: str) -> datetime | None:
    if not value or not isinstance(value, str) or value.strip() == "":
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return None


def parse_date(value: str) -> str | None:
    if not value or not isinstance(value, str):
        return None
    for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%Y-%d-%m"):
        try:
            return datetime.strptime(value.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def validate_row(row: dict) -> tuple[dict, list[str]]:
    issues = []

    day_date = parse_date(str(row.get("DAY_DATE", "")))
    if day_date is None:
        issues.append("invalid_date")

    start = parse_timestamp(str(row.get("START", "")))
    end = parse_timestamp(str(row.get("END", "")))

    if row.get("START") and start is None:
        issues.append("invalid_start_timestamp")
    if not row.get("START") or (isinstance(row.get("START"), float) and pd.isna(row["START"])):
        issues.append("missing_start")
        start = None

    if row.get("END") and end is None:
        issues.append("invalid_end_timestamp")
    if not row.get("END") or (isinstance(row.get("END"), float) and pd.isna(row["END"])):
        issues.append("missing_end")
        end = None

    reported_hours = None
    try:
        reported_hours = float(row.get("HOURS", 0))
    except (ValueError, TypeError):
        issues.append("invalid_hours")

    if reported_hours is not None and reported_hours < 0:
        issues.append("negative_duration")

    computed_hours = None
    if start and end:
        diff = (end - start).total_seconds() / 3600
        computed_hours = round(diff, 2)
        if computed_hours < 0:
            issues.append("end_before_start")
        elif computed_hours > 24:
            issues.append("cross_midnight_or_multiday")
        if reported_hours is not None and abs(computed_hours - reported_hours) > MISMATCH_THRESHOLD:
            issues.append("duration_mismatch")

    if reported_hours is not None and reported_hours > 24:
        issues.append("unrealistic_duration")

    if day_date is None and start is not None:
        day_date = start.strftime("%Y-%m-%d")
        issues.append("date_inferred_from_start")

    reason = str(row.get("REASON", "")).strip()
    if not reason:
        issues.append("missing_reason")

    is_valid = len(issues) == 0

    return {
        "day_date": day_date,
        "start": start.isoformat() if start else None,
        "end": end.isoformat() if end else None,
        "reported_hours": reported_hours,
        "computed_hours": computed_hours,
        "reason": reason,
        "is_valid": is_valid,
        "issues": ",".join(issues) if issues else "",
    }, issues


def detect_duplicates(df: pd.DataFrame) -> set[int]:
    duplicates = set()
    seen = {}
    for idx, row in df.iterrows():
        key = (
            str(row.get("DAY_DATE", "")),
            str(row.get("START", "")),
            str(row.get("END", "")),
            str(row.get("HOURS", "")),
            str(row.get("REASON", "")),
        )
        if key in seen:
            duplicates.add(idx)
        else:
            seen[key] = idx
    return duplicates


def init_db():
    df = pd.read_csv(str(CSV_PATH), keep_default_na=False)
    duplicate_indices = detect_duplicates(df)

    conn = get_db()
    conn.execute("DROP TABLE IF EXISTS shifts")
    conn.execute("""
        CREATE TABLE shifts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day_date TEXT,
            start_time TEXT,
            end_time TEXT,
            reported_hours REAL,
            computed_hours REAL,
            reason TEXT,
            is_valid INTEGER,
            issues TEXT
        )
    """)

    for idx, row in df.iterrows():
        if idx in duplicate_indices:
            continue

        cleaned, _ = validate_row(row.to_dict())
        conn.execute(
            """INSERT INTO shifts (day_date, start_time, end_time, reported_hours,
               computed_hours, reason, is_valid, issues)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                cleaned["day_date"],
                cleaned["start"],
                cleaned["end"],
                cleaned["reported_hours"],
                cleaned["computed_hours"],
                cleaned["reason"],
                1 if cleaned["is_valid"] else 0,
                cleaned["issues"],
            ),
        )

    conn.commit()

    total = conn.execute("SELECT COUNT(*) FROM shifts").fetchone()[0]
    valid = conn.execute("SELECT COUNT(*) FROM shifts WHERE is_valid = 1").fetchone()[0]
    flagged = conn.execute("SELECT COUNT(*) FROM shifts WHERE is_valid = 0").fetchone()[0]
    conn.close()

    print(f"Database initialized: {total} records ({valid} valid, {flagged} flagged, {len(duplicate_indices)} duplicates removed)")
