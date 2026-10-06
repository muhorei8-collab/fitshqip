'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, UserMinus, UserPlus, Users, X } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { ScreenHeader } from '@/components/screens/screen-header'
import { Avatar, Card, EmptyState, Field, Modal, SectionTitle, inputClass } from '@/components/shared/ui'
import { PersonalIdCard } from '@/components/shared/personal-id-card'
import { supabase } from '@/lib/supabase/client'

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

export function FriendsScreen() {
  const { currentUser, showToast } = useApp()
  const userId = currentUser?.id

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [friends, setFriends] = useState<FriendRow[]>([])
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [removing, setRemoving] = useState<FriendRow | null>(null)

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

  const incoming = requests.filter((r) => r.direction === 'incoming')
  const outgoing = requests.filter((r) => r.direction === 'outgoing')

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
