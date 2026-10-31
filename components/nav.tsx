'use client'

import { createContext, useContext, useState } from 'react'
import type { Routine } from '@/lib/types'

export type Tab = 'dashboard' | 'workout' | 'progress' | 'history' | 'marketplace' | 'office' | 'profile'
export type Screen = 'library' | 'leaderboard' | 'macro' | 'admin' | 'friends' | null

interface NavState {
  tab: Tab
  setTab: (t: Tab) => void
  screen: Screen
  openScreen: (s: Screen) => void
  closeScreen: () => void
  workoutIntent: number // bumped to signal the workout tab to start a routine
  triggerWorkout: () => void
  // Nis drejtpërdrejt një rutinë të caktuar (p.sh. "Stërvitja e sotme" nga Kryefaqja).
  pendingRoutine: Routine | null
  startRoutine: (r: Routine) => void
  clearPendingRoutine: () => void
  // Hap Zyrën me një klient të zgjedhur (p.sh. nga pasqyra e trajnerit).
  officeClientId: string | null
  openOfficeClient: (clientId: string, opts?: { newProgram?: boolean }) => void
  clearOfficeClient: () => void
  officeNewProgram: boolean // hap ndërtuesin e programit sapo hapet klienti
  clearOfficeNewProgram: () => void
}

const NavCtx = createContext<NavState | null>(null)

export function useNav() {
  const ctx = useContext(NavCtx)
  if (!ctx) throw new Error('useNav must be used within NavProvider')
  return ctx
}

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [screen, setScreen] = useState<Screen>(null)
  const [workoutIntent, setWorkoutIntent] = useState(0)
  const [pendingRoutine, setPendingRoutine] = useState<Routine | null>(null)
  const [officeClientId, setOfficeClientId] = useState<string | null>(null)
  const [officeNewProgram, setOfficeNewProgram] = useState(false)

  const value: NavState = {
    tab,
    setTab: (t) => {
      setScreen(null)
      setTab(t)
    },
    screen,
    openScreen: setScreen,
    closeScreen: () => setScreen(null),
    workoutIntent,
    triggerWorkout: () => {
      setScreen(null)
      setTab('workout')
      setWorkoutIntent((n) => n + 1)
    },
    pendingRoutine,
    startRoutine: (r) => {
      setScreen(null)
      setPendingRoutine(r)
      setTab('workout')
      setWorkoutIntent((n) => n + 1)
    },
    clearPendingRoutine: () => setPendingRoutine(null),
    officeClientId,
    openOfficeClient: (clientId, opts) => {
      setScreen(null)
      setOfficeClientId(clientId)
      setOfficeNewProgram(!!opts?.newProgram)
      setTab('office')
    },
    clearOfficeClient: () => setOfficeClientId(null),
    officeNewProgram,
    clearOfficeNewProgram: () => setOfficeNewProgram(false),
  }

  return <NavCtx.Provider value={value}>{children}</NavCtx.Provider>
}
