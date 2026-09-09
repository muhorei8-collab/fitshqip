'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock, Dumbbell, Weight } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Card, Chip, EmptyState, SectionTitle } from '@/components/shared/ui'
import { startOfWeek } from '@/lib/storage'
import { formatDayShort, formatDuration, formatVolume, MONTHS_SQ } from '@/lib/format'
import type { WorkoutSession } from '@/lib/types'

const FILTERS = ['Të gjitha', 'Këtë javë', 'Këtë muaj'] as const

export function HistoryTab() {
  const { currentUser, sessions } = useApp()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Të gjitha')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [calDate, setCalDate] = useState(new Date())
  const unit = currentUser?.unit ?? 'kg'

  const sorted = useMemo(
    () => [...sessions].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [sessions],
  )

  const filtered = useMemo(() => {
    if (filter === 'Këtë javë') {
      const start = startOfWeek()
      return sorted.filter((s) => new Date(s.date) >= start)
    }
    if (filter === 'Këtë muaj') {
      const now = new Date()
      return sorted.filter((s) => {
        const d = new Date(s.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    }
    return sorted
  }, [sorted, filter])

  const workoutDays = useMemo(() => {
    const set = new Set<string>()
    sessions.forEach((s) => set.add(new Date(s.date).toISOString().slice(0, 10)))
    return set
  }, [sessions])

  // build calendar grid
  const calendar = useMemo(() => {
    const year = calDate.getFullYear()
    const month = calDate.getMonth()
    const first = new Date(year, month, 1)
    const startPad = (first.getDay() + 6) % 7 // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < startPad; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    return cells
  }, [calDate])

  return (
    <div className="flex flex-col gap-5 px-4 pb-28 pt-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Historia</h1>
        <p className="text-sm text-muted-foreground">Stërvitjet e tua të kaluara</p>
      </header>

      {/* Calendar */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"
            aria-label="Muaji i mëparshëm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold">
            {MONTHS_SQ[calDate.getMonth()]} {calDate.getFullYear()}
          </span>
          <button
            type="button"
            onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"
            aria-label="Muaji tjetër"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
          {['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Die'].map((d) => (
            <span key={d} className="py-1">
              {d}
            </span>
          ))}
          {calendar.map((cell, i) => {
            if (!cell) return <span key={i} />
            const key = cell.toISOString().slice(0, 10)
            const trained = workoutDays.has(key)
            const isToday = key === new Date().toISOString().slice(0, 10)
            return (
              <span
                key={i}
                className={`flex aspect-square items-center justify-center rounded-lg text-xs ${
                  trained
                    ? 'bg-primary font-bold text-primary-foreground'
                    : isToday
                      ? 'border border-primary/50 text-foreground'
                      : 'text-muted-foreground'
                }`}
              >
                {cell.getDate()}
              </span>
            )
          })}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Chip>
        ))}
      </div>

      {/* List */}
      <div>
        <SectionTitle>
          {filtered.length} stërvitje{filtered.length === 1 ? '' : ''}
        </SectionTitle>
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((s) => (
              <HistoryCard
                key={s.id}
                session={s}
                unit={unit}
                expanded={expanded === s.id}
                onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="Asnjë stërvitje"
            description="Nuk ka stërvitje për këtë periudhë. Fillo një rutinë për ta parë këtu."
          />
        )}
      </div>
    </div>
  )
}

function HistoryCard({
  session,
  unit,
  expanded,
  onToggle,
}: {
  session: WorkoutSession
  unit: 'kg' | 'lb'
  expanded: boolean
  onToggle: () => void
}) {
  const totalSets = session.exercises.reduce((n, e) => n + e.sets.length, 0)
  return (
    <Card className="p-0 overflow-hidden">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between p-4 text-left">
        <div className="min-w-0">
          <p className="font-semibold">{session.routineName}</p>
          <p className="text-xs text-muted-foreground">{formatDayShort(session.date)}</p>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      <div className="flex gap-4 px-4 pb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Dumbbell className="h-3.5 w-3.5" />
          {totalSets} seri
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatDuration(session.durationSec)}
        </span>
        <span className="flex items-center gap-1">
          <Weight className="h-3.5 w-3.5" />
          {formatVolume(session.totalVolume, unit)}
        </span>
      </div>

      {expanded && (
        <div className="animate-rise border-t border-border p-4">
          <div className="flex flex-col gap-3">
            {session.exercises.map((ex) => (
              <div key={ex.name}>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium">{ex.name}</p>
                  <span className="text-[10px] text-muted-foreground">{ex.muscle}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ex.sets.map((set, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-secondary px-2 py-1 text-[11px] text-muted-foreground"
                    >
                      {formatVolume(set.weight, unit)} × {set.reps}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
