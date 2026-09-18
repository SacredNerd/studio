import React from "react";
import type { SectionKey } from "../data";

export type IconProps = { size?: number; className?: string; style?: React.CSSProperties };

// Factory: captures static SVG children, applies size/className/style at render time.
function mk(content: React.ReactNode, defaultSize = 24) {
  return ({ size = defaultSize, className, style }: IconProps): React.ReactElement => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: 'inline-block', width: size, height: size, verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      {content}
    </svg>
  );
}

/* ─── Section icons ─────────────────────────────────────────────────────── */

/** Document with lines — headerFooter */
export const FileText = mk(
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </>,
);

/** Person silhouette — personalDetails */
export const User = mk(
  <>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>,
);

/** Lightning bolt — powerStatement */
export const Zap = mk(
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
);

/** Left-aligned text lines — professionalSummary */
export const AlignLeft = mk(
  <>
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="15" y1="12" x2="3" y2="12" />
    <line x1="17" y1="18" x2="3" y2="18" />
  </>,
);

/** Chain links — websites */
export const Link = mk(
  <>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </>,
);

/** 5-point star outline — skills */
export const Star = mk(
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
);

/** Chip/processor square — technicalProficiencies */
export const Cpu = mk(
  <>
    <rect x="4" y="4" width="16" height="16" rx="1" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="2" x2="9" y2="4" />
    <line x1="15" y1="2" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="22" />
    <line x1="15" y1="20" x2="15" y2="22" />
    <line x1="20" y1="9" x2="22" y2="9" />
    <line x1="20" y1="15" x2="22" y2="15" />
    <line x1="2" y1="9" x2="4" y2="9" />
    <line x1="2" y1="15" x2="4" y2="15" />
  </>,
);

/** Mortarboard — education */
export const GraduationCap = mk(
  <>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </>,
);

/** Open folder — projects */
export const FolderOpen = mk(
  <>
    <path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h9a2 2 0 0 1 2 2v1" />
    <path d="M2 19l3-7h18l-3 7H2z" />
  </>,
);

/** Briefcase — workHistory */
export const Briefcase = mk(
  <>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </>,
);

/** Trophy cup — achievements */
export const Trophy = mk(
  <>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </>,
);

/** Ribbon award — accomplishments */
export const Award = mk(
  <>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </>,
);

/** Office building — internships */
export const Building2 = mk(
  <>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
  </>,
);

/** List with row icons — customSimple */
export const LayoutList = mk(
  <>
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <path d="M14 4h7M14 9h7M14 15h7M14 20h7" />
  </>,
);

/** Dashboard grid — customAdvanced */
export const LayoutDashboard = mk(
  <>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </>,
);

/** Open book — professionalTraining */
export const BookOpen = mk(
  <>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </>,
);

/** Circle with plus — additionalExperience */
export const PlusCircle = mk(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </>,
);

/** Heart — volunteering */
export const Heart = mk(
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
);

/** Globe — languages */
export const Globe = mk(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </>,
);

/** Artist's palette — hobbies */
export const Palette = mk(
  <>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    <circle cx="6.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="9.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
  </>,
);

/** Two people — references */
export const Users = mk(
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
);

/** Medal with ribbon top — awards */
export const Medal = mk(
  <>
    <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 3.05A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.1a2 2 0 0 1 .13 2.2L16.79 15" />
    <path d="M11 12 5.12 2.2" />
    <path d="M13 12l5.88-9.8" />
    <path d="M8 7h8" />
    <circle cx="12" cy="17" r="5" />
    <path d="M12 12v5" />
  </>,
);

/** Badge with checkmark — certifications */
export const BadgeCheck = mk(
  <>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </>,
);

/** Connected nodes — affiliations */
export const Network = mk(
  <>
    <circle cx="12" cy="5" r="3" />
    <circle cx="3" cy="19" r="3" />
    <circle cx="21" cy="19" r="3" />
    <line x1="12" y1="8" x2="5" y2="16" />
    <line x1="12" y1="8" x2="19" y2="16" />
    <line x1="6" y1="19" x2="18" y2="19" />
  </>,
);

/* ─── Utility icons ─────────────────────────────────────────────────────── */

export const ChevronDown = mk(<polyline points="6 9 12 15 18 9" />, 16);

export const ChevronRight = mk(<polyline points="9 18 15 12 9 6" />);

export const Plus = mk(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>,
);

export const Trash2 = mk(
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </>,
);

export const Copy = mk(
  <>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>,
);

export const Edit3 = mk(
  <>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </>,
);

export const Download = mk(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </>,
);

/** Drag handle: 6 filled dots in a 2×3 grid */
export const Grip = mk(
  <>
    <circle cx="9" cy="8" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="8" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="9" cy="16" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="16" r="1.5" fill="currentColor" stroke="none" />
  </>,
);

export const ArrowLeft = mk(
  <>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </>,
);

export const Check = mk(<polyline points="20 6 9 17 4 12" />);

export const X = mk(
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>,
);

export const RotateCcw = mk(
  <>
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </>,
);

export const Printer = mk(
  <>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </>
);

export const MapPin = mk(
  <>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </>,
);

export const Phone = mk(
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
);

export const Mail = mk(
  <>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </>,
);

export const Linkedin = mk(
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </>,
);

/* ─── SectionIcon ───────────────────────────────────────────────────────── */

const SECTION_ICON_MAP: Record<
  SectionKey,
  (props: IconProps) => React.ReactElement
> = {
  headerFooter: FileText,
  personalDetails: User,
  powerStatement: Zap,
  professionalSummary: AlignLeft,
  websites: Link,
  skills: Star,
  technicalProficiencies: Cpu,
  education: GraduationCap,
  projects: FolderOpen,
  workHistory: Briefcase,
  achievements: Trophy,
  accomplishments: Award,
  internships: Building2,
  customSimple: LayoutList,
  customAdvanced: LayoutDashboard,
  professionalTraining: BookOpen,
  additionalExperience: PlusCircle,
  volunteering: Heart,
  languages: Globe,
  hobbies: Palette,
  references: Users,
  awards: Medal,
  certifications: BadgeCheck,
  affiliations: Network,
};

type SectionIconProps = IconProps & { section: SectionKey };

export function SectionIcon({
  section,
  ...rest
}: SectionIconProps): React.ReactElement {
  const Icon = SECTION_ICON_MAP[section];
  return <Icon {...rest} />;
}
