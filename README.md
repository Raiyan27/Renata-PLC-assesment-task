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

### Environment Configuration
Create a `.env` file in the root directory of the project to manage environment variables:
```env
VITE_API_URL=http://localhost:8000/api
FRONTEND_URL=http://localhost:5173
```

### Python Environment Setup
```bash
cd backend
# 1. Create a virtual environment
python -m venv .venv

# 2. Activate it
# Windows
.venv\Scripts\activate
# Mac/Linux
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt
```

### Backend
```bash
cd backend
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
- **Interactive Highlighting**: Clicking segments directly on the pie or bar charts dynamically isolates and highlights specific categories across all dates (Alt+Click allows for multi-select). A dedicated toggle is also available to instantly dim productive categories and spotlight failure events.
- **Shift Timeline Visualization**: Stacked bar chart showing comprehensive hour distribution by date and category.
- **Downtime Pareto Chart (80/20 Rule)**: Visually identifies the "vital few" operational issues causing the majority of downtime, overlaid with a cumulative percentage curve.
- **Breakdown Streak Detection**: Programmatically identifies consecutive-day machine failure patterns that point to systemic, unresolved maintenance issues.
- **Data Quality Reporting**: Proactively surfaces all detected data anomalies in a dedicated debugging table.
- **Daily Efficiency Trend**: A smooth, color-dynamic area chart tracking the trajectory of operational health day-over-day.
- **Dynamic Dataset Recovery**: A one-click "Refresh/Restore Default Dataset" mechanism immediately wipes custom data and re-reads the underlying local dataset, keeping the app strictly in sync with filesystem edits.
- **Smart Filtering**: Interactively slice the data by specific categories and date ranges. The UI smartly manages when and where to display "Clear Filters" controls.

## Data Processing & Analysis

The application follows a robust pipeline to turn raw shift records into actionable insights:
1. **Ingestion & Normalization**: Raw datasets (CSV/Excel) are ingested via Pandas. The system normalizes date formats, parses timestamps regardless of timezone variances, and strips inconsistencies.
2. **Computed Validation**: Instead of blindly trusting reported hours, the backend independently recalculates durations based on start and end timestamps. Discrepancies are flagged for review.
3. **Dynamic Aggregation**: When the frontend requests analytics (e.g., summary metrics or efficiency), the backend translates the requested filters (date ranges, category exclusions) into optimized SQL queries. The data is aggregated directly within SQLite before being sent to the client, minimizing payload size.
4. **Insight Generation**: The dashboard cross-references the aggregated data against predefined operational rules (e.g., identifying consecutive breakdown streaks, calculating micro-stoppage frequencies) to surface intelligent, context-aware alerts.

## Data Quality Handling

The default dataset contains deliberate formatting flaws. The robust backend ingestion engine automatically flags issues (such as missing timestamps, exact duplicate rows, or negative durations) without silently discarding data.

## Assumptions & Design Logic

1. **Efficiency Score**: Productive hours explicitly exclude the "Breakdown" and "Unknown Failure" categories.
2. **Breakdown Streaks**: A streak is defined as 2+ failure events occurring on the same or consecutive calendar days.
3. **Data Scrubbing**: When both START and END timestamps are valid, the system strictly recalculates hours and overrides any manually reported anomalous durations.
4. **Header Mapping**: The CSV/Excel upload processor automatically performs fuzzy matching and normalization on column headers to remain extremely resilient to human formatting errors.

## Operational Insights Conditions

The dashboard dynamically generates context-aware insight cards based on the ingested dataset. The exact conditions evaluated are:

1. **Peak Failure Day**: Identifies the specific date with the highest cumulative failure hours (triggers if > 0 failure hours).
2. **Leading Failure**: Highlights the dominant failure category that contributes the most to total downtime.
3. **Data Reliability**: Evaluates dataset health based on the percentage of flagged anomalous records vs. total records:
   - **Critical (> 30% errors)**: Triggers a high-severity alert.
   - **Warning (5% - 30% errors)**: Flags moderate data entry issues.
   - **Acceptable (< 5% errors)**: Notes minor discrepancies but permits normal analysis.
4. **Top Productive Activity**: Identifies the single non-failure category capturing the highest number of hours.
5. **Frequent Micro-Stoppages**: Detects systemic rapid interruptions by identifying failure categories that occur frequently (≥ 3 times) but average very brief durations (≤ 45 minutes / 0.75 hours per event).
6. **Operational Health**: Assesses the overall calculated efficiency score:
   - **Excellent (≥ 85%)**: Indicates strong, stable operational performance.
   - **Suboptimal (65% - 84.9%)**: Indicates room for improvement to meet target standards.
   - **Critical (< 65%)**: Flags severe operational drops requiring immediate management review.
