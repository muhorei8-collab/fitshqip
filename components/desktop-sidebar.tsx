'use client'

import { Briefcase, Home, ShoppingBag, TrendingUp, User } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { useNav, type Tab } from '@/components/nav'
import { UserAvatar } from '@/components/shared/user-avatar'
import { cn } from '@/lib/utils'

const ITEMS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Pasqyra', icon: Home },
  { id: 'progress', label: 'Progresi', icon: TrendingUp },
  { id: 'office', label: 'Zyra', icon: Briefcase },
  { id: 'marketplace', label: 'Dyqani', icon: ShoppingBag },
  { id: 'profile', label: 'Profili', icon: User },
]

// Navigimi anësor për trajnerët në ekrane të gjera (lg e lart). Në telefon dhe tablet portret
// përdoret shiriti poshtë, ndaj ky shfaqet vetëm në desktop.
export function DesktopSidebar() {
  const { tab, setTab, screen } = useNav()
  const { currentUser } = useApp()
  if (!currentUser) return null

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="px-5 pb-4 pt-6">
        <p className="text-xl font-black tracking-tight">FITSHQIP</p>
        <p className="text-xs text-muted-foreground">Hapësira e trajnerit</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Navigimi kryesor">
        {ITEMS.map((t) => {
          // Stërvitja hapet nga Kryefaqja, ndaj aty mbetet i ndezur "Kryefaqja".
          const active = (tab === t.id || (t.id === 'dashboard' && tab === 'workout')) && !screen
          const Icon = t.icon
          const isOffice = t.id === 'office'
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                isOffice
                  ? active
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                    : 'text-primary hover:bg-primary/10'
                  : active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              {t.label}
            </button>
          )
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-border p-4">
        <UserAvatar name={currentUser.fullName} color={currentUser.avatarColor} url={currentUser.avatarUrl} size={36} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{currentUser.fullName}</p>
          <p className="text-xs text-muted-foreground">{currentUser.coachVerified ? 'Trajner ✓' : 'Trajner'}</p>
        </div>
      </div>
    </aside>
  )
}
