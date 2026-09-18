import { useEffect, useRef } from "react";
import type { ResumeData, SectionKey } from "../data";
import { fontWeightValue } from "../utils/helpers";
import { MapPin, Phone, Mail, Globe, SectionIcon } from "./Icons";

type ResumePreviewProps = {
  resume: ResumeData;
  activeTemplate: string;
};

// ── helpers ──────────────────────────────────────────────────────────────────

function shown(resume: ResumeData, key: SectionKey): boolean {
  return !(resume.customization.disabledSections ?? []).includes(key);
}

/** A section renders only when it is both present in the order AND not hidden. */
function active(resume: ResumeData, key: SectionKey): boolean {
  const order = resume.customization.sectionOrder ?? DEFAULT_ORDER;
  return order.includes(key) && shown(resume, key);
}

function ensureUrl(url: string): string {
  if (!url) return '#';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.includes('@')) return `mailto:${url}`;
  return `https://${url}`;
}

/** Format a raw date string according to the selected dateFormat option */
function formatDate(
  raw: string,
  dateFormat: ResumeData["customization"]["dateFormat"]
): string {
  if (!raw) return "";
  if (raw.toLowerCase() === "present") return "Present";
  // Handle "YYYY-MM" format explicitly
  const ym = raw.match(/^(\d{4})-(\d{2})$/);
  if (ym) {
    const year = parseInt(ym[1], 10);
    const month = parseInt(ym[2], 10);
    if (dateFormat === "Year only") return String(year);
    if (dateFormat === "Numeric (MM.YYYY)") return `${String(month).padStart(2, "0")}.${year}`;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[month - 1] || ""} ${year}`;
  }
  // Handle "YYYY" year-only
  const yOnly = raw.match(/^(\d{4})$/);
  if (yOnly) {
    if (dateFormat === "Year only") return raw;
    return raw; // Can't show month if we don't have it
  }
  // Try to parse a date from the raw string
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime()) && raw.length > 4) {
    if (dateFormat === "Numeric (MM.YYYY)") {
      return `${String(parsed.getMonth() + 1).padStart(2, "0")}.${parsed.getFullYear()}`;
    }
    // Short Name (Jan YYYY) — default
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parsed.getMonth()]} ${parsed.getFullYear()}`;
  }
  // Fallback: return raw string if we can't parse it
  return raw;
}

function templateSupportsPhoto(templateKey: string): boolean {
  const noPhotoTemplates = [
    "classic-clear",
    "steady-form",
    "precision-line",
    "editorial-rule",
    "true-blue",
    "even-line",
    "fine-line",
    "refined",
    "split-rule"
  ];
  return !noPhotoTemplates.includes(templateKey);
}

function templateSupportsIcons(templateKey: string): boolean {
  const noIconTemplates = [
    "precision-line",
    "editorial-rule",
    "classic-clear",
    "steady-form"
  ];
  return !noIconTemplates.includes(templateKey);
}

function getSectionColumn(key: SectionKey, resume: ResumeData): "left" | "right" {
  const assignment = resume.customization.sectionColumnAssignment?.[key];
  if (assignment) return assignment;
  
  // Default assignments for 2-column templates
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

function RichText({ text }: { text: string }) {
  if (!text) return null;
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return (
      <div
        className="resume-rich-content"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }
  return <p>{text}</p>;
}

function pageStyle(): React.CSSProperties {
  return {
    padding: "var(--margin-vertical) var(--margin-horizontal)",
    fontFamily: "var(--body-font, Arial), sans-serif",
    fontSize: "var(--font-size-body, 12px)",
    lineHeight: "var(--line-height, 1.4)",
  };
}

// ── shared blocks ─────────────────────────────────────────────────────────────

function getSectionKeyFromTitle(title: string): SectionKey | undefined {
  const map: Record<string, SectionKey> = {
    "Work History": "workHistory",
    "Education": "education",
    "Projects": "projects",
    "Skills": "skills",
    "Achievements": "achievements",
    "Languages": "languages",
    "Hobbies": "hobbies",
    "Certifications": "certifications",
    "Awards": "awards",
    "Affiliations": "affiliations",
    "References": "references",
    "Professional Training": "professionalTraining",
    "Volunteering": "volunteering",
    "Additional Experience": "additionalExperience",
    "Profile": "professionalSummary",
    "Power Statement": "powerStatement"
  };
  return map[title];
}

function Section({
  title,
  accent,
  template,
  children,
}: {
  title: string;
  accent: string;
  template?: string;
  children: React.ReactNode;
}) {
  let titleStyle: React.CSSProperties = {
    fontFamily: "var(--heading-font, Arial), sans-serif",
    fontSize: "var(--font-size-section, 10px)",
    fontWeight: "var(--section-weight, 700)",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: accent,
    fontStyle: "var(--section-style, normal)",
    textDecoration: "var(--section-decoration, none)",
  };

  let borderStyle = `1.5px solid ${accent}`;
  let hasBorder = true;
  let borderPaddingBottom = 5;

  if (template === "classic-clear" || template === "editorial-rule") {
    borderStyle = `1px solid ${accent}`;
  } else if (template === "steady-form") {
    titleStyle = { ...titleStyle, textAlign: "center", backgroundColor: "rgba(0,0,0,0.05)", padding: "4px 8px", color: accent };
    hasBorder = false;
  } else if (template === "precision-line" || template === "fine-line") {
    titleStyle = { ...titleStyle, textAlign: template === "precision-line" ? "center" : "left" };
    borderStyle = `1px solid ${accent}`;
  } else if (template === "true-blue") {
    titleStyle = { ...titleStyle, color: accent };
    borderStyle = `2px solid ${accent}`;
  } else if (template === "even-line") {
    borderStyle = `2px solid #e2e8f0`;
    borderPaddingBottom = 6;
  } else if (template === "corporate" || template === "vivid") {
    if (template === "vivid") {
      titleStyle = {
        ...titleStyle,
        display: "inline-block",
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        padding: "3px 10px",
        borderRadius: "3px",
        fontSize: "var(--font-size-section, 10px)",
        fontWeight: 700,
        letterSpacing: "0.12em",
      };
    }
    hasBorder = false;
  }

  const sectionKey = getSectionKeyFromTitle(title);
  const showIcon = template === "split-rule" && sectionKey;
  const isCorporate = template === "corporate";

  if (template === "funky") {
    // Custom filled icons for funky
    const awardPath = <path d="M12 2a5 5 0 0 0-5 5c0 2.22 1.45 4.12 3.46 4.79L8 22l4-2 4 2-2.46-10.21C15.55 11.12 17 9.22 17 7a5 5 0 0 0-5-5z" />;
    const funkyIcons: Record<string, JSX.Element> = {
      professionalSummary: <path d="M12 7a4 4 0 110-8 4 4 0 010 8zM4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" />,
      powerStatement: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
      workHistory: <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H2v14h20V7h-6z" />,
      education: <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9z" />,
      skills: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
      technicalProficiencies: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
      certifications: awardPath,
      awards: awardPath,
      achievements: awardPath,
      projects: <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />,
      languages: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />,
      hobbies: <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2zm-5.5 9.5c-.83 0-1.5-.67-1.5-1.5S5.67 8.5 6.5 8.5 8 9.17 8 10s-.67 1.5-1.5 1.5zm3-4c-.83 0-1.5-.67-1.5-1.5S8.67 4.5 9.5 4.5s1.5.67 1.5 1.5S10.33 7.5 9.5 7.5zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4.5 14.5 4.5s1.5.67 1.5 1.5S15.33 7.5 14.5 7.5zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8.5 17.5 8.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />,
      references: <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />,
      websites: <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />,
      professionalTraining: <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />,
      volunteering: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />,
      additionalExperience: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
    };
    
    titleStyle = {
      fontFamily: "var(--heading-font, Arial), sans-serif",
      fontSize: "var(--font-size-section, 14px)",
      fontWeight: 800,
      letterSpacing: "0.08em",
      textTransform: "uppercase" as const,
      color: "#222",
    };

    const iconPath = sectionKey ? funkyIcons[sectionKey] : funkyIcons.projects;

    return (
      <section style={{ marginBottom: "var(--section-gap, 16px)" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
          {iconPath && (
            <svg viewBox="0 0 24 24" fill={accent} style={{ width: 20, height: 20, marginRight: 8, flexShrink: 0 }}>
              {iconPath}
            </svg>
          )}
          <div style={{ ...titleStyle }}>{title}</div>
        </div>
        <div style={{ borderTop: `1px solid ${accent}55`, marginBottom: "var(--title-gap, 10px)" }} />
        {children}
      </section>
    );
  }

  if (isCorporate) {
    return (
      <section style={{ marginBottom: "var(--section-gap, 12px)" }}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 8, marginBottom: "var(--title-gap, 6px)" }}>
          <div style={{ width: 3, backgroundColor: accent, borderRadius: 1, flexShrink: 0 }} />
          <div style={{ ...titleStyle }}>{title}</div>
        </div>
        {children}
      </section>
    );
  }

  return (
    <section style={{ marginBottom: "var(--section-gap, 12px)" }}>
      <div style={{ display: "block", marginBottom: "var(--title-gap, 6px)" }}>
        <div style={{ ...titleStyle }}>
          {showIcon && <span style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'middle', transform: 'translateY(-1px)' }}><SectionIcon section={sectionKey!} size={14} /></span>}
          <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>{title}</span>
        </div>
        {hasBorder && (
          <div style={{ 
            borderTop: borderStyle, 
            marginTop: borderPaddingBottom,
            height: 0,
            overflow: "hidden"
          }} />
        )}
      </div>
      {children}
    </section>
  );
}

function Stack({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: "var(--content-gap, 10px)" }}>
      {children}
    </div>
  );
}

function Footer({ footerText }: { footerText: string }) {
  if (!footerText) return null;
  return (
    <footer
      style={{
        marginTop: "var(--header-footer-space, 20px)",
        paddingTop: 8,
        borderTop: "1px solid #e2e8f0",
        textAlign: "center",
        fontSize: "0.8em",
        color: "#94a3b8",
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      {footerText}
    </footer>
  );
}

// ── data section blocks ─────────────────────────────────────────────────────

function WorkBlock({ resume, isSidebar = false }: { resume: ResumeData; isSidebar?: boolean }) {
  if (!shown(resume, "workHistory")) return null;
  const items = resume.sections.workHistory.filter((x) => x.company || x.role);
  if (!items.length) return null;
  const accent = resume.customization.primaryColor;
  const headingColor = isSidebar ? "#ffffff" : "var(--primary-text-color)";
  const subColor = isSidebar ? "rgba(255,255,255,0.85)" : "var(--secondary-text-color)";
  const dateColor = isSidebar ? "rgba(255,255,255,0.7)" : "var(--secondary-text-color)";
  const SectionComp = isSidebar ? SideSection : Section;
  const sectionAccent = isSidebar ? "rgba(255,255,255,0.6)" : accent;
  return (
    <SectionComp title="Work History" accent={sectionAccent} template={resume.customization.selectedTemplate}>
      <div style={isSidebar ? { color: "rgba(255,255,255,0.95)" } : undefined}>
      <Stack>
        {items.map((item, i) => (
          <article
            key={i}
            style={{ display: "grid", gap: "var(--inner-padding, 2px)" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <div style={{ display: "grid", gap: "var(--inner-padding, 2px)" }}>
                <div
                  style={{
                    fontWeight: "var(--subheading-weight, 600)",
                    fontFamily: "var(--heading-font, Arial)",
                    color: headingColor,
                  }}
                >
                  {item.role}
                </div>
                <div style={{ color: subColor }}>
                  {[item.company, item.location].filter(Boolean).join(" • ")}
                </div>
              </div>
              <div
                style={{
                  color: dateColor,
                  fontSize: "0.85em",
                  whiteSpace: "nowrap",
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {[formatDate(item.startDate, resume.customization.dateFormat), formatDate(item.endDate, resume.customization.dateFormat)].filter(Boolean).join(" – ")}
              </div>
            </div>
            {item.summary ? <RichText text={item.summary} /> : null}

          </article>
        ))}
      </Stack>
      </div>
    </SectionComp>
  );
}

function EducationBlock({ resume, isSidebar = false }: { resume: ResumeData; isSidebar?: boolean }) {
  if (!shown(resume, "education")) return null;
  const items = resume.sections.education.filter(
    (x) => x.institution || x.degree,
  );
  if (!items.length) return null;
  const accent = resume.customization.primaryColor;
  const isInline = resume.customization.educationLayout === "inline";
  const df = resume.customization.dateFormat;
  const headingColor = isSidebar ? "#ffffff" : "var(--primary-text-color)";
  const subColor = isSidebar ? "rgba(255,255,255,0.85)" : "var(--secondary-text-color)";
  const dateColor = isSidebar ? "rgba(255,255,255,0.7)" : "var(--secondary-text-color)";
  const SectionComp = isSidebar ? SideSection : Section;
  const sectionAccent = isSidebar ? "rgba(255,255,255,0.6)" : accent;
  return (
    <SectionComp title="Education" accent={sectionAccent} template={resume.customization.selectedTemplate}>
      <div style={isSidebar ? { color: "rgba(255,255,255,0.95)" } : undefined}>
      <Stack>
        {items.map((item, i) => {
          const primary =
            resume.customization.showEducationBy === "institution"
              ? item.institution
              : item.degree;
          const secondary =
            resume.customization.showEducationBy === "institution"
              ? item.degree
              : item.institution;
          const dateStr = [formatDate(item.startDate, df), formatDate(item.endDate, df)].filter(Boolean).join(" – ");
          if (isInline) {
            return (
              <article key={i} style={{ display: "grid", gap: "var(--inner-padding, 2px)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0 8px", alignItems: "baseline" }}>
                    <span style={{ fontWeight: "var(--subheading-weight, 600)", fontFamily: "var(--heading-font, Arial)", color: headingColor }}>{primary}</span>
                    {secondary && <span style={{ color: subColor }}>{secondary}</span>}
                    {item.location && <span style={{ color: subColor, fontSize: "0.85em" }}>{item.location}</span>}
                  </div>
                  {dateStr && <span style={{ color: dateColor, fontSize: "0.85em", whiteSpace: "nowrap", flexShrink: 0 }}>{dateStr}</span>}
                </div>
                {item.details ? <RichText text={item.details} /> : null}
              </article>
            );
          }
          return (
            <article key={i} style={{ display: "grid", gap: "var(--inner-padding, 2px)" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div style={{ display: "grid", gap: "var(--inner-padding, 2px)" }}>
                  <div
                    style={{
                      fontWeight: "var(--subheading-weight, 600)",
                      fontFamily: "var(--heading-font, Arial)",
                      color: headingColor,
                    }}
                  >
                    {primary}
                  </div>
                  <div style={{ color: subColor }}>
                    {[secondary, item.location].filter(Boolean).join(" • ")}
                  </div>
                </div>
                <div
                  style={{
                    color: dateColor,
                    fontSize: "0.85em",
                    whiteSpace: "nowrap",
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {dateStr}
                </div>
              </div>
              {item.details ? <RichText text={item.details} /> : null}
            </article>
          );
        })}
      </Stack>
      </div>
    </SectionComp>
  );
}

function ProjectBlock({ resume, isSidebar = false }: { resume: ResumeData; isSidebar?: boolean }) {
  if (!shown(resume, "projects")) return null;
  const items = resume.sections.projects.filter((x) => x.name);
  if (!items.length) return null;
  const accent = resume.customization.primaryColor;
  const df = resume.customization.dateFormat;
  const headingColor = isSidebar ? "#ffffff" : "var(--primary-text-color)";
  const subColor = isSidebar ? "rgba(255,255,255,0.85)" : "var(--secondary-text-color)";
  const dateColor = isSidebar ? "rgba(255,255,255,0.7)" : "var(--secondary-text-color)";
  const SectionComp = isSidebar ? SideSection : Section;
  const sectionAccent = isSidebar ? "rgba(255,255,255,0.6)" : accent;
  return (
    <SectionComp title="Projects" accent={sectionAccent} template={resume.customization.selectedTemplate}>
      <div style={isSidebar ? { color: "rgba(255,255,255,0.95)" } : undefined}>
      <Stack>
        {items.map((item, i) => (
          <article key={i} style={{ display: "grid", gap: "var(--inner-padding, 2px)" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ display: "grid", gap: "var(--inner-padding, 2px)" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "0 8px",
                    flexWrap: "wrap",
                    alignItems: "baseline",
                  }}
                >
                  <span style={{ fontWeight: "var(--subheading-weight, 600)", fontFamily: "var(--heading-font, Arial)", color: headingColor }}>
                    {item.name}
                  </span>
                </div>
              </div>
              <div
                style={{
                  color: dateColor,
                  fontSize: "0.85em",
                  whiteSpace: "nowrap",
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {[formatDate(item.startDate, df), formatDate(item.endDate, df)].filter(Boolean).join(" – ")}
              </div>
            </div>
            {item.description ? <RichText text={item.description} /> : null}
            {item.technologies ? (
              <p style={{ color: subColor, fontSize: "0.85em", marginTop: 2 }}>
                <strong>Tech:</strong> {item.technologies}
              </p>
            ) : null}
          </article>
        ))}
      </Stack>
      </div>
    </SectionComp>
  );
}

function SkillBlock({ resume, isSidebar = false }: { resume: ResumeData; isSidebar?: boolean }) {
  const showSkills = shown(resume, "skills");
  if (!showSkills) return null;
  const groups = resume.sections.skills.filter((g) => g.title || g.items.length);
  if (!groups.length) return null;
  const accent = resume.customization.primaryColor;
  const isColumns = resume.customization.skillsLayout === "columns";
  const cols = resume.customization.skillsColumns;
  const headingColor = isSidebar ? "#ffffff" : "var(--primary-text-color)";
  const itemColor = isSidebar ? "rgba(255,255,255,0.85)" : "var(--secondary-text-color)";
  const SectionComp = isSidebar ? SideSection : Section;
  const sectionAccent = isSidebar ? "rgba(255,255,255,0.6)" : accent;
  return (
    <SectionComp title="Skills" accent={sectionAccent} template={resume.customization.selectedTemplate}>
      <div
        style={
          isColumns
            ? {
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(cols, groups.length)}, minmax(0,1fr))`,
                gap: 8,
              }
            : { display: "grid", gap: 6 }
        }
      >
        {groups.map((g, i) => (
          <div key={i}>
            {g.title && (
              <div
                style={{ fontWeight: 600, fontSize: "0.9em", marginBottom: 2, color: headingColor }}
              >
                {g.title}
              </div>
            )}
            <div style={{ color: itemColor }}>{g.items.join(" • ")}</div>
          </div>
        ))}
      </div>
    </SectionComp>
  );
}



// ── Header component ─────────────────────────────────────────────────────────

function getSectionLabel(key: SectionKey, resume: ResumeData): string {
  const customLabel = resume.customization.sectionLabels?.[key];
  if (customLabel) return customLabel;
  
  const defaults: Record<SectionKey, string> = {
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
    customSimple: "Custom Section",
    customAdvanced: "Additional Details",
    professionalTraining: "Professional Training",
    additionalExperience: "Additional Experience",
    volunteering: "Volunteering",
    languages: "Languages",
    hobbies: "Hobbies",
    references: "References",
    awards: "Awards",
    certifications: "Licenses & Certifications",
    affiliations: "Affiliations",
  };
  return defaults[key] || String(key);
}

function renderSectionByKey(key: SectionKey, resume: ResumeData, isSidebar: boolean = false): React.ReactNode {
  if (!shown(resume, key)) return null;

  const { sections, customization } = resume;
  const selectedTemplate = customization.selectedTemplate;
  const title = getSectionLabel(key, resume);

  const SectionWrapper = ({ title, children }: { title: string, children: React.ReactNode }) => {
    if (isSidebar) {
      return (
        <SideSection title={title} accent="rgba(255,255,255,0.6)" template={selectedTemplate}>
          <div style={{ color: "rgba(255,255,255,0.95)" }}>{children}</div>
        </SideSection>
      );
    }
    return (
      <Section title={title} accent={customization.primaryColor} template={selectedTemplate}>
        {children}
      </Section>
    );
  };

  switch (key) {
    case "powerStatement":
      if (!sections.powerStatement) return null;
      return (
        <SectionWrapper title={title}>
          <RichText text={sections.powerStatement} />
        </SectionWrapper>
      );
    case "professionalSummary":
      if (!sections.professionalSummary) return null;
      return (
        <SectionWrapper title={title}>
          <RichText text={sections.professionalSummary} />
        </SectionWrapper>
      );
    case "workHistory":
      return <WorkBlock resume={resume} isSidebar={isSidebar} />;
    case "projects":
      return <ProjectBlock resume={resume} isSidebar={isSidebar} />;
    case "education":
      return <EducationBlock resume={resume} isSidebar={isSidebar} />;
    case "skills":
      return <SkillBlock resume={resume} isSidebar={isSidebar} />;
    case "websites":
      return null;
    case "achievements":
      if (!sections.achievements.length) return null;
      return (
        <SectionWrapper title={title}>
          <Stack>
            {sections.achievements.map((item, i) => (
              <article key={i}>
                <div style={{ fontWeight: 600, fontFamily: "var(--heading-font, Arial)", color: isSidebar ? undefined : "var(--primary-text-color)" }}>
                  {item.title}
                </div>
                {item.description ? <RichText text={item.description} /> : null}
              </article>
            ))}
          </Stack>
        </SectionWrapper>
      );
    case "accomplishments":
      if (!sections.accomplishments.length) return null;
      return (
        <SectionWrapper title={title}>
          <Stack>
            {sections.accomplishments.map((item, i) => (
              <article key={i}>
                <div style={{ fontWeight: 600, fontFamily: "var(--heading-font, Arial)", color: isSidebar ? undefined : "var(--primary-text-color)" }}>
                  {item.title}
                </div>
                {item.description ? <RichText text={item.description} /> : null}
              </article>
            ))}
          </Stack>
        </SectionWrapper>
      );
    case "internships":
      if (!sections.internships.length) return null;
      return (
        <SectionWrapper title={title}>
          <Stack>
            {sections.internships.map((item, i) => (
              <article key={i} style={{ display: "grid", gap: "var(--inner-padding, 2px)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ display: "grid", gap: "var(--inner-padding, 2px)" }}>
                    <div style={{ fontWeight: 600, fontFamily: "var(--heading-font, Arial)", color: isSidebar ? undefined : "var(--primary-text-color)" }}>
                      {item.role}
                    </div>
                    <div style={{ color: isSidebar ? "rgba(255,255,255,0.8)" : "var(--secondary-text-color)" }}>{item.company}</div>
                  </div>
                  <div style={{ color: isSidebar ? "rgba(255,255,255,0.7)" : "var(--secondary-text-color)", fontSize: "0.85em", whiteSpace: "nowrap" }}>
                    {[formatDate(item.startDate, resume.customization.dateFormat), formatDate(item.endDate, resume.customization.dateFormat)].filter(Boolean).join(" – ")}
                  </div>
                </div>
                {item.description ? <RichText text={item.description} /> : null}
              </article>
            ))}
          </Stack>
        </SectionWrapper>
      );
    case "languages":
      if (!sections.languages.length) return null;
      return (
        <SectionWrapper title={title}>
          <div style={{ display: "flex", flexDirection: isSidebar ? "column" : "row", flexWrap: "wrap", gap: isSidebar ? 4 : "4px 16px", color: isSidebar ? "rgba(255,255,255,0.9)" : "var(--secondary-text-color)" }}>
            {sections.languages.map((l, i) => (
              <div key={i}>
                <strong style={{ color: isSidebar ? "white" : "var(--primary-text-color)" }}>{l.name}</strong>
                {l.level ? ` — ${l.level}` : ""}
              </div>
            ))}
          </div>
        </SectionWrapper>
      );
    case "hobbies":
      const hobbiesList = sections.hobbies.filter(h => h.name);
      if (!hobbiesList.length) return null;
      return (
        <SectionWrapper title={title}>
          <p style={{ color: isSidebar ? "rgba(255,255,255,0.9)" : "var(--secondary-text-color)" }}>
            {hobbiesList.map((h) => h.name).filter(Boolean).join(" • ")}
          </p>
        </SectionWrapper>
      );
    case "references":
      if (!sections.references.length) return null;
      return (
        <SectionWrapper title={title}>
          <Stack>
            {sections.references.map((r, i) => (
              <div key={i}>
                <div style={{ fontWeight: 600, color: isSidebar ? undefined : "var(--primary-text-color)" }}>{r.name}</div>
                <div style={{ color: isSidebar ? "rgba(255,255,255,0.8)" : "var(--secondary-text-color)", fontSize: "0.85em" }}>
                  {[r.title, r.contact].filter(Boolean).join(" · ")}
                </div>
              </div>
            ))}
          </Stack>
        </SectionWrapper>
      );
    case "awards":
      if (!sections.awards.length) return null;
      return (
        <SectionWrapper title={title}>
          <Stack>
            {sections.awards.map((a, i) => (
              <div key={i}>
                <div style={{ fontWeight: 600, color: isSidebar ? undefined : "var(--primary-text-color)" }}>{a.title}</div>
                <div style={{ color: isSidebar ? "rgba(255,255,255,0.8)" : "var(--secondary-text-color)", fontSize: "0.85em" }}>
                  {[a.issuer, a.date].filter(Boolean).join(" · ")}
                </div>
                {a.description ? <RichText text={a.description} /> : null}
              </div>
            ))}
          </Stack>
        </SectionWrapper>
      );
    case "certifications":
      if (!sections.certifications.length) return null;
      return (
        <SectionWrapper title={title}>
          <Stack>
            {sections.certifications.map((c, i) => (
              <div key={i}>
                <div style={{ fontWeight: 600, color: isSidebar ? undefined : "var(--primary-text-color)" }}>{c.name}</div>
                <div style={{ color: isSidebar ? "rgba(255,255,255,0.8)" : "var(--secondary-text-color)", fontSize: "0.85em" }}>
                  {[c.issuer, c.date].filter(Boolean).join(" · ")}
                </div>
              </div>
            ))}
          </Stack>
        </SectionWrapper>
      );
    case "affiliations":
      if (!sections.affiliations.length) return null;
      return (
        <SectionWrapper title={title}>
          <Stack>
            {sections.affiliations.map((a, i) => (
              <div key={i}>
                <div style={{ fontWeight: 600, color: isSidebar ? undefined : "var(--primary-text-color)" }}>{a.organization}</div>
                <div style={{ color: isSidebar ? "rgba(255,255,255,0.8)" : "var(--secondary-text-color)", fontSize: "0.85em" }}>
                  {[a.role, a.date].filter(Boolean).join(" · ")}
                </div>
              </div>
            ))}
          </Stack>
        </SectionWrapper>
      );
    case "professionalTraining":
      if (!sections.professionalTraining.length) return null;
      return (
        <SectionWrapper title={title}>
          <Stack>
            {sections.professionalTraining.map((t, i) => (
              <div key={i}>
                <div style={{ fontWeight: 600, color: isSidebar ? undefined : "var(--primary-text-color)" }}>{t.name}</div>
                <div style={{ color: isSidebar ? "rgba(255,255,255,0.8)" : "var(--secondary-text-color)", fontSize: "0.85em" }}>
                  {[t.provider, t.date].filter(Boolean).join(" · ")}
                </div>
                {t.details ? <RichText text={t.details} /> : null}
              </div>
            ))}
          </Stack>
        </SectionWrapper>
      );
    case "volunteering":
      if (!sections.volunteering.length) return null;
      return (
        <SectionWrapper title={title}>
          <Stack>
            {sections.volunteering.map((v, i) => (
              <div key={i}>
                <div style={{ fontWeight: 600, color: isSidebar ? undefined : "var(--primary-text-color)" }}>{v.role}</div>
                <div style={{ color: isSidebar ? "rgba(255,255,255,0.9)" : "var(--secondary-text-color)", fontSize: "0.85em" }}>
                  {[v.organization, v.date].filter(Boolean).join(" · ")}
                </div>
                {v.description ? <RichText text={v.description} /> : null}
              </div>
            ))}
          </Stack>
        </SectionWrapper>
      );
    case "additionalExperience":
      if (!sections.additionalExperience.length) return null;
      return (
        <SectionWrapper title={title}>
          <Stack>
            {sections.additionalExperience.map((a, i) => (
              <div key={i}>
                <div style={{ fontWeight: 600, color: isSidebar ? undefined : "var(--primary-text-color)" }}>{a.title}</div>
                <div style={{ color: isSidebar ? "rgba(255,255,255,0.9)" : "var(--secondary-text-color)", fontSize: "0.85em" }}>
                  {[a.organization, a.date].filter(Boolean).join(" · ")}
                </div>
                {a.description ? <RichText text={a.description} /> : null}
              </div>
            ))}
          </Stack>
        </SectionWrapper>
      );
    case "customSimple":
      if (!sections.customSimple.length) return null;
      return (
        <SectionWrapper title={title}>
          <Stack>
            {sections.customSimple.map((item, i) => (
              <div key={i}>
                <div style={{ fontWeight: 600, color: isSidebar ? undefined : "var(--primary-text-color)" }}>{item.title}</div>
                {item.description ? <RichText text={item.description} /> : null}
              </div>
            ))}
          </Stack>
        </SectionWrapper>
      );
    case "customAdvanced":
      if (!sections.customAdvanced.length) return null;
      return (
        <SectionWrapper title={title}>
          <Stack>
            {sections.customAdvanced.map((item, i) => (
              <div key={i}>
                <div style={{ fontWeight: 600, color: isSidebar ? undefined : "var(--primary-text-color)" }}>{item.title}</div>
                {item.description ? <RichText text={item.description} /> : null}
              </div>
            ))}
          </Stack>
        </SectionWrapper>
      );
    default:
      return null;
  }
}

// ── Header component ─────────────────────────────────────────────────────────

type HeaderProps = {
  personalDetails: ResumeData["personalDetails"];
  sections: ResumeData["sections"];
  accent: string;
  showPhoto?: boolean; // MUST be explicitly passed; not derived inside
  centered?: boolean;
  headerAlignment?: "left" | "center" | "right";
  selectedTemplate: string;
};

function ResumeHeader({
  personalDetails,
  sections,
  accent,
  showPhoto = false,
  centered = false,
  headerAlignment = "left",
  selectedTemplate,
}: HeaderProps) {
  // If headerAlignment is explicitly set, use it to drive centered
  const isCentered = headerAlignment === "center" || centered;
  const { fullName, title, email, phone, location, website, photo } =
    personalDetails;
  const photoSrc = showPhoto && photo ? photo : undefined;
  const links = sections.websites.filter((l) => l.label || l.value);

  const nameStyle: React.CSSProperties = {
    fontFamily: "var(--heading-font, Arial), sans-serif",
    color: "var(--primary-text-color)",
    fontSize: "var(--font-size-primary, 24px)",
    fontWeight: "var(--heading-weight, 700)",
    lineHeight: 1.1,
    fontStyle: "var(--heading-style, normal)",
    textDecoration: "var(--heading-decoration, none)",
  };
  const titleCss: React.CSSProperties = {
    color: "var(--secondary-text-color)",
    fontSize: "var(--font-size-secondary, 16px)",
    fontWeight: "var(--subheading-weight, 500)",
    marginTop: 3,
    whiteSpace: "nowrap",
    fontStyle: "var(--subheading-style, normal)",
    textDecoration: "var(--subheading-decoration, none)",
  };

  const ContactStack = ({ alignRight = false }: { alignRight?: boolean }) => {
    const showIcons = templateSupportsIcons(selectedTemplate);
    const isRow = isCentered;
    return (
      <div style={{ 
        display: 'block', 
        textAlign: isRow ? 'center' : (alignRight ? 'right' : 'left'), 
        fontSize: "var(--font-size-body, 12px)", 
        color: "var(--secondary-text-color)" 
      }}>
        {location && (
          <div style={{ 
            display: isRow ? 'inline-block' : 'block', 
            marginBottom: isRow ? 4 : 6, 
            marginRight: isRow ? 12 : 0, 
            whiteSpace: 'nowrap' 
          }}>
            {showIcons && <MapPin size={12} style={{ color: accent, marginRight: 6 }} />}
            <span style={{ verticalAlign: 'middle' }}>{location}</span>
          </div>
        )}
        {phone && (
          <div style={{ 
            display: isRow ? 'inline-block' : 'block', 
            marginBottom: isRow ? 4 : 6, 
            marginRight: isRow ? 12 : 0, 
            whiteSpace: 'nowrap' 
          }}>
            {showIcons && <Phone size={12} style={{ color: accent, marginRight: 6 }} />}
            <span style={{ verticalAlign: 'middle' }}>{phone}</span>
          </div>
        )}
        {email && (
          <div style={{ 
            display: isRow ? 'inline-block' : 'block', 
            marginBottom: isRow ? 4 : 6, 
            marginRight: isRow ? 12 : 0, 
            whiteSpace: 'nowrap' 
          }}>
            {showIcons && <Mail size={12} style={{ color: accent, marginRight: 6 }} />}
            <a href={`mailto:${email}`} style={{ color: accent, textDecoration: 'none', verticalAlign: 'middle' }}>{email}</a>
          </div>
        )}
        {website && (
          <div style={{ 
            display: isRow ? 'inline-block' : 'block', 
            marginBottom: isRow ? 4 : 6, 
            marginRight: isRow ? 12 : 0, 
            whiteSpace: 'nowrap' 
          }}>
            {showIcons && <Globe size={12} style={{ color: accent, marginRight: 6 }} />}
            <a href={ensureUrl(website)} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'none', verticalAlign: 'middle' }}>{website}</a>
          </div>
        )}
      </div>
    );
  };

  const LinksRow = ({ center = false }: { center?: boolean }) => {
    if (links.length === 0) return null;
    return (
      <div style={{ marginTop: 8, display: 'block', textAlign: center ? 'center' : 'left', fontSize: 'var(--font-size-body, 12px)' }}>
        {links.map((l, i) => (
          <a key={i} href={ensureUrl(l.value)} target="_blank" rel="noopener noreferrer" style={{
            color: accent, textDecoration: 'none', padding: '2px 8px',
            border: `1px solid ${accent}33`, borderRadius: 3,
            fontSize: '0.9em', display: 'inline-block', marginRight: 8, marginBottom: 4,
            verticalAlign: 'middle'
          }}>
            {l.label || l.value}
          </a>
        ))}
      </div>
    );
  };

  if (isCentered) {
    return (
      <header
        style={{
          textAlign: "center",
          borderBottom: `1.5px solid ${accent}`,
          paddingBottom: 16,
          marginBottom: "var(--section-gap, 12px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        {photoSrc && (
          <img
            src={photoSrc}
            alt={fullName}
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${accent}`,
              display: "block",
            }}
          />
        )}
        <div>
          <div style={nameStyle}>{fullName || "Your Name"}</div>
          {title && <div style={titleCss}>{title}</div>}
        </div>
        <ContactStack />
        <LinksRow center />
      </header>
    );
  }

  const isRight = headerAlignment === "right";

  return (
    <header
      style={{
        borderBottom: "1px solid #e2e8f0",
        paddingBottom: 16,
        marginBottom: "var(--section-gap, 12px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexDirection: isRight ? "row-reverse" : "row",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            flex: 1,
            minWidth: 0,
            flexDirection: isRight ? "row-reverse" : "row",
          }}
        >
          {photoSrc && (
            <img
              src={photoSrc}
              alt={fullName}
              style={{
                width: 66,
                height: 66,
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${accent}`,
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ minWidth: 0, textAlign: isRight ? "right" : "left" }}>
            <div style={nameStyle}>{fullName || "Your Name"}</div>
            {title && <div style={titleCss}>{title}</div>}
            <LinksRow />
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <ContactStack alignRight={!isRight} />
        </div>
      </div>
    </header>
  );
}

const DEFAULT_ORDER: SectionKey[] = [
  "headerFooter",
  "personalDetails",
  "powerStatement",
  "professionalSummary",
  "websites",
  "skills",
  "education",
  "projects",
  "workHistory",
  "achievements",
  "accomplishments",
  "internships",
  "customSimple",
  "customAdvanced",
  "professionalTraining",
  "additionalExperience",
  "volunteering",
  "languages",
  "hobbies",
  "references",
  "awards",
  "certifications",
  "affiliations",
];

// ── Sidebar section helper (for professional/twoColumn templates) ─────────────

function SideSection({
  title,
  accent,
  template,
  children,
}: {
  title: string;
  accent: string;
  template?: string;
  children: React.ReactNode;
}) {
  const sectionKey = getSectionKeyFromTitle(title);
  const showIcon = template === "split-rule" && sectionKey && templateSupportsIcons(template);
  
  return (
    <div style={{ marginBottom: 14, breakInside: "avoid", pageBreakInside: "avoid" }}>
      <div style={{ display: "block", marginBottom: 6 }}>
        <div
          style={{
            fontFamily: "var(--heading-font, Arial), sans-serif",
            fontSize: "var(--font-size-section, 10px)",
            fontWeight: "var(--section-weight, 700)",
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            color: accent,
            opacity: 0.85,
          }}
        >
          {showIcon && <span style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }}><SectionIcon section={sectionKey!} size={14} /></span>}
          <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>{title}</span>
        </div>
        <div style={{
          borderTop: `1px solid ${accent}`,
          marginTop: 3,
          height: 0,
          overflow: "hidden",
          opacity: 0.85
        }} />
      </div>
      {children}
    </div>
  );
}

// ── Template layouts ─────────────────────────────────────────────────────────

function ClassicLayout({ resume }: { resume: ResumeData }) {
  const { customization, personalDetails, sections, headerFooter } = resume;
  const accent = customization.primaryColor;
  const showPhoto = templateSupportsPhoto(customization.selectedTemplate) && customization.showPhoto && !!personalDetails.photo;
  const isCentered = customization.headerAlignment === "center" || ["steady-form", "precision-line", "classic-portrait"].includes(customization.selectedTemplate);
  const sectionOrder = customization.sectionOrder ?? DEFAULT_ORDER;
  
  return (
    <div style={pageStyle()}>
      {active(resume, "personalDetails") && (
        <ResumeHeader
          personalDetails={personalDetails}
          sections={sections}
          accent={accent}
          showPhoto={showPhoto}
          centered={isCentered}
          headerAlignment={customization.headerAlignment}
          selectedTemplate={customization.selectedTemplate}
        />
      )}
      {sectionOrder
        .filter(k => k !== "headerFooter" && k !== "personalDetails" && shown(resume, k))
        .map(k => (
          <div key={k}>{renderSectionByKey(k, resume)}</div>
        ))
      }
      {active(resume, "headerFooter") && <Footer footerText={headerFooter.footerText} />}
    </div>
  );
}

function ProfessionalLayout({ resume }: { resume: ResumeData }) {
  const { customization, personalDetails, headerFooter } = resume;
  const accent = customization.primaryColor;
  const showPhoto = templateSupportsPhoto(customization.selectedTemplate) && customization.showPhoto && !!personalDetails.photo;
  const showIcons = templateSupportsIcons(customization.selectedTemplate);
  const sectionOrder = customization.sectionOrder ?? DEFAULT_ORDER;
  const leftWidth = customization.leftColumnWidth ?? 35;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "inherit",
        fontFamily: "var(--body-font, Arial), sans-serif",
        fontSize: "var(--font-size-body, 12px)",
        lineHeight: "var(--line-height, 1.4)",
      }}
    >
      <aside
        style={{
          width: `${leftWidth}%`,
          backgroundColor: accent,
          color: "white",
          padding: "var(--margin-vertical) 18px var(--margin-vertical) var(--margin-horizontal)",
        }}
      >
        {active(resume, "personalDetails") && (
          <>
            {showPhoto && (
              <img
                src={personalDetails.photo}
                alt={personalDetails.fullName}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid rgba(255,255,255,0.25)",
                  marginBottom: 14,
                  display: "block",
                }}
              />
            )}
            <div
              style={{
                fontFamily: "var(--heading-font, Arial)",
                fontSize: "var(--font-size-primary, 26px)",
                fontWeight: "var(--heading-weight, 700)",
                lineHeight: 1.1,
                marginBottom: 4,
              }}
            >
              {personalDetails.fullName || "Your Name"}
            </div>
            {personalDetails.title && (
              <div
                style={{
                  fontSize: "var(--font-size-secondary, 16px)",
                  opacity: 0.88,
                  fontWeight: "var(--subheading-weight, 500)",
                  marginBottom: 14,
                }}
              >
                {personalDetails.title}
              </div>
            )}
            <SideSection title="Contact" accent="rgba(255,255,255,0.6)" template={customization.selectedTemplate}>
              <div style={{ opacity: 0.88, fontSize: "var(--font-size-body, 12px)", display: 'block', textAlign: 'left' }}>
                {personalDetails.location && (
                  <div style={{ display: 'block', marginBottom: 6, whiteSpace: 'nowrap' }}>
                    {showIcons && <MapPin size={12} style={{ marginRight: 6, color: 'rgba(255,255,255,0.8)' }} />}
                    <span style={{ verticalAlign: 'middle' }}>{personalDetails.location}</span>
                  </div>
                )}
                {personalDetails.phone && (
                  <div style={{ display: 'block', marginBottom: 6, whiteSpace: 'nowrap' }}>
                    {showIcons && <Phone size={12} style={{ marginRight: 6, color: 'rgba(255,255,255,0.8)' }} />}
                    <span style={{ verticalAlign: 'middle' }}>{personalDetails.phone}</span>
                  </div>
                )}
                {personalDetails.email && (
                  <div style={{ display: 'block', marginBottom: 6, whiteSpace: 'nowrap' }}>
                    {showIcons && <Mail size={12} style={{ marginRight: 6, color: 'rgba(255,255,255,0.8)' }} />}
                    <a href={`mailto:${personalDetails.email}`} style={{ color: 'inherit', textDecoration: 'none', verticalAlign: 'middle' }}>{personalDetails.email}</a>
                  </div>
                )}
                {personalDetails.website && (
                  <div style={{ display: 'block', marginBottom: 6, whiteSpace: 'nowrap' }}>
                    {showIcons && <Globe size={12} style={{ marginRight: 6, color: 'rgba(255,255,255,0.8)' }} />}
                    <a href={ensureUrl(personalDetails.website)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', verticalAlign: 'middle' }}>{personalDetails.website}</a>
                  </div>
                )}
              </div>
            </SideSection>
          </>
        )}
        
        {sectionOrder
          .filter(k => k !== "headerFooter" && k !== "personalDetails" && shown(resume, k) && getSectionColumn(k, resume) === 'left')
          .map(k => (
            <div key={k} style={{ marginTop: 14 }}>
              {renderSectionByKey(k, resume, true)}
            </div>
          ))
        }
      </aside>
      <main
        style={{ 
          width: `${100 - leftWidth}%`,
          padding: "var(--margin-vertical) var(--margin-horizontal)" 
        }}
      >
        {sectionOrder
          .filter(k => k !== "headerFooter" && k !== "personalDetails" && shown(resume, k) && getSectionColumn(k, resume) !== 'left')
          .map(k => (
            <div key={k}>{renderSectionByKey(k, resume, false)}</div>
          ))
        }
        {active(resume, "headerFooter") && <Footer footerText={headerFooter.footerText} />}
      </main>
    </div>
  );
}

function SpecialistLayout({ resume }: { resume: ResumeData }) {
  const { customization, personalDetails, sections, headerFooter } = resume;
  const accent = customization.primaryColor;
  const showPhoto = templateSupportsPhoto(customization.selectedTemplate) && customization.showPhoto && !!personalDetails.photo;
  const sectionOrder = customization.sectionOrder ?? DEFAULT_ORDER;
  const defaultLeftWidth = ["even-line", "fine-line"].includes(customization.selectedTemplate) ? 33 : 60;
  const leftWidth = customization.leftColumnWidth ?? defaultLeftWidth;

  return (
    <div style={pageStyle()}>
      {active(resume, "personalDetails") && (
        <ResumeHeader
          personalDetails={personalDetails}
          sections={sections}
          accent={accent}
          showPhoto={showPhoto}
          headerAlignment={customization.headerAlignment}
          selectedTemplate={customization.selectedTemplate}
        />
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: `calc(${leftWidth}% - 12px)` }}>
          {sectionOrder
            .filter(k => k !== "headerFooter" && k !== "personalDetails" && shown(resume, k) && getSectionColumn(k, resume) === 'left')
            .map(k => (
              <div key={k}>{renderSectionByKey(k, resume)}</div>
            ))
          }
        </div>
        <div style={{ width: `calc(${100 - leftWidth}% - 12px)` }}>
          {sectionOrder
            .filter(k => k !== "headerFooter" && k !== "personalDetails" && shown(resume, k) && getSectionColumn(k, resume) === 'right')
            .map(k => (
              <div key={k}>{renderSectionByKey(k, resume)}</div>
            ))
          }
        </div>
      </div>
      {active(resume, "headerFooter") && <Footer footerText={headerFooter.footerText} />}
    </div>
  );
}

function CorporateLayout({ resume }: { resume: ResumeData }) {
  const { customization, personalDetails, sections, headerFooter } = resume;
  const accent = customization.primaryColor;
  const showPhoto = templateSupportsPhoto(customization.selectedTemplate) && customization.showPhoto && !!personalDetails.photo;
  const sectionOrder = customization.sectionOrder ?? DEFAULT_ORDER;
  const leftWidth = customization.leftColumnWidth ?? 28;
  const links = sections.websites.filter((l) => l.label || l.value);

  const contactParts = [
    personalDetails.title,
    personalDetails.location,
    personalDetails.phone,
  ].filter(Boolean);

  return (
    <div style={pageStyle()}>
      <header style={{
        textAlign: "center",
        borderBottom: `1.5px solid ${accent}`,
        paddingBottom: 14,
        marginBottom: "var(--section-gap, 12px)",
      }}>
        {showPhoto && personalDetails.photo && (
          <img
            src={personalDetails.photo}
            alt={personalDetails.fullName}
            style={{
              width: 72, height: 72, borderRadius: "50%",
              objectFit: "cover", border: `2px solid ${accent}`,
              display: "block", margin: "0 auto 8px",
            }}
          />
        )}
        <div style={{
          fontFamily: "var(--heading-font, Arial), sans-serif",
          fontSize: "var(--font-size-primary, 24px)",
          fontWeight: "var(--heading-weight, 700)",
          color: "var(--primary-text-color)",
          lineHeight: 1.1,
        }}>
          {personalDetails.fullName || "Your Name"}
        </div>
        {contactParts.length > 0 && (
          <div style={{
            marginTop: 4,
            fontSize: "var(--font-size-secondary, 14px)",
            color: "var(--secondary-text-color)",
          }}>
            {contactParts.join(" | ")}
          </div>
        )}
      </header>

      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ width: `${leftWidth}%`, minWidth: 0 }}>
          <CorporateSection accent={accent} title="DETAILS">
            <div style={{ display: "grid", gap: 4, color: "var(--secondary-text-color)", fontSize: "0.85em" }}>
              {personalDetails.location && <div>{personalDetails.location}</div>}
              {personalDetails.phone && <div>{personalDetails.phone}</div>}
              {personalDetails.email && (
                <a href={`mailto:${personalDetails.email}`} style={{ color: accent, textDecoration: "none" }}>{personalDetails.email}</a>
              )}
              {personalDetails.website && (
                <a href={ensureUrl(personalDetails.website)} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "none" }}>{personalDetails.website}</a>
              )}
            </div>
          </CorporateSection>

          {links.length > 0 && (
            <CorporateSection accent={accent} title="LINKS">
              <div style={{ display: "grid", gap: 3 }}>
                {links.map((l, i) => (
                  <a key={i} href={ensureUrl(l.value)} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "none", fontSize: "0.85em" }}>
                    {l.label || l.value}
                  </a>
                ))}
              </div>
            </CorporateSection>
          )}

          {sectionOrder
            .filter(k => k !== "headerFooter" && k !== "personalDetails" && shown(resume, k) && getSectionColumn(k, resume) === 'left')
            .map(k => (
              <div key={k} style={{ marginBottom: 14 }}>
                {renderSectionByKey(k, resume)}
              </div>
            ))
          }
        </div>
        <div style={{ width: `${100 - leftWidth}%`, minWidth: 0 }}>
          {sectionOrder
            .filter(k => k !== "headerFooter" && k !== "personalDetails" && shown(resume, k) && getSectionColumn(k, resume) === 'right')
            .map(k => (
              <div key={k}>{renderSectionByKey(k, resume)}</div>
            ))
          }
        </div>
      </div>

      {active(resume, "headerFooter") && <Footer footerText={headerFooter.footerText} />}
    </div>
  );
}

function CorporateSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14, breakInside: "avoid", pageBreakInside: "avoid" }}>
      <div style={{ display: "flex", alignItems: "stretch", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 3, backgroundColor: accent, borderRadius: 1, flexShrink: 0 }} />
        <div style={{
          fontFamily: "var(--heading-font, Arial), sans-serif",
          fontSize: "var(--font-size-section, 10px)",
          fontWeight: "var(--section-weight, 700)",
          letterSpacing: "0.14em",
          textTransform: "uppercase" as const,
          color: accent,
        }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

function VividLayout({ resume }: { resume: ResumeData }) {
  const { customization, personalDetails, headerFooter } = resume;
  const accent = customization.primaryColor || "#f5c518";
  const showPhoto = templateSupportsPhoto(customization.selectedTemplate) && customization.showPhoto && !!personalDetails.photo;
  const sectionOrder = customization.sectionOrder ?? DEFAULT_ORDER;

  return (
    <div
      style={{
        fontFamily: "var(--body-font, Arial), sans-serif",
        fontSize: "var(--font-size-body, 12px)",
        lineHeight: "var(--line-height, 1.4)",
      }}
    >
      {/* Vivid Accent Banner */}
      {active(resume, "personalDetails") && (
        <header
          style={{
            backgroundColor: accent,
            padding: "24px var(--margin-horizontal)",
            marginBottom: "var(--section-gap, 16px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
            {showPhoto && personalDetails.photo && (
              <img
                src={personalDetails.photo}
                alt={personalDetails.fullName}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid rgba(0,0,0,0.15)",
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--heading-font, Arial), sans-serif",
                  fontSize: "var(--font-size-primary, 30px)",
                  fontWeight: "var(--heading-weight, 800)",
                  lineHeight: 1.05,
                  color: "#1a1a1a",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                {personalDetails.fullName || "Your Name"}
              </div>
            </div>
          </div>
          <div
            style={{
              textAlign: "right",
              fontSize: "var(--font-size-body, 12px)",
              lineHeight: 1.5,
              color: "#1a1a1a",
              flexShrink: 0,
            }}
          >
            {personalDetails.title && (
              <div style={{ fontWeight: 700, fontSize: "1.1em", marginBottom: 2 }}>
                {personalDetails.title}
              </div>
            )}
            {personalDetails.location && <div>{personalDetails.location}</div>}
            {personalDetails.email && (
              <div>
                <a
                  href={`mailto:${personalDetails.email}`}
                  style={{ color: "#1a1a1a", textDecoration: "underline" }}
                >
                  {personalDetails.email}
                </a>
              </div>
            )}
            {personalDetails.phone && <div>{personalDetails.phone}</div>}
            {personalDetails.website && (
              <div>
                <a
                  href={ensureUrl(personalDetails.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1a1a1a", textDecoration: "underline" }}
                >
                  {personalDetails.website}
                </a>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Body */}
      <div style={{ padding: "0 var(--margin-horizontal) var(--margin-vertical)" }}>
        {sectionOrder
          .filter((k) => k !== "headerFooter" && k !== "personalDetails" && shown(resume, k))
          .map((k) => (
            <div key={k}>{renderSectionByKey(k, resume)}</div>
          ))}
        {active(resume, "headerFooter") && <Footer footerText={headerFooter.footerText} />}
      </div>
    </div>
  );
}

function FunkyLayout({ resume }: { resume: ResumeData }) {
  const { customization, personalDetails, headerFooter } = resume;
  const accent = customization.primaryColor;
  const sectionOrder = customization.sectionOrder ?? DEFAULT_ORDER;

  return (
    <div style={{ ...pageStyle(), padding: 0, display: "flex", backgroundColor: "#fdfdfc", minHeight: "100%" }}>
      {/* Left thick edge */}
      <div style={{ width: "16px", backgroundColor: accent, flexShrink: 0 }} />
      
      {/* Main Container */}
      <div style={{ flex: 1, padding: "40px 48px" }}>
        {active(resume, "personalDetails") && (
          <header style={{ marginBottom: 24 }}>
            <div style={{
              fontFamily: "var(--heading-font, Arial), sans-serif",
              fontSize: "var(--font-size-primary, 42px)",
              fontWeight: 900,
              color: "#222",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              textAlign: customization.headerAlignment || "left",
              lineHeight: 1.1
            }}>
              {personalDetails.fullName || "Your Name"}
            </div>
            {personalDetails.title && (
              <div style={{
                fontFamily: "var(--heading-font, Arial), sans-serif",
                fontSize: "var(--font-size-secondary, 18px)",
                fontWeight: 600,
                color: accent,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginTop: 6,
                textAlign: customization.headerAlignment || "left"
              }}>
                {personalDetails.title}
              </div>
            )}
            
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "12px",
              marginTop: 16,
              justifyContent: customization.headerAlignment === "center" ? "center" : 
                              customization.headerAlignment === "right" ? "flex-end" : "flex-start",
              fontSize: "var(--font-size-body, 12px)",
              fontFamily: "var(--body-font, Arial), sans-serif",
              color: "#333",
            }}>
              {personalDetails.email && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg viewBox="0 0 24 24" fill={accent} style={{ width: 14, height: 14 }}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                  <a href={`mailto:${personalDetails.email}`} style={{ color: "#333", textDecoration: "none" }}>{personalDetails.email}</a>
                </div>
              )}
              {personalDetails.email && (personalDetails.phone || personalDetails.location) && <span style={{ color: `${accent}88` }}>|</span>}
              
              {personalDetails.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg viewBox="0 0 24 24" fill={accent} style={{ width: 14, height: 14 }}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  <span>{personalDetails.phone}</span>
                </div>
              )}
              {personalDetails.phone && personalDetails.location && <span style={{ color: `${accent}88` }}>|</span>}
              
              {personalDetails.location && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg viewBox="0 0 24 24" fill={accent} style={{ width: 14, height: 14 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  <span>{personalDetails.location}</span>
                </div>
              )}
              {personalDetails.location && personalDetails.website && <span style={{ color: `${accent}88` }}>|</span>}

              {personalDetails.website && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg viewBox="0 0 24 24" fill={accent} style={{ width: 14, height: 14 }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  <a href={ensureUrl(personalDetails.website)} target="_blank" rel="noreferrer" style={{ color: "#333", textDecoration: "none" }}>{personalDetails.website}</a>
                </div>
              )}
            </div>
            <div style={{ borderTop: `1px solid ${accent}55`, marginTop: 18 }} />
          </header>
        )}
  
        <div className="funky-sections" style={{ 
          '--section-icon-color': accent,
          '--skills-pill-bg': `${accent}1a`, 
          '--skills-pill-color': "#222",
        } as React.CSSProperties}>
          {sectionOrder
            .filter(k => k !== "headerFooter" && k !== "personalDetails" && shown(resume, k))
            .map(k => (
              <div key={k}>{renderSectionByKey(k, resume)}</div>
            ))
          }
        </div>
        {active(resume, "headerFooter") && <Footer footerText={headerFooter.footerText} />}
      </div>
    </div>
  );
}

// ── Layout map ────────────────────────────────────────────────────────────────

const LAYOUTS: Record<string, React.ComponentType<{ resume: ResumeData }>> = {
  classic: ClassicLayout,
  professional: ProfessionalLayout,
  specialist: SpecialistLayout,
  "steady-form": ClassicLayout,
  corporate: CorporateLayout,
  vivid: VividLayout,
  funky: FunkyLayout,
};

// ── Main component ────────────────────────────────────────────────────────────

export function ResumePreview({
  resume,
  activeTemplate,
}: ResumePreviewProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const { customization } = resume;
  const isA4 = customization.format === "A4";
  const pageWidth = isA4 ? "794px" : "816px";
  const pageMinHeight = isA4 ? 1123 : 1056;

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    // Section-level page-break nudging only applies to single-column layouts.
    // Multi-column templates (professional/specialist) flow through side-by-side
    // frames where per-section margin pushes would desync the columns; those
    // rely on the visual page guides instead.
    const TemplateLayoutFn = LAYOUTS[customization.selectedTemplate] ?? ClassicLayout;
    const singleColumn = TemplateLayoutFn === ClassicLayout;
    if (!singleColumn) return;

    let raf = 0;

    const paginate = () => {
      // Vertical page padding (top & bottom margin of the printed page), read
      // from the live computed style so it tracks the margin customization.
      const cs = getComputedStyle(page);
      const marginTopPx = parseFloat(cs.paddingTop) || 0;
      const marginBottomPx = parseFloat(cs.paddingBottom) || 0;
      const usablePerPage = pageMinHeight - marginTopPx - marginBottomPx;

      // Whole top-level sections move as a unit (we intentionally do NOT target
      // nested <article> blocks — the requirement is to move the *section* to
      // the next page, not to split it). Footer is included so it never
      // straddles a boundary either.
      const blocks = Array.from(
        page.querySelectorAll<HTMLElement>("section, footer"),
      ).filter((el) => !el.parentElement?.closest("section")); // top-level only

      // Reset any margins we injected on a previous pass.
      for (const el of blocks) {
        if (el.dataset.origMargin === undefined) {
          el.dataset.origMargin = getComputedStyle(el).marginTop;
        }
        el.style.marginTop = el.dataset.origMargin || "";
        el.classList.remove("js-page-break-element");
      }

      const pageTop = page.getBoundingClientRect().top;

      for (const el of blocks) {
        const rect = el.getBoundingClientRect();
        const top = rect.top - pageTop;
        const height = rect.height;

        // Which page does this block currently start on, and where is that
        // page's usable bottom line?
        const pageIndex = Math.floor(top / pageMinHeight);
        const usableBottom = (pageIndex + 1) * pageMinHeight - marginBottomPx;

        const overflows = top + height > usableBottom + 1; // +1px slack
        const fitsOnAPage = height <= usablePerPage;

        if (overflows && fitsOnAPage) {
          const origMargin = parseFloat(el.dataset.origMargin || "0") || 0;
          // Land the block at the top-margin of the next page.
          const newTop = (pageIndex + 1) * pageMinHeight + marginTopPx;
          const push = newTop - top;
          if (push > 0) {
            el.style.marginTop = `${origMargin + push}px`;
            el.classList.add("js-page-break-element");
          }
        }
      }
    };

    // Run after layout settles (fonts/images can change heights).
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => requestAnimationFrame(paginate));
    };
    schedule();

    // Re-paginate when fonts finish loading or the container resizes.
    const ro = new ResizeObserver(schedule);
    ro.observe(page);
    const f = (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts;
    if (f) f.ready.then(schedule).catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [resume, activeTemplate, pageMinHeight, customization.selectedTemplate]);

  const cssVars = {
    "--spacing-multiplier": 1,
    "--accent-color": customization.primaryColor,
    "--primary-text-color": customization.primaryTextColor ?? "#111827",
    "--secondary-text-color": customization.secondaryTextColor ?? "#475569",
    "--text-color": customization.textColor ?? "#1f2937",
    "--background-color": customization.backgroundColor ?? "#ffffff",
    "--body-font": customization.secondaryFont,
    "--heading-font": customization.primaryFont,
    "--line-height": `${customization.lineHeight}`,
    "--font-size-body": `${customization.fontSizes.body}px`,
    "--font-size-primary": `${customization.fontSizes.primaryHeading}px`,
    "--font-size-secondary": `${customization.fontSizes.secondaryHeading}px`,
    "--font-size-section": `${customization.fontSizes.sectionTitles}px`,
    "--margin-vertical": `calc(${customization.marginVertical}in * var(--spacing-multiplier, 1))`,
    "--margin-horizontal": `calc(${customization.marginHorizontal}in * var(--spacing-multiplier, 1))`,
    "--section-gap": `calc(${customization.betweenSections}px * var(--spacing-multiplier, 1))`,
    "--content-gap": `calc(${customization.contentBlockGap}px * var(--spacing-multiplier, 1))`,
    // Enforce a small floor so resumes saved with very tight values still render
    // with legible separation between an entry's title and its subtitle.
    "--inner-padding": `calc(${Math.max(customization.contentInnerPadding, 3)}px * var(--spacing-multiplier, 1))`,
    "--title-gap": `calc(${Math.max(customization.titleContentGap, 6)}px * var(--spacing-multiplier, 1))`,
    "--header-footer-space": `calc(${customization.headerFooterSpacing}in * var(--spacing-multiplier, 1))`,
    "--heading-weight": fontWeightValue(
      customization.fontWeights.primaryHeading,
    ),
    "--subheading-weight": fontWeightValue(
      customization.fontWeights.secondaryHeading,
    ),
    "--body-weight": fontWeightValue(customization.fontWeights.body),
    "--section-weight": fontWeightValue(
      customization.fontWeights.sectionTitles,
    ),
    "--heading-style": customization.textStyles?.primaryHeading.italic ? "italic" : "normal",
    "--heading-decoration": customization.textStyles?.primaryHeading.underline ? "underline" : "none",
    "--subheading-style": customization.textStyles?.secondaryHeading.italic ? "italic" : "normal",
    "--subheading-decoration": customization.textStyles?.secondaryHeading.underline ? "underline" : "none",
    "--section-style": customization.textStyles?.sectionTitles.italic ? "italic" : "normal",
    "--section-decoration": customization.textStyles?.sectionTitles.underline ? "underline" : "none",
  } as React.CSSProperties;

  const TemplateLayout =
    LAYOUTS[customization.selectedTemplate] ?? ClassicLayout;

  return (
    <div className="preview-shell relative print:overflow-visible print:border-0 print:bg-white print:shadow-none">
      <div className="preview-topbar print:hidden">
        <span className="text-sm font-bold text-slate-600">
          Preview · {activeTemplate}
        </span>
      </div>
      <div className="preview-scroll print:overflow-visible print:bg-white print:p-0">
        <div
          ref={pageRef}
          className="resume-page mx-auto relative"
          style={{
            ...cssVars,
            width: "100%",
            maxWidth: pageWidth,
            minHeight: `${pageMinHeight}px`,
            backgroundColor: "var(--background-color)",
            color: "var(--text-color)",
          }}
        >
          {/* Visual page break indicators for preview mode */}
          <div
            className="absolute inset-0 pointer-events-none print:hidden z-50"
            style={{
              background: `repeating-linear-gradient(to bottom, transparent, transparent calc(${pageMinHeight}px - 2px), rgba(99, 102, 241, 0.4) calc(${pageMinHeight}px - 2px), rgba(99, 102, 241, 0.4) ${pageMinHeight}px)`,
              backgroundSize: `100% ${pageMinHeight}px`
            }}
          />
          <TemplateLayout resume={resume} />
        </div>
      </div>
      <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 opacity-60 pointer-events-none print:hidden bg-white/80 px-2 py-1 rounded">
        Note: DOCX export simplifies layout
      </div>
    </div>
  );
}
