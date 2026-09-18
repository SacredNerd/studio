"""professionalSummary and powerStatement — single rich-text blocks."""

from __future__ import annotations

from reportlab.platypus import Flowable, KeepTogether

from app.models.resume import ResumeData
from app.pdf.sections._common import label_for, rich, section_gap, section_header
from app.pdf.styles import Styles


def render(key: str, data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    text = getattr(data.sections, key, "") or ""
    if not text.strip():
        return []
    out: list[Flowable] = []
    block: list[Flowable] = []
    block.extend(section_header(label_for(key, styles), styles, sidebar=sidebar))
    block.extend(rich(text, styles, sidebar=sidebar))
    out.append(KeepTogether(block))
    out.append(section_gap(styles))
    return out
