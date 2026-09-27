import type { PersonalRecord, WorkoutSession } from './types'

// Stateless helpers only. All persistence now lives in Supabase
// (see components/app-provider.tsx and lib/supabase/); nothing here
// touches localStorage anymore.

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function sessionVolume(exercises: WorkoutSession['exercises']): number {
  return exercises.reduce(
    (total, ex) =>
      total +
      ex.sets.reduce((s, set) => (set.completed ? s + set.weight * set.reps : s), 0),
    0,
  )
}

// Compute personal records for a given user from their sessions.
export function computePRs(sessions: WorkoutSession[]): PersonalRecord[] {
  const map = new Map<string, PersonalRecord>()
  for (const session of sessions) {
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (!set.completed || set.weight <= 0) continue
        const volume = set.weight * set.reps
        const current = map.get(ex.name)
        if (!current) {
          map.set(ex.name, {
            exercise: ex.name,
            muscle: ex.muscle,
            maxWeight: set.weight,
            bestVolume: volume,
            reps: set.reps,
            date: session.date,
          })
        } else {
          if (set.weight > current.maxWeight) {
            current.maxWeight = set.weight
            current.reps = set.reps
            current.date = session.date
          }
          if (volume > current.bestVolume) current.bestVolume = volume
        }
      }
    }
  }
  return [...map.values()].sort((a, b) => b.maxWeight - a.maxWeight)
}

// Best previous set (by weight) for an exercise, excluding a session id.
export function previousBest(
  sessions: WorkoutSession[],
  exerciseName: string,
  excludeSessionId?: string,
): { weight: number; reps: number } | null {
  let best: { weight: number; reps: number } | null = null
  for (const session of sessions) {
    if (session.id === excludeSessionId) continue
    for (const ex of session.exercises) {
      if (ex.name !== exerciseName) continue
      for (const set of ex.sets) {
        if (!set.completed) continue
        if (!best || set.weight > best.weight) best = { weight: set.weight, reps: set.reps }
      }
    }
  }
  return best
}

function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}

// Consecutive-day streak ending today (or yesterday if not trained today).
export function computeStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0
  const days = new Set(sessions.map((s) => dayKey(s.date)))
  let streak = 0
  const cursor = new Date()
  // allow the streak to still count if the last workout was yesterday
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(cursor.toISOString().slice(0, 10))) return 0
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function startOfWeek(d = new Date()): Date {
  const date = new Date(d)
  const day = (date.getDay() + 6) % 7 // Monday = 0
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - day)
  return date
}

export function weeklyVolume(sessions: WorkoutSession[]): number {
  const start = startOfWeek()
  return sessions
    .filter((s) => new Date(s.date) >= start)
    .reduce((t, s) => t + s.totalVolume, 0)
}
