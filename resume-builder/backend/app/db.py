"""SQLite via SQLAlchemy 2.x. Single `resumes` table; resume payload stored as JSON text."""

from __future__ import annotations

import os
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker


_DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "data" / "resumes.db"
_DB_URL = os.environ.get(
    "RESUME_BUILDER_DB_URL",
    f"sqlite:///{_DEFAULT_DB_PATH}",
)

# SQLite needs check_same_thread=False for FastAPI's threadpool calls.
_engine = create_engine(_DB_URL, connect_args={"check_same_thread": False}, future=True)
_SessionLocal = sessionmaker(bind=_engine, expire_on_commit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


class ResumeRow(Base):
    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False, default="Untitled")
    data_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[str] = mapped_column(String, nullable=False)
    updated_at: Mapped[str] = mapped_column(String, nullable=False)


def init_db() -> None:
    _DEFAULT_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(_engine)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@contextmanager
def session_scope():
    s: Session = _SessionLocal()
    try:
        yield s
        s.commit()
    except Exception:
        s.rollback()
        raise
    finally:
        s.close()
