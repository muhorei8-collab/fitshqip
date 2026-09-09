'use client'

import { useMemo, useState } from 'react'
import { Plus, Target, Trophy } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Card, Chip, EmptyState, Field, Modal, ProgressBar, SectionTitle, inputClass } from '@/components/shared/ui'
import { LineChart } from '@/components/shared/charts'
import { computePRs } from '@/lib/storage'
import { displayWeight, formatVolume, kgToUnit } from '@/lib/format'

const RANGES = [
  { label: '7 Ditë', days: 7 },
  { label: '30 Ditë', days: 30 },
  { label: '3 Muaj', days: 90 },
  { label: '1 Vit', days: 365 },
  { label: 'Të Gjitha', days: Infinity },
]

export function ProgressTab() {
  const { currentUser, sessions, metrics, goals, addMetric, setGoals, showToast } = useApp()
  const [range, setRange] = useState(1) // 30 days
  const [weightOpen, setWeightOpen] = useState(false)
  const [goalOpen, setGoalOpen] = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState(goals?.targetWeight ? String(goals.targetWeight) : '')

  const unit = currentUser?.unit ?? 'kg'

  const chartData = useMemo(() => {
    const days = RANGES[range].days
    const cutoff = days === Infinity ? 0 : Date.now() - days * 86400000
    return metrics
      .filter((m) => new Date(m.date).getTime() >= cutoff)
      .map((m) => ({
        label: new Date(m.date).toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' }),
        value: kgToUnit(m.weight, unit),
      }))
  }, [metrics, range, unit])

  const prs = useMemo(() => computePRs(sessions), [sessions])

  const currentWeight = currentUser?.weight ?? 0
  const startWeight = metrics[0]?.weight ?? currentWeight
  const weightDelta = currentWeight - startWeight

  const toKg = (v: number) => (unit === 'lb' ? v / 2.20462 : v)

  function saveWeight() {
    const w = Number(newWeight)
    if (!w || w <= 0) {
      showToast('Vendos një peshë të vlefshme.', 'error')
      return
    }
    addMetric(Math.round(toKg(w) * 10) / 10)
    showToast('Pesha u regjistrua!', 'success')
    setNewWeight('')
    setWeightOpen(false)
  }

  function saveGoal() {
    const w = Number(targetWeight)
    if (!w || w <= 0) {
      showToast('Vendos një peshë objektiv të vlefshme.', 'error')
      return
    }
    setGoals({ targetWeight: Math.round(toKg(w) * 10) / 10, targetLifts: goals?.targetLifts ?? [] })
    showToast('Objektivi u ruajt!', 'success')
    setGoalOpen(false)
  }

  // goal progress: how close current weight is to target (works for cut or bulk)
  const goalProgress = useMemo(() => {
    if (!goals?.targetWeight) return 0
    const total = Math.abs(goals.targetWeight - startWeight) || 1
    const done = Math.abs(currentWeight - startWeight)
    return Math.min(100, (done / total) * 100)
  }, [goals, startWeight, currentWeight])

  return (
    <div className="flex flex-col gap-5 px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Progresi</h1>
          <p className="text-sm text-muted-foreground">Ndiq peshën dhe objektivat</p>
        </div>
        <button
          type="button"
          onClick={() => setWeightOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Peshë
        </button>
      </header>

      {/* Body weight chart */}
      <Card>
        <SectionTitle>Pesha trupore</SectionTitle>
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-3xl font-black">{displayWeight(currentWeight, unit)}</span>
          <span className={`text-sm font-medium ${weightDelta >= 0 ? 'text-success' : 'text-primary'}`}>
            {weightDelta >= 0 ? '+' : ''}
            {kgToUnit(weightDelta, unit).toFixed(1)} {unit}
          </span>
        </div>
        <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1">
          {RANGES.map((r, i) => (
            <Chip key={r.label} active={range === i} onClick={() => setRange(i)}>
              {r.label}
            </Chip>
          ))}
        </div>
        {chartData.length > 1 ? (
          <LineChart data={chartData} unit={unit} />
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Regjistro peshën disa herë për të parë grafikun.
          </p>
        )}
      </Card>

      {/* Goals */}
      <Card>
        <SectionTitle
          action={
            <button
              type="button"
              onClick={() => {
                setTargetWeight(goals?.targetWeight ? String(goals.targetWeight) : '')
                setGoalOpen(true)
              }}
              className="text-sm font-medium text-primary"
            >
              {goals ? 'Ndrysho' : 'Vendos'}
            </button>
          }
        >
          Objektivat
        </SectionTitle>
        {goals?.targetWeight ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Target className="h-4 w-4 text-primary" />
                Pesha objektiv
              </span>
              <span className="font-semibold">{displayWeight(goals.targetWeight, unit)}</span>
            </div>
            <ProgressBar value={goalProgress} tone="success" />
            <p className="text-xs text-muted-foreground">{Math.round(goalProgress)}% drejt objektivit</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Vendos një peshë objektiv për të ndjekur progresin.</p>
        )}
      </Card>

      {/* Personal records */}
      <div>
        <SectionTitle>Rekordet e Mia</SectionTitle>
        {prs.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {prs.map((pr) => (
              <Card key={pr.exercise} className="p-3.5">
                <div className="mb-1 flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-success" />
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                    {pr.muscle}
                  </span>
                </div>
                <p className="truncate text-sm font-semibold">{pr.exercise}</p>
                <p className="mt-1 text-lg font-bold text-primary">{displayWeight(pr.maxWeight, unit)}</p>
                <p className="text-xs text-muted-foreground">
                  Vëllimi më i mirë: {formatVolume(pr.bestVolume, unit)}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="Ende pa rekorde"
            description="Përfundo stërvitjen tënde të parë për të vendosur rekordet personale."
          />
        )}
      </div>

      {/* Modals */}
      <Modal open={weightOpen} onClose={() => setWeightOpen(false)} title="Regjistro Peshën">
        <Field label={`Pesha aktuale (${unit})`}>
          <input
            type="number"
            inputMode="decimal"
            className={inputClass}
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder={displayWeight(currentWeight, unit)}
            autoFocus
          />
        </Field>
        <button
          type="button"
          onClick={saveWeight}
          className="mt-5 w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground"
        >
          Ruaj
        </button>
      </Modal>

      <Modal open={goalOpen} onClose={() => setGoalOpen(false)} title="Vendos Objektivin">
        <Field label={`Pesha objektiv (${unit})`}>
          <input
            type="number"
            inputMode="decimal"
            className={inputClass}
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            placeholder="p.sh. 85"
            autoFocus
          />
        </Field>
        <button
          type="button"
          onClick={saveGoal}
          className="mt-5 w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground"
        >
          Ruaj Objektivin
        </button>
      </Modal>
    </div>
  )
}
