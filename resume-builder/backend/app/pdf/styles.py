"""Compute ReportLab styles from a ResumeCustomization.

Translates the camelCase customization knobs into:
  - Page size and margins (inches)
  - Font name resolution (Helvetica/Times/Courier built-ins; the rest fall back)
  - ParagraphStyle bundles for headings, body, bullets, dates, etc.
  - Color objects

This is the *single* place where the customization payload becomes
ReportLab-visible. Section renderers consume the returned Styles object only.
"""

from __future__ import annotations

from dataclasses import dataclass

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch

from app.models.resume import (
    FontWeightOption,
    ResumeCustomization,
)


# ─── Font resolution ─────────────────────────────────────────────────────────
#
# ReportLab ships with three core PostScript families: Helvetica, Times, and
# Courier. This module checks for TTF files in app/pdf/fonts/ and registers
# them with ReportLab so the PDF can use the same fonts as the preview.
# If a font has no registered TTF, it falls back to Helvetica (sans) or
# Times-Roman (serif). Place TTF files named like "Inter-Regular.ttf",
# "Inter-Bold.ttf", etc. in app/pdf/fonts/ to enable them.

from app.pdf.fonts import is_serif, resolve_family


_SANS_FAMILY = "Helvetica"
_SERIF_FAMILY = "Times-Roman"


def _resolve_family(name: str) -> str:
    return resolve_family(name)


def _weight_is_bold(weight: FontWeightOption) -> bool:
    return weight in ("SemiBold", "Bold")


def _font_variant(family: str, bold: bool, italic: bool) -> str:
    """Return a ReportLab built-in font name for (family, bold, italic)."""
    if family == _SERIF_FAMILY:
        if bold and italic:
            return "Times-BoldItalic"
        if bold:
            return "Times-Bold"
        if italic:
            return "Times-Italic"
        return "Times-Roman"
    # Helvetica family
    if bold and italic:
        return "Helvetica-BoldOblique"
    if bold:
        return "Helvetica-Bold"
    if italic:
        return "Helvetica-Oblique"
    return "Helvetica"


def _hex(c: str | None, fallback: str) -> colors.Color:
    if not c:
        return colors.HexColor(fallback)
    try:
        return colors.HexColor(c)
    except Exception:
        return colors.HexColor(fallback)


# ─── Styles bundle ───────────────────────────────────────────────────────────


@dataclass
class Styles:
    """Resolved styling for one render pass."""

    # geometry
    page_size: tuple[float, float]
    margin_top: float
    margin_bottom: float
    margin_left: float
    margin_right: float

    # colors
    accent: colors.Color
    primary_text: colors.Color
    secondary_text: colors.Color
    text: colors.Color
    background: colors.Color

    # raw font metrics
    body_size: int
    section_title_size: int
    primary_heading_size: int
    secondary_heading_size: int
    line_height: float

    # spacing
    section_gap: int
    title_content_gap: int
    content_block_gap: int
    content_inner_padding: int

    # passthrough (used by section renderers for branching)
    customization: ResumeCustomization

    # paragraph styles — pre-built for reuse
    body: ParagraphStyle
    body_secondary: ParagraphStyle
    body_muted: ParagraphStyle
    primary_heading: ParagraphStyle
    secondary_heading: ParagraphStyle
    section_title: ParagraphStyle
    item_title: ParagraphStyle           # role / institution / etc.
    item_subtitle: ParagraphStyle        # company • location, degree, etc.
    date_right: ParagraphStyle
    bullet: ParagraphStyle
    sidebar_section_title: ParagraphStyle
    sidebar_body: ParagraphStyle
    sidebar_item_title: ParagraphStyle


def build_styles(custom: ResumeCustomization) -> Styles:
    body_family = _resolve_family(custom.secondaryFont)
    heading_family = _resolve_family(custom.primaryFont)

    accent = _hex(custom.primaryColor, "#263238")
    primary_text = _hex(custom.primaryTextColor, "#111827")
    secondary_text = _hex(custom.secondaryTextColor, "#475569")
    text = _hex(custom.textColor, "#1f2937")
    background = _hex(custom.backgroundColor, "#ffffff")

    body_size = int(custom.fontSizes.body)
    sec_size = int(custom.fontSizes.sectionTitles)
    prim_size = int(custom.fontSizes.primaryHeading)
    sec_h_size = int(custom.fontSizes.secondaryHeading)
    lh = float(custom.lineHeight or 1.0)
    # Floor a couple of spacing knobs so resumes saved with very tight values
    # still render legible separation (mirrors the frontend preview floors).
    inner_pad = max(int(custom.contentInnerPadding), 3)
    title_gap = max(int(custom.titleContentGap), 6)

    body_font = _font_variant(
        body_family, _weight_is_bold(custom.fontWeights.body), italic=False
    )
    body_bold = _font_variant(body_family, bold=True, italic=False)
    body_italic = _font_variant(body_family, bold=False, italic=True)

    heading_bold = _font_variant(
        heading_family,
        bold=_weight_is_bold(custom.fontWeights.primaryHeading),
        italic=custom.textStyles.primaryHeading.italic,
    )
    sub_bold = _font_variant(
        heading_family,
        bold=_weight_is_bold(custom.fontWeights.secondaryHeading),
        italic=custom.textStyles.secondaryHeading.italic,
    )
    sec_title_font = _font_variant(
        heading_family,
        bold=_weight_is_bold(custom.fontWeights.sectionTitles),
        italic=custom.textStyles.sectionTitles.italic,
    )

    # Page size
    page_size = A4 if custom.format == "A4" else LETTER

    body = ParagraphStyle(
        "body",
        fontName=body_font,
        fontSize=body_size,
        leading=body_size * lh,
        textColor=text,
        spaceAfter=2,
    )
    body_secondary = ParagraphStyle(
        "body_secondary",
        parent=body,
        textColor=secondary_text,
        fontSize=max(body_size - 1, 8),
        leading=max(body_size - 1, 8) * lh,
    )
    # Body-sized text in the secondary color (skill lists, languages, hobbies —
    # which the preview renders in the secondary text color at body size).
    body_muted = ParagraphStyle(
        "body_muted",
        parent=body,
        textColor=secondary_text,
    )
    primary_heading = ParagraphStyle(
        "primary_heading",
        fontName=heading_bold,
        fontSize=prim_size,
        leading=prim_size * 1.1,
        textColor=primary_text,
        spaceAfter=2,
    )
    secondary_heading = ParagraphStyle(
        "secondary_heading",
        fontName=sub_bold,
        fontSize=sec_h_size,
        leading=sec_h_size * 1.1,
        textColor=secondary_text,
        spaceAfter=4,
    )
    section_title = ParagraphStyle(
        "section_title",
        fontName=sec_title_font,
        fontSize=sec_size,
        leading=sec_size * 1.2,
        textColor=accent,
        spaceAfter=title_gap,
    )
    item_title = ParagraphStyle(
        "item_title",
        fontName=body_bold,
        fontSize=body_size,
        leading=body_size * lh,
        textColor=primary_text,
        spaceAfter=inner_pad,
    )
    item_subtitle = ParagraphStyle(
        "item_subtitle",
        fontName=body_font,
        fontSize=max(body_size - 1, 8),
        leading=max(body_size - 1, 8) * lh,
        textColor=secondary_text,
        spaceAfter=inner_pad,
    )
    date_right = ParagraphStyle(
        "date_right",
        fontName=body_italic,
        fontSize=max(body_size - 1, 8),
        leading=max(body_size - 1, 8) * lh,
        textColor=secondary_text,
        alignment=2,  # TA_RIGHT
    )
    bullet = ParagraphStyle(
        "bullet",
        parent=body,
        leftIndent=12,
        bulletIndent=2,
        spaceAfter=1,
    )
    sidebar_section_title = ParagraphStyle(
        "sidebar_section_title",
        fontName=sec_title_font,
        fontSize=sec_size,
        leading=sec_size * 1.2,
        textColor=colors.white,
        spaceAfter=4,
    )
    sidebar_body = ParagraphStyle(
        "sidebar_body",
        fontName=body_font,
        fontSize=body_size,
        leading=body_size * lh,
        textColor=colors.white,
    )
    sidebar_item_title = ParagraphStyle(
        "sidebar_item_title",
        fontName=body_bold,
        fontSize=body_size,
        leading=body_size * lh,
        textColor=colors.white,
    )

    return Styles(
        page_size=page_size,
        margin_top=custom.marginVertical * inch,
        margin_bottom=custom.marginVertical * inch,
        margin_left=custom.marginHorizontal * inch,
        margin_right=custom.marginHorizontal * inch,
        accent=accent,
        primary_text=primary_text,
        secondary_text=secondary_text,
        text=text,
        background=background,
        body_size=body_size,
        section_title_size=sec_size,
        primary_heading_size=prim_size,
        secondary_heading_size=sec_h_size,
        line_height=lh,
        section_gap=int(custom.betweenSections),
        title_content_gap=title_gap,
        content_block_gap=int(custom.contentBlockGap),
        content_inner_padding=inner_pad,
        customization=custom,
        body=body,
        body_secondary=body_secondary,
        body_muted=body_muted,
        primary_heading=primary_heading,
        secondary_heading=secondary_heading,
        section_title=section_title,
        item_title=item_title,
        item_subtitle=item_subtitle,
        date_right=date_right,
        bullet=bullet,
        sidebar_section_title=sidebar_section_title,
        sidebar_body=sidebar_body,
        sidebar_item_title=sidebar_item_title,
    )
