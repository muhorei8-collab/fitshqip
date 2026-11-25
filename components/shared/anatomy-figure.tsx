'use client'

import { MUSCLE_LABELS, type MuscleId } from '@/lib/exercise-details'

// Diagram anatomike e skematizuar (vizatuar nga FitShqip, pa imazhe të jashtme): pamje e përparme dhe e pasme.
// Muskuli kryesor del me të kuqe, ndihmësit me portokalli. Zonat nuk janë një atlas mjekësor, por tregojnë qartë
// cilët grupe muskulore punojnë.

type Shape =
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number; rot?: number }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; r?: number }
  | { kind: 'path'; d: string }

type RegionMap = Partial<Record<MuscleId, Shape[]>>

const e = (cx: number, cy: number, rx: number, ry: number, rot = 0): Shape => ({ kind: 'ellipse', cx, cy, rx, ry, rot })

const FRONT: RegionMap = {
  traps_upper: [
    { kind: 'path', d: 'M92 54 L72 62 L84 68 L94 60 Z' },
    { kind: 'path', d: 'M108 54 L128 62 L116 68 L106 60 Z' },
  ],
  delt_front: [e(66, 74, 9, 11), e(134, 74, 9, 11)],
  delt_side: [e(55, 82, 7, 11), e(145, 82, 7, 11)],
  chest: [e(84, 96, 16, 13), e(116, 96, 16, 13)],
  biceps: [e(55, 98, 6.5, 18, 12), e(145, 98, 6.5, 18, -12)],
  forearms: [e(45, 160, 6.5, 18, 5), e(155, 160, 6.5, 18, -5)],
  core: [{ kind: 'rect', x: 89, y: 112, w: 22, h: 66, r: 10 }, e(78, 148, 6, 24), e(122, 148, 6, 24)],
  serratus: [e(74, 122, 4, 10), e(126, 122, 4, 10)],
  quads: [e(87, 248, 13, 38), e(113, 248, 13, 38)],
}

const BACK: RegionMap = {
  traps_upper: [{ kind: 'path', d: 'M100 52 L76 62 L88 80 L100 74 L112 80 L124 62 Z' }],
  traps_mid_lower: [{ kind: 'path', d: 'M88 80 L100 74 L112 80 L106 122 L100 130 L94 122 Z' }],
  rhomboids: [e(86, 98, 7, 10), e(114, 98, 7, 10)],
  rotator_cuff: [e(78, 90, 8, 8), e(122, 90, 8, 8)],
  delt_rear: [e(63, 76, 9, 11), e(137, 76, 9, 11)],
  delt_side: [e(54, 82, 6, 10), e(146, 82, 6, 10)],
  lats: [e(80, 134, 10, 30, -8), e(120, 134, 10, 30, 8)],
  triceps: [e(55, 100, 6.5, 18, 12), e(145, 100, 6.5, 18, -12)],
  forearms: [e(45, 160, 6.5, 18, 5), e(155, 160, 6.5, 18, -5)],
  lower_back: [{ kind: 'rect', x: 91, y: 150, w: 18, h: 38, r: 8 }],
  glutes: [e(88, 218, 15, 15), e(112, 218, 15, 15)],
  hamstrings: [e(87, 258, 12, 34), e(113, 258, 12, 34)],
  calves: [e(86, 330, 10, 26), e(114, 330, 10, 26)],
}

const PRIMARY_FILL = 'var(--primary)'
const SECONDARY_FILL = '#f59e0b'

function Limb({ a, b, w }: { a: [number, number]; b: [number, number]; w: number }) {
  return (
    <>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth={w + 2} strokeLinecap="round" style={{ stroke: 'var(--border)' }} />
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth={w} strokeLinecap="round" style={{ stroke: 'var(--secondary)' }} />
    </>
  )
}

function Silhouette() {
  return (
    <g>
      <Limb a={[62, 66]} b={[48, 130]} w={20} />
      <Limb a={[48, 130]} b={[42, 196]} w={15} />
      <Limb a={[138, 66]} b={[152, 130]} w={20} />
      <Limb a={[152, 130]} b={[158, 196]} w={15} />
      <Limb a={[88, 208]} b={[86, 288]} w={30} />
      <Limb a={[86, 288]} b={[86, 372]} w={22} />
      <Limb a={[112, 208]} b={[114, 288]} w={30} />
      <Limb a={[114, 288]} b={[114, 372]} w={22} />
      <path
        d="M64 62 Q100 52 136 62 L130 132 Q126 172 124 208 L76 208 Q74 172 70 132 Z"
        strokeWidth={1.5}
        style={{ fill: 'var(--secondary)', stroke: 'var(--border)' }}
      />
      <rect x={91} y={42} width={18} height={14} rx={5} style={{ fill: 'var(--secondary)', stroke: 'var(--border)' }} />
      <circle cx={100} cy={26} r={18} strokeWidth={1.5} style={{ fill: 'var(--secondary)', stroke: 'var(--border)' }} />
      <circle cx={41} cy={204} r={7} style={{ fill: 'var(--secondary)', stroke: 'var(--border)' }} />
      <circle cx={159} cy={204} r={7} style={{ fill: 'var(--secondary)', stroke: 'var(--border)' }} />
      <ellipse cx={84} cy={382} rx={12} ry={6} style={{ fill: 'var(--secondary)', stroke: 'var(--border)' }} />
      <ellipse cx={116} cy={382} rx={12} ry={6} style={{ fill: 'var(--secondary)', stroke: 'var(--border)' }} />
    </g>
  )
}

function renderShape(shape: Shape, key: string, fill: string, fillOpacity: number, stroke: string, strokeWidth: number) {
  const common = { fill, fillOpacity, stroke, strokeWidth }
  if (shape.kind === 'ellipse') {
    return (
      <ellipse
        key={key}
        cx={shape.cx}
        cy={shape.cy}
        rx={shape.rx}
        ry={shape.ry}
        transform={shape.rot ? `rotate(${shape.rot} ${shape.cx} ${shape.cy})` : undefined}
        {...common}
      />
    )
  }
  if (shape.kind === 'rect') {
    return <rect key={key} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.r ?? 0} {...common} />
  }
  return <path key={key} d={shape.d} {...common} />
}

function Body({ title, regions, primary, secondary }: { title: string; regions: RegionMap; primary: MuscleId[]; secondary: MuscleId[] }) {
  const ids = Object.keys(regions) as MuscleId[]
  const state = (id: MuscleId) => (primary.includes(id) ? 2 : secondary.includes(id) ? 1 : 0)
  // Së pari zonat jo-aktive, pastaj ndihmëset, në fund kryesoret (që të dalin sipër).
  const ordered = [...ids].sort((a, b) => state(a) - state(b))
  return (
    <figure className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 200 400" className="h-auto w-full max-w-[150px]" role="img" aria-label={`Diagram anatomik, ${title}`}>
        <Silhouette />
        {ordered.map((id) => {
          const st = state(id)
          const [fill, op, stroke, sw] =
            st === 2
              ? [PRIMARY_FILL, 0.95, PRIMARY_FILL, 1]
              : st === 1
                ? [SECONDARY_FILL, 0.75, SECONDARY_FILL, 1]
                : ['none', 0, 'var(--muted-foreground)', 0.6]
          return <g key={id}>{regions[id]!.map((s, i) => renderShape(s, `${id}-${i}`, fill as string, op as number, stroke as string, sw as number))}</g>
        })}
      </svg>
      <figcaption className="text-[11px] font-medium text-muted-foreground">{title}</figcaption>
    </figure>
  )
}

export function AnatomyFigure({ primary, secondary }: { primary: MuscleId[]; secondary: MuscleId[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-center gap-4">
        <Body title="Para" regions={FRONT} primary={primary} secondary={secondary} />
        <Body title="Prapa" regions={BACK} primary={primary} secondary={secondary} />
      </div>
      <div className="flex flex-col gap-1.5 text-sm">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: PRIMARY_FILL }} aria-hidden />
          <span className="font-semibold">Kryesor:</span>
          <span className="text-muted-foreground">{primary.map((m) => MUSCLE_LABELS[m]).join(', ') || '—'}</span>
        </p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: SECONDARY_FILL }} aria-hidden />
          <span className="font-semibold">Ndihmës:</span>
          <span className="text-muted-foreground">{secondary.map((m) => MUSCLE_LABELS[m]).join(', ') || '—'}</span>
        </p>
      </div>
    </div>
  )
}
