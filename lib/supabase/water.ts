'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface WaterLog {
  id: string
  amountMl: number
  loggedAt: string
}

export const DEFAULT_WATER_GOAL = 2000
export const QUICK_AMOUNTS = [200, 250, 330, 500, 750]

const pad = (n: number) => String(n).padStart(2, '0')
// Dita sipas orës LOKALE të pajisjes (jo UTC), që "sot" të ndryshojë në mesnatën tënde.
export const localDayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export type AddResult = 'ok' | 'busy' | 'error'

export function useWater(userId: string | undefined, days = 14) {
  const [logs, setLogs] = useState<WaterLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const busy = useRef(false)

  const reload = useCallback(async () => {
    if (!userId) return
    const since = new Date()
    since.setDate(since.getDate() - days)
    since.setHours(0, 0, 0, 0)
    const { data, error: e } = await supabase
      .from('water_logs')
      .select('id, amount_ml, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', since.toISOString())
      .order('logged_at', { ascending: false })
    if (e) {
      setError(true)
      setLoading(false)
      return
    }
    setLogs((data ?? []).map((r: any) => ({ id: r.id, amountMl: r.amount_ml, loggedAt: r.logged_at })))
    setError(false)
    setLoading(false)
  }, [userId, days])

  useEffect(() => {
    reload()
  }, [reload])

  // Një shtim në çast: prekjet e përsëritura gjatë ruajtjes injorohen (pa dublikime aksidentale).
  const add = useCallback(
    async (ml: number): Promise<AddResult> => {
      if (!userId || !Number.isFinite(ml) || ml < 10 || ml > 3000) return 'error'
      if (busy.current) return 'busy'
      busy.current = true
      const { error: e } = await supabase.from('water_logs').insert({ user_id: userId, amount_ml: Math.round(ml) })
      busy.current = false
      if (e) return 'error'
      await reload()
      return 'ok'
    },
    [userId, reload],
  )

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      if (!userId) return false
      const { error: e } = await supabase.from('water_logs').delete().eq('id', id).eq('user_id', userId)
      if (e) return false
      await reload()
      return true
    },
    [userId, reload],
  )

  // Totalet sipas ditës lokale (llogariten çdo herë, ndaj "sot" është gjithmonë i saktë).
  const byDay: Record<string, number> = {}
  for (const l of logs) {
    const key = localDayKey(new Date(l.loggedAt))
    byDay[key] = (byDay[key] ?? 0) + l.amountMl
  }
  const todayKey = localDayKey(new Date())
  const todayTotal = byDay[todayKey] ?? 0
  const todayLogs = logs.filter((l) => localDayKey(new Date(l.loggedAt)) === todayKey)

  return { logs, loading, error, reload, add, remove, byDay, todayTotal, todayLogs }
}
