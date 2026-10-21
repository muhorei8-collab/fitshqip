'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export type ChallengeMode = 'volume' | 'reps' | 'sets'
export type ChallengeStatus = 'lobby' | 'live' | 'finished' | 'cancelled'
export type ParticipantStatus = 'invited' | 'joined' | 'declined' | 'left'

export interface Challenge {
  id: string
  hostId: string
  mode: ChallengeMode
  status: ChallengeStatus
  winnerId: string | null
  createdAt: string
  startedAt: string | null
  endedAt: string | null
}

export interface ChallengeParticipant {
  challengeId: string
  userId: string
  status: ParticipantStatus
  volume: number
  reps: number
  sets: number
}

export const MODE_LABELS: Record<ChallengeMode, string> = {
  volume: 'Vëllim total',
  reps: 'Përsëritje totale',
  sets: 'Numri i serive',
}

export const MODE_HINTS: Record<ChallengeMode, string> = {
  volume: 'Fiton ai që ngre më shumë gjithsej (kg × përsëritje).',
  reps: 'Fiton ai që bën më shumë përsëritje, pa marrë parasysh peshën.',
  sets: 'Fiton ai që kryen më shumë seri.',
}

export const STATUS_LABELS: Record<ChallengeStatus, string> = {
  lobby: 'Në pritje',
  live: 'Live',
  finished: 'Përfundoi',
  cancelled: 'Anuluar',
}

// Sfidat e braktisura mbyllen vetë nga pamja pas këtyre afateve (shih edhe SQL).
const LOBBY_TTL_MS = 24 * 3600 * 1000
const LIVE_TTL_MS = 6 * 3600 * 1000

export function isChallengeOpen(c: Challenge): boolean {
  const now = Date.now()
  if (c.status === 'lobby') return now - +new Date(c.createdAt) < LOBBY_TTL_MS
  if (c.status === 'live') return now - +new Date(c.startedAt ?? c.createdAt) < LIVE_TTL_MS
  return false
}

export function isChallengeVisible(c: Challenge): boolean {
  if (isChallengeOpen(c)) return true
  if (c.status === 'finished' && c.endedAt) return Date.now() - +new Date(c.endedAt) < LOBBY_TTL_MS
  return false
}

export function scoreOf(p: ChallengeParticipant, mode: ChallengeMode): number {
  return mode === 'volume' ? p.volume : mode === 'reps' ? p.reps : p.sets
}

export function mapChallenge(row: any): Challenge {
  return {
    id: row.id,
    hostId: row.host_id,
    mode: row.mode,
    status: row.status,
    winnerId: row.winner_id ?? null,
    createdAt: row.created_at,
    startedAt: row.started_at ?? null,
    endedAt: row.ended_at ?? null,
  }
}

export function mapParticipant(row: any): ChallengeParticipant {
  return {
    challengeId: row.challenge_id,
    userId: row.user_id,
    status: row.status,
    volume: Number(row.volume) || 0,
    reps: Number(row.reps) || 0,
    sets: Number(row.sets) || 0,
  }
}

function channelName(prefix: string, key: string) {
  return `${prefix}-${key}-${Math.random().toString(36).slice(2, 8)}`
}

// Një sfidë + pjesëmarrësit e saj, të përditësuar live (Supabase Realtime).
// Sondazhi çdo 20 sek. është rrjetë sigurie nëse lidhja realtime ndërpritet.
export function useChallenge(challengeId: string | null) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([])
  const [loading, setLoading] = useState(!!challengeId)
  const [error, setError] = useState(false)

  const reload = useCallback(async () => {
    if (!challengeId) return
    const [c, p] = await Promise.all([
      supabase.from('challenges').select('*').eq('id', challengeId).maybeSingle(),
      supabase.from('challenge_participants').select('*').eq('challenge_id', challengeId),
    ])
    if (c.error || p.error) {
      setError(true)
    } else {
      setError(false)
      setChallenge(c.data ? mapChallenge(c.data) : null)
      setParticipants((p.data ?? []).map(mapParticipant))
    }
    setLoading(false)
  }, [challengeId])

  useEffect(() => {
    if (!challengeId) {
      setChallenge(null)
      setParticipants([])
      setLoading(false)
      return
    }
    setLoading(true)
    reload()
    const channel = supabase
      .channel(channelName('challenge', challengeId))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'challenges', filter: `id=eq.${challengeId}` },
        () => reload(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'challenge_participants', filter: `challenge_id=eq.${challengeId}` },
        () => reload(),
      )
      .subscribe()
    const poll = setInterval(reload, 20000)
    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [challengeId, reload])

  return { challenge, participants, loading, error, reload }
}

export interface MyChallengeRow {
  challenge: Challenge
  myStatus: ParticipantStatus
}

// Sfidat ku jam pjesëmarrës ose i ftuar, me përditësim live.
export function useMyChallenges(userId: string | undefined) {
  const [rows, setRows] = useState<MyChallengeRow[]>([])

  const reload = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('challenge_participants')
      .select('status, challenge:challenges(*)')
      .eq('user_id', userId)
    if (error) return
    const mapped: MyChallengeRow[] = (data ?? []).flatMap((r: any) => {
      const c = Array.isArray(r.challenge) ? r.challenge[0] : r.challenge
      return c ? [{ challenge: mapChallenge(c), myStatus: r.status as ParticipantStatus }] : []
    })
    mapped.sort((a, b) => +new Date(b.challenge.createdAt) - +new Date(a.challenge.createdAt))
    setRows(mapped)
  }, [userId])

  useEffect(() => {
    if (!userId) return
    reload()
    const channel = supabase
      .channel(channelName('my-challenges', userId))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'challenge_participants', filter: `user_id=eq.${userId}` },
        () => reload(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => reload())
      .subscribe()
    const poll = setInterval(reload, 20000)
    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [userId, reload])

  return { rows, reload }
}

// Sfida ku jam pjesëmarrës dhe që është ende e hapur (live ka përparësi mbi lobby).
export async function findMyOpenChallengeId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('challenge_participants')
    .select('status, challenge:challenges(*)')
    .eq('user_id', userId)
    .eq('status', 'joined')
    .order('joined_at', { ascending: false })
    .limit(20)
  if (error) return null
  const open = (data ?? [])
    .map((r: any) => (Array.isArray(r.challenge) ? r.challenge[0] : r.challenge))
    .filter(Boolean)
    .map(mapChallenge)
    .filter(isChallengeOpen)
  return open.find((c) => c.status === 'live')?.id ?? open[0]?.id ?? null
}
