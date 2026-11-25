'use client'

import { useId } from 'react'
import type { DemoId } from '@/lib/exercise-details'

// Demonstrim i skematizuar i lëvizjes (figurë me vija, vizatuar nga FitShqip): pozicioni fillestar,
// pozicioni përfundimtar dhe shigjeta e drejtimit. Kjo NUK është foto ose video; shfaqet vetëm për
// ushtrimet ku modeli përputhet saktë me lëvizjen. Të tjerat shënohen si të paplotësuara.

type Pt = [number, number]
const rad = (d: number) => (d * Math.PI) / 180
const add = (p: Pt, len: number, deg: number): Pt => [p[0] + len * Math.cos(rad(deg)), p[1] - len * Math.sin(rad(deg))]
const mirror = (p: Pt): Pt => [160 - p[0], p[1]]

interface SidePose {
  hip: Pt
  torso: number
  upper: number
  fore: number
  thigh: number
  shank: number
}
interface FrontPose {
  elbow: Pt
  hand: Pt
}
type Load = 'barbell' | 'dumbbell' | 'plate' | 'band' | 'handle' | 'none'

const STAND = { hip: [80, 112] as Pt, torso: 90, thigh: 270, shank: 270 }
const SEATED = { hip: [62, 138] as Pt, torso: 90, thigh: 0, shank: 270 }

type DemoDef =
  | { view: 'side'; start: SidePose; end: SidePose; seat?: boolean; cable?: Pt }
  | { view: 'front'; start: FrontPose; end: FrontPose; bar?: boolean }

const DEMOS: Record<DemoId, DemoDef> = {
  press_standing: { view: 'side', start: { ...STAND, upper: 295, fore: 90 }, end: { ...STAND, upper: 88, fore: 90 } },
  press_seated: { view: 'side', seat: true, start: { ...SEATED, upper: 295, fore: 90 }, end: { ...SEATED, upper: 88, fore: 90 } },
  front_raise: { view: 'side', start: { ...STAND, upper: 270, fore: 270 }, end: { ...STAND, upper: 0, fore: 0 } },
  face_pull: { view: 'side', cable: [150, 64], start: { ...STAND, upper: 5, fore: 5 }, end: { ...STAND, upper: 165, fore: 35 } },
  lateral_raise: { view: 'front', start: { elbow: [57, 90], hand: [54, 114] }, end: { elbow: [38, 66], hand: [15, 70] } },
  upright_row: { view: 'front', bar: true, start: { elbow: [62, 90], hand: [72, 112] }, end: { elbow: [40, 62], hand: [72, 74] } },
}

function loadOf(equipment: string[]): Load {
  const t = equipment.join(' ').toLowerCase()
  if (t.includes('shufër') || t.includes('smith')) return 'barbell'
  if (t.includes('dumbell') || t.includes('kettlebell')) return 'dumbbell'
  if (t.includes('pllakë')) return 'plate'
  if (t.includes('elastik')) return 'band'
  if (t.includes('kabllo') || t.includes('makinë')) return 'handle'
  return 'none'
}

function sideJoints(p: SidePose) {
  const shoulder = add(p.hip, 48, p.torso)
  const head = add(shoulder, 17, p.torso)
  const elbow = add(shoulder, 26, p.upper)
  const hand = add(elbow, 24, p.fore)
  const knee = add(p.hip, 38, p.thigh)
  const ankle = add(knee, 38, p.shank)
  return { shoulder, head, elbow, hand, knee, ankle }
}

function Seg({ a, b, w = 5, color = 'currentColor' }: { a: Pt; b: Pt; w?: number; color?: string }) {
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeLinecap="round" />
}

function SideLoad({ load, hand }: { load: Load; hand: Pt }) {
  if (load === 'barbell') {
    return (
      <>
        <circle cx={hand[0]} cy={hand[1]} r={8} fill="none" stroke="currentColor" strokeWidth={2.5} />
        <circle cx={hand[0]} cy={hand[1]} r={1.8} fill="currentColor" />
      </>
    )
  }
  if (load === 'plate') return <circle cx={hand[0]} cy={hand[1]} r={9} fill="currentColor" fillOpacity={0.25} stroke="currentColor" strokeWidth={2} />
  if (load === 'dumbbell') return <rect x={hand[0] - 7} y={hand[1] - 3.5} width={14} height={7} rx={2} fill="currentColor" />
  if (load === 'handle') return <circle cx={hand[0]} cy={hand[1]} r={3.5} fill="currentColor" />
  return null
}

function SideFigure({ pose, load, def, ghost }: { pose: SidePose; load: Load; def: Extract<DemoDef, { view: 'side' }>; ghost?: boolean }) {
  const j = sideJoints(pose)
  return (
    <g opacity={ghost ? 0.22 : 1}>
      {def.seat && (
        <>
          <line x1={38} y1={142} x2={100} y2={142} stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeOpacity={0.5} />
          <line x1={55} y1={142} x2={55} y2={70} stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeOpacity={0.5} />
        </>
      )}
      <Seg a={pose.hip} b={j.knee} w={6} />
      <Seg a={j.knee} b={j.ankle} w={5} />
      <Seg a={j.ankle} b={[j.ankle[0] + 10, j.ankle[1]]} w={4} />
      <Seg a={pose.hip} b={j.shoulder} w={8} />
      <circle cx={j.head[0]} cy={j.head[1]} r={9} fill="none" stroke="currentColor" strokeWidth={3} />
      <Seg a={j.shoulder} b={j.elbow} color="var(--primary)" w={6} />
      <Seg a={j.elbow} b={j.hand} color="var(--primary)" w={5} />
      {def.cable && (
        <line
          x1={j.hand[0]}
          y1={j.hand[1]}
          x2={def.cable[0]}
          y2={def.cable[1]}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeOpacity={0.6}
          strokeDasharray={load === 'band' ? '3 3' : undefined}
        />
      )}
      {load === 'band' && !def.cable && (
        <line x1={j.hand[0]} y1={j.hand[1]} x2={80} y2={188} stroke="currentColor" strokeWidth={1.5} strokeDasharray="3 3" strokeOpacity={0.7} />
      )}
      <SideLoad load={load} hand={j.hand} />
    </g>
  )
}

function FrontFigure({ pose, load, bar, ghost }: { pose: FrontPose; load: Load; bar?: boolean; ghost?: boolean }) {
  const sl: Pt = [62, 64]
  const sr: Pt = [98, 64]
  const er = mirror(pose.elbow)
  const hr = mirror(pose.hand)
  return (
    <g opacity={ghost ? 0.22 : 1}>
      <Seg a={[72, 112]} b={[72, 150]} w={6} />
      <Seg a={[72, 150]} b={[72, 186]} w={5} />
      <Seg a={[88, 112]} b={[88, 150]} w={6} />
      <Seg a={[88, 150]} b={[88, 186]} w={5} />
      <Seg a={[72, 112]} b={[88, 112]} w={6} />
      <Seg a={[80, 64]} b={[80, 112]} w={10} />
      <Seg a={sl} b={sr} w={7} />
      <circle cx={80} cy={46} r={9} fill="none" stroke="currentColor" strokeWidth={3} />
      <Seg a={sl} b={pose.elbow} color="var(--primary)" w={6} />
      <Seg a={pose.elbow} b={pose.hand} color="var(--primary)" w={5} />
      <Seg a={sr} b={er} color="var(--primary)" w={6} />
      <Seg a={er} b={hr} color="var(--primary)" w={5} />
      {bar && <line x1={pose.hand[0] - 6} y1={pose.hand[1]} x2={hr[0] + 6} y2={hr[1]} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />}
      {load === 'dumbbell' && (
        <>
          <rect x={pose.hand[0] - 5} y={pose.hand[1] - 3.5} width={10} height={7} rx={2} fill="currentColor" />
          <rect x={hr[0] - 5} y={hr[1] - 3.5} width={10} height={7} rx={2} fill="currentColor" />
        </>
      )}
      {load === 'handle' && (
        <>
          <circle cx={pose.hand[0]} cy={pose.hand[1]} r={3.5} fill="currentColor" />
          <circle cx={hr[0]} cy={hr[1]} r={3.5} fill="currentColor" />
        </>
      )}
      {load === 'band' && (
        <>
          <line x1={pose.hand[0]} y1={pose.hand[1]} x2={80} y2={188} stroke="currentColor" strokeWidth={1.5} strokeDasharray="3 3" strokeOpacity={0.7} />
          <line x1={hr[0]} y1={hr[1]} x2={80} y2={188} stroke="currentColor" strokeWidth={1.5} strokeDasharray="3 3" strokeOpacity={0.7} />
        </>
      )}
    </g>
  )
}

function Arrow({ from, to, uid }: { from: Pt; to: Pt; uid: string }) {
  const mx = (from[0] + to[0]) / 2
  const my = (from[1] + to[1]) / 2
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.hypot(dx, dy) || 1
  const cx = mx + (dy / len) * 16
  const cy = my - (dx / len) * 16
  return (
    <path
      d={`M${from[0].toFixed(1)} ${from[1].toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${to[0].toFixed(1)} ${to[1].toFixed(1)}`}
      fill="none"
      stroke="var(--primary)"
      strokeWidth={2}
      strokeDasharray="4 3"
      markerEnd={`url(#${uid})`}
    />
  )
}

export function MovementFigure({ demo, equipment }: { demo: DemoId; equipment: string[] }) {
  const uid = `arrow-${useId().replace(/:/g, '')}`
  const def = DEMOS[demo]
  const load = loadOf(equipment)

  const Defs = (
    <defs>
      <marker id={uid} markerWidth={8} markerHeight={8} refX={6} refY={4} orient="auto">
        <path d="M0 0 L8 4 L0 8 Z" fill="var(--primary)" />
      </marker>
    </defs>
  )

  const panel = (kind: 'start' | 'end') => {
    if (def.view === 'side') {
      const startJ = sideJoints(def.start)
      const endJ = sideJoints(def.end)
      return (
        <svg viewBox="0 0 160 200" className="h-auto w-full" role="img" aria-label={kind === 'start' ? 'Pozicioni fillestar' : 'Pozicioni përfundimtar'}>
          {Defs}
          <line x1={10} y1={190} x2={150} y2={190} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1.5} />
          {kind === 'end' && <SideFigure pose={def.start} load={load} def={def} ghost />}
          <SideFigure pose={kind === 'start' ? def.start : def.end} load={load} def={def} />
          {kind === 'end' && <Arrow from={startJ.hand} to={endJ.hand} uid={uid} />}
        </svg>
      )
    }
    return (
      <svg viewBox="0 0 160 200" className="h-auto w-full" role="img" aria-label={kind === 'start' ? 'Pozicioni fillestar' : 'Pozicioni përfundimtar'}>
        {Defs}
        <line x1={10} y1={190} x2={150} y2={190} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1.5} />
        {kind === 'end' && <FrontFigure pose={def.start} load={load} bar={def.bar} ghost />}
        <FrontFigure pose={kind === 'start' ? def.start : def.end} load={load} bar={def.bar} />
        {kind === 'end' && (
          <>
            <Arrow from={def.start.hand} to={def.end.hand} uid={uid} />
            <Arrow from={mirror(def.start.hand)} to={mirror(def.end.hand)} uid={uid} />
          </>
        )}
      </svg>
    )
  }

  return (
    <div className="flex flex-col gap-2 text-foreground">
      <div className="grid grid-cols-2 gap-3">
        {(['start', 'end'] as const).map((k) => (
          <figure key={k} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-background p-2">
            {panel(k)}
            <figcaption className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {k === 'start' ? 'Fillimi' : 'Fundi'}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="text-center text-[11px] text-muted-foreground text-pretty">
        Skemë e thjeshtuar: krahu që lëviz është me të kuqe, shigjeta tregon drejtimin.
      </p>
    </div>
  )
}
