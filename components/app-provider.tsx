'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type {
  BodyMetric,
  Goals,
  Routine,
  User,
  WorkoutSession,
} from '@/lib/types'
import { store, uid } from '@/lib/storage'
import { seedIfNeeded } from '@/lib/sample-data'
import { SYSTEM_ROUTINES } from '@/lib/exercises'

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
  allSessions: WorkoutSession[]
  routines: Routine[] // system + current user's custom
  metrics: BodyMetric[] // current user's
  goals: Goals | null
  toast: { id: string; message: string; tone: 'success' | 'info' | 'error' } | null

  signUp: (data: SignUpData) => { ok: boolean; error?: string }
  logIn: (email: string, password: string) => { ok: boolean; error?: string }
  logOut: () => void
  switchUser: (userId: string) => void
  updateProfile: (patch: Partial<User>) => void
  toggleAdmin: () => void

  addSession: (s: Omit<WorkoutSession, 'id' | 'userId'>) => void
  addRoutine: (name: string, description: string, exercises: Routine['exercises']) => void
  deleteRoutine: (id: string) => void
  addMetric: (weight: number) => void
  setGoals: (g: Omit<Goals, 'userId'>) => void
  resetData: () => void
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
  const [users, setUsers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [allSessions, setAllSessions] = useState<WorkoutSession[]>([])
  const [allRoutines, setAllRoutines] = useState<Routine[]>([])
  const [allMetrics, setAllMetrics] = useState<BodyMetric[]>([])
  const [allGoals, setAllGoals] = useState<Goals[]>([])
  const [toast, setToast] = useState<AppState['toast']>(null)

  useEffect(() => {
    seedIfNeeded()
    setUsers(store.getUsers())
    setCurrentUserId(store.getCurrentUserId())
    setAllSessions(store.getSessions())
    setAllRoutines(store.getRoutines())
    setAllMetrics(store.getMetrics())
    setAllGoals(store.getGoals())
    setReady(true)
  }, [])

  const showToast = useCallback((message: string, tone: 'success' | 'info' | 'error' = 'info') => {
    const id = uid('toast')
    setToast({ id, message, tone })
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 3200)
  }, [])

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId],
  )

  const sessions = useMemo(
    () => allSessions.filter((s) => s.userId === currentUserId),
    [allSessions, currentUserId],
  )

  const routines = useMemo(
    () => [...SYSTEM_ROUTINES, ...allRoutines.filter((r) => r.ownerId === currentUserId)],
    [allRoutines, currentUserId],
  )

  const metrics = useMemo(
    () =>
      allMetrics
        .filter((m) => m.userId === currentUserId)
        .sort((a, b) => +new Date(a.date) - +new Date(b.date)),
    [allMetrics, currentUserId],
  )

  const goals = useMemo(
    () => allGoals.find((g) => g.userId === currentUserId) ?? null,
    [allGoals, currentUserId],
  )

  const persistUsers = (next: User[]) => {
    setUsers(next)
    store.setUsers(next)
  }

  const signUp = useCallback(
    (data: SignUpData) => {
      const existing = store.getUsers()
      if (existing.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { ok: false, error: 'Ky email është i regjistruar tashmë.' }
      }
      const colors = ['#E5352B', '#22D3A8', '#F59E0B', '#6366F1', '#EC4899', '#0EA5E9']
      const user: User = {
        id: uid('user'),
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        age: data.age,
        height: data.height,
        weight: data.weight,
        level: data.level,
        unit: 'kg',
        isAdmin: data.email.toLowerCase() === 'admin@fitshqip.al',
        avatarColor: colors[existing.length % colors.length],
        createdAt: new Date().toISOString(),
      }
      const next = [...existing, user]
      persistUsers(next)
      // initial body metric
      const m: BodyMetric = { id: uid('bm'), userId: user.id, date: new Date().toISOString(), weight: data.weight }
      const nextMetrics = [...store.getMetrics(), m]
      setAllMetrics(nextMetrics)
      store.setMetrics(nextMetrics)
      setCurrentUserId(user.id)
      store.setCurrentUserId(user.id)
      return { ok: true }
    },
    [],
  )

  const logIn = useCallback((email: string, password: string) => {
    const user = store.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return { ok: false, error: 'Nuk u gjet asnjë llogari me këtë email.' }
    if (user.password !== password) return { ok: false, error: 'Fjalëkalimi është i gabuar.' }
    setCurrentUserId(user.id)
    store.setCurrentUserId(user.id)
    return { ok: true }
  }, [])

  const logOut = useCallback(() => {
    setCurrentUserId(null)
    store.setCurrentUserId(null)
  }, [])

  const switchUser = useCallback((userId: string) => {
    setCurrentUserId(userId)
    store.setCurrentUserId(userId)
  }, [])

  const updateProfile = useCallback(
    (patch: Partial<User>) => {
      if (!currentUserId) return
      const next = store.getUsers().map((u) => (u.id === currentUserId ? { ...u, ...patch } : u))
      persistUsers(next)
    },
    [currentUserId],
  )

  const toggleAdmin = useCallback(() => {
    if (!currentUserId) return
    const next = store.getUsers().map((u) => (u.id === currentUserId ? { ...u, isAdmin: !u.isAdmin } : u))
    persistUsers(next)
  }, [currentUserId])

  const addSession = useCallback(
    (s: Omit<WorkoutSession, 'id' | 'userId'>) => {
      if (!currentUserId) return
      const full: WorkoutSession = { ...s, id: uid('sess'), userId: currentUserId }
      const next = [full, ...store.getSessions()]
      setAllSessions(next)
      store.setSessions(next)
    },
    [currentUserId],
  )

  const addRoutine = useCallback(
    (name: string, description: string, exercises: Routine['exercises']) => {
      if (!currentUserId) return
      const routine: Routine = { id: uid('rt'), ownerId: currentUserId, name, description, exercises }
      const next = [...store.getRoutines(), routine]
      setAllRoutines(next)
      store.setRoutines(next)
    },
    [currentUserId],
  )

  const deleteRoutine = useCallback((id: string) => {
    const next = store.getRoutines().filter((r) => r.id !== id)
    setAllRoutines(next)
    store.setRoutines(next)
  }, [])

  const addMetric = useCallback(
    (weight: number) => {
      if (!currentUserId) return
      const m: BodyMetric = { id: uid('bm'), userId: currentUserId, date: new Date().toISOString(), weight }
      const next = [...store.getMetrics(), m]
      setAllMetrics(next)
      store.setMetrics(next)
      updateProfile({ weight })
    },
    [currentUserId, updateProfile],
  )

  const setGoals = useCallback(
    (g: Omit<Goals, 'userId'>) => {
      if (!currentUserId) return
      const existing = store.getGoals().filter((x) => x.userId !== currentUserId)
      const next = [...existing, { ...g, userId: currentUserId }]
      setAllGoals(next)
      store.setGoals(next)
    },
    [currentUserId],
  )

  const resetData = useCallback(() => {
    if (!currentUserId) return
    store.resetUserData(currentUserId)
    setAllSessions(store.getSessions())
    setAllRoutines(store.getRoutines())
    setAllMetrics(store.getMetrics())
    setAllGoals(store.getGoals())
  }, [currentUserId])

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
    switchUser,
    updateProfile,
    toggleAdmin,
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
