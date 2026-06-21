from fastapi import APIRouter
from database import get_db
from models import Streak, StreakResponse
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/analytics")

STREAK_MIN_EVENTS = 2
STREAK_CATEGORY = "Breakdown"


@router.get("/streaks", response_model=StreakResponse)
def get_streaks():
    conn = get_db()
    rows = conn.execute(
        """SELECT day_date, start_time, computed_hours, reported_hours
           FROM shifts
           WHERE reason = ? AND is_valid = 1 AND day_date IS NOT NULL
           ORDER BY day_date, start_time""",
        (STREAK_CATEGORY,),
    ).fetchall()
    conn.close()

    if not rows:
        return StreakResponse(
            streaks=[],
            total_breakdown_hours=0,
            assumption="A breakdown streak is 2+ breakdown events on the same or consecutive calendar days.",
        )

    events = []
    for r in rows:
        hours = r["computed_hours"] if r["computed_hours"] is not None else (r["reported_hours"] or 0)
        events.append({"date": r["day_date"], "hours": hours})

    streaks = []
    current_streak = [events[0]]

    for i in range(1, len(events)):
        prev_date = datetime.strptime(events[i - 1]["date"], "%Y-%m-%d")
        curr_date = datetime.strptime(events[i]["date"], "%Y-%m-%d")
        gap = (curr_date - prev_date).days

        if gap <= 1:
            current_streak.append(events[i])
        else:
            if len(current_streak) >= STREAK_MIN_EVENTS:
                streaks.append(current_streak)
            current_streak = [events[i]]

    if len(current_streak) >= STREAK_MIN_EVENTS:
        streaks.append(current_streak)

    total_breakdown_hours = sum(e["hours"] for e in events if e["hours"] > 0)

    return StreakResponse(
        streaks=[
            Streak(
                start_date=s[0]["date"],
                end_date=s[-1]["date"],
                events=len(s),
                total_hours=round(sum(e["hours"] for e in s if e["hours"] > 0), 2),
            )
            for s in streaks
        ],
        total_breakdown_hours=round(total_breakdown_hours, 2),
        assumption="A breakdown streak is 2+ breakdown events on the same or consecutive calendar days.",
    )
