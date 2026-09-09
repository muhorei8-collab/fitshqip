export type Level = 'Fillestar' | 'Mesatar' | 'Avancuar'
export type Unit = 'kg' | 'lb'
export type Goal = 'Bulking' | 'Cutting' | 'Maintenance'

export interface User {
  id: string
  fullName: string
  email: string
  password: string
  age: number
  height: number // cm
  weight: number // kg
  level: Level
  unit: Unit
  isAdmin: boolean
  avatarColor: string
  createdAt: string
}

export interface RoutineExercise {
  name: string
  muscle: string
  targetSets: number
}

export interface Routine {
  id: string
  ownerId: string // 'system' for preloaded
  name: string
  description: string
  exercises: RoutineExercise[]
}

export interface LoggedSet {
  weight: number
  reps: number
  completed: boolean
}

export interface LoggedExercise {
  name: string
  muscle: string
  sets: LoggedSet[]
}

export interface WorkoutSession {
  id: string
  userId: string
  routineName: string
  date: string // ISO
  durationSec: number
  exercises: LoggedExercise[]
  totalVolume: number
}

export interface BodyMetric {
  id: string
  userId: string
  date: string // ISO
  weight: number // kg
}

export interface Goals {
  userId: string
  targetWeight: number // kg body weight
  targetLifts: { exercise: string; target: number }[]
}

export interface PersonalRecord {
  exercise: string
  muscle: string
  maxWeight: number
  bestVolume: number
  reps: number
  date: string
}

export interface Exercise {
  name: string
  muscle: string
  instructions: string
}
