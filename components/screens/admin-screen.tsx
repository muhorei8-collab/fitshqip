'use client'

import { useMemo } from 'react'
import { Activity, Dumbbell, Users, Weight } from 'lucide-react'
import { ScreenHeader } from '@/components/screens/screen-header'
import { Avatar, Card, SectionTitle } from '@/components/shared/ui'
import { useApp } from '@/components/app-provider'
import { formatDayShort, formatVolume } from '@/lib/format'

export function AdminScreen() {
  const { users, allSessions, currentUser } = useApp()
  const unit = currentUser?.unit ?? 'kg'

  const stats = useMemo(() => {
    const totalVolume = allSessions.reduce((t, s) => t + s.totalVolume, 0)
    return {
      users: users.length,
      workouts: allSessions.length,
      volume: totalVolume,
    }
  }, [users, allSessions])

  const activityLog = useMemo(() => {
    return [...allSessions]
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .slice(0, 25)
      .map((s) => ({
        session: s,
        user: users.find((u) => u.id === s.userId),
      }))
  }, [allSessions, users])

  return (
    <div className="min-h-dvh pb-28">
      <ScreenHeader title="Paneli i Administratës" subtitle="FITSHQIP Headquarters" />

      <div className="flex flex-col gap-5 px-4 pt-4">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-card">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Themeluesi</p>
          <p className="mt-1 text-xl font-black">Rei Muho</p>
          <p className="text-sm text-muted-foreground">Rei Muho Developments</p>
        </Card>

        <div>
          <SectionTitle>Analitika e platformës</SectionTitle>
          <div className="grid grid-cols-1 gap-3">
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black leading-none">{stats.users}</p>
                <p className="text-sm text-muted-foreground">Përdorues të regjistruar</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15">
                <Dumbbell className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-black leading-none">{stats.workouts}</p>
                <p className="text-sm text-muted-foreground">Stërvitje të përfunduara</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Weight className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-black leading-none">{formatVolume(stats.volume, unit)}</p>
                <p className="text-sm text-muted-foreground">Vëllim total i ngritur</p>
              </div>
            </Card>
          </div>
        </div>

        <div>
          <SectionTitle>Regjistri i përdoruesve</SectionTitle>
          <div className="flex flex-col gap-2">
            {users.map((u) => {
              const count = allSessions.filter((s) => s.userId === u.id).length
              return (
                <Card key={u.id} className="flex items-center gap-3 py-3">
                  <Avatar name={u.fullName} color={u.avatarColor} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{u.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{count} stërvitje</span>
                </Card>
              )
            })}
          </div>
        </div>

        <div>
          <SectionTitle>
            <span className="flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              Log i aktivitetit
            </span>
          </SectionTitle>
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-border">
              {activityLog.map(({ session, user }) => (
                <div key={session.id} className="flex items-center justify-between gap-3 p-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user?.fullName ?? 'Përdorues'} · {session.routineName}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDayShort(session.date)}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-primary">
                    {formatVolume(session.totalVolume, unit)}
                  </span>
                </div>
              ))}
              {activityLog.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">Ende pa aktivitet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
