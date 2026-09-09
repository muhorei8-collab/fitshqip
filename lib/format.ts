import type { Unit } from './types'

export function kgToUnit(kg: number, unit: Unit): number {
  return unit === 'lb' ? Math.round(kg * 2.20462 * 10) / 10 : kg
}

export function displayWeight(kg: number, unit: Unit): string {
  const v = kgToUnit(kg, unit)
  return `${v % 1 === 0 ? v : v.toFixed(1)} ${unit}`
}

export function formatVolume(kg: number, unit: Unit): string {
  const v = unit === 'lb' ? kg * 2.20462 : kg
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k ${unit}`
  return `${Math.round(v)} ${unit}`
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

const MONTHS_SQ = [
  'Jan',
  'Shk',
  'Mar',
  'Pri',
  'Maj',
  'Qer',
  'Kor',
  'Gus',
  'Sht',
  'Tet',
  'Nën',
  'Dhj',
]

const DAYS_SQ = ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht']

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS_SQ[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDayShort(iso: string): string {
  const d = new Date(iso)
  return `${DAYS_SQ[d.getDay()]}, ${d.getDate()} ${MONTHS_SQ[d.getMonth()]}`
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export { DAYS_SQ, MONTHS_SQ }
