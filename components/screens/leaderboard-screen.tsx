'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Flame, Trophy, Weight } from 'lucide-react'
import { ScreenHeader } from '@/components/screens/screen-header'
import { Card, EmptyState } from '@/components/shared/ui'
import { UserAvatar } from '@/components/shared/user-avatar'
import { useApp } from '@/components/app-provider'
import { supabase } from '@/lib/supabase/client'
import { formatVolume } from '@/lib/format'

interface StatRow {
  user_id: string
  weekly_volume: number | string
  streak: number
}

export function LeaderboardScreen() {
  const { users, currentUser } = useApp()
  const [mode, setMode] = useState<'volume' | 'streak'>('volume')
  const [stats, setStats] = useState<StatRow[] | null>(null)
  const [error, setError] = useState(false)
  const unit = currentUser?.unit ?? 'kg'

  // Numrat vijnë nga serveri (vëllimi i javës dhe ditët rresht për çdo përdorues të dukshëm).
  const load = useCallback(async () => {
    const { data, error: rpcError } = await supabase.rpc('leaderboard_stats')
    if (rpcError) {
      setError(true)
      return
    }
    setError(false)
    setStats((data ?? []) as StatRow[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const ranked = useMemo(() => {
    const rows = (stats ?? []).flatMap((s) => {
      const user = users.find((u) => u.id === s.user_id)
      return user ? [{ user, volume: Number(s.weekly_volume) || 0, streak: s.streak }] : []
    })
    return rows.sort((a, b) => (mode === 'volume' ? b.volume - a.volume : b.streak - a.streak))
  }, [stats, users, mode])

  const hiddenSelf = stats !== null && !!currentUser && !stats.some((s) => s.user_id === currentUser.id)
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-dvh pb-28">
      <ScreenHeader title="Klasifikimi" subtitle="Renditja e komunitetit FITSHQIP" />

      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setMode('volume')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              mode === 'volume' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            <Weight className="h-4 w-4" />
            Vëllimi javor
          </button>
          <button
            type="button"
            onClick={() => setMode('streak')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              mode === 'streak' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            <Flame className="h-4 w-4" />
            Ditë rresht
          </button>
        </div>
      </div>

      {error ? (
        <div className="px-4 pt-6">
          <EmptyState
            icon={Trophy}
            title="Nuk u ngarkua"
            description="Kontrollo lidhjen dhe provo përsëri."
            action={
              <button
                type="button"
                onClick={load}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Provo përsëri
              </button>
            }
          />
        </div>
      ) : stats === null ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 px-4 pt-4">
          {hiddenSelf && (
            <p className="rounded-2xl border border-dashed border-border px-4 py-3 text-center text-xs text-muted-foreground text-pretty">
              Ke zgjedhur të mos shfaqesh në klasifikim. Mund ta ndryshosh te Profili → Cilësimet.
            </p>
          )}
          {ranked.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Ende pa rezultate këtë javë.</p>
          )}
          {ranked.map((row, i) => {
            const isMe = row.user.id === currentUser?.id
            return (
              <Card
                key={row.user.id}
                className={`flex items-center gap-3 ${isMe ? 'border-primary/50 bg-primary/5' : ''}`}
              >
                <span className="w-7 text-center text-lg font-bold">
                  {i < 3 ? medals[i] : <span className="text-muted-foreground">{i + 1}</span>}
                </span>
                <UserAvatar name={row.user.fullName} color={row.user.avatarColor} url={row.user.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {row.user.fullName}
                    {isMe && <span className="ml-1 text-xs text-primary">(Ti)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{row.user.level}</p>
                </div>
                <div className="text-right">
                  {mode === 'volume' ? (
                    <p className="font-bold text-primary">{formatVolume(row.volume, unit)}</p>
                  ) : (
                    <p className="font-bold text-primary">🔥 {row.streak}</p>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
