"""Top-level: pick a template and emit the PDF to a stream."""

from __future__ import annotations

from typing import IO

from app.models.resume import ResumeData
from app.pdf.styles import build_styles
from app.pdf.templates import classic


def render_resume_pdf(data: ResumeData, stream: IO[bytes]) -> None:
    """Render `data` into `stream` (an open file-like binary handle)."""
    styles = build_styles(data.customization)
    template = (data.customization.selectedTemplate or "classic").lower()

    if template == "professional":
        from app.pdf.templates import professional
        professional.render(data, styles, stream)
    elif template == "specialist":
        from app.pdf.templates import specialist
        specialist.render(data, styles, stream)
    else:
        # classic, steady-form, and any unknown template fall here.
        classic.render(data, styles, stream)
