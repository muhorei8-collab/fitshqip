'use client'

import { Briefcase, Home, ShoppingBag, TrendingUp, User } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { useNav, type Tab } from '@/components/nav'
import { cn } from '@/lib/utils'

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Kryefaqja', icon: Home },
  { id: 'progress', label: 'Progresi', icon: TrendingUp },
  { id: 'marketplace', label: 'Dyqani', icon: ShoppingBag },
  { id: 'office', label: 'Zyra', icon: Briefcase },
  { id: 'profile', label: 'Profili', icon: User },
]

export function BottomNav() {
  const { tab, setTab, screen } = useNav()
  const { currentUser } = useApp()
  // "Zyra" shfaqet vetëm për trajnerët; kontrolli i vërtetë është në databazë, jo këtu.
  const tabs = TABS.filter((t) => t.id !== 'office' || currentUser?.role === 'trainer')
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((t) => {
          // Stërvitja hapet nga Kryefaqja, ndaj aty mbetet i ndezur "Kryefaqja".
          const active = (tab === t.id || (t.id === 'dashboard' && tab === 'workout')) && !screen
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
                  tabs.length > 6 ? 'text-[9px]' : 'text-[10px]',
                  'font-medium transition-colors',
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
