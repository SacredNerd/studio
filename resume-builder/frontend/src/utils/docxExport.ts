/**
 * docxExport.ts
 *
 * Exports resume data to a .docx file using the `docx` (v8) and `file-saver` packages.
 * Install: npm install docx file-saver
 *          npm install -D @types/file-saver
 */

import {
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
  convertInchesToTwip,
} from "docx";
import { saveAs } from "file-saver";
import type { ResumeData } from "../data";

// ─── Font resolution ─────────────────────────────────────────────────────────

const WORD_SAFE_FONTS = new Set([
  "Arial",
  "Calibri",
  "Georgia",
  "Times New Roman",
  "Verdana",
  "Trebuchet MS",
  "Helvetica",
  "Garamond",
  "Tahoma",
  "Courier New",
]);

function resolveFont(primaryFont: string): string {
  return WORD_SAFE_FONTS.has(primaryFont) ? primaryFont : "Calibri";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** A blank spacer paragraph between content blocks. */
function spacer(): Paragraph {
  return new Paragraph({ children: [new TextRun("")], spacing: { after: 0 } });
}

/** ALL-CAPS bold section heading with a bottom rule. */
function sectionHeading(title: string, font: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 20, // 10 pt
        font,
        color: "222222",
      }),
    ],
    spacing: { before: 240, after: 80 },
    border: {
      bottom: {
        color: "444444",
        space: 2,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
}

/** Bullet point via a bullet character + indentation (no numbering config needed). */
function bulletPara(text: string, font: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `\u2022  ${text}`, size: 22, font })],
    indent: { left: convertInchesToTwip(0.2) },
    spacing: { after: 40 },
  });
}

// ─── Section builders ─────────────────────────────────────────────────────────

type Para = Paragraph;

function buildName(fullName: string, font: string): Para {
  return new Paragraph({
    children: [
      new TextRun({
        text: fullName || "Your Name",
        bold: true,
        size: 64, // 32 pt
        font,
      }),
    ],
    spacing: { after: 60 },
  });
}

function buildTitle(title: string, font: string): Para {
  return new Paragraph({
    children: [
      new TextRun({
        text: title,
        italics: true,
        size: 28, // 14 pt
        font,
        color: "555555",
      }),
    ],
    spacing: { after: 80 },
  });
}

function buildContact(parts: string[], font: string): Para {
  return new Paragraph({
    children: [
      new TextRun({
        text: parts.join("  \u2022  "),
        size: 20, // 10 pt
        font,
        color: "444444",
      }),
    ],
    spacing: { after: 160 },
  });
}

// ─── Main export function ─────────────────────────────────────────────────────

export async function exportToDocx(resume: ResumeData): Promise<void> {
  const { personalDetails, sections, headerFooter, customization } = resume;
  const font = resolveFont(customization.primaryFont);
  const children: Paragraph[] = [];

  // ── Header ──────────────────────────────────────────────────────────────────
  children.push(buildName(personalDetails.fullName, font));

  if (personalDetails.title?.trim()) {
    children.push(buildTitle(personalDetails.title, font));
  }

  const contactParts = [
    personalDetails.email,
    personalDetails.phone,
    personalDetails.location,
    personalDetails.website,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    children.push(buildContact(contactParts, font));
  }

  // ── Power Statement ──────────────────────────────────────────────────────────
  if (sections.powerStatement?.trim()) {
    children.push(sectionHeading("Power Statement", font));
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sections.powerStatement,
            size: 22,
            font,
            italics: true,
          }),
        ],
        spacing: { after: 100 },
      }),
    );
  }

  // ── Professional Summary ─────────────────────────────────────────────────────
  if (sections.professionalSummary?.trim()) {
    children.push(sectionHeading("Professional Summary", font));
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: sections.professionalSummary, size: 22, font }),
        ],
        spacing: { after: 100 },
      }),
    );
  }

  // ── Work History ─────────────────────────────────────────────────────────────
  if (sections.workHistory?.length > 0) {
    children.push(sectionHeading("Work History", font));
    sections.workHistory.forEach((job, idx) => {
      const dateLine = [job.startDate, job.endDate]
        .filter(Boolean)
        .join(" \u2013 ");
      const header = [job.role, job.company, job.location].filter(Boolean);

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: header.join("  |  "),
              bold: true,
              size: 24,
              font,
            }),
            ...(dateLine
              ? [
                  new TextRun({
                    text: `     ${dateLine}`,
                    size: 22,
                    font,
                    color: "666666",
                  }),
                ]
              : []),
          ],
          spacing: { before: idx > 0 ? 140 : 0, after: 40 },
        }),
      );

      if (job.summary?.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: job.summary, size: 22, font })],
            spacing: { after: 40 },
          }),
        );
      }

      job.highlights?.filter(Boolean).forEach((h) => {
        children.push(bulletPara(h, font));
      });
    });
  }

  // ── Education ────────────────────────────────────────────────────────────────
  if (sections.education?.length > 0) {
    children.push(sectionHeading("Education", font));
    sections.education.forEach((edu, idx) => {
      const dateLine = [edu.startDate, edu.endDate]
        .filter(Boolean)
        .join(" \u2013 ");

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.institution, bold: true, size: 24, font }),
            ...(edu.location
              ? [
                  new TextRun({
                    text: `     ${edu.location}`,
                    size: 22,
                    font,
                    color: "666666",
                  }),
                ]
              : []),
          ],
          spacing: { before: idx > 0 ? 140 : 0, after: 20 },
        }),
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, italics: true, size: 22, font }),
            ...(dateLine
              ? [
                  new TextRun({
                    text: `     ${dateLine}`,
                    size: 22,
                    font,
                    color: "666666",
                  }),
                ]
              : []),
          ],
          spacing: { after: 40 },
        }),
      );

      if (edu.details?.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: edu.details, size: 22, font })],
            spacing: { after: 40 },
          }),
        );
      }
    });
  }

  // ── Skills ───────────────────────────────────────────────────────────────────
  if (sections.skills?.length > 0) {
    children.push(sectionHeading("Skills", font));
    sections.skills.forEach((group, idx) => {
      const items = group.items.filter(Boolean).join(", ");
      const line = group.title ? `${group.title}: ${items}` : items;
      if (!line.trim()) return;
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line, size: 22, font })],
          spacing: { before: idx > 0 ? 60 : 0, after: 40 },
        }),
      );
    });
  }

  // ── Technical Proficiencies ───────────────────────────────────────────────────
  if (sections.technicalProficiencies?.length > 0) {
    children.push(sectionHeading("Technical Proficiencies", font));
    sections.technicalProficiencies.forEach((group, idx) => {
      const items = group.items.filter(Boolean).join(", ");
      const line = group.category ? `${group.category}: ${items}` : items;
      if (!line.trim()) return;
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line, size: 22, font })],
          spacing: { before: idx > 0 ? 60 : 0, after: 40 },
        }),
      );
    });
  }

  // ── Projects ─────────────────────────────────────────────────────────────────
  if (sections.projects?.length > 0) {
    children.push(sectionHeading("Projects", font));
    sections.projects.forEach((proj, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.name, bold: true, size: 24, font }),
            ...(proj.startDate || proj.endDate
              ? [
                  new TextRun({
                    text: `  (${[proj.startDate, proj.endDate].filter(Boolean).join(" – ")})`,
                    size: 20,
                    font,
                    color: "666666",
                  }),
                ]
              : []),
          ],
          spacing: { before: idx > 0 ? 140 : 0, after: 40 },
        }),
      );
      if (proj.technologies?.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Technologies: ${proj.technologies}`,
                italics: true,
                size: 20,
                font,
                color: "666666",
              }),
            ],
            spacing: { after: 40 },
          }),
        );
      }
      if (proj.description?.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: proj.description, size: 22, font })],
            spacing: { after: 40 },
          }),
        );
      }
    });
  }

  // ── Certifications ────────────────────────────────────────────────────────────
  if (sections.certifications?.length > 0) {
    children.push(sectionHeading("Certifications", font));
    sections.certifications.forEach((cert, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: cert.name, bold: true, size: 22, font }),
            ...(cert.issuer
              ? [new TextRun({ text: `  |  ${cert.issuer}`, size: 22, font })]
              : []),
            ...(cert.date
              ? [
                  new TextRun({
                    text: `  (${cert.date})`,
                    size: 22,
                    font,
                    color: "666666",
                  }),
                ]
              : []),
          ],
          spacing: { before: idx > 0 ? 100 : 0, after: 20 },
        }),
      );
      if (cert.credentialId?.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Credential ID: ${cert.credentialId}`,
                size: 20,
                font,
                color: "777777",
              }),
            ],
            spacing: { after: 40 },
          }),
        );
      }
    });
  }

  // ── Awards ────────────────────────────────────────────────────────────────────
  if (sections.awards?.length > 0) {
    children.push(sectionHeading("Awards", font));
    sections.awards.forEach((award, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: award.title, bold: true, size: 22, font }),
            ...(award.issuer
              ? [new TextRun({ text: `  |  ${award.issuer}`, size: 22, font })]
              : []),
            ...(award.date
              ? [
                  new TextRun({
                    text: `  (${award.date})`,
                    size: 22,
                    font,
                    color: "666666",
                  }),
                ]
              : []),
          ],
          spacing: { before: idx > 0 ? 100 : 0, after: 20 },
        }),
      );
      if (award.description?.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: award.description, size: 22, font }),
            ],
            spacing: { after: 40 },
          }),
        );
      }
    });
  }

  // ── Achievements ──────────────────────────────────────────────────────────────
  if (sections.achievements?.length > 0) {
    children.push(sectionHeading("Achievements", font));
    sections.achievements.forEach((item, idx) => {
      if (item.title?.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.title, bold: true, size: 22, font }),
            ],
            spacing: { before: idx > 0 ? 100 : 0, after: 20 },
          }),
        );
      }
      if (item.description?.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: item.description, size: 22, font })],
            spacing: { after: 40 },
          }),
        );
      }
    });
  }

  // ── Accomplishments ───────────────────────────────────────────────────────────
  if (sections.accomplishments?.length > 0) {
    children.push(sectionHeading("Accomplishments", font));
    sections.accomplishments.forEach((item, idx) => {
      if (item.title?.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.title, bold: true, size: 22, font }),
            ],
            spacing: { before: idx > 0 ? 100 : 0, after: 20 },
          }),
        );
      }
      if (item.description?.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: item.description, size: 22, font })],
            spacing: { after: 40 },
          }),
        );
      }
    });
  }

  // ── Affiliations ──────────────────────────────────────────────────────────────
  if (sections.affiliations?.length > 0) {
    children.push(sectionHeading("Affiliations", font));
    sections.affiliations.forEach((aff, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: aff.organization, bold: true, size: 22, font }),
            ...(aff.role
              ? [new TextRun({ text: `  |  ${aff.role}`, size: 22, font })]
              : []),
            ...(aff.date
              ? [
                  new TextRun({
                    text: `  (${aff.date})`,
                    size: 22,
                    font,
                    color: "666666",
                  }),
                ]
              : []),
          ],
          spacing: { before: idx > 0 ? 80 : 0, after: 40 },
        }),
      );
    });
  }

  // ── Professional Training ─────────────────────────────────────────────────────
  if (sections.professionalTraining?.length > 0) {
    children.push(sectionHeading("Professional Training", font));
    sections.professionalTraining.forEach((t, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: t.name, bold: true, size: 22, font }),
            ...(t.provider
              ? [new TextRun({ text: `  |  ${t.provider}`, size: 22, font })]
              : []),
            ...(t.date
              ? [
                  new TextRun({
                    text: `  (${t.date})`,
                    size: 22,
                    font,
                    color: "666666",
                  }),
                ]
              : []),
          ],
          spacing: { before: idx > 0 ? 100 : 0, after: 20 },
        }),
      );
      if (t.details?.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: t.details, size: 22, font })],
            spacing: { after: 40 },
          }),
        );
      }
    });
  }

  // ── Additional Experience ─────────────────────────────────────────────────────
  if (sections.additionalExperience?.length > 0) {
    children.push(sectionHeading("Additional Experience", font));
    sections.additionalExperience.forEach((exp, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true, size: 22, font }),
            ...(exp.organization
              ? [
                  new TextRun({
                    text: `  |  ${exp.organization}`,
                    size: 22,
                    font,
                  }),
                ]
              : []),
            ...(exp.date
              ? [
                  new TextRun({
                    text: `  (${exp.date})`,
                    size: 22,
                    font,
                    color: "666666",
                  }),
                ]
              : []),
          ],
          spacing: { before: idx > 0 ? 100 : 0, after: 20 },
        }),
      );
      if (exp.description?.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: exp.description, size: 22, font })],
            spacing: { after: 40 },
          }),
        );
      }
    });
  }

  // ── Volunteering ──────────────────────────────────────────────────────────────
  if (sections.volunteering?.length > 0) {
    children.push(sectionHeading("Volunteering", font));
    sections.volunteering.forEach((vol, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: vol.role, bold: true, size: 22, font }),
            ...(vol.organization
              ? [
                  new TextRun({
                    text: `  |  ${vol.organization}`,
                    size: 22,
                    font,
                  }),
                ]
              : []),
            ...(vol.date
              ? [
                  new TextRun({
                    text: `  (${vol.date})`,
                    size: 22,
                    font,
                    color: "666666",
                  }),
                ]
              : []),
          ],
          spacing: { before: idx > 0 ? 100 : 0, after: 20 },
        }),
      );
      if (vol.description?.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: vol.description, size: 22, font })],
            spacing: { after: 40 },
          }),
        );
      }
    });
  }

  // ── Internships ───────────────────────────────────────────────────────────────
  if (sections.internships?.length > 0) {
    children.push(sectionHeading("Internships", font));
    sections.internships.forEach((intern, idx) => {
      const dateLine = [intern.startDate, intern.endDate]
        .filter(Boolean)
        .join(" \u2013 ");
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: intern.role, bold: true, size: 24, font }),
            ...(intern.company
              ? [
                  new TextRun({
                    text: `  |  ${intern.company}`,
                    size: 24,
                    font,
                  }),
                ]
              : []),
            ...(dateLine
              ? [
                  new TextRun({
                    text: `     ${dateLine}`,
                    size: 22,
                    font,
                    color: "666666",
                  }),
                ]
              : []),
          ],
          spacing: { before: idx > 0 ? 140 : 0, after: 40 },
        }),
      );
      if (intern.description?.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: intern.description, size: 22, font }),
            ],
            spacing: { after: 40 },
          }),
        );
      }
    });
  }

  // ── Languages ─────────────────────────────────────────────────────────────────
  if (sections.languages?.length > 0) {
    children.push(sectionHeading("Languages", font));
    sections.languages.forEach((lang, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: lang.name, bold: true, size: 22, font }),
            ...(lang.level
              ? [
                  new TextRun({
                    text: `  \u2014  ${lang.level}`,
                    size: 22,
                    font,
                  }),
                ]
              : []),
          ],
          spacing: { before: idx > 0 ? 60 : 0, after: 40 },
        }),
      );
    });
  }

  // ── Hobbies & Interests ───────────────────────────────────────────────────────
  if (sections.hobbies?.length > 0) {
    const hobbyList = sections.hobbies
      .map((h) => h.name)
      .filter(Boolean)
      .join(", ");
    if (hobbyList) {
      children.push(sectionHeading("Hobbies & Interests", font));
      children.push(
        new Paragraph({
          children: [new TextRun({ text: hobbyList, size: 22, font })],
          spacing: { after: 100 },
        }),
      );
    }
  }

  // ── References ────────────────────────────────────────────────────────────────
  if (sections.references?.length > 0) {
    children.push(sectionHeading("References", font));
    sections.references.forEach((ref, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: ref.name, bold: true, size: 22, font }),
            ...(ref.title
              ? [new TextRun({ text: `  |  ${ref.title}`, size: 22, font })]
              : []),
          ],
          spacing: { before: idx > 0 ? 100 : 0, after: 20 },
        }),
      );
      if (ref.contact?.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: ref.contact,
                size: 22,
                font,
                color: "555555",
              }),
            ],
            spacing: { after: 40 },
          }),
        );
      }
    });
  }

  // ── Websites & Links ──────────────────────────────────────────────────────────
  if (sections.websites?.length > 0) {
    const webItems = sections.websites.filter((w) => w.value?.trim());
    if (webItems.length > 0) {
      children.push(sectionHeading("Websites & Links", font));
      webItems.forEach((w, idx) => {
        const line = w.label ? `${w.label}: ${w.value}` : w.value;
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line, size: 22, font })],
            spacing: { before: idx > 0 ? 40 : 0, after: 40 },
          }),
        );
      });
    }
  }

  // ── Custom Simple ─────────────────────────────────────────────────────────────
  if (sections.customSimple?.length > 0) {
    children.push(sectionHeading("Additional Information", font));
    sections.customSimple.forEach((item, idx) => {
      if (item.title?.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.title, bold: true, size: 22, font }),
            ],
            spacing: { before: idx > 0 ? 100 : 0, after: 20 },
          }),
        );
      }
      if (item.description?.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: item.description, size: 22, font })],
            spacing: { after: 40 },
          }),
        );
      }
    });
  }

  // ── Custom Advanced ───────────────────────────────────────────────────────────
  if (sections.customAdvanced?.length > 0) {
    children.push(sectionHeading("Custom Section", font));
    sections.customAdvanced.forEach((item, idx) => {
      if (item.title?.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.title, bold: true, size: 22, font }),
            ],
            spacing: { before: idx > 0 ? 100 : 0, after: 20 },
          }),
        );
      }
      if (item.description?.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: item.description, size: 22, font })],
            spacing: { after: 40 },
          }),
        );
      }
    });
  }

  // Ensure the document ends with something (Word requirement)
  children.push(spacer());

  // ── Assemble document ─────────────────────────────────────────────────────────
  const doc = new Document({
    creator: "Resume Builder",
    description: headerFooter.documentTitle || "Resume",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const rawTitle = headerFooter.documentTitle?.trim();
  const filename = (rawTitle || "resume") + ".docx";
  saveAs(blob, filename);
}
