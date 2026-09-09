'use client'

import { ChevronLeft } from 'lucide-react'
import { useNav } from '@/components/nav'

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { closeScreen } = useNav()
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
      <button
        type="button"
        onClick={closeScreen}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
        aria-label="Kthehu"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div>
        <h1 className="text-lg font-bold leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </header>
  )
}
