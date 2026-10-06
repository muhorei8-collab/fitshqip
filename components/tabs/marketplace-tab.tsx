'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/shared/ui'

type SectionId = 'supplements' | 'diet'

// Qëllimisht pa produkte, çmime apo plane: vetëm struktura për zgjerimin e ardhshëm.
const SECTIONS: Record<SectionId, { emoji: string; title: string; description: string }> = {
  supplements: {
    emoji: '💊',
    title: 'Suplemente',
    description:
      'Po përgatisim këtë pjesë për suplementet. Do të hapet së shpejti në FitShqip.',
  },
  diet: {
    emoji: '🥗',
    title: 'Dieta',
    description:
      'Po përgatisim këtë pjesë për përmbajtjen ushqimore. Do të hapet së shpejti në FitShqip.',
  },
}

function ComingSoonPill() {
  return (
    <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
      Coming Soon
    </span>
  )
}

export function MarketplaceTab() {
  const [section, setSection] = useState<SectionId | null>(null)

  if (section) {
    const s = SECTIONS[section]
    return (
      <div className="flex flex-col gap-5 px-4 pb-28 pt-6">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSection(null)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
            aria-label="Kthehu"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight">{s.title}</h1>
        </header>

        <Card className="animate-rise flex flex-col items-center border-primary/30 bg-gradient-to-br from-primary/10 to-card px-6 py-14 text-center">
          <div className="animate-pop flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 text-5xl">
            <span aria-hidden>{s.emoji}</span>
          </div>
          <div className="mt-5">
            <ComingSoonPill />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-balance">Së shpejti në FitShqip</h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
            {s.description}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-28 pt-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Zbulo së shpejti produkte dhe përmbajtje të krijuara për rrugëtimin tënd fitness.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {(Object.keys(SECTIONS) as SectionId[]).map((id) => {
          const s = SECTIONS[id]
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className="rounded-2xl text-left transition-transform active:scale-[0.98]"
            >
              <Card className="flex items-center gap-4">
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-3xl"
                  aria-hidden
                >
                  {s.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold leading-tight">{s.title}</h2>
                  <div className="mt-1.5">
                    <ComingSoonPill />
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
