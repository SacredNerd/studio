"""Render the sample resume through all four templates as a smoke test."""

from __future__ import annotations

from pathlib import Path

from app.models.resume import ResumeData
from app.pdf.renderer import render_resume_pdf

from tests.smoke_classic import SAMPLE


def main() -> None:
    for template in ("classic", "steady-form", "professional", "specialist"):
        sample = dict(SAMPLE)
        sample["customization"] = {**SAMPLE["customization"], "selectedTemplate": template}
        data = ResumeData.model_validate(sample)
        out = Path(f"/tmp/smoke_{template.replace('-', '_')}.pdf")
        with out.open("wb") as f:
            render_resume_pdf(data, f)
        print(f"{template}: {out} ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
