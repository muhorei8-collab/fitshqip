'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Modal } from '@/components/shared/ui'
import { UserAvatar } from '@/components/shared/user-avatar'
import { cleanupAvatars, removeAvatarFile, uploadAvatar } from '@/lib/supabase/avatar'

const GENERIC_ERROR = 'Diçka shkoi keq. Provo përsëri.'

export function AvatarEditor({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentUser, updateProfile, showToast } = useApp()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  if (!currentUser) return null
  const user = currentUser

  function close() {
    setFile(null)
    setPreview(null)
    onClose()
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return
    if (!picked.type.startsWith('image/')) {
      showToast('Zgjidh një foto.', 'error')
      return
    }
    if (picked.size > 20 * 1024 * 1024) {
      showToast('Foto është shumë e madhe (maksimumi 20 MB).', 'error')
      return
    }
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
  }

  async function save() {
    if (!file) return
    setBusy(true)
    const res = await uploadAvatar(user.id, file)
    if (!res.ok || !res.url || !res.name) {
      setBusy(false)
      showToast(res.error ?? GENERIC_ERROR, 'error')
      return
    }
    const ok = await updateProfile({ avatarUrl: res.url })
    if (!ok) {
      await removeAvatarFile(user.id, res.name)
      setBusy(false)
      showToast(GENERIC_ERROR, 'error')
      return
    }
    await cleanupAvatars(user.id, res.name)
    setBusy(false)
    showToast('Foto e profilit u ruajt!', 'success')
    close()
  }

  async function removePhoto() {
    setBusy(true)
    const ok = await updateProfile({ avatarUrl: null })
    if (ok) await cleanupAvatars(user.id)
    setBusy(false)
    if (!ok) {
      showToast(GENERIC_ERROR, 'error')
      return
    }
    showToast('Foto u hoq.', 'info')
    close()
  }

  return (
    <Modal open={open} onClose={close} title="Foto e profilit">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      <div className="flex flex-col items-center gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Parapamje" className="h-32 w-32 rounded-full object-cover" />
        ) : (
          <UserAvatar name={user.fullName} color={user.avatarColor} url={user.avatarUrl} size={128} />
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          <Camera className="h-4 w-4" />
          {file ? 'Zgjidh një tjetër' : 'Zgjidh foto'}
        </button>

        {file && (
          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? 'Po ruhet…' : 'Ruaj foton'}
          </button>
        )}

        {!file && user.avatarUrl && (
          <button
            type="button"
            disabled={busy}
            onClick={removePhoto}
            className="rounded-xl py-2 text-sm font-semibold text-primary disabled:opacity-60"
          >
            {busy ? 'Po hiqet…' : 'Hiq foton'}
          </button>
        )}

        <p className="text-center text-xs text-muted-foreground text-pretty">
          Foto e profilit shfaqet te përdoruesit e tjerë (miq, sfida, trajner). Priten katrore nga qendra dhe
          zvogëlohet para ngarkimit.
        </p>
      </div>
    </Modal>
  )
}
