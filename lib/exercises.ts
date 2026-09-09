import type { Exercise, Routine } from './types'

export const MUSCLE_GROUPS = [
  'Gjoks',
  'Shpinë',
  'Shpatulla',
  'Biceps',
  'Triceps',
  'Këmbë',
  'Bark',
  'Kardio',
  'Trapez',
  'Parakrah',
] as const

export const EXERCISES: Exercise[] = [
  // Gjoks
  {
    name: 'Bench Press me Shufër',
    muscle: 'Gjoks',
    instructions:
      'Shtrihu në stol, mbaj shufrën pak më gjerë se supet. Ule ngadalë deri te gjoksi, pastaj shtyje lart duke mbajtur bërrylat nën 45°.',
  },
  {
    name: 'Bench Press me Dumbells',
    muscle: 'Gjoks',
    instructions:
      'Mbaj një dumbell në çdo dorë mbi gjoks. Ule kontrolluar deri sa të ndjesh shtrirjen, pastaj shtyji lart pa i përplasur.',
  },
  {
    name: 'Incline Bench Press',
    muscle: 'Gjoks',
    instructions:
      'Vendos stolin në 30-45°. Shtyji peshën lart për të targetuar pjesën e sipërme të gjoksit.',
  },
  {
    name: 'Chest Fly',
    muscle: 'Gjoks',
    instructions:
      'Me krahë pak të përkulur, hap krahët anash deri te niveli i gjoksit, pastaj mbylli sikur po përqafon.',
  },
  {
    name: 'Push Up',
    muscle: 'Gjoks',
    instructions:
      'Trupi drejt si dërrasë, ule gjoksin afër dyshemesë dhe shtyje lart. Mbaj barkun të shtrënguar.',
  },
  // Shpinë
  {
    name: 'Deadlift',
    muscle: 'Shpinë',
    instructions:
      'Këmbët sa gjerësia e ijeve, shpina drejt. Ngri shufrën duke shtyrë me këmbë dhe duke drejtuar ijet, jo me shpinë të kërrusur.',
  },
  {
    name: 'Pull Up',
    muscle: 'Shpinë',
    instructions:
      'Kap shufrën më gjerë se supet, tërhiq trupin lart derisa mjekra kalon shufrën, pastaj ule kontrolluar.',
  },
  {
    name: 'Barbell Row',
    muscle: 'Shpinë',
    instructions:
      'Përkul trupin nga ijet, shpina drejt. Tërhiq shufrën drejt barkut duke shtrënguar shpatullat.',
  },
  {
    name: 'Lat Pulldown',
    muscle: 'Shpinë',
    instructions:
      'Ulur, tërhiq shufrën drejt gjoksit të sipërm duke ulur shpatullat poshtë dhe prapa.',
  },
  {
    name: 'Seated Cable Row',
    muscle: 'Shpinë',
    instructions:
      'Ulur me shpinë drejt, tërhiq dorezën drejt barkut duke shtrydhur shpatullat së bashku.',
  },
  // Shpatulla
  {
    name: 'Overhead Press',
    muscle: 'Shpatulla',
    instructions:
      'Në këmbë, shtyji shufrën mbi kokë derisa krahët drejtohen. Mbaj barkun të fortë për stabilitet.',
  },
  {
    name: 'Lateral Raise',
    muscle: 'Shpatulla',
    instructions:
      'Ngri dumbellët anash deri në nivelin e supeve, me bërrylat pak të përkulur. Ule ngadalë.',
  },
  {
    name: 'Front Raise',
    muscle: 'Shpatulla',
    instructions: 'Ngri peshën përpara deri te niveli i supeve, pastaj ule kontrolluar.',
  },
  {
    name: 'Face Pull',
    muscle: 'Shpatulla',
    instructions:
      'Tërhiq litarin drejt fytyrës duke hapur krahët, i mirë për shëndetin e shpatullave.',
  },
  // Biceps
  {
    name: 'Barbell Curl',
    muscle: 'Biceps',
    instructions:
      'Mbaj shufrën me pëllëmbë lart, përkul krahët duke mbajtur bërrylat pranë trupit.',
  },
  {
    name: 'Dumbbell Curl',
    muscle: 'Biceps',
    instructions: 'Përkul dumbellët një nga një ose bashkë, shtrydh biceps-in në krye.',
  },
  {
    name: 'Hammer Curl',
    muscle: 'Biceps',
    instructions: 'Mbaj dumbellët neutral (pëllëmbët përballë), përkul lart. Punon edhe parakrahun.',
  },
  // Triceps
  {
    name: 'Tricep Pushdown',
    muscle: 'Triceps',
    instructions: 'Shtyji litarin poshtë duke drejtuar krahët plotësisht, mbaj bërrylat fiksuar.',
  },
  {
    name: 'Skull Crusher',
    muscle: 'Triceps',
    instructions: 'Shtrirë, ule shufrën drejt ballit duke përkulur vetëm bërrylat, pastaj drejto.',
  },
  {
    name: 'Dips',
    muscle: 'Triceps',
    instructions: 'Mbështetur në shufra paralele, ule trupin dhe shtyje lart duke aktivizuar triceps-in.',
  },
  // Këmbë
  {
    name: 'Squat me Shufër',
    muscle: 'Këmbë',
    instructions:
      'Shufra mbi trapez, këmbët sa supet. Ulu sikur do ulesh në karrige derisa kofshët të jenë paralele, pastaj ngrihu.',
  },
  {
    name: 'Leg Press',
    muscle: 'Këmbë',
    instructions: 'Shtyji platformën me këmbë pa i mbyllur plotësisht gjunjët në krye.',
  },
  {
    name: 'Romanian Deadlift',
    muscle: 'Këmbë',
    instructions: 'Ule shufrën përgjatë këmbëve duke shtyrë ijet prapa, ndjej shtrirjen te hamstring-et.',
  },
  {
    name: 'Lunges',
    muscle: 'Këmbë',
    instructions: 'Hidh një hap përpara dhe ule gjurin e pasmë drejt dyshemesë, pastaj kthehu.',
  },
  {
    name: 'Leg Curl',
    muscle: 'Këmbë',
    instructions: 'Përkul këmbët kundër rezistencës për të punuar hamstring-et.',
  },
  {
    name: 'Calf Raise',
    muscle: 'Këmbë',
    instructions: 'Ngrihu në majë të gishtave sa më lart, pastaj ule ngadalë për të punuar pulpat.',
  },
  // Bark
  {
    name: 'Plank',
    muscle: 'Bark',
    instructions: 'Mbaj trupin drejt në bërryla, shtrëngo barkun. Regjistro sekondat si përsëritje.',
  },
  {
    name: 'Crunches',
    muscle: 'Bark',
    instructions: 'Shtrirë, ngri shpatullat drejt gjunjëve duke shtrënguar barkun.',
  },
  {
    name: 'Hanging Leg Raise',
    muscle: 'Bark',
    instructions: 'Varur në shufër, ngri këmbët drejt lart pa u lëkundur.',
  },
  // Kardio
  {
    name: 'Vrapim në Rutinë',
    muscle: 'Kardio',
    instructions: 'Ruaj ritëm të qëndrueshëm. Regjistro minutat te përsëritjet dhe shpejtësinë te pesha.',
  },
  {
    name: 'Biçikletë Statike',
    muscle: 'Kardio',
    instructions: 'Pedalim i vazhdueshëm me rezistencë të moderuar për djegie kalorish.',
  },
  {
    name: 'Kërcim me Litar',
    muscle: 'Kardio',
    instructions: 'Kërce lehtë mbi majat e gishtave duke rrotulluar litarin me kyçet.',
  },
  // Trapez
  {
    name: 'Barbell Shrug',
    muscle: 'Trapez',
    instructions: 'Ngri supet drejt veshëve me shufër në duar, mbaj një sekondë, pastaj ule.',
  },
  {
    name: 'Dumbbell Shrug',
    muscle: 'Trapez',
    instructions: 'Me dumbellë anash, ngri supet lart dhe shtrydh trapezin.',
  },
  // Parakrah
  {
    name: 'Wrist Curl',
    muscle: 'Parakrah',
    instructions: 'Ulur, mbështet parakrahët, përkul vetëm kyçet për të punuar parakrahun.',
  },
  {
    name: 'Reverse Curl',
    muscle: 'Parakrah',
    instructions: 'Curl me pëllëmbë poshtë për të targetuar pjesën e sipërme të parakrahut.',
  },
]

export function getExercise(name: string): Exercise | undefined {
  return EXERCISES.find((e) => e.name === name)
}

export const SYSTEM_ROUTINES: Routine[] = [
  {
    id: 'sys-push',
    ownerId: 'system',
    name: 'Push - Gjoks & Supa',
    description: 'Gjoks, shpatulla dhe triceps',
    exercises: [
      { name: 'Bench Press me Shufër', muscle: 'Gjoks', targetSets: 4 },
      { name: 'Incline Bench Press', muscle: 'Gjoks', targetSets: 3 },
      { name: 'Overhead Press', muscle: 'Shpatulla', targetSets: 3 },
      { name: 'Lateral Raise', muscle: 'Shpatulla', targetSets: 3 },
      { name: 'Tricep Pushdown', muscle: 'Triceps', targetSets: 3 },
    ],
  },
  {
    id: 'sys-pull',
    ownerId: 'system',
    name: 'Pull - Shpinë & Biceps',
    description: 'Shpinë, trapez dhe biceps',
    exercises: [
      { name: 'Deadlift', muscle: 'Shpinë', targetSets: 4 },
      { name: 'Pull Up', muscle: 'Shpinë', targetSets: 3 },
      { name: 'Barbell Row', muscle: 'Shpinë', targetSets: 3 },
      { name: 'Barbell Shrug', muscle: 'Trapez', targetSets: 3 },
      { name: 'Barbell Curl', muscle: 'Biceps', targetSets: 3 },
    ],
  },
  {
    id: 'sys-legs',
    ownerId: 'system',
    name: 'Leg Day',
    description: 'Këmbë të plota dhe bark',
    exercises: [
      { name: 'Squat me Shufër', muscle: 'Këmbë', targetSets: 4 },
      { name: 'Romanian Deadlift', muscle: 'Këmbë', targetSets: 3 },
      { name: 'Leg Press', muscle: 'Këmbë', targetSets: 3 },
      { name: 'Calf Raise', muscle: 'Këmbë', targetSets: 4 },
      { name: 'Plank', muscle: 'Bark', targetSets: 3 },
    ],
  },
]
