import type { ResumeData } from "../data";
import { toTitleCase } from "../utils/helpers";

type SectionKey =
  | "headerFooter"
  | "personalDetails"
  | "powerStatement"
  | "professionalSummary"
  | "websites"
  | "skills"
  | "technicalProficiencies"
  | "education"
  | "projects"
  | "workHistory"
  | "achievements"
  | "accomplishments"
  | "internships"
  | "customSimple"
  | "customAdvanced"
  | "professionalTraining"
  | "additionalExperience"
  | "volunteering"
  | "languages"
  | "hobbies"
  | "references"
  | "awards"
  | "certifications"
  | "affiliations";

const EMPTY_FOR: Partial<Record<SectionKey, Record<string, string>>> = {
  achievements: { title: "", description: "" },
  accomplishments: { title: "", description: "" },
  internships: {
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    description: "",
  },
  customSimple: { title: "", description: "" },
  customAdvanced: { title: "", description: "" },
  professionalTraining: { name: "", provider: "", date: "", details: "" },
  additionalExperience: {
    title: "",
    organization: "",
    date: "",
    description: "",
  },
  volunteering: { role: "", organization: "", date: "", description: "" },
  languages: { name: "", level: "" },
  hobbies: { name: "" },
  references: { name: "", title: "", contact: "" },
  awards: { title: "", issuer: "", date: "", description: "" },
  certifications: { name: "", issuer: "", date: "", credentialId: "" },
  affiliations: { organization: "", role: "", date: "" },
};

type ListEditorFn = <T>(cfg: {
  items: T[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  getLabel: (item: T, i: number) => string;
  render: (item: T, i: number) => React.ReactNode;
}) => React.ReactNode;

type FieldFn = (
  label: string,
  value: string,
  onChange: (v: string) => void,
  opts?: { textarea?: boolean; rows?: number; rich?: boolean },
) => React.ReactNode;

type Props = {
  sectionKey: SectionKey;
  resume: ResumeData;
  update: (fn: (d: ResumeData) => ResumeData) => void;
  field: FieldFn;
  listEditor: ListEditorFn;
};

export function GenericListEditor({
  sectionKey,
  resume,
  update,
  field,
  listEditor,
}: Props) {
  const empty = EMPTY_FOR[sectionKey] ?? {};
  const labelKey = Object.keys(empty)[0] ?? "name";
  const items =
    (resume.sections[sectionKey as keyof typeof resume.sections] as Array<
      Record<string, string>
    >) ?? [];

  return listEditor<Record<string, string>>({
    items,
    onAdd: () =>
      update((d) => ({
        ...d,
        sections: { ...d.sections, [sectionKey]: [...items, { ...empty }] },
      })),
    onRemove: (i) =>
      update((d) => ({
        ...d,
        sections: {
          ...d.sections,
          [sectionKey]: items.filter((_, ci) => ci !== i),
        },
      })),
    getLabel: (item, i) => item[labelKey] || `${sectionKey} ${i + 1}`,
    render: (item, i) => (
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(item).map(([k, v]) => (
          <div
            key={k}
            className={
              k === "description" || k === "details" ? "sm:col-span-2" : ""
            }
          >
            {field(
              toTitleCase(k),
              v,
              (nextV) =>
                update((d) => ({
                  ...d,
                  sections: {
                    ...d.sections,
                    [sectionKey]: items.map((e, ci) =>
                      ci === i ? { ...e, [k]: nextV } : e,
                    ),
                  },
                })),
              { textarea: k === "description" || k === "details", rows: 2 },
            )}
          </div>
        ))}
      </div>
    ),
  });
}
