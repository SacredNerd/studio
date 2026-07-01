import React from 'react'
import type { SectionKey } from '../data'

export type FormStep = {
  id: number
  label: string
  icon: string
  sections: SectionKey[]
}

export const FORM_STEPS: FormStep[] = [
  { id: 1, label: 'Header & Profile', icon: '◉', sections: ['headerFooter', 'personalDetails', 'powerStatement', 'professionalSummary', 'websites'] },
  { id: 2, label: 'Experience',       icon: '◆', sections: ['workHistory', 'achievements', 'accomplishments', 'internships', 'projects', 'additionalExperience'] },
  { id: 3, label: 'Skills & Education', icon: '◈', sections: ['skills', 'education', 'certifications', 'awards', 'affiliations', 'professionalTraining'] },
  { id: 4, label: 'Extras & Custom',  icon: '⊕', sections: ['volunteering', 'languages', 'hobbies', 'references', 'customSimple', 'customAdvanced'] },
]

type StepNavProps = {
  currentStep: number
  completedSteps: number[]
  onStepClick: (step: number) => void
}

/** Returns the step number that contains the given section key. */
export function getStepForSection(section: SectionKey): number {
  for (const step of FORM_STEPS) {
    if (step.sections.includes(section)) return step.id
  }
  return 1
}

export function StepNav({ currentStep, completedSteps, onStepClick }: StepNavProps) {
  return (
    <div className="step-nav">
      {FORM_STEPS.map((step, index) => {
        const isActive = step.id === currentStep
        const isDone = completedSteps.includes(step.id)

        let itemClass = 'step-item'
        if (isActive) itemClass += ' step-item-active'
        else if (isDone) itemClass += ' step-item-done'

        return (
          <React.Fragment key={step.id}>
            <button
              className={itemClass}
              onClick={() => onStepClick(step.id)}
              type="button"
            >
              <span className="step-dot">
                {isDone && !isActive ? '✓' : step.id}
              </span>
              <span className="step-label">{step.label}</span>
            </button>
            {index < FORM_STEPS.length - 1 && (
              <div className="step-connector" aria-hidden="true" />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
