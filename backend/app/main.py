from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.engine import create_db_and_tables

app = FastAPI(title=settings.PROJECT_NAME)

# CORS - Allow frontend to talk to backend
locations = ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=locations,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"message": "Welcome to Job Hunt AI Agent API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
