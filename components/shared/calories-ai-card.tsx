'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Modal } from '@/components/shared/ui'

// Karta "Kalori me AI" (SË SHPEJTI). E njëjta kartë përdoret te klienti dhe te trajneri.
// Funksioni nuk është aktiv: prekja hap vetëm njoftimin "Së shpejti", pa asnjë llogaritje.
export function CaloriesAiCard() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left transition-colors active:bg-secondary"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
          <Sparkles className="h-5 w-5 text-primary" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">Kalori me AI</span>
          <span className="block text-xs text-muted-foreground">Llogarit kaloritë e ushqimeve të tua</span>
        </span>
        <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
          Së shpejti
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Kalori me AI">
        <div className="flex flex-col items-center text-center">
          <div className="animate-pop flex h-20 w-20 items-center justify-center rounded-full bg-primary/15">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h3 className="mt-4 text-xl font-black tracking-tight">Së shpejti në FitShqip</h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
            Po përgatisim llogaritjen e kalorive të ushqimeve me inteligjencë artificiale. Do të hapet shumë shpejt.
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-6 w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground"
          >
            Në rregull
          </button>
        </div>
      </Modal>
    </>
  )
}
