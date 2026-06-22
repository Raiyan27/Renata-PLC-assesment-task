# Shift Analytics Dashboard

A modern, highly interactive web application for analyzing employee shift data, detecting operational patterns, and generating actionable manufacturing insights.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + Python |
| Frontend | React + TypeScript + Vite |
| Charts | Recharts |
| Database | SQLite |
| Data Processing | Pandas, Openpyxl |

### Why FastAPI over Django?

This is a lightweight analytics API designed for maximum speed. Django's ORM, admin panel, authentication, and template engine add unnecessary overhead. FastAPI provides:
- Automatic OpenAPI documentation at `/docs`
- Built-in request validation via Pydantic
- Extremely low latency
- Native, frictionless Pandas integration for data ingestion and manipulation

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

## Core Features

- **Custom Dataset Uploading**: Drag and drop your own `.csv` or `.xlsx` files to instantly ingest new data and recalculate the entire dashboard on the fly.
- **Dynamic Dataset Recovery**: A one-click "Refresh/Restore Default Dataset" mechanism immediately wipes custom data and re-reads the underlying local dataset, keeping the app strictly in sync with filesystem edits.
- **Downtime Pareto Chart (80/20 Rule)**: Visually identifies the "vital few" operational issues causing the majority of downtime, overlaid with a cumulative percentage curve.
- **Daily Efficiency Trend**: A smooth, color-dynamic area chart tracking the trajectory of operational health day-over-day.
- **Interactive Downtime Highlighting**: A dedicated toggle inside the visualizations instantly dims productive categories, creating a high-contrast spotlight exclusively on time-compromising failure events.
- **Shift Timeline Visualization**: Stacked bar chart showing comprehensive hour distribution by date and category.
- **Smart Filtering**: Interactively slice the data by specific categories and date ranges. The UI smartly manages when and where to display "Clear Filters" controls.
- **Breakdown Streak Detection**: Programmatically identifies consecutive-day machine failure patterns that point to systemic, unresolved maintenance issues.
- **Data Quality Reporting**: Proactively surfaces all detected data anomalies in a dedicated debugging table.

## Data Quality Handling

The default dataset contains deliberate formatting flaws. The robust backend ingestion engine automatically flags issues (such as missing timestamps, exact duplicate rows, or negative durations) without silently discarding data.

## Assumptions & Design Logic

1. **Efficiency Score**: Productive hours explicitly exclude the "Breakdown" and "Unknown Failure" categories.
2. **Breakdown Streaks**: A streak is defined as 2+ failure events occurring on the same or consecutive calendar days.
3. **Data Scrubbing**: When both START and END timestamps are valid, the system strictly recalculates hours and overrides any manually reported anomalous durations.
4. **Header Mapping**: The CSV/Excel upload processor automatically performs fuzzy matching and normalization on column headers to remain extremely resilient to human formatting errors.
5. **Aesthetics First**: The entire interface was rebuilt to favor a sleek, light, glassmorphic aesthetic with micro-animations and intuitive hover states—vastly improving the user experience over standard enterprise software.
