"""Resume CRUD + PDF generation endpoints."""

from __future__ import annotations

import io
import json
import secrets

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select

from app.db import ResumeRow, now_iso, session_scope
from app.models.resume import (
    CreateResumeRequest,
    ResumeData,
    ResumeEntry,
    ResumeSummary,
    UpdateResumeRequest,
)
from app.pdf.renderer import render_resume_pdf


router = APIRouter(prefix="/api/resumes", tags=["resumes"])


def _new_id() -> str:
    # Short, URL-safe, collision-resistant within a single-user store.
    return secrets.token_urlsafe(9)


def _row_to_entry(row: ResumeRow) -> ResumeEntry:
    return ResumeEntry(
        id=row.id,
        name=row.name,
        createdAt=row.created_at,
        updatedAt=row.updated_at,
        data=ResumeData.model_validate_json(row.data_json),
    )


def _row_to_summary(row: ResumeRow) -> ResumeSummary:
    return ResumeSummary(
        id=row.id,
        name=row.name,
        createdAt=row.created_at,
        updatedAt=row.updated_at,
    )


def _default_resume_data(title: str) -> ResumeData:
    data = ResumeData()
    data.headerFooter.documentTitle = title
    return data


@router.get("", response_model=list[ResumeSummary])
def list_resumes():
    with session_scope() as s:
        rows = s.execute(select(ResumeRow).order_by(ResumeRow.updated_at.desc())).scalars().all()
        return [_row_to_summary(r) for r in rows]


@router.post("", response_model=ResumeEntry, status_code=201)
def create_resume(req: CreateResumeRequest):
    rid = _new_id()
    name = req.name or "Untitled"
    data = req.data or _default_resume_data(name)
    now = now_iso()
    with session_scope() as s:
        row = ResumeRow(
            id=rid,
            name=name,
            data_json=data.model_dump_json(by_alias=True),
            created_at=now,
            updated_at=now,
        )
        s.add(row)
        s.flush()
        return _row_to_entry(row)


@router.get("/{resume_id}", response_model=ResumeEntry)
def get_resume(resume_id: str):
    with session_scope() as s:
        row = s.get(ResumeRow, resume_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Resume not found")
        return _row_to_entry(row)


@router.put("/{resume_id}", response_model=ResumeEntry)
def update_resume(resume_id: str, req: UpdateResumeRequest):
    with session_scope() as s:
        row = s.get(ResumeRow, resume_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Resume not found")
        if req.name is not None:
            row.name = req.name
        if req.data is not None:
            row.data_json = req.data.model_dump_json(by_alias=True)
        row.updated_at = now_iso()
        s.flush()
        return _row_to_entry(row)


@router.delete("/{resume_id}", status_code=204)
def delete_resume(resume_id: str):
    with session_scope() as s:
        row = s.get(ResumeRow, resume_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Resume not found")
        s.delete(row)


@router.post("/{resume_id}/duplicate", response_model=ResumeEntry, status_code=201)
def duplicate_resume(resume_id: str):
    with session_scope() as s:
        row = s.get(ResumeRow, resume_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Resume not found")
        now = now_iso()
        copy = ResumeRow(
            id=_new_id(),
            name=f"{row.name} (Copy)",
            data_json=row.data_json,
            created_at=now,
            updated_at=now,
        )
        s.add(copy)
        s.flush()
        return _row_to_entry(copy)


# ── PDF endpoints ────────────────────────────────────────────────────────────


def _pdf_response(data: ResumeData, filename: str) -> StreamingResponse:
    buffer = io.BytesIO()
    render_resume_pdf(data, buffer)
    buffer.seek(0)
    safe = (filename or "Resume").strip() or "Resume"
    headers = {"Content-Disposition": f'attachment; filename="{safe}.pdf"'}
    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)


@router.get("/{resume_id}/pdf")
def export_resume_pdf(resume_id: str):
    with session_scope() as s:
        row = s.get(ResumeRow, resume_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Resume not found")
        data = ResumeData.model_validate_json(row.data_json)
        filename = data.personalDetails.fullName or row.name or "Resume"
        return _pdf_response(data, filename)


# Stateless render — used by the editor's "Export PDF" button so we don't
# require a server-side save round-trip first. Body IS a ResumeData blob.
@router.post("/pdf")
def export_pdf_stateless(data: ResumeData):
    filename = data.personalDetails.fullName or "Resume"
    return _pdf_response(data, filename)
