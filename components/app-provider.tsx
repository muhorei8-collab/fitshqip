'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type {
  BodyMetric,
  Goals,
  Routine,
  User,
  WorkoutSession,
} from '@/lib/types'
import { uid } from '@/lib/storage'
import { SYSTEM_ROUTINES } from '@/lib/exercises'
import { supabase } from '@/lib/supabase/client'
import { mapGoals, mapMetric, mapProfile, mapRoutine, mapSession } from '@/lib/supabase/mappers'

export interface SignUpData {
  fullName: string
  email: string
  password: string
  age: number
  height: number
  weight: number
  level: User['level']
}

interface AppState {
  ready: boolean
  currentUser: User | null
  users: User[]
  sessions: WorkoutSession[] // current user's sessions
  allSessions: WorkoutSession[] // own sessions, or ALL sessions if admin (enforced by DB, not client)
  routines: Routine[] // system + current user's custom
  metrics: BodyMetric[] // current user's
  goals: Goals | null
  toast: { id: string; message: string; tone: 'success' | 'info' | 'error' } | null

  signUp: (data: SignUpData) => Promise<{ ok: boolean; error?: string }>
  logIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logOut: () => Promise<void>
  updateProfile: (patch: Partial<User>) => Promise<void>

  addSession: (s: Omit<WorkoutSession, 'id' | 'userId'>) => Promise<void>
  addRoutine: (name: string, description: string, exercises: Routine['exercises']) => Promise<void>
  deleteRoutine: (id: string) => Promise<void>
  addMetric: (weight: number) => Promise<void>
  setGoals: (g: Omit<Goals, 'userId'>) => Promise<void>
  resetData: () => Promise<void>
  showToast: (message: string, tone?: 'success' | 'info' | 'error') => void
}

const Ctx = createContext<AppState | null>(null)

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [allSessions, setAllSessions] = useState<WorkoutSession[]>([])
  const [ownRoutines, setOwnRoutines] = useState<Routine[]>([])
  const [metrics, setMetrics] = useState<BodyMetric[]>([])
  const [goals, setGoalsState] = useState<Goals | null>(null)
  const [toast, setToast] = useState<AppState['toast']>(null)

  const showToast = useCallback((message: string, tone: 'success' | 'info' | 'error' = 'info') => {
    const id = uid('toast')
    setToast({ id, message, tone })
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 3200)
  }, [])

  // Load everything that depends on the logged-in user: their own profile
  // (source of truth for isAdmin — never trusted from client state), plus
  // sessions/routines/metrics/goals. RLS on the database decides exactly
  // which rows come back, so a non-admin simply cannot receive other users'
  // rows no matter what the UI asks for.
  const loadForUser = useCallback(async (userId: string) => {
    const [profileRes, sessionsRes, routinesRes, metricsRes, goalsRes, allProfilesRes] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('workout_sessions').select('*').order('date', { ascending: false }),
        supabase.from('routines').select('*').eq('owner_id', userId),
        supabase.from('body_metrics').select('*').order('date', { ascending: true }),
        supabase.from('goals').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('profiles').select('*'),
      ])

    if (profileRes.data) setCurrentUser(mapProfile(profileRes.data))
    setAllSessions((sessionsRes.data ?? []).map(mapSession))
    setOwnRoutines((routinesRes.data ?? []).map(mapRoutine))
    setMetrics((metricsRes.data ?? []).map(mapMetric))
    setGoalsState(goalsRes.data ? mapGoals(goalsRes.data) : null)
    setUsers((allProfilesRes.data ?? []).map(mapProfile))
  }, [])

  const clearAll = useCallback(() => {
    setCurrentUser(null)
    setUsers([])
    setAllSessions([])
    setOwnRoutines([])
    setMetrics([])
    setGoalsState(null)
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      if (data.session) await loadForUser(data.session.user.id)
      setReady(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        loadForUser(newSession.user.id)
      } else {
        clearAll()
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loadForUser, clearAll])

  const sessions = useMemo(
    () => allSessions.filter((s) => s.userId === currentUser?.id),
    [allSessions, currentUser],
  )

  const routines = useMemo(() => [...SYSTEM_ROUTINES, ...ownRoutines], [ownRoutines])

  const signUp = useCallback(async (data: SignUpData) => {
    const colors = ['#E5352B', '#22D3A8', '#F59E0B', '#6366F1', '#EC4899', '#0EA5E9']
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          age: data.age,
          height: data.height,
          weight: data.weight,
          level: data.level,
          avatar_color: colors[Math.floor(Math.random() * colors.length)],
        },
      },
    })
    if (error) return { ok: false, error: translateAuthError(error.message) }
    return { ok: true }
  }, [])

  const logIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: translateAuthError(error.message) }
    return { ok: true }
  }, [])

  const logOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const updateProfile = useCallback(
    async (patch: Partial<User>) => {
      if (!currentUser) return
      const dbPatch: Record<string, unknown> = {}
      if (patch.fullName !== undefined) dbPatch.full_name = patch.fullName
      if (patch.age !== undefined) dbPatch.age = patch.age
      if (patch.height !== undefined) dbPatch.height = patch.height
      if (patch.weight !== undefined) dbPatch.weight = patch.weight
      if (patch.level !== undefined) dbPatch.level = patch.level
      if (patch.unit !== undefined) dbPatch.unit = patch.unit
      // Note: isAdmin is deliberately never sent — the database rejects it anyway.
      const { data, error } = await supabase
        .from('profiles')
        .update(dbPatch)
        .eq('id', currentUser.id)
        .select()
        .single()
      if (!error && data) {
        setCurrentUser(mapProfile(data))
        setUsers((prev) => prev.map((u) => (u.id === data.id ? mapProfile(data) : u)))
      }
    },
    [currentUser],
  )

  const addSession = useCallback(
    async (s: Omit<WorkoutSession, 'id' | 'userId'>) => {
      if (!currentUser) return
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: currentUser.id,
          routine_name: s.routineName,
          date: s.date,
          duration_sec: s.durationSec,
          exercises: s.exercises,
          total_volume: s.totalVolume,
        })
        .select()
        .single()
      if (!error && data) setAllSessions((prev) => [mapSession(data), ...prev])
    },
    [currentUser],
  )

  const addRoutine = useCallback(
    async (name: string, description: string, exercises: Routine['exercises']) => {
      if (!currentUser) return
      const { data, error } = await supabase
        .from('routines')
        .insert({ owner_id: currentUser.id, name, description, exercises })
        .select()
        .single()
      if (!error && data) setOwnRoutines((prev) => [...prev, mapRoutine(data)])
    },
    [currentUser],
  )

  const deleteRoutine = useCallback(async (id: string) => {
    const { error } = await supabase.from('routines').delete().eq('id', id)
    if (!error) setOwnRoutines((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const addMetric = useCallback(
    async (weight: number) => {
      if (!currentUser) return
      const { data, error } = await supabase
        .from('body_metrics')
        .insert({ user_id: currentUser.id, date: new Date().toISOString(), weight })
        .select()
        .single()
      if (!error && data) setMetrics((prev) => [...prev, mapMetric(data)])
      await updateProfile({ weight })
    },
    [currentUser, updateProfile],
  )

  const setGoals = useCallback(
    async (g: Omit<Goals, 'userId'>) => {
      if (!currentUser) return
      const { data, error } = await supabase
        .from('goals')
        .upsert({ user_id: currentUser.id, target_weight: g.targetWeight, target_lifts: g.targetLifts })
        .select()
        .single()
      if (!error && data) setGoalsState(mapGoals(data))
    },
    [currentUser],
  )

  const resetData = useCallback(async () => {
    if (!currentUser) return
    await Promise.all([
      supabase.from('workout_sessions').delete().eq('user_id', currentUser.id),
      supabase.from('routines').delete().eq('owner_id', currentUser.id),
      supabase.from('body_metrics').delete().eq('user_id', currentUser.id),
      supabase.from('goals').delete().eq('user_id', currentUser.id),
    ])
    setAllSessions((prev) => prev.filter((s) => s.userId !== currentUser.id))
    setOwnRoutines([])
    setMetrics([])
    setGoalsState(null)
  }, [currentUser])

  const value: AppState = {
    ready,
    currentUser,
    users,
    sessions,
    allSessions,
    routines,
    metrics,
    goals,
    toast,
    signUp,
    logIn,
    logOut,
    updateProfile,
    addSession,
    addRoutine,
    deleteRoutine,
    addMetric,
    setGoals,
    resetData,
    showToast,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('already registered') || m.includes('already exists'))
    return 'Ky email është i regjistruar tashmë.'
  if (m.includes('invalid login credentials')) return 'Email ose fjalëkalim i gabuar.'
  if (m.includes('password') && m.includes('6')) return 'Fjalëkalimi duhet të ketë të paktën 6 karaktere.'
  if (m.includes('email not confirmed'))
    return 'Ky email nuk është konfirmuar ende. Kontrollo inbox-in, ose çaktivizo "Confirm email" te Supabase Auth settings gjatë zhvillimit.'
  return message
}
