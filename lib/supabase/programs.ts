'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Routine, RoutineExercise } from '@/lib/types'

export interface CoachProgram {
  id: string
  coachId: string
  clientId: string
  name: string
  description: string
  exercises: RoutineExercise[]
  version: number
  status: 'active' | 'archived'
  createdAt: string
}

export type AssignedProgram = CoachProgram & { coachName: string | null }

// Kodet që kthen assign_program → mesazhet në shqip.
export const PROGRAM_MESSAGES: Record<string, string> = {
  unauthorized: 'Duhet të hysh në llogari.',
  not_trainer: 'Vetëm trajnerët mund të caktojnë programe.',
  not_linked: 'Lidhja me klientin nuk është aktive.',
  invalid_text: 'Emri (deri 80 shkronja) ose përshkrimi (deri 200) nuk është i vlefshëm.',
  invalid_exercises: 'Ushtrimet e programit nuk janë të vlefshme (1–40 ushtrime, 1–20 seri secili).',
  not_found: 'Programi nuk u gjet ose është arkivuar tashmë.',
  too_many: 'Ky klient ka tashmë 20 programe aktive. Arkivo disa.',
}

function mapProgram(row: any): CoachProgram {
  return {
    id: row.id,
    coachId: row.coach_id,
    clientId: row.client_id,
    name: row.name,
    description: row.description ?? '',
    exercises: Array.isArray(row.exercises) ? row.exercises : [],
    version: row.version,
    status: row.status,
    createdAt: row.created_at,
  }
}

// Programi bëhet rutinë e zakonshme, që ta nisë stërvitja ekzistuese pa ndryshime.
export function programToRoutine(p: CoachProgram): Routine {
  return {
    id: p.id,
    ownerId: p.coachId,
    name: p.name,
    description: p.description || 'Program nga trajneri',
    exercises: p.exercises,
  }
}

// Për klientin: programet aktive që i ka caktuar trajneri (përditësohen live).
export function useAssignedPrograms(userId: string | undefined) {
  const [programs, setPrograms] = useState<AssignedProgram[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('coach_programs')
      .select('*')
      .eq('client_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    if (error) {
      setLoading(false)
      return
    }
    const rows = (data ?? []).map(mapProgram)
    const names = new Map<string, string>()
    const coachIds = [...new Set(rows.map((r) => r.coachId))]
    if (coachIds.length > 0) {
      const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', coachIds)
      profs?.forEach((p: any) => names.set(p.id, p.full_name))
    }
    setPrograms(rows.map((r) => ({ ...r, coachName: names.get(r.coachId) ?? null })))
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (!userId) return
    reload()
    const channel = supabase
      .channel(`assigned-programs-${userId}-${Math.random().toString(36).slice(2, 8)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coach_programs', filter: `client_id=eq.${userId}` },
        () => reload(),
      )
      .subscribe()
    const poll = setInterval(reload, 60000)
    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [userId, reload])

  return { programs, loading, reload }
}

// Për trajnerin: të gjitha programet (aktive dhe të arkivuara) që i ka caktuar një klienti.
export function useClientPrograms(coachId: string | undefined, clientId: string) {
  const [programs, setPrograms] = useState<CoachProgram[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!coachId) return
    const { data, error } = await supabase
      .from('coach_programs')
      .select('*')
      .eq('coach_id', coachId)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    if (!error) setPrograms((data ?? []).map(mapProgram))
    setLoading(false)
  }, [coachId, clientId])

  useEffect(() => {
    reload()
  }, [reload])

  return { programs, loading, reload }
}
