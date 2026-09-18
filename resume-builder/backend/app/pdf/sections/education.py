"""Education. Honors `showEducationBy` and `educationLayout`."""

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


def _e(text: str) -> str:
    return _html.escape(text or "", quote=False)


def render(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    items = [e for e in data.sections.education if (e.institution or e.degree)]
    if not items:
        return []

    df = styles.customization.dateFormat
    by = styles.customization.showEducationBy
    inline = styles.customization.educationLayout == "inline"

    out: list[Flowable] = []

    for idx, item in enumerate(items):
        primary = item.institution if by == "institution" else item.degree
        secondary = item.degree if by == "institution" else item.institution

        block: list[Flowable] = []
        if idx == 0:
            block.extend(section_header(label_for("education", styles), styles, sidebar=sidebar))
        else:
            block.append(block_gap(styles))

        date = date_range(item.startDate, item.endDate, df)

        if inline:
            parts = [_e(primary)]
            if secondary:
                parts.append(f'<font color="{_color_hex(styles.accent)}">{_e(secondary)}</font>')
            if item.location:
                parts.append(f'<font color="{_color_hex(styles.secondary_text)}">{_e(item.location)}</font>')
            left = Paragraph(" — ".join(parts), styles.item_title if not sidebar else styles.sidebar_item_title)
            right = Paragraph(_e(date), styles.date_right)
            block.append(two_column_row(left, right, styles))
        else:
            title = Paragraph(_e(primary), styles.item_title if not sidebar else styles.sidebar_item_title)
            meta = " • ".join(p for p in (secondary, item.location) if p)
            subtitle = Paragraph(_e(meta), styles.item_subtitle) if meta else None
            right = Paragraph(_e(date), styles.date_right)
            left_block = [title]
            if subtitle is not None:
                left_block.append(subtitle)
            block.append(two_column_row(left_block, right, styles))

        block.extend(rich(item.details, styles, sidebar=sidebar))
        out.append(keep(block))

    out.append(section_gap(styles))
    return out


def _color_hex(c) -> str:
    return "#{:02x}{:02x}{:02x}".format(
        int(c.red * 255), int(c.green * 255), int(c.blue * 255)
    )
