'use client'

import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Briefcase, Camera, CheckCircle2, ClipboardCheck, Droplets, Dumbbell, ListPlus, UserPlus } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { useNav } from '@/components/nav'
import { CheckinReview } from '@/components/screens/checkin-review'
import { Card, EmptyState, Modal, SectionTitle } from '@/components/shared/ui'
import { UserAvatar } from '@/components/shared/user-avatar'
import { supabase } from '@/lib/supabase/client'
import { useCoachLinks } from '@/lib/supabase/coach'
import { useCoachCheckins, weekLabel, type Checkin } from '@/lib/supabase/checkins'
import { fetchRecentClientPhotos, type ProgressPhoto } from '@/lib/supabase/photos'
import { todayIndex } from '@/lib/supabase/programs'
import { startOfWeek } from '@/lib/storage'
import { formatVolume } from '@/lib/format'

interface SessionRow {
  userId: string
  routineName: string
  date: string
  volume: number
}
interface ProgramRow {
  clientId: string
  name: string
  weekdays: number[]
}

const DAY = 86400000
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' })

// Pasqyra e trajnerit: vetëm të dhëna reale dhe të lejuara nga klientët.
// Nuk ka të ardhura, mesazhe ose "mbajtje klientësh" sepse ato nuk ekzistojnë ende te FitShqip.
export function TrainerOverview() {
  const { currentUser } = useApp()
  const { setTab, openScreen, openOfficeClient } = useNav()
  const userId = currentUser?.id
  const unit = currentUser?.unit ?? 'kg'

  const { links, loading: linksLoading } = useCoachLinks(userId, 'coach')
  const { checkins, reload: reloadCheckins } = useCoachCheckins(userId)
  const [reviewing, setReviewing] = useState<Checkin | null>(null)

  const active = useMemo(() => links.filter((l) => l.status === 'active'), [links])
  const pendingInvites = links.filter((l) => l.status === 'pending').length

  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [programs, setPrograms] = useState<ProgramRow[]>([])
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [water, setWater] = useState<Record<string, number>>({})
  const [pickerOpen, setPickerOpen] = useState(false)

  const key = active.map((l) => `${l.clientId}:${l.shareWorkouts ? 1 : 0}${l.sharePhotos ? 1 : 0}${l.shareHydration ? 1 : 0}`).join(',')
  useEffect(() => {
    if (!userId) return
    if (active.length === 0) {
      setSessions([])
      setPrograms([])
      setPhotos([])
      setWater({})
      setDataLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      const since = new Date(Date.now() - 14 * DAY)
      const sIds = active.filter((l) => l.shareWorkouts).map((l) => l.clientId)
      const pIds = active.filter((l) => l.sharePhotos).map((l) => l.clientId)
      const hIds = active.filter((l) => l.shareHydration).map((l) => l.clientId)
      const dayStart = new Date()
      dayStart.setHours(0, 0, 0, 0)
      const [s, pr, ph, w] = await Promise.all([
        sIds.length
          ? supabase
              .from('workout_sessions')
              .select('user_id, routine_name, date, total_volume')
              .in('user_id', sIds)
              .gte('date', since.toISOString())
              .order('date', { ascending: false })
          : null,
        supabase.from('coach_programs').select('client_id, name, weekdays').eq('coach_id', userId).eq('status', 'active'),
        pIds.length ? fetchRecentClientPhotos(pIds, 6) : null,
        hIds.length
          ? supabase.from('water_logs').select('user_id, amount_ml').in('user_id', hIds).gte('logged_at', dayStart.toISOString())
          : null,
      ])
      if (cancelled) return
      setSessions(
        (s?.data ?? []).map((r: any) => ({
          userId: r.user_id,
          routineName: r.routine_name,
          date: r.date,
          volume: Number(r.total_volume) || 0,
        })),
      )
      setPrograms(
        (pr.data ?? []).map((r: any) => ({
          clientId: r.client_id,
          name: r.name,
          weekdays: Array.isArray(r.weekdays) ? r.weekdays.map(Number) : [],
        })),
      )
      setPhotos(ph ?? [])
      const totals: Record<string, number> = {}
      ;(w?.data ?? []).forEach((r: any) => {
        totals[r.user_id] = (totals[r.user_id] ?? 0) + r.amount_ml
      })
      setWater(totals)
      setDataLoading(false)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, userId])

  const linkOf = (clientId: string) => active.find((l) => l.clientId === clientId)
  const nameOf = (clientId: string) => linkOf(clientId)?.person?.fullName ?? 'Klient'

  const stats = useMemo(() => {
    const sharing = active.filter((l) => l.shareWorkouts)
    const weekStart = startOfWeek()
    const trainedThisWeek = sharing.filter((l) =>
      sessions.some((s) => s.userId === l.clientId && new Date(s.date) >= weekStart),
    ).length

    // "Kërkojnë ndjekje": klient që e ndan stërvitjen dhe s'ka stërvitur për 7+ ditë (ose aspak në 14 ditët e fundit).
    const needFollowUp = sharing
      .map((l) => {
        const last = sessions.find((s) => s.userId === l.clientId)
        const days = last ? Math.floor((Date.now() - +new Date(last.date)) / DAY) : null
        return { link: l, days }
      })
      .filter((x) => x.days === null || x.days >= 7)
      .sort((a, b) => (b.days ?? 99) - (a.days ?? 99))

    const today = todayIndex()
    const todayStr = new Date().toDateString()
    const plannedToday = programs
      .filter((p) => p.weekdays.includes(today) && !!linkOf(p.clientId))
      .map((p) => {
        const l = linkOf(p.clientId)!
        const status: 'done' | 'pending' | 'unknown' = !l.shareWorkouts
          ? 'unknown'
          : sessions.some(
                (s) => s.userId === p.clientId && s.routineName === p.name && new Date(s.date).toDateString() === todayStr,
              )
            ? 'done'
            : 'pending'
        return { program: p, status }
      })

    return { sharingCount: sharing.length, trainedThisWeek, needFollowUp, plannedToday }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, sessions, programs])

  const pendingCheckins = checkins.filter((c) => !c.reviewedAt && !!linkOf(c.clientId))
  const notSharingWorkouts = active.length - stats.sharingCount
  const waterClients = active.filter((l) => l.shareHydration)
  const waterMax = Math.max(2000, ...waterClients.map((l) => water[l.clientId] ?? 0))

  if (!currentUser) return null
  const firstName = currentUser.fullName.split(' ')[0]
  const dateLabel = new Date().toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="flex flex-col gap-5 px-4 pb-28 pt-6 lg:px-8 lg:pb-10">
      <CheckinReview
        checkin={reviewing}
        clientName={reviewing ? nameOf(reviewing.clientId) : ''}
        onClose={() => setReviewing(null)}
        onSaved={() => {
          setReviewing(null)
          reloadCheckins()
        }}
      />

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Program i ri: zgjidh klientin">
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nuk ke ende klientë aktivë. Fto një klient fillimisht.</p>
        ) : (
          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {active.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setPickerOpen(false)
                  openOfficeClient(l.clientId, { newProgram: true })
                }}
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left"
              >
                <UserAvatar
                  name={l.person?.fullName ?? 'Klient'}
                  color={l.person?.avatarColor ?? '#E5352B'}
                  url={l.person?.avatarUrl}
                  size={34}
                />
                <span className="truncate text-sm font-medium">{l.person?.fullName ?? 'Klient'}</span>
              </button>
            ))}
          </div>
        )}
      </Modal>

      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm capitalize text-muted-foreground">{dateLabel}</p>
          <h1 className="text-2xl font-bold tracking-tight">Përshëndetje, {firstName}</h1>
        </div>
      </header>

      {/* Numrat kryesorë */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-3xl font-black">{active.length}</p>
          <p className="text-xs text-muted-foreground">Klientë aktivë</p>
        </Card>
        <Card className="p-4">
          <p className={`text-3xl font-black ${pendingCheckins.length > 0 ? 'text-primary' : ''}`}>
            {pendingCheckins.length}
          </p>
          <p className="text-xs text-muted-foreground">Check-in për shqyrtim</p>
        </Card>
        <Card className="p-4">
          <p className="text-3xl font-black">{pendingInvites}</p>
          <p className="text-xs text-muted-foreground">Ftesa në pritje</p>
        </Card>
        <Card className="p-4">
          <p className="text-3xl font-black">
            {stats.trainedThisWeek}
            <span className="text-base font-medium text-muted-foreground"> / {stats.sharingCount}</span>
          </p>
          <p className="text-xs text-muted-foreground">Stërvitën këtë javë</p>
        </Card>
      </div>

      {/* Veprime të shpejta */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Program i ri', icon: ListPlus, onClick: () => setPickerOpen(true) },
          { label: 'Biblioteka e ushtrimeve', icon: BookOpen, onClick: () => openScreen('library') },
          { label: 'Fto klient', icon: UserPlus, onClick: () => setTab('office') },
        ].map((a) => {
          const Icon = a.icon
          return (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3.5 text-center transition-colors active:bg-secondary"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Icon className="h-5 w-5 text-primary" />
              </span>
              <span className="text-xs font-medium leading-tight text-balance">{a.label}</span>
            </button>
          )
        })}
      </div>

      {!linksLoading && active.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Ende pa klientë"
          description="Fto klientin e parë me ID-në e tij 10-shifrore. Ai pranon dhe vendos çfarë të ndajë me ty."
          action={
            <button
              type="button"
              onClick={() => setTab('office')}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Hap Zyrën
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Kolona e djathtë në desktop vjen e para në telefon: ç'duhet bërë tani */}
          <div className="flex flex-col gap-5 lg:order-2">
            <div>
              <SectionTitle>Check-in për shqyrtim{pendingCheckins.length > 0 ? ` (${pendingCheckins.length})` : ''}</SectionTitle>
              {pendingCheckins.length === 0 ? (
                <Card>
                  <p className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Asgjë në pritje.
                  </p>
                </Card>
              ) : (
                <div className="flex flex-col gap-2">
                  {pendingCheckins.slice(0, 5).map((c) => (
                    <button key={c.id} type="button" onClick={() => setReviewing(c)} className="text-left">
                      <Card className="flex items-center gap-3 border-primary/30 py-3">
                        <UserAvatar
                          name={nameOf(c.clientId)}
                          color={linkOf(c.clientId)?.person?.avatarColor ?? '#E5352B'}
                          url={linkOf(c.clientId)?.person?.avatarUrl}
                          size={36}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{nameOf(c.clientId)}</p>
                          <p className="text-xs text-muted-foreground">
                            {weekLabel(c.weekStart)} · {c.energy}/{c.sleep}/{c.adherence}
                          </p>
                        </div>
                        <ClipboardCheck className="h-4 w-4 shrink-0 text-primary" />
                      </Card>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <SectionTitle>Kërkojnë ndjekje</SectionTitle>
              <Card>
                {dataLoading ? (
                  <p className="py-2 text-center text-sm text-muted-foreground">Po ngarkohet…</p>
                ) : stats.needFollowUp.length === 0 ? (
                  <p className="py-2 text-center text-sm text-muted-foreground text-pretty">
                    {stats.sharingCount === 0
                      ? 'Asnjë klient nuk i ndan stërvitjet, ndaj aktiviteti nuk shihet.'
                      : 'Të gjithë kanë stërvitur këto 7 ditë.'}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {stats.needFollowUp.slice(0, 6).map(({ link, days }) => (
                      <button
                        key={link.id}
                        type="button"
                        onClick={() => openOfficeClient(link.clientId)}
                        className="flex items-center justify-between gap-3 text-left"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <UserAvatar
                            name={link.person?.fullName ?? 'Klient'}
                            color={link.person?.avatarColor ?? '#E5352B'}
                            url={link.person?.avatarUrl}
                            size={30}
                          />
                          <span className="truncate text-sm font-medium">{link.person?.fullName ?? 'Klient'}</span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {days === null ? 'mbi 14 ditë' : `${days} ditë`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {!dataLoading && notSharingWorkouts > 0 && (
                  <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground text-pretty">
                    {notSharingWorkouts} klient{notSharingWorkouts === 1 ? '' : 'ë'} nuk i ndan stërvitjet, ndaj nuk
                    përfshihen këtu.
                  </p>
                )}
              </Card>
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:order-1 lg:col-span-2">
            <div>
              <SectionTitle>Stërvitjet e planifikuara sot</SectionTitle>
              <Card>
                {dataLoading ? (
                  <p className="py-2 text-center text-sm text-muted-foreground">Po ngarkohet…</p>
                ) : stats.plannedToday.length === 0 ? (
                  <p className="py-2 text-center text-sm text-muted-foreground text-pretty">
                    Asnjë klient nuk ka program të planifikuar për sot.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {stats.plannedToday.map(({ program, status }, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => openOfficeClient(program.clientId)}
                        className="flex items-center justify-between gap-3 text-left"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{nameOf(program.clientId)}</span>
                          <span className="block truncate text-xs text-muted-foreground">{program.name}</span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            status === 'done'
                              ? 'bg-success/15 text-success'
                              : status === 'pending'
                                ? 'bg-primary/15 text-primary'
                                : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {status === 'done' ? 'Kryer ✓' : status === 'pending' ? 'Pa filluar' : 'Pa të dhëna'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div>
              <SectionTitle>Uji i klientëve sot</SectionTitle>
              <Card>
                {dataLoading ? (
                  <p className="py-2 text-center text-sm text-muted-foreground">Po ngarkohet…</p>
                ) : waterClients.length === 0 ? (
                  <p className="flex items-center justify-center gap-2 py-3 text-center text-sm text-muted-foreground">
                    <Droplets className="h-4 w-4" />
                    Asnjë klient nuk e ndan ujin me ty.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {waterClients.map((l) => {
                      const ml = water[l.clientId] ?? 0
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => openOfficeClient(l.clientId)}
                          className="flex flex-col gap-1.5 text-left"
                        >
                          <span className="flex items-center justify-between gap-3 text-sm">
                            <span className="truncate font-medium">{l.person?.fullName ?? 'Klient'}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {ml > 0 ? `${ml} ml` : 'Ende pa shënuar'}
                            </span>
                          </span>
                          <span className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                            <span
                              className="block h-full rounded-full bg-primary/70"
                              style={{ width: `${Math.min(100, (ml / waterMax) * 100)}%` }}
                            />
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </Card>
            </div>

            <div>
              <SectionTitle>Aktiviteti i fundit</SectionTitle>
              <Card className="p-0">
                {dataLoading ? (
                  <p className="p-5 text-center text-sm text-muted-foreground">Po ngarkohet…</p>
                ) : sessions.length === 0 ? (
                  <p className="p-5 text-center text-sm text-muted-foreground text-pretty">
                    Nuk ka stërvitje të reja nga klientët që i ndajnë (14 ditët e fundit).
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {sessions.slice(0, 8).map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => openOfficeClient(s.userId)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <Dumbbell className="h-4 w-4 shrink-0 text-primary" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">
                              {nameOf(s.userId)} · {s.routineName}
                            </span>
                            <span className="block text-xs text-muted-foreground">{shortDate(s.date)}</span>
                          </span>
                        </span>
                        <span className="shrink-0 text-xs font-semibold text-primary">{formatVolume(s.volume, unit)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div>
              <SectionTitle>Fotot e fundit të progresit</SectionTitle>
              <Card>
                {dataLoading ? (
                  <p className="py-2 text-center text-sm text-muted-foreground">Po ngarkohet…</p>
                ) : photos.length === 0 ? (
                  <p className="flex items-center justify-center gap-2 py-3 text-center text-sm text-muted-foreground">
                    <Camera className="h-4 w-4" />
                    Asnjë foto e ndarë nga klientët.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">
                    {photos.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => openOfficeClient(p.userId)}
                        className="relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary"
                        aria-label={`Foto e ${nameOf(p.userId)}`}
                      >
                        {p.thumbUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.thumbUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                        )}
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-1.5 pb-1 pt-5 text-left text-[10px] font-medium leading-tight text-white">
                          {nameOf(p.userId).split(' ')[0]} · {shortDate(p.takenAt)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
