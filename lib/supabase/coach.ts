'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Level, Role } from '@/lib/types'

export interface CoachLink {
  id: string
  coachId: string
  clientId: string
  status: 'pending' | 'active'
  shareWeight: boolean
  shareWorkouts: boolean
  sharePhotos: boolean
  shareHydration: boolean
  createdAt: string
}

export interface PersonLite {
  id: string
  fullName: string
  avatarColor: string
  level: Level
  personalId: string
  role: Role
  coachVerified: boolean
  avatarUrl: string | null
}

export type CoachLinkWithPerson = CoachLink & { person: PersonLite | null }

type Tone = 'success' | 'info' | 'error'

// Kodet që kthen send_coach_invite → mesazhet në shqip.
export const INVITE_MESSAGES: Record<string, { text: string; tone: Tone }> = {
  sent: { text: 'Ftesa u dërgua. Klienti duhet ta pranojë.', tone: 'success' },
  unauthorized: { text: 'Duhet të hysh në llogari.', tone: 'error' },
  not_trainer: { text: 'Vetëm llogaritë e trajnerëve mund të ftojnë klientë.', tone: 'error' },
  invalid_id: { text: 'ID duhet të përmbajë 10 shifra.', tone: 'error' },
  not_found: { text: 'Nuk u gjet asnjë përdorues me këtë ID.', tone: 'error' },
  self: { text: 'Nuk mund ta ftosh veten.', tone: 'error' },
  already_sent: { text: 'Ftesa është dërguar tashmë.', tone: 'info' },
  already_active: { text: 'Ky klient është tashmë i yti.', tone: 'info' },
  client_busy: { text: 'Ky përdorues ka tashmë një trajner aktiv.', tone: 'error' },
  target_is_trainer: { text: 'Ky përdorues është trajner dhe nuk mund të jetë klient.', tone: 'error' },
  too_many_pending: { text: 'Ke shumë ftesa në pritje. Anulo disa ose prit përgjigje.', tone: 'error' },
}

function mapLink(row: any): CoachLink {
  return {
    id: row.id,
    coachId: row.coach_id,
    clientId: row.client_id,
    status: row.status,
    shareWeight: !!row.share_weight,
    shareWorkouts: !!row.share_workouts,
    sharePhotos: !!row.share_photos,
    shareHydration: !!row.share_hydration,
    createdAt: row.created_at,
  }
}

function mapPerson(row: any): PersonLite {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarColor: row.avatar_color,
    level: row.level,
    personalId: row.personal_id ?? '',
    role: row.role === 'trainer' ? 'trainer' : 'client',
    coachVerified: !!row.coach_verified,
    avatarUrl: row.avatar_url ?? null,
  }
}

// Lidhjet trajner–klient të mia. side='coach': klientët e mi; side='client': trajnerët që më kanë ftuar/lidhur.
// Përditësohet live; sondazhi çdo 30 sek. është rrjetë sigurie (p.sh. kur lidhja hiqet nga pala tjetër).
export function useCoachLinks(userId: string | undefined, side: 'coach' | 'client') {
  const [links, setLinks] = useState<CoachLinkWithPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const column = side === 'coach' ? 'coach_id' : 'client_id'

  const reload = useCallback(async () => {
    if (!userId) return
    const { data, error: e } = await supabase
      .from('coach_clients')
      .select('*')
      .eq(column, userId)
      .order('created_at', { ascending: false })
    if (e) {
      setError(true)
      setLoading(false)
      return
    }
    const rows = (data ?? []).map(mapLink)
    const otherId = (r: CoachLink) => (side === 'coach' ? r.clientId : r.coachId)
    const people = new Map<string, PersonLite>()
    if (rows.length > 0) {
      const wanted = new Set(rows.map(otherId))
      const { data: profs } = await supabase.rpc('public_profiles')
      ;(profs ?? []).forEach((p: any) => {
        if (wanted.has(p.id)) people.set(p.id, mapPerson(p))
      })
    }
    setLinks(rows.map((r) => ({ ...r, person: people.get(otherId(r)) ?? null })))
    setError(false)
    setLoading(false)
  }, [userId, column, side])

  useEffect(() => {
    if (!userId) return
    reload()
    const channel = supabase
      .channel(`coach-links-${side}-${userId}-${Math.random().toString(36).slice(2, 8)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coach_clients', filter: `${column}=eq.${userId}` },
        () => reload(),
      )
      .subscribe()
    const poll = setInterval(reload, 30000)
    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [userId, column, side, reload])

  return { links, loading, error, reload }
}
