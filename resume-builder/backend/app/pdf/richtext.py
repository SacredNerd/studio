"""HTML rich-text → ReportLab inline markup.

The editor (`frontend/src/components/RichTextEditor.tsx`) emits HTML for fields
like professionalSummary, powerStatement, work.summary, education.details,
project.description, etc. ReportLab's `Paragraph` parser understands a small
inline subset; this module translates the editor's HTML into that subset and
splits block-level constructs (paragraphs, lists) into a sequence of Flowables.

Public API:
    `html_to_flowables(html, body_style, bullet_style)`
        Returns `list[Flowable]` (Paragraphs and small spacers).
    `html_to_inline(html)`
        Returns a single normalized inline-HTML string suitable for one
        Paragraph. Block tags are flattened to <br/>; lists are rendered with
        a bullet character so the caller doesn't have to manage list flowables.
"""

from __future__ import annotations

import html as _html
from typing import Iterable

from bs4 import BeautifulSoup, NavigableString, Tag
from reportlab.platypus import Flowable, Paragraph, Spacer


# Tags ReportLab's mini-language accepts directly inside a Paragraph.
_INLINE_TAGS_PRESERVED = {"b", "strong", "i", "em", "u", "sub", "sup", "br", "a", "font"}
# Block tags we split on.
_BLOCK_TAGS = {"p", "div", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "br"}


def _escape(text: str) -> str:
    """ReportLab inline markup uses '<' and '&'. Escape them in raw text."""
    return _html.escape(text, quote=False)


def _emit_inline(node) -> str:
    """Render a BS4 node and its descendants as a ReportLab inline string."""
    if isinstance(node, NavigableString):
        return _escape(str(node))
    if not isinstance(node, Tag):
        return ""

    name = node.name.lower()

    # Normalize aliases
    if name == "strong":
        name = "b"
    elif name == "em":
        name = "i"

    # Inline tags that ReportLab understands
    if name in {"b", "i", "u", "sub", "sup"}:
        inner = "".join(_emit_inline(c) for c in node.children)
        return f"<{name}>{inner}</{name}>"

    if name == "br":
        return "<br/>"

    if name == "a":
        href = node.get("href", "").strip()
        inner = "".join(_emit_inline(c) for c in node.children)
        if href:
            return f'<a href="{_escape(href)}"><font color="#1d4ed8"><u>{inner}</u></font></a>'
        return inner

    if name == "font":
        attrs = []
        if node.get("color"):
            attrs.append(f'color="{_escape(node["color"])}"')
        inner = "".join(_emit_inline(c) for c in node.children)
        if attrs:
            return f"<font {' '.join(attrs)}>{inner}</font>"
        return inner

    # Unknown tag: drop tag, keep contents
    return "".join(_emit_inline(c) for c in node.children)


def _is_blocky(html: str) -> bool:
    return any(f"<{t}" in html.lower() for t in _BLOCK_TAGS)


def html_to_flowables(
    html: str,
    body_style,
    bullet_style,
) -> list[Flowable]:
    """Translate an HTML rich-text string into a list of Flowables.

    Splits on block boundaries:
      <p> / <div>      → one Paragraph per block
      <ul>/<ol> + <li> → one Paragraph per <li> with bulletText
      <br>             → newline within current paragraph
      anything else    → inline (b/i/u/a/...)
    Plain-text input (no tags) returns a single Paragraph.
    """
    if html is None:
        return []
    text = html.strip()
    if not text:
        return []

    if not _is_blocky(text):
        # Pure inline content
        inline = _emit_inline(BeautifulSoup(text, "html.parser"))
        if not inline.strip():
            return []
        return [Paragraph(inline, body_style)]

    soup = BeautifulSoup(text, "html.parser")
    flow: list[Flowable] = []

    def emit_block(content: str, style, *, bullet: str | None = None):
        content = content.strip()
        if not content:
            return
        if bullet:
            flow.append(Paragraph(content, style, bulletText=bullet))
        else:
            flow.append(Paragraph(content, style))

    for el in soup.children:
        if isinstance(el, NavigableString):
            # Stray text at the top level
            inline = _emit_inline(el)
            emit_block(inline, body_style)
            continue
        if not isinstance(el, Tag):
            continue
        name = el.name.lower()

        if name in {"p", "div", "h1", "h2", "h3", "h4", "h5", "h6"}:
            inline = "".join(_emit_inline(c) for c in el.children)
            emit_block(inline, body_style)
        elif name == "ul":
            for li in el.find_all("li", recursive=False):
                inline = "".join(_emit_inline(c) for c in li.children)
                emit_block(inline, bullet_style, bullet="•")
        elif name == "ol":
            for i, li in enumerate(el.find_all("li", recursive=False), start=1):
                inline = "".join(_emit_inline(c) for c in li.children)
                emit_block(inline, bullet_style, bullet=f"{i}.")
        elif name == "br":
            # Treat top-level <br> as a small spacer
            flow.append(Spacer(1, 2))
        else:
            # Top-level inline element — wrap into a body paragraph
            inline = _emit_inline(el)
            emit_block(inline, body_style)

    return flow


def html_to_inline(html: str) -> str:
    """Flatten an HTML rich-text string to a single inline ReportLab markup string.

    Lists are rendered with leading bullets joined by <br/>. Suitable when the
    caller wants ONE Paragraph rather than a sequence.
    """
    if not html:
        return ""
    soup = BeautifulSoup(html, "html.parser")
    parts: list[str] = []

    def walk(node) -> None:
        if isinstance(node, NavigableString):
            parts.append(_escape(str(node)))
            return
        if not isinstance(node, Tag):
            return
        name = node.name.lower()
        if name in {"p", "div"}:
            for c in node.children:
                walk(c)
            parts.append("<br/>")
        elif name == "ul":
            for li in node.find_all("li", recursive=False):
                parts.append("• ")
                for c in li.children:
                    walk(c)
                parts.append("<br/>")
        elif name == "ol":
            for i, li in enumerate(node.find_all("li", recursive=False), start=1):
                parts.append(f"{i}. ")
                for c in li.children:
                    walk(c)
                parts.append("<br/>")
        else:
            parts.append(_emit_inline(node))

    for el in soup.children:
        walk(el)
    result = "".join(parts).strip()
    while result.endswith("<br/>"):
        result = result[: -len("<br/>")].rstrip()
    return result


def has_content(html: str) -> bool:
    if not html:
        return False
    return bool(BeautifulSoup(html, "html.parser").get_text(strip=True))
