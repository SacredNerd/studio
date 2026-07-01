"""FastAPI app entry point."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import resumes
from app.db import init_db


def create_app() -> FastAPI:
    app = FastAPI(title="Resume Builder Backend", version="0.1.0")

    # Vite dev server. Tighten for production.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    init_db()
    app.include_router(resumes.router)

    @app.get("/healthz")
    def healthz() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
