'use client'

import { useState } from 'react'
import { Flame } from 'lucide-react'
import { ScreenHeader } from '@/components/screens/screen-header'
import { Card, Field, inputClass } from '@/components/shared/ui'
import { useApp } from '@/components/app-provider'
import { ACTIVITY_LEVELS, calculateMacros, type MacroResult } from '@/lib/macro'
import type { Goal } from '@/lib/types'

const GOALS: { id: Goal; label: string; hint: string }[] = [
  { id: 'Cutting', label: 'Tharje', hint: 'Humbje yndyre' },
  { id: 'Maintenance', label: 'Mbajtje', hint: 'Ruajtje peshe' },
  { id: 'Bulking', label: 'Masë', hint: 'Rritje muskujsh' },
]

export function MacroScreen() {
  const { currentUser } = useApp()
  const [gender, setGender] = useState<'Mashkull' | 'Femër'>('Mashkull')
  const [age, setAge] = useState(String(currentUser?.age ?? 24))
  const [height, setHeight] = useState(String(currentUser?.height ?? 180))
  const [weight, setWeight] = useState(String(currentUser?.weight ?? 80))
  const [activity, setActivity] = useState(1.55)
  const [goal, setGoal] = useState<Goal>('Maintenance')
  const [result, setResult] = useState<MacroResult | null>(null)

  function calculate() {
    setResult(
      calculateMacros({
        gender,
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        activity,
        goal,
      }),
    )
  }

  return (
    <div className="min-h-dvh pb-28">
      <ScreenHeader title="Makro & Kalori" subtitle="Llogarit nevojat ushqimore" />

      <div className="flex flex-col gap-4 px-4 pt-4">
        <Card className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            {(['Mashkull', 'Femër'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                  gender === g ? 'border-primary bg-primary/10' : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Mosha">
              <input type="number" className={inputClass} value={age} onChange={(e) => setAge(e.target.value)} />
            </Field>
            <Field label="Gjatësia">
              <input type="number" className={inputClass} value={height} onChange={(e) => setHeight(e.target.value)} />
            </Field>
            <Field label="Pesha (kg)">
              <input type="number" className={inputClass} value={weight} onChange={(e) => setWeight(e.target.value)} />
            </Field>
          </div>

          <Field label="Niveli i aktivitetit">
            <select
              className={inputClass}
              value={activity}
              onChange={(e) => setActivity(Number(e.target.value))}
            >
              {ACTIVITY_LEVELS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-muted-foreground">Objektivi</span>
            <div className="grid grid-cols-3 gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`rounded-xl border p-2.5 text-center transition-colors ${
                    goal === g.id ? 'border-primary bg-primary/10' : 'border-border bg-background'
                  }`}
                >
                  <span className="block text-sm font-semibold">{g.label}</span>
                  <span className="block text-[10px] text-muted-foreground">{g.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={calculate}
            className="rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground"
          >
            Llogarit
          </button>
        </Card>

        {result && (
          <div className="animate-rise flex flex-col gap-3">
            <Card className="flex items-center gap-4 border-primary/30 bg-gradient-to-br from-primary/15 to-card">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
                <Flame className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-black leading-none">{result.calories}</p>
                <p className="text-sm text-muted-foreground">kalori në ditë</p>
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <MacroCard label="Proteina" value={result.protein} color="var(--primary)" />
              <MacroCard label="Karbohidrate" value={result.carbs} color="var(--success)" />
              <MacroCard label="Yndyra" value={result.fat} color="#F59E0B" />
            </div>

            <Card className="flex justify-between text-sm">
              <div>
                <p className="text-muted-foreground">BMR</p>
                <p className="font-semibold">{result.bmr} kcal</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">TDEE</p>
                <p className="font-semibold">{result.tdee} kcal</p>
              </div>
            </Card>
            <p className="px-1 text-xs text-muted-foreground text-pretty">
              Vlerat janë orientuese, të bazuara në formulën Mifflin-St Jeor. Konsulto një specialist për plan të
              personalizuar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function MacroCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="p-3.5 text-center">
      <p className="text-2xl font-black" style={{ color }}>
        {value}g
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  )
}
