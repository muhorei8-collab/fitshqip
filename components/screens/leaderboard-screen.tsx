'use client'

import { useMemo, useState } from 'react'
import { Flame, Weight } from 'lucide-react'
import { ScreenHeader } from '@/components/screens/screen-header'
import { Avatar, Card } from '@/components/shared/ui'
import { useApp } from '@/components/app-provider'
import { computeStreak, weeklyVolume } from '@/lib/storage'
import { formatVolume } from '@/lib/format'

export function LeaderboardScreen() {
  const { users, allSessions, currentUser } = useApp()
  const [mode, setMode] = useState<'volume' | 'streak'>('volume')
  const unit = currentUser?.unit ?? 'kg'

  const ranked = useMemo(() => {
    const rows = users.map((u) => {
      const sessions = allSessions.filter((s) => s.userId === u.id)
      return {
        user: u,
        volume: weeklyVolume(sessions),
        streak: computeStreak(sessions),
      }
    })
    return rows.sort((a, b) => (mode === 'volume' ? b.volume - a.volume : b.streak - a.streak))
  }, [users, allSessions, mode])

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

      <div className="flex flex-col gap-2.5 px-4 pt-4">
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
              <Avatar name={row.user.fullName} color={row.user.avatarColor} />
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
    </div>
  )
}
