"""Funky template featuring icons and terracotta colors."""

from __future__ import annotations
from typing import IO

from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from app.models.resume import ResumeData, PersonalDetails
from app.pdf.sections.headerfooter import render_footer_text, _e, _ensure_url, _photo_flowable
from app.pdf.styles import Styles
from app.pdf.templates._dispatch import render_section, section_order, shown
from app.pdf.icons import create_icon


def _on_page(canvas, doc) -> None:
    # 1. Base bg color
    canvas.saveState()
    w, h = doc.pagesize
    from reportlab.lib.colors import HexColor
    canvas.setFillColor(HexColor("#fdfdfc"))
    canvas.rect(0, 0, w, h, stroke=0, fill=1)
    
    # 2. Draw thick left line
    accent = getattr(doc, "_accent_color", HexColor("#c05a45"))
    canvas.setFillColor(accent)
    # The line is 16px wide on the left edge
    canvas.rect(0, 0, 16, h, stroke=0, fill=1)
    
    canvas.restoreState()

    if getattr(doc, "_show_page_numbers", False):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillGray(0.4)
        w, h = doc.pagesize
        canvas.drawCentredString(w / 2, 18, f"Page {doc.page}")
        canvas.restoreState()


def render_funky_header(data: ResumeData, styles: Styles) -> list:
    pd: PersonalDetails = data.personalDetails
    accent = styles.accent

    # Name and title
    name = _e(pd.fullName or "Your Name")
    from reportlab.lib.styles import ParagraphStyle
    
    align = (styles.customization.headerAlignment or "left").lower()
    align_enum = TA_LEFT
    if align == "center":
        align_enum = TA_CENTER
    elif align == "right":
        align_enum = TA_RIGHT

    name_style = ParagraphStyle(
        "funky_header_name",
        fontName=styles.primary_heading.fontName,
        fontSize=max(styles.primary_heading_size + 14, 42),
        leading=max(styles.primary_heading_size + 16, 46),
        textColor=colors.HexColor("#222222"),
        alignment=align_enum,
    )
    
    title_style = ParagraphStyle(
        "funky_header_title",
        fontName=styles.primary_heading.fontName,
        fontSize=max(styles.body.fontSize + 6, 18),
        leading=max(styles.body.fontSize + 8, 22),
        textColor=accent,
        alignment=align_enum,
    )

    out = []
    
    out.append(Paragraph(f"<b>{name.upper()}</b>", name_style))
    if pd.title:
        out.append(Spacer(1, 6))
        out.append(Paragraph(f"<b>{_e(pd.title).upper()}</b>", title_style))
        
    out.append(Spacer(1, 12))

    # Contact details inline with icons
    contact_parts = []
    
    def add_contact(icon_name, val, link=None):
        if val:
            drawing = create_icon(icon_name, accent, size=10)
            txt = _e(val)
            if link:
                txt = f'<a href="{_e(link)}"><font color="#1a1a1a">{txt}</font></a>'
            contact_parts.append([drawing, Paragraph(txt, ParagraphStyle("funky_contact", parent=styles.body, textColor=colors.HexColor("#1a1a1a")))])

    add_contact("mail", pd.email, f"mailto:{pd.email}" if pd.email else None)
    add_contact("phone", pd.phone)
    add_contact("mappin", pd.location)
    add_contact("mail", pd.website, _ensure_url(pd.website) if pd.website else None)

    if contact_parts:
        # Lay out contact parts horizontally with | separators
        # Interleave with | separator
        interleaved = []
        sep = Paragraph('<font color="#aaaaaa">|</font>', ParagraphStyle("funky_contact", parent=styles.body))
        for i, pair in enumerate(contact_parts):
            sub_t = Table([pair], colWidths=[14, None], style=TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ]))
            interleaved.append(sub_t)
            if i < len(contact_parts) - 1:
                interleaved.append(sep)
            
        if interleaved:
            contact_table = Table([interleaved], style=TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]), hAlign=align.upper())
            out.append(contact_table)

    out.append(Spacer(1, 16))
    out.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#f0f0f0")))
    out.append(Spacer(1, styles.section_gap))
    
    return out


def render(data: ResumeData, styles: Styles, stream: IO[bytes]) -> None:
    pw, ph = styles.page_size

    left_bar_width = 16
    actual_left_margin = max(styles.margin_left, 48) + left_bar_width

    frame = Frame(
        x1=actual_left_margin,
        y1=styles.margin_bottom,
        width=pw - actual_left_margin - styles.margin_right,
        height=ph - styles.margin_top - styles.margin_bottom,
        leftPadding=0,
        bottomPadding=0,
        rightPadding=0,
        topPadding=0,
        id="main",
    )
    template = PageTemplate(id="funky", frames=[frame], onPage=_on_page)
    doc = BaseDocTemplate(
        stream,
        pagesize=styles.page_size,
        pageTemplates=[template],
        leftMargin=actual_left_margin,
        rightMargin=styles.margin_right,
        topMargin=styles.margin_top,
        bottomMargin=styles.margin_bottom,
        title=data.headerFooter.documentTitle or (data.personalDetails.fullName or "Resume"),
    )
    doc._accent_color = styles.accent  # type: ignore[attr-defined]
    doc._show_page_numbers = bool(data.headerFooter.showPageNumbers)  # type: ignore[attr-defined]

    story = []
    # Header (unless personalDetails is disabled)
    if "personalDetails" not in (data.customization.disabledSections or []):
        story.extend(render_funky_header(data, styles))

    for key in section_order(data):
        story.extend(render_section(key, data, styles))

    if shown(data, "headerFooter") and data.headerFooter.footerText:
        story.extend(render_footer_text(data.headerFooter.footerText, styles))

    doc.build(story)
