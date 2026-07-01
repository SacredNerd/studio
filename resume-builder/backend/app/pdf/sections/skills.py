"""Skills + Technical Proficiencies. Honors skillsLayout/columns."""

from __future__ import annotations

import html as _html

from reportlab.platypus import Flowable, Paragraph, Table, TableStyle

from app.models.resume import ResumeData
from app.pdf.sections._common import label_for, section_gap, section_header
from app.pdf.styles import Styles


def _e(t: str) -> str:
    return _html.escape(t or "", quote=False)


def _render_groups(
    groups: list[tuple[str, list[str]]],
    styles: Styles,
    *,
    sidebar: bool,
) -> list[Flowable]:
    layout = styles.customization.skillsLayout
    cols = max(1, int(styles.customization.skillsColumns or 1))
    body = styles.sidebar_body if sidebar else styles.body
    title_style = styles.item_title if not sidebar else styles.sidebar_item_title

    if layout == "inline" or len(groups) <= 1:
        # One per row
        out: list[Flowable] = []
        for title, items in groups:
            if title:
                out.append(Paragraph(_e(title), title_style))
            joined = " • ".join(_e(x) for x in items if x)
            if joined:
                out.append(Paragraph(joined, body))
        return out

    # Columns: lay out as a Table of cells, cols-wide.
    cells = []
    for title, items in groups:
        joined = " • ".join(_e(x) for x in items if x)
        cell = []
        if title:
            cell.append(Paragraph(_e(title), title_style))
        if joined:
            cell.append(Paragraph(joined, body))
        cells.append(cell)

    rows = []
    for i in range(0, len(cells), cols):
        row = cells[i : i + cols]
        while len(row) < cols:
            row.append("")
        rows.append(row)

    t = Table(rows, colWidths=[None] * cols, hAlign="LEFT")
    t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return [t]


def render_skills(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    groups = [(g.title or "", list(g.items or [])) for g in data.sections.skills if (g.title or g.items)]
    if not groups:
        return []
    out: list[Flowable] = []
    out.extend(section_header(label_for("skills", styles), styles, sidebar=sidebar))
    out.extend(_render_groups(groups, styles, sidebar=sidebar))
    out.append(section_gap(styles))
    return out


def render_technical(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    groups = [(g.category or "", list(g.items or [])) for g in data.sections.technicalProficiencies if (g.category or g.items)]
    if not groups:
        return []
    out: list[Flowable] = []
    out.extend(section_header(label_for("technicalProficiencies", styles), styles, sidebar=sidebar))
    out.extend(_render_groups(groups, styles, sidebar=sidebar))
    out.append(section_gap(styles))
    return out
