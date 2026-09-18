"""TTF font registration for ReportLab.

Scans `app/pdf/fonts/` for TTF files and registers each family with ReportLab
so that the PDF can use the same fonts as the preview. Falls back to built-in
Helvetica/Times for any font that has no registered TTF.
"""

from __future__ import annotations

import os
import re

from reportlab.lib import fonts as rl_fonts
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

_FONTS_DIR = os.path.join(os.path.dirname(__file__), "fonts")

# TTF naming patterns: "FamilyName-Regular.ttf", "FamilyName-Bold.ttf", etc.
_VARIANT_PATTERN = re.compile(
    r"^(.+?)(?:-(Regular|Bold|Italic|BoldItalic|Medium|SemiBold))?\.ttf$",
    re.IGNORECASE,
)

_WEIGHT_MAP: dict[str, str] = {
    "regular": "Regular",
    "medium": "Regular",
    "semibold": "Bold",
    "bold": "Bold",
    "bolditalic": "BoldItalic",
    "italic": "Italic",
}


def register_ttf_fonts() -> dict[str, str]:
    """Scan fonts/ directory, register TTF files, return {font_name: base_family}.

    Returns a map of editor font name → ReportLab family key. For example:
        {"Inter": "Inter", "Poppins": "Poppins", "Arial": "Helvetica", ...}

    The returned map is used by `resolve_font()` to pick the correct family.
    Only fonts that were successfully registered will appear in the map.
    """
    if not os.path.isdir(_FONTS_DIR):
        return {}

    registered: dict[str, str] = {}

    for filename in sorted(os.listdir(_FONTS_DIR)):
        if not filename.lower().endswith(".ttf"):
            continue
        m = _VARIANT_PATTERN.match(filename)
        if not m:
            continue
        family_name = m.group(1)
        variant_raw = (m.group(2) or "Regular").lower()
        variant = _WEIGHT_MAP.get(variant_raw, "Regular")

        full_path = os.path.join(_FONTS_DIR, filename)
        try:
            face = TTFont(filename, full_path)
            pdfmetrics.registerFont(face)
            rl_fonts.addMapping(face.familyName, 0, 0, face.fontName)  # regular
            rl_fonts.addMapping(face.familyName, 1, 0, face.fontName)  # bold
            rl_fonts.addMapping(face.familyName, 0, 1, face.fontName)  # italic
            rl_fonts.addMapping(face.familyName, 1, 1, face.fontName)  # bold italic
            registered[family_name] = face.familyName
        except Exception:
            continue  # skip unreadable files

    return registered


_REGISTERED_FONTS: dict[str, str] = register_ttf_fonts()


def resolve_family(editor_font_name: str) -> str:
    """Map an editor font name to a ReportLab base family name.

    If a TTF file for this font was registered, use it directly.
    Otherwise fall back to the built-in Helvetica/Times aliases.
    """
    # Direct match from registered TTF
    if editor_font_name in _REGISTERED_FONTS:
        return _REGISTERED_FONTS[editor_font_name]

    # Fallback aliases
    serif_families = {"Georgia", "Times", "Times New Roman"}
    if editor_font_name in serif_families:
        return "Times-Roman"
    return "Helvetica"


def is_serif(editor_font_name: str) -> bool:
    """Return True if the editor font is a serif face."""
    return resolve_family(editor_font_name) == "Times-Roman"
