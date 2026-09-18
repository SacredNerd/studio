"""Pydantic models that mirror frontend/src/data.ts (camelCase JSON).

The frontend treats the entire `ResumeData` blob as opaque from the server's
perspective — the server validates it on the way in/out and stores the JSON.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


class _CamelModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")


# ── primitive section item types ─────────────────────────────────────────────


class HeaderFooterSettings(_CamelModel):
    documentTitle: str = ""
    language: str = "English"
    showPageNumbers: bool = True
    footerText: str = ""


class PersonalDetails(_CamelModel):
    fullName: str = ""
    title: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    website: str = ""
    photo: Optional[str] = ""


class SocialLink(_CamelModel):
    label: str = ""
    value: str = ""


class SkillCategory(_CamelModel):
    title: str = ""
    items: list[str] = []


class TechnicalProficiency(_CamelModel):
    category: str = ""
    items: list[str] = []


class EducationItem(_CamelModel):
    institution: str = ""
    degree: str = ""
    location: str = ""
    startDate: str = ""
    endDate: str = ""
    details: str = ""


class ExperienceItem(_CamelModel):
    company: str = ""
    role: str = ""
    location: str = ""
    startDate: str = ""
    endDate: str = ""
    summary: str = ""
    highlights: list[str] = []


class AchievementItem(_CamelModel):
    title: str = ""
    description: str = ""


class AccomplishmentItem(_CamelModel):
    title: str = ""
    description: str = ""


class ProjectItem(_CamelModel):
    name: str = ""
    description: str = ""
    technologies: str = ""
    startDate: str = ""
    endDate: str = ""


class InternshipItem(_CamelModel):
    company: str = ""
    role: str = ""
    startDate: str = ""
    endDate: str = ""
    description: str = ""


class TrainingItem(_CamelModel):
    name: str = ""
    provider: str = ""
    date: str = ""
    details: str = ""


class AdditionalExperienceItem(_CamelModel):
    title: str = ""
    organization: str = ""
    date: str = ""
    description: str = ""


class VolunteeringItem(_CamelModel):
    role: str = ""
    organization: str = ""
    date: str = ""
    description: str = ""


class LanguageItem(_CamelModel):
    name: str = ""
    level: str = ""


class CustomSectionItem(_CamelModel):
    title: str = ""
    description: str = ""


class HobbyItem(_CamelModel):
    name: str = ""


class ReferenceItem(_CamelModel):
    name: str = ""
    title: str = ""
    contact: str = ""


class AwardItem(_CamelModel):
    title: str = ""
    issuer: str = ""
    date: str = ""
    description: str = ""


class CertificationItem(_CamelModel):
    name: str = ""
    issuer: str = ""
    date: str = ""
    credentialId: str = ""


class AffiliationItem(_CamelModel):
    organization: str = ""
    role: str = ""
    date: str = ""


# ── container types ──────────────────────────────────────────────────────────


class ResumeSections(_CamelModel):
    powerStatement: str = ""
    professionalSummary: str = ""
    websites: list[SocialLink] = []
    skills: list[SkillCategory] = []
    technicalProficiencies: list[TechnicalProficiency] = []
    education: list[EducationItem] = []
    projects: list[ProjectItem] = []
    workHistory: list[ExperienceItem] = []
    achievements: list[AchievementItem] = []
    accomplishments: list[AccomplishmentItem] = []
    internships: list[InternshipItem] = []
    customSimple: list[CustomSectionItem] = []
    customAdvanced: list[CustomSectionItem] = []
    professionalTraining: list[TrainingItem] = []
    additionalExperience: list[AdditionalExperienceItem] = []
    volunteering: list[VolunteeringItem] = []
    languages: list[LanguageItem] = []
    hobbies: list[HobbyItem] = []
    references: list[ReferenceItem] = []
    awards: list[AwardItem] = []
    certifications: list[CertificationItem] = []
    affiliations: list[AffiliationItem] = []


FontWeightOption = Literal["Regular", "Medium", "SemiBold", "Bold"]


class TextStyleOption(_CamelModel):
    italic: bool = False
    underline: bool = False


class FontSizes(_CamelModel):
    primaryHeading: int = 28
    secondaryHeading: int = 18
    body: int = 12
    sectionTitles: int = 11


class FontWeights(_CamelModel):
    primaryHeading: FontWeightOption = "Bold"
    secondaryHeading: FontWeightOption = "SemiBold"
    body: FontWeightOption = "Regular"
    sectionTitles: FontWeightOption = "Bold"


class TextStyles(_CamelModel):
    primaryHeading: TextStyleOption = TextStyleOption()
    secondaryHeading: TextStyleOption = TextStyleOption()
    sectionTitles: TextStyleOption = TextStyleOption()


class ResumeCustomization(_CamelModel):
    selectedTemplate: str = "classic"
    primaryColor: str = "#263238"
    primaryFont: str = "Calibri"
    secondaryFont: str = "Arial"
    lineHeight: float = 1.4
    fontSizes: FontSizes = FontSizes()
    fontWeights: FontWeights = FontWeights()
    textStyles: TextStyles = TextStyles()
    format: str = 'US Letter (8.5" x 11")'
    headerFooterSpacing: float = 0.3
    marginVertical: float = 0.5
    marginHorizontal: float = 0.5
    betweenSections: int = 14
    titleContentGap: int = 7
    contentBlockGap: int = 10
    contentInnerPadding: int = 3
    dateFormat: str = "Short Name (Jan YYYY)"
    headerAlignment: str = "left"
    dateAlignment: str = "right"
    locationAlignment: str = "right"
    skillsLayout: str = "inline"
    skillsColumns: int = 2
    categorizedSkillsLayout: str = "categories"
    categoryColumnWidth: float = 1.3
    showEducationBy: str = "institution"
    educationLayout: str = "stacked"
    showPhoto: bool = True
    disabledSections: list[str] = []
    sectionLabels: dict[str, str] = {}
    sectionColumnAssignment: dict[str, str] = {}
    leftColumnWidth: Optional[float] = 43
    sectionOrder: Optional[list[str]] = None
    primaryTextColor: Optional[str] = "#111827"
    secondaryTextColor: Optional[str] = "#475569"
    textColor: Optional[str] = "#1f2937"
    backgroundColor: Optional[str] = "#ffffff"


class ResumeData(_CamelModel):
    headerFooter: HeaderFooterSettings = HeaderFooterSettings()
    personalDetails: PersonalDetails = PersonalDetails()
    sections: ResumeSections = ResumeSections()
    customization: ResumeCustomization = ResumeCustomization()


# ── API envelope ─────────────────────────────────────────────────────────────


class ResumeEntry(_CamelModel):
    id: str
    name: str
    createdAt: str
    updatedAt: str
    data: ResumeData


class ResumeSummary(_CamelModel):
    id: str
    name: str
    createdAt: str
    updatedAt: str


class CreateResumeRequest(_CamelModel):
    name: Optional[str] = None
    data: Optional[ResumeData] = None


class UpdateResumeRequest(_CamelModel):
    name: Optional[str] = None
    data: Optional[ResumeData] = None
