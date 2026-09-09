'use client'

import { AppProvider, useApp } from '@/components/app-provider'
import { NavProvider, useNav } from '@/components/nav'
import { BottomNav } from '@/components/bottom-nav'
import { ToastHost } from '@/components/shared/toast'
import { AuthScreen } from '@/components/auth/auth-screen'
import { DashboardTab } from '@/components/tabs/dashboard-tab'
import { WorkoutTab } from '@/components/tabs/workout-tab'
import { ProgressTab } from '@/components/tabs/progress-tab'
import { HistoryTab } from '@/components/tabs/history-tab'
import { ProfileTab } from '@/components/tabs/profile-tab'
import { LibraryScreen } from '@/components/screens/library-screen'
import { LeaderboardScreen } from '@/components/screens/leaderboard-screen'
import { MacroScreen } from '@/components/screens/macro-screen'
import { AdminScreen } from '@/components/screens/admin-screen'

function Router() {
  const { tab, screen } = useNav()

  if (screen === 'library') return <LibraryScreen />
  if (screen === 'leaderboard') return <LeaderboardScreen />
  if (screen === 'macro') return <MacroScreen />
  if (screen === 'admin') return <AdminScreen />

  switch (tab) {
    case 'dashboard':
      return <DashboardTab />
    case 'workout':
      return <WorkoutTab />
    case 'progress':
      return <ProgressTab />
    case 'history':
      return <HistoryTab />
    case 'profile':
      return <ProfileTab />
    default:
      return <DashboardTab />
  }
}

function Shell() {
  const { ready, currentUser } = useApp()

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-secondary border-t-primary" />
      </div>
    )
  }

  if (!currentUser) {
    return (
      <>
        <AuthScreen />
        <ToastHost />
      </>
    )
  }

  return (
    <NavProvider>
      <main className="mx-auto min-h-dvh max-w-md">
        <Router />
      </main>
      <BottomNav />
      <ToastHost />
    </NavProvider>
  )
}

export function AppShell() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
