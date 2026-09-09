'use client'

import { CalendarDays, Dumbbell, Home, TrendingUp, User } from 'lucide-react'
import { useNav, type Tab } from '@/components/nav'
import { cn } from '@/lib/utils'

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Kryefaqja', icon: Home },
  { id: 'workout', label: 'Stërvitja', icon: Dumbbell },
  { id: 'progress', label: 'Progresi', icon: TrendingUp },
  { id: 'history', label: 'Historia', icon: CalendarDays },
  { id: 'profile', label: 'Profili', icon: User },
]

export function BottomNav() {
  const { tab, setTab, screen } = useNav()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((t) => {
          const active = tab === t.id && !screen
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5"
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={cn('h-6 w-6 transition-colors', active ? 'text-primary' : 'text-muted-foreground')}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
