import type { Goal } from './types'

export interface MacroInput {
  gender: 'Mashkull' | 'Femër'
  age: number
  height: number // cm
  weight: number // kg
  activity: number // multiplier
  goal: Goal
}

export interface MacroResult {
  bmr: number
  tdee: number
  calories: number
  protein: number // g
  carbs: number // g
  fat: number // g
}

export const ACTIVITY_LEVELS = [
  { label: 'Sedentar (pak ose aspak)', value: 1.2 },
  { label: 'I lehtë (1-3 ditë/javë)', value: 1.375 },
  { label: 'Mesatar (3-5 ditë/javë)', value: 1.55 },
  { label: 'Aktiv (6-7 ditë/javë)', value: 1.725 },
  { label: 'Shumë aktiv (atlet)', value: 1.9 },
]

export function calculateMacros(input: MacroInput): MacroResult {
  const { gender, age, height, weight, activity, goal } = input
  // Mifflin-St Jeor
  const base = 10 * weight + 6.25 * height - 5 * age
  const bmr = gender === 'Mashkull' ? base + 5 : base - 161
  const tdee = bmr * activity

  let calories = tdee
  if (goal === 'Bulking') calories = tdee + 400
  if (goal === 'Cutting') calories = tdee - 500

  // protein 2g/kg, fat 25% of calories, rest carbs
  const protein = Math.round(weight * 2)
  const fat = Math.round((calories * 0.25) / 9)
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4)

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories: Math.round(calories),
    protein,
    carbs: Math.max(carbs, 0),
    fat,
  }
}
