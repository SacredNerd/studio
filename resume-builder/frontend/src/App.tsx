import { useState, useRef, useEffect } from "react";
import DashboardView from "./components/DashboardView";
import { RichTextEditor } from "./components/RichTextEditor";
import {
  SectionIcon,
  ChevronDown,
  ArrowLeft,
  Download,
  Grip,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  RotateCcw,
  Briefcase,
  Building2,
  MapPin,
} from "./components/Icons";
import { ResumePreview } from "./components/ResumePreview";
import { ColorPickerButton } from "./components/ColorPicker";
import { FORM_STEPS, StepNav } from "./components/StepNav";
import { DateField } from "./components/DateField";
import {
  colorPresets,
  primaryTextColorPresets,
  secondaryTextColorPresets,
  backgroundColorPresets,
  textColorPresets,
  fontOptions,
  templateCatalog,
  type ResumeData,
  type SectionKey,
} from "./data";
import { GenericListEditor } from "./components/GenericListEditor";
import { useResumeStore } from "./hooks/useResumeStore";
import { useDragSort } from "./hooks/useDragSort";
import { exportToDocx } from "./utils/docxExport";
import { csvToList, listToCsv, toTitleCase } from "./utils/helpers";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { exportPdf } from './api/client';
import { saveAs } from 'file-saver';

type EditorMode = "edit" | "customize";
type CustomizeTab = "template" | "text" | "layout";

/**
 * A single labeled color row: a set of preset swatches, an optional swatch for
 * the currently-selected custom color, plus a color-picker button ("+") that
 * always stands out and opens an in-browser color picker popover.
 */
function ColorRow({
  label,
  presets,
  value,
  onChange,
}: {
  label: string;
  presets: string[];
  value?: string;
  onChange: (color: string) => void;
}) {
  const isPreset = value ? presets.includes(value) : true;
  const hasCustom = !!value && !isPreset;
  return (
    <div className="nb-card-flat p-3 space-y-3">
      <p className="kicker">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((c) => (
          <button
            key={c}
            type="button"
            className={`color-swatch ${value === c ? "color-swatch-active" : ""}`}
            style={{ background: c, border: c === "#ffffff" ? "1px solid #cbd5e1" : undefined }}
            onClick={() => onChange(c)}
          >
            {value === c ? (
              <span
                className="block text-center text-xs"
                style={{ color: c === "#ffffff" ? "#000" : "#fff" }}
              >
                ✓
              </span>
            ) : null}
          </button>
        ))}
        {/* Swatch for the currently selected custom (non-preset) color */}
        {hasCustom ? (
          <button
            type="button"
            className="color-swatch color-swatch-active"
            style={{ background: value }}
            onClick={() => onChange(value!)}
            title={value}
          >
            <span className="block text-center text-xs text-white">✓</span>
          </button>
        ) : null}
        {/* In-browser custom color picker — always visually distinct */}
        <ColorPickerButton value={value} onChange={onChange} isActive={false} />
      </div>
    </div>
  );
}

const SECTION_LABELS: Record<SectionKey, string> = {
  headerFooter: "Header & Footer",
  personalDetails: "Personal Details",
  powerStatement: "Power Statement",
  professionalSummary: "Profile",
  websites: "Websites & Social Links",
  skills: "Skills & Proficiencies",
  technicalProficiencies: "Technical Proficiencies",
  education: "Education",
  projects: "Projects",
  workHistory: "Work History",
  achievements: "Achievements",
  accomplishments: "Accomplishments",
  internships: "Internships",
  customSimple: "Custom Section (Simple)",
  customAdvanced: "Custom Section (Advanced)",
  professionalTraining: "Professional Training",
  additionalExperience: "Additional Experience",
  volunteering: "Volunteering",
  languages: "Languages",
  hobbies: "Hobbies",
  awards: "Awards",
  certifications: "Certifications",
  affiliations: "Affiliations",
  references: "References",
};

const DEFAULT_ORDER: SectionKey[] = [
  "headerFooter",
  "personalDetails",
  "professionalSummary",
  "websites",
  "skills",
  "education",
  "projects",
  "workHistory",
  "achievements",
  "internships",
  "customSimple",
  "customAdvanced",
  "professionalTraining",
  "volunteering",
  "languages",
  "hobbies",
  "references",
  "awards",
  "certifications",
  "affiliations",
];

/* ─── Root ──────────────────────────────────────────────────────────────── */
function App() {
  const store = useResumeStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const openResume = (id: string) => setActiveId(id);
  const newResume = () => {
    const id = store.createResume();
    setActiveId(id);
  };
  const closeEditor = () => {
    store.flushSaves();
    setActiveId(null);
  };

  if (!activeId) {
    return (
      <DashboardView
        resumes={store.resumes}
        onOpen={openResume}
        onNew={newResume}
        onDelete={store.deleteResume}
        onDuplicate={(id: string) => {
          const nid = store.duplicateResume(id);
          return nid;
        }}
        onRename={store.renameResume}
      />
    );
  }

  const entry = store.getResume(activeId);
  if (!entry) {
    setActiveId(null);
    return null;
  }

  return (
    <EditorView
      resume={entry.data}
      resumeName={entry.name}
      onUpdate={(fn) => store.updateResume(activeId, fn)}
      onClose={closeEditor}
      onExportDocx={() => exportToDocx(entry.data).catch(console.error)}
    />
  );
}

/* ─── Editor ────────────────────────────────────────────────────────────── */
type EditorViewProps = {
  resume: ResumeData;
  resumeName: string;
  onUpdate: (fn: (d: ResumeData) => ResumeData) => void;
  onClose: () => void;
  onExportDocx: () => void;
};

function EditorView({
  resume,
  resumeName,
  onUpdate: originalOnUpdate,
  onClose,
  onExportDocx,
}: EditorViewProps) {
  const { wrappedUpdate: onUpdate, undo, redo, canUndo, canRedo } = useUndoRedo(resume, originalOnUpdate);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  const [mode, setMode] = useState<EditorMode>("edit");
  const [customizeTab, setCustomizeTab] = useState<CustomizeTab>("template");
  const [currentStep, setCurrentStep] = useState(1);
  const [openSection, setOpenSection] = useState<SectionKey | null>(
    "personalDetails",
  );
  const [renamingSection, setRenamingSection] = useState<SectionKey | null>(
    null,
  );
  const [renameValue, setRenameValue] = useState("");
  const {
    items: sectionOrder,
    setItems: setSectionOrder,
    dragSourceHandlers,
    dragTargetHandlers,
    draggingIndex,
    overIndex,
  } = useDragSort<SectionKey>(resume.customization.sectionOrder ?? DEFAULT_ORDER);

  // Sync drag sort state if resume.customization.sectionOrder changes from elsewhere
  useEffect(() => {
    if (resume.customization.sectionOrder) {
      setSectionOrder(resume.customization.sectionOrder);
    }
  }, [resume.customization.sectionOrder]);

  // Update store when local drag order changes
  useEffect(() => {
    const current = resume.customization.sectionOrder ?? DEFAULT_ORDER;
    if (JSON.stringify(sectionOrder) !== JSON.stringify(current)) {
      onUpdate((d) => ({
        ...d,
        customization: {
          ...d.customization,
          sectionOrder: sectionOrder,
        },
      }));
    }
  }, [sectionOrder]);

  // Section meta helpers
  const sectionLabels: Partial<Record<SectionKey, string>> =
    resume.customization.sectionLabels ?? {};
  const disabledSections: SectionKey[] =
    resume.customization.disabledSections ?? [];
  const getLabel = (k: SectionKey) => sectionLabels[k] ?? SECTION_LABELS[k];
  const isDisabled = (k: SectionKey) => disabledSections.includes(k);

  const startRename = (k: SectionKey) => {
    setRenamingSection(k);
    setRenameValue(getLabel(k));
  };
  const commitRename = (k: SectionKey) => {
    onUpdate((d) => ({
      ...d,
      customization: {
        ...d.customization,
        sectionLabels: {
          ...(d.customization.sectionLabels ?? {}),
          [k]: renameValue,
        },
      },
    }));
    setRenamingSection(null);
  };
  const cancelRename = () => setRenamingSection(null);

  const toggleDisabled = (k: SectionKey) => {
    onUpdate((d) => {
      const cur = d.customization.disabledSections ?? [];
      const next = cur.includes(k) ? cur.filter((s) => s !== k) : [...cur, k];
      return {
        ...d,
        customization: { ...d.customization, disabledSections: next },
      };
    });
  };

  // Persist section order through onUpdate so it is atomic with the store save
  // and captured by undo/redo. The sync-in effect above mirrors it back into
  // the local drag-sort state, so we don't call setSectionOrder here directly
  // (that would create a second, redundant undo entry).
  const persistOrder = (next: SectionKey[]) => {
    onUpdate((d) => ({
      ...d,
      customization: { ...d.customization, sectionOrder: next },
    }));
  };

  const deleteSection = (k: SectionKey) => {
    const current = resume.customization.sectionOrder ?? DEFAULT_ORDER;
    persistOrder(current.filter((s) => s !== k));
    if (openSection === k) setOpenSection(null);
  };

  const restoreSection = (k: SectionKey) => {
    const current = resume.customization.sectionOrder ?? DEFAULT_ORDER;
    if (current.includes(k)) return;
    // Re-insert at its canonical position from DEFAULT_ORDER so restored
    // sections don't always land at the very bottom.
    const canonicalIdx = DEFAULT_ORDER.indexOf(k);
    const next = [...current];
    let insertAt = next.length;
    for (let i = 0; i < next.length; i++) {
      if (DEFAULT_ORDER.indexOf(next[i]) > canonicalIdx) {
        insertAt = i;
        break;
      }
    }
    next.splice(insertAt, 0, k);
    persistOrder(next);
  };

  const activeTemplate = templateCatalog.find(
    (t) => t.key === resume.customization.selectedTemplate,
  );

  const handlePdfExport = async () => {
    try {
      const blob = await exportPdf(resume);
      saveAs(blob, `${resume.personalDetails.fullName || 'Resume'}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Check console for details.");
    }
  };

  const hasContent = (sec: string) => {
    const val = resume.sections[sec as keyof typeof resume.sections];
    if (typeof val === "string") return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    if (sec === "headerFooter")
      return resume.headerFooter.documentTitle.length > 0;
    if (sec === "personalDetails")
      return resume.personalDetails.fullName.length > 0;
    return false;
  };

  // Sections for current step (filtered + respecting drag order)
  const currentStepSections = sectionOrder.filter((k) =>
    FORM_STEPS[currentStep - 1]?.sections.includes(k),
  );

  // Completed steps: step has at least one non-empty string field
  const completedSteps = FORM_STEPS.filter((step) => {
    return step.sections.some(hasContent);
  }).map((s) => s.id);

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { textarea?: boolean; rows?: number; type?: string; rich?: boolean },
  ) => (
    <label className="field">
      <span>{label}</span>
      {opts?.rich ? (
        <RichTextEditor
          value={value}
          onChange={onChange}
          minHeight={(opts.rows ?? 4) * 24}
        />
      ) : opts?.textarea ? (
        <textarea
          rows={opts.rows ?? 4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={opts?.type ?? "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );

  const listEditor = <T,>(cfg: {
    items: T[];
    onAdd: () => void;
    onRemove: (i: number) => void;
    getLabel: (item: T, i: number) => string;
    render: (item: T, i: number) => React.ReactNode;
  }) => (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          className="nb-btn nb-btn-primary py-1 px-3 text-xs gap-1"
          onClick={cfg.onAdd}
        >
          <Plus size={12} /> Add
        </button>
      </div>
      {cfg.items.map((item, i) => (
        <div key={i} className="item-card">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              {cfg.getLabel(item, i)}
            </span>
            <button
              type="button"
              className="nb-btn nb-btn-white py-0.5 px-2 text-xs !text-red-500 !border-red-200"
              onClick={() => cfg.onRemove(i)}
            >
              <Trash2 size={12} />
            </button>
          </div>
          {cfg.render(item, i)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="app-shell">
      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <header className="topbar no-print">
        {/* Left: back + name */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            className="nb-btn nb-btn-white py-1.5 px-2"
            onClick={onClose}
            title="Back to dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="hidden sm:flex h-9 w-9 items-center justify-center border-2 border-black bg-[#6d28d9] text-white font-black text-sm rounded-[4px] shrink-0">
            R
          </div>
          <div className="hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">
              Resume Builder
            </p>
            <p className="text-sm font-black leading-tight">{resumeName}</p>
          </div>
        </div>

        {/* Center: mode toggle */}
        <div className="static translate-x-0 md:absolute md:left-1/2 md:-translate-x-1/2">
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-tab ${mode === "edit" ? "mode-tab-active" : ""}`}
              onClick={() => setMode("edit")}
            >
              Edit
            </button>
            <button
              type="button"
              className={`mode-tab ${mode === "customize" ? "mode-tab-active" : ""}`}
              onClick={() => setMode("customize")}
            >
              Customize
            </button>
          </div>
        </div>

        {/* Right: undo/redo + export + print */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button type="button" className="nb-btn nb-btn-white py-1.5 px-2" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" style={{ opacity: canUndo ? 1 : 0.4 }}>↩</button>
          <button type="button" className="nb-btn nb-btn-white py-1.5 px-2" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)" style={{ opacity: canRedo ? 1 : 0.4 }}>↪</button>
          <div ref={exportRef} style={{ position: 'relative' }}>
            <button type="button" className="nb-btn nb-btn-yellow py-1.5 px-2.5 sm:px-4 gap-1 sm:gap-1.5" onClick={() => setExportOpen(o => !o)} title="Export">
              <Download size={15} />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown size={12} />
            </button>
            {exportOpen && (
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: 'white', border: '2px solid #000', borderRadius: 6, boxShadow: '3px 3px 0 #000', zIndex: 100, minWidth: 150, overflow: 'hidden' }}>
                <button type="button" className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm font-bold bg-white text-black hover:bg-[#6d28d9] hover:text-white transition-colors border-b-2 border-black" onClick={() => { onExportDocx(); setExportOpen(false); }}>
                  <Download size={14} /> DOCX
                </button>
                <button type="button" className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm font-bold bg-white text-black hover:bg-[#6d28d9] hover:text-white transition-colors" onClick={() => { handlePdfExport(); setExportOpen(false); }}>
                  <Download size={14} /> PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main grid ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1700px] gap-3 p-3 sm:p-4 editor-grid">
        {/* ── LEFT: form / customize ────────────────────────────────── */}
        <section className="editor-left no-print">
          {mode === "edit" ? (
            <>
              {/* Step nav */}
              <div className="shrink-0 border-b-2 border-black bg-white">
                <StepNav
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                  onStepClick={(s) => {
                    setCurrentStep(s);
                    setOpenSection(null);
                  }}
                />
              </div>

              {/* Section list — spaced cards, drag-sortable */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="sections-list">
                  {currentStepSections.map((key) => {
                    const globalIdx = sectionOrder.indexOf(key);
                    const isDragging = draggingIndex === globalIdx;
                    const isOver = overIndex === globalIdx;
                    const disabled = isDisabled(key);
                    const isOpen = openSection === key;
                    const isRenaming = renamingSection === key;
                    return (
                      <div
                        key={key}
                        className={`section-card${isDragging ? " is-dragging" : ""}${isOver && !isDragging ? " is-drag-over" : ""}${disabled ? " is-disabled" : ""}`}
                        {...dragTargetHandlers(globalIdx)}
                      >
                        {/* Card header row */}
                        <div className="section-header">
                          {/* Drag grip */}
                          <span className="section-drag-handle" {...dragSourceHandlers(globalIdx)}>
                            <Grip size={13} />
                          </span>

                          {/* Expand/collapse area */}
                          <button
                            type="button"
                            className="section-expand-btn"
                            onClick={() => setOpenSection(isOpen ? null : key)}
                          >
                            <span className="text-slate-400">
                              <SectionIcon section={key} size={15} />
                            </span>
                            {isRenaming ? (
                              <input
                                autoFocus
                                className="section-rename-input"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") commitRename(key);
                                  if (e.key === "Escape") cancelRename();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="text-sm font-bold truncate">
                                {getLabel(key)}
                              </span>
                            )}
                          </button>

                          {/* Action buttons */}
                          <div
                            className="section-actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isRenaming ? (
                              <>
                                <button
                                  className="icon-action"
                                  title="Save"
                                  onClick={() => commitRename(key)}
                                >
                                  <Check size={13} />
                                </button>
                                <button
                                  className="icon-action"
                                  title="Cancel"
                                  onClick={cancelRename}
                                >
                                  <X size={13} />
                                </button>
                              </>
                            ) : (
                              <button
                                className="icon-action"
                                title="Rename section"
                                onClick={() => startRename(key)}
                              >
                                <Edit3 size={13} />
                              </button>
                            )}
                            <button
                              className="icon-action danger"
                              title="Remove section"
                              onClick={() => deleteSection(key)}
                            >
                              <Trash2 size={13} />
                            </button>
                            {/* Visibility toggle */}
                            <button
                              className={`section-vis-btn ${disabled ? "hidden-sec" : "visible"}`}
                              title={
                                disabled
                                  ? "Show in preview"
                                  : "Hide from preview"
                              }
                              onClick={() => toggleDisabled(key)}
                            >
                              {disabled ? (
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                  <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                              ) : (
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              )}
                            </button>
                            {/* Chevron */}
                            <span
                              className={`section-chevron${isOpen ? " open" : ""}`}
                            >
                              <ChevronDown size={15} />
                            </span>
                          </div>
                        </div>

                        {/* Expanded body */}
                        {isOpen ? (
                          <div className="section-body">
                            <SectionEditor
                              sectionKey={key}
                              resume={resume}
                              update={onUpdate}
                              field={field}
                              listEditor={listEditor}
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Deleted sections restore area */}
                {(() => {
                  const deleted = DEFAULT_ORDER.filter(
                    (k) => !sectionOrder.includes(k)
                  );
                  if (deleted.length === 0) return null;
                  return (
                    <div className="mt-4 border-t-2 border-dashed border-slate-300 pt-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Deleted sections (click to restore)
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {deleted.map((key) => (
                          <button
                            key={key}
                            type="button"
                            className="nb-btn nb-btn-white py-1 px-2 text-xs gap-1"
                            onClick={() => restoreSection(key)}
                          >
                            <RotateCcw size={12} />
                            {getLabel(key)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Reorder tip */}
                <p className="mt-3 text-center text-xs text-slate-400">
                  ⠿ Drag sections to reorder them
                </p>
              </div>
            </>
          ) : (
            /* ── Customize panel ──────────────────────────────────────── */
            <CustomizePanel
              resume={resume}
              update={onUpdate}
              tab={customizeTab}
              onTabChange={setCustomizeTab}
            />
          )}
        </section>

        {/* ── RIGHT: preview ─────────────────────────────────────────── */}
        <aside className="editor-right">
          <ResumePreview
            resume={resume}
            activeTemplate={activeTemplate?.name ?? "Classic"}
          />
        </aside>
      </div>
    </div>
  );
}

/* ─── Customize Panel ───────────────────────────────────────────────────── */
function CustomizePanel({
  resume,
  update,
  tab,
  onTabChange,
}: {
  resume: ResumeData;
  update: (fn: (d: ResumeData) => ResumeData) => void;
  tab: CustomizeTab;
  onTabChange: (t: CustomizeTab) => void;
}) {
  const set = (fn: (d: ResumeData) => ResumeData) => update(fn);
  const [draggedKey, setDraggedKey] = useState<SectionKey | null>(null);
  const [addSectionColumn, setAddSectionColumn] = useState<'left' | 'right' | null>(null);
  const sectionOrder = resume.customization.sectionOrder ?? DEFAULT_ORDER;
  const sectionLabels: Partial<Record<SectionKey, string>> =
    resume.customization.sectionLabels ?? {};
  const disabledSections: SectionKey[] =
    resume.customization.disabledSections ?? [];
  const getLabel = (k: SectionKey) => sectionLabels[k] ?? SECTION_LABELS[k];
  const isDisabled = (k: SectionKey) => disabledSections.includes(k);

  const hasContent = (sec: string) => {
    const val = resume.sections[sec as keyof typeof resume.sections];
    if (typeof val === "string") return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    if (sec === "headerFooter") return resume.headerFooter.documentTitle.length > 0;
    if (sec === "personalDetails") return resume.personalDetails.fullName.length > 0;
    return false;
  };

  function getSectionColumn(key: SectionKey): "left" | "right" {
    const assignment = resume.customization.sectionColumnAssignment?.[key];
    if (assignment) return assignment;
    
    const leftDefaults: SectionKey[] = [
      "skills",
      "technicalProficiencies",
      "languages",
      "hobbies",
      "references",
      "awards",
      "certifications",
      "affiliations",
      "websites"
    ];
    if (leftDefaults.includes(key)) return "left";
    return "right";
  }

  const toggleDisabled = (k: SectionKey) => {
    set((d) => {
      const cur = d.customization.disabledSections ?? [];
      const next = cur.includes(k) ? cur.filter((s) => s !== k) : [...cur, k];
      return {
        ...d,
        customization: { ...d.customization, disabledSections: next },
      };
    });
  };

  const deleteSection = (k: SectionKey) => {
    set((d) => {
      const cur = d.customization.sectionOrder ?? DEFAULT_ORDER;
      return {
        ...d,
        customization: { ...d.customization, sectionOrder: cur.filter((s) => s !== k) },
      };
    });
  };
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="customize-tab-bar shrink-0">
        {(["template", "text", "layout"] as CustomizeTab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`c-tab ${tab === t ? "c-tab-active" : ""}`}
            onClick={() => onTabChange(t)}
          >
            {t === "template"
              ? "Template & Colors"
              : t === "text"
                ? "Text"
                : "Layout"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        {tab === "template" && (
          <>
            <ColorRow
              label="Main color"
              presets={colorPresets}
              value={resume.customization.primaryColor}
              onChange={(c) =>
                set((d) => ({
                  ...d,
                  customization: { ...d.customization, primaryColor: c },
                }))
              }
            />

            <ColorRow
              label="Primary Text Color"
              presets={primaryTextColorPresets}
              value={resume.customization.primaryTextColor}
              onChange={(c) =>
                set((d) => ({
                  ...d,
                  customization: { ...d.customization, primaryTextColor: c },
                }))
              }
            />

            <ColorRow
              label="Secondary Text Color"
              presets={secondaryTextColorPresets}
              value={resume.customization.secondaryTextColor}
              onChange={(c) =>
                set((d) => ({
                  ...d,
                  customization: { ...d.customization, secondaryTextColor: c },
                }))
              }
            />

            <ColorRow
              label="Text Color"
              presets={textColorPresets}
              value={resume.customization.textColor}
              onChange={(c) =>
                set((d) => ({
                  ...d,
                  customization: { ...d.customization, textColor: c },
                }))
              }
            />

            <ColorRow
              label="Background Color"
              presets={backgroundColorPresets}
              value={resume.customization.backgroundColor}
              onChange={(c) =>
                set((d) => ({
                  ...d,
                  customization: { ...d.customization, backgroundColor: c },
                }))
              }
            />

            {/* Filter buttons removed — everything is free */}
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {templateCatalog.map((tpl) => (
                <button
                  key={tpl.key}
                  type="button"
                  className={`template-card ${resume.customization.selectedTemplate === tpl.key ? "template-card-active" : ""}`}
                  onClick={() =>
                    set((d) => ({
                      ...d,
                      customization: {
                        ...d.customization,
                        selectedTemplate: tpl.key,
                      },
                    }))
                  }
                >
                  <p className="mb-1 text-sm font-black">{tpl.name}</p>
                  <div className="template-thumb mb-2 relative overflow-hidden">
                    {tpl.key === "professional" ? (
                      <div
                        className="template-thumb-sidebar"
                        style={{
                          background: resume.customization.primaryColor,
                        }}
                      />
                    ) : null}
                    <div className="thumb-line mt-2" />
                    <div className="thumb-line short" />
                    <div className="thumb-block" />
                  </div>
                  <div className="flex gap-1">
                    <span className="export-tag">PDF</span>
                    <span className="export-tag">DOCX</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {tab === "text" && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="field">
                <span>Primary Font</span>
                <select
                  value={resume.customization.primaryFont}
                  onChange={(e) =>
                    set((d) => ({
                      ...d,
                      customization: {
                        ...d.customization,
                        primaryFont: e.target.value,
                      },
                    }))
                  }
                >
                  {fontOptions.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Secondary Font</span>
                <select
                  value={resume.customization.secondaryFont}
                  onChange={(e) =>
                    set((d) => ({
                      ...d,
                      customization: {
                        ...d.customization,
                        secondaryFont: e.target.value,
                      },
                    }))
                  }
                >
                  {fontOptions.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </label>
            </div>
            <CSlider
              label="Line Height"
              min={0.9}
              max={1.8}
              step={0.05}
              value={resume.customization.lineHeight}
              display={`${Math.round(resume.customization.lineHeight * 100)}%`}
              onChange={(v) =>
                set((d) => ({
                  ...d,
                  customization: { ...d.customization, lineHeight: v },
                }))
              }
            />
            <div className="space-y-3">
              <p className="kicker">Font Size</p>
              <CSlider
                label="Primary Heading"
                min={20}
                max={40}
                step={1}
                value={resume.customization.fontSizes.primaryHeading}
                display={`${resume.customization.fontSizes.primaryHeading}pt`}
                onChange={(v) =>
                  set((d) => ({
                    ...d,
                    customization: {
                      ...d.customization,
                      fontSizes: {
                        ...d.customization.fontSizes,
                        primaryHeading: v,
                      },
                    },
                  }))
                }
              />
              <CSlider
                label="Secondary Heading"
                min={12}
                max={28}
                step={1}
                value={resume.customization.fontSizes.secondaryHeading}
                display={`${resume.customization.fontSizes.secondaryHeading}pt`}
                onChange={(v) =>
                  set((d) => ({
                    ...d,
                    customization: {
                      ...d.customization,
                      fontSizes: {
                        ...d.customization.fontSizes,
                        secondaryHeading: v,
                      },
                    },
                  }))
                }
              />
              <CSlider
                label="Body"
                min={9}
                max={18}
                step={1}
                value={resume.customization.fontSizes.body}
                display={`${resume.customization.fontSizes.body}pt`}
                onChange={(v) =>
                  set((d) => ({
                    ...d,
                    customization: {
                      ...d.customization,
                      fontSizes: { ...d.customization.fontSizes, body: v },
                    },
                  }))
                }
              />
              <CSlider
                label="Section Titles"
                min={9}
                max={18}
                step={1}
                value={resume.customization.fontSizes.sectionTitles}
                display={`${resume.customization.fontSizes.sectionTitles}pt`}
                onChange={(v) =>
                  set((d) => ({
                    ...d,
                    customization: {
                      ...d.customization,
                      fontSizes: {
                        ...d.customization.fontSizes,
                        sectionTitles: v,
                      },
                    },
                  }))
                }
              />
            </div>
            <div className="nb-info">
              PDF preserves all font weights. DOCX simplifies to Bold and
              Normal.
            </div>
            <div className="space-y-3">
              <p className="kicker">Font Weight</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    "primaryHeading",
                    "secondaryHeading",
                    "body",
                    "sectionTitles",
                  ] as const
                ).map((k) => (
                  <label key={k} className="field">
                    <span>{toTitleCase(k)}</span>
                    <select
                      value={resume.customization.fontWeights[k]}
                      onChange={(e) =>
                        set((d) => ({
                          ...d,
                          customization: {
                            ...d.customization,
                            fontWeights: {
                              ...d.customization.fontWeights,
                              [k]: e.target
                                .value as ResumeData["customization"]["fontWeights"][typeof k],
                            },
                          },
                        }))
                      }
                    >
                      {["Regular", "Medium", "SemiBold", "Bold"].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-200">
              <p className="kicker">Font Styles</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    "primaryHeading",
                    "secondaryHeading",
                    "sectionTitles",
                  ] as const
                ).map((k) => {
                  const style = resume.customization.textStyles?.[k] || { italic: false, underline: false };
                  return (
                    <div key={k} className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{toTitleCase(k)}</span>
                      <div className="flex gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
                        <button
                          type="button"
                          className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${style.italic ? "bg-[#6d28d9] text-white" : "bg-transparent text-slate-600 hover:bg-slate-200"}`}
                          onClick={() => set(d => ({
                            ...d, customization: {
                              ...d.customization,
                              textStyles: {
                                ...(d.customization.textStyles || {
                                  primaryHeading: { italic: false, underline: false },
                                  secondaryHeading: { italic: false, underline: false },
                                  sectionTitles: { italic: false, underline: false },
                                }),
                                [k]: { ...style, italic: !style.italic }
                              }
                            }
                          }))}
                        >
                          <span className="italic">I</span>
                        </button>
                        <button
                          type="button"
                          className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${style.underline ? "bg-[#6d28d9] text-white" : "bg-transparent text-slate-600 hover:bg-slate-200"}`}
                          onClick={() => set(d => ({
                            ...d, customization: {
                              ...d.customization,
                              textStyles: {
                                ...(d.customization.textStyles || {
                                  primaryHeading: { italic: false, underline: false },
                                  secondaryHeading: { italic: false, underline: false },
                                  sectionTitles: { italic: false, underline: false },
                                }),
                                [k]: { ...style, underline: !style.underline }
                              }
                            }
                          }))}
                        >
                          <span className="underline">U</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {tab === "layout" && (
          <>
            <div className="space-y-3">
              <p className="kicker">Margins & Spacing</p>
              <CSlider
                label="Header & Footer"
                min={0.1}
                max={1}
                step={0.05}
                value={resume.customization.headerFooterSpacing}
                display={`${resume.customization.headerFooterSpacing.toFixed(2)}in`}
                onChange={(v) =>
                  set((d) => ({
                    ...d,
                    customization: {
                      ...d.customization,
                      headerFooterSpacing: v,
                    },
                  }))
                }
              />
              <CSlider
                label="Top & Bottom"
                min={0.1}
                max={1}
                step={0.05}
                value={resume.customization.marginVertical}
                display={`${resume.customization.marginVertical.toFixed(2)}in`}
                onChange={(v) =>
                  set((d) => ({
                    ...d,
                    customization: { ...d.customization, marginVertical: v },
                  }))
                }
              />
              <CSlider
                label="Left & Right"
                min={0.1}
                max={1}
                step={0.05}
                value={resume.customization.marginHorizontal}
                display={`${resume.customization.marginHorizontal.toFixed(2)}in`}
                onChange={(v) =>
                  set((d) => ({
                    ...d,
                    customization: { ...d.customization, marginHorizontal: v },
                  }))
                }
              />
              <CSlider
                label="Between sections"
                min={4}
                max={24}
                step={1}
                value={resume.customization.betweenSections}
                display={`${resume.customization.betweenSections}pt`}
                onChange={(v) =>
                  set((d) => ({
                    ...d,
                    customization: { ...d.customization, betweenSections: v },
                  }))
                }
              />
              <CSlider
                label="Content blocks"
                min={4}
                max={18}
                step={1}
                value={resume.customization.contentBlockGap}
                display={`${resume.customization.contentBlockGap}pt`}
                onChange={(v) =>
                  set((d) => ({
                    ...d,
                    customization: { ...d.customization, contentBlockGap: v },
                  }))
                }
              />
              <CSlider
                label="Inside blocks"
                min={0}
                max={12}
                step={1}
                value={resume.customization.contentInnerPadding}
                display={`${resume.customization.contentInnerPadding}pt`}
                onChange={(v) =>
                  set((d) => ({
                    ...d,
                    customization: { ...d.customization, contentInnerPadding: v },
                  }))
                }
              />
            </div>
            <label className="field">
              <span>Date format</span>
              <select
                value={resume.customization.dateFormat}
                onChange={(e) =>
                  set((d) => ({
                    ...d,
                    customization: {
                      ...d.customization,
                      dateFormat: e.target
                        .value as ResumeData["customization"]["dateFormat"],
                    },
                  }))
                }
              >
                <option>Short Name (Jan YYYY)</option>
                <option>Numeric (MM.YYYY)</option>
                <option>Year only</option>
              </select>
            </label>
            <ChoiceGrid
              title="Header Alignment"
              value={resume.customization.headerAlignment}
              options={[
                ["left", "Left"],
                ["center", "Center"],
                ["right", "Right"],
              ]}
              onChange={(v) =>
                set((d) => ({
                  ...d,
                  customization: {
                    ...d.customization,
                    headerAlignment:
                      v as ResumeData["customization"]["headerAlignment"],
                  },
                }))
              }
            />
            <ChoiceGrid
              title="Skills Layout"
              value={resume.customization.skillsLayout}
              options={[
                ["inline", "In line"],
                ["columns", "Columns"],
              ]}
              onChange={(v) =>
                set((d) => ({
                  ...d,
                  customization: {
                    ...d.customization,
                    skillsLayout:
                      v as ResumeData["customization"]["skillsLayout"],
                  },
                }))
              }
            />
            <ChoiceGrid
              title="Education Layout"
              value={resume.customization.educationLayout}
              options={[
                ["stacked", "Stacked"],
                ["inline", "Inline"],
              ]}
              onChange={(v) =>
                set((d) => ({
                  ...d,
                  customization: {
                    ...d.customization,
                    educationLayout:
                      v as ResumeData["customization"]["educationLayout"],
                  },
                }))
              }
            />
            <div className="space-y-2 mt-4">
              <p className="kicker">Column Width</p>
              {["split-rule", "professional", "specialist"].includes(resume.customization.selectedTemplate) ? (
                <CSlider
                  label={`Left ${Math.round(resume.customization.leftColumnWidth ?? 43)}% / Right ${Math.round(100 - (resume.customization.leftColumnWidth ?? 43))}%`}
                  min={20}
                  max={80}
                  step={1}
                  value={resume.customization.leftColumnWidth ?? 43}
                  display={`${Math.round(resume.customization.leftColumnWidth ?? 43)}%`}
                  onChange={(v) => {
                    set(d => ({
                      ...d,
                      customization: {
                        ...d.customization,
                        leftColumnWidth: v
                      }
                    }));
                  }}
                />
              ) : (
                <div className="text-[11px] text-slate-500 bg-slate-100 p-2 rounded border border-slate-200">
                  Column width is fixed or not applicable for the selected template.
                </div>
              )}
            </div>
            
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <p className="kicker">Change Section Layout</p>
              <div className={`grid gap-3 ${["split-rule", "professional", "specialist"].includes(resume.customization.selectedTemplate) ? "grid-cols-2" : "grid-cols-1"}`}>
                {/* Left Column list */}
                <div 
                  className="flex flex-col gap-2 p-3 bg-slate-50 border-2 border-black rounded-[6px] min-h-[300px]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedKey && getSectionColumn(draggedKey) !== 'left') {
                      set(d => {
                        const currentOrder = d.customization.sectionOrder ?? DEFAULT_ORDER;
                        const filtered = currentOrder.filter(k => k !== draggedKey);
                        return {
                          ...d,
                          customization: {
                            ...d.customization,
                            sectionColumnAssignment: {
                              ...(d.customization.sectionColumnAssignment ?? {}),
                              [draggedKey]: 'left'
                            },
                            sectionOrder: [...filtered, draggedKey]
                          }
                        };
                      });
                    }
                  }}
                >
                  <div className="text-center font-black text-[10px] uppercase tracking-wider text-slate-500 mb-1 border-b border-dashed border-slate-300 pb-1">
                    Left Column ({Math.round(resume.customization.leftColumnWidth ?? 43)}%)
                  </div>
                  
                  {/* Personal Details as static card at top */}
                  <div className="border-2 border-black bg-white rounded-[6px] p-3 flex flex-col items-center justify-center text-center shadow-[2px_2px_0_rgba(0,0,0,1)] relative select-none">
                    <span className="text-slate-400 mb-1">
                      <SectionIcon section="personalDetails" size={20} />
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      Personal Details
                    </span>
                  </div>

                  {sectionOrder
                    .filter(k => k !== 'headerFooter' && k !== 'personalDetails' && getSectionColumn(k) === 'left' && hasContent(k))
                    .map((key) => {
                      const disabled = isDisabled(key);
                      return (
                        <div
                          key={key}
                          draggable
                          onDragStart={(e) => {
                            setDraggedKey(key);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (draggedKey) {
                              set(d => {
                                const currentOrder = d.customization.sectionOrder ?? DEFAULT_ORDER;
                                const filtered = currentOrder.filter(k => k !== draggedKey);
                                const targetIdx = filtered.indexOf(key);
                                const next = [...filtered];
                                next.splice(targetIdx, 0, draggedKey);
                                return {
                                  ...d,
                                  customization: {
                                    ...d.customization,
                                    sectionColumnAssignment: {
                                      ...(d.customization.sectionColumnAssignment ?? {}),
                                      [draggedKey]: 'left'
                                    },
                                    sectionOrder: next
                                  }
                                };
                              });
                            }
                          }}
                          className={`flex items-center justify-between border-2 border-black bg-white rounded-[6px] p-2 shadow-[2px_2px_0_rgba(0,0,0,1)] cursor-grab active:cursor-grabbing hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_rgba(0,0,0,1)] transition-all ${disabled ? 'border-dashed border-slate-300 opacity-60 bg-slate-50 shadow-none hover:transform-none' : ''}`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-slate-400 cursor-grab shrink-0">
                              <Grip size={11} />
                            </span>
                            <span className="text-slate-400 shrink-0">
                              <SectionIcon section={key} size={13} />
                            </span>
                            <span className="text-[11px] font-bold truncate">
                              {getLabel(key)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              className="p-0.5 hover:bg-slate-100 rounded text-slate-500"
                              title={disabled ? "Show in preview" : "Hide from preview"}
                              onClick={() => toggleDisabled(key)}
                            >
                              {disabled ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                              )}
                            </button>
                            <button
                              type="button"
                              className="p-0.5 hover:bg-red-50 text-red-500 rounded"
                              title="Delete/Hide"
                              onClick={() => deleteSection(key)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                  {/* Plus add zone */}
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full border-2 border-dashed border-slate-300 hover:border-black rounded-[6px] py-1.5 flex items-center justify-center text-slate-400 hover:text-black transition-colors"
                      onClick={() => setAddSectionColumn(addSectionColumn === 'left' ? null : 'left')}
                    >
                      <Plus size={14} />
                    </button>
                    {addSectionColumn === 'left' && (
                      <div className="absolute left-0 bottom-full mb-1 w-full bg-white border-2 border-black rounded-[6px] shadow-[3px_3px_0_#000] z-[100] max-h-[150px] overflow-y-auto">
                        {disabledSections.length === 0 ? (
                          <div className="p-2 text-[10px] text-slate-400 text-center">No hidden sections</div>
                        ) : (
                          disabledSections.map(k => (
                            <button
                              key={k}
                              type="button"
                              className="w-full px-2.5 py-1.5 text-left text-[11px] font-bold hover:bg-[#6d28d9] hover:text-white transition-colors border-b border-slate-100 last:border-b-0 flex items-center gap-1.5"
                              onClick={() => {
                                toggleDisabled(k);
                                set(d => ({
                                  ...d,
                                  customization: {
                                    ...d.customization,
                                    sectionColumnAssignment: {
                                      ...(d.customization.sectionColumnAssignment ?? {}),
                                      [k]: 'left'
                                    }
                                  }
                                }));
                                setAddSectionColumn(null);
                              }}
                            >
                              <SectionIcon section={k} size={11} /> {getLabel(k)}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column list (only if supported) */}
                {["split-rule", "professional", "specialist"].includes(resume.customization.selectedTemplate) && (
                <div 
                  className="flex flex-col gap-2 p-3 bg-slate-50 border-2 border-black rounded-[6px] min-h-[300px]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedKey && getSectionColumn(draggedKey) !== 'right') {
                      set(d => {
                        const currentOrder = d.customization.sectionOrder ?? DEFAULT_ORDER;
                        const filtered = currentOrder.filter(k => k !== draggedKey);
                        return {
                          ...d,
                          customization: {
                            ...d.customization,
                            sectionColumnAssignment: {
                              ...(d.customization.sectionColumnAssignment ?? {}),
                              [draggedKey]: 'right'
                            },
                            sectionOrder: [...filtered, draggedKey]
                          }
                        };
                      });
                    }
                  }}
                >
                  <div className="text-center font-black text-[10px] uppercase tracking-wider text-slate-500 mb-1 border-b border-dashed border-slate-300 pb-1">
                    Right Column ({Math.round(100 - (resume.customization.leftColumnWidth ?? 43))}%)
                  </div>

                  {sectionOrder
                    .filter(k => k !== 'headerFooter' && k !== 'personalDetails' && getSectionColumn(k) === 'right' && hasContent(k))
                    .map((key) => {
                      const disabled = isDisabled(key);
                      return (
                        <div
                          key={key}
                          draggable
                          onDragStart={(e) => {
                            setDraggedKey(key);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (draggedKey) {
                              set(d => {
                                const currentOrder = d.customization.sectionOrder ?? DEFAULT_ORDER;
                                const filtered = currentOrder.filter(k => k !== draggedKey);
                                const targetIdx = filtered.indexOf(key);
                                const next = [...filtered];
                                next.splice(targetIdx, 0, draggedKey);
                                return {
                                  ...d,
                                  customization: {
                                    ...d.customization,
                                    sectionColumnAssignment: {
                                      ...(d.customization.sectionColumnAssignment ?? {}),
                                      [draggedKey]: 'right'
                                    },
                                    sectionOrder: next
                                  }
                                };
                              });
                            }
                          }}
                          className={`flex items-center justify-between border-2 border-black bg-white rounded-[6px] p-2 shadow-[2px_2px_0_rgba(0,0,0,1)] cursor-grab active:cursor-grabbing hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_rgba(0,0,0,1)] transition-all ${disabled ? 'border-dashed border-slate-300 opacity-60 bg-slate-50 shadow-none hover:transform-none' : ''}`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-slate-400 cursor-grab shrink-0">
                              <Grip size={11} />
                            </span>
                            <span className="text-slate-400 shrink-0">
                              <SectionIcon section={key} size={13} />
                            </span>
                            <span className="text-[11px] font-bold truncate">
                              {getLabel(key)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              className="p-0.5 hover:bg-slate-100 rounded text-slate-500"
                              title={disabled ? "Show in preview" : "Hide from preview"}
                              onClick={() => toggleDisabled(key)}
                            >
                              {disabled ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                              )}
                            </button>
                            <button
                              type="button"
                              className="p-0.5 hover:bg-red-50 text-red-500 rounded"
                              title="Delete/Hide"
                              onClick={() => deleteSection(key)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                  {/* Plus add zone */}
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full border-2 border-dashed border-slate-300 hover:border-black rounded-[6px] py-1.5 flex items-center justify-center text-slate-400 hover:text-black transition-colors"
                      onClick={() => setAddSectionColumn(addSectionColumn === 'right' ? null : 'right')}
                    >
                      <Plus size={14} />
                    </button>
                    {addSectionColumn === 'right' && (
                      <div className="absolute left-0 bottom-full mb-1 w-full bg-white border-2 border-black rounded-[6px] shadow-[3px_3px_0_#000] z-[100] max-h-[150px] overflow-y-auto">
                        {disabledSections.length === 0 ? (
                          <div className="p-2 text-[10px] text-slate-400 text-center">No hidden sections</div>
                        ) : (
                          disabledSections.map(k => (
                            <button
                              key={k}
                              type="button"
                              className="w-full px-2.5 py-1.5 text-left text-[11px] font-bold hover:bg-[#6d28d9] hover:text-white transition-colors border-b border-slate-100 last:border-b-0 flex items-center gap-1.5"
                              onClick={() => {
                                toggleDisabled(k);
                                set(d => ({
                                  ...d,
                                  customization: {
                                    ...d.customization,
                                    sectionColumnAssignment: {
                                      ...(d.customization.sectionColumnAssignment ?? {}),
                                      [k]: 'right'
                                    }
                                  }
                                }));
                                setAddSectionColumn(null);
                              }}
                            >
                              <SectionIcon section={k} size={11} /> {getLabel(k)}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Section editor ────────────────────────────────────────────────────── */
type SEProps = {
  sectionKey: SectionKey;
  resume: ResumeData;
  update: (fn: (d: ResumeData) => ResumeData) => void;
  field: (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { textarea?: boolean; rows?: number; type?: string; rich?: boolean },
  ) => React.ReactNode;
  listEditor: <T>(cfg: {
    items: T[];
    onAdd: () => void;
    onRemove: (i: number) => void;
    getLabel: (item: T, i: number) => string;
    render: (item: T, i: number) => React.ReactNode;
  }) => React.ReactNode;
};

function SectionEditor({
  sectionKey,
  resume,
  update,
  field,
  listEditor,
}: SEProps) {
  const s = resume.sections;
  const upd = update;

  if (sectionKey === "headerFooter")
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {field("Document title", resume.headerFooter.documentTitle, (v) =>
          upd((d) => ({
            ...d,
            headerFooter: { ...d.headerFooter, documentTitle: v },
          })),
        )}
        {field("Language", resume.headerFooter.language, (v) =>
          upd((d) => ({
            ...d,
            headerFooter: { ...d.headerFooter, language: v },
          })),
        )}
        {field("Footer text", resume.headerFooter.footerText, (v) =>
          upd((d) => ({
            ...d,
            headerFooter: { ...d.headerFooter, footerText: v },
          })),
        )}
        <label className="field">
          <span>Show page numbers</span>
          <button
            type="button"
            className={`nb-toggle ${resume.headerFooter.showPageNumbers ? "nb-toggle-on" : "nb-toggle-off"}`}
            onClick={() =>
              upd((d) => ({
                ...d,
                headerFooter: {
                  ...d.headerFooter,
                  showPageNumbers: !d.headerFooter.showPageNumbers,
                },
              }))
            }
          >
            {resume.headerFooter.showPageNumbers ? "ON" : "OFF"}
          </button>
        </label>
      </div>
    );

  if (sectionKey === "personalDetails")
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {field("Full name", resume.personalDetails.fullName, (v) =>
          upd((d) => ({
            ...d,
            personalDetails: { ...d.personalDetails, fullName: v },
          })),
        )}
        {field("Professional title", resume.personalDetails.title, (v) =>
          upd((d) => ({
            ...d,
            personalDetails: { ...d.personalDetails, title: v },
          })),
        )}
        {field(
          "Email",
          resume.personalDetails.email,
          (v) =>
            upd((d) => ({
              ...d,
              personalDetails: { ...d.personalDetails, email: v },
            })),
          { type: "email" },
        )}
        {field("Phone", resume.personalDetails.phone, (v) =>
          upd((d) => ({
            ...d,
            personalDetails: { ...d.personalDetails, phone: v },
          })),
        )}
        {field("Location", resume.personalDetails.location, (v) =>
          upd((d) => ({
            ...d,
            personalDetails: { ...d.personalDetails, location: v },
          })),
        )}
        {field("Website", resume.personalDetails.website, (v) =>
          upd((d) => ({
            ...d,
            personalDetails: { ...d.personalDetails, website: v },
          })),
        )}
        <div className="field sm:col-span-2">
          <span>Profile photo</span>
          <label className="nb-upload cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () =>
                  upd((d) => ({
                    ...d,
                    personalDetails: {
                      ...d.personalDetails,
                      photo:
                        typeof reader.result === "string" ? reader.result : "",
                    },
                  }));
                reader.readAsDataURL(file);
              }}
            />
            <div>
              <p className="text-sm font-bold">Click to upload</p>
              <p className="text-xs text-slate-500">PNG, JPG or WebP</p>
            </div>
          </label>
          {resume.personalDetails.photo ? (
            <div className="mt-2 flex items-center gap-3">
              <img
                src={resume.personalDetails.photo}
                alt="Preview"
                className="h-14 w-14 rounded-full border-2 border-black object-cover"
              />
              <button
                type="button"
                className="nb-btn nb-btn-white py-1 px-2 text-xs !text-red-500 !border-red-200"
                onClick={() =>
                  upd((d) => ({
                    ...d,
                    personalDetails: { ...d.personalDetails, photo: "" },
                  }))
                }
              >
                Remove
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );

  if (sectionKey === "powerStatement")
    return (
      <>
        {field(
          "Power statement",
          s.powerStatement,
          (v) =>
            upd((d) => ({
              ...d,
              sections: { ...d.sections, powerStatement: v },
            })),
          { rich: true, rows: 3 },
        )}
      </>
    );
  if (sectionKey === "professionalSummary")
    return (
      <>
        {field(
          "Professional summary",
          s.professionalSummary,
          (v) =>
            upd((d) => ({
              ...d,
              sections: { ...d.sections, professionalSummary: v },
            })),
          { rich: true, rows: 5 },
        )}
      </>
    );

  if (sectionKey === "websites")
    return listEditor({
      items: s.websites,
      onAdd: () =>
        upd((d) => ({
          ...d,
          sections: {
            ...d.sections,
            websites: [...d.sections.websites, { label: "", value: "" }],
          },
        })),
      onRemove: (i) =>
        upd((d) => ({
          ...d,
          sections: {
            ...d.sections,
            websites: d.sections.websites.filter((_, ci) => ci !== i),
          },
        })),
      getLabel: (item, i) => item.label || `Link ${i + 1}`,
      render: (item, i) => (
        <div className="grid gap-3 sm:grid-cols-2">
          {field("Label", item.label, (v) =>
            upd((d) => ({
              ...d,
              sections: {
                ...d.sections,
                websites: d.sections.websites.map((e, ci) =>
                  ci === i ? { ...e, label: v } : e,
                ),
              },
            })),
          )}
          {field("URL", item.value, (v) =>
            upd((d) => ({
              ...d,
              sections: {
                ...d.sections,
                websites: d.sections.websites.map((e, ci) =>
                  ci === i ? { ...e, value: v } : e,
                ),
              },
            })),
          )}
        </div>
      ),
    });

  if (sectionKey === "skills")
    return listEditor({
      items: s.skills,
      onAdd: () =>
        upd((d) => ({
          ...d,
          sections: {
            ...d.sections,
            skills: [...d.sections.skills, { title: "", items: [] }],
          },
        })),
      onRemove: (i) =>
        upd((d) => ({
          ...d,
          sections: {
            ...d.sections,
            skills: d.sections.skills.filter((_, ci) => ci !== i),
          },
        })),
      getLabel: (item, i) => item.title || `Group ${i + 1}`,
      render: (item, i) => (
        <div className="grid gap-3 sm:grid-cols-2">
          {field("Category", item.title, (v) =>
            upd((d) => ({
              ...d,
              sections: {
                ...d.sections,
                skills: d.sections.skills.map((e, ci) =>
                  ci === i ? { ...e, title: v } : e,
                ),
              },
            })),
          )}
          {field("Items (comma-separated)", listToCsv(item.items), (v) =>
            upd((d) => ({
              ...d,
              sections: {
                ...d.sections,
                skills: d.sections.skills.map((e, ci) =>
                  ci === i ? { ...e, items: csvToList(v) } : e,
                ),
              },
            })),
          )}
        </div>
      ),
    });



  if (sectionKey === "education")
    return listEditor({
      items: s.education,
      onAdd: () =>
        upd((d) => ({
          ...d,
          sections: {
            ...d.sections,
            education: [
              ...d.sections.education,
              {
                institution: "",
                degree: "",
                location: "",
                startDate: "",
                endDate: "",
                details: "",
              },
            ],
          },
        })),
      onRemove: (i) =>
        upd((d) => ({
          ...d,
          sections: {
            ...d.sections,
            education: d.sections.education.filter((_, ci) => ci !== i),
          },
        })),
      getLabel: (item, i) =>
        item.degree || item.institution || `Education ${i + 1}`,
      render: (item, i) => (
        <div className="grid gap-3 sm:grid-cols-2">
          {field("Institution", item.institution, (v) =>
            upd((d) => ({
              ...d,
              sections: {
                ...d.sections,
                education: d.sections.education.map((e, ci) =>
                  ci === i ? { ...e, institution: v } : e,
                ),
              },
            })),
          )}
          {field("Degree", item.degree, (v) =>
            upd((d) => ({
              ...d,
              sections: {
                ...d.sections,
                education: d.sections.education.map((e, ci) =>
                  ci === i ? { ...e, degree: v } : e,
                ),
              },
            })),
          )}
          {field("Location", item.location, (v) =>
            upd((d) => ({
              ...d,
              sections: {
                ...d.sections,
                education: d.sections.education.map((e, ci) =>
                  ci === i ? { ...e, location: v } : e,
                ),
              },
            })),
          )}
          {DateField({
            label: "Start date",
            value: item.startDate,
            onChange: (v) =>
              upd((d) => ({
                ...d,
                sections: {
                  ...d.sections,
                  education: d.sections.education.map((e, ci) =>
                    ci === i ? { ...e, startDate: v } : e,
                  ),
                },
              })),
          })}
          {DateField({
            label: "End date",
            value: item.endDate,
            onChange: (v) =>
              upd((d) => ({
                ...d,
                sections: {
                  ...d.sections,
                  education: d.sections.education.map((e, ci) =>
                    ci === i ? { ...e, endDate: v } : e,
                  ),
                },
              })),
            isEndDate: true,
          })}
          <div className="sm:col-span-2">
            {field(
              "Details",
              item.details,
              (v) =>
                upd((d) => ({
                  ...d,
                  sections: {
                    ...d.sections,
                    education: d.sections.education.map((e, ci) =>
                      ci === i ? { ...e, details: v } : e,
                    ),
                  },
                })),
              { rich: true, rows: 2 },
            )}
          </div>
        </div>
      ),
    });

  if (sectionKey === "workHistory")
    return listEditor({
      items: s.workHistory,
      onAdd: () =>
        upd((d) => ({
          ...d,
          sections: {
            ...d.sections,
            workHistory: [
              ...d.sections.workHistory,
              {
                company: "",
                role: "",
                location: "",
                startDate: "",
                endDate: "",
                summary: "",
                highlights: [],
              },
            ],
          },
        })),
      onRemove: (i) =>
        upd((d) => ({
          ...d,
          sections: {
            ...d.sections,
            workHistory: d.sections.workHistory.filter((_, ci) => ci !== i),
          },
        })),
      getLabel: (item, i) => item.role || item.company || `Work ${i + 1}`,
      render: (item, i) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field">
            <span><Briefcase size={14} className="inline-block -mt-0.5" /> Role</span>
            <input
              className="nb-input"
              value={item.role}
              onChange={(evt) =>
                upd((d) => ({
                  ...d,
                  sections: {
                    ...d.sections,
                    workHistory: d.sections.workHistory.map((e, ci) =>
                      ci === i ? { ...e, role: evt.target.value } : e,
                    ),
                  },
                }))
              }
            />
          </label>
          <label className="field">
            <span><Building2 size={14} className="inline-block -mt-0.5" /> Company</span>
            <input
              className="nb-input"
              value={item.company}
              onChange={(evt) =>
                upd((d) => ({
                  ...d,
                  sections: {
                    ...d.sections,
                    workHistory: d.sections.workHistory.map((e, ci) =>
                      ci === i ? { ...e, company: evt.target.value } : e,
                    ),
                  },
                }))
              }
            />
          </label>
          <label className="field">
            <span><MapPin size={14} className="inline-block -mt-0.5" /> Location</span>
            <input
              className="nb-input"
              value={item.location}
              onChange={(evt) =>
                upd((d) => ({
                  ...d,
                  sections: {
                    ...d.sections,
                    workHistory: d.sections.workHistory.map((e, ci) =>
                      ci === i ? { ...e, location: evt.target.value } : e,
                    ),
                  },
                }))
              }
            />
          </label>
          {DateField({
            label: "Start date",
            value: item.startDate,
            onChange: (v) =>
              upd((d) => ({
                ...d,
                sections: {
                  ...d.sections,
                  workHistory: d.sections.workHistory.map((e, ci) =>
                    ci === i ? { ...e, startDate: v } : e,
                  ),
                },
              })),
          })}
          {DateField({
            label: "End date",
            value: item.endDate,
            onChange: (v) =>
              upd((d) => ({
                ...d,
                sections: {
                  ...d.sections,
                  workHistory: d.sections.workHistory.map((e, ci) =>
                    ci === i ? { ...e, endDate: v } : e,
                  ),
                },
              })),
            isEndDate: true,
          })}
          <div className="sm:col-span-2">
            {field(
              "Summary",
              item.summary,
              (v) =>
                upd((d) => ({
                  ...d,
                  sections: {
                    ...d.sections,
                    workHistory: d.sections.workHistory.map((e, ci) =>
                      ci === i ? { ...e, summary: v } : e,
                    ),
                  },
                })),
              { rich: true, rows: 2 },
            )}
          </div>

        </div>
      ),
    });

  if (sectionKey === "projects")
    return listEditor({
      items: s.projects,
      onAdd: () =>
        upd((d) => ({
          ...d,
          sections: {
            ...d.sections,
            projects: [
              ...d.sections.projects,
              { name: "", description: "", technologies: "", startDate: "", endDate: "" },
            ],
          },
        })),
      onRemove: (i) =>
        upd((d) => ({
          ...d,
          sections: {
            ...d.sections,
            projects: d.sections.projects.filter((_, ci) => ci !== i),
          },
        })),
      getLabel: (item, i) => item.name || `Project ${i + 1}`,
      render: (item, i) => (
        <div className="grid gap-3 sm:grid-cols-2">
          {field("Name", item.name, (v) =>
            upd((d) => ({
              ...d,
              sections: {
                ...d.sections,
                projects: d.sections.projects.map((e, ci) =>
                  ci === i ? { ...e, name: v } : e,
                ),
              },
            })),
          )}
          {DateField({
            label: "Start date",
            value: item.startDate,
            onChange: (v) =>
              upd((d) => ({
                ...d,
                sections: {
                  ...d.sections,
                  projects: d.sections.projects.map((e, ci) =>
                    ci === i ? { ...e, startDate: v } : e,
                  ),
                },
              })),
          })}
          {DateField({
            label: "End date",
            value: item.endDate,
            onChange: (v) =>
              upd((d) => ({
                ...d,
                sections: {
                  ...d.sections,
                  projects: d.sections.projects.map((e, ci) =>
                    ci === i ? { ...e, endDate: v } : e,
                  ),
                },
              })),
            isEndDate: true,
          })}
          <div className="sm:col-span-2">
            {field(
              "Description",
              item.description,
              (v) =>
                upd((d) => ({
                  ...d,
                  sections: {
                    ...d.sections,
                    projects: d.sections.projects.map((e, ci) =>
                      ci === i ? { ...e, description: v } : e,
                    ),
                  },
                })),
              { rich: true, rows: 2 },
            )}
          </div>
          <div className="sm:col-span-2">
            {field("Technologies", item.technologies, (v) =>
              upd((d) => ({
                ...d,
                sections: {
                  ...d.sections,
                  projects: d.sections.projects.map((e, ci) =>
                    ci === i ? { ...e, technologies: v } : e,
                  ),
                },
              })),
            )}
          </div>
</div>
      ),
    });

  if (sectionKey === "languages")
    return listEditor({
      items: s.languages,
      onAdd: () =>
        upd((d) => ({
          ...d,
          sections: {
            ...d.sections,
            languages: [...d.sections.languages, { name: "", level: "" }],
          },
        })),
      onRemove: (i) =>
        upd((d) => ({
          ...d,
          sections: {
            ...d.sections,
            languages: d.sections.languages.filter((_, ci) => ci !== i),
          },
        })),
      getLabel: (item, i) => item.name || `Language ${i + 1}`,
      render: (item, i) => (
        <div className="grid gap-3 sm:grid-cols-2">
          {field("Language", item.name, (v) =>
            upd((d) => ({
              ...d,
              sections: {
                ...d.sections,
                languages: d.sections.languages.map((e, ci) =>
                  ci === i ? { ...e, name: v } : e,
                ),
              },
            })),
          )}
          <label className="field">
            <span>Proficiency</span>
            <select
              value={item.level}
              onChange={(e) =>
                upd((d) => ({
                  ...d,
                  sections: {
                    ...d.sections,
                    languages: d.sections.languages.map((l, ci) =>
                      ci === i ? { ...l, level: e.target.value } : l,
                    ),
                  },
                }))
              }
              className="nb-input"
            >
              <option value="">Select level</option>
              <option value="Elementary">Elementary</option>
              <option value="Limited working">Limited working</option>
              <option value="Professional working">Professional working</option>
              <option value="Full professional">Full professional</option>
              <option value="Native/Bilingual">Native/Bilingual</option>
            </select>
          </label>
        </div>
      ),
    });

  if (sectionKey === "hobbies")
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">
          Enter hobbies separated by commas (e.g., Illustration, Cycling, Travel)
        </p>
        <label className="field">
          <span>Hobbies</span>
          <input
            type="text"
            value={s.hobbies.map((h) => h.name).join(", ")}
            onChange={(e) =>
              upd((d) => ({
                ...d,
                sections: {
                  ...d.sections,
                  hobbies: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((name) => ({ name })),
                },
              }))
            }
            placeholder="Illustration, Cycling, Travel"
            className="nb-input"
          />
        </label>
      </div>
    );

  if (sectionKey === "internships")
    return listEditor({
      items: s.internships,
      onAdd: () =>
        upd((d) => ({
          ...d,
          sections: {
            ...d.sections,
            internships: [
              ...d.sections.internships,
              { company: "", role: "", startDate: "", endDate: "", description: "" },
            ],
          },
        })),
      onRemove: (i) =>
        upd((d) => ({
          ...d,
          sections: {
            ...d.sections,
            internships: d.sections.internships.filter((_, ci) => ci !== i),
          },
        })),
      getLabel: (item, i) => item.role || item.company || `Internship ${i + 1}`,
      render: (item, i) => (
        <div className="grid gap-3 sm:grid-cols-2">
          {field("Role", item.role, (v) =>
            upd((d) => ({
              ...d,
              sections: {
                ...d.sections,
                internships: d.sections.internships.map((e, ci) =>
                  ci === i ? { ...e, role: v } : e,
                ),
              },
            })),
          )}
          {field("Company", item.company, (v) =>
            upd((d) => ({
              ...d,
              sections: {
                ...d.sections,
                internships: d.sections.internships.map((e, ci) =>
                  ci === i ? { ...e, company: v } : e,
                ),
              },
            })),
          )}
          {DateField({
            label: "Start date",
            value: item.startDate,
            onChange: (v) =>
              upd((d) => ({
                ...d,
                sections: {
                  ...d.sections,
                  internships: d.sections.internships.map((e, ci) =>
                    ci === i ? { ...e, startDate: v } : e,
                  ),
                },
              })),
          })}
          {DateField({
            label: "End date",
            value: item.endDate,
            onChange: (v) =>
              upd((d) => ({
                ...d,
                sections: {
                  ...d.sections,
                  internships: d.sections.internships.map((e, ci) =>
                    ci === i ? { ...e, endDate: v } : e,
                  ),
                },
              })),
            isEndDate: true,
          })}
          <div className="sm:col-span-2">
            {field(
              "Description",
              item.description,
              (v) =>
                upd((d) => ({
                  ...d,
                  sections: {
                    ...d.sections,
                    internships: d.sections.internships.map((e, ci) =>
                      ci === i ? { ...e, description: v } : e,
                    ),
                  },
                })),
              { rich: true, rows: 2 },
            )}
          </div>
        </div>
      ),
    });

  return (
    <GenericListEditor
      sectionKey={sectionKey}
      resume={resume}
      update={upd}
      field={field}
      listEditor={listEditor}
    />
  );
}

/* ─── Shared controls ───────────────────────────────────────────────────── */
function CSlider({
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid items-center gap-1.5 grid-cols-[1fr_auto] sm:grid-cols-[160px_1fr_64px]">
      <span className="text-xs font-semibold text-slate-700 col-span-2 sm:col-span-1">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="nb-value-box">{display}</div>
    </div>
  );
}

function ChoiceGrid({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="kicker mb-2">{title}</p>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))`,
        }}
      >
        {options.map(([v, label]) => (
          <button
            key={v}
            type="button"
            className={`nb-choice ${value === v ? "nb-choice-active" : ""}`}
            onClick={() => onChange(v)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
