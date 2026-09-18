"""Classic single-column template. Also handles `steady-form`."""

from __future__ import annotations

from typing import IO

from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate

from app.models.resume import ResumeData
from app.pdf.sections.headerfooter import render_footer_text, render_main_header
from app.pdf.styles import Styles
from app.pdf.templates._dispatch import render_section, section_order, shown


def _on_page(canvas, doc) -> None:
    # Paint background, then footer page-number text if configured.
    bg = getattr(doc, "_bg_color", None)
    if bg is not None:
        canvas.saveState()
        canvas.setFillColor(bg)
        w, h = doc.pagesize
        canvas.rect(0, 0, w, h, stroke=0, fill=1)
        canvas.restoreState()

    if getattr(doc, "_show_page_numbers", False):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillGray(0.4)
        w, h = doc.pagesize
        canvas.drawCentredString(w / 2, 18, f"Page {doc.page}")
        canvas.restoreState()


def render(data: ResumeData, styles: Styles, stream: IO[bytes]) -> None:
    pw, ph = styles.page_size

    frame = Frame(
        x1=styles.margin_left,
        y1=styles.margin_bottom,
        width=pw - styles.margin_left - styles.margin_right,
        height=ph - styles.margin_top - styles.margin_bottom,
        leftPadding=0,
        bottomPadding=0,
        rightPadding=0,
        topPadding=0,
        id="main",
    )
    template = PageTemplate(id="classic", frames=[frame], onPage=_on_page)
    doc = BaseDocTemplate(
        stream,
        pagesize=styles.page_size,
        pageTemplates=[template],
        leftMargin=styles.margin_left,
        rightMargin=styles.margin_right,
        topMargin=styles.margin_top,
        bottomMargin=styles.margin_bottom,
        title=data.headerFooter.documentTitle or (data.personalDetails.fullName or "Resume"),
    )
    doc._bg_color = styles.background  # type: ignore[attr-defined]
    doc._show_page_numbers = bool(data.headerFooter.showPageNumbers)  # type: ignore[attr-defined]

    story = []
    # Header (unless personalDetails is disabled)
    if "personalDetails" not in (data.customization.disabledSections or []):
        story.extend(render_main_header(data, styles))

    for key in section_order(data):
        story.extend(render_section(key, data, styles))

    if shown(data, "headerFooter") and data.headerFooter.footerText:
        story.extend(render_footer_text(data.headerFooter.footerText, styles))

    doc.build(story)
