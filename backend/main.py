from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load from the parent directory's .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
from contextlib import asynccontextmanager
from database import init_db
from routes import shifts, analytics, streaks, quality, upload


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Shift Analytics API", lifespan=lifespan)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [origin.strip() for origin in frontend_url.split(",")] if frontend_url else ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shifts.router)
app.include_router(analytics.router)
app.include_router(streaks.router)
app.include_router(quality.router)
app.include_router(upload.router)

@app.get("/api")
def read_root():
    return {"status": "online", "message": "Shift Analytics API is running"}

@app.get("/")
def read_root():
    return {"status": "online", "message": "Shift Analytics API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
