"""Projects."""

from __future__ import annotations

import html as _html

from reportlab.platypus import Flowable, Paragraph

from app.models.resume import ResumeData
from app.pdf.sections._common import (
    block_gap,
    keep,
    label_for,
    rich,
    section_gap,
    section_header,
)
from app.pdf.styles import Styles


def _e(t: str) -> str:
    return _html.escape(t or "", quote=False)


def render(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    items = [p for p in data.sections.projects if p.name]
    if not items:
        return []
    out: list[Flowable] = []
    out.extend(section_header(label_for("projects", styles), styles, sidebar=sidebar))
    for idx, p in enumerate(items):
        block: list[Flowable] = []
        block.append(Paragraph(_e(p.name), styles.item_title if not sidebar else styles.sidebar_item_title))
        if p.subtitle:
            block.append(Paragraph(_e(p.subtitle), styles.item_subtitle))
        block.extend(rich(p.description, styles, sidebar=sidebar))
        if p.technologies:
            block.append(
                Paragraph(
                    f"<b>Tech:</b> {_e(p.technologies)}",
                    styles.body_secondary,
                )
            )
        out.append(keep(block))
        if idx != len(items) - 1:
            out.append(block_gap(styles))
    out.append(section_gap(styles))
    return out
