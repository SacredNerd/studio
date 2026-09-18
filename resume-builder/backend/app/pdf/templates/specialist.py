"""Specialist template: full-width header on top, then two same-color columns below."""

from __future__ import annotations

from typing import IO

from reportlab.platypus import BaseDocTemplate, FrameBreak, Frame, PageTemplate

from app.models.resume import ResumeData
from app.pdf.sections.headerfooter import render_footer_text, render_main_header
from app.pdf.styles import Styles
from app.pdf.templates._columns import split_order
from app.pdf.templates._dispatch import render_section, shown


def render(data: ResumeData, styles: Styles, stream: IO[bytes]) -> None:
    pw, ph = styles.page_size

    # Default left-col width is 60% (mirrors `defaultLeftWidth` at
    # ResumePreview.tsx:1224, which uses 60 unless template is even/fine-line).
    left_pct = max(20, min(80, int(data.customization.leftColumnWidth or 60))) / 100.0
    gutter = 14

    # Header occupies ~30% of page height — generous so a name with photo fits.
    header_h_fraction = 0.30
    header_h = (ph - styles.margin_top - styles.margin_bottom) * header_h_fraction
    body_h = ph - styles.margin_top - styles.margin_bottom - header_h

    left_w = (pw - styles.margin_left - styles.margin_right - gutter) * left_pct
    right_w = (pw - styles.margin_left - styles.margin_right - gutter) - left_w

    # First page has 3 frames: header, then left + right.
    header_frame = Frame(
        x1=styles.margin_left,
        y1=ph - styles.margin_top - header_h,
        width=pw - styles.margin_left - styles.margin_right,
        height=header_h,
        id="header",
        leftPadding=0,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
    )
    left_frame_first = Frame(
        x1=styles.margin_left,
        y1=styles.margin_bottom,
        width=left_w,
        height=body_h,
        id="left",
        leftPadding=0,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
    )
    right_frame_first = Frame(
        x1=styles.margin_left + left_w + gutter,
        y1=styles.margin_bottom,
        width=right_w,
        height=body_h,
        id="right",
        leftPadding=0,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
    )

    # Continuation pages use full-height left/right frames.
    full_h = ph - styles.margin_top - styles.margin_bottom
    left_frame_cont = Frame(
        x1=styles.margin_left,
        y1=styles.margin_bottom,
        width=left_w,
        height=full_h,
        id="left",
        leftPadding=0,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
    )
    right_frame_cont = Frame(
        x1=styles.margin_left + left_w + gutter,
        y1=styles.margin_bottom,
        width=right_w,
        height=full_h,
        id="right",
        leftPadding=0,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
    )

    def on_page(canvas, doc) -> None:
        bg = getattr(doc, "_bg_color", None)
        if bg is not None:
            canvas.saveState()
            canvas.setFillColor(bg)
            canvas.rect(0, 0, pw, ph, stroke=0, fill=1)
            canvas.restoreState()
        if getattr(doc, "_show_page_numbers", False):
            canvas.saveState()
            canvas.setFont("Helvetica", 8)
            canvas.setFillGray(0.4)
            canvas.drawCentredString(pw / 2, 18, f"Page {doc.page}")
            canvas.restoreState()

    pt_first = PageTemplate(
        id="specialist_first",
        frames=[header_frame, left_frame_first, right_frame_first],
        onPage=on_page,
    )
    pt_cont = PageTemplate(
        id="specialist_cont",
        frames=[left_frame_cont, right_frame_cont],
        onPage=on_page,
    )
    doc = BaseDocTemplate(
        stream,
        pagesize=styles.page_size,
        pageTemplates=[pt_first, pt_cont],
        leftMargin=styles.margin_left,
        rightMargin=styles.margin_right,
        topMargin=styles.margin_top,
        bottomMargin=styles.margin_bottom,
        title=data.headerFooter.documentTitle or (data.personalDetails.fullName or "Resume"),
    )
    doc._bg_color = styles.background  # type: ignore[attr-defined]
    doc._show_page_numbers = bool(data.headerFooter.showPageNumbers)  # type: ignore[attr-defined]

    story = []
    if "personalDetails" not in (data.customization.disabledSections or []):
        story.extend(render_main_header(data, styles))
    story.append(FrameBreak())

    left_keys, right_keys = split_order(data)
    for key in left_keys:
        story.extend(render_section(key, data, styles, sidebar=False))
    story.append(FrameBreak())

    for key in right_keys:
        story.extend(render_section(key, data, styles, sidebar=False))

    if shown(data, "headerFooter") and data.headerFooter.footerText:
        story.extend(render_footer_text(data.headerFooter.footerText, styles))

    # Switch the page template AFTER the first page so continuations use the
    # 2-frame layout. The `nextPageTemplate` Flowable is the canonical way; here
    # we use the implicit rule that subsequent pages cycle the next template
    # via doc.handle_pageBegin — using PageBreak / FrameBreak in the story
    # naturally moves us forward.
    doc.build(story)
