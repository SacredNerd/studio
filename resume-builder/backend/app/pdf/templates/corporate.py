"""Corporate template: centered header on first page, then two-column white layout below.

Page 1: 3 frames — header (full-width at top), sidebar (left), main (right).
Continuation pages: 2 frames — sidebar, main.

The sidebar has a white background (unlike professional's colored sidebar), so
all sections use `sidebar=False` for normal (dark-on-white) text styling.
"""

from __future__ import annotations

from typing import IO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate,
    FrameBreak,
    Frame,
    HRFlowable,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from app.models.resume import ResumeData
from app.pdf.sections.headerfooter import _e, _ensure_url, _photo_flowable, render_footer_text
from app.pdf.styles import Styles
from app.pdf.templates._columns import split_order
from app.pdf.templates._dispatch import render_section, shown


def _hex(c: colors.Color) -> str:
    return "#%02x%02x%02x" % (int(c.red * 255), int(c.green * 255), int(c.blue * 255))


def _section_header(title: str, accent: colors.Color, styles: Styles) -> Table:
    """Section header with left border accent line (3px vertical bar)."""
    title_style = ParagraphStyle(
        "corp_sec_title",
        fontName=styles.section_title.fontName,
        fontSize=styles.section_title.fontSize,
        leading=styles.section_title.leading,
        textColor=accent,
    )
    p = Paragraph(_e(title), title_style)
    return Table(
        [[p]],
        colWidths=[None],
        style=TableStyle([
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LINEBEFORE", (0, 0), (0, -1), 3, accent),
        ]),
    )


def _detail_block(data: ResumeData, styles: Styles) -> list:
    """Sidebar DETAILS section with contact info."""
    pd = data.personalDetails
    items: list = []
    accent = styles.accent
    h = _hex(accent)
    ts = ParagraphStyle("corp_dt", parent=styles.body_secondary, textColor=styles.secondary_text)
    items.append(_section_header("DETAILS", accent, styles))
    for value in (pd.location, pd.phone):
        if value:
            items.append(Paragraph(_e(value), ts))
            items.append(Spacer(1, 2))
    for value in (pd.email, pd.website):
        if value:
            items.append(Paragraph(
                f'<a href="{_ensure_url(value)}"><font color="{h}"><u>{_e(value)}</u></font></a>',
                ts,
            ))
            items.append(Spacer(1, 2))
    items.append(Spacer(1, styles.section_gap))
    return items


def _links_block(data: ResumeData, styles: Styles) -> list:
    """Sidebar LINKS section with website/social links."""
    links = [l for l in data.sections.websites if (l.label or l.value)]
    if not links:
        return []
    accent = styles.accent
    h = _hex(accent)
    items: list = []
    items.append(_section_header("LINKS", accent, styles))
    for l in links:
        url = l.value or l.label
        label = l.label or l.value
        items.append(Paragraph(
            f'<a href="{_ensure_url(url)}"><font color="{h}"><u>{_e(label)}</u></font></a>',
            ParagraphStyle("corp_lk", parent=styles.body_secondary, textColor=accent),
        ))
        items.append(Spacer(1, 2))
    items.append(Spacer(1, styles.section_gap))
    return items


def render(data: ResumeData, styles: Styles, stream: IO[bytes]) -> None:
    pw, ph = styles.page_size
    mt = styles.margin_top
    mb = styles.margin_bottom
    ml = styles.margin_left
    mr = styles.margin_right

    body_h = ph - mt - mb                      # total usable height

    # Column widths — mirror the Specialist approach
    left_pct = max(20, min(60, int(data.customization.leftColumnWidth or 28))) / 100.0
    gutter = 16
    avail_w = pw - ml - mr
    left_w = (avail_w - gutter) * left_pct
    right_w = (avail_w - gutter) - left_w

    # ── Build the centered header flowables up front, then measure their real
    # height so the header frame is exactly as tall as its content. This avoids
    # a large empty gap between the header and the columns (mirrors the preview,
    # where the header flows naturally above the two columns).
    pd = data.personalDetails
    show_photo = bool(styles.customization.showPhoto and pd.photo)
    contact_parts = [p for p in (pd.title, pd.location, pd.phone) if p]

    header_flowables: list = []
    if show_photo:
        photo = _photo_flowable(pd.photo, 72)
        if photo is not None:
            photo.hAlign = "CENTER"
            header_flowables.append(photo)
            header_flowables.append(Spacer(1, 8))
    header_flowables.append(Paragraph(
        _e(pd.fullName or "Your Name"),
        ParagraphStyle("corp_name", parent=styles.primary_heading, alignment=TA_CENTER),
    ))
    if contact_parts:
        header_flowables.append(Paragraph(
            " | ".join(_e(p) for p in contact_parts),
            ParagraphStyle(
                "corp_contact",
                parent=styles.secondary_heading,
                textColor=styles.secondary_text,
                fontSize=max(styles.body_size + 1, 11),
                alignment=TA_CENTER,
            ),
        ))
    header_flowables.append(HRFlowable(
        width="100%", thickness=1.5, color=styles.accent,
        spaceBefore=4, spaceAfter=styles.section_gap,
    ))

    def _measure(flowables: list, width: float) -> float:
        total = 0.0
        for f in flowables:
            try:
                total += f.getSpaceBefore()
                _w, h = f.wrap(width, body_h)
                total += h
                total += f.getSpaceAfter()
            except Exception:
                total += 14.0
        return total

    header_h = _measure(header_flowables, avail_w) + 4
    header_h = min(header_h, body_h * 0.5)     # never eat more than half the page
    col_h = body_h - header_h                  # remaining height for columns

    # ── Frames – first page (3 frames) ──────────────────────────────────
    header_frame = Frame(
        x1=ml,
        y1=ph - mt - header_h,
        width=avail_w,
        height=header_h,
        id="header",
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
    )
    sidebar_first = Frame(
        x1=ml,
        y1=mb,
        width=left_w,
        height=col_h,
        id="sidebar_first",
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
    )
    main_first = Frame(
        x1=ml + left_w + gutter,
        y1=mb,
        width=right_w,
        height=col_h,
        id="main_first",
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
    )

    # ── Frames – continuation pages (2 frames) ──────────────────────────
    sidebar_cont = Frame(
        x1=ml,
        y1=mb,
        width=left_w,
        height=body_h,
        id="sidebar",
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
    )
    main_cont = Frame(
        x1=ml + left_w + gutter,
        y1=mb,
        width=right_w,
        height=body_h,
        id="main",
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
    )

    # ── Page templates ─────────────────────────────────────────────────
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
        id="corp_first",
        frames=[header_frame, sidebar_first, main_first],
        onPage=on_page,
    )
    pt_cont = PageTemplate(
        id="corp_cont",
        frames=[sidebar_cont, main_cont],
        onPage=on_page,
    )

    doc = BaseDocTemplate(
        stream,
        pagesize=styles.page_size,
        pageTemplates=[pt_first, pt_cont],
        leftMargin=0,
        rightMargin=mr,
        topMargin=mt,
        bottomMargin=mb,
        title=data.headerFooter.documentTitle or (data.personalDetails.fullName or "Resume"),
    )
    setattr(doc, "_bg_color", styles.background)
    setattr(doc, "_show_page_numbers", bool(data.headerFooter.showPageNumbers))

    # ── Build story ─────────────────────────────────────────────────────
    story: list = []

    # ── Header frame (flowables were built + measured above) ────────────
    story.extend(header_flowables)
    story.append(FrameBreak())

    # ── Sidebar frame ───────────────────────────────────────────────────
    if shown(data, "personalDetails"):
        story.extend(_detail_block(data, styles))
    if shown(data, "websites"):
        story.extend(_links_block(data, styles))

    left_keys, right_keys = split_order(data)
    for key in left_keys:
        story.extend(render_section(key, data, styles, sidebar=False))
    story.append(FrameBreak())

    # ── Main frame ──────────────────────────────────────────────────────
    for key in right_keys:
        story.extend(render_section(key, data, styles, sidebar=False))

    if shown(data, "headerFooter") and data.headerFooter.footerText:
        story.extend(render_footer_text(data.headerFooter.footerText, styles))

    doc.build(story)
