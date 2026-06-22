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
        """SELECT day_date, reason, computed_hours, reported_hours
           FROM shifts
           WHERE is_valid = 1 AND day_date IS NOT NULL
           ORDER BY day_date, start_time"""
    ).fetchall()
    conn.close()

    if not rows:
        return StreakResponse(
            chained_streaks=[],
            consecutive_days_streaks=[],
            total_breakdown_hours=0,
            assumption="Includes both chained events (consecutive without interruption) and consecutive days streaks.",
        )

    # 1. Chained Streaks
    chained_streaks = []
    current_chained = []
    
    # 2. Extract breakdown events for consecutive days logic
    breakdown_events = []
    
    total_breakdown_hours = 0.0

    for r in rows:
        hours = r["computed_hours"] if r["computed_hours"] is not None else (r["reported_hours"] or 0)
        
        if r["reason"] == STREAK_CATEGORY:
            total_breakdown_hours += hours if hours > 0 else 0
            
            event_obj = {"date": r["day_date"], "hours": hours}
            current_chained.append(event_obj)
            breakdown_events.append(event_obj)
        else:
            if len(current_chained) >= STREAK_MIN_EVENTS:
                chained_streaks.append(current_chained)
            current_chained = []

    if len(current_chained) >= STREAK_MIN_EVENTS:
        chained_streaks.append(current_chained)

    # Calculate consecutive days streaks
    consecutive_days_streaks = []
    if breakdown_events:
        current_consec = [breakdown_events[0]]
        for i in range(1, len(breakdown_events)):
            prev_date = datetime.strptime(breakdown_events[i - 1]["date"], "%Y-%m-%d")
            curr_date = datetime.strptime(breakdown_events[i]["date"], "%Y-%m-%d")
            gap = (curr_date - prev_date).days

            if gap <= 1:
                current_consec.append(breakdown_events[i])
            else:
                if len(current_consec) >= STREAK_MIN_EVENTS:
                    consecutive_days_streaks.append(current_consec)
                current_consec = [breakdown_events[i]]
        
        if len(current_consec) >= STREAK_MIN_EVENTS:
            consecutive_days_streaks.append(current_consec)

    return StreakResponse(
        chained_streaks=[
            Streak(
                start_date=s[0]["date"],
                end_date=s[-1]["date"],
                events=len(s),
                total_hours=round(sum(e["hours"] for e in s if e["hours"] > 0), 2),
            )
            for s in chained_streaks
        ],
        consecutive_days_streaks=[
            Streak(
                start_date=s[0]["date"],
                end_date=s[-1]["date"],
                events=len(s),
                total_hours=round(sum(e["hours"] for e in s if e["hours"] > 0), 2),
                days=len(set(e["date"] for e in s))
            )
            for s in consecutive_days_streaks
        ],
        total_breakdown_hours=round(total_breakdown_hours, 2),
        assumption="Includes both chained events (consecutive without interruption) and consecutive days streaks.",
    )
