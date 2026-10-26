'use client'

import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus, Search, Trash2 } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Field, Modal, inputClass } from '@/components/shared/ui'
import { EXERCISES, MUSCLE_GROUPS } from '@/lib/exercises'
import { DAYS_SHORT } from '@/lib/supabase/programs'
import type { RoutineExercise } from '@/lib/types'

interface RoutineBuilderProps {
  open: boolean
  onClose: () => void
  // Opsionale: përdoren nga trajneri për të ndërtuar një program për klientin.
  // Pa onSave, sillet si më parë dhe ruan rutinën te përdoruesi.
  title?: string
  saveLabel?: string
  initial?: { name: string; description: string; exercises: RoutineExercise[]; days?: number[] }
  withDays?: boolean // shfaq zgjedhësin e ditëve të javës (për programet e trajnerit)
  onSave?: (name: string, description: string, exercises: RoutineExercise[], days: number[]) => Promise<boolean>
}

export function RoutineBuilder({
  open,
  onClose,
  title = 'Krijo Rutinë',
  saveLabel = 'Ruaj Rutinën',
  initial,
  withDays = false,
  onSave,
}: RoutineBuilderProps) {
  const { addRoutine, showToast } = useApp()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [picked, setPicked] = useState<RoutineExercise[]>([])
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState<string>('Të gjitha')
  const [saving, setSaving] = useState(false)
  const [days, setDays] = useState<number[]>([])

  // Kur hapet me të dhëna fillestare (ndryshim programi), i mbush fushat.
  useEffect(() => {
    if (open && initial) {
      setName(initial.name)
      setDescription(initial.description)
      setPicked(initial.exercises.map((e) => ({ ...e })))
      setDays(initial.days ?? [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const filtered = useMemo(() => {
    return EXERCISES.filter((e) => {
      const matchMuscle = muscle === 'Të gjitha' || e.muscle === muscle
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
      return matchMuscle && matchSearch
    })
  }, [search, muscle])

  function togglePick(name: string, muscle: string) {
    setPicked((prev) => {
      const exists = prev.find((p) => p.name === name)
      if (exists) return prev.filter((p) => p.name !== name)
      return [...prev, { name, muscle, targetSets: 3 }]
    })
  }

  function setSets(name: string, delta: number) {
    setPicked((prev) =>
      prev.map((p) => (p.name === name ? { ...p, targetSets: Math.max(1, p.targetSets + delta) } : p)),
    )
  }

  function reset() {
    setName('')
    setDescription('')
    setPicked([])
    setSearch('')
    setMuscle('Të gjitha')
    setDays([])
  }

  async function save() {
    if (!name.trim()) {
      showToast('Vendos një emër për rutinën.', 'error')
      return
    }
    if (picked.length === 0) {
      showToast('Shto të paktën një ushtrim.', 'error')
      return
    }
    if (onSave) {
      setSaving(true)
      const ok = await onSave(name.trim(), description.trim(), picked, days)
      setSaving(false)
      if (!ok) return
      reset()
      onClose()
      return
    }
    addRoutine(name.trim(), description.trim() || 'Rutinë e personalizuar', picked)
    showToast('Rutina u krijua!', 'success')
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <div className="flex flex-col gap-4">
        <Field label="Emri i rutinës">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="p.sh. Dita e Krahëve"
          />
        </Field>
        <Field label="Përshkrimi (opsional)">
          <input
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="p.sh. Biceps dhe triceps"
          />
        </Field>

        {withDays && (
          <Field label="Ditët e javës (opsionale)">
            <div className="flex flex-wrap gap-2">
              {DAYS_SHORT.map((label, i) => {
                const on = days.includes(i)
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setDays((prev) => (on ? prev.filter((d) => d !== i) : [...prev, i].sort()))}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      on
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Klienti e sheh këtë stërvitje si "Stërvitja e sotme" në këto ditë.
            </p>
          </Field>
        )}

        {picked.length > 0 && (
          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="mb-2 text-sm font-semibold">Ushtrimet e zgjedhura ({picked.length})</p>
            <div className="flex flex-col gap-2">
              {picked.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSets(p.name, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary"
                      aria-label="Ul seritë"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-12 text-center text-xs text-muted-foreground">{p.targetSets} seri</span>
                    <button
                      type="button"
                      onClick={() => setSets(p.name, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary"
                      aria-label="Shto seri"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePick(p.name, p.muscle)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-primary"
                    aria-label="Hiq ushtrimin"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold">Shto Ushtrime</p>
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={`${inputClass} pl-9`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko ushtrim..."
            />
          </div>
          <div className="no-scrollbar -mx-1 mb-2 flex gap-2 overflow-x-auto px-1 pb-1">
            {['Të gjitha', ...MUSCLE_GROUPS].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMuscle(m)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${
                  muscle === m
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="no-scrollbar flex max-h-56 flex-col gap-1.5 overflow-y-auto">
            {filtered.map((e) => {
              const isPicked = picked.some((p) => p.name === e.name)
              return (
                <button
                  key={e.name}
                  type="button"
                  onClick={() => togglePick(e.name, e.muscle)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    isPicked ? 'border-primary bg-primary/10' : 'border-border bg-background'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.muscle}</p>
                  </div>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      isPicked ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving ? 'Po ruhet…' : saveLabel}
        </button>
      </div>
    </Modal>
  )
}
