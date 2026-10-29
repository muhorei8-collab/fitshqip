'use client'

import { Briefcase, Home, ShoppingBag, TrendingUp, User } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { useNav, type Tab } from '@/components/nav'
import { cn } from '@/lib/utils'

// Zyra është në mes (pozita e 3-të nga 5) dhe vetëm për trajnerët.
const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Kryefaqja', icon: Home },
  { id: 'progress', label: 'Progresi', icon: TrendingUp },
  { id: 'office', label: 'Zyra', icon: Briefcase },
  { id: 'marketplace', label: 'Dyqani', icon: ShoppingBag },
  { id: 'profile', label: 'Profili', icon: User },
]

export function BottomNav() {
  const { tab, setTab, screen } = useNav()
  const { currentUser } = useApp()
  // "Zyra" shfaqet vetëm për trajnerët; kontrolli i vërtetë është në databazë, jo këtu.
  const tabs = TABS.filter((t) => t.id !== 'office' || currentUser?.role === 'trainer')

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur-lg',
        currentUser?.role === 'trainer' && 'lg:hidden',
      )}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((t) => {
          // Stërvitja hapet nga Kryefaqja, ndaj aty mbetet i ndezur "Kryefaqja".
          const active = (tab === t.id || (t.id === 'dashboard' && tab === 'workout')) && !screen
          const Icon = t.icon

          if (t.id === 'office') {
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="flex flex-1 flex-col items-center justify-end gap-1 pb-2.5"
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={cn(
                    '-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-4 transition-transform active:scale-95',
                    active ? 'ring-primary/30' : 'ring-card',
                  )}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-[10px] font-bold text-primary">{t.label}</span>
              </button>
            )
          }

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
