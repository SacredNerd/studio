"""Helpers shared by the two-column templates."""

from __future__ import annotations

from app.models.resume import ResumeData
from app.pdf.templates._dispatch import DEFAULT_ORDER


# Mirrors the JS default at frontend/src/App.tsx (`getSectionColumn` default
# in CustomizePanel) and ResumePreview.tsx getSectionColumn():80-93.
_LEFT_DEFAULTS = {
    "skills",
    "technicalProficiencies",
    "languages",
    "hobbies",
    "references",
    "awards",
    "certifications",
    "affiliations",
    "websites",
}


def column_of(key: str, data: ResumeData) -> str:
    """Returns 'left' or 'right' for the given section key under a 2-column template."""
    assignment = data.customization.sectionColumnAssignment.get(key)
    if assignment in ("left", "right"):
        return assignment
    return "left" if key in _LEFT_DEFAULTS else "right"


def split_order(data: ResumeData) -> tuple[list[str], list[str]]:
    order = data.customization.sectionOrder or DEFAULT_ORDER
    order = [k for k in order if k not in ("headerFooter", "personalDetails")]
    left = [k for k in order if column_of(k, data) == "left"]
    right = [k for k in order if column_of(k, data) == "right"]
    return left, right
