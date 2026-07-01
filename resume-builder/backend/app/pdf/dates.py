"""Date formatting per ResumeCustomization.dateFormat.

Mirrors `formatDate` in frontend/src/components/ResumePreview.tsx:25-48.
"""

from __future__ import annotations

import re
from datetime import datetime


_MONTHS_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]


def format_date(raw: str, date_format: str) -> str:
    if not raw:
        return ""

    lower = raw.strip().lower()
    if lower == "present":
        return "Present"

    if date_format == "Year only":
        m = re.search(r"(\d{4})", raw)
        return m.group(1) if m else raw

    # Try to parse a real date; we need year + month for the other formats.
    if len(raw) <= 4:
        return raw  # year-only input

    parsed = _try_parse(raw)
    if parsed is None:
        return raw

    if date_format == "Numeric (MM.YYYY)":
        return f"{parsed.month:02d}.{parsed.year}"

    # Default: Short Name (Jan YYYY)
    return f"{_MONTHS_SHORT[parsed.month - 1]} {parsed.year}"


def _try_parse(raw: str) -> datetime | None:
    for fmt in (
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%m/%d/%Y",
        "%b %Y",
        "%B %Y",
        "%Y-%m",
        "%m.%Y",
    ):
        try:
            return datetime.strptime(raw.strip(), fmt)
        except ValueError:
            continue
    # Last-resort: pluck year+month tokens
    m = re.match(r"^\s*([A-Za-z]+)\s+(\d{4})\s*$", raw)
    if m:
        try:
            return datetime.strptime(f"{m.group(1)[:3]} {m.group(2)}", "%b %Y")
        except ValueError:
            return None
    return None


def date_range(start: str, end: str, date_format: str) -> str:
    parts = [format_date(start, date_format), format_date(end, date_format)]
    parts = [p for p in parts if p]
    return " – ".join(parts)
