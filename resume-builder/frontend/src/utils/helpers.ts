import type { FontWeightOption } from '../data'

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function toTitleCase(value: string) {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim()
}

export function fontWeightValue(weight: FontWeightOption) {
  switch (weight) {
    case 'Regular':
      return 400
    case 'Medium':
      return 500
    case 'SemiBold':
      return 600
    case 'Bold':
      return 700
    default:
      return 400
  }
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function listToCsv(values: string[]) {
  return values.filter(Boolean).join(', ')
}

export function csvToList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
