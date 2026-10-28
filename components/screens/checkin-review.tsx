'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { Modal } from '@/components/shared/ui'
import { supabase } from '@/lib/supabase/client'
import { RATINGS, weekLabel, type Checkin } from '@/lib/supabase/checkins'

// Dritarja e trajnerit: lexon check-in-in dhe i përgjigjet klientit.
export function CheckinReview({
  checkin,
  clientName,
  onClose,
  onSaved,
}: {
  checkin: Checkin | null
  clientName: string
  onClose: () => void
  onSaved: () => void
}) {
  const { showToast } = useApp()
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFeedback(checkin?.feedback ?? '')
  }, [checkin])

  async function save() {
    if (!checkin) return
    setSaving(true)
    const { data, error } = await supabase.rpc('review_checkin', { p_id: checkin.id, p_feedback: feedback.trim() })
    setSaving(false)
    if (error || data !== 'ok') {
      showToast(
        data === 'invalid' ? 'Përgjigja mund të ketë deri në 600 shkronja.' : 'Përgjigja nuk u ruajt. Provo përsëri.',
        'error',
      )
      return
    }
    showToast('Përgjigja u dërgua te klienti.', 'success')
    onSaved()
  }

  return (
    <Modal
      open={!!checkin}
      onClose={onClose}
      title={checkin ? `${clientName} · ${weekLabel(checkin.weekStart)}` : undefined}
    >
      {checkin && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {RATINGS.map((r) => (
              <div key={r.key} className="flex items-center justify-between gap-3">
                <span className="text-sm">{r.label}</span>
                <span className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-2.5 w-5 rounded-full ${n <= checkin[r.key] ? 'bg-primary' : 'bg-secondary'}`}
                    />
                  ))}
                  <span className="ml-2 w-8 text-right text-xs font-semibold text-muted-foreground">
                    {checkin[r.key]}/5
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-secondary px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Shënimi i klientit</p>
            <p className="mt-1 text-sm text-pretty">{checkin.note || 'Pa shënim.'}</p>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-semibold">Përgjigja jote</p>
            <textarea
              value={feedback}
              maxLength={600}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Feedback, korrigjime ose çfarë të ndryshojë javën tjetër…"
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none focus:border-primary"
            />
            <p className="mt-1 text-right text-[10px] text-muted-foreground">{feedback.length}/600</p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? 'Po dërgohet…' : checkin.reviewedAt ? 'Ruaj përgjigjen e re' : 'Dërgo përgjigjen'}
          </button>
        </div>
      )}
    </Modal>
  )
}
