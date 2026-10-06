import type { BodyMetric, Goals, Routine, User, WorkoutSession } from '@/lib/types'

// Supabase rows are snake_case; the app's UI types are camelCase.
// These mappers keep that boundary in one place.

export function mapProfile(row: any): User {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    personalId: row.personal_id ?? '',
    age: row.age,
    height: row.height,
    weight: row.weight,
    level: row.level,
    unit: row.unit,
    isAdmin: row.is_admin,
    avatarColor: row.avatar_color,
    createdAt: row.created_at,
  }
}

export function mapSession(row: any): WorkoutSession {
  return {
    id: row.id,
    userId: row.user_id,
    routineName: row.routine_name,
    date: row.date,
    durationSec: row.duration_sec,
    exercises: row.exercises,
    totalVolume: row.total_volume,
  }
}

export function mapRoutine(row: any): Routine {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description,
    exercises: row.exercises,
  }
}

export function mapMetric(row: any): BodyMetric {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    weight: row.weight,
  }
}

export function mapGoals(row: any): Goals {
  return {
    userId: row.user_id,
    targetWeight: row.target_weight,
    targetLifts: row.target_lifts,
  }
}
