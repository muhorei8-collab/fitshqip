import type { WorkoutSession } from './types'
import { previousBest } from './storage'

// Rule-based, zero-cost fitness coach. All feedback in Albanian.

export interface SetFeedback {
  tone: 'success' | 'info' | 'primary'
  message: string
}

// Feedback shown when a set is completed, comparing to historical best.
export function feedbackForSet(
  sessions: WorkoutSession[],
  exerciseName: string,
  weight: number,
  reps: number,
): SetFeedback {
  const prev = previousBest(sessions, exerciseName)

  if (prev && weight > prev.weight) {
    const diff = Math.round((weight - prev.weight) * 10) / 10
    return {
      tone: 'success',
      message: `🔥 Bravo! Ngrite +${diff} kg më shumë te ${exerciseName} sot!`,
    }
  }
  if (prev && weight === prev.weight && reps > prev.reps) {
    return {
      tone: 'success',
      message: `💪 Fantastik! Bëre ${reps} përsëritje me të njëjtën peshë — force në rritje!`,
    }
  }
  if (reps >= 12) {
    return {
      tone: 'info',
      message: '💡 Këshillë: Mbaj 60-90s pushim për hipertrofi maksimale.',
    }
  }
  if (reps <= 5 && weight > 0) {
    return {
      tone: 'primary',
      message: '💡 Këshillë: Pesha të rënda, mbaj 2-3 min pushim për forcë maksimale.',
    }
  }
  return {
    tone: 'info',
    message: '✅ Seri e regjistruar. Vazhdo me të njëjtin ritëm!',
  }
}

// Recommended target weight for the next session (progressive overload).
export function recommendTarget(
  sessions: WorkoutSession[],
  exerciseName: string,
): number | null {
  const prev = previousBest(sessions, exerciseName)
  if (!prev) return null
  const increment = prev.weight >= 60 ? 5 : 2.5
  return Math.round((prev.weight + increment) * 2) / 2
}

// Motivational summary shown at the end of a workout.
export function feedbackForSession(
  session: WorkoutSession,
  history: WorkoutSession[],
): string {
  const prevSessions = history.filter((s) => s.id !== session.id)
  const prevVolume =
    prevSessions.length > 0
      ? prevSessions.reduce((t, s) => t + s.totalVolume, 0) / prevSessions.length
      : 0

  if (session.totalVolume > prevVolume && prevVolume > 0) {
    return `🚀 Vëllim total ${Math.round(session.totalVolume)} kg — mbi mesataren tënde! Progresi është i qartë.`
  }
  if (session.durationSec > 0 && session.durationSec < 25 * 60) {
    return '⚡ Stërvitje e shpejtë dhe efikase! Intensiteti ishte i lartë.'
  }
  return '👏 Punë e mirë sot! Konsistenca është çelësi i rezultateve.'
}

// A short daily tip rotated by day of week.
const TIPS = [
  '💧 Pi të paktën 2-3 litra ujë çdo ditë për recuperim optimal.',
  '😴 Gjumi 7-9 orë përmirëson rritjen e muskujve dhe forcën.',
  '🥩 Merr rreth 1.6-2.2 g proteinë për kg peshë trupore.',
  '📈 Rrit peshën gradualisht — mbingarkesa progresive sjell rezultate.',
  '🧘 Bëj ngrohje 5-10 min para stërvitjes për të shmangur dëmtimet.',
  '🔁 Ndrysho rutinën çdo 6-8 javë për të thyer platonë.',
  '🍽️ Ushqehu 1-2 orë para stërvitjes për energji maksimale.',
]

export function dailyTip(): string {
  return TIPS[new Date().getDay() % TIPS.length]
}
