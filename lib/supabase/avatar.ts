'use client'

import { supabase } from '@/lib/supabase/client'

export const AVATAR_BUCKET = 'avatars'

async function loadImage(file: Blob): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = objectUrl
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

// Prerje katrore nga qendra, 512×512, JPEG (hiqen edhe të dhënat e fshehura si vendndodhja).
async function squareJpeg(img: HTMLImageElement, size: number, quality: number): Promise<Blob> {
  const side = Math.min(img.naturalWidth, img.naturalHeight)
  const sx = (img.naturalWidth - side) / 2
  const sy = (img.naturalHeight - side) / 2
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), 'image/jpeg', quality),
  )
}

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<{ ok: boolean; url?: string; name?: string; error?: string }> {
  let blob: Blob
  try {
    blob = await squareJpeg(await loadImage(file), 512, 0.85)
  } catch {
    return { ok: false, error: 'Foto nuk u lexua. Provo një foto tjetër (JPG ose PNG).' }
  }
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const path = `${userId}/${name}`
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
  if (error) return { ok: false, error: 'Foto nuk u ngarkua. Kontrollo lidhjen dhe provo përsëri.' }
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
  return { ok: true, url: data.publicUrl, name }
}

// Fshin skedarët e vjetër të profilit (mban vetëm `keepName`, nëse jepet).
export async function cleanupAvatars(userId: string, keepName?: string): Promise<void> {
  const { data } = await supabase.storage.from(AVATAR_BUCKET).list(userId, { limit: 100 })
  const old = (data ?? []).filter((f) => f.name !== keepName).map((f) => `${userId}/${f.name}`)
  if (old.length > 0) await supabase.storage.from(AVATAR_BUCKET).remove(old)
}

export async function removeAvatarFile(userId: string, name: string): Promise<void> {
  await supabase.storage.from(AVATAR_BUCKET).remove([`${userId}/${name}`])
}
