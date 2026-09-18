import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ── Color conversion helpers ─────────────────────────────────────────────────

function clamp(n: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n));
}

function normalizeHex(hex: string): string | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return `#${h.toLowerCase()}`;
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const norm = normalizeHex(hex) ?? "#000000";
  const h = norm.slice(1);
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue = 0;
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h: hue, s, v: max };
}

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Attach a global pointer drag that reports client coordinates. */
function startDrag(
  e: React.PointerEvent,
  onMove: (clientX: number, clientY: number) => void,
) {
  e.preventDefault();
  onMove(e.clientX, e.clientY);
  const move = (ev: PointerEvent) => onMove(ev.clientX, ev.clientY);
  const up = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

// ── The picker (saturation/value box + hue slider + hex input) ───────────────

function ColorPicker({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) {
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [hexText, setHexText] = useState(() => normalizeHex(color) ?? "#000000");
  const [prevColor, setPrevColor] = useState(color);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  // Resync internal state when the value changes from outside (e.g. preset
  // click). Uses the "adjust state during render" pattern so a stale hue is
  // never shown and no extra render pass is triggered.
  if (color !== prevColor) {
    setPrevColor(color);
    const incoming = normalizeHex(color);
    const cur = hsvToHex(hsv.h, hsv.s, hsv.v);
    if (incoming && incoming !== cur.toLowerCase()) {
      setHsv(hexToHsv(incoming));
      setHexText(incoming);
    }
  }

  const commit = (next: Partial<{ h: number; s: number; v: number }>) => {
    const merged = { ...hsv, ...next };
    setHsv(merged);
    const hex = hsvToHex(merged.h, merged.s, merged.v);
    setHexText(hex);
    onChange(hex);
  };

  const handleSV = (clientX: number, clientY: number) => {
    const rect = svRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = clamp((clientX - rect.left) / rect.width);
    const v = clamp(1 - (clientY - rect.top) / rect.height);
    commit({ s, v });
  };

  const handleHue = (clientX: number) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;
    const h = clamp((clientX - rect.left) / rect.width) * 360;
    commit({ h });
  };

  const hueHex = hsvToHex(hsv.h, 1, 1);
  const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);

  return (
    <div style={{ width: 216, userSelect: "none" }}>
      {/* Saturation / Value area */}
      <div
        ref={svRef}
        onPointerDown={(e) => startDrag(e, handleSV)}
        style={{
          position: "relative",
          width: "100%",
          height: 140,
          borderRadius: 8,
          cursor: "crosshair",
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueHex})`,
          border: "1px solid rgba(0,0,0,0.15)",
          touchAction: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            width: 14,
            height: 14,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "2px solid #fff",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
            background: currentHex,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Hue slider */}
      <div
        ref={hueRef}
        onPointerDown={(e) => startDrag(e, (x) => handleHue(x))}
        style={{
          position: "relative",
          width: "100%",
          height: 14,
          borderRadius: 999,
          marginTop: 12,
          cursor: "ew-resize",
          background:
            "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
          touchAction: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${(hsv.h / 360) * 100}%`,
            top: "50%",
            width: 16,
            height: 16,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "2px solid #fff",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
            background: hueHex,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Hex input + preview */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: currentHex,
            border: "1px solid rgba(0,0,0,0.2)",
            flexShrink: 0,
          }}
        />
        <input
          type="text"
          value={hexText}
          spellCheck={false}
          onChange={(e) => {
            const raw = e.target.value;
            setHexText(raw.startsWith("#") ? raw : `#${raw}`);
            const norm = normalizeHex(raw);
            if (norm) {
              setHsv(hexToHsv(norm));
              onChange(norm);
            }
          }}
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: "monospace",
            fontSize: 13,
            padding: "5px 8px",
            borderRadius: 6,
            border: "1.5px solid #000",
            textTransform: "lowercase",
          }}
        />
      </div>
    </div>
  );
}

// ── Popover trigger button ───────────────────────────────────────────────────

export function ColorPickerButton({
  value,
  onChange,
  isActive,
}: {
  value?: string;
  onChange: (color: string) => void;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const width = 248;
      const height = 250;
      let left = r.left;
      let top = r.bottom + 8;
      if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
      if (left < 8) left = 8;
      if (top + height > window.innerHeight - 8) top = r.top - height - 8;
      if (top < 8) top = 8;
      setPos({ top, left });
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        title="Custom color"
        aria-label="Pick a custom color"
        className={`color-swatch color-swatch-custom ${isActive || open ? "color-swatch-active" : ""}`}
        onClick={toggle}
      >
        <span className="color-swatch-plus">+</span>
      </button>
      {open &&
        createPortal(
          <div
            ref={popRef}
            className="color-popover"
            style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 1000 }}
          >
            <ColorPicker color={value || "#000000"} onChange={onChange} />
          </div>,
          document.body,
        )}
    </>
  );
}
