'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock, Dumbbell, Scale, Weight } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Card, Chip, EmptyState, SectionTitle } from '@/components/shared/ui'
import { startOfWeek } from '@/lib/storage'
import { formatDayShort, formatDuration, formatVolume, kgToUnit, MONTHS_SQ } from '@/lib/format'
import type { WorkoutSession } from '@/lib/types'

const FILTERS = ['Të gjitha', 'Këtë javë', 'Këtë muaj'] as const

// Çelës ditor sipas orës LOKALE (toISOString përdor UTC dhe e zhvendos ditën).
const pad = (n: number) => String(n).padStart(2, '0')
const localKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

interface WeightEntry {
  at: Date
  kg: number
  delta: number | null // ndryshimi nga matja e mëparshme (kg)
}

export function HistoryTab({ embedded = false }: { embedded?: boolean }) {
  const { currentUser, sessions, metrics } = useApp()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Të gjitha')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [calDate, setCalDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
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
    sessions.forEach((s) => set.add(localKey(new Date(s.date))))
    return set
  }, [sessions])

  // Matjet e peshës të grupuara sipas ditës, me ndryshimin nga matja e mëparshme.
  const weightByDay = useMemo(() => {
    const ordered = [...metrics].sort((a, b) => +new Date(a.date) - +new Date(b.date))
    const map = new Map<string, WeightEntry[]>()
    ordered.forEach((m, i) => {
      const at = new Date(m.date)
      const key = localKey(at)
      const entry: WeightEntry = { at, kg: m.weight, delta: i > 0 ? m.weight - ordered[i - 1].weight : null }
      map.set(key, [...(map.get(key) ?? []), entry])
    })
    return map
  }, [metrics])

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

  const todayKey = localKey(new Date())
  const selectedEntries = selectedDay ? (weightByDay.get(selectedDay) ?? []) : []

  return (
    <div className={embedded ? 'flex flex-col gap-5' : 'flex flex-col gap-5 px-4 pb-28 pt-6'}>
      {!embedded && (
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Historia</h1>
          <p className="text-sm text-muted-foreground">Stërvitjet e tua të kaluara</p>
        </header>
      )}

      {/* Calendar */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))
              setSelectedDay(null)
            }}
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
            onClick={() => {
              setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))
              setSelectedDay(null)
            }}
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
            const key = localKey(cell)
            const trained = workoutDays.has(key)
            const weighed = weightByDay.has(key)
            const isToday = key === todayKey
            const selected = selectedDay === key

            const base = 'relative flex aspect-square items-center justify-center rounded-lg text-xs'
            const tone = trained
              ? 'bg-primary font-bold text-primary-foreground'
              : weighed
                ? 'bg-amber-400 font-bold text-black'
                : isToday
                  ? 'border border-primary/50 text-foreground'
                  : 'text-muted-foreground'

            if (weighed) {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDay(selected ? null : key)}
                  className={`${base} ${tone} ${selected ? 'ring-2 ring-foreground/70' : ''}`}
                  aria-label={`Shiko peshën e regjistruar më ${cell.getDate()}`}
                >
                  {cell.getDate()}
                  {trained && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-amber-400" />}
                </button>
              )
            }
            return (
              <span key={i} className={`${base} ${tone}`}>
                {cell.getDate()}
              </span>
            )
          })}
        </div>

        {/* Legjenda */}
        <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
            Stërvitje
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
            Peshë e regjistruar
          </span>
        </div>

        {/* Detajet e ditës së zgjedhur */}
        {selectedEntries.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Scale className="h-3.5 w-3.5 text-amber-400" />
              {selectedEntries[0].at.toLocaleDateString('sq-AL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <div className="flex flex-col gap-1.5">
              {selectedEntries.map((e, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {hhmm(e.at)}
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-bold">
                      {kgToUnit(e.kg, unit).toFixed(1)} {unit}
                    </span>
                    {e.delta !== null && e.delta !== 0 && (
                      <span className={`text-xs font-medium ${e.delta > 0 ? 'text-success' : 'text-primary'}`}>
                        {e.delta > 0 ? '+' : ''}
                        {kgToUnit(e.delta, unit).toFixed(1)}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
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
