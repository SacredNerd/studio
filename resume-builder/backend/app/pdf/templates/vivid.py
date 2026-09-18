"""Vivid template -- single-column layout with bold header banner and pill badges.

The vivid template delegates to the classic single-column render pipeline,
as layout geometry matches classic while visual styling (header, badges, colors)
is controlled via customization settings.
"""

from __future__ import annotations

from typing import IO

from app.models.resume import ResumeData
from app.pdf.styles import Styles
from app.pdf.templates.classic import render as classic_render


def render(data: ResumeData, styles: Styles, stream: IO[bytes]) -> None:
    """Delegate to the single-column renderer."""
    classic_render(data, styles, stream)
