"""Shared helpers used by section renderers."""

from __future__ import annotations

from reportlab.lib import colors
from reportlab.platypus import (
    Flowable,
    HRFlowable,
    KeepTogether,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from app.pdf.richtext import has_content, html_to_flowables
from app.pdf.styles import Styles


# Default section labels — mirror `getSectionLabel` defaults at
# frontend/src/components/ResumePreview.tsx:466-491.
DEFAULT_LABELS: dict[str, str] = {
    "headerFooter": "Header & Footer",
    "personalDetails": "Personal Details",
    "powerStatement": "Power Statement",
    "professionalSummary": "Profile",
    "websites": "Websites & Social Links",
    "skills": "Skills & Proficiencies",
    "technicalProficiencies": "Technical Proficiencies",
    "education": "Education",
    "projects": "Projects",
    "workHistory": "Work History",
    "achievements": "Achievements",
    "accomplishments": "Accomplishments",
    "internships": "Internships",
    "customSimple": "Custom Section",
    "customAdvanced": "Additional Details",
    "professionalTraining": "Professional Training",
    "additionalExperience": "Additional Experience",
    "volunteering": "Volunteering",
    "languages": "Languages",
    "hobbies": "Hobbies",
    "references": "References",
    "awards": "Awards",
    "certifications": "Licenses & Certifications",
    "affiliations": "Affiliations",
}


def label_for(key: str, styles: Styles) -> str:
    custom = styles.customization.sectionLabels.get(key)
    if custom:
        return custom
    return DEFAULT_LABELS.get(key, key)


def section_header(label: str, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    """Emit a section title + rule line. Honors `steady-form` (no rule, gray bg)."""
    template = styles.customization.selectedTemplate
    text = label.upper()
    style = styles.sidebar_section_title if sidebar else styles.section_title

    if template == "steady-form" and not sidebar:
        # Light gray banner, no rule
        return [
            Table(
                [[Paragraph(text, style)]],
                colWidths=[None],
                style=TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ]),
            ),
            Spacer(1, styles.title_content_gap),
        ]

    rule_color = colors.white if sidebar else styles.accent
    return [
        Paragraph(text, style),
        HRFlowable(
            width="100%",
            thickness=1,
            color=rule_color,
            spaceBefore=1,
            spaceAfter=styles.title_content_gap,
        ),
    ]


def two_column_row(
    left: list[Flowable] | Paragraph | str,
    right: list[Flowable] | Paragraph | str,
    styles: Styles,
    *,
    col_widths: tuple[float, float] | None = None,
) -> Table:
    """Title-row helper: a flexible left block and a right-aligned date/meta block."""

    def cell(content) -> list[Flowable] | Flowable:
        if isinstance(content, str):
            return Paragraph(content, styles.body)
        return content

    table = Table(
        [[cell(left), cell(right)]],
        colWidths=col_widths or [None, None],
        style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]),
    )
    return table


def block_gap(styles: Styles) -> Spacer:
    return Spacer(1, styles.content_block_gap)


def section_gap(styles: Styles) -> Spacer:
    return Spacer(1, styles.section_gap)


def rich(html: str, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    if not has_content(html):
        return []
    body = styles.sidebar_body if sidebar else styles.body
    return html_to_flowables(html, body, styles.bullet)


def keep(items: list[Flowable]) -> Flowable:
    return KeepTogether(items)
