'use client'

import { useState } from 'react'
import { BadgeCheck, Camera, ChevronLeft, Dumbbell, Scale, UserCheck } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { PersonalIdCard } from '@/components/shared/personal-id-card'
import { Avatar, Card, EmptyState, Modal, SectionTitle } from '@/components/shared/ui'
import { supabase } from '@/lib/supabase/client'
import { useCoachLinks, type CoachLinkWithPerson } from '@/lib/supabase/coach'

const GENERIC_ERROR = 'Diçka shkoi keq. Provo përsëri.'

interface Sharing {
  weight: boolean
  workouts: boolean
  photos: boolean
}
const NO_SHARING: Sharing = { weight: false, workouts: false, photos: false }

const TOGGLES: { key: keyof Sharing; label: string; hint: string; icon: typeof Scale }[] = [
  { key: 'weight', label: 'Pesha', hint: 'Matjet e peshës dhe grafiku', icon: Scale },
  { key: 'workouts', label: 'Stërvitjet', hint: 'Seancat, seritë dhe vëllimi', icon: Dumbbell },
  { key: 'photos', label: 'Fotot e progresit', hint: 'Fotot që ke ngarkuar', icon: Camera },
]

export function MyCoachScreen({ onBack }: { onBack: () => void }) {
  const { currentUser, showToast } = useApp()
  const { links, loading, error, reload } = useCoachLinks(currentUser?.id, 'client')
  const [prefs, setPrefs] = useState<Record<string, Sharing>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [confirmEnd, setConfirmEnd] = useState<CoachLinkWithPerson | null>(null)

  const active = links.find((l) => l.status === 'active') ?? null
  const pending = links.filter((l) => l.status === 'pending')
  const prefOf = (id: string) => prefs[id] ?? NO_SHARING

  async function respond(link: CoachLinkWithPerson, accept: boolean) {
    const s = prefOf(link.id)
    setBusy(link.id)
    const { data, error: rpcError } = await supabase.rpc('respond_coach_invite', {
      p_invite_id: link.id,
      p_accept: accept,
      p_weight: s.weight,
      p_workouts: s.workouts,
      p_photos: s.photos,
    })
    setBusy(null)
    if (rpcError) showToast(GENERIC_ERROR, 'error')
    else if (data === 'accepted') showToast('Je lidhur me trajnerin. Mund t’i ndryshosh lejet kurdo.', 'success')
    else if (data === 'declined') showToast('Ftesa u refuzua.', 'info')
    else if (data === 'client_busy') showToast('Ke tashmë një trajner aktiv. Shkëpute fillimisht.', 'error')
    else showToast('Ftesa nuk është më aktive.', 'error')
    reload()
  }

  async function updateSharing(link: CoachLinkWithPerson, key: keyof Sharing, value: boolean) {
    const next: Sharing = {
      weight: link.shareWeight,
      workouts: link.shareWorkouts,
      photos: link.sharePhotos,
      [key]: value,
    }
    setBusy(link.id)
    const { data, error: rpcError } = await supabase.rpc('update_coach_sharing', {
      p_link_id: link.id,
      p_weight: next.weight,
      p_workouts: next.workouts,
      p_photos: next.photos,
    })
    setBusy(null)
    if (rpcError || data !== 'ok') showToast(GENERIC_ERROR, 'error')
    reload()
  }

  async function endLink(link: CoachLinkWithPerson) {
    setConfirmEnd(null)
    setBusy(link.id)
    const { error: delError } = await supabase.from('coach_clients').delete().eq('id', link.id)
    setBusy(null)
    if (delError) showToast(GENERIC_ERROR, 'error')
    else showToast('Trajneri u shkëput. Nuk i sheh më të dhënat e tua.', 'info')
    reload()
  }

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
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold leading-tight">Trajneri im</h1>
          <p className="truncate text-xs text-muted-foreground">Zgjidh çfarë sheh trajneri yt</p>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" />
        </div>
      ) : error ? (
        <div className="px-4 pt-6">
          <EmptyState
            icon={UserCheck}
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
          {/* Ftesat në pritje */}
          {pending.length > 0 && (
            <div>
              <SectionTitle>Ftesa nga trajnerë ({pending.length})</SectionTitle>
              <div className="flex flex-col gap-3">
                {pending.map((l) => {
                  const s = prefOf(l.id)
                  return (
                    <Card key={l.id} className="flex flex-col gap-3">
                      <PersonRow link={l} />
                      <p className="text-xs text-muted-foreground text-pretty">
                        Zgjidh çfarë mund të shohë ky trajner. Pa leje, nuk sheh asgjë. Mund t’i ndryshosh ose t’i heqësh
                        kurdo.
                      </p>
                      <div className="flex flex-col gap-2">
                        {TOGGLES.map((t) => (
                          <ShareToggle
                            key={t.key}
                            icon={t.icon}
                            label={t.label}
                            hint={t.hint}
                            checked={s[t.key]}
                            disabled={busy === l.id}
                            onChange={(v) => setPrefs((p) => ({ ...p, [l.id]: { ...prefOf(l.id), [t.key]: v } }))}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={busy === l.id}
                          onClick={() => respond(l, true)}
                          className="rounded-xl bg-success py-2.5 text-sm font-semibold text-success-foreground disabled:opacity-60"
                        >
                          Prano
                        </button>
                        <button
                          type="button"
                          disabled={busy === l.id}
                          onClick={() => respond(l, false)}
                          className="rounded-xl border border-border py-2.5 text-sm font-semibold disabled:opacity-60"
                        >
                          Refuzo
                        </button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Trajneri aktiv */}
          {active ? (
            <div>
              <SectionTitle>Trajneri aktiv</SectionTitle>
              <Card className="flex flex-col gap-3">
                <PersonRow link={active} />
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Çfarë sheh ai
                </p>
                <div className="flex flex-col gap-2">
                  {TOGGLES.map((t) => (
                    <ShareToggle
                      key={t.key}
                      icon={t.icon}
                      label={t.label}
                      hint={t.hint}
                      checked={
                        t.key === 'weight' ? active.shareWeight : t.key === 'workouts' ? active.shareWorkouts : active.sharePhotos
                      }
                      disabled={busy === active.id}
                      onChange={(v) => updateSharing(active, t.key, v)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  disabled={busy === active.id}
                  onClick={() => setConfirmEnd(active)}
                  className="rounded-xl py-2 text-sm font-semibold text-primary disabled:opacity-60"
                >
                  Shkëput trajnerin
                </button>
              </Card>
            </div>
          ) : (
            pending.length === 0 && (
              <>
                <EmptyState
                  icon={UserCheck}
                  title="Nuk ke trajner"
                  description="Nëse ke një trajner në FitShqip, jepi ID-në tënde 10-shifrore dhe ai të dërgon ftesë këtu."
                />
                <PersonalIdCard />
              </>
            )
          )}
        </div>
      )}

      <Modal open={!!confirmEnd} onClose={() => setConfirmEnd(null)} title="Ta shkëputësh trajnerin?">
        <p className="text-sm text-muted-foreground">
          {confirmEnd?.person?.fullName ?? 'Trajneri'} nuk do t’i shohë më të dhënat e tua. Mund të të ftojë përsëri më
          vonë.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setConfirmEnd(null)}
            className="rounded-xl border border-border py-3 font-semibold"
          >
            Anulo
          </button>
          <button
            type="button"
            onClick={() => confirmEnd && endLink(confirmEnd)}
            className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
          >
            Shkëpute
          </button>
        </div>
      </Modal>
    </div>
  )
}

function PersonRow({ link }: { link: CoachLinkWithPerson }) {
  const p = link.person
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={p?.fullName ?? 'Trajner'} color={p?.avatarColor ?? '#E5352B'} size={44} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{p?.fullName ?? 'Trajner'}</p>
        {p?.coachVerified ? (
          <span className="flex items-center gap-1 text-xs font-medium text-success">
            <BadgeCheck className="h-3.5 w-3.5" />I verifikuar
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Pa verifikuar</span>
        )}
      </div>
    </div>
  )
}

function ShareToggle({
  icon: Icon,
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  icon: typeof Scale
  label: string
  hint: string
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left disabled:opacity-60"
    >
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <span
        className={`flex h-6 w-10 shrink-0 items-center rounded-full border border-border p-0.5 transition-colors ${
          checked ? 'bg-primary' : 'bg-secondary'
        }`}
      >
        <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </span>
    </button>
  )
}
