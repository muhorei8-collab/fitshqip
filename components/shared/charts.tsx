'use client'

// Lightweight dependency-free SVG charts tuned for the FITSHQIP dark theme.

export function BarChart({
  data,
  height = 140,
}: {
  data: { label: string; value: number }[]
  height?: number
}) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((d, i) => {
        const h = (d.value / max) * (height - 26)
        const active = d.value > 0
        return (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground">
              {d.value > 0 ? Math.round(d.value) : ''}
            </span>
            <div
              className="w-full rounded-md"
              style={{
                height: Math.max(h, 4),
                backgroundColor: active ? 'var(--primary)' : 'var(--secondary)',
              }}
            />
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export function LineChart({
  data,
  height = 180,
  unit = 'kg',
}: {
  data: { label: string; value: number }[]
  height?: number
  unit?: string
}) {
  if (data.length === 0) return null
  const w = 320
  const padX = 8
  const padY = 20
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = (w - padX * 2) / Math.max(1, data.length - 1)

  const points = data.map((d, i) => {
    const x = padX + i * stepX
    const y = padY + (1 - (d.value - min) / range) * (height - padY * 2)
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${height - padY} L${points[0].x},${height - padY} Z`

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--success)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#lineFill)" />
        <path d={linePath} fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--success)" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>
          {min.toFixed(1)} {unit}
        </span>
        <span>
          {max.toFixed(1)} {unit}
        </span>
      </div>
    </div>
  )
}
