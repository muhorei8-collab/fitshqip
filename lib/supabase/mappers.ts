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
    showInLeaderboard: row.leaderboard_visible ?? true,
    waterGoalMl: row.water_goal_ml ?? 2000,
    role: row.role === 'trainer' ? 'trainer' : 'client',
    coachVerified: !!row.coach_verified,
    avatarColor: row.avatar_color,
    avatarUrl: row.avatar_url ?? null,
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

// Profili publik (nga public_profiles()): vetëm ç'duhet për emra, avatarë dhe renditje.
// Fushat e ndjeshme mbeten bosh; ato i lexon vetëm pronari ose admini.
export function mapPublicProfile(row: any): User {
  return {
    id: row.id,
    fullName: row.full_name,
    email: '',
    personalId: '',
    age: 0,
    height: 0,
    weight: 0,
    level: row.level,
    unit: 'kg',
    isAdmin: false,
    showInLeaderboard: true,
    waterGoalMl: 2000,
    role: row.role === 'trainer' ? 'trainer' : 'client',
    coachVerified: !!row.coach_verified,
    avatarColor: row.avatar_color,
    avatarUrl: row.avatar_url ?? null,
    createdAt: '',
  }
}
