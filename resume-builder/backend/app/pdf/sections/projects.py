"""Projects."""

from __future__ import annotations

import html as _html

from reportlab.platypus import Flowable, Paragraph

from app.models.resume import ResumeData
from app.pdf.dates import date_range
from app.pdf.sections._common import (
    block_gap,
    keep,
    label_for,
    rich,
    section_gap,
    section_header,
    two_column_row,
)
from app.pdf.styles import Styles


def _e(t: str) -> str:
    return _html.escape(t or "", quote=False)


def render(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    items = [p for p in data.sections.projects if p.name]
    if not items:
        return []
    df = styles.customization.dateFormat
    out: list[Flowable] = []
    for idx, p in enumerate(items):
        block: list[Flowable] = []
        if idx == 0:
            block.extend(section_header(label_for("projects", styles), styles, sidebar=sidebar))
        else:
            block.append(block_gap(styles))
        date_str = date_range(p.startDate, p.endDate, df)
        left = [Paragraph(_e(p.name), styles.item_title if not sidebar else styles.sidebar_item_title)]
        if date_str:
            right = Paragraph(_e(date_str), styles.date_right)
            block.append(two_column_row(left, right, styles))
        else:
            block.extend(left)
        block.extend(rich(p.description, styles, sidebar=sidebar))
        if p.technologies:
            block.append(
                Paragraph(
                    f"<b>Tech:</b> {_e(p.technologies)}",
                    styles.body_secondary,
                )
            )
        out.append(keep(block))
    out.append(section_gap(styles))
    return out
