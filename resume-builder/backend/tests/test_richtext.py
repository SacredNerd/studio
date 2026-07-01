"""HTML rich-text -> ReportLab flowables/inline."""

from __future__ import annotations

from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

from app.pdf.richtext import has_content, html_to_flowables, html_to_inline


_BODY = ParagraphStyle("body", fontName="Helvetica", fontSize=10, leading=12)
_BULLET = ParagraphStyle("bullet", parent=_BODY, leftIndent=12, bulletIndent=2)


def _texts(flow):
    return [getattr(p, "text", str(p)) for p in flow]


def test_plain_text() -> None:
    flow = html_to_flowables("hello world", _BODY, _BULLET)
    assert len(flow) == 1
    assert isinstance(flow[0], Paragraph)


def test_inline_bold_italic_underline() -> None:
    inline = html_to_inline("<p><b>Bold</b> <i>it</i> <u>u</u></p>")
    assert "<b>Bold</b>" in inline
    assert "<i>it</i>" in inline
    assert "<u>u</u>" in inline


def test_strong_and_em_normalize() -> None:
    inline = html_to_inline("<strong>x</strong><em>y</em>")
    assert "<b>x</b>" in inline
    assert "<i>y</i>" in inline


def test_paragraph_split() -> None:
    flow = html_to_flowables("<p>one</p><p>two</p>", _BODY, _BULLET)
    assert len(flow) == 2


def test_ul_li() -> None:
    flow = html_to_flowables("<ul><li>a</li><li>b</li></ul>", _BODY, _BULLET)
    # Two bulleted paragraphs
    assert len(flow) == 2


def test_ol_li() -> None:
    flow = html_to_flowables("<ol><li>a</li><li>b</li></ol>", _BODY, _BULLET)
    assert len(flow) == 2


def test_escape_lt() -> None:
    inline = html_to_inline("a<b>X</b> &lt; 5")
    # `<` outside any tag should be escaped (BS4 unescapes the entity for us)
    assert "&lt;" in inline


def test_has_content() -> None:
    assert has_content("<p>x</p>")
    assert not has_content("")
    assert not has_content("<p></p>")
    assert not has_content("<p>  </p>")


def test_links_preserved() -> None:
    inline = html_to_inline('<a href="https://example.com">x</a>')
    assert 'href="https://example.com"' in inline
