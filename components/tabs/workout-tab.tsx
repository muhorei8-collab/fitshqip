'use client'

import { useEffect, useState } from 'react'
import { Dumbbell, Play, Plus, Trash2 } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { useNav } from '@/components/nav'
import { Card, SectionTitle } from '@/components/shared/ui'
import { ActiveWorkout } from '@/components/workout/active-workout'
import { RoutineBuilder } from '@/components/workout/routine-builder'
import type { Routine } from '@/lib/types'

export function WorkoutTab() {
  const { routines, deleteRoutine, showToast } = useApp()
  const { workoutIntent } = useNav()
  const [active, setActive] = useState<Routine | null>(null)
  const [builderOpen, setBuilderOpen] = useState(false)

  // The dashboard CTA bumps workoutIntent to jump straight into picking a routine.
  useEffect(() => {
    if (workoutIntent > 0) setActive(null)
  }, [workoutIntent])

  if (active) {
    return (
      <ActiveWorkout
        routine={active}
        onExit={() => setActive(null)}
      />
    )
  }

  const systemRoutines = routines.filter((r) => r.ownerId === 'system')
  const customRoutines = routines.filter((r) => r.ownerId !== 'system')

  return (
    <div className="flex flex-col gap-5 px-4 pb-28 pt-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Stërvitja</h1>
        <p className="text-sm text-muted-foreground">Zgjidh një rutinë për të filluar</p>
      </header>

      <button
        type="button"
        onClick={() => setBuilderOpen(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/50 bg-primary/5 py-3.5 font-semibold text-primary"
      >
        <Plus className="h-5 w-5" />
        Krijo Rutinë / + Shto Ushtrime
      </button>

      <div>
        <SectionTitle>Rutina të gatshme</SectionTitle>
        <div className="flex flex-col gap-3">
          {systemRoutines.map((r) => (
            <RoutineCard key={r.id} routine={r} onStart={() => setActive(r)} />
          ))}
        </div>
      </div>

      {customRoutines.length > 0 && (
        <div>
          <SectionTitle>Rutinat e mia</SectionTitle>
          <div className="flex flex-col gap-3">
            {customRoutines.map((r) => (
              <RoutineCard
                key={r.id}
                routine={r}
                onStart={() => setActive(r)}
                onDelete={() => {
                  deleteRoutine(r.id)
                  showToast('Rutina u fshi.', 'info')
                }}
              />
            ))}
          </div>
        </div>
      )}

      <RoutineBuilder open={builderOpen} onClose={() => setBuilderOpen(false)} />
    </div>
  )
}

function RoutineCard({
  routine,
  onStart,
  onDelete,
}: {
  routine: Routine
  onStart: () => void
  onDelete?: () => void
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold leading-tight">{routine.name}</h3>
            <p className="text-xs text-muted-foreground">{routine.description}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {routine.exercises.length} ushtrime
            </p>
          </div>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-primary"
            aria-label="Fshi rutinën"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {routine.exercises.slice(0, 4).map((e) => (
          <span key={e.name} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
            {e.name}
          </span>
        ))}
        {routine.exercises.length > 4 && (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
            +{routine.exercises.length - 4}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onStart}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
      >
        <Play className="h-4 w-4" />
        Fillo
      </button>
    </Card>
  )
}
