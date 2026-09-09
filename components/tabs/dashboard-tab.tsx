'use client'

import { useMemo } from 'react'
import { BookOpen, Dumbbell, Flame, ListPlus, Scale, Timer, Trophy, Weight } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { useNav } from '@/components/nav'
import { Avatar, Card, SectionTitle } from '@/components/shared/ui'
import { BarChart } from '@/components/shared/charts'
import { computePRs, computeStreak, startOfWeek } from '@/lib/storage'
import { dailyTip } from '@/lib/ai-trainer'
import { formatDuration, formatVolume, DAYS_SQ } from '@/lib/format'

export function DashboardTab() {
  const { currentUser, sessions } = useApp()
  const { triggerWorkout, openScreen, setTab } = useNav()

  const stats = useMemo(() => {
    const weekStart = startOfWeek()
    const weekSessions = sessions.filter((s) => new Date(s.date) >= weekStart)
    const totalTime = weekSessions.reduce((t, s) => t + s.durationSec, 0)
    const weekVolume = weekSessions.reduce((t, s) => t + s.totalVolume, 0)
    return {
      streak: computeStreak(sessions),
      count: weekSessions.length,
      totalTime,
      weekVolume,
    }
  }, [sessions])

  const weeklyChart = useMemo(() => {
    const start = startOfWeek()
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return { label: DAYS_SQ[d.getDay()], date: d, value: 0 }
    })
    for (const s of sessions) {
      const sd = new Date(s.date)
      if (sd >= start) {
        const idx = (sd.getDay() + 6) % 7
        days[idx].value += s.totalVolume
      }
    }
    return days.map((d) => ({ label: d.label, value: d.value }))
  }, [sessions])

  const latestPR = useMemo(() => computePRs(sessions)[0] ?? null, [sessions])
  const unit = currentUser?.unit ?? 'kg'

  if (!currentUser) return null
  const firstName = currentUser.fullName.split(' ')[0]

  const quickActions = [
    { label: 'Krijo Rutinë', icon: ListPlus, onClick: () => setTab('workout') },
    { label: 'Biblioteka e Ushtrimeve', icon: BookOpen, onClick: () => openScreen('library') },
    { label: 'Regjistro Peshën', icon: Scale, onClick: () => setTab('progress') },
  ]

  return (
    <div className="flex flex-col gap-5 px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Përshëndetje,</p>
          <h1 className="text-2xl font-bold tracking-tight">{firstName}</h1>
        </div>
        <Avatar name={currentUser.fullName} color={currentUser.avatarColor} size={48} />
      </header>

      {/* Streak */}
      <Card className="flex items-center gap-4 border-primary/30 bg-gradient-to-br from-primary/15 to-card">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
          <Flame className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-3xl font-black leading-none">🔥 {stats.streak} Ditë Rresht</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats.streak > 0 ? 'Vazhdo kështu, mos e ndërprit!' : 'Fillo sot për të nisur serinë!'}
          </p>
        </div>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="flex flex-col gap-1 p-3.5">
          <Dumbbell className="h-5 w-5 text-primary" />
          <span className="mt-1 text-xl font-bold">{stats.count}</span>
          <span className="text-xs text-muted-foreground">Stërvitje/javë</span>
        </Card>
        <Card className="flex flex-col gap-1 p-3.5">
          <Timer className="h-5 w-5 text-success" />
          <span className="mt-1 text-xl font-bold">{formatDuration(stats.totalTime)}</span>
          <span className="text-xs text-muted-foreground">Kohë totale</span>
        </Card>
        <Card className="flex flex-col gap-1 p-3.5">
          <Weight className="h-5 w-5 text-foreground" />
          <span className="mt-1 text-xl font-bold">{formatVolume(stats.weekVolume, unit)}</span>
          <span className="text-xs text-muted-foreground">Vëllim/javë</span>
        </Card>
      </div>

      {/* Main CTA */}
      <button
        type="button"
        onClick={triggerWorkout}
        className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
      >
        🔥 Fillo Stërvitjen
      </button>

      {/* Quick actions */}
      <div>
        <SectionTitle>Veprime të shpejta</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((a) => {
            const Icon = a.icon
            return (
              <button
                key={a.label}
                type="button"
                onClick={a.onClick}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3.5 text-center transition-colors active:bg-secondary"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <span className="text-xs font-medium leading-tight text-balance">{a.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Weekly chart */}
      <Card>
        <SectionTitle>Aktiviteti javor (vëllimi)</SectionTitle>
        <BarChart data={weeklyChart} />
      </Card>

      {/* Latest PR */}
      {latestPR && (
        <Card className="flex items-center gap-3 border-success/30 bg-gradient-to-br from-success/10 to-card">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/20">
            <Trophy className="h-6 w-6 text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-success">Rekordi yt i fundit</p>
            <p className="truncate font-semibold">{latestPR.exercise}</p>
            <p className="text-sm text-muted-foreground">
              {formatVolume(latestPR.maxWeight, unit)} × {latestPR.reps} përsëritje
            </p>
          </div>
        </Card>
      )}

      {/* AI tip */}
      <Card className="border-border/60">
        <p className="text-sm leading-relaxed text-pretty">
          <span className="font-semibold text-success">Trajneri AI: </span>
          {dailyTip()}
        </p>
      </Card>
    </div>
  )
}
