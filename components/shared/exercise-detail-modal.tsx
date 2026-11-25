'use client'

import { Modal } from '@/components/shared/ui'
import { AnatomyFigure } from '@/components/shared/anatomy-figure'
import { MovementFigure } from '@/components/shared/movement-figure'
import { GENERAL_SAFETY, getExerciseDetail } from '@/lib/exercise-details'
import { getExercise } from '@/lib/exercises'

const h = 'mb-1.5 text-xs font-semibold uppercase tracking-wide text-success'

const DELTOID_LABEL = {
  anterior: 'Deltoidi anterior',
  lateral: 'Deltoidi lateral',
  posterior: 'Deltoidi posterior',
} as const

// Faqja "Si bëhet": e njëjta për bibliotekën e klientit, ndërtuesin e rutinave dhe ndërtuesin e programeve të trajnerit.
export function ExerciseDetailModal({ name, onClose }: { name: string | null; onClose: () => void }) {
  const exercise = name ? getExercise(name) : undefined
  const detail = name ? getExerciseDetail(name) : undefined

  // Teksti bazë ndahet në udhëzim dhe "Fokus: ..." (muskuli në fokus).
  const [howTo, focus] = exercise ? exercise.instructions.split(/\s*Fokus:\s*/) : ['', '']

  return (
    <Modal open={!!name && !!exercise} onClose={onClose} title={detail?.sq ?? exercise?.name} size="lg">
      {exercise && (
        <div className="flex flex-col gap-5">
          <div>
            {detail && <p className="text-sm text-muted-foreground">{exercise.name}</p>}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {exercise.muscle}
              </span>
              {exercise.subgroup && (
                <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {exercise.subgroup}
                </span>
              )}
              {detail?.deltoid && !exercise.subgroup && (
                <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {DELTOID_LABEL[detail.deltoid]}
                </span>
              )}
            </div>
          </div>

          {detail ? (
            <>
              <section>
                <p className={h}>Muskujt që punojnë</p>
                <AnatomyFigure primary={detail.primary} secondary={detail.secondary} />
              </section>

              <section>
                <p className={h}>Demonstrimi i lëvizjes</p>
                {detail.demo ? (
                  <MovementFigure demo={detail.demo} equipment={detail.equipment} />
                ) : (
                  <p className="rounded-xl border border-dashed border-border px-3 py-3 text-center text-xs text-muted-foreground text-pretty">
                    Demonstrimi vizual i lëvizjes për këtë ushtrim është i paplotësuar. Ndiq hapat më poshtë.
                  </p>
                )}
              </section>

              <section>
                <p className={h}>Pajisjet</p>
                <div className="flex flex-wrap gap-1.5">
                  {detail.equipment.map((q) => (
                    <span key={q} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs">
                      {q}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <p className={h}>Pozicioni fillestar</p>
                <p className="text-sm leading-relaxed text-pretty">{detail.start}</p>
              </section>

              <section>
                <p className={h}>Ekzekutimi hap pas hapi</p>
                <ol className="flex flex-col gap-1.5">
                  {detail.steps.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-pretty">{s}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <section>
                <p className={h}>Frymëmarrja</p>
                <p className="text-sm leading-relaxed text-pretty">{detail.breathing}</p>
              </section>

              <section>
                <p className={h}>Gabimet më të zakonshme</p>
                <ul className="flex flex-col gap-1">
                  {detail.mistakes.map((m) => (
                    <li key={m} className="flex gap-2 text-sm leading-relaxed">
                      <span className="text-primary">✕</span>
                      <span className="text-pretty">{m}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <p className={h}>Këshilla sigurie dhe teknike</p>
                <ul className="flex flex-col gap-1">
                  {detail.tips.map((t) => (
                    <li key={t} className="flex gap-2 text-sm leading-relaxed">
                      <span className="text-success">✓</span>
                      <span className="text-pretty">{t}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground text-pretty">{GENERAL_SAFETY}</p>
              </section>
            </>
          ) : (
            <>
              <section>
                <p className={h}>Si të kryhet</p>
                <p className="text-sm leading-relaxed text-pretty">{howTo}</p>
              </section>
              {focus && (
                <section>
                  <p className={h}>Muskuli në fokus</p>
                  <p className="text-sm text-pretty">{focus.replace(/\.$/, '')}</p>
                </section>
              )}
              <p className="rounded-xl border border-dashed border-border px-3 py-3 text-xs text-muted-foreground text-pretty">
                Detajet e plota për këtë ushtrim (diagrami anatomik, demonstrimi i lëvizjes, frymëmarrja dhe gabimet) janë
                të paplotësuara dhe do të shtohen.
              </p>
              <p className="text-xs text-muted-foreground text-pretty">{GENERAL_SAFETY}</p>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
