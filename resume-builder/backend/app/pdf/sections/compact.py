"""Compact sections: languages, hobbies, references, websites."""

from __future__ import annotations

import html as _html

from reportlab.platypus import Flowable, KeepTogether, Paragraph

from app.models.resume import ResumeData
from app.pdf.sections._common import label_for, section_gap, section_header
from app.pdf.styles import Styles


def _e(t: str) -> str:
    return _html.escape(t or "", quote=False)


def render_languages(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    items = [l for l in data.sections.languages if l.name]
    if not items:
        return []
    body = styles.sidebar_body if sidebar else styles.body_muted
    out: list[Flowable] = []
    block: list[Flowable] = []
    block.extend(section_header(label_for("languages", styles), styles, sidebar=sidebar))
    parts = []
    for l in items:
        if l.level:
            parts.append(f"<b>{_e(l.name)}</b> — {_e(l.level)}")
        else:
            parts.append(f"<b>{_e(l.name)}</b>")
    block.append(Paragraph("  •  ".join(parts), body))
    out.append(KeepTogether(block))
    out.append(section_gap(styles))
    return out


def render_hobbies(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    names = [h.name for h in data.sections.hobbies if h.name]
    if not names:
        return []
    out: list[Flowable] = []
    block: list[Flowable] = []
    block.extend(section_header(label_for("hobbies", styles), styles, sidebar=sidebar))
    body = styles.sidebar_body if sidebar else styles.body_muted
    block.append(Paragraph(" • ".join(_e(n) for n in names), body))
    out.append(KeepTogether(block))
    out.append(section_gap(styles))
    return out


def render_references(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    refs = [r for r in data.sections.references if r.name]
    if not refs:
        return []
    out: list[Flowable] = []
    block: list[Flowable] = []
    block.extend(section_header(label_for("references", styles), styles, sidebar=sidebar))
    title_style = styles.item_title if not sidebar else styles.sidebar_item_title
    body_secondary = styles.body_secondary if not sidebar else styles.sidebar_body
    for r in refs:
        block.append(Paragraph(_e(r.name), title_style))
        sub = " · ".join(p for p in (r.title, r.contact) if p)
        if sub:
            block.append(Paragraph(_e(sub), body_secondary))
    out.append(KeepTogether(block))
    out.append(section_gap(styles))
    return out


def render_websites(data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    links = [l for l in data.sections.websites if (l.label or l.value)]
    if not links:
        return []
    out: list[Flowable] = []
    block: list[Flowable] = []
    block.extend(section_header(label_for("websites", styles), styles, sidebar=sidebar))
    body = styles.sidebar_body if sidebar else styles.body
    for l in links:
        label = l.label or l.value
        href = l.value or l.label
        if href and not href.startswith(("http://", "https://", "mailto:")):
            href = ("mailto:" + href) if "@" in href else ("https://" + href)
        block.append(
            Paragraph(
                f'<a href="{_e(href)}"><font color="#1d4ed8"><u>{_e(label)}</u></font></a>',
                body,
            )
        )
    out.append(KeepTogether(block))
    out.append(section_gap(styles))
    return out
