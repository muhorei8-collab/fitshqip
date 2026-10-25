'use client'

import { useMemo, useState } from 'react'
import { BookOpen, Dumbbell, Flame, Scale, Sparkles, Timer, Trophy, Weight } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { useNav } from '@/components/nav'
import { Avatar, Card, Modal, SectionTitle } from '@/components/shared/ui'
import { BarChart } from '@/components/shared/charts'
import { computePRs, computeStreak, startOfWeek } from '@/lib/storage'
import { dailyTip } from '@/lib/ai-trainer'
import { formatDuration, formatVolume, DAYS_SQ } from '@/lib/format'
import type { Level } from '@/lib/types'

// Vlerësime mesatare — varen nga stërvitja, ushqimi, gjumi dhe gjenetika.
const LEVEL_STEPS: { level: Level; toNext: string | null }[] = [
  { level: 'Fillestar', toNext: '~6–12 muaj' },
  { level: 'Mesatar', toNext: '~2–3 vjet' },
  { level: 'Avancuar', toNext: null },
]

export function DashboardTab() {
  const { currentUser, sessions } = useApp()
  const { triggerWorkout, openScreen, setTab } = useNav()
  const [aiOpen, setAiOpen] = useState(false)

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
  const currentLevelIdx = Math.max(
    0,
    LEVEL_STEPS.findIndex((s) => s.level === currentUser.level),
  )

  const quickActions = [
    { label: 'Stërvitja', icon: Dumbbell, onClick: () => setTab('workout') },
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

        {/* Kalori me AI (së shpejti) */}
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left transition-colors active:bg-secondary"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <Sparkles className="h-5 w-5 text-primary" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Kalori me AI</span>
            <span className="block text-xs text-muted-foreground">Llogarit kaloritë e ushqimeve të tua</span>
          </span>
          <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            Së shpejti
          </span>
        </button>
      </div>

      {/* Weekly chart + level path (side by side) */}
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-[3fr_2fr]">
        <Card className="min-w-0 p-3.5">
          <SectionTitle>Aktiviteti javor (vëllimi)</SectionTitle>
          <BarChart data={weeklyChart} />
        </Card>

        <Card className="flex min-w-0 flex-col p-3.5">
          <SectionTitle>Niveli</SectionTitle>
          <ol className="flex flex-1 flex-col">
            {LEVEL_STEPS.map((step, i) => {
              const reached = i <= currentLevelIdx
              const isCurrent = i === currentLevelIdx
              return (
                <li key={step.level} className="flex gap-2.5">
                  <div className="flex flex-col items-center">
                    <span
                      className={`mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${
                        isCurrent
                          ? 'border-primary bg-primary ring-4 ring-primary/20'
                          : reached
                            ? 'border-primary bg-primary/60'
                            : 'border-border bg-card'
                      }`}
                    />
                    {step.toNext && <span className="my-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-3">
                    <p
                      className={`text-sm font-semibold leading-tight ${
                        isCurrent ? 'text-primary' : reached ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {step.level}
                    </p>
                    {step.toNext && <p className="mt-0.5 text-[11px] text-muted-foreground">{step.toNext}</p>}
                  </div>
                </li>
              )
            })}
          </ol>
          <p className="text-[10px] leading-snug text-muted-foreground">
            Vlerësim mesatar. Varet nga stërvitja, ushqimi dhe gjumi.
          </p>
        </Card>
      </div>

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

      <Modal open={aiOpen} onClose={() => setAiOpen(false)} title="Kalori me AI">
        <div className="flex flex-col items-center text-center">
          <div className="animate-pop flex h-20 w-20 items-center justify-center rounded-full bg-primary/15">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h3 className="mt-4 text-xl font-black tracking-tight">Së shpejti në FitShqip</h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
            Po përgatisim llogaritjen e kalorive të ushqimeve me inteligjencë artificiale. Do të hapet shumë shpejt.
          </p>
          <button
            type="button"
            onClick={() => setAiOpen(false)}
            className="mt-6 w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground"
          >
            Në rregull
          </button>
        </div>
      </Modal>
    </div>
  )
}
