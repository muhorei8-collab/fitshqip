'use client'

import { useMemo } from 'react'

export type DatedPoint = { date: number; value: number }

const W = 340
const H = 200
const PAD = { top: 18, right: 14, bottom: 26, left: 40 }
const DAY = 86400000

function fmtDate(ts: number, withYear: boolean) {
  return new Date(ts).toLocaleDateString('sq-AL', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: '2-digit' } : {}),
  })
}

// Line chart whose X axis is real time: the gap between two points is
// proportional to the number of days between the two weigh-ins.
export function DatedLineChart({ data, unit }: { data: DatedPoint[]; unit: string }) {
  const chart = useMemo(() => {
    const pts = [...data].sort((a, b) => a.date - b.date)
    if (pts.length === 0) return null

    const minX = pts[0].date
    const maxX = pts[pts.length - 1].date
    const spanX = Math.max(maxX - minX, DAY)

    const vals = pts.map((p) => p.value)
    let minY = Math.min(...vals)
    let maxY = Math.max(...vals)
    const pad = Math.max((maxY - minY) * 0.15, 0.5)
    minY -= pad
    maxY += pad

    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom
    const x = (t: number) => PAD.left + ((t - minX) / spanX) * innerW
    const y = (v: number) => PAD.top + (1 - (v - minY) / (maxY - minY)) * innerH

    const xy = pts.map((p) => ({ ...p, px: x(p.date), py: y(p.value) }))
    const line = xy.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.px.toFixed(1)},${p.py.toFixed(1)}`).join(' ')
    const base = PAD.top + innerH
    const area = `${line} L${xy[xy.length - 1].px.toFixed(1)},${base} L${xy[0].px.toFixed(1)},${base} Z`

    const yTicks = Array.from({ length: 4 }, (_, i) => {
      const v = minY + ((maxY - minY) * i) / 3
      return { v, py: y(v) }
    })

    const withYear = spanX > 330 * DAY
    const tickCount = Math.min(4, Math.max(2, pts.length))
    const xTicks = Array.from({ length: tickCount }, (_, i) => {
      const t = minX + (spanX * i) / (tickCount - 1)
      return { label: fmtDate(t, withYear), px: x(t) }
    })

    return { xy, line, area, yTicks, xTicks, base }
  }, [data])

  if (!chart) return null
  const first = chart.xy[0]
  const last = chart.xy[chart.xy.length - 1]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full text-primary"
      role="img"
      aria-label={`Grafiku i peshës në ${unit}, sipas datave të regjistrimit`}
    >
      <defs>
        <linearGradient id="dated-line-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {chart.yTicks.map((t) => (
        <g key={t.v} className="text-muted-foreground">
          <line x1={PAD.left} x2={W - PAD.right} y1={t.py} y2={t.py} stroke="currentColor" strokeOpacity="0.15" />
          <text x={PAD.left - 6} y={t.py + 3} textAnchor="end" fontSize="9" fill="currentColor">
            {t.v.toFixed(1)}
          </text>
        </g>
      ))}

      {chart.xTicks.map((t, i) => (
        <text
          key={i}
          x={t.px}
          y={H - 8}
          textAnchor={i === 0 ? 'start' : i === chart.xTicks.length - 1 ? 'end' : 'middle'}
          fontSize="9"
          className="text-muted-foreground"
          fill="currentColor"
        >
          {t.label}
        </text>
      ))}

      {chart.xy.length > 1 && <path d={chart.area} fill="url(#dated-line-fill)" />}
      <path
        d={chart.line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {chart.xy.map((p, i) => (
        <circle key={i} cx={p.px} cy={p.py} r="3.5" fill="currentColor" className="text-primary">
          <title>
            {fmtDate(p.date, true)}: {p.value.toFixed(1)} {unit}
          </title>
        </circle>
      ))}

      <text x={first.px} y={first.py - 8} textAnchor="start" fontSize="10" fontWeight="600" fill="currentColor" className="text-foreground">
        {first.value.toFixed(1)}
      </text>
      {chart.xy.length > 1 && (
        <text x={last.px} y={last.py - 8} textAnchor="end" fontSize="10" fontWeight="600" fill="currentColor" className="text-foreground">
          {last.value.toFixed(1)}
        </text>
      )}
    </svg>
  )
}
