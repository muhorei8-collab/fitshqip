'use client'

import { useEffect, useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Card, Modal } from '@/components/shared/ui'
import { startOfWeek } from '@/lib/storage'
import { supabase } from '@/lib/supabase/client'
import { CHECKIN_MESSAGES, RATINGS, useMyCheckins, weekLabel, type Checkin } from '@/lib/supabase/checkins'
import { localDayKey } from '@/lib/supabase/water'

type Values = { energy: number; sleep: number; adherence: number }
const EMPTY: Values = { energy: 0, sleep: 0, adherence: 0 }

// Formulari i check-in-it javor (klienti → trajneri). Mund të ndryshohet derisa trajneri të përgjigjet.
export function CheckinForm({
  open,
  onClose,
  initial,
  onSent,
}: {
  open: boolean
  onClose: () => void
  initial?: Checkin | null
  onSent: () => void
}) {
  const { showToast } = useApp()
  const [values, setValues] = useState<Values>(EMPTY)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues(initial ? { energy: initial.energy, sleep: initial.sleep, adherence: initial.adherence } : EMPTY)
    setNote(initial?.note ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function send() {
    if (values.energy === 0 || values.sleep === 0 || values.adherence === 0) {
      showToast('Vlerëso të tria pikat (1–5) para se ta dërgosh.', 'error')
      return
    }
    setSaving(true)
    const { data, error } = await supabase.rpc('submit_checkin', {
      p_energy: values.energy,
      p_sleep: values.sleep,
      p_adherence: values.adherence,
      p_note: note.trim(),
    })
    setSaving(false)
    if (error) {
      showToast('Check-in nuk u dërgua. Provo përsëri.', 'error')
      return
    }
    const msg = CHECKIN_MESSAGES[data as string] ?? { text: 'Diçka shkoi keq. Provo përsëri.', tone: 'error' as const }
    showToast(msg.text, msg.tone)
    if (data === 'submitted' || data === 'updated') {
      onSent()
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Check-in · ${weekLabel(localDayKey(startOfWeek()))}`}>
      <div className="flex flex-col gap-4">
        {RATINGS.map((r) => (
          <div key={r.key}>
            <p className="mb-1.5 text-sm font-semibold">{r.label}</p>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setValues((v) => ({ ...v, [r.key]: n }))}
                  className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                    values[r.key] === n
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                  aria-label={`${r.label}: ${n} nga 5`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>{r.low}</span>
              <span>{r.high}</span>
            </div>
          </div>
        ))}

        <div>
          <p className="mb-1.5 text-sm font-semibold">Shënim për trajnerin (opsional)</p>
          <textarea
            value={note}
            maxLength={600}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Çfarë shkoi mirë? Çfarë të vështirësoi këtë javë?"
            className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none focus:border-primary"
          />
          <p className="mt-1 text-right text-[10px] text-muted-foreground">{note.length}/600</p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={send}
          className="rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving ? 'Po dërgohet…' : initial ? 'Ruaj ndryshimet' : 'Dërgo check-in'}
        </button>
        <p className="text-center text-xs text-muted-foreground text-pretty">
          Këtë e sheh vetëm trajneri yt aktual. Mund ta ndryshosh derisa të të përgjigjet.
        </p>
      </div>
    </Modal>
  )
}

// Karta te Kryefaqja: shfaqet vetëm kur ke trajner aktiv.
export function CheckinPrompt() {
  const { currentUser } = useApp()
  const { hasCoach, thisWeek, reload } = useMyCheckins(currentUser?.id)
  const [open, setOpen] = useState(false)

  if (!currentUser || !hasCoach) return null

  return (
    <>
      {!thisWeek ? (
        <Card className="flex items-center gap-3 border-primary/30 bg-gradient-to-br from-primary/10 to-card">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Check-in javor</p>
            <p className="text-xs text-muted-foreground">Trajneri yt pret përditësimin e javës.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
          >
            Dërgo
          </button>
        </Card>
      ) : thisWeek.reviewedAt ? (
        <Card className="flex flex-col gap-1 border-success/30 bg-gradient-to-br from-success/10 to-card">
          <p className="text-xs font-medium uppercase tracking-wide text-success">Trajneri t’u përgjigj</p>
          <p className="text-sm text-pretty">{thisWeek.feedback || 'Pa koment, check-in u shqyrtua.'}</p>
        </Card>
      ) : (
        <Card className="flex items-center justify-between gap-3 py-3">
          <p className="text-sm text-muted-foreground">✓ Check-in i javës u dërgua. Pret përgjigjen.</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 text-xs font-semibold text-primary"
          >
            Ndrysho
          </button>
        </Card>
      )}
      <CheckinForm open={open} onClose={() => setOpen(false)} initial={thisWeek} onSent={reload} />
    </>
  )
}
