'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronLeft, Plus, Timer, Trophy, X } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Modal } from '@/components/shared/ui'
import { RestTimer } from '@/components/workout/rest-timer'
import type { LoggedExercise, LoggedSet, Routine } from '@/lib/types'
import { previousBest, sessionVolume } from '@/lib/storage'
import { feedbackForSet, feedbackForSession } from '@/lib/ai-trainer'
import { formatDuration, formatVolume } from '@/lib/format'

interface PRHit {
  exercise: string
  weight: number
  reps: number
}

export function ActiveWorkout({ routine, onExit }: { routine: Routine; onExit: () => void }) {
  const { currentUser, sessions, addSession, showToast } = useApp()
  const unit = currentUser?.unit ?? 'kg'

  const [elapsed, setElapsed] = useState(0)
  const [rest, setRest] = useState(false)
  const [prHits, setPrHits] = useState<PRHit[]>([])
  const [showFinish, setShowFinish] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)

  const [exercises, setExercises] = useState<LoggedExercise[]>(() =>
    routine.exercises.map((re) => ({
      name: re.name,
      muscle: re.muscle,
      sets: Array.from({ length: re.targetSets }, () => ({ weight: 0, reps: 0, completed: false })),
    })),
  )

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const totalVolume = useMemo(() => sessionVolume(exercises), [exercises])
  const completedCount = useMemo(
    () => exercises.reduce((n, ex) => n + ex.sets.filter((s) => s.completed).length, 0),
    [exercises],
  )

  function updateSet(exIdx: number, setIdx: number, patch: Partial<LoggedSet>) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) }
          : ex,
      ),
    )
  }

  function toggleComplete(exIdx: number, setIdx: number) {
    const ex = exercises[exIdx]
    const set = ex.sets[setIdx]
    const nextCompleted = !set.completed
    updateSet(exIdx, setIdx, { completed: nextCompleted })

    if (nextCompleted && set.weight > 0) {
      const fb = feedbackForSet(sessions, ex.name, set.weight, set.reps)
      showToast(fb.message, fb.tone === 'success' ? 'success' : 'info')
      setRest(true)
    }
  }

  function addSet(exIdx: number) {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex
        const last = ex.sets[ex.sets.length - 1]
        return {
          ...ex,
          sets: [...ex.sets, { weight: last?.weight ?? 0, reps: last?.reps ?? 0, completed: false }],
        }
      }),
    )
  }

  function finish() {
    // detect PRs against history (before this session is saved)
    const hits: PRHit[] = []
    for (const ex of exercises) {
      const prev = previousBest(sessions, ex.name)
      let bestThis: LoggedSet | null = null
      for (const s of ex.sets) {
        if (s.completed && s.weight > 0 && (!bestThis || s.weight > bestThis.weight)) bestThis = s
      }
      if (bestThis && (!prev || bestThis.weight > prev.weight)) {
        hits.push({ exercise: ex.name, weight: bestThis.weight, reps: bestThis.reps })
      }
    }

    const cleaned = exercises
      .map((ex) => ({ ...ex, sets: ex.sets.filter((s) => s.completed) }))
      .filter((ex) => ex.sets.length > 0)

    if (cleaned.length === 0) {
      showToast('Përfundo të paktën një seri për të ruajtur stërvitjen.', 'error')
      return
    }

    const session = {
      routineName: routine.name,
      date: new Date().toISOString(),
      durationSec: elapsed,
      exercises: cleaned,
      totalVolume: sessionVolume(cleaned),
    }
    addSession(session)

    const summary = feedbackForSession({ ...session, id: 'tmp', userId: '' }, sessions)
    setPrHits(hits)
    setShowFinish(true)
    setTimeout(() => showToast(summary, 'success'), 400)
  }

  return (
    <div className="min-h-dvh pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => setConfirmExit(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
          aria-label="Dil"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">{routine.name}</p>
          <p className="flex items-center gap-1.5 font-mono text-lg font-bold tabular-nums">
            <Timer className="h-4 w-4 text-primary" />
            {formatDuration(elapsed)}
          </p>
        </div>
        <button
          type="button"
          onClick={finish}
          className="rounded-full bg-success px-4 py-2 text-sm font-semibold text-success-foreground"
        >
          Përfundo
        </button>
      </header>

      {/* Live summary */}
      <div className="grid grid-cols-2 gap-3 px-4 py-4">
        <div className="rounded-2xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-bold">{formatVolume(totalVolume, unit)}</p>
          <p className="text-xs text-muted-foreground">Vëllimi</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-bold">{completedCount}</p>
          <p className="text-xs text-muted-foreground">Seri të kryera</p>
        </div>
      </div>

      {/* Exercises */}
      <div className="flex flex-col gap-4 px-4">
        {exercises.map((ex, exIdx) => {
          const prev = previousBest(sessions, ex.name)
          return (
            <div key={exIdx} className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-semibold">{ex.name}</h3>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                  {ex.muscle}
                </span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                {prev
                  ? `Herën e fundit: ${formatVolume(prev.weight, unit)} × ${prev.reps}`
                  : 'Ushtrim i ri — vendos rekordin tënd!'}
              </p>

              {/* set header */}
              <div className="mb-1 grid grid-cols-[28px_1fr_1fr_44px] items-center gap-2 px-1 text-[11px] font-medium text-muted-foreground">
                <span>Seri</span>
                <span>Pesha ({unit})</span>
                <span>Përsëritje</span>
                <span className="text-center">OK</span>
              </div>

              <div className="flex flex-col gap-2">
                {ex.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className={`grid grid-cols-[28px_1fr_1fr_44px] items-center gap-2 rounded-xl px-1 py-1 ${
                      set.completed ? 'bg-success/10' : ''
                    }`}
                  >
                    <span className="text-center text-sm font-semibold text-muted-foreground">
                      {setIdx + 1}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={set.weight || ''}
                      onChange={(e) => updateSet(exIdx, setIdx, { weight: Number(e.target.value) })}
                      placeholder={prev ? String(prev.weight) : '0'}
                      className="w-full rounded-lg border border-input bg-background px-2 py-2 text-center text-base outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={set.reps || ''}
                      onChange={(e) => updateSet(exIdx, setIdx, { reps: Number(e.target.value) })}
                      placeholder={prev ? String(prev.reps) : '0'}
                      className="w-full rounded-lg border border-input bg-background px-2 py-2 text-center text-base outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => toggleComplete(exIdx, setIdx)}
                      className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                        set.completed
                          ? 'border-success bg-success text-success-foreground'
                          : 'border-border bg-background text-muted-foreground'
                      }`}
                      aria-label="Shëno serinë si të kryer"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addSet(exIdx)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-sm font-medium text-muted-foreground"
              >
                <Plus className="h-4 w-4" />
                Shto seri
              </button>
            </div>
          )
        })}
      </div>

      {rest && (
        <RestTimer initialSeconds={90} onClose={() => setRest(false)} />
      )}

      {/* PR / finish modal */}
      <Modal open={showFinish} onClose={onExit} title={undefined}>
        <div className="flex flex-col items-center text-center">
          {prHits.length > 0 ? (
            <>
              <div className="animate-pop flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
                <Trophy className="h-10 w-10 text-success" />
              </div>
              <h3 className="mt-4 text-2xl font-black">🏆 Rekord i Ri!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Theve {prHits.length} rekord{prHits.length > 1 ? 'e' : ''} sot!
              </p>
              <div className="mt-4 flex w-full flex-col gap-2">
                {prHits.map((h) => (
                  <div
                    key={h.exercise}
                    className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2.5 text-left"
                  >
                    <span className="text-sm font-medium">{h.exercise}</span>
                    <span className="text-sm font-bold text-success">
                      {formatVolume(h.weight, unit)} × {h.reps}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="animate-pop flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                <Check className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-2xl font-black">Stërvitja u ruajt!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatVolume(totalVolume, unit)} vëllim · {formatDuration(elapsed)}
              </p>
            </>
          )}
          <button
            type="button"
            onClick={onExit}
            className="mt-6 w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground"
          >
            Mbylle
          </button>
        </div>
      </Modal>

      {/* Confirm exit */}
      <Modal open={confirmExit} onClose={() => setConfirmExit(false)} title="Braktis stërvitjen?">
        <p className="text-sm text-muted-foreground">
          Nëse del tani, kjo stërvitje nuk do të ruhet. Je i sigurt?
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setConfirmExit(false)}
            className="rounded-xl border border-border py-3 font-semibold"
          >
            Vazhdo
          </button>
          <button
            type="button"
            onClick={onExit}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
          >
            <X className="h-4 w-4" />
            Dil
          </button>
        </div>
      </Modal>
    </div>
  )
}
