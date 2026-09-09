'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { ScreenHeader } from '@/components/screens/screen-header'
import { Card, inputClass } from '@/components/shared/ui'
import { EXERCISES, MUSCLE_GROUPS } from '@/lib/exercises'

export function LibraryScreen() {
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState<string>('Të gjitha')
  const [open, setOpen] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      EXERCISES.filter((e) => {
        const matchMuscle = muscle === 'Të gjitha' || e.muscle === muscle
        const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
        return matchMuscle && matchSearch
      }),
    [search, muscle],
  )

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
              onClick={() => setMuscle(m)}
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
      </div>

      <div className="flex flex-col gap-2.5 px-4 pt-2">
        {filtered.map((e) => (
          <Card key={e.name} className="p-0 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(open === e.name ? null : e.name)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <div>
                <p className="font-semibold">{e.name}</p>
                <span className="text-xs text-muted-foreground">{e.muscle}</span>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform ${open === e.name ? 'rotate-180' : ''}`}
              />
            </button>
            {open === e.name && (
              <div className="animate-rise border-t border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-success">Si të kryhet</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">{e.instructions}</p>
              </div>
            )}
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">Asnjë ushtrim nuk u gjet.</p>
        )}
      </div>
    </div>
  )
}
