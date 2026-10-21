'use client'

import { useState } from 'react'
import { ChevronLeft, Trophy, Users } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { useNav } from '@/components/nav'
import { Avatar, Card, EmptyState, Modal, SectionTitle } from '@/components/shared/ui'
import { supabase } from '@/lib/supabase/client'
import { formatVolume } from '@/lib/format'
import {
  MODE_HINTS,
  MODE_LABELS,
  STATUS_LABELS,
  scoreOf,
  useChallenge,
  type ChallengeMode,
  type ChallengeParticipant,
  type ParticipantStatus,
} from '@/lib/supabase/challenges'

const GENERIC_ERROR = 'Diçka shkoi keq. Provo përsëri.'

const PARTICIPANT_LABELS: Record<ParticipantStatus, string> = {
  invited: 'Në pritje',
  joined: 'Në sfidë',
  declined: 'Refuzoi',
  left: 'Doli',
}

function formatScore(value: number, mode: ChallengeMode, unit: 'kg' | 'lb') {
  return mode === 'volume' ? formatVolume(value, unit) : String(Math.round(value))
}

export function ChallengeRoom({ challengeId, onBack }: { challengeId: string; onBack: () => void }) {
  const { currentUser, users, showToast } = useApp()
  const { triggerWorkout } = useNav()
  const { challenge, participants, loading, error, reload } = useChallenge(challengeId)
  const [busy, setBusy] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)

  const myId = currentUser?.id
  const unit = currentUser?.unit ?? 'kg'

  async function run(fn: string, args: Record<string, unknown>): Promise<string | null> {
    setBusy(true)
    const { data, error: rpcError } = await supabase.rpc(fn, args)
    setBusy(false)
    if (rpcError) {
      showToast(GENERIC_ERROR, 'error')
      return null
    }
    await reload()
    return data as string
  }

  async function respond(accept: boolean) {
    const r = await run('respond_challenge', { p_challenge_id: challengeId, p_accept: accept })
    if (r === 'joined') showToast('Je në sfidë!', 'success')
    else if (r === 'declined') {
      showToast('Ftesa u refuzua.', 'info')
      onBack()
    } else if (r === 'not_found') showToast('Ftesa nuk është më aktive.', 'error')
  }

  async function start() {
    const r = await run('start_challenge', { p_challenge_id: challengeId })
    if (r === 'started') showToast('Sfida filloi! Fillo stërvitjen.', 'success')
    else if (r === 'not_enough') showToast('Duhen të paktën 2 pjesëmarrës në sfidë.', 'error')
    else if (r) showToast('Sfida nuk mund të fillojë.', 'error')
  }

  async function leave() {
    const r = await run('leave_challenge', { p_challenge_id: challengeId })
    if (r === 'cancelled') showToast('Sfida u anulua.', 'info')
    else if (r === 'left') {
      showToast('Dole nga sfida.', 'info')
      onBack()
    } else if (r) showToast('Veprimi nuk u krye.', 'error')
  }

  async function finish() {
    setConfirmFinish(false)
    const r = await run('finish_challenge', { p_challenge_id: challengeId })
    if (r === 'finished') showToast('Sfida u mbyll.', 'success')
    else if (r) showToast('Sfida nuk mund të mbyllet.', 'error')
  }

  const header = (title: string, subtitle?: string) => (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
      <button
        type="button"
        onClick={onBack}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
        aria-label="Kthehu"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </header>
  )

  if (loading) {
    return (
      <div className="min-h-dvh pb-28">
        {header('Sfida live')}
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" />
        </div>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="min-h-dvh pb-28">
        {header('Sfida live')}
        <div className="px-4 pt-6">
          <EmptyState
            icon={Users}
            title={error ? 'Nuk u ngarkua' : 'Sfida nuk u gjet'}
            description={
              error
                ? 'Kontrollo lidhjen dhe provo përsëri.'
                : 'Ndoshta u anulua ose nuk je pjesëmarrës në këtë sfidë.'
            }
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
      </div>
    )
  }

  const mode = challenge.mode
  const isHost = challenge.hostId === myId
  const me = participants.find((p) => p.userId === myId)
  const joinedCount = participants.filter((p) => p.status === 'joined').length
  const nameOf = (id: string) => users.find((u) => u.id === id)

  const shown =
    challenge.status === 'lobby'
      ? [...participants].sort((a, b) => Number(b.userId === challenge.hostId) - Number(a.userId === challenge.hostId))
      : participants
          .filter((p) => p.status !== 'declined')
          .sort((a, b) => scoreOf(b, mode) - scoreOf(a, mode))

  const showScores = challenge.status === 'live' || challenge.status === 'finished'
  const winner = challenge.winnerId ? nameOf(challenge.winnerId) : null
  const hostName = nameOf(challenge.hostId)?.fullName ?? 'një shok'

  return (
    <div className="min-h-dvh pb-28">
      {header(isHost ? 'Sfida jote' : `Sfida e ${hostName}`, MODE_LABELS[mode])}

      <div className="flex flex-col gap-5 px-4 pt-4">
        {/* Gjendja */}
        <Card className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              {challenge.status === 'live' && (
                <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary align-middle" />
              )}
              {STATUS_LABELS[challenge.status]}
            </span>
            <span className="text-xs text-muted-foreground">{MODE_LABELS[mode]}</span>
          </div>
          <p className="text-sm text-muted-foreground text-pretty">{MODE_HINTS[mode]}</p>
        </Card>

        {challenge.status === 'finished' && (
          <Card className="flex items-center gap-3 border-success/30 bg-gradient-to-br from-success/10 to-card">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/20">
              <Trophy className="h-6 w-6 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-success">Rezultati final</p>
              <p className="truncate font-semibold">
                {winner ? `🏆 ${winner.fullName} fitoi!` : 'Baraspeshë, pa fitues.'}
              </p>
            </div>
          </Card>
        )}

        {challenge.status === 'cancelled' && (
          <p className="rounded-2xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
            Kjo sfidë u anulua.
          </p>
        )}

        {/* Pjesëmarrësit */}
        <div>
          <SectionTitle>{showScores ? 'Renditja' : 'Pjesëmarrësit'}</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {shown.map((p, i) => (
              <ParticipantRow
                key={p.userId}
                p={p}
                rank={showScores ? i + 1 : null}
                mode={mode}
                unit={unit}
                isMe={p.userId === myId}
                isHost={p.userId === challenge.hostId}
                showScore={showScores}
                name={nameOf(p.userId)?.fullName ?? 'Përdorues'}
                color={nameOf(p.userId)?.avatarColor ?? '#E5352B'}
              />
            ))}
          </div>
        </div>

        {/* Veprimet */}
        {(challenge.status === 'lobby' || challenge.status === 'live') && (
          <div className="flex flex-col gap-3">
            {me?.status === 'invited' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => respond(true)}
                  className="rounded-xl bg-success py-3 font-semibold text-success-foreground disabled:opacity-60"
                >
                  Prano
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => respond(false)}
                  className="rounded-xl border border-border py-3 font-semibold disabled:opacity-60"
                >
                  Refuzo
                </button>
              </div>
            )}

            {challenge.status === 'lobby' && isHost && (
              <>
                <button
                  type="button"
                  disabled={busy || joinedCount < 2}
                  onClick={start}
                  className="rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-50"
                >
                  Fillo sfidën
                </button>
                {joinedCount < 2 && (
                  <p className="text-center text-xs text-muted-foreground">
                    Pret që të paktën një shok ta pranojë ftesën.
                  </p>
                )}
              </>
            )}

            {challenge.status === 'live' && me?.status === 'joined' && (
              <>
                <button
                  type="button"
                  onClick={triggerWorkout}
                  className="rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground"
                >
                  🔥 Fillo stërvitjen
                </button>
                <p className="text-center text-xs text-muted-foreground text-pretty">
                  Zgjidh një rutinë dhe regjistro seritë. Rezultati yt përditësohet vetë për të gjithë.
                </p>
              </>
            )}

            {challenge.status === 'live' && isHost && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmFinish(true)}
                className="rounded-xl bg-success py-3 font-semibold text-success-foreground disabled:opacity-60"
              >
                Mbyll sfidën
              </button>
            )}

            {me?.status === 'joined' && (
              <button
                type="button"
                disabled={busy}
                onClick={leave}
                className="rounded-xl border border-border py-3 text-sm font-semibold text-muted-foreground disabled:opacity-60"
              >
                {isHost ? 'Anulo sfidën' : 'Dil nga sfida'}
              </button>
            )}
          </div>
        )}
      </div>

      <Modal open={confirmFinish} onClose={() => setConfirmFinish(false)} title="Ta mbyllim sfidën?">
        <p className="text-sm text-muted-foreground">
          Fituesi llogaritet me rezultatet e tanishme dhe sfida nuk pranon më seri të reja.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setConfirmFinish(false)}
            className="rounded-xl border border-border py-3 font-semibold"
          >
            Vazhdo
          </button>
          <button
            type="button"
            onClick={finish}
            className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
          >
            Mbylle
          </button>
        </div>
      </Modal>
    </div>
  )
}

function ParticipantRow({
  p,
  rank,
  mode,
  unit,
  isMe,
  isHost,
  showScore,
  name,
  color,
}: {
  p: ChallengeParticipant
  rank: number | null
  mode: ChallengeMode
  unit: 'kg' | 'lb'
  isMe: boolean
  isHost: boolean
  showScore: boolean
  name: string
  color: string
}) {
  return (
    <Card className={`flex items-center gap-3 py-3 ${isMe ? 'border-primary/40' : ''}`}>
      {rank !== null && <span className="w-5 text-center text-sm font-bold text-muted-foreground">{rank}</span>}
      <Avatar name={name} color={color} size={42} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {name}
          {isMe ? ' (Ti)' : ''}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {isHost ? 'Hosti · ' : ''}
          {PARTICIPANT_LABELS[p.status]}
        </p>
      </div>
      {showScore && (
        <span className="shrink-0 text-lg font-black tabular-nums text-primary">
          {formatScore(scoreOf(p, mode), mode, unit)}
        </span>
      )}
    </Card>
  )
}

// Shiriti i vogël me renditjen live brenda ekranit të stërvitjes.
export function LiveChallengeBar({
  participants,
  mode,
  myId,
  unit,
}: {
  participants: ChallengeParticipant[]
  mode: ChallengeMode
  myId: string | undefined
  unit: 'kg' | 'lb'
}) {
  const { users } = useApp()
  const rows = participants
    .filter((p) => p.status === 'joined')
    .map((p) => ({ p, score: scoreOf(p, mode), user: users.find((u) => u.id === p.userId) }))
    .sort((a, b) => b.score - a.score)

  if (rows.length === 0) return null

  return (
    <div className="mx-4 mt-3 rounded-2xl border border-primary/30 bg-primary/5 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        Sfida live · {MODE_LABELS[mode]}
      </p>
      <div className="flex flex-col gap-1">
        {rows.map((r, i) => (
          <div key={r.p.userId} className="flex items-center justify-between text-sm">
            <span className={`truncate ${r.p.userId === myId ? 'font-semibold' : 'text-muted-foreground'}`}>
              {i + 1}. {r.user?.fullName.split(' ')[0] ?? 'Përdorues'}
              {r.p.userId === myId ? ' (Ti)' : ''}
            </span>
            <span className="font-bold tabular-nums">{formatScore(r.score, mode, unit)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
