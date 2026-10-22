'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Image as ImageIcon, Lock } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Card, EmptyState, Field, Modal, SectionTitle, inputClass } from '@/components/shared/ui'
import { kgToUnit } from '@/lib/format'
import { deletePhoto, uploadPhoto, usePhotos, type ProgressPhoto } from '@/lib/supabase/photos'
import type { BodyMetric } from '@/lib/types'

const DAY = 86400000
const GENERIC_ERROR = 'Diçka shkoi keq. Provo përsëri.'

const pad = (n: number) => String(n).padStart(2, '0')
const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

function fmtShort(iso: string) {
  const d = new Date(iso)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString('sq-AL', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: '2-digit' }) })
}

function fmtFull(iso: string) {
  const d = new Date(iso)
  return `${d.toLocaleDateString('sq-AL', { day: 'numeric', month: 'long', year: 'numeric' })}, ${hhmm(d)}`
}

// Matja e peshës më afër kohës së fotos (brenda 7 ditëve).
function weightNear(takenAt: string, metrics: BodyMetric[]): BodyMetric | null {
  const t = +new Date(takenAt)
  let best: BodyMetric | null = null
  let bestDist = Infinity
  for (const m of metrics) {
    const d = Math.abs(+new Date(m.date) - t)
    if (d < bestDist) {
      bestDist = d
      best = m
    }
  }
  return best && bestDist <= 7 * DAY ? best : null
}

export function ProgressPhotos() {
  const { currentUser, metrics, showToast } = useApp()
  const userId = currentUser?.id
  const unit = currentUser?.unit ?? 'kg'
  const { photos, loading, error, reload } = usePhotos(userId)

  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  // Shtimi i fotos
  const [pending, setPending] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [takenAt, setTakenAt] = useState('')
  const [saving, setSaving] = useState(false)

  // Shikimi / krahasimi
  const [viewing, setViewing] = useState<ProgressPhoto | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [beforeId, setBeforeId] = useState<string | null>(null)
  const [afterId, setAfterId] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const ordered = useMemo(() => [...photos].sort((a, b) => +new Date(a.takenAt) - +new Date(b.takenAt)), [photos])
  const before = photos.find((p) => p.id === beforeId) ?? ordered[0] ?? null
  const after = photos.find((p) => p.id === afterId) ?? ordered[ordered.length - 1] ?? null

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Zgjidh një foto.', 'error')
      return
    }
    // Për foto nga galeria, data e skedarit zakonisht është koha e fotografimit.
    const suggested = file.lastModified ? new Date(Math.min(file.lastModified, Date.now())) : new Date()
    setPending(file)
    setPreview(URL.createObjectURL(file))
    setTakenAt(toLocalInput(suggested))
  }

  function closeAdd() {
    setPending(null)
    setPreview(null)
  }

  async function save() {
    if (!pending || !userId) return
    const when = new Date(takenAt)
    if (Number.isNaN(+when)) {
      showToast('Vendos një datë të vlefshme.', 'error')
      return
    }
    if (+when > Date.now() + 60000) {
      showToast('Data nuk mund të jetë në të ardhmen.', 'error')
      return
    }
    setSaving(true)
    const res = await uploadPhoto(userId, pending, when)
    setSaving(false)
    if (!res.ok) {
      showToast(res.error ?? GENERIC_ERROR, 'error')
      return
    }
    showToast('Foto u shtua!', 'success')
    closeAdd()
    reload()
  }

  async function remove() {
    if (!viewing) return
    setDeleting(true)
    const ok = await deletePhoto(viewing)
    setDeleting(false)
    if (!ok) {
      showToast(GENERIC_ERROR, 'error')
      return
    }
    if (beforeId === viewing.id) setBeforeId(null)
    if (afterId === viewing.id) setAfterId(null)
    setViewing(null)
    setConfirmDelete(false)
    showToast('Foto u fshi.', 'info')
    reload()
  }

  const viewingWeight = viewing ? weightNear(viewing.takenAt, metrics) : null

  return (
    <>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={onPick} />

      {/* Para / Tani */}
      {before && after && before.id !== after.id && (
        <Card>
          <SectionTitle>Para / Tani</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Para', photo: before },
              { label: 'Tani', photo: after },
            ].map(({ label, photo }) => {
              const w = weightNear(photo.takenAt, metrics)
              return (
                <div key={label} className="flex flex-col gap-1.5">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary">
                    {photo.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.url} alt={`${label}: ${fmtShort(photo.takenAt)}`} className="h-full w-full object-cover" />
                    )}
                    <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      {label}
                    </span>
                  </div>
                  <p className="text-xs font-medium">{fmtFull(photo.takenAt)}</p>
                  <p className="text-xs text-muted-foreground">
                    {w ? `≈ ${kgToUnit(w.weight, unit).toFixed(1)} ${unit}` : 'Pa peshë të regjistruar afër'}
                  </p>
                </div>
              )
            })}
          </div>
          {(() => {
            const days = Math.round((+new Date(after.takenAt) - +new Date(before.takenAt)) / DAY)
            const wb = weightNear(before.takenAt, metrics)
            const wa = weightNear(after.takenAt, metrics)
            const diff = wb && wa ? kgToUnit(wa.weight - wb.weight, unit) : null
            return (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                {days} ditë mes fotove
                {diff !== null && (
                  <>
                    {' · '}
                    <span className={`font-semibold ${diff >= 0 ? 'text-success' : 'text-primary'}`}>
                      {diff >= 0 ? '+' : ''}
                      {diff.toFixed(1)} {unit}
                    </span>
                  </>
                )}
              </p>
            )
          })()}
        </Card>
      )}

      {/* Fotot e mia */}
      <Card>
        <SectionTitle
          action={
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => cameraRef.current?.click()} className="flex items-center gap-1 text-sm font-medium text-primary">
                <Camera className="h-4 w-4" />
                Kamera
              </button>
              <button type="button" onClick={() => galleryRef.current?.click()} className="flex items-center gap-1 text-sm font-medium text-primary">
                <ImageIcon className="h-4 w-4" />
                Galeria
              </button>
            </div>
          }
        >
          Fotot e progresit
        </SectionTitle>
        <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          Private: vetëm ti i shikon fotot e tua.
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-secondary border-t-primary" />
          </div>
        ) : error ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Fotot nuk u ngarkuan.{' '}
            <button type="button" onClick={reload} className="font-semibold text-primary">
              Provo përsëri
            </button>
          </p>
        ) : photos.length === 0 ? (
          <EmptyState
            icon={Camera}
            title="Ende pa foto"
            description="Shto foton e parë sot, që të shohësh ndryshimin më vonë."
          />
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setViewing(p)
                  setConfirmDelete(false)
                }}
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
        )}
      </Card>

      {/* Shto foto */}
      <Modal open={!!pending} onClose={closeAdd} title="Shto foto">
        <div className="flex flex-col gap-4">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Parapamje" className="mx-auto max-h-72 rounded-xl object-contain" />
          )}
          <Field label="Data dhe ora e fotos">
            <input
              type="datetime-local"
              className={inputClass}
              value={takenAt}
              max={toLocalInput(new Date())}
              onChange={(e) => setTakenAt(e.target.value)}
            />
          </Field>
          <p className="text-xs text-muted-foreground text-pretty">
            Foto zvogëlohet dhe i hiqen të dhënat e fshehura (si vendndodhja) para ngarkimit.
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? 'Po ngarkohet…' : 'Ruaj foton'}
          </button>
        </div>
      </Modal>

      {/* Shiko foton */}
      <Modal
        open={!!viewing}
        onClose={() => {
          setViewing(null)
          setConfirmDelete(false)
        }}
        title={viewing ? fmtShort(viewing.takenAt) : undefined}
      >
        {viewing && (
          <div className="flex flex-col gap-3">
            {viewing.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={viewing.url} alt={`Foto e ${fmtShort(viewing.takenAt)}`} className="mx-auto max-h-[55vh] rounded-xl object-contain" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium">{fmtFull(viewing.takenAt)}</p>
              <p className="text-xs text-muted-foreground">
                {viewingWeight
                  ? `Pesha afër kësaj date: ${kgToUnit(viewingWeight.weight, unit).toFixed(1)} ${unit}`
                  : 'Pa peshë të regjistruar afër kësaj date'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setBeforeId(viewing.id)
                  setViewing(null)
                  showToast('U vendos si "Para".', 'success')
                }}
                className="rounded-xl border border-border py-2.5 text-sm font-semibold"
              >
                Vendos si "Para"
              </button>
              <button
                type="button"
                onClick={() => {
                  setAfterId(viewing.id)
                  setViewing(null)
                  showToast('U vendos si "Tani".', 'success')
                }}
                className="rounded-xl border border-border py-2.5 text-sm font-semibold"
              >
                Vendos si "Tani"
              </button>
            </div>
            {confirmDelete ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-xl border border-border py-2.5 text-sm font-semibold"
                >
                  Anulo
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={remove}
                  className="rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {deleting ? 'Po fshihet…' : 'Fshije përgjithmonë'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="rounded-xl py-2 text-sm font-semibold text-primary"
              >
                Fshi foton
              </button>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
