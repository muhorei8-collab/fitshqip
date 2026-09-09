import type { BodyMetric, User, WorkoutSession } from './types'
import { SYSTEM_ROUTINES } from './exercises'
import { sessionVolume, store, uid } from './storage'

const AVATAR_COLORS = ['#E5352B', '#22D3A8', '#F59E0B', '#6366F1', '#EC4899', '#0EA5E9']

function daysAgo(n: number, hour = 18): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

function makeSession(
  userId: string,
  routineIndex: number,
  day: number,
  strength: number,
): WorkoutSession {
  const routine = SYSTEM_ROUTINES[routineIndex % SYSTEM_ROUTINES.length]
  const exercises = routine.exercises.map((re) => {
    const base = 20 + Math.round(strength * (re.muscle === 'Këmbë' ? 4 : re.muscle === 'Gjoks' ? 3 : 1.6))
    const sets = Array.from({ length: re.targetSets }, (_, i) => ({
      weight: base + i * 2.5 - day * 0.3,
      reps: 8 + (i % 3),
      completed: true,
    })).map((s) => ({ ...s, weight: Math.max(10, Math.round(s.weight * 2) / 2) }))
    return { name: re.name, muscle: re.muscle, sets }
  })
  const session: WorkoutSession = {
    id: uid('sess'),
    userId,
    routineName: routine.name,
    date: daysAgo(day),
    durationSec: 2400 + Math.round(Math.random() * 1800),
    exercises,
    totalVolume: 0,
  }
  session.totalVolume = sessionVolume(exercises)
  return session
}

export function seedIfNeeded() {
  if (typeof window === 'undefined') return
  if (store.isSeeded()) return

  const admin: User = {
    id: 'user-admin',
    fullName: 'Rei Muho',
    email: 'admin@fitshqip.al',
    password: 'admin123',
    age: 24,
    height: 182,
    weight: 84,
    level: 'Avancuar',
    unit: 'kg',
    isAdmin: true,
    avatarColor: '#E5352B',
    createdAt: daysAgo(120),
  }

  const sampleUsers: User[] = [
    {
      id: 'user-arben',
      fullName: 'Arben Krasniqi',
      email: 'arben@fitshqip.al',
      password: 'arben123',
      age: 28,
      height: 178,
      weight: 80,
      level: 'Avancuar',
      unit: 'kg',
      isAdmin: false,
      avatarColor: AVATAR_COLORS[3],
      createdAt: daysAgo(90),
    },
    {
      id: 'user-elira',
      fullName: 'Elira Hoxha',
      email: 'elira@fitshqip.al',
      password: 'elira123',
      age: 25,
      height: 168,
      weight: 62,
      level: 'Mesatar',
      unit: 'kg',
      isAdmin: false,
      avatarColor: AVATAR_COLORS[4],
      createdAt: daysAgo(60),
    },
    {
      id: 'user-driton',
      fullName: 'Driton Berisha',
      age: 32,
      email: 'driton@fitshqip.al',
      password: 'driton123',
      height: 185,
      weight: 92,
      level: 'Avancuar',
      unit: 'kg',
      isAdmin: false,
      avatarColor: AVATAR_COLORS[5],
      createdAt: daysAgo(45),
    },
    {
      id: 'user-fatjona',
      fullName: 'Fatjona Leka',
      email: 'fatjona@fitshqip.al',
      password: 'fatjona123',
      age: 22,
      height: 165,
      weight: 58,
      level: 'Fillestar',
      unit: 'kg',
      isAdmin: false,
      avatarColor: AVATAR_COLORS[1],
      createdAt: daysAgo(20),
    },
  ]

  const users = [admin, ...sampleUsers]

  const sessions: WorkoutSession[] = []
  const metrics: BodyMetric[] = []

  const strengthByUser: Record<string, number> = {
    'user-admin': 12,
    'user-arben': 11,
    'user-elira': 7,
    'user-driton': 13,
    'user-fatjona': 5,
  }

  // Training days over the last ~28 days for each user (recent + streaks)
  const scheduleByUser: Record<string, number[]> = {
    'user-admin': [0, 1, 2, 4, 6, 8, 11, 13, 15, 18, 21, 24],
    'user-arben': [0, 2, 3, 5, 7, 10, 12, 15, 20, 25],
    'user-elira': [1, 3, 6, 9, 13, 17, 22],
    'user-driton': [0, 1, 2, 3, 6, 8, 10, 14, 16, 19, 23, 26],
    'user-fatjona': [2, 5, 9, 14, 19],
  }

  for (const user of users) {
    const strength = strengthByUser[user.id] ?? 8
    const schedule = scheduleByUser[user.id] ?? [1, 4, 8]
    schedule.forEach((day, i) => {
      sessions.push(makeSession(user.id, i, day, strength))
    })
    // body metrics trend
    for (let w = 8; w >= 0; w--) {
      metrics.push({
        id: uid('bm'),
        userId: user.id,
        date: daysAgo(w * 7),
        weight: Math.round((user.weight - w * 0.25 + (Math.random() - 0.5)) * 10) / 10,
      })
    }
  }

  store.setUsers(users)
  store.setSessions(sessions)
  store.setMetrics(metrics)
  store.setRoutines([])
  store.setGoals([
    { userId: 'user-admin', targetWeight: 88, targetLifts: [{ exercise: 'Bench Press me Shufër', target: 120 }] },
  ])
  store.setSeeded()
}
