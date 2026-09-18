"""Smoke test: render the sample resume through the classic template, save to /tmp."""

from __future__ import annotations

import json
from pathlib import Path

from app.models.resume import ResumeData
from app.pdf.renderer import render_resume_pdf


SAMPLE = {
    "headerFooter": {
        "documentTitle": "Ava Thompson",
        "language": "English",
        "showPageNumbers": True,
        "footerText": "Available upon request",
    },
    "personalDetails": {
        "fullName": "Ava Thompson",
        "title": "Senior Product Designer",
        "email": "ava.thompson@email.com",
        "phone": "+1 (555) 213-9087",
        "location": "Austin, Texas, USA",
        "website": "avathompson.design",
        "photo": "",
    },
    "sections": {
        "powerStatement": "Design leader crafting human-centered products.",
        "professionalSummary": "<p>Product designer with <b>7+ years</b> of experience.</p>",
        "websites": [
            {"label": "Portfolio", "value": "avathompson.design"},
            {"label": "LinkedIn", "value": "linkedin.com/in/avathompson"},
        ],
        "skills": [
            {"title": "Product Design", "items": ["Design systems", "Wireframing", "Prototyping"]},
            {"title": "Research", "items": ["Usability testing", "Interviewing"]},
        ],
        "technicalProficiencies": [],
        "education": [
            {
                "institution": "Parsons School of Design",
                "degree": "BFA in Communication Design",
                "location": "New York, NY",
                "startDate": "2012",
                "endDate": "2016",
                "details": "<p>Graduated <b>with honors</b>.</p>",
            }
        ],
        "projects": [
            {
                "name": "Resume Builder UX Concept",
                "description": "<p>Designed a guided resume creation flow.</p>",
                "technologies": "Figma, Prototyping",
                "startDate": "2023-01",
                "endDate": "2023-06",
            }
        ],
        "workHistory": [
            {
                "company": "Northstar Labs",
                "role": "Lead Product Designer",
                "location": "Remote",
                "startDate": "Jan 2022",
                "endDate": "Present",
                "summary": "<p>Led end-to-end design for growth and onboarding.</p>",
                "highlights": [
                    "Redesigned onboarding flow",
                    "Built and scaled the design system",
                ],
            }
        ],
        "achievements": [
            {"title": "Design Impact Award", "description": "Recognized for delivering the highest adoption lift."}
        ],
        "accomplishments": [],
        "internships": [],
        "customSimple": [],
        "customAdvanced": [],
        "professionalTraining": [],
        "additionalExperience": [],
        "volunteering": [],
        "languages": [{"name": "English", "level": "Native"}],
        "hobbies": [{"name": "Illustration"}, {"name": "Cycling"}],
        "references": [],
        "awards": [],
        "certifications": [],
        "affiliations": [],
    },
    "customization": {
        "selectedTemplate": "classic",
        "primaryColor": "#2563eb",
        "primaryFont": "Calibri",
        "secondaryFont": "Arial",
        "lineHeight": 1.3,
        "fontSizes": {"primaryHeading": 28, "secondaryHeading": 18, "body": 11, "sectionTitles": 11},
        "fontWeights": {"primaryHeading": "Bold", "secondaryHeading": "SemiBold", "body": "Regular", "sectionTitles": "Bold"},
        "textStyles": {
            "primaryHeading": {"italic": False, "underline": False},
            "secondaryHeading": {"italic": False, "underline": False},
            "sectionTitles": {"italic": False, "underline": False},
        },
        "format": "US Letter (8.5\" x 11\")",
        "headerFooterSpacing": 0.3,
        "marginVertical": 0.5,
        "marginHorizontal": 0.5,
        "betweenSections": 12,
        "titleContentGap": 6,
        "contentBlockGap": 10,
        "contentInnerPadding": 2,
        "dateFormat": "Short Name (Jan YYYY)",
        "headerAlignment": "left",
        "dateAlignment": "right",
        "locationAlignment": "right",
        "skillsLayout": "columns",
        "skillsColumns": 2,
        "categorizedSkillsLayout": "categories",
        "categoryColumnWidth": 1.3,
        "showEducationBy": "institution",
        "educationLayout": "stacked",
        "showPhoto": False,
        "disabledSections": [],
        "sectionLabels": {},
        "sectionColumnAssignment": {},
        "leftColumnWidth": 43,
        "primaryTextColor": "#1e293b",
        "secondaryTextColor": "#64748b",
        "backgroundColor": "#ffffff",
    },
}


def main() -> None:
    data = ResumeData.model_validate(SAMPLE)
    out = Path("/tmp/smoke_classic.pdf")
    with out.open("wb") as f:
        render_resume_pdf(data, f)
    print(f"wrote {out} ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
