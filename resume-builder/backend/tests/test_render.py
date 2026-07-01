"""Smoke render every template and confirm key strings show up in the extracted text."""

from __future__ import annotations

import io

import pytest
from pypdf import PdfReader

from app.models.resume import ResumeData
from app.pdf.renderer import render_resume_pdf

from tests.smoke_classic import SAMPLE


@pytest.mark.parametrize("template", ["classic", "steady-form", "professional", "specialist"])
def test_render_template(template: str) -> None:
    sample = dict(SAMPLE)
    sample["customization"] = {**SAMPLE["customization"], "selectedTemplate": template}
    data = ResumeData.model_validate(sample)
    buf = io.BytesIO()
    render_resume_pdf(data, buf)
    assert buf.tell() > 1000  # nontrivial PDF
    buf.seek(0)
    reader = PdfReader(buf)
    assert len(reader.pages) >= 1
    text = "\n".join((p.extract_text() or "") for p in reader.pages)
    for needle in ("Ava Thompson", "Northstar Labs", "Parsons", "7+ years", "with honors"):
        assert needle in text, f"{template}: missing {needle!r}\n{text[:600]}"


def test_empty_resume_renders() -> None:
    data = ResumeData()  # all defaults; should not crash
    buf = io.BytesIO()
    render_resume_pdf(data, buf)
    assert buf.tell() > 100
