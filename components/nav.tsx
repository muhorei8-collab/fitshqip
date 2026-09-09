'use client'

import { createContext, useContext, useState } from 'react'

export type Tab = 'dashboard' | 'workout' | 'progress' | 'history' | 'profile'
export type Screen = 'library' | 'leaderboard' | 'macro' | 'admin' | null

interface NavState {
  tab: Tab
  setTab: (t: Tab) => void
  screen: Screen
  openScreen: (s: Screen) => void
  closeScreen: () => void
  workoutIntent: number // bumped to signal the workout tab to start a routine
  triggerWorkout: () => void
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
  }

  return <NavCtx.Provider value={value}>{children}</NavCtx.Provider>
}
