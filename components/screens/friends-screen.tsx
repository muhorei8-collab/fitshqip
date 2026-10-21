'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Trophy, UserMinus, UserPlus, Users, X } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { ScreenHeader } from '@/components/screens/screen-header'
import { ChallengeRoom } from '@/components/screens/challenge-room'
import { Avatar, Card, Chip, EmptyState, Field, Modal, SectionTitle, inputClass } from '@/components/shared/ui'
import { PersonalIdCard } from '@/components/shared/personal-id-card'
import { supabase } from '@/lib/supabase/client'
import {
  MODE_HINTS,
  MODE_LABELS,
  STATUS_LABELS,
  isChallengeOpen,
  isChallengeVisible,
  useMyChallenges,
  type ChallengeMode,
} from '@/lib/supabase/challenges'

interface Person {
  personal_id: string
  full_name: string
  avatar_color: string
  level: string
}
interface FriendRow extends Person {
  friendship_id: string
}
interface RequestRow extends Person {
  request_id: string
  direction: 'incoming' | 'outgoing'
}

type Tone = 'success' | 'info' | 'error'

const GENERIC_ERROR = 'Diçka shkoi keq. Provo përsëri.'

// Kodet që kthen send_friend_request → mesazhet në shqip.
const SEND_MESSAGES: Record<string, { text: string; tone: Tone }> = {
  sent: { text: 'Kërkesa për miqësi u dërgua.', tone: 'success' },
  accepted: { text: 'Tani jeni miq në FitShqip.', tone: 'success' },
  invalid_id: { text: 'ID duhet të përmbajë 10 shifra.', tone: 'error' },
  self: { text: 'Nuk mund ta shtosh veten si shok.', tone: 'error' },
  not_found: { text: 'Nuk u gjet asnjë përdorues me këtë ID.', tone: 'error' },
  already_friends: { text: 'Jeni tashmë miq.', tone: 'info' },
  already_sent: { text: 'Kërkesa për miqësi është dërguar tashmë.', tone: 'info' },
  unauthorized: { text: 'Duhet të hysh në llogari.', tone: 'error' },
}

// Kodet që kthen create_challenge → mesazhet në shqip.
const CREATE_MESSAGES: Record<string, string> = {
  invalid_mode: 'Zgjidh si do të vendoset fituesi.',
  invalid_friends: 'Zgjidh 1 ose 2 shokë për sfidën.',
  already_active: 'Ke tashmë një sfidë aktive. Mbylle ose anuloje fillimisht.',
  not_found: 'Një nga shokët nuk u gjet.',
  not_friend: 'Mund të sfidosh vetëm miqtë e tu.',
  unauthorized: 'Duhet të hysh në llogari.',
}

const MODES: ChallengeMode[] = ['volume', 'reps', 'sets']

export function FriendsScreen() {
  const { currentUser, users, showToast } = useApp()
  const userId = currentUser?.id

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [friends, setFriends] = useState<FriendRow[]>([])
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [removing, setRemoving] = useState<FriendRow | null>(null)

  // Sfidat live
  const { rows: challengeRows, reload: reloadChallenges } = useMyChallenges(userId)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [picked, setPicked] = useState<string[]>([]) // personal_id të miqve të zgjedhur
  const [mode, setMode] = useState<ChallengeMode>('volume')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    const [friendsRes, reqRes] = await Promise.all([
      supabase.rpc('my_friends'),
      supabase.rpc('my_friend_requests'),
    ])
    if (friendsRes.error || reqRes.error) {
      setLoadError(true)
    } else {
      setLoadError(false)
      setFriends((friendsRes.data ?? []) as FriendRow[])
      setRequests((reqRes.data ?? []) as RequestRow[])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 10) {
      showToast('ID duhet të përmbajë 10 shifra.', 'error')
      return
    }
    setSending(true)
    const { data, error } = await supabase.rpc('send_friend_request', { p_personal_id: code })
    setSending(false)
    if (error) {
      showToast(GENERIC_ERROR, 'error')
      return
    }
    const msg = SEND_MESSAGES[data as string] ?? { text: GENERIC_ERROR, tone: 'error' as Tone }
    showToast(msg.text, msg.tone)
    if (data === 'sent' || data === 'accepted') {
      setCode('')
      load()
    }
  }

  async function respond(requestId: string, accept: boolean) {
    setBusyId(requestId)
    const { data, error } = await supabase.rpc('respond_friend_request', {
      p_request_id: requestId,
      p_accept: accept,
    })
    setBusyId(null)
    if (error || data === 'not_found') showToast('Kërkesa nuk u gjet.', 'error')
    else if (data === 'accepted') showToast('Tani jeni miq në FitShqip.', 'success')
    else showToast('Kërkesa u refuzua.', 'info')
    load()
  }

  // Anulo kërkesën e dërguar / hiq mikun (RLS lejon fshirjen vetëm për të dy palët).
  async function removeRow(id: string, message: string) {
    setBusyId(id)
    const { error } = await supabase.from('friendships').delete().eq('id', id)
    setBusyId(null)
    if (error) showToast(GENERIC_ERROR, 'error')
    else showToast(message, 'info')
    load()
  }

  function togglePick(personalId: string) {
    setPicked((prev) =>
      prev.includes(personalId)
        ? prev.filter((x) => x !== personalId)
        : prev.length >= 2
          ? prev
          : [...prev, personalId],
    )
  }

  async function createChallenge() {
    if (picked.length < 1) {
      showToast('Zgjidh të paktën një shok.', 'error')
      return
    }
    setCreating(true)
    const { data, error } = await supabase.rpc('create_challenge', { p_mode: mode, p_friend_ids: picked })
    setCreating(false)
    if (error) {
      showToast(GENERIC_ERROR, 'error')
      return
    }
    const res = data as { code: string; id?: string }
    if (res.code === 'created' && res.id) {
      setCreateOpen(false)
      setPicked([])
      reloadChallenges()
      showToast('Ftesat u dërguan!', 'success')
      setRoomId(res.id)
      return
    }
    showToast(CREATE_MESSAGES[res.code] ?? GENERIC_ERROR, 'error')
  }

  async function respondChallenge(id: string, accept: boolean) {
    setBusyId(id)
    const { data, error } = await supabase.rpc('respond_challenge', { p_challenge_id: id, p_accept: accept })
    setBusyId(null)
    if (error || data === 'not_found') {
      showToast('Ftesa nuk është më aktive.', 'error')
    } else if (data === 'joined') {
      showToast('Je në sfidë!', 'success')
      setRoomId(id)
    } else {
      showToast('Ftesa u refuzua.', 'info')
    }
    reloadChallenges()
  }

  const incoming = requests.filter((r) => r.direction === 'incoming')
  const outgoing = requests.filter((r) => r.direction === 'outgoing')
  const visibleChallenges = challengeRows.filter(
    (r) => isChallengeVisible(r.challenge) && r.myStatus !== 'declined' && r.myStatus !== 'left',
  )

  if (roomId) {
    return (
      <ChallengeRoom
        challengeId={roomId}
        onBack={() => {
          setRoomId(null)
          reloadChallenges()
        }}
      />
    )
  }

  return (
    <div className="min-h-dvh pb-28">
      <ScreenHeader title="Palestra me Miqtë" subtitle="Lidhu me përdoruesit e tjerë" />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" />
        </div>
      ) : loadError ? (
        <div className="px-4 pt-6">
          <EmptyState
            icon={Users}
            title="Nuk u ngarkua"
            description="Ndodhi një gabim gjatë ngarkimit të miqve. Kontrollo lidhjen dhe provo përsëri."
            action={
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  load()
                }}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Provo përsëri
              </button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-4 pt-4">
          {/* ID e ime */}
          <PersonalIdCard />

          {/* Shto shok */}
          <Card>
            <form onSubmit={sendRequest} className="flex flex-col gap-3">
              <Field label="Shkruaj ID-në 10-shifrore të FitShqip">
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
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" />
                {sending ? 'Ju lutem prisni…' : 'Shto shok'}
              </button>
            </form>
          </Card>

          {/* Sfidat live */}
          <div>
            <SectionTitle
              action={
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  disabled={friends.length === 0}
                  className="text-sm font-medium text-primary disabled:opacity-40"
                >
                  Krijo sfidë
                </button>
              }
            >
              Sfidat live
            </SectionTitle>
            {visibleChallenges.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {visibleChallenges.map(({ challenge: c, myStatus }) => {
                  const host = users.find((u) => u.id === c.hostId)
                  const invited = myStatus === 'invited' && isChallengeOpen(c)
                  return (
                    <Card key={c.id} className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {c.hostId === userId ? 'Sfida jote' : `Sfida e ${host?.fullName ?? 'një shoku'}`}
                          </p>
                          <p className="text-xs text-muted-foreground">{MODE_LABELS[c.mode]}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                          {STATUS_LABELS[c.status]}
                        </span>
                      </div>
                      {invited ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={busyId === c.id}
                            onClick={() => respondChallenge(c.id, true)}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-success py-2.5 text-sm font-semibold text-success-foreground disabled:opacity-60"
                          >
                            <Check className="h-4 w-4" />
                            Prano
                          </button>
                          <button
                            type="button"
                            disabled={busyId === c.id}
                            onClick={() => respondChallenge(c.id, false)}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-semibold disabled:opacity-60"
                          >
                            <X className="h-4 w-4" />
                            Refuzo
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRoomId(c.id)}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
                        >
                          <Trophy className="h-4 w-4" />
                          {c.status === 'finished' ? 'Shiko rezultatin' : 'Hyr në sfidë'}
                        </button>
                      )}
                    </Card>
                  )
                })}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
                {friends.length === 0
                  ? 'Shto fillimisht një shok për të nisur një sfidë.'
                  : 'Nuk ke sfida aktive. Krijo një dhe sfido 1–2 shokë.'}
              </p>
            )}
          </div>

          {/* Kërkesa */}
          <div>
            <SectionTitle>Kërkesa për miqësi{incoming.length > 0 ? ` (${incoming.length})` : ''}</SectionTitle>
            {incoming.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {incoming.map((r) => (
                  <Card key={r.request_id} className="flex flex-col gap-3">
                    <PersonInfo person={r} />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={busyId === r.request_id}
                        onClick={() => respond(r.request_id, true)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-success py-2.5 text-sm font-semibold text-success-foreground disabled:opacity-60"
                      >
                        <Check className="h-4 w-4" />
                        Prano
                      </button>
                      <button
                        type="button"
                        disabled={busyId === r.request_id}
                        onClick={() => respond(r.request_id, false)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-semibold disabled:opacity-60"
                      >
                        <X className="h-4 w-4" />
                        Refuzo
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
                Nuk ke kërkesa të reja.
              </p>
            )}

            {outgoing.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Të dërguara
                </p>
                <div className="flex flex-col gap-2">
                  {outgoing.map((r) => (
                    <Card key={r.request_id} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <PersonInfo person={r} />
                      </div>
                      <button
                        type="button"
                        disabled={busyId === r.request_id}
                        onClick={() => removeRow(r.request_id, 'Kërkesa u anulua.')}
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

          {/* Miqtë */}
          <div>
            <SectionTitle>Miqtë e mi{friends.length > 0 ? ` (${friends.length})` : ''}</SectionTitle>
            {friends.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {friends.map((f) => (
                  <Card key={f.friendship_id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <PersonInfo person={f} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setRemoving(f)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-primary"
                      aria-label="Hiq mikun"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="Ende pa miq"
                description="Shto një shok me ID-në e tij 10-shifrore, ose ndaj të tuajën me të tjerët."
              />
            )}
          </div>
        </div>
      )}

      <Modal open={!!removing} onClose={() => setRemoving(null)} title="Të heqësh mikun?">
        <p className="text-sm text-muted-foreground">
          {removing?.full_name} do të hiqet nga lista jote e miqve. Mund t'i dërgosh kërkesë përsëri më vonë.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRemoving(null)}
            className="rounded-xl border border-border py-3 font-semibold"
          >
            Anulo
          </button>
          <button
            type="button"
            onClick={() => {
              if (removing) removeRow(removing.friendship_id, 'Miku u hoq.')
              setRemoving(null)
            }}
            className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
          >
            Hiqe
          </button>
        </div>
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Krijo sfidë live">
        <div className="flex flex-col gap-4">
          <Field label="Zgjidh deri në 2 shokë">
            <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
              {friends.map((f) => {
                const on = picked.includes(f.personal_id)
                const locked = !on && picked.length >= 2
                return (
                  <button
                    key={f.friendship_id}
                    type="button"
                    disabled={locked}
                    onClick={() => togglePick(f.personal_id)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors disabled:opacity-40 ${
                      on ? 'border-primary bg-primary/10' : 'border-border bg-background'
                    }`}
                  >
                    <Avatar name={f.full_name} color={f.avatar_color} size={34} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{f.full_name}</span>
                    {on && <Check className="h-4 w-4 text-primary" />}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field label="Si zgjidhet fituesi">
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <Chip key={m} active={mode === m} onClick={() => setMode(m)}>
                  {MODE_LABELS[m]}
                </Chip>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-pretty">{MODE_HINTS[mode]}</p>
          </Field>

          <button
            type="button"
            disabled={creating || picked.length === 0}
            onClick={createChallenge}
            className="rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {creating ? 'Ju lutem prisni…' : 'Dërgo ftesat'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function PersonInfo({ person }: { person: Person }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={person.full_name} color={person.avatar_color} size={42} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{person.full_name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {person.level} · ID {person.personal_id}
        </p>
      </div>
    </div>
  )
}
