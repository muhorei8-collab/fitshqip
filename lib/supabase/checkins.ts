'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { startOfWeek } from '@/lib/storage'
import { localDayKey } from '@/lib/supabase/water'

export interface Checkin {
  id: string
  clientId: string
  coachId: string
  weekStart: string // YYYY-MM-DD (e hëna)
  energy: number
  sleep: number
  adherence: number
  note: string
  submittedAt: string
  feedback: string | null
  reviewedAt: string | null
}

type Tone = 'success' | 'info' | 'error'

// Kodet që kthen submit_checkin → mesazhet në shqip.
export const CHECKIN_MESSAGES: Record<string, { text: string; tone: Tone }> = {
  submitted: { text: 'Check-in u dërgua te trajneri yt.', tone: 'success' },
  updated: { text: 'Check-in u përditësua.', tone: 'success' },
  unauthorized: { text: 'Duhet të hysh në llogari.', tone: 'error' },
  no_coach: { text: 'Nuk ke një trajner aktiv për të dërguar check-in.', tone: 'error' },
  invalid: { text: 'Vlerësimet duhet të jenë 1–5 dhe shënimi deri në 600 shkronja.', tone: 'error' },
  already_reviewed: { text: 'Trajneri t’u përgjigj tashmë këtij check-in. Do të ndryshosh javën tjetër.', tone: 'info' },
  already_submitted: { text: 'Check-in i kësaj jave u dërgua tashmë.', tone: 'info' },
}

export const RATINGS: { key: 'energy' | 'sleep' | 'adherence'; label: string; low: string; high: string }[] = [
  { key: 'energy', label: 'Energjia', low: 'Shumë e ulët', high: 'Shumë e lartë' },
  { key: 'sleep', label: 'Gjumi', low: 'Shumë keq', high: 'Shumë mirë' },
  { key: 'adherence', label: 'Ndjekja e planit', low: 'Aspak', high: 'Plotësisht' },
]

function mapCheckin(row: any): Checkin {
  return {
    id: row.id,
    clientId: row.client_id,
    coachId: row.coach_id,
    weekStart: row.week_start,
    energy: row.energy,
    sleep: row.sleep,
    adherence: row.adherence,
    note: row.note ?? '',
    submittedAt: row.submitted_at,
    feedback: row.feedback ?? null,
    reviewedAt: row.reviewed_at ?? null,
  }
}

// "19–25 tet" për javën që nis më `weekStart`.
export function weekLabel(weekStart: string): string {
  const [y, m, d] = weekStart.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const end = new Date(y, m - 1, d + 6)
  const day = (x: Date) => x.getDate()
  const mon = (x: Date) => x.toLocaleDateString('sq-AL', { month: 'short' })
  return start.getMonth() === end.getMonth()
    ? `${day(start)}–${day(end)} ${mon(end)}`
    : `${day(start)} ${mon(start)} – ${day(end)} ${mon(end)}`
}

// Për klientin: check-in-et e mia dhe nëse kam trajner aktiv (përditësohet live).
export function useMyCheckins(userId: string | undefined) {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [hasCoach, setHasCoach] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!userId) return
    const [link, rows] = await Promise.all([
      supabase.from('coach_clients').select('id').eq('client_id', userId).eq('status', 'active').limit(1),
      supabase.from('checkins').select('*').eq('client_id', userId).order('week_start', { ascending: false }).limit(52),
    ])
    if (!link.error) setHasCoach((link.data ?? []).length > 0)
    if (!rows.error) setCheckins((rows.data ?? []).map(mapCheckin))
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (!userId) return
    reload()
    const channel = supabase
      .channel(`my-checkins-${userId}-${Math.random().toString(36).slice(2, 8)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkins', filter: `client_id=eq.${userId}` }, () => reload())
      .subscribe()
    const poll = setInterval(reload, 60000)
    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [userId, reload])

  const thisWeek = checkins.find((c) => c.weekStart === localDayKey(startOfWeek())) ?? null
  return { checkins, hasCoach, thisWeek, loading, reload }
}

// Për trajnerin: check-in-et e të gjithë klientëve aktivë (RLS e kufizon te lidhjet aktive).
export function useCoachCheckins(coachId: string | undefined) {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!coachId) return
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('coach_id', coachId)
      .order('submitted_at', { ascending: false })
      .limit(100)
    if (!error) setCheckins((data ?? []).map(mapCheckin))
    setLoading(false)
  }, [coachId])

  useEffect(() => {
    if (!coachId) return
    reload()
    const channel = supabase
      .channel(`coach-checkins-${coachId}-${Math.random().toString(36).slice(2, 8)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkins', filter: `coach_id=eq.${coachId}` }, () => reload())
      .subscribe()
    const poll = setInterval(reload, 60000)
    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [coachId, reload])

  return { checkins, loading, reload }
}
