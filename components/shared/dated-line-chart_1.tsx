'use client'

import { useId, useMemo, useState } from 'react'

export type DatedPoint = { date: number; value: number }

const W = 360
const H = 230
const PAD = { top: 34, right: 18, bottom: 30, left: 42 }
const DAY = 86400000

const dayStart = (ts: number) => {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const fmtShort = (ts: number, withYear: boolean) =>
  new Date(ts).toLocaleDateString('sq-AL', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: '2-digit' } : {}),
  })

// Shkallë "e bukur" për boshtin Y: hapa me numra të rrumbullakët (1, 2, 5, 10…).
function niceScale(min: number, max: number) {
  if (min === max) {
    min -= 1
    max += 1
  }
  const rough = (max - min) / 4
  const pow = Math.pow(10, Math.floor(Math.log10(rough)))
  const frac = rough / pow
  const step = (frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10) * pow
  const lo = Math.floor(min / step) * step
  const hi = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v / step) * step)
  return { lo, hi, step, ticks }
}

// Kurbë e lëmuar që nuk kalon kurrë mbi/nën pikat (pa "valë" të rreme).
function monotonePath(pts: { x: number; y: number }[]): string {
  const n = pts.length
  if (n < 2) return ''
  if (n === 2) return `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)} L${pts[1].x.toFixed(1)},${pts[1].y.toFixed(1)}`

  const dx: number[] = []
  const m: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1].x - pts[i].x
    m[i] = (pts[i + 1].y - pts[i].y) / dx[i]
  }
  const t: number[] = new Array(n)
  t[0] = m[0]
  t[n - 1] = m[n - 2]
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0
      t[i + 1] = 0
    } else {
      const a = t[i] / m[i]
      const b = t[i + 1] / m[i]
      const s = a * a + b * b
      if (s > 9) {
        const tau = 3 / Math.sqrt(s)
        t[i] = tau * a * m[i]
        t[i + 1] = tau * b * m[i]
      }
    }
  }

  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3
    d +=
      ` C${(pts[i].x + h).toFixed(1)},${(pts[i].y + t[i] * h).toFixed(1)}` +
      ` ${(pts[i + 1].x - h).toFixed(1)},${(pts[i + 1].y - t[i + 1] * h).toFixed(1)}` +
      ` ${pts[i + 1].x.toFixed(1)},${pts[i + 1].y.toFixed(1)}`
  }
  return d
}

// Grafiku i peshës: boshti X është koha reale, një pikë në ditë (matja e fundit e ditës).
export function DatedLineChart({ data, unit }: { data: DatedPoint[]; unit: string }) {
  const gid = useId().replace(/:/g, '')
  const [active, setActive] = useState<number | null>(null)

  const model = useMemo(() => {
    // 1) një pikë në ditë: shumë matje në të njëjtën ditë nuk bëjnë më vija vertikale
    const byDay = new Map<number, number>()
    for (const p of [...data].sort((a, b) => a.date - b.date)) byDay.set(dayStart(p.date), p.value)
    const pts = [...byDay.entries()].map(([t, v]) => ({ t, v }))
    if (pts.length < 2) return null

    const minX = pts[0].t
    const maxX = pts[pts.length - 1].t
    const spanX = maxX - minX
    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom

    // 2) boshti Y me numra të rrumbullakët dhe pak ajër sipër/poshtë
    const vals = pts.map((p) => p.v)
    const minV = Math.min(...vals)
    const maxV = Math.max(...vals)
    const pad = Math.max((maxV - minV) * 0.15, 0.5)
    const scale = niceScale(minV - pad, maxV + pad)

    const x = (t: number) => PAD.left + ((t - minX) / spanX) * innerW
    const y = (v: number) => PAD.top + (1 - (v - scale.lo) / (scale.hi - scale.lo)) * innerH

    const xy = pts.map((p) => ({ ...p, px: x(p.t), py: y(p.v) }))
    const line = monotonePath(xy.map((p) => ({ x: p.px, y: p.py })))
    const base = PAD.top + innerH
    const area = `${line} L${xy[xy.length - 1].px.toFixed(1)},${base} L${xy[0].px.toFixed(1)},${base} Z`

    // 3) datat e boshtit X: ditë të plota, të shpërndara njëtrajtësisht
    const withYear = spanX > 330 * DAY
    const spanDays = Math.round(spanX / DAY)
    const count = Math.min(5, spanDays + 1)
    const seen = new Set<string>()
    const xTicks: { px: number; label: string }[] = []
    for (let i = 0; i < count; i++) {
      const t = dayStart(minX + (spanX * i) / (count - 1))
      const label = fmtShort(t, withYear)
      if (seen.has(label)) continue
      seen.add(label)
      xTicks.push({ px: x(t), label })
    }

    const yDecimals = scale.step < 1 ? 1 : 0
    return { xy, line, area, base, scale, xTicks, withYear, yDecimals }
  }, [data])

  if (!model) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Regjistro peshën në të paktën dy ditë të ndryshme për të parë grafikun.
      </p>
    )
  }

  const idx = active ?? model.xy.length - 1
  const sel = model.xy[idx]
  const label = `${sel.v.toFixed(1)} ${unit} · ${fmtShort(sel.t, true)}`
  const pillW = label.length * 5.8 + 16
  const pillX = Math.min(Math.max(sel.px - pillW / 2, 2), W - pillW - 2)
  const pillY = Math.max(sel.py - 32, 2)

  function onPointer(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const vx = ((e.clientX - rect.left) / rect.width) * W
    let best = 0
    let bestDist = Infinity
    model!.xy.forEach((p, i) => {
      const d = Math.abs(p.px - vx)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    setActive(best)
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full select-none text-primary"
      style={{ touchAction: 'pan-y' }}
      role="img"
      aria-label={`Grafiku i peshës në ${unit}, një pikë për çdo ditë`}
      onPointerDown={onPointer}
      onPointerMove={onPointer}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setActive(null)
      }}
    >
      <defs>
        <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Rrjeta + vlerat e boshtit Y */}
      {model.scale.ticks.map((v) => {
        const py = PAD.top + (1 - (v - model.scale.lo) / (model.scale.hi - model.scale.lo)) * (H - PAD.top - PAD.bottom)
        return (
          <g key={v} className="text-muted-foreground">
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={py}
              y2={py}
              stroke="currentColor"
              strokeOpacity="0.18"
              strokeDasharray="3 4"
            />
            <text x={PAD.left - 8} y={py + 3.5} textAnchor="end" fontSize="10" fill="currentColor">
              {v.toFixed(model.yDecimals)}
            </text>
          </g>
        )
      })}

      {/* Datat e boshtit X */}
      {model.xTicks.map((t, i) => (
        <text
          key={t.label}
          x={t.px}
          y={H - 8}
          textAnchor={i === 0 ? 'start' : i === model.xTicks.length - 1 ? 'end' : 'middle'}
          fontSize="10"
          className="text-muted-foreground"
          fill="currentColor"
        >
          {t.label}
        </text>
      ))}

      {/* Zona + vija */}
      <path d={model.area} fill={`url(#fill-${gid})`} />
      <path d={model.line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Pikat (vetëm nëse nuk janë shumë) */}
      {model.xy.length <= 31 &&
        model.xy.map((p, i) => (
          <circle key={p.t} cx={p.px} cy={p.py} r={i === idx ? 0 : 3} fill="currentColor" />
        ))}

      {/* Pika e zgjedhur: vija vertikale + vlera */}
      <line
        x1={sel.px}
        x2={sel.px}
        y1={PAD.top - 4}
        y2={model.base}
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeDasharray="3 3"
      />
      <circle cx={sel.px} cy={sel.py} r="8" fill="currentColor" fillOpacity="0.2" />
      <circle cx={sel.px} cy={sel.py} r="4.5" fill="currentColor" />

      <g className="text-primary">
        <rect x={pillX} y={pillY} width={pillW} height="20" rx="10" fill="currentColor" />
      </g>
      <text
        x={pillX + pillW / 2}
        y={pillY + 13.5}
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        className="text-primary-foreground"
        fill="currentColor"
      >
        {label}
      </text>
    </svg>
  )
}
