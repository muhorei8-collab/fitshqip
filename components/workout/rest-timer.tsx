'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play, SkipForward } from 'lucide-react'

// Plays a short beep using the Web Audio API (no asset needed).
function beep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
    setTimeout(() => ctx.close(), 600)
  } catch {
    // ignore audio errors
  }
}

export function RestTimer({
  initialSeconds,
  onClose,
}: {
  initialSeconds: number
  onClose: () => void
}) {
  const [total, setTotal] = useState(initialSeconds)
  const [remaining, setRemaining] = useState(initialSeconds)
  const [paused, setPaused] = useState(false)
  const doneRef = useRef(false)

  useEffect(() => {
    if (paused) return
    if (remaining <= 0) {
      if (!doneRef.current) {
        doneRef.current = true
        beep()
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([120, 60, 120])
        setTimeout(onClose, 500)
      }
      return
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining, paused, onClose])

  const pct = total > 0 ? (remaining / total) * 100 : 0
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  function adjust(delta: number) {
    setTotal((t) => Math.max(5, t + delta))
    setRemaining((r) => Math.max(1, r + delta))
    doneRef.current = false
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md px-6">
      <p className="mb-8 text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Pushim
      </p>

      <div className="relative flex h-56 w-56 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--secondary)" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - pct / 100)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="font-mono text-5xl font-bold tabular-nums">
          {mins}:{String(secs).padStart(2, '0')}
        </span>
      </div>

      <div className="mt-10 flex items-center gap-3">
        <button
          type="button"
          onClick={() => adjust(-15)}
          className="rounded-xl border border-border bg-card px-4 py-3 font-semibold"
        >
          -15s
        </button>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
          aria-label={paused ? 'Vazhdo' : 'Ndalo'}
        >
          {paused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
        </button>
        <button
          type="button"
          onClick={() => adjust(15)}
          className="rounded-xl border border-border bg-card px-4 py-3 font-semibold"
        >
          +15s
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-8 flex items-center gap-2 text-sm font-medium text-muted-foreground"
      >
        <SkipForward className="h-4 w-4" />
        Kalo pushimin
      </button>
    </div>
  )
}
