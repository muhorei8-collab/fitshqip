// Detajet e faqes "Si bëhet". Burimi i përbashkët për bibliotekën e klientit, ndërtuesin e rutinave
// dhe ndërtuesin e programeve të trajnerit. Ushtrimet që nuk kanë hyrje këtu shfaqen me tekstin e tyre
// bazë dhe shënohen "detajet e plota: të paplotësuara" (nuk shpikim detaje).

export type MuscleId =
  | 'delt_front'
  | 'delt_side'
  | 'delt_rear'
  | 'traps_upper'
  | 'traps_mid_lower'
  | 'rhomboids'
  | 'rotator_cuff'
  | 'chest'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'serratus'
  | 'lats'
  | 'lower_back'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'

export type DemoId = 'press_standing' | 'press_seated' | 'lateral_raise' | 'front_raise' | 'upright_row' | 'face_pull'
export type PatternId = 'press' | 'lateral' | 'front' | 'rear' | 'facepull' | 'upright' | 'rotation' | 'carry' | 'bodyweight' | 'olympic'

export const MUSCLE_LABELS: Record<MuscleId, string> = {
  delt_front: 'Deltoidi anterior',
  delt_side: 'Deltoidi lateral',
  delt_rear: 'Deltoidi posterior',
  traps_upper: 'Trapezi i sipërm',
  traps_mid_lower: 'Trapezi i mesëm dhe i poshtëm',
  rhomboids: 'Rombojdet (shpina e mesme)',
  rotator_cuff: 'Rrotatorët e shpatullës',
  chest: 'Gjoksi',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Parakrahu',
  core: 'Bërthama (barku)',
  serratus: 'Serratus',
  lats: 'Latissimus (krahu i gjerë)',
  lower_back: 'Shpina e poshtme',
  glutes: 'Gluteus',
  quads: 'Kuadriceps',
  hamstrings: 'Hamstring',
  calves: 'Pulpat',
}

export interface ExerciseDetail {
  sq: string // emri në shqip
  pattern: PatternId
  demo?: DemoId // modeli i demonstrimit të lëvizjes (nëse ka)
  equipment: string[]
  primary: MuscleId[]
  secondary: MuscleId[]
  deltoid?: 'anterior' | 'lateral' | 'posterior'
  start: string
  steps: string[]
  breathing?: string
  mistakes?: string[]
  tips?: string[]
}

interface PatternDefaults {
  breathing: string
  mistakes: string[]
  tips: string[]
}

const CALM_BREATHING = 'Frymëmarrje e qetë dhe e vazhdueshme. Mos e mbaj frymën gjatë lëvizjes.'
const PUSH_BREATHING = 'Thith para se të nisësh, nxirr gjatë përpjekjes (forcës) dhe thith ndërsa kthehesh ngadalë.'

export const PATTERNS: Record<PatternId, PatternDefaults> = {
  press: {
    breathing: PUSH_BREATHING,
    mistakes: [
      'Përkulja e shpinës së poshtme prapa gjatë shtyrjes',
      'Përplasja e peshave në krye ose ulja pa kontroll',
      'Peshë shumë e rëndë që e prish teknikën',
    ],
    tips: ['Shtrëngo barkun dhe gluteus-in për stabilitet', 'Mbaj parakrahët afër vertikales', 'Zgjidh peshë që e kontrollon gjatë gjithë lëvizjes'],
  },
  lateral: {
    breathing: PUSH_BREATHING,
    mistakes: [
      'Ngritja me impuls dhe lëkundje të trupit',
      'Ngritja e supeve drejt veshëve',
      'Ngritja shumë mbi nivelin e supeve me peshë të rëndë',
    ],
    tips: ['Përdor peshë të lehtë dhe kontrollo uljen', 'Udhëhiq lëvizjen me bërrylat, jo me duart', 'Mbaj bërrylat pak të përkulur'],
  },
  front: {
    breathing: PUSH_BREATHING,
    mistakes: ['Lëkundja e trupit për ta ngritur peshën', 'Ngritja mbi nivelin e supeve', 'Peshë shumë e rëndë me bërryla të mbyllur plotësisht'],
    tips: ['Mbaj barkun të shtrënguar dhe shpinën të drejtë', 'Ule ngadalë, më ngadalë se sa e ngre', 'Mos e ngre mbi nivelin e supit'],
  },
  rear: {
    breathing: PUSH_BREATHING,
    mistakes: ['Rrumbullakosja e shpinës', 'Tërheqja me shpinën në vend të shpatullës së pasme', 'Impuls dhe peshë shumë e rëndë'],
    tips: ['Mbaj gjoksin dhe shpinën të drejtë', 'Shtrëngo shpatullat pa i ngritur drejt veshëve', 'Peshë e lehtë dhe përsëritje të kontrolluara'],
  },
  facepull: {
    breathing: PUSH_BREATHING,
    mistakes: ['Tërheqja me shpinë të kërrusur ose duke u mbështetur prapa', 'Bërryla poshtë nivelit të duarve', 'Peshë shumë e rëndë'],
    tips: ['Bërrylat të mbeten më lart se duart', 'Shtrëngo shpatullat prapa në fund', 'Lëvizje e ngadaltë dhe e kontrolluar'],
  },
  upright: {
    breathing: PUSH_BREATHING,
    mistakes: ['Ngritja e bërrylave shumë mbi nivelin e supeve', 'Peshë shumë e rëndë që ngre supet drejt veshëve', 'Lëkundja e trupit për ta ndihmuar peshën'],
    tips: ['Ngrije peshën afër trupit', 'Ndalo kur bërrylat arrijnë nivelin e supeve', 'Nëse ndjen dhimbje te shpatulla, zgjidh një ushtrim tjetër'],
  },
  rotation: {
    breathing: CALM_BREATHING,
    mistakes: ['Peshë shumë e rëndë', 'Largimi i bërrylit nga trupi', 'Lëvizje të shpejta'],
    tips: ['Përdor peshë shumë të lehtë', 'Vendos një peshqir mes bërrylit dhe ijes për ta mbajtur afër', 'Lëvizje e ngadaltë dhe e kontrolluar'],
  },
  carry: {
    breathing: CALM_BREATHING,
    mistakes: ['Animi i trupit ose përkulja e shpinës', 'Lëvizje shumë të shpejta ose pa kontroll', 'Peshë shumë e rëndë'],
    tips: ['Shtrëngo barkun dhe mbaj shpinën të drejtë', 'Fillo me peshë të lehtë', 'Mbaj shpatullat larg veshëve'],
  },
  bodyweight: {
    breathing: PUSH_BREATHING,
    mistakes: ['Përkulja e shpinës së poshtme', 'Lëvizje shumë të shpejta ose të pakontrolluara', 'Fillimi pa mjaftueshëm forcë në shpatulla dhe kyçe'],
    tips: ['Mbaj barkun të shtrënguar', 'Fillo me version më të lehtë nëse nuk e kontrollon lëvizjen', 'Ngroh kyçet e dorës para se të nisësh'],
  },
  olympic: {
    breathing: 'Thith para ngritjes, mbaje pak frymën për stabilitet gjatë fazës së shpejtë dhe nxirr kur peshën e ke të stabilizuar.',
    mistakes: ['Ngritja me krahë në vend që të punojnë ijet', 'Përkulja e shpinës gjatë ngritjes nga dyshemeja', 'Peshë shumë e rëndë para se teknika të jetë e rregullt'],
    tips: ['Fillo me peshë të lehtë dhe mëso lëvizjen', 'Mbaje peshën afër trupit', 'Mundësisht mësoje me një trajner'],
  },
}

// Njoftim i përgjithshëm sigurie për çdo ushtrim.
export const GENERAL_SAFETY =
  'Udhëzimet janë të përgjithshme. Nëse ndjen dhimbje (jo lodhje muskulore), ndalo dhe konsultohu me një trajner ose specialist.'

type Opts = {
  demo?: DemoId
  deltoid?: ExerciseDetail['deltoid']
  mistakes?: string[]
  tips?: string[]
  breathing?: string
}

const D = (
  pattern: PatternId,
  sq: string,
  equipment: string[],
  primary: MuscleId[],
  secondary: MuscleId[],
  start: string,
  steps: string[],
  opts: Opts = {},
): ExerciseDetail => ({ pattern, sq, equipment, primary, secondary, start, steps, ...opts })

const ANT = 'anterior' as const
const LAT = 'lateral' as const
const POS = 'posterior' as const

const DETAILS: Record<string, ExerciseDetail> = {
  // ===== Shpatulla (ekzistuese, 24) =====
  'Overhead Press': D('press', 'Shtyrje mbi kokë me shufër', ['Shufër'], ['delt_front'], ['delt_side', 'triceps', 'traps_upper', 'core'],
    'Në këmbë me këmbët sa ijet, shufra në nivel supesh, duart pak më gjerë se supet.',
    ['Shtrëngo barkun dhe gluteus-in dhe shtyje shufrën drejt lart.', 'Kur krahët drejtohen, kalo kokën pak përpara shufrës.', 'Ule kontrolluar në nivel supesh dhe përsërit.'],
    { demo: 'press_standing', deltoid: ANT }),
  'Lateral Raise': D('lateral', 'Ngritje anash me dumbell', ['Dumbell'], ['delt_side'], ['traps_upper', 'rotator_cuff'],
    'Në këmbë me dumbell anash trupit, bërryla pak të përkulur.',
    ['Ngri krahët anash deri në nivelin e supeve.', 'Mbaj një çast në krye pa ngritur supet.', 'Ule ngadalë dhe me kontroll.'],
    { demo: 'lateral_raise', deltoid: LAT }),
  'Front Raise': D('front', 'Ngritje përpara', ['Dumbell', 'Pllakë'], ['delt_front'], ['delt_side', 'chest', 'serratus'],
    'Në këmbë me peshën para kofshëve, krahë të shtrirë.',
    ['Ngri krahët përpara deri në nivelin e supeve.', 'Mos lëkund trupin për ta ndihmuar peshën.', 'Ule kontrolluar.'],
    { demo: 'front_raise', deltoid: ANT }),
  'Face Pull': D('facepull', 'Tërheqje drejt fytyrës (face pull)', ['Kabllo me litar'], ['delt_rear'], ['rhomboids', 'traps_mid_lower', 'rotator_cuff'],
    'Kabllo në nivel fytyre, litari në duar, hap prapa që kablloja të tendoset.',
    ['Tërhiq litarin drejt fytyrës duke hapur bërrylat anash.', 'Shtrëngo shpatullat prapa në fund.', 'Kthehu ngadalë.'],
    { demo: 'face_pull', deltoid: POS }),
  'Dumbbell Shoulder Press': D('press', 'Shtyrje mbi kokë me dumbell', ['Dumbell'], ['delt_front'], ['delt_side', 'triceps', 'traps_upper'],
    'Ulur ose në këmbë me dumbell në nivel veshësh, pëllëmbë përpara.',
    ['Shtyji dumbellët lart derisa krahët drejtohen.', 'Mos i përplas në krye.', 'Ulji kontrolluar në nivel veshësh.'],
    { demo: 'press_standing', deltoid: ANT }),
  'Arnold Press': D('press', 'Shtyrje Arnold', ['Dumbell'], ['delt_front'], ['delt_side', 'triceps'],
    'Dumbellët para gjoksit me pëllëmbë nga ti, bërryla poshtë.',
    ['Shtyji lart duke rrotulluar pëllëmbët përpara.', 'Mbyll krahët mbi kokë.', 'Kthehu me rrotullim të kundërt deri para gjoksit.'],
    { deltoid: ANT }),
  'Military Press': D('press', 'Shtyrje ushtarake me shufër', ['Shufër'], ['delt_front'], ['delt_side', 'triceps', 'core'],
    'Në këmbë me këmbët së bashku, shufra në gjoks.',
    ['Shtyje shufrën lart pa u përkulur prapa.', 'Mbaj gluteus-in dhe barkun të shtrënguar.', 'Ule te gjoksi me kontroll.'],
    { demo: 'press_standing', deltoid: ANT }),
  'Smith Machine Shoulder Press': D('press', 'Shtyrje mbi kokë në Smith machine', ['Smith machine', 'Stol'], ['delt_front'], ['delt_side', 'triceps'],
    'Ulur nën shufër me shpinë të mbështetur, duart pak më gjerë se supet.',
    ['Zgjidhe shufrën dhe shtyje lart.', 'Ule te mjekra me kontroll.', 'Mbaje shpinën të mbështetur.'],
    { demo: 'press_seated', deltoid: ANT }),
  'Machine Shoulder Press': D('press', 'Shtyrje mbi kokë në makinë', ['Makinë'], ['delt_front'], ['delt_side', 'triceps'],
    'Ulur me dorezat në nivel shpatullash.',
    ['Shtyji dorezat lart deri sa krahët drejtohen.', 'Mos i mbyll bërrylat me forcë.', 'Ktheji ngadalë.'],
    { demo: 'press_seated', deltoid: ANT }),
  'Cable Lateral Raise': D('lateral', 'Ngritje anash me kabllo', ['Kabllo'], ['delt_side'], ['rotator_cuff', 'traps_upper'],
    'Anash kabllos së ulët, dorezë në dorën e largët.',
    ['Ngrije anash deri në nivelin e supit.', 'Mbaj bërrylin pak të përkulur.', 'Ule ngadalë.'],
    { deltoid: LAT }),
  'Leaning Lateral Raise': D('lateral', 'Ngritje anash me anim', ['Dumbell'], ['delt_side'], ['traps_upper'],
    'Mbahu me një dorë dhe anohu anash, dumbell në dorën tjetër.',
    ['Ngrije anash deri në nivel supi.', 'Mos e lëkund trupin.', 'Ule ngadalë.'],
    { deltoid: LAT }),
  'Bent-Over Rear Delt Raise': D('rear', 'Ngritje e deltoidit të pasëm (e përkulur)', ['Dumbell'], ['delt_rear'], ['rhomboids', 'traps_mid_lower'],
    'Përkul trupin nga ijet me shpinë të drejtë, dumbell varur poshtë.',
    ['Hapi krahët anash deri në nivel shpatullash.', 'Shtrëngo shpinën e sipërme.', 'Ule kontrolluar.'],
    { deltoid: POS }),
  'Reverse Pec Deck': D('rear', 'Hapje e kundërt në pec deck', ['Makinë'], ['delt_rear'], ['rhomboids', 'traps_mid_lower'],
    'Ulur me gjoksin kundër jastëkut, dorezat para teje.',
    ['Hapi dorezat prapa në hark.', 'Mbaj bërryla të buta.', 'Kthehu ngadalë.'],
    { deltoid: POS }),
  'Cable Rear Delt Fly': D('rear', 'Hapje e pasme me kabllo', ['Kabllo'], ['delt_rear'], ['rhomboids', 'rotator_cuff'],
    'Kabllo të kryqëzuara në nivel supesh, dorezat në duar.',
    ['Hapi krahët anash e prapa në nivel supesh.', 'Shtrëngo shpatullat.', 'Kthehu ngadalë.'],
    { deltoid: POS }),
  'Upright Row': D('upright', 'Tërheqje vertikale (upright row)', ['Shufër'], ['delt_side'], ['traps_upper', 'delt_front', 'biceps'],
    'Në këmbë me shufrën para kofshëve, duart sa supet.',
    ['Ngrije shufrën afër trupit deri te gjoksi.', 'Mbaj bërrylat më lart se duart, jo mbi supe.', 'Ule ngadalë.'],
    { demo: 'upright_row', deltoid: LAT }),
  'Cable Front Raise': D('front', 'Ngritje përpara me kabllo', ['Kabllo'], ['delt_front'], ['delt_side', 'chest'],
    'Kablloja e ulët mes këmbëve, doreza në dorë.',
    ['Ngrije dorezën përpara deri në nivel supi.', 'Mbaj krahun e drejtë.', 'Ule kontrolluar.'],
    { demo: 'front_raise', deltoid: ANT }),
  'Plate Front Raise': D('front', 'Ngritje përpara me pllakë', ['Pllakë'], ['delt_front'], ['delt_side', 'chest'],
    'Pllakë me dy duar para kofshëve.',
    ['Ngrije pllakën deri në nivel të syve.', 'Mbaj krahët e shtrirë.', 'Ule kontrolluar.'],
    { demo: 'front_raise', deltoid: ANT }),
  'Push Press': D('press', 'Push press (shtyrje me ndihmën e këmbëve)', ['Shufër'], ['delt_front'], ['triceps', 'delt_side', 'quads', 'glutes', 'core'],
    'Shufra në gjoks, këmbët sa supet.',
    ['Përkul pak gjunjët dhe shtyje menjëherë këmbët lart.', 'Përdor forcën për ta shtyrë shufrën mbi kokë.', 'Ule ngadalë në gjoks.'],
    { deltoid: ANT }),
  'Landmine Shoulder Press': D('press', 'Shtyrje mbi kokë me landmine', ['Landmine'], ['delt_front'], ['triceps', 'chest', 'core', 'serratus'],
    'Në këmbë, skaji i shufrës në nivel supi me një dorë.',
    ['Shtyje diagonalisht lart.', 'Mbaj trupin të qëndrueshëm.', 'Ule ngadalë.'],
    { deltoid: ANT }),
  'Pike Push Up': D('bodyweight', 'Pike push-up (shtytje me ije lart)', ['Pesha e trupit'], ['delt_front'], ['triceps', 'delt_side', 'core', 'serratus'],
    'Në formë V të përmbysur, ije lart, duart në dysheme.',
    ['Ule kokën drejt dyshemesë duke përkulur bërrylat.', 'Shtyje trupin lart.', 'Mbaj shpinën e drejtë.'],
    { deltoid: ANT }),
  'Band Pull Apart': D('facepull', 'Hapje e elastikut (band pull apart)', ['Elastik'], ['delt_rear'], ['rhomboids', 'traps_mid_lower'],
    'Elastiku para gjoksit me krahë të shtrirë.',
    ['Hapi elastikun anash duke shtrënguar shpatullat.', 'Mbaj krahët në nivel gjoksi.', 'Kthehu ngadalë.'],
    { deltoid: POS }),
  'Y Raise': D('rear', 'Ngritje në Y', ['Dumbell', 'Stol'], ['delt_rear', 'traps_mid_lower'], ['delt_side', 'rhomboids'],
    'Përmbys në stol të pjerrët me dumbell të lehtë.',
    ['Ngri krahët lart në formë Y me gishtat e mëdhenj lart.', 'Mbaj një çast.', 'Ule ngadalë.'],
    { deltoid: POS }),
  'Kettlebell Shoulder Press': D('press', 'Shtyrje mbi kokë me kettlebell', ['Kettlebell'], ['delt_front'], ['triceps', 'delt_side', 'core'],
    'Kettlebell në pozicion rack te supi.',
    ['Shtyje lart derisa krahu drejtohet.', 'Mbaj kyçin neutral.', 'Ule kontrolluar.'],
    { demo: 'press_standing', deltoid: ANT }),
  'Cuban Press': D('rotation', 'Cuban press', ['Dumbell'], ['rotator_cuff'], ['delt_rear', 'delt_side', 'traps_mid_lower'],
    'Dumbell të lehtë, bërryla në nivel supi.',
    ['Tërhiq bërrylat lart dhe rrotulloji parakrahët lart.', 'Shtyji mbi kokë.', 'Kthehu me të njëjtën rrugë.'],
    { deltoid: POS }),

  // ===== Shpatulla (të reja, 10) =====
  'Dumbbell Push Press': D('press', 'Push press me dumbell', ['Dumbell'], ['delt_front'], ['triceps', 'delt_side', 'quads', 'glutes'],
    'Dumbell në nivel supesh, këmbët sa ijet.',
    ['Përkul pak gjunjët dhe shtyji lart me ndihmën e këmbëve.', 'Mbyll krahët mbi kokë.', 'Ulji kontrolluar.'],
    { deltoid: ANT }),
  'Kettlebell Clean and Press': D('olympic', 'Ngritje e kettlebell-it dhe shtyrje mbi kokë', ['Kettlebell'], ['delt_front', 'glutes'], ['hamstrings', 'traps_upper', 'triceps', 'core'],
    'Kettlebell në dysheme mes këmbëve.',
    ['Ngrije te supi duke drejtuar ijet (clean).', 'Shtyje lart mbi kokë.', 'Ule te supi dhe pastaj poshtë me kontroll.'],
    { deltoid: ANT }),
  'Dumbbell Clean and Press': D('olympic', 'Ngritje e dumbell-ve dhe shtyrje mbi kokë', ['Dumbell'], ['delt_front', 'glutes'], ['hamstrings', 'traps_upper', 'triceps', 'core'],
    'Dumbell në duar para kofshëve, këmbët sa ijet.',
    ['Ngri peshat te supet duke drejtuar ijet.', 'Shtyji mbi kokë.', 'Ulji te supet dhe pastaj poshtë me kontroll.'],
    { deltoid: ANT }),
  'Wall Walk': D('bodyweight', 'Ecje në mur', ['Pesha e trupit', 'Mur'], ['delt_front'], ['core', 'triceps', 'serratus'],
    'Përmbys në dysheme me këmbët pas murit.',
    ['Ec me duar drejt murit derisa trupi të jetë pothuaj vertikal.', 'Mbaje pak duke shtrënguar barkun.', 'Ec prapa me kontroll.'],
    { deltoid: ANT }),
  'Plate Halo': D('carry', 'Halo me pllakë', ['Pllakë'], ['delt_front', 'delt_side'], ['traps_upper', 'core'],
    'Pllaka para gjoksit me dy duar.',
    ['Rrotulloje rreth kokës në rreth të kontrolluar.', 'Mos anoj trupin.', 'Ndërro drejtimin.'],
    { deltoid: ANT }),
  'Kettlebell Halo': D('carry', 'Halo me kettlebell', ['Kettlebell'], ['delt_front', 'delt_side'], ['traps_upper', 'core', 'rotator_cuff'],
    'Kettlebell-i me dy duar nga doreza para gjoksit.',
    ['Rrotulloje rreth kokës pa përkulur shpinën.', 'Mbaj bërrylat pranë.', 'Ndërro drejtimin.'],
    { deltoid: ANT }),
  'Neutral-Grip Dumbbell Shoulder Press': D('press', 'Shtyrje mbi kokë me dumbell (kapje neutrale)', ['Dumbell'], ['delt_front'], ['triceps', 'delt_side'],
    'Dumbell në nivel supesh me pëllëmbë përballë.',
    ['Shtyji lart derisa krahët drejtohen.', 'Mbaj bërrylat pak përpara.', 'Ulji kontrolluar.'],
    { demo: 'press_standing', deltoid: ANT }),
  'Cable Internal Rotation': D('rotation', 'Rrotullim i brendshëm me kabllo', ['Kabllo'], ['rotator_cuff'], ['delt_front'],
    'Anash kabllos, bërryli i mbështetur te ijet.',
    ['Rrotulloje parakrahun drejt barkut.', 'Mbaj bërrylin te trupi.', 'Kthehu ngadalë.'],
    { deltoid: ANT }),
  'Alternating Dumbbell Shoulder Press': D('press', 'Shtyrje alternative me dumbell', ['Dumbell'], ['delt_front'], ['triceps', 'delt_side', 'core'],
    'Dumbell në nivel supesh, shpina e drejtë.',
    ['Shtyje njërin dumbell lart derisa krahu drejtohet.', 'Ule dhe shtyje tjetrin.', 'Mbaj trupin të palëvizshëm.'],
    { demo: 'press_standing', deltoid: ANT }),
  'Dumbbell Upright Row': D('upright', 'Tërheqje vertikale me dumbell', ['Dumbell'], ['delt_side'], ['traps_upper', 'delt_front', 'biceps'],
    'Dumbell para kofshëve, në këmbë.',
    ['Tërhiqi lart afër trupit deri te gjoksi.', 'Mbaj bërrylat më lart se duart, jo mbi supe.', 'Ulji ngadalë.'],
    { demo: 'upright_row', deltoid: LAT }),

  // ===== SUPET: deltoidi anterior (10) =====
  'Seated Barbell Shoulder Press': D('press', 'Shtyrje mbi kokë me shufër (ulur)', ['Shufër', 'Stol'], ['delt_front'], ['delt_side', 'triceps', 'traps_upper'],
    'Ulur me shpinë të mbështetur, shufra në nivel supesh.',
    ['Shtyje shufrën lart derisa krahët drejtohen.', 'Mos e përkul shpinën prapa.', 'Ule te mjekra me kontroll.'],
    { demo: 'press_seated', deltoid: ANT }),
  'Single-Arm Dumbbell Shoulder Press': D('press', 'Shtyrje mbi kokë me një dumbell', ['Dumbell'], ['delt_front'], ['delt_side', 'triceps', 'core'],
    'Dumbell në nivel supi, barku i shtrënguar.',
    ['Shtyje lart derisa krahu drejtohet.', 'Mos anoj trupin.', 'Ule ngadalë, pastaj ndërro krahun.'],
    { demo: 'press_standing', deltoid: ANT }),
  'Z Press': D('press', 'Z press (shtyrje ulur në dysheme)', ['Shufër'], ['delt_front'], ['triceps', 'delt_side', 'core'],
    'Ulur në dysheme me këmbët të shtrira, shufra në gjoks.',
    ['Shtyje shufrën mbi kokë pa u mbështetur prapa.', 'Mbaj barkun të shtrënguar.', 'Ule kontrolluar në gjoks.'],
    { deltoid: ANT }),
  'Bottoms-Up Kettlebell Press': D('press', 'Shtyrje me kettlebell përmbys', ['Kettlebell'], ['delt_front'], ['triceps', 'rotator_cuff', 'forearms', 'core'],
    'Kettlebell me pjesën e rëndë lart nga doreza, në nivel supi.',
    ['Shtyje lart duke e mbajtur kettlebell-in të qëndrueshëm.', 'Mbaj kyçin neutral.', 'Ule ngadalë.'],
    { deltoid: ANT }),
  'Dumbbell Scaption': D('front', 'Ngritje scaption', ['Dumbell'], ['delt_front'], ['delt_side', 'traps_upper', 'rotator_cuff'],
    'Dumbell para kofshëve, gishtat e mëdhenj lart.',
    ['Ngri krahët përpara dhe pak anash (rreth 30°).', 'Ndalo në nivel supesh.', 'Ule ngadalë.'],
    { deltoid: ANT }),
  'Barbell Front Raise': D('front', 'Ngritje përpara me shufër', ['Shufër'], ['delt_front'], ['chest', 'delt_side'],
    'Shufra para kofshëve, duart sa supet.',
    ['Ngrije përpara me krahë të shtrirë deri në nivel supesh.', 'Mos lëkund trupin.', 'Ule ngadalë.'],
    { demo: 'front_raise', deltoid: ANT }),
  'Band Overhead Press': D('press', 'Shtyrje mbi kokë me elastik', ['Elastik'], ['delt_front'], ['triceps', 'delt_side', 'core'],
    'Qëndro mbi elastik, skajet në nivel supesh.',
    ['Shtyji lart mbi kokë derisa krahët drejtohen.', 'Mbaj barkun të shtrënguar.', 'Kthehu ngadalë.'],
    { demo: 'press_standing', deltoid: ANT }),
  'Single-Arm Cable Shoulder Press': D('press', 'Shtyrje mbi kokë me kabllo (një krah)', ['Kabllo'], ['delt_front'], ['triceps', 'delt_side', 'core'],
    'Para kabllos së ulët, doreza në nivel supi.',
    ['Shtyje lart mbi kokë.', 'Mbaj trupin të palëvizshëm.', 'Ule kontrolluar.'],
    { demo: 'press_standing', deltoid: ANT }),
  'Wall Handstand Push Up': D('bodyweight', 'Shtytje në handstand pas murit', ['Pesha e trupit', 'Mur'], ['delt_front'], ['triceps', 'core', 'traps_upper'],
    'Në handstand me shpinën dhe këmbët pas murit.',
    ['Ule kokën drejt dyshemesë duke përkulur bërrylat.', 'Shtyje trupin lart.', 'Mbaj barkun të shtrënguar.'],
    { deltoid: ANT }),
  'Seesaw Press': D('press', 'Shtyrje alternative (si shkallore)', ['Dumbell'], ['delt_front'], ['triceps', 'delt_side', 'core'],
    'Dumbell në nivel supesh.',
    ['Shtyje njërin lart ndërsa e ul tjetrin.', 'Ndërro në mënyrë të vazhdueshme.', 'Mbaj trupin të stabilizuar.'],
    { demo: 'press_standing', deltoid: ANT }),

  // ===== SUPET: deltoidi lateral (10) =====
  'Seated Dumbbell Lateral Raise': D('lateral', 'Ngritje anash me dumbell (ulur)', ['Dumbell', 'Stol'], ['delt_side'], ['traps_upper', 'rotator_cuff'],
    'Ulur drejt në stol me dumbell anash.',
    ['Ngri krahët anash deri në nivel supesh.', 'Mbaj bërryla pak të përkulur.', 'Ule ngadalë.'],
    { demo: 'lateral_raise', deltoid: LAT }),
  'Machine Lateral Raise': D('lateral', 'Ngritje anash në makinë', ['Makinë'], ['delt_side'], ['traps_upper'],
    'Ulur me jastëkët mbi parakrahët.',
    ['Ngri krahët anash deri në nivel supesh.', 'Mbaj shpatullat larg veshëve.', 'Ule ngadalë.'],
    { demo: 'lateral_raise', deltoid: LAT }),
  'Behind-the-Back Cable Lateral Raise': D('lateral', 'Ngritje anash me kabllo pas shpinës', ['Kabllo'], ['delt_side'], ['traps_upper', 'rotator_cuff'],
    'Kablloja e ulët pas shpinës, doreza në dorën e largët.',
    ['Ngrije anash deri në nivel supi.', 'Mbaj bërrylin pak të përkulur.', 'Ule ngadalë.'],
    { deltoid: LAT }),
  'Side-Lying Dumbbell Lateral Raise': D('lateral', 'Ngritje anash e shtrirë anash', ['Dumbell', 'Stol'], ['delt_side'], ['rotator_cuff'],
    'Shtrirë anash në stol me dumbell të lehtë në dorën e sipërme.',
    ['Ngrije lart me krah pak të përkulur.', 'Mbaj trupin të palëvizshëm.', 'Ule ngadalë.'],
    { deltoid: LAT }),
  'Band Lateral Raise': D('lateral', 'Ngritje anash me elastik', ['Elastik'], ['delt_side'], ['traps_upper'],
    'Qëndro mbi elastik, skajet në duar.',
    ['Ngri krahët anash deri në nivel supesh.', 'Mos i ngre supet.', 'Ule ngadalë.'],
    { demo: 'lateral_raise', deltoid: LAT }),
  'Lu Raise': D('lateral', 'Ngritje Lu', ['Dumbell'], ['delt_side'], ['delt_front', 'traps_upper', 'rotator_cuff'],
    'Dumbell të lehtë anash trupit.',
    ['Ngri anash deri në nivel supesh.', 'Vazhdo lart mbi kokë me bërryla të buta.', 'Ule në të njëjtën rrugë.'],
    { deltoid: LAT }),
  'Incline Bench Chest-Supported Lateral Raise': D('lateral', 'Ngritje anash me mbështetje në stol', ['Dumbell', 'Stol'], ['delt_side'], ['traps_upper'],
    'Me gjoks ose anë mbi stol të pjerrët, dumbell të lehtë.',
    ['Ngri dumbellët anash me krahë pak të përkulur.', 'Mos përdor impuls.', 'Ulji ngadalë.'],
    { deltoid: LAT }),
  'Dual Cable Lateral Raise': D('lateral', 'Ngritje anash me dy kabllo', ['Kabllo'], ['delt_side'], ['traps_upper'],
    'Mes dy kabllove të ulëta, dorezat të kryqëzuara para trupit.',
    ['Ngri krahët anash deri në nivel supesh.', 'Mbaj trupin të palëvizshëm.', 'Ule ngadalë.'],
    { deltoid: LAT }),
  'Lateral-to-Front Raise': D('lateral', 'Ngritje anash dhe përpara', ['Dumbell'], ['delt_side', 'delt_front'], ['traps_upper'],
    'Dumbell anash trupit.',
    ['Ngri një dumbell anash deri në nivel supi dhe ule.', 'Ngrije përpara në të njëjtin nivel dhe ule.', 'Përsërit ose ndërro krahun.'],
    { deltoid: LAT }),
  'Lean-Away Cable Lateral Raise': D('lateral', 'Ngritje anash me kabllo dhe anim', ['Kabllo'], ['delt_side'], ['traps_upper'],
    'Mbahu te një shtyllë me një dorë dhe anoje trupin larg kabllos.',
    ['Ngri dorezën anash deri në nivel supi.', 'Mbaj animin e qëndrueshëm.', 'Ule ngadalë.'],
    { deltoid: LAT }),

  // ===== SUPET: deltoidi posterior (10) =====
  'Chest-Supported Rear Delt Raise': D('rear', 'Ngritje e deltoidit të pasëm me mbështetje', ['Dumbell', 'Stol'], ['delt_rear'], ['rhomboids', 'traps_mid_lower'],
    'Me gjoks në stol të pjerrët, dumbell të lehtë.',
    ['Hapi krahët anash deri në nivel shpatullash.', 'Shtrëngo shpinën e sipërme.', 'Ulji ngadalë.'],
    { deltoid: POS }),
  'Single-Arm Cable Reverse Fly': D('rear', 'Hapje e kundërt me kabllo (një krah)', ['Kabllo'], ['delt_rear'], ['rhomboids', 'rotator_cuff'],
    'Anash kabllos në nivel supi, doreza në dorën e largët.',
    ['Tërhiqe përtej trupit dhe prapa në hark.', 'Mbaj bërrylin pak të përkulur.', 'Kthehu ngadalë.'],
    { deltoid: POS }),
  'Band Face Pull': D('facepull', 'Tërheqje drejt fytyrës me elastik', ['Elastik'], ['delt_rear'], ['rhomboids', 'rotator_cuff', 'traps_mid_lower'],
    'Elastiku i fiksuar në nivel fytyre.',
    ['Tërhiqe drejt fytyrës duke hapur bërrylat anash dhe prapa.', 'Mbaj një sekondë.', 'Kthehu ngadalë.'],
    { demo: 'face_pull', deltoid: POS }),
  'Dumbbell Rear Delt Row': D('rear', 'Tërheqje për deltoidin e pasëm me dumbell', ['Dumbell'], ['delt_rear'], ['rhomboids', 'traps_mid_lower', 'biceps'],
    'Trupi i përkulur nga ijet, dumbell varur, bërryla jashtë.',
    ['Tërhiq dumbellët drejt gjoksit të sipërm me bërryla anash.', 'Shtrëngo shpatullat.', 'Ulji ngadalë.'],
    { deltoid: POS }),
  'Cable Rear Delt Row': D('rear', 'Tërheqje për deltoidin e pasëm me kabllo', ['Kabllo me litar'], ['delt_rear'], ['rhomboids', 'traps_mid_lower'],
    'Ulur para kabllos me litar.',
    ['Tërhiqe drejt gjoksit të sipërm me bërryla të hapur lart.', 'Shtrëngo shpatullat.', 'Kthehu ngadalë.'],
    { deltoid: POS }),
  'Lying Face-Down Rear Delt Fly': D('rear', 'Hapje e pasme përmbys në stol', ['Dumbell', 'Stol'], ['delt_rear'], ['rhomboids', 'traps_mid_lower'],
    'Përmbys në stol të sheshtë, krahët varur.',
    ['Hapi anash deri në nivel shpatullash.', 'Mos përdor impuls.', 'Ulji ngadalë.'],
    { deltoid: POS }),
  'Standing Band External Rotation': D('rotation', 'Rrotullim i jashtëm me elastik', ['Elastik'], ['rotator_cuff'], ['delt_rear'],
    'Bërryli i mbështetur te ijet, parakrahu përpara.',
    ['Rrotulloje parakrahun jashtë.', 'Mbaj bërrylin te trupi.', 'Kthehu ngadalë.'],
    { deltoid: POS }),
  'Side-Lying Dumbbell External Rotation': D('rotation', 'Rrotullim i jashtëm i shtrirë anash', ['Dumbell'], ['rotator_cuff'], ['delt_rear'],
    'Shtrirë anash, bërryli 90° te ijet, dumbell shumë i lehtë.',
    ['Rrotulloje parakrahun lart.', 'Mbaj bërrylin te trupi.', 'Ule ngadalë.'],
    { deltoid: POS }),
  'Suspension Reverse Fly': D('rear', 'Hapje e pasme me suspension', ['Suspension (TRX)'], ['delt_rear'], ['rhomboids', 'traps_mid_lower', 'core'],
    'Dorezat e suspensionit, trupi i anuar prapa me krahë të shtrirë.',
    ['Hapi krahët anash duke shtrënguar shpatullat.', 'Mbaj trupin të drejtë.', 'Ktheji ngadalë.'],
    { deltoid: POS }),
  'Barbell Rear Delt Row': D('rear', 'Tërheqje për deltoidin e pasëm me shufër', ['Shufër'], ['delt_rear'], ['rhomboids', 'traps_mid_lower', 'lats', 'biceps'],
    'Trupi i përkulur nga ijet, kapje e gjerë.',
    ['Tërhiqe drejt gjoksit të sipërm me bërryla anash.', 'Shtrëngo shpatullat.', 'Ule kontrolluar.'],
    { deltoid: POS }),
}

export interface ResolvedDetail extends ExerciseDetail {
  breathing: string
  mistakes: string[]
  tips: string[]
}

export function getExerciseDetail(name: string): ResolvedDetail | undefined {
  const d = DETAILS[name]
  if (!d) return undefined
  const p = PATTERNS[d.pattern]
  return {
    ...d,
    breathing: d.breathing ?? p.breathing,
    mistakes: d.mistakes ?? p.mistakes,
    tips: d.tips ?? p.tips,
  }
}

export const DETAIL_COUNT = Object.keys(DETAILS).length
export function hasDetail(name: string): boolean {
  return name in DETAILS
}
