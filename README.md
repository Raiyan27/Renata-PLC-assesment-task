# Shift Analytics Dashboard

A web application for analyzing employee shift data, detecting operational patterns, and generating actionable insights.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + Python |
| Frontend | React + TypeScript + Vite |
| Charts | Recharts |
| Database | SQLite |
| Data Processing | Pandas |

### Why FastAPI over Django?

This is a lightweight analytics API with 5 endpoints. Django's ORM, admin panel, authentication, and template engine add unnecessary complexity. FastAPI provides:
- Automatic OpenAPI documentation at `/docs`
- Built-in request validation via Pydantic
- Minimal boilerplate
- Easy Pandas integration for data processing

## Setup & Run

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at http://localhost:8000. API docs at http://localhost:8000/docs.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173.

## Features

- **Shift Visualization**: Stacked bar chart showing hours by date and activity category
- **Category Breakdown**: Pie chart of hours distribution across categories
- **Filtering**: Filter by category, date range, and data validity
- **Operational Efficiency Score**: `(Productive Hours / Total Hours) × 100`
- **Breakdown Streak Detection**: Identifies consecutive-day breakdown patterns
- **Operational Insights**: Actionable findings for plant managers
- **Data Quality Reporting**: Surfaces all detected data issues

## Data Quality Findings

The dataset contains 51 rows with the following issues detected:

| Issue | Details |
|-------|---------|
| Duration mismatch (×2) | Reported hours significantly differ from calculated hours |
| Missing timestamps (×2) | START or END timestamp is empty |
| Invalid timestamp (×1) | `invalid-time` in START field |
| Invalid date (×1) | `2025-15-55` is not a valid date |
| Negative duration (×1) | HOURS = -3 |
| Duplicate rows (×1) | Exact duplicate pair detected |
| Unrealistic duration (×1) | HOURS = 18 for a 4-hour shift |

**Handling**: All issues are flagged per-record with specific issue types. Records with issues are included in the database but excluded from analytics by default. Users can toggle "Valid records only" to include/exclude them. No data is silently discarded.

## Assumptions

1. **Efficiency Score**: Productive hours exclude "Breakdown" and "Unknown Failure" categories. All other categories are considered productive.
2. **Breakdown Streaks**: A streak is defined as 2+ breakdown events occurring on the same or consecutive calendar days. Only valid records with parseable timestamps are considered.
3. **Duration Calculation**: When both START and END timestamps are valid, computed hours are recalculated and used instead of reported HOURS. The mismatch is flagged.
4. **Invalid Dates**: If DAY_DATE cannot be parsed but START timestamp is valid, the date is inferred from START.
5. **Duplicates**: Exact row duplicates are detected and removed (1 kept).
6. **Dynamic Categories**: Categories are read from the data, not hardcoded. New categories will automatically appear in filters, charts, and aggregations.

## Design Decisions

- **Single dashboard page**: All analytics visible at once, no routing needed
- **Filter state shared across components**: Filters affect summary and efficiency, streaks and quality are global
- **Backend computes analytics**: Frontend is a thin display layer
- **SQLite rebuilt on startup**: Data loaded fresh from CSV each time — appropriate for a dataset of this size
- **Dark theme**: Professional, modern dashboard aesthetic
