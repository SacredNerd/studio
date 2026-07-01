"""Section dispatch shared by all templates."""

from __future__ import annotations

from typing import Callable

from reportlab.platypus import Flowable

from app.models.resume import ResumeData
from app.pdf.sections import (
    compact,
    dated_blocks,
    education,
    projects,
    simple_blocks,
    skills,
    summary,
    work,
)
from app.pdf.styles import Styles


# Default section order — mirrors `DEFAULT_ORDER` at
# frontend/src/components/ResumePreview.tsx:990-1014. `headerFooter` and
# `personalDetails` are filtered out by the templates themselves.
DEFAULT_ORDER: list[str] = [
    "powerStatement",
    "professionalSummary",
    "websites",
    "skills",
    "education",
    "projects",
    "workHistory",
    "achievements",
    "accomplishments",
    "internships",
    "customSimple",
    "customAdvanced",
    "professionalTraining",
    "additionalExperience",
    "volunteering",
    "languages",
    "hobbies",
    "references",
    "awards",
    "certifications",
    "affiliations",
    "technicalProficiencies",
]


def _render_for_key(
    key: str,
    data: ResumeData,
    styles: Styles,
    *,
    sidebar: bool,
) -> list[Flowable]:
    fn: Callable | None = _DISPATCH.get(key)
    if fn is None:
        return []
    if key in ("powerStatement", "professionalSummary"):
        return summary.render(key, data, styles, sidebar=sidebar)
    return fn(data, styles, sidebar=sidebar)


_DISPATCH: dict[str, Callable] = {
    "powerStatement": summary.render,  # called with extra key arg above
    "professionalSummary": summary.render,
    "workHistory": work.render,
    "education": education.render,
    "projects": projects.render,
    "skills": skills.render_skills,
    "technicalProficiencies": skills.render_technical,
    "languages": compact.render_languages,
    "hobbies": compact.render_hobbies,
    "references": compact.render_references,
    "websites": compact.render_websites,
    "achievements": simple_blocks.render_achievements,
    "accomplishments": simple_blocks.render_accomplishments,
    "customSimple": simple_blocks.render_custom_simple,
    "internships": dated_blocks.render_internships,
    "professionalTraining": dated_blocks.render_training,
    "additionalExperience": dated_blocks.render_additional,
    "volunteering": dated_blocks.render_volunteering,
    "affiliations": dated_blocks.render_affiliations,
    "awards": dated_blocks.render_awards,
    "certifications": dated_blocks.render_certifications,
    "customAdvanced": dated_blocks.render_custom_advanced,
}


def section_order(data: ResumeData) -> list[str]:
    order = data.customization.sectionOrder or DEFAULT_ORDER
    return [k for k in order if k not in ("headerFooter", "personalDetails")]


def shown(data: ResumeData, key: str) -> bool:
    return key not in (data.customization.disabledSections or [])


def render_section(key: str, data: ResumeData, styles: Styles, *, sidebar: bool = False) -> list[Flowable]:
    if not shown(data, key):
        return []
    return _render_for_key(key, data, styles, sidebar=sidebar)
