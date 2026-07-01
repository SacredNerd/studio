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
  // If already a year-only string like "2022" or "Present", return as-is for year-only
  if (dateFormat === "Year only") {
    const yearMatch = raw.match(/(\d{4})/);
    if (raw.toLowerCase() === "present") return "Present";
    return yearMatch ? yearMatch[1] : raw;
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
  let borderPaddingBottom = 3;

  if (template === "classic-clear" || template === "editorial-rule") {
    borderStyle = `1px solid ${accent}`;
  } else if (template === "steady-form") {
    titleStyle = { ...titleStyle, textAlign: "center", backgroundColor: "rgba(0,0,0,0.05)", padding: "4px 8px", color: "var(--primary-text-color)" };
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
  }

  const sectionKey = getSectionKeyFromTitle(title);
  const showIcon = template === "split-rule" && sectionKey;

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

function WorkBlock({ resume }: { resume: ResumeData }) {
  if (!shown(resume, "workHistory")) return null;
  const items = resume.sections.workHistory.filter((x) => x.company || x.role);
  if (!items.length) return null;
  const accent = resume.customization.primaryColor;
  return (
    <Section title="Work History" accent={accent} template={resume.customization.selectedTemplate}>
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
                  }}
                >
                  {item.role}
                </div>
                <div style={{ color: accent }}>
                  {[item.company, item.location].filter(Boolean).join(" • ")}
                </div>
              </div>
              <div
                style={{
                  color: "var(--secondary-text-color)",
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
    </Section>
  );
}

function EducationBlock({ resume }: { resume: ResumeData }) {
  if (!shown(resume, "education")) return null;
  const items = resume.sections.education.filter(
    (x) => x.institution || x.degree,
  );
  if (!items.length) return null;
  const accent = resume.customization.primaryColor;
  const isInline = resume.customization.educationLayout === "inline";
  const df = resume.customization.dateFormat;
  return (
    <Section title="Education" accent={accent} template={resume.customization.selectedTemplate}>
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
              <article key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0 8px", alignItems: "baseline" }}>
                    <span style={{ fontWeight: "var(--subheading-weight, 600)", fontFamily: "var(--heading-font, Arial)" }}>{primary}</span>
                    {secondary && <span style={{ color: accent }}>{secondary}</span>}
                    {item.location && <span style={{ color: "var(--secondary-text-color)", fontSize: "0.85em" }}>{item.location}</span>}
                  </div>
                  {dateStr && <span style={{ color: "var(--secondary-text-color)", fontSize: "0.85em", whiteSpace: "nowrap", flexShrink: 0 }}>{dateStr}</span>}
                </div>
                {item.details ? <RichText text={item.details} /> : null}
              </article>
            );
          }
          return (
            <article key={i}>
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
                    }}
                  >
                    {primary}
                  </div>
                  <div style={{ color: accent }}>
                    {[secondary, item.location].filter(Boolean).join(" • ")}
                  </div>
                </div>
                <div
                  style={{
                    color: "var(--secondary-text-color)",
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
    </Section>
  );
}

function ProjectBlock({ resume }: { resume: ResumeData }) {
  if (!shown(resume, "projects")) return null;
  const items = resume.sections.projects.filter((x) => x.name);
  if (!items.length) return null;
  const accent = resume.customization.primaryColor;
  return (
    <Section title="Projects" accent={accent} template={resume.customization.selectedTemplate}>
      <Stack>
        {items.map((item, i) => (
          <article key={i}>
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
                  }}
                >
                  {item.name}
                </div>
                {item.subtitle && (
                  <span
                    style={{ color: accent, fontSize: "0.85em" }}
                  >
                    {item.subtitle}
                  </span>
                )}
              </div>
            </div>
            {item.description ? <RichText text={item.description} /> : null}
            {item.technologies ? (
              <p style={{ color: "var(--secondary-text-color)", fontSize: "0.85em", marginTop: 2 }}>
                <strong>Tech:</strong> {item.technologies}
              </p>
            ) : null}
          </article>
        ))}
      </Stack>
    </Section>
  );
}

function SkillBlock({ resume }: { resume: ResumeData }) {
  const showSkills = shown(resume, "skills");
  if (!showSkills) return null;
  const groups = resume.sections.skills.filter((g) => g.title || g.items.length);
  if (!groups.length) return null;
  const accent = resume.customization.primaryColor;
  const isColumns = resume.customization.skillsLayout === "columns";
  const cols = resume.customization.skillsColumns;
  return (
    <Section title="Skills" accent={accent} template={resume.customization.selectedTemplate}>
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
                style={{ fontWeight: 600, fontSize: "0.9em", marginBottom: 2 }}
              >
                {g.title}
              </div>
            )}
            <div style={{ color: "var(--secondary-text-color)" }}>{g.items.join(" • ")}</div>
          </div>
        ))}
      </div>
    </Section>
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
  const accent = isSidebar ? "rgba(255,255,255,0.9)" : customization.primaryColor;
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
      return <WorkBlock resume={resume} />;
    case "projects":
      return <ProjectBlock resume={resume} />;
    case "education":
      return <EducationBlock resume={resume} />;
    case "skills":
      return <SkillBlock resume={resume} />;
    case "websites":
      return null;
    case "achievements":
      if (!sections.achievements.length) return null;
      return (
        <SectionWrapper title={title}>
          <Stack>
            {sections.achievements.map((item, i) => (
              <article key={i}>
                <div style={{ fontWeight: 600, fontFamily: "var(--heading-font, Arial)" }}>
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
                <div style={{ fontWeight: 600, fontFamily: "var(--heading-font, Arial)" }}>
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
                    <div style={{ fontWeight: 600, fontFamily: "var(--heading-font, Arial)" }}>
                      {item.role}
                    </div>
                    <div style={{ color: isSidebar ? "rgba(255,255,255,0.8)" : accent }}>{item.company}</div>
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
                <div style={{ fontWeight: 600 }}>{r.name}</div>
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
                <div style={{ fontWeight: 600 }}>{a.title}</div>
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
                <div style={{ fontWeight: 600 }}>{c.name}</div>
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
                <div style={{ fontWeight: 600 }}>{a.organization}</div>
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
                <div style={{ fontWeight: 600 }}>{t.name}</div>
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
                <div style={{ fontWeight: 600 }}>{v.role}</div>
                <div style={{ color: isSidebar ? "rgba(255,255,255,0.9)" : accent, fontSize: "0.85em" }}>
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
                <div style={{ fontWeight: 600 }}>{a.title}</div>
                <div style={{ color: isSidebar ? "rgba(255,255,255,0.9)" : accent, fontSize: "0.85em" }}>
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
                <div style={{ fontWeight: 600 }}>{item.title}</div>
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
                <div style={{ fontWeight: 600 }}>{item.title}</div>
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
    color: accent,
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
      {shown(resume, "personalDetails") && (
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
      <Footer footerText={headerFooter.footerText} />
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
        {shown(resume, "personalDetails") && (
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
        <Footer footerText={headerFooter.footerText} />
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
      {shown(resume, "personalDetails") && (
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
      <Footer footerText={headerFooter.footerText} />
    </div>
  );
}

// ── Layout map ────────────────────────────────────────────────────────────────

const LAYOUTS: Record<string, React.ComponentType<{ resume: ResumeData }>> = {
  classic: ClassicLayout,
  professional: ProfessionalLayout,
  specialist: SpecialistLayout,
  "steady-form": ClassicLayout,
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
    if (!pageRef.current) return;
    const page = pageRef.current;
    
    // Find elements that shouldn't break across pages
    const breakableElements = Array.from(
      page.querySelectorAll("section, article, footer, .avoid-break")
    ) as HTMLElement[];
    
    // Reset all previous dynamic margins
    breakableElements.forEach(el => {
      if (!el.hasAttribute('data-original-margin')) {
        el.setAttribute('data-original-margin', getComputedStyle(el).marginTop);
      }
      el.style.marginTop = el.getAttribute('data-original-margin') || "";
    });

    let currentBoundary = pageMinHeight;
    
    for (let i = 0; i < breakableElements.length; i++) {
      const el = breakableElements[i];
      const rect = el.getBoundingClientRect();
      const top = rect.top - page.getBoundingClientRect().top;
      const bottom = top + rect.height;
      
      // If the element straddles a page boundary
      if (bottom > currentBoundary && top < currentBoundary) {
        // Only push it down if it's smaller than a full page
        // (if it's larger, we have to let it break anyway)
        if (rect.height < pageMinHeight) {
          const pushAmount = currentBoundary - top;
          const originalMargin = parseFloat(el.getAttribute('data-original-margin') || "0") || 0;
          
          // Apply the dynamic margin to push it to the next page
          // (We use a special custom property so our print stylesheet can unset it)
          el.style.marginTop = `${originalMargin + pushAmount}px`;
          el.classList.add('js-page-break-element');
          
          // Advance the boundary based on the new position
          const newTop = el.getBoundingClientRect().top - page.getBoundingClientRect().top;
          currentBoundary = Math.ceil((newTop + 1) / pageMinHeight) * pageMinHeight;
        }
      } else if (top >= currentBoundary) {
        currentBoundary = Math.ceil((top + 1) / pageMinHeight) * pageMinHeight;
      }
    }
  }, [resume, activeTemplate, pageMinHeight]);

  const cssVars = {
    "--spacing-multiplier": 1,
    "--accent-color": customization.primaryColor,
    "--primary-text-color": customization.primaryTextColor ?? "#111827",
    "--secondary-text-color": customization.secondaryTextColor ?? "#475569",
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
    "--inner-padding": `calc(${customization.contentInnerPadding}px * var(--spacing-multiplier, 1))`,
    "--title-gap": `calc(${customization.titleContentGap}px * var(--spacing-multiplier, 1))`,
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
            color: "var(--primary-text-color)",
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
