'use client'

import { useEffect, useState } from 'react'
import {
  Briefcase,
  Camera,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Lock,
  Scale,
  UserPlus,
} from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { DatedLineChart } from '@/components/shared/dated-line-chart'
import { Card, EmptyState, Field, Modal, SectionTitle, inputClass } from '@/components/shared/ui'
import { UserAvatar } from '@/components/shared/user-avatar'
import { supabase } from '@/lib/supabase/client'
import { mapMetric, mapSession } from '@/lib/supabase/mappers'
import { fetchClientPhotos, type ProgressPhoto } from '@/lib/supabase/photos'
import { DAYS_SHORT, PROGRAM_MESSAGES, useClientPrograms, type CoachProgram } from '@/lib/supabase/programs'
import { RoutineBuilder } from '@/components/workout/routine-builder'
import { INVITE_MESSAGES, useCoachLinks, type CoachLinkWithPerson } from '@/lib/supabase/coach'
import { formatDayShort, formatDuration, formatVolume, kgToUnit } from '@/lib/format'
import { startOfWeek } from '@/lib/storage'
import type { BodyMetric, RoutineExercise, WorkoutSession } from '@/lib/types'

const GENERIC_ERROR = 'Diçka shkoi keq. Provo përsëri.'
const pad = (n: number) => String(n).padStart(2, '0')

function fmtFull(iso: string) {
  const d = new Date(iso)
  return `${d.toLocaleDateString('sq-AL', { day: 'numeric', month: 'long', year: 'numeric' })}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' })
}

interface Summary {
  weightKg: number | null
  weekSessions: number | null
  lastSession: string | null
}

// Përmbledhja e shpejtë për listën: vetëm për ato që klienti ka lejuar (RLS e garanton edhe në server).
function useClientSummaries(active: CoachLinkWithPerson[]) {
  const [map, setMap] = useState<Record<string, Summary>>({})
  const key = active.map((l) => `${l.clientId}:${l.shareWeight ? 1 : 0}${l.shareWorkouts ? 1 : 0}`).join(',')

  useEffect(() => {
    if (active.length === 0) {
      setMap({})
      return
    }
    let cancelled = false
    ;(async () => {
      const wIds = active.filter((l) => l.shareWeight).map((l) => l.clientId)
      const sIds = active.filter((l) => l.shareWorkouts).map((l) => l.clientId)
      const since = new Date()
      since.setDate(since.getDate() - 30)

      const w = wIds.length
        ? await supabase
            .from('body_metrics')
            .select('user_id, weight, date')
            .in('user_id', wIds)
            .order('date', { ascending: true })
        : null
      const s = sIds.length
        ? await supabase
            .from('workout_sessions')
            .select('user_id, date')
            .in('user_id', sIds)
            .gte('date', since.toISOString())
            .order('date', { ascending: true })
        : null

      const next: Record<string, Summary> = {}
      for (const l of active) {
        next[l.clientId] = { weightKg: null, weekSessions: l.shareWorkouts ? 0 : null, lastSession: null }
      }
      w?.data?.forEach((r: any) => {
        if (next[r.user_id]) next[r.user_id].weightKg = Number(r.weight)
      })
      const weekStart = startOfWeek()
      s?.data?.forEach((r: any) => {
        const item = next[r.user_id]
        if (!item) return
        item.lastSession = r.date
        if (new Date(r.date) >= weekStart) item.weekSessions = (item.weekSessions ?? 0) + 1
      })
      if (!cancelled) setMap(next)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return map
}

export function CoachOffice({ onBack }: { onBack?: () => void }) {
  const { currentUser, showToast } = useApp()
  const unit = currentUser?.unit ?? 'kg'
  const { links, loading, error, reload } = useCoachLinks(currentUser?.id, 'coach')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const active = links.filter((l) => l.status === 'active')
  const pending = links.filter((l) => l.status === 'pending')
  const summaries = useClientSummaries(active)
  const selected = active.find((l) => l.id === selectedId) ?? null

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 10) {
      showToast('ID duhet të përmbajë 10 shifra.', 'error')
      return
    }
    setSending(true)
    const { data, error: rpcError } = await supabase.rpc('send_coach_invite', { p_personal_id: code })
    setSending(false)
    if (rpcError) {
      showToast(GENERIC_ERROR, 'error')
      return
    }
    const msg = INVITE_MESSAGES[data as string] ?? { text: GENERIC_ERROR, tone: 'error' as const }
    showToast(msg.text, msg.tone)
    if (data === 'sent') {
      setCode('')
      reload()
    }
  }

  async function cancelInvite(id: string) {
    setBusyId(id)
    const { error: delError } = await supabase.from('coach_clients').delete().eq('id', id)
    setBusyId(null)
    if (delError) showToast(GENERIC_ERROR, 'error')
    else showToast('Ftesa u anulua.', 'info')
    reload()
  }

  if (currentUser?.role !== 'trainer') {
    return (
      <div className="min-h-dvh px-4 pt-6">
        <EmptyState
          icon={Briefcase}
          title="Zyra është për trajnerët"
          description="Kjo pjesë hapet vetëm për llogaritë e regjistruara si trajner."
          action={
            onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Kthehu
              </button>
            ) : undefined
          }
        />
      </div>
    )
  }

  if (selected) {
    return (
      <ClientDetail
        link={selected}
        onBack={() => setSelectedId(null)}
        onRemoved={() => {
          setSelectedId(null)
          reload()
        }}
      />
    )
  }

  return (
    <div className="min-h-dvh pb-28">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
            aria-label="Kthehu"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold leading-tight">Zyra</h1>
          <p className="truncate text-xs text-muted-foreground">Klientët dhe progresi i tyre</p>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" />
        </div>
      ) : error ? (
        <div className="px-4 pt-6">
          <EmptyState
            icon={Briefcase}
            title="Nuk u ngarkua"
            description="Kontrollo lidhjen dhe provo përsëri."
            action={
              <button
                type="button"
                onClick={reload}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Provo përsëri
              </button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-4 pt-4">
          {!currentUser.coachVerified && (
            <Card className="border-primary/30 bg-primary/5">
              <p className="text-sm font-semibold">Profili yt nuk është verifikuar ende</p>
              <p className="mt-1 text-xs text-muted-foreground text-pretty">
                Mund ta përdorësh Zyrën, por klientët shohin se nuk ke shenjën “I verifikuar” kur marrin ftesën.
              </p>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3.5 text-center">
              <p className="text-2xl font-black">{active.length}</p>
              <p className="text-xs text-muted-foreground">Klientë aktivë</p>
            </Card>
            <Card className="p-3.5 text-center">
              <p className="text-2xl font-black">{pending.length}</p>
              <p className="text-xs text-muted-foreground">Ftesa në pritje</p>
            </Card>
          </div>

          {/* Fto klient */}
          <Card>
            <form onSubmit={sendInvite} className="flex flex-col gap-3">
              <Field label="Fto një klient me ID-në e tij 10-shifrore">
                <input
                  className={`${inputClass} font-mono tracking-widest`}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={10}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="0000000000"
                />
              </Field>
              <button
                type="submit"
                disabled={sending || code.length === 0}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" />
                {sending ? 'Ju lutem prisni…' : 'Dërgo ftesën'}
              </button>
            </form>
          </Card>

          {/* Klientët aktivë */}
          <div>
            <SectionTitle>Klientët e mi{active.length > 0 ? ` (${active.length})` : ''}</SectionTitle>
            {active.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {active.map((l) => {
                  const sum = summaries[l.clientId]
                  return (
                    <button key={l.id} type="button" onClick={() => setSelectedId(l.id)} className="text-left">
                      <Card className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={l.person?.fullName ?? 'Klient'} color={l.person?.avatarColor ?? '#E5352B'} url={l.person?.avatarUrl} size={44} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{l.person?.fullName ?? 'Klient'}</p>
                            <p className="truncate text-xs text-muted-foreground">{l.person?.level ?? ''}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <ShareChip icon={Scale} label="Pesha" on={l.shareWeight} />
                          <ShareChip icon={Dumbbell} label="Stërvitjet" on={l.shareWorkouts} />
                          <ShareChip icon={Camera} label="Fotot" on={l.sharePhotos} />
                        </div>
                        {(l.shareWeight || l.shareWorkouts) && sum && (
                          <p className="text-xs text-muted-foreground">
                            {l.shareWeight && sum.weightKg !== null && (
                              <span className="font-semibold text-foreground">
                                {kgToUnit(sum.weightKg, unit).toFixed(1)} {unit}
                              </span>
                            )}
                            {l.shareWeight && sum.weightKg !== null && l.shareWorkouts ? ' · ' : ''}
                            {l.shareWorkouts &&
                              `${sum.weekSessions ?? 0} stërvitje këtë javë${
                                sum.lastSession ? ` · e fundit ${fmtShort(sum.lastSession)}` : ''
                              }`}
                          </p>
                        )}
                      </Card>
                    </button>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={Briefcase}
                title="Ende pa klientë"
                description="Dërgo ftesën e parë me ID-në e klientit. Ai e pranon dhe vendos çfarë të ndajë me ty."
              />
            )}
          </div>

          {/* Ftesat e dërguara */}
          {pending.length > 0 && (
            <div>
              <SectionTitle>Ftesa në pritje</SectionTitle>
              <div className="flex flex-col gap-2">
                {pending.map((l) => (
                  <Card key={l.id} className="flex items-center gap-3 py-3">
                    <UserAvatar name={l.person?.fullName ?? 'Klient'} color={l.person?.avatarColor ?? '#E5352B'} url={l.person?.avatarUrl} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{l.person?.fullName ?? 'Klient'}</p>
                      <p className="truncate text-xs text-muted-foreground">Pret përgjigje</p>
                    </div>
                    <button
                      type="button"
                      disabled={busyId === l.id}
                      onClick={() => cancelInvite(l.id)}
                      className="shrink-0 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                    >
                      Anulo
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ShareChip({ icon: Icon, label, on }: { icon: typeof Scale; label: string; on: boolean }) {
  return (
    <span
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
        on ? 'bg-success/15 text-success' : 'bg-secondary text-muted-foreground'
      }`}
    >
      {on ? <Icon className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
      {label}
    </span>
  )
}

function ClientDetail({
  link,
  onBack,
  onRemoved,
}: {
  link: CoachLinkWithPerson
  onBack: () => void
  onRemoved: () => void
}) {
  const { currentUser, showToast } = useApp()
  const unit = currentUser?.unit ?? 'kg'
  const person = link.person

  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<BodyMetric[]>([])
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [viewing, setViewing] = useState<ProgressPhoto | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [m, s, p] = await Promise.all([
        link.shareWeight
          ? supabase.from('body_metrics').select('*').eq('user_id', link.clientId).order('date', { ascending: true })
          : null,
        link.shareWorkouts
          ? supabase
              .from('workout_sessions')
              .select('*')
              .eq('user_id', link.clientId)
              .order('date', { ascending: false })
              .limit(15)
          : null,
        link.sharePhotos ? fetchClientPhotos(link.clientId) : null,
      ])
      if (cancelled) return
      setMetrics((m?.data ?? []).map(mapMetric))
      setSessions((s?.data ?? []).map(mapSession))
      setPhotos(p ?? [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [link.clientId, link.shareWeight, link.shareWorkouts, link.sharePhotos])

  async function remove() {
    setRemoving(true)
    const { error } = await supabase.from('coach_clients').delete().eq('id', link.id)
    setRemoving(false)
    if (error) {
      showToast(GENERIC_ERROR, 'error')
      return
    }
    showToast('Klienti u hoq.', 'info')
    onRemoved()
  }

  const latest = metrics.length ? metrics[metrics.length - 1] : null
  const previous = metrics.length > 1 ? metrics[metrics.length - 2] : null
  const delta = latest && previous ? latest.weight - previous.weight : null

  return (
    <div className="min-h-dvh pb-28">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
          aria-label="Kthehu"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <UserAvatar name={person?.fullName ?? 'Klient'} color={person?.avatarColor ?? '#E5352B'} url={person?.avatarUrl} size={36} />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold leading-tight">{person?.fullName ?? 'Klient'}</h1>
          <p className="truncate text-xs text-muted-foreground">{person?.level ?? ''}</p>
        </div>
      </header>

      <div className="flex flex-col gap-5 px-4 pt-4">
        <div className="flex flex-wrap gap-1.5">
          <ShareChip icon={Scale} label="Pesha" on={link.shareWeight} />
          <ShareChip icon={Dumbbell} label="Stërvitjet" on={link.shareWorkouts} />
          <ShareChip icon={Camera} label="Fotot" on={link.sharePhotos} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" />
          </div>
        ) : (
          <>
            {/* Programet */}
            <ProgramsSection coachId={currentUser?.id} clientId={link.clientId} clientName={person?.fullName ?? 'klientin'} />

            {/* Pesha */}
            <Card>
              <SectionTitle>Pesha</SectionTitle>
              {!link.shareWeight ? (
                <LockedNote text="Klienti nuk e ndan peshën me ty." />
              ) : latest ? (
                <>
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black">
                      {kgToUnit(latest.weight, unit).toFixed(1)} {unit}
                    </span>
                    {delta !== null && (
                      <span className={`text-sm font-medium ${delta >= 0 ? 'text-success' : 'text-primary'}`}>
                        {delta >= 0 ? '+' : ''}
                        {kgToUnit(delta, unit).toFixed(1)} {unit}
                      </span>
                    )}
                  </div>
                  <DatedLineChart
                    data={metrics.map((m) => ({ date: +new Date(m.date), value: kgToUnit(m.weight, unit) }))}
                    unit={unit}
                  />
                </>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">Klienti nuk ka regjistruar peshë ende.</p>
              )}
            </Card>

            {/* Stërvitjet */}
            <div>
              <SectionTitle>Stërvitjet e fundit</SectionTitle>
              {!link.shareWorkouts ? (
                <Card>
                  <LockedNote text="Klienti nuk i ndan stërvitjet me ty." />
                </Card>
              ) : sessions.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {sessions.map((s) => {
                    const sets = s.exercises.reduce((n, e) => n + e.sets.length, 0)
                    return (
                      <Card key={s.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{s.routineName}</p>
                          <p className="text-xs text-muted-foreground">{formatDayShort(s.date)}</p>
                        </div>
                        <p className="shrink-0 text-right text-xs text-muted-foreground">
                          {sets} seri · {formatDuration(s.durationSec)}
                          <br />
                          {formatVolume(s.totalVolume, unit)}
                        </p>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card>
                  <p className="py-2 text-center text-sm text-muted-foreground">Ende pa stërvitje të regjistruara.</p>
                </Card>
              )}
            </div>

            {/* Fotot */}
            <Card>
              <SectionTitle>Fotot e progresit</SectionTitle>
              {!link.sharePhotos ? (
                <LockedNote text="Klienti nuk i ndan fotot me ty." />
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setViewing(p)}
                      className="relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary"
                      aria-label={`Hap foton e ${fmtShort(p.takenAt)}`}
                    >
                      {p.thumbUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumbUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                      )}
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1 pt-5 text-left text-[10px] font-medium text-white">
                        {fmtShort(p.takenAt)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">Klienti nuk ka ngarkuar foto ende.</p>
              )}
            </Card>

            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="rounded-xl py-2 text-sm font-semibold text-primary"
            >
              Hiq klientin
            </button>
          </>
        )}
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing ? fmtShort(viewing.takenAt) : undefined}>
        {viewing && (
          <div className="flex flex-col gap-3">
            {viewing.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={viewing.url} alt="" className="mx-auto max-h-[60vh] rounded-xl object-contain" />
            )}
            <p className="text-center text-sm font-medium">{fmtFull(viewing.takenAt)}</p>
          </div>
        )}
      </Modal>

      <Modal open={confirmRemove} onClose={() => setConfirmRemove(false)} title="Ta heqësh klientin?">
        <p className="text-sm text-muted-foreground">
          {person?.fullName ?? 'Klienti'} do të hiqet nga lista jote dhe nuk do t’i shohësh më të dhënat e tij. Mund ta
          ftosh përsëri më vonë.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setConfirmRemove(false)}
            className="rounded-xl border border-border py-3 font-semibold"
          >
            Anulo
          </button>
          <button
            type="button"
            disabled={removing}
            onClick={remove}
            className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {removing ? 'Po hiqet…' : 'Hiqe'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function LockedNote({ text }: { text: string }) {
  return (
    <p className="flex items-center justify-center gap-2 py-4 text-center text-sm text-muted-foreground">
      <Lock className="h-4 w-4" />
      {text}
    </p>
  )
}

function ProgramsSection({
  coachId,
  clientId,
  clientName,
}: {
  coachId: string | undefined
  clientId: string
  clientName: string
}) {
  const { showToast } = useApp()
  const { programs, loading, reload } = useClientPrograms(coachId, clientId)
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editing, setEditing] = useState<CoachProgram | null>(null)
  const [archiving, setArchiving] = useState<CoachProgram | null>(null)
  const [archivingBusy, setArchivingBusy] = useState(false)

  const active = programs.filter((p) => p.status === 'active')
  const archived = programs.filter((p) => p.status === 'archived')

  async function save(
    name: string,
    description: string,
    exercises: RoutineExercise[],
    days: number[],
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('assign_program', {
      p_client_id: clientId,
      p_name: name,
      p_description: description,
      p_exercises: exercises,
      p_replace_id: editing?.id ?? null,
      p_weekdays: days,
    })
    if (error) {
      showToast(GENERIC_ERROR, 'error')
      return false
    }
    const res = data as { code: string }
    if (res.code === 'assigned') {
      showToast(editing ? 'Programi u përditësua (version i ri).' : 'Programi u caktua.', 'success')
      setEditing(null)
      reload()
      return true
    }
    showToast(PROGRAM_MESSAGES[res.code] ?? GENERIC_ERROR, 'error')
    return false
  }

  async function archive(p: CoachProgram) {
    setArchivingBusy(true)
    const { data, error } = await supabase.rpc('archive_program', { p_id: p.id })
    setArchivingBusy(false)
    setArchiving(null)
    if (error || data !== 'ok') showToast(GENERIC_ERROR, 'error')
    else showToast('Programi u arkivua.', 'info')
    reload()
  }

  return (
    <Card>
      <SectionTitle
        action={
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setBuilderOpen(true)
            }}
            className="text-sm font-medium text-primary"
          >
            Program i ri
          </button>
        }
      >
        Programet
      </SectionTitle>

      {loading ? (
        <p className="py-4 text-center text-sm text-muted-foreground">Po ngarkohet…</p>
      ) : active.length === 0 ? (
        <p className="py-3 text-center text-sm text-muted-foreground text-pretty">
          Ende pa program. Krijo një dhe {clientName} e sheh te skeda Stërvitja.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {active.map((p) => (
            <div key={p.id} className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    v{p.version} · {p.exercises.length} ushtrime · {fmtShort(p.createdAt)}
                    {p.weekdays.length > 0 ? ` · ${p.weekdays.map((d) => DAYS_SHORT[d]).join(', ')}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(p)
                    setBuilderOpen(true)
                  }}
                  className="flex-1 rounded-lg bg-secondary py-2 text-xs font-semibold"
                >
                  Ndrysho
                </button>
                <button
                  type="button"
                  onClick={() => setArchiving(p)}
                  className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold text-primary"
                >
                  Arkivo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {archived.length} version{archived.length === 1 ? '' : 'e'} të arkivuar (historiku i stërvitjeve të klientit
          nuk preket).
        </p>
      )}

      <RoutineBuilder
        open={builderOpen}
        onClose={() => {
          setBuilderOpen(false)
          setEditing(null)
        }}
        title={editing ? `Ndrysho: ${editing.name}` : `Program për ${clientName}`}
        saveLabel={editing ? 'Ruaj versionin e ri' : 'Cakto programin'}
        initial={
          editing
            ? {
                name: editing.name,
                description: editing.description,
                exercises: editing.exercises,
                days: editing.weekdays,
              }
            : undefined
        }
        withDays
        onSave={save}
      />

      <Modal open={!!archiving} onClose={() => setArchiving(null)} title="Ta arkivosh programin?">
        <p className="text-sm text-muted-foreground">
          “{archiving?.name}” nuk do të shfaqet më te klienti. Stërvitjet e kryera më parë mbeten në historikun e tij.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setArchiving(null)}
            className="rounded-xl border border-border py-3 font-semibold"
          >
            Anulo
          </button>
          <button
            type="button"
            disabled={archivingBusy}
            onClick={() => archiving && archive(archiving)}
            className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {archivingBusy ? 'Po arkivohet…' : 'Arkivoje'}
          </button>
        </div>
      </Modal>
    </Card>
  )
}
