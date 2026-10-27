'use client'

import { useState } from 'react'
import { Droplets, Trash2, Undo2 } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Card, Modal, ProgressBar, inputClass } from '@/components/shared/ui'
import { DAYS_SQ } from '@/lib/format'
import { DEFAULT_WATER_GOAL, QUICK_AMOUNTS, localDayKey, useWater } from '@/lib/supabase/water'

const pad = (n: number) => String(n).padStart(2, '0')
const hhmm = (iso: string) => {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function WaterCard() {
  const { currentUser, updateProfile, showToast } = useApp()
  const { loading, error, add, remove, byDay, todayTotal, todayLogs } = useWater(currentUser?.id)
  const goal = currentUser?.waterGoalMl ?? DEFAULT_WATER_GOAL
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState('')
  const [goalInput, setGoalInput] = useState('')

  const pct = Math.min(100, (todayTotal / goal) * 100)
  const reached = todayTotal >= goal

  async function quickAdd(ml: number) {
    const res = await add(ml)
    if (res === 'error') showToast('Uji nuk u ruajt. Provo përsëri.', 'error')
  }

  async function addCustom() {
    const ml = Number(custom)
    if (!ml || ml < 10 || ml > 3000) {
      showToast('Vendos një sasi mes 10 dhe 3000 ml.', 'error')
      return
    }
    const res = await add(ml)
    if (res === 'error') showToast('Uji nuk u ruajt. Provo përsëri.', 'error')
    else if (res === 'ok') setCustom('')
  }

  async function undoLast() {
    const last = todayLogs[0]
    if (!last) return
    const ok = await remove(last.id)
    if (!ok) showToast('Nuk u fshi. Provo përsëri.', 'error')
  }

  async function saveGoal() {
    const g = Number(goalInput)
    if (!g || g < 500 || g > 8000) {
      showToast('Synimi duhet të jetë mes 500 dhe 8000 ml.', 'error')
      return
    }
    const ok = await updateProfile({ waterGoalMl: Math.round(g) })
    if (!ok) showToast('Synimi nuk u ruajt.', 'error')
    else {
      showToast('Synimi u ruajt.', 'success')
      setGoalInput('')
    }
  }

  // 7 ditët e fundit (përfshirë sot), sipas orës lokale.
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { label: DAYS_SQ[d.getDay()], total: byDay[localDayKey(d)] ?? 0 }
  })
  const weekMax = Math.max(goal, ...week.map((w) => w.total))

  return (
    <>
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Droplets className="h-4 w-4 text-primary" />
            Uji sot
          </span>
          <span className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{todayTotal}</span> / {goal} ml
          </span>
        </div>
        <ProgressBar value={pct} tone="success" />
        {error ? (
          <p className="text-xs text-muted-foreground">Uji nuk u ngarkua. Kontrollo lidhjen.</p>
        ) : (
          <>
            {reached && <p className="text-xs font-medium text-success">🎯 Synimi i ditës u arrit!</p>}
            <div className="grid grid-cols-4 gap-2">
              {[200, 330, 500].map((ml) => (
                <button
                  key={ml}
                  type="button"
                  disabled={loading}
                  onClick={() => quickAdd(ml)}
                  className="rounded-xl bg-secondary py-2 text-xs font-semibold transition-transform active:scale-95 disabled:opacity-60"
                >
                  +{ml}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl border border-border py-2 text-xs font-semibold text-primary"
              >
                Më shumë
              </button>
            </div>
          </>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Uji">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-3xl font-black">
              {todayTotal} <span className="text-base font-medium text-muted-foreground">/ {goal} ml</span>
            </p>
            <div className="mt-2">
              <ProgressBar value={pct} tone="success" />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {QUICK_AMOUNTS.map((ml) => (
              <button
                key={ml}
                type="button"
                onClick={() => quickAdd(ml)}
                className="rounded-xl bg-secondary py-2.5 text-xs font-semibold transition-transform active:scale-95"
              >
                +{ml}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              className={inputClass}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Sasia tjetër (ml)"
            />
            <button
              type="button"
              onClick={addCustom}
              className="shrink-0 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Shto
            </button>
          </div>

          {todayLogs.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Shtimet e sotme</p>
                <button
                  type="button"
                  onClick={undoLast}
                  className="flex items-center gap-1 text-xs font-semibold text-primary"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  Zhbëj të fundit
                </button>
              </div>
              <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
                {todayLogs.map((l) => (
                  <div key={l.id} className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{hhmm(l.loggedAt)}</span>
                    <span className="flex items-center gap-3">
                      <span className="font-semibold">{l.amountMl} ml</span>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await remove(l.id)
                          if (!ok) showToast('Nuk u fshi. Provo përsëri.', 'error')
                        }}
                        className="text-muted-foreground hover:text-primary"
                        aria-label="Fshi shtimin"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">7 ditët e fundit</p>
            <div className="flex h-24 items-end gap-1.5">
              {week.map((w, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-16 w-full items-end">
                    <div
                      className={`w-full rounded-md ${w.total >= goal ? 'bg-success' : 'bg-primary/60'}`}
                      style={{ height: `${Math.max(w.total > 0 ? 6 : 0, (w.total / weekMax) * 100)}%` }}
                      title={`${w.total} ml`}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{w.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Synimi ditor</p>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                className={inputClass}
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder={`${goal} ml`}
              />
              <button
                type="button"
                onClick={saveGoal}
                className="shrink-0 rounded-xl border border-border px-4 text-sm font-semibold"
              >
                Ruaj
              </button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Mes 500 dhe 8000 ml. Sasitë shënohen nga ti, jo nga një pajisje.</p>
          </div>
        </div>
      </Modal>
    </>
  )
}
