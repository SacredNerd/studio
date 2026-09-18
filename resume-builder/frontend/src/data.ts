export type HeaderFooterSettings = {
  documentTitle: string;
  language: string;
  showPageNumbers: boolean;
  footerText: string;
};

export type PersonalDetails = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  photo?: string;
};

export type SocialLink = {
  label: string;
  value: string;
};

export type SkillCategory = {
  title: string;
  items: string[];
};

export type TechnicalProficiency = {
  category: string;
  items: string[];
};

export type EducationItem = {
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string;
};

export type ExperienceItem = {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string[];
};

export type AchievementItem = {
  title: string;
  description: string;
};

export type AccomplishmentItem = {
  title: string;
  description: string;
};

export type ProjectItem = {
  name: string;
  description: string;
  technologies: string;
  startDate: string;
  endDate: string;
};

export type InternshipItem = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type TrainingItem = {
  name: string;
  provider: string;
  date: string;
  details: string;
};

export type AdditionalExperienceItem = {
  title: string;
  organization: string;
  date: string;
  description: string;
};

export type VolunteeringItem = {
  role: string;
  organization: string;
  date: string;
  description: string;
};

export type LanguageItem = {
  name: string;
  level: string;
};

export type CustomSectionItem = {
  title: string;
  description: string;
};

export type HobbyItem = {
  name: string;
};

export type ReferenceItem = {
  name: string;
  title: string;
  contact: string;
};

export type AwardItem = {
  title: string;
  issuer: string;
  date: string;
  description: string;
};

export type CertificationItem = {
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
};

export type AffiliationItem = {
  organization: string;
  role: string;
  date: string;
};

export type ResumeSections = {
  powerStatement: string;
  professionalSummary: string;
  websites: SocialLink[];
  skills: SkillCategory[];
  technicalProficiencies: TechnicalProficiency[];
  education: EducationItem[];
  projects: ProjectItem[];
  workHistory: ExperienceItem[];
  achievements: AchievementItem[];
  accomplishments: AccomplishmentItem[];
  internships: InternshipItem[];
  customSimple: CustomSectionItem[];
  customAdvanced: CustomSectionItem[];
  professionalTraining: TrainingItem[];
  additionalExperience: AdditionalExperienceItem[];
  volunteering: VolunteeringItem[];
  languages: LanguageItem[];
  hobbies: HobbyItem[];
  references: ReferenceItem[];
  awards: AwardItem[];
  certifications: CertificationItem[];
  affiliations: AffiliationItem[];
};

export type SectionKey =
  | "headerFooter"
  | "personalDetails"
  | keyof ResumeSections;

export type TemplateKey =
  | "classic"
  | "professional"
  | "specialist"
  | "steady-form"
  | "corporate"
  | "vivid"
  | "funky";
export type HeaderAlignment = "left" | "center" | "right";
export type DateAlignment = "left" | "right";
export type LocationAlignment = "left" | "right";
export type SkillsLayout = "inline" | "columns";
export type CategorizedSkillsLayout = "inline" | "categories";
export type EducationBy = "institution" | "degree";
export type EducationLayout = "stacked" | "inline";
export type FontWeightOption = "Regular" | "Medium" | "SemiBold" | "Bold";

export type TextStyleOption = {
  italic: boolean;
  underline: boolean;
};

export type ResumeCustomization = {
  selectedTemplate: TemplateKey;
  primaryColor: string;
  primaryFont: string;
  secondaryFont: string;
  lineHeight: number;
  fontSizes: {
    primaryHeading: number;
    secondaryHeading: number;
    body: number;
    sectionTitles: number;
  };
  fontWeights: {
    primaryHeading: FontWeightOption;
    secondaryHeading: FontWeightOption;
    body: FontWeightOption;
    sectionTitles: FontWeightOption;
  };
  textStyles: {
    primaryHeading: TextStyleOption;
    secondaryHeading: TextStyleOption;
    sectionTitles: TextStyleOption;
  };
  format: "US Letter (8.5” x 11”)" | "A4";
  headerFooterSpacing: number;
  marginVertical: number;
  marginHorizontal: number;
  betweenSections: number;
  titleContentGap: number;
  contentBlockGap: number;
  contentInnerPadding: number;
  dateFormat: "Short Name (Jan YYYY)" | "Numeric (MM.YYYY)" | "Year only";
  headerAlignment: HeaderAlignment;
  dateAlignment: DateAlignment;
  locationAlignment: LocationAlignment;
  skillsLayout: SkillsLayout;
  skillsColumns: number;
  categorizedSkillsLayout: CategorizedSkillsLayout;
  categoryColumnWidth: number;
  showEducationBy: EducationBy;
  educationLayout: EducationLayout;
  showPhoto: boolean;
  disabledSections: SectionKey[];
  sectionLabels: Partial<Record<SectionKey, string>>;
  sectionColumnAssignment: Partial<Record<SectionKey, "left" | "right">>;
  leftColumnWidth?: number;
  sectionOrder?: SectionKey[];
  primaryTextColor?: string;
  secondaryTextColor?: string;
  textColor?: string;
  backgroundColor?: string;
};

export type ResumeData = {
  headerFooter: HeaderFooterSettings;
  personalDetails: PersonalDetails;
  sections: ResumeSections;
  customization: ResumeCustomization;
};

export const templateCatalog: Array<{
  key: TemplateKey;
  name: string;
  description: string;
  tag: string;
}> = [
  {
    key: "classic",
    name: "Classic",
    description: "Traditional single-column layout",
    tag: "Free",
  },
  {
    key: "professional",
    name: "Professional",
    description: "Sidebar-driven modern layout",
    tag: "ATS",
  },
  {
    key: "specialist",
    name: "Specialist",
    description: "Balanced resume with strong section rhythm",
    tag: "Customized",
  },
  {
    key: "steady-form",
    name: "Steady Form",
    description: "Top-centered header, light gray background for section titles",
    tag: "New",
  },
  {
    key: "corporate",
    name: "Corporate",
    description: "Two-column layout with left border accent on section headers",
    tag: "ATS",
  },
  {
    key: "vivid",
    name: "Vivid",
    description: "Bold header banner with clean single-column layout",
    tag: "New",
  },
  {
    key: "funky",
    name: "Funky",
    description: "Cool and funky layout featuring a terracotta theme and icons",
    tag: "New",
  },
];

export const colorPresets = [
  "#c05a45", // Terracotta
  "#4f46e5", // Indigo
  "#0d9488", // Teal
  "#8b5cf6", // Violet
  "#e11d48", // Rose
  "#ea580c", // Orange
  "#16a34a", // Emerald
  "#0891b2", // Cyan
  "#d946ef", // Fuchsia
  "#f59e0b", // Amber
  "#334155", // Slate
];

export const primaryTextColorPresets = [
  "#0f172a", // Slate Ink
  "#1d4ed8", // Royal Blue
  "#0f766e", // Deep Teal
  "#9d174d", // Wine
  "#6d28d9", // Violet
  "#a16207", // Bronze
  "#000000", // True Black
];

export const secondaryTextColorPresets = [
  "#64748b", // Cool Slate
  "#0d9488", // Teal
  "#d97706", // Amber
  "#c026d3", // Fuchsia
  "#e11d48", // Rose
  "#2563eb", // Blue
  "#57534e", // Warm Gray
];

export const backgroundColorPresets = [
  "#ffffff", // Pure White
  "#fafaf9", // Warm Off-white
  "#f8fafc", // Cool Off-white
  "#f1f5f9", // Light Slate
  "#fef2f2", // Soft Blush
  "#eff6ff", // Soft Sky
];

export const textColorPresets = [
  "#1f2937", // Graphite
  "#334155", // Slate
  "#4b5563", // Cool Gray
  "#525252", // Neutral Gray
  "#3f3f46", // Zinc
  "#1c1917", // Espresso
  "#000000", // True Black
];
export const fontOptions = ["Inter", "Calibri", "Arial", "Georgia", "Poppins"];

export const sampleResume: ResumeData = {
  headerFooter: {
    documentTitle: "Untitled",
    language: "English",
    showPageNumbers: true,
    footerText: "Available upon request",
  },
  personalDetails: {
    fullName: "Ava Thompson",
    title: "Senior Product Designer",
    email: "ava.thompson@email.com",
    phone: "+1 (555) 213-9087",
    location: "Austin, Texas, USA",
    website: "avathompson.design",
    photo: "",
  },
  sections: {
    powerStatement:
      "Design leader crafting human-centered products that drive growth, clarity, and measurable business outcomes.",
    professionalSummary:
      "Product designer with 7+ years of experience creating intuitive digital products across SaaS, fintech, and hiring platforms. Skilled at translating complex workflows into elegant user experiences, leading cross-functional collaboration, and shipping measurable improvements in activation, retention, and usability.",
    websites: [
      { label: "Portfolio", value: "avathompson.design" },
      { label: "LinkedIn", value: "linkedin.com/in/avathompson" },
      { label: "Behance", value: "behance.net/avathompson" },
    ],
    skills: [
      {
        title: "Product Design",
        items: [
          "Design systems",
          "Wireframing",
          "Prototyping",
          "Interaction design",
        ],
      },
      {
        title: "Research",
        items: ["Usability testing", "Interviewing", "Journey mapping"],
      },
    ],
    technicalProficiencies: [
      {
        category: "Tools",
        items: ["Figma", "FigJam", "Notion", "Maze", "Adobe CC"],
      },
      { category: "Analytics", items: ["Mixpanel", "Amplitude", "GA4"] },
    ],
    education: [
      {
        institution: "Parsons School of Design",
        degree: "BFA in Communication Design",
        location: "New York, NY",
        startDate: "2012",
        endDate: "2016",
        details:
          "Graduated with honors. Focused on digital product design, research, and visual systems.",
      },
    ],
    projects: [
      {
        name: "Resume Builder UX Concept",
        description:
          "Designed a guided resume creation flow with template switching, smart suggestions, and real-time preview updates.",
        technologies:
          "Figma, Prototyping, UX Writing, Information Architecture",
        startDate: "2023-01",
        endDate: "2023-06",
      },
    ],
    workHistory: [
      {
        company: "Northstar Labs",
        role: "Lead Product Designer",
        location: "Remote",
        startDate: "Jan 2022",
        endDate: "Present",
        summary:
          "Led end-to-end design for growth and onboarding initiatives across a B2B workflow platform.",
        highlights: [
          "Redesigned onboarding flow and improved trial-to-paid conversion by 24%",
          "Built and scaled the design system across 4 product squads",
          "Partnered with product and engineering to launch AI-assisted content workflows",
        ],
      },
    ],
    achievements: [
      {
        title: "Design Impact Award",
        description:
          "Recognized for delivering the highest adoption lift across 3 strategic initiatives.",
      },
    ],
    accomplishments: [
      {
        title: "Speaker",
        description:
          "Presented on design systems and onboarding optimization at local product meetups.",
      },
    ],
    internships: [
      {
        company: "Blue Peak Studio",
        role: "Design Intern",
        startDate: "2015",
        endDate: "2016",
        description:
          "Supported UX research and UI production for agency clients.",
      },
    ],
    customSimple: [
      {
        title: "Personal Mission",
        description:
          "Create useful, accessible tools that help people communicate their value clearly.",
      },
    ],
    customAdvanced: [
      {
        title: "Selected Speaking",
        description:
          "Design Systems Meetup, ProductCraft Roundtable, UX Week Lightning Talk.",
      },
    ],
    professionalTraining: [
      {
        name: "Advanced UX Research",
        provider: "Nielsen Norman Group",
        date: "2021",
        details:
          "Applied mixed-method research in complex product environments.",
      },
    ],
    additionalExperience: [
      {
        title: "Mentor",
        organization: "ADPList",
        date: "2023–Present",
        description:
          "Mentor junior designers on portfolio development and career growth.",
      },
    ],
    volunteering: [
      {
        role: "Design Volunteer",
        organization: "Women Who Code",
        date: "2022–Present",
        description:
          "Support event branding and member experience improvements.",
      },
    ],
    languages: [
      { name: "English", level: "Native" },
      { name: "Spanish", level: "Professional working proficiency" },
    ],
    hobbies: [
      { name: "Illustration" },
      { name: "Cycling" },
      { name: "Travel" },
    ],
    references: [
      {
        name: "Mia Carter",
        title: "Director of Product",
        contact: "mia.carter@email.com",
      },
    ],
    awards: [
      {
        title: "Best Product Experience",
        issuer: "Austin Design Awards",
        date: "2022",
        description: "Awarded for exceptional onboarding and retention design.",
      },
    ],
    certifications: [
      {
        name: "Google UX Design Certificate",
        issuer: "Google",
        date: "2020",
        credentialId: "GUX-2020-4812",
      },
    ],
    affiliations: [
      {
        organization: "Interaction Design Association",
        role: "Member",
        date: "2019–Present",
      },
    ],
  },
  customization: {
    selectedTemplate: "specialist",
    primaryColor: "#2563eb",
    primaryFont: "Calibri",
    secondaryFont: "Arial",
    lineHeight: 1,
    fontSizes: {
      primaryHeading: 28,
      secondaryHeading: 18,
      body: 12,
      sectionTitles: 11,
    },
    fontWeights: {
      primaryHeading: "Bold",
      secondaryHeading: "SemiBold",
      body: "Regular",
      sectionTitles: "Bold",
    },
    textStyles: {
      primaryHeading: { italic: false, underline: false },
      secondaryHeading: { italic: false, underline: false },
      sectionTitles: { italic: false, underline: false },
    },
    format: "US Letter (8.5” x 11”)",
    headerFooterSpacing: 0.3,
    marginVertical: 0.25,
    marginHorizontal: 0.5,
    betweenSections: 14,
    titleContentGap: 7,
    contentBlockGap: 10,
    contentInnerPadding: 3,
    dateFormat: "Short Name (Jan YYYY)",
    headerAlignment: "left",
    dateAlignment: "right",
    locationAlignment: "right",
    skillsLayout: "inline",
    skillsColumns: 2,
    categorizedSkillsLayout: "categories",
    categoryColumnWidth: 1.3,
    showEducationBy: "institution",
    educationLayout: "stacked",
    showPhoto: true,
    disabledSections: [],
    sectionLabels: {},
    sectionColumnAssignment: {},
    leftColumnWidth: 43,
    primaryTextColor: "#1e293b",
    secondaryTextColor: "#64748b",
    textColor: "#1f2937",
    backgroundColor: "#ffffff",
  },
};
