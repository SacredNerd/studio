"""Header (name, title, contact, photo, links) + footer."""

from __future__ import annotations

import base64
import html as _html
import io
import re
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    Flowable,
    HRFlowable,
    Image,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from app.models.resume import PersonalDetails, ResumeData
from app.pdf.styles import Styles


def _e(t: str) -> str:
    return _html.escape(t or "", quote=False)


_ALIGN_MAP = {"left": TA_LEFT, "center": TA_CENTER, "right": TA_RIGHT}


def _photo_flowable(photo: Optional[str], size_px: int) -> Optional[Image]:
    """Render the data: URL or http(s) URL the editor stores.

    Right now we only accept inline data URLs (the editor uses a FileReader →
    base64). Skip silently otherwise.
    """
    if not photo:
        return None
    m = re.match(r"^data:image/[a-zA-Z+\-.]+;base64,(.+)$", photo.strip(), re.DOTALL)
    if not m:
        return None
    try:
        raw = base64.b64decode(m.group(1))
        reader = ImageReader(io.BytesIO(raw))
        return Image(reader, width=size_px, height=size_px)
    except Exception:
        return None


def render_main_header(data: ResumeData, styles: Styles) -> list[Flowable]:
    """The header used by classic / steady-form / specialist."""
    pd: PersonalDetails = data.personalDetails
    align = (styles.customization.headerAlignment or "left").lower()

    name_style = styles.primary_heading
    title_style = styles.secondary_heading

    name = _e(pd.fullName or "Your Name")
    title = _e(pd.title or "")

    # Build name+title block with alignment
    name_p = Paragraph(name, _aligned(name_style, align))
    title_p = Paragraph(title, _aligned(title_style, align)) if title else None

    # Contact list (label + value)
    contact_lines = []
    for value in (pd.location, pd.phone, pd.email, pd.website):
        if value:
            contact_lines.append(_e(value))
    contact_block = []
    contact_style = _aligned(styles.body_secondary, align)
    for line in contact_lines:
        contact_block.append(Paragraph(line, contact_style))

    # Links (websites array)
    link_chips: list[Flowable] = []
    links = [l for l in data.sections.websites if (l.label or l.value)]
    if links:
        link_text = "  ·  ".join(_e(l.label or l.value) for l in links)
        link_chips.append(Paragraph(link_text, _aligned(styles.body_secondary, align)))

    show_photo = (
        styles.customization.showPhoto
        and pd.photo
        and styles.customization.selectedTemplate != "professional"
    )
    photo = _photo_flowable(pd.photo, 64) if show_photo else None

    # Lay out:
    #   centered → photo on top, then name, title, contact stack, links
    #   left/right → photo + name/title on one side, contacts on the other
    if align == "center":
        items: list[Flowable] = []
        if photo:
            items.append(photo)
            items.append(Spacer(1, 6))
        items.append(name_p)
        if title_p is not None:
            items.append(title_p)
        items.extend(contact_block)
        items.extend(link_chips)
        items.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0"),
                                spaceBefore=6, spaceAfter=styles.section_gap))
        # Wrap each in a center-aligned table
        return items

    # left/right two-column header
    left_block = []
    if photo:
        left_block.append(photo)
    left_block.append(name_p)
    if title_p is not None:
        left_block.append(title_p)
    left_block.extend(link_chips)

    right_align = "right" if align == "left" else "left"
    right_block = [
        Paragraph(line, _aligned(styles.body_secondary, right_align))
        for line in contact_lines
    ]

    cols = [left_block, right_block]
    if align == "right":
        cols.reverse()

    t = Table(
        [cols],
        colWidths=[None, None],
        style=TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        ),
    )
    return [
        t,
        HRFlowable(
            width="100%",
            thickness=0.5,
            color=colors.HexColor("#e2e8f0"),
            spaceBefore=6,
            spaceAfter=styles.section_gap,
        ),
    ]


def render_sidebar_identity(data: ResumeData, styles: Styles) -> list[Flowable]:
    """The professional template's sidebar identity block: photo + name + title."""
    pd = data.personalDetails
    out: list[Flowable] = []

    if styles.customization.showPhoto and pd.photo:
        photo = _photo_flowable(pd.photo, 80)
        if photo:
            out.append(photo)
            out.append(Spacer(1, 8))

    name_style = _clone(styles.primary_heading, color=colors.white)
    title_style = _clone(styles.secondary_heading, color=colors.HexColor("#f8fafc"))

    out.append(Paragraph(_e(pd.fullName or "Your Name"), name_style))
    if pd.title:
        out.append(Paragraph(_e(pd.title), title_style))
    out.append(Spacer(1, 10))

    contact_style = _clone(styles.sidebar_body, color=colors.HexColor("#e2e8f0"))
    for value in (pd.location, pd.phone, pd.email, pd.website):
        if value:
            out.append(Paragraph(_e(value), contact_style))
    out.append(Spacer(1, styles.section_gap))
    return out


def render_footer_text(text: str, styles: Styles) -> list[Flowable]:
    if not text:
        return []
    return [
        Spacer(1, 8),
        HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0")),
        Paragraph(
            _e(text),
            _aligned(styles.body_secondary, "center"),
        ),
    ]


def _aligned(base, align: str):
    """Return a clone of `base` with text-alignment set."""
    from reportlab.lib.styles import ParagraphStyle

    return ParagraphStyle(
        base.name + "_" + align,
        parent=base,
        alignment=_ALIGN_MAP.get(align, TA_LEFT),
    )


def _clone(base, *, color=None):
    from reportlab.lib.styles import ParagraphStyle

    kwargs = {}
    if color is not None:
        kwargs["textColor"] = color
    return ParagraphStyle(base.name + "_clone", parent=base, **kwargs)
