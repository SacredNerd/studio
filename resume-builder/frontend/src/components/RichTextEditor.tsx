import React, { useEffect, useRef, useState, useCallback } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

// ── Constants ────────────────────────────────────────────────────────────────

const TEXT_COLORS = [
  '#111827', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#2563eb', '#7c3aed', '#ec4899',
]

const HIGHLIGHT_COLORS = [
  '#fde047', '#bbf7d0', '#bfdbfe', '#fecaca',
  '#e9d5ff', '#fed7aa', '#f1f5f9', 'transparent',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function cmd(command: string, value?: string) {
  document.execCommand(command, false, value)
}

function isActive(command: string): boolean {
  try {
    return document.queryCommandState(command)
  } catch {
    return false
  }
}

// ── Color Picker Popup ───────────────────────────────────────────────────────

type ColorPopupProps = {
  colors: string[]
  onPick: (color: string) => void
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

function ColorPopup({ colors, onPick, onClose, triggerRef }: ColorPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose, triggerRef])

  return (
    <div ref={popupRef} className="color-popup">
      {colors.map((color) => (
        <button
          key={color}
          className="color-dot"
          style={{
            background: color === 'transparent' ? 'white' : color,
            backgroundImage:
              color === 'transparent'
                ? 'repeating-linear-gradient(45deg,#ccc 0,#ccc 2px,white 0,white 6px)'
                : undefined,
          }}
          title={color}
          onMouseDown={(e) => {
            e.preventDefault()
            onPick(color)
          }}
        />
      ))}
    </div>
  )
}

// ── Toolbar Button ───────────────────────────────────────────────────────────

type ToolbarBtnProps = {
  active?: boolean
  title: string
  onMouseDown: (e: React.MouseEvent) => void
  children: React.ReactNode
  btnRef?: React.RefObject<HTMLButtonElement | null>
  style?: React.CSSProperties
}

function ToolbarBtn({ active, title, onMouseDown, children, btnRef, style }: ToolbarBtnProps) {
  return (
    <button
      ref={btnRef}
      className={`toolbar-btn${active ? ' toolbar-btn-active' : ''}`}
      title={title}
      onMouseDown={onMouseDown}
      style={style}
    >
      {children}
    </button>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Type here…',
  minHeight = 80,
}: RichTextEditorProps): React.ReactElement {
  const editorRef = useRef<HTMLDivElement>(null)
  const hasFocus = useRef(false)

  // Track active format states for toolbar highlight
  const [, forceUpdate] = useState(0)
  const refresh = useCallback(() => forceUpdate((n) => n + 1), [])

  // Which color picker is open: 'text' | 'highlight' | null
  const [openPicker, setOpenPicker] = useState<'text' | 'highlight' | null>(null)
  const textBtnRef = useRef<HTMLButtonElement>(null)
  const highlightBtnRef = useRef<HTMLButtonElement>(null)

  // ── Sync value → innerHTML (only when editor is NOT focused) ───────────────
  useEffect(() => {
    // Never overwrite innerHTML while the user is actively editing —
    // this preserves cursor position and text selection.
    if (hasFocus.current) return
    const el = editorRef.current
    if (el && el.innerHTML !== value) {
      el.innerHTML = value
    }
  }, [value])

  // On mount, populate the initial value
  useEffect(() => {
    const el = editorRef.current
    if (el && !el.innerHTML && value) {
      el.innerHTML = value
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Handle user edits ──────────────────────────────────────────────────────
  function handleInput() {
    const el = editorRef.current
    if (!el) return
    onChange(el.innerHTML)
  }

  // ── Toolbar action helper ──────────────────────────────────────────────────
  function exec(command: string, value?: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      cmd(command, value)
      refresh()
    }
  }

  // ── Link insertion ─────────────────────────────────────────────────────────
  function handleLink(e: React.MouseEvent) {
    e.preventDefault()
    const url = window.prompt('URL?')
    if (url) cmd('createLink', url)
    refresh()
  }

  // ── Color pickers ──────────────────────────────────────────────────────────
  function handleTextColor(color: string) {
    cmd('foreColor', color)
    setOpenPicker(null)
    refresh()
  }

  function handleHighlight(color: string) {
    cmd('hiliteColor', color)
    setOpenPicker(null)
    refresh()
  }

  function togglePicker(key: 'text' | 'highlight') {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      setOpenPicker((prev) => (prev === key ? null : key))
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="rich-editor">
      {/* Toolbar */}
      <div className="rich-toolbar">
        {/* Bold */}
        <ToolbarBtn
          title="Bold"
          active={isActive('bold')}
          onMouseDown={exec('bold')}
        >
          <strong>B</strong>
        </ToolbarBtn>

        {/* Italic */}
        <ToolbarBtn
          title="Italic"
          active={isActive('italic')}
          onMouseDown={exec('italic')}
        >
          <em>I</em>
        </ToolbarBtn>

        {/* Underline */}
        <ToolbarBtn
          title="Underline"
          active={isActive('underline')}
          onMouseDown={exec('underline')}
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </ToolbarBtn>

        {/* Strikethrough */}
        <ToolbarBtn
          title="Strikethrough"
          active={isActive('strikeThrough')}
          onMouseDown={exec('strikeThrough')}
        >
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </ToolbarBtn>

        <span className="toolbar-sep" />

        {/* Bullet list */}
        <ToolbarBtn
          title="Bullet list"
          active={isActive('insertUnorderedList')}
          onMouseDown={exec('insertUnorderedList')}
        >
          ≡
        </ToolbarBtn>

        {/* Numbered list */}
        <ToolbarBtn
          title="Numbered list"
          active={isActive('insertOrderedList')}
          onMouseDown={exec('insertOrderedList')}
        >
          <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11 }}>1≡</span>
        </ToolbarBtn>

        <span className="toolbar-sep" />

        {/* Link */}
        <ToolbarBtn title="Insert link" onMouseDown={handleLink}>
          🔗
        </ToolbarBtn>

        <span className="toolbar-sep" />

        {/* Text color */}
        <div style={{ position: 'relative' }}>
          <ToolbarBtn
            title="Text color"
            btnRef={textBtnRef}
            onMouseDown={togglePicker('text')}
          >
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
              <span style={{ fontWeight: 700 }}>A</span>
              <span style={{ display: 'block', width: 14, height: 3, background: '#ef4444', borderRadius: 1, marginTop: 1 }} />
            </span>
          </ToolbarBtn>
          {openPicker === 'text' && (
            <ColorPopup
              colors={TEXT_COLORS}
              onPick={handleTextColor}
              onClose={() => setOpenPicker(null)}
              triggerRef={textBtnRef}
            />
          )}
        </div>

        {/* Highlight color */}
        <div style={{ position: 'relative' }}>
          <ToolbarBtn
            title="Highlight color"
            btnRef={highlightBtnRef}
            onMouseDown={togglePicker('highlight')}
          >
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
              <span style={{ fontWeight: 700, fontSize: 12 }}>A</span>
              <span style={{ display: 'block', width: 14, height: 3, background: '#fde047', borderRadius: 1, marginTop: 1 }} />
            </span>
          </ToolbarBtn>
          {openPicker === 'highlight' && (
            <ColorPopup
              colors={HIGHLIGHT_COLORS}
              onPick={handleHighlight}
              onClose={() => setOpenPicker(null)}
              triggerRef={highlightBtnRef}
            />
          )}
        </div>

        <span className="toolbar-sep" />

        {/* Remove formatting */}
        <ToolbarBtn title="Clear formatting" onMouseDown={exec('removeFormat')}>
          ✕
        </ToolbarBtn>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        className="rich-content"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        style={{ minHeight }}
        onInput={handleInput}
        onKeyUp={refresh}
        onMouseUp={refresh}
        onFocus={() => { hasFocus.current = true }}
        onBlur={() => { hasFocus.current = false }}
      />
    </div>
  )
}
