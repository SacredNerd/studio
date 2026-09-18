"""Sections with just (title, description)."""

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


def _render(key: str, items: list[tuple[str, str]], styles: Styles, sidebar: bool) -> list[Flowable]:
    items = [i for i in items if i[0] or i[1]]
    if not items:
        return []
    out: list[Flowable] = []
    for idx, (title, desc) in enumerate(items):
        block: list[Flowable] = []
        if idx == 0:
            block.extend(section_header(label_for(key, styles), styles, sidebar=sidebar))
        else:
            block.append(block_gap(styles))
        if title:
            block.append(
                Paragraph(_e(title), styles.item_title if not sidebar else styles.sidebar_item_title)
            )
        block.extend(rich(desc, styles, sidebar=sidebar))
        out.append(keep(block))
    out.append(section_gap(styles))
    return out


def render_achievements(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    return _render(
        "achievements",
        [(a.title, a.description) for a in data.sections.achievements],
        styles,
        sidebar,
    )


def render_accomplishments(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    return _render(
        "accomplishments",
        [(a.title, a.description) for a in data.sections.accomplishments],
        styles,
        sidebar,
    )


def render_custom_simple(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    return _render(
        "customSimple",
        [(c.title, c.description) for c in data.sections.customSimple],
        styles,
        sidebar,
    )
