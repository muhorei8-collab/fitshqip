'use client'

import { Copy } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Card } from '@/components/shared/ui'

// ID-ja 10-shifrore e FitShqip. Vetëm lexim: gjenerohet dhe mbyllet nga databaza
// (trigger lock_personal_id), kështu që këtu nuk ka asnjë mënyrë ndryshimi.
export function PersonalIdCard() {
  const { currentUser, showToast } = useApp()
  const id = currentUser?.personalId ?? ''

  async function copy() {
    if (!id) return
    try {
      await navigator.clipboard.writeText(id)
      showToast('ID u kopjua!', 'success')
    } catch {
      showToast('Nuk u kopjua. Kopjoje manualisht.', 'error')
    }
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-card">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">ID-ja jote në FitShqip</p>
      <p className="mt-2 break-all font-mono text-3xl font-black tracking-widest tabular-nums">{id || '—'}</p>
      <button
        type="button"
        onClick={copy}
        disabled={!id}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        <Copy className="h-4 w-4" />
        Kopjo ID
      </button>
    </Card>
  )
}
