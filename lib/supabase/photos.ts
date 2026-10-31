'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export const PHOTO_BUCKET = 'progress-photos'

export interface ProgressPhoto {
  id: string
  userId: string
  path: string
  thumbPath: string
  takenAt: string // ISO
  url: string // lidhje e nënshkruar (e përkohshme) për foton e plotë
  thumbUrl: string // lidhje e nënshkruar për miniaturën
}

function mapPhoto(row: any): ProgressPhoto {
  return {
    id: row.id,
    userId: row.user_id,
    path: row.storage_path,
    thumbPath: row.thumb_path,
    takenAt: row.taken_at,
    url: '',
    thumbUrl: '',
  }
}

// ---- Kompresimi në shfletues: pa EXIF/GPS, ~1280px, JPEG ----
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

async function resizeToJpeg(img: HTMLImageElement, maxDim: number, quality: number): Promise<Blob> {
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.drawImage(img, 0, 0, w, h)
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), 'image/jpeg', quality),
  )
}

function translateError(message: string): string {
  if (message.includes('photo_limit')) return 'Ke arritur kufirin prej 200 fotove. Fshi disa për të shtuar të reja.'
  if (message.includes('photo_future_date')) return 'Data nuk mund të jetë në të ardhmen.'
  return 'Foto nuk u ruajt. Provo përsëri.'
}

export async function uploadPhoto(
  userId: string,
  file: File,
  takenAt: Date,
): Promise<{ ok: boolean; error?: string }> {
  let full: Blob
  let thumb: Blob
  try {
    const img = await loadImage(file)
    full = await resizeToJpeg(img, 1280, 0.82)
    thumb = await resizeToJpeg(img, 360, 0.75)
  } catch {
    return { ok: false, error: 'Foto nuk u lexua. Provo një foto tjetër (JPG ose PNG).' }
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const path = `${userId}/${id}.jpg`
  const thumbPath = `${userId}/${id}-thumb.jpg`
  const storage = supabase.storage.from(PHOTO_BUCKET)

  const up1 = await storage.upload(path, full, { contentType: 'image/jpeg', upsert: false })
  if (up1.error) return { ok: false, error: 'Foto nuk u ngarkua. Kontrollo lidhjen dhe provo përsëri.' }
  const up2 = await storage.upload(thumbPath, thumb, { contentType: 'image/jpeg', upsert: false })
  if (up2.error) {
    await storage.remove([path])
    return { ok: false, error: 'Foto nuk u ngarkua. Kontrollo lidhjen dhe provo përsëri.' }
  }

  const { error } = await supabase
    .from('progress_photos')
    .insert({ user_id: userId, storage_path: path, thumb_path: thumbPath, taken_at: takenAt.toISOString() })
  if (error) {
    await storage.remove([path, thumbPath])
    return { ok: false, error: translateError(error.message) }
  }
  return { ok: true }
}

export async function deletePhoto(photo: ProgressPhoto): Promise<boolean> {
  const { error: storageError } = await supabase.storage.from(PHOTO_BUCKET).remove([photo.path, photo.thumbPath])
  if (storageError) return false
  const { error } = await supabase.from('progress_photos').delete().eq('id', photo.id)
  return !error
}

// Përdoret nga "Rivendos të dhënat": fshin të gjitha fotot e përdoruesit (skedarë + rreshta).
export async function deleteAllMyPhotos(userId: string): Promise<void> {
  const { data } = await supabase.from('progress_photos').select('storage_path, thumb_path').eq('user_id', userId)
  const paths = (data ?? []).flatMap((r: any) => [r.storage_path as string, r.thumb_path as string])
  for (let i = 0; i < paths.length; i += 100) {
    await supabase.storage.from(PHOTO_BUCKET).remove(paths.slice(i, i + 100))
  }
  await supabase.from('progress_photos').delete().eq('user_id', userId)
}

export function usePhotos(userId: string | undefined) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const reload = useCallback(async () => {
    if (!userId) return
    const { data, error: e } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', userId)
      .order('taken_at', { ascending: false })
    if (e) {
      setError(true)
      setLoading(false)
      return
    }
    const rows = (data ?? []).map(mapPhoto)
    const urls = new Map<string, string>()
    const paths = rows.flatMap((r) => [r.path, r.thumbPath])
    if (paths.length > 0) {
      const { data: signed } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 7200)
      signed?.forEach((s) => {
        if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl)
      })
    }
    setPhotos(rows.map((r) => ({ ...r, url: urls.get(r.path) ?? '', thumbUrl: urls.get(r.thumbPath) ?? '' })))
    setError(false)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  return { photos, loading, error, reload }
}

// Për trajnerin: fotot e një klienti (kthehen vetëm nëse klienti ka dhënë lejen për foto;
// ndryshe RLS në Supabase kthen listë bosh).
export async function fetchClientPhotos(clientId: string): Promise<ProgressPhoto[]> {
  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', clientId)
    .order('taken_at', { ascending: false })
  if (error || !data) return []
  const rows = data.map(mapPhoto)
  const urls = new Map<string, string>()
  const paths = rows.flatMap((r) => [r.path, r.thumbPath])
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 3600)
    signed?.forEach((s) => {
      if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl)
    })
  }
  return rows.map((r) => ({ ...r, url: urls.get(r.path) ?? '', thumbUrl: urls.get(r.thumbPath) ?? '' }))
}

// Për pasqyrën e trajnerit: fotot më të fundit të klientëve që i ndajnë (RLS kthen vetëm të lejuarat).
export async function fetchRecentClientPhotos(clientIds: string[], limit = 6): Promise<ProgressPhoto[]> {
  if (clientIds.length === 0) return []
  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .in('user_id', clientIds)
    .order('taken_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  const rows = data.map(mapPhoto)
  const urls = new Map<string, string>()
  const paths = rows.map((r) => r.thumbPath)
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 3600)
    signed?.forEach((s) => {
      if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl)
    })
  }
  return rows.map((r) => ({ ...r, thumbUrl: urls.get(r.thumbPath) ?? '' }))
}
