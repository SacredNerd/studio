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
  subtitle: string;
  description: string;
  technologies: string;
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
  | "steady-form";
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
];

export const colorPresets = [
  "#263238", // Blue Gray Dark
  "#1e3a8a", // Classic Navy
  "#004d40", // Deep Teal
  "#311b92", // Deep Purple
  "#880e4f", // Burgundy
  "#3e2723", // Dark Brown
  "#000000", // True Black
];

export const primaryTextColorPresets = [
  "#000000", // True Black
  "#111827", // Jet Black
  "#1c1917", // Dark Stone
  "#1e293b", // Charcoal
  "#0f172a", // Deep Slate
  "#172554", // Very Dark Navy
];

export const secondaryTextColorPresets = [
  "#334155", // Slate
  "#475569", // Slate Gray
  "#57534e", // Warm Stone
  "#4b5563", // Gray
  "#52525b", // Zinc Gray
  "#0f766e", // Dark Teal
];

export const backgroundColorPresets = [
  "#ffffff", // Pure White
  "#fcfcfc", // Crisp White
  "#fafaf9", // Warm Off-white
  "#f8fafc", // Cool Off-white
  "#f3f4f6", // Light Gray
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
        subtitle: "Case study",
        description:
          "Designed a guided resume creation flow with template switching, smart suggestions, and real-time preview updates.",
        technologies:
          "Figma, Prototyping, UX Writing, Information Architecture",
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
    betweenSections: 12,
    titleContentGap: 6,
    contentBlockGap: 10,
    contentInnerPadding: 2,
    dateFormat: "Short Name (Jan YYYY)",
    headerAlignment: "left",
    dateAlignment: "right",
    locationAlignment: "right",
    skillsLayout: "columns",
    skillsColumns: 4,
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
    backgroundColor: "#ffffff",
  },
};
