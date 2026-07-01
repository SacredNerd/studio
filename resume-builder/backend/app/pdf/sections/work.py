"""Work history. Role + company/location row, right-aligned dates,
rich-text summary, bullet highlights."""

from __future__ import annotations

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


def render(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    items = [w for w in data.sections.workHistory if (w.company or w.role)]
    if not items:
        return []

    df = styles.customization.dateFormat
    out: list[Flowable] = []
    out.extend(section_header(label_for("workHistory", styles), styles, sidebar=sidebar))

    for idx, item in enumerate(items):
        block: list[Flowable] = []
        title = Paragraph(_escape(item.role or ""), styles.item_title if not sidebar else styles.sidebar_item_title)
        meta = " • ".join(p for p in (item.company, item.location) if p)
        subtitle = Paragraph(_escape(meta), styles.item_subtitle) if meta else None
        right = Paragraph(date_range(item.startDate, item.endDate, df), styles.date_right)

        left_block = [title]
        if subtitle is not None:
            left_block.append(subtitle)
        block.append(two_column_row(left_block, right, styles))

        block.extend(rich(item.summary, styles, sidebar=sidebar))

        for h in item.highlights or []:
            if h:
                block.append(Paragraph("• " + _escape(h), styles.bullet))

        out.append(keep(block))
        if idx != len(items) - 1:
            out.append(block_gap(styles))

    out.append(section_gap(styles))
    return out


def _escape(text: str) -> str:
    import html
    return html.escape(text or "", quote=False)
