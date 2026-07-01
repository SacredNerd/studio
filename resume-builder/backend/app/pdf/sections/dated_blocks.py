"""Sections that share a 'title + dated org + description' shape."""

from __future__ import annotations

import html as _html

from reportlab.platypus import Flowable, Paragraph

from app.models.resume import ResumeData
from app.pdf.dates import date_range, format_date
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


def _render(
    key: str,
    items: list[tuple[str, str, str, str]],  # (title, org, date_string, description_html)
    styles: Styles,
    sidebar: bool,
) -> list[Flowable]:
    items = [i for i in items if any(i[:3])]
    if not items:
        return []
    out: list[Flowable] = []
    out.extend(section_header(label_for(key, styles), styles, sidebar=sidebar))
    for idx, (title, org, date_str, desc) in enumerate(items):
        block: list[Flowable] = []
        title_p = Paragraph(_e(title), styles.item_title if not sidebar else styles.sidebar_item_title)
        subtitle_p = Paragraph(_e(org), styles.item_subtitle) if org else None
        date_p = Paragraph(_e(date_str), styles.date_right)
        left_block = [title_p]
        if subtitle_p is not None:
            left_block.append(subtitle_p)
        block.append(two_column_row(left_block, date_p, styles))
        block.extend(rich(desc, styles, sidebar=sidebar))
        out.append(keep(block))
        if idx != len(items) - 1:
            out.append(block_gap(styles))
    out.append(section_gap(styles))
    return out


def render_internships(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    df = styles.customization.dateFormat
    return _render(
        "internships",
        [
            (i.role, i.company, date_range(i.startDate, i.endDate, df), i.description)
            for i in data.sections.internships
        ],
        styles,
        sidebar,
    )


def render_training(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    df = styles.customization.dateFormat
    return _render(
        "professionalTraining",
        [
            (t.name, t.provider, format_date(t.date, df), t.details)
            for t in data.sections.professionalTraining
        ],
        styles,
        sidebar,
    )


def render_additional(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    df = styles.customization.dateFormat
    return _render(
        "additionalExperience",
        [
            (a.title, a.organization, format_date(a.date, df), a.description)
            for a in data.sections.additionalExperience
        ],
        styles,
        sidebar,
    )


def render_volunteering(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    df = styles.customization.dateFormat
    return _render(
        "volunteering",
        [
            (v.role, v.organization, format_date(v.date, df), v.description)
            for v in data.sections.volunteering
        ],
        styles,
        sidebar,
    )


def render_affiliations(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    df = styles.customization.dateFormat
    return _render(
        "affiliations",
        [
            (a.organization, a.role, format_date(a.date, df), "")
            for a in data.sections.affiliations
        ],
        styles,
        sidebar,
    )


def render_awards(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    df = styles.customization.dateFormat
    return _render(
        "awards",
        [
            (a.title, a.issuer, format_date(a.date, df), a.description)
            for a in data.sections.awards
        ],
        styles,
        sidebar,
    )


def render_certifications(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    df = styles.customization.dateFormat
    return _render(
        "certifications",
        [
            (c.name, c.issuer, format_date(c.date, df), "")
            for c in data.sections.certifications
        ],
        styles,
        sidebar,
    )


def render_custom_advanced(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    return _render(
        "customAdvanced",
        [(c.title, "", "", c.description) for c in data.sections.customAdvanced],
        styles,
        sidebar,
    )
