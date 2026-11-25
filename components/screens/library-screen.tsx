'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { ScreenHeader } from '@/components/screens/screen-header'
import { Card, inputClass } from '@/components/shared/ui'
import { ExerciseDetailModal } from '@/components/shared/exercise-detail-modal'
import { EXERCISES, MUSCLE_GROUPS } from '@/lib/exercises'
import { getExerciseDetail, hasDetail } from '@/lib/exercise-details'

const SUBGROUPS = ['Deltoidi anterior', 'Deltoidi lateral', 'Deltoidi posterior']

export function LibraryScreen() {
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState<string>('Të gjitha')
  const [subgroup, setSubgroup] = useState<string>('Të gjitha')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return EXERCISES.filter((e) => {
      const matchMuscle = muscle === 'Të gjitha' || e.muscle === muscle
      const matchSub = muscle !== 'Supet' || subgroup === 'Të gjitha' || e.subgroup === subgroup
      const sq = getExerciseDetail(e.name)?.sq.toLowerCase() ?? ''
      const matchSearch = !q || e.name.toLowerCase().includes(q) || sq.includes(q)
      return matchMuscle && matchSub && matchSearch
    })
  }, [search, muscle, subgroup])

  return (
    <div className="min-h-dvh pb-28">
      <ScreenHeader title="Biblioteka e Ushtrimeve" subtitle={`${EXERCISES.length} ushtrime`} />

      <div className="sticky top-[57px] z-20 bg-background/95 px-4 pb-2 pt-3 backdrop-blur">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className={`${inputClass} pl-9`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kërko ushtrim..."
          />
        </div>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {['Të gjitha', ...MUSCLE_GROUPS].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMuscle(m)
                setSubgroup('Të gjitha')
              }}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                muscle === m
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        {muscle === 'Supet' && (
          <div className="no-scrollbar -mx-1 mt-2 flex gap-2 overflow-x-auto px-1">
            {['Të gjitha', ...SUBGROUPS].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSubgroup(s)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${
                  subgroup === s
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-card text-muted-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 px-4 pt-2">
        {filtered.map((e) => (
          <Card key={e.name} className="p-0 overflow-hidden">
            <button
              type="button"
              onClick={() => setSelected(e.name)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{e.name}</p>
                <span className="text-xs text-muted-foreground">
                  {e.muscle}
                  {e.subgroup ? ` · ${e.subgroup}` : ''}
                </span>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                {hasDetail(e.name) && (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                    Si bëhet
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </span>
            </button>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">Asnjë ushtrim nuk u gjet.</p>
        )}
      </div>

      <ExerciseDetailModal name={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
