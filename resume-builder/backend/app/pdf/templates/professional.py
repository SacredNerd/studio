"""Professional template: colored sidebar on the left, main column on the right.

Implemented with a BaseDocTemplate that draws a colored rectangle behind the
sidebar frame on every page. Two Frames per page; Flowables flow left frame
first, then `FrameBreak` to the right frame.
"""

from __future__ import annotations

from typing import IO

from reportlab.lib import colors
from reportlab.platypus import BaseDocTemplate, FrameBreak, Frame, PageTemplate

from app.models.resume import ResumeData
from app.pdf.sections.headerfooter import render_sidebar_identity
from app.pdf.styles import Styles
from app.pdf.templates._columns import split_order
from app.pdf.templates._dispatch import render_section


def render(data: ResumeData, styles: Styles, stream: IO[bytes]) -> None:
    pw, ph = styles.page_size

    left_pct = max(20, min(60, int(data.customization.leftColumnWidth or 35))) / 100.0
    sidebar_w = pw * left_pct
    gutter = 14

    accent = styles.accent
    sidebar_inset = 18  # internal padding

    def on_page(canvas, doc) -> None:
        # Paint the sidebar background on every page.
        canvas.saveState()
        canvas.setFillColor(accent)
        canvas.rect(0, 0, sidebar_w, ph, stroke=0, fill=1)
        canvas.restoreState()
        if getattr(doc, "_show_page_numbers", False):
            canvas.saveState()
            canvas.setFont("Helvetica", 8)
            canvas.setFillGray(0.4)
            canvas.drawCentredString(pw / 2, 18, f"Page {doc.page}")
            canvas.restoreState()

    sidebar_frame = Frame(
        x1=sidebar_inset,
        y1=styles.margin_bottom,
        width=sidebar_w - 2 * sidebar_inset,
        height=ph - styles.margin_top - styles.margin_bottom,
        id="sidebar",
        leftPadding=0,
        bottomPadding=0,
        topPadding=0,
        rightPadding=0,
    )
    main_frame = Frame(
        x1=sidebar_w + gutter,
        y1=styles.margin_bottom,
        width=pw - sidebar_w - gutter - styles.margin_right,
        height=ph - styles.margin_top - styles.margin_bottom,
        id="main",
        leftPadding=0,
        bottomPadding=0,
        topPadding=0,
        rightPadding=0,
    )

    template = PageTemplate(
        id="professional",
        frames=[sidebar_frame, main_frame],
        onPage=on_page,
    )
    doc = BaseDocTemplate(
        stream,
        pagesize=styles.page_size,
        pageTemplates=[template],
        leftMargin=0,
        rightMargin=styles.margin_right,
        topMargin=styles.margin_top,
        bottomMargin=styles.margin_bottom,
        title=data.headerFooter.documentTitle or (data.personalDetails.fullName or "Resume"),
    )
    doc._show_page_numbers = bool(data.headerFooter.showPageNumbers)  # type: ignore[attr-defined]

    story = []
    # SIDEBAR
    if "personalDetails" not in (data.customization.disabledSections or []):
        story.extend(render_sidebar_identity(data, styles))

    left_keys, right_keys = split_order(data)
    for key in left_keys:
        story.extend(render_section(key, data, styles, sidebar=True))

    story.append(FrameBreak())

    # MAIN
    for key in right_keys:
        story.extend(render_section(key, data, styles, sidebar=False))

    if data.headerFooter.footerText:
        from app.pdf.sections.headerfooter import render_footer_text

        story.extend(render_footer_text(data.headerFooter.footerText, styles))

    doc.build(story)
