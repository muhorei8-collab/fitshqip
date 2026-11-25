import type { Exercise } from './types'

// FitShqip V3 — 130 ushtrime të reja:
//   • 10 për secilën nga 10 kategoritë ekzistuese (100)
//   • kategoria e re SUPET me 30 ushtrime (10 deltoid anterior, 10 lateral, 10 posterior)
// Skema e pandryshuar ({ name, muscle, instructions }) plus `subgroup` opsional për SUPET.
// Rregull: `name` duhet të jetë unik globalisht (çelës te rutinat/historia/rekordet).
// Asnjë ushtrim ekzistues nuk është ndryshuar ose hequr; lib/exercises.ts hedh poshtë çdo emër të përsëritur.
const SUPET = 'Supet'
const ANT = 'Deltoidi anterior'
const LAT = 'Deltoidi lateral'
const POS = 'Deltoidi posterior'

export const V3_EXERCISES: Exercise[] = [
  // ---------- Gjoks (+10) ----------
  { name: 'Dumbbell Squeeze Press', muscle: 'Gjoks', instructions: 'Shtrihu në stol dhe shtrëngo dy dumbell së bashku mbi gjoks me pëllëmbë përballë. Mbaji të shtypura gjatë gjithë lëvizjes, ulji te gjoksi dhe shtyji lart. Fokus: gjoksi i brendshëm dhe triceps.' },
  { name: 'Reverse-Grip Bench Press', muscle: 'Gjoks', instructions: 'Shtrihu në stol dhe kap shufrën me pëllëmbë nga ti, sa gjerësia e supeve. Ule te gjoksi i sipërm me bërryla pranë trupit dhe shtyje lart. Përdor peshë të moderuar. Fokus: gjoksi i sipërm dhe triceps.' },
  { name: 'Single-Arm Dumbbell Bench Press', muscle: 'Gjoks', instructions: 'Shtrihu në stol me një dumbell në njërën dorë dhe shtrëngo barkun që trupi të mos rrotullohet. Ule dumbellin te gjoksi dhe shtyje lart, pastaj ndërro krahun. Fokus: gjoksi njëanshëm dhe stabiliteti.' },
  { name: 'Single-Arm Cable Fly', muscle: 'Gjoks', instructions: 'Qëndro anash kabllos në nivel gjoksi dhe kap dorezën. Me bërryl pak të përkulur, tërhiqe përtej trupit deri para gjoksit, mbaje një sekondë dhe kthehu ngadalë. Fokus: gjoksi me tension të vazhdueshëm.' },
  { name: 'Spoto Press', muscle: 'Gjoks', instructions: 'Shtrihu në stol dhe ule shufrën ngadalë deri 2-3 cm mbi gjoks pa e prekur. Mbaje një sekondë dhe shtyje lart. Përdor peshë më të lehtë se zakonisht. Fokus: gjoksi dhe kontrolli në pjesën e poshtme.' },
  { name: 'Plyometric Push Up', muscle: 'Gjoks', instructions: 'Në pozicion shtytjeje, ule gjoksin drejt dyshemesë dhe shtyje me forcë që duart të ngrihen pak nga dyshemeja. Ulu butë me bërryla të përkulur. Fokus: fuqia eksplozive e gjoksit dhe triceps-it.' },
  { name: 'Pseudo Planche Push Up', muscle: 'Gjoks', instructions: 'Në pozicion shtytjeje me duart pranë belit dhe gishtat nga këmbët, anoje trupin përpara mbi duart. Ule gjoksin me bërryla pranë trupit dhe shtyje lart. Version i avancuar. Fokus: gjoksi i sipërm, shpatullat e përparme dhe triceps.' },
  { name: 'Suspension Push Up', muscle: 'Gjoks', instructions: 'Mbaj dorezat e një sistemi suspension (TRX ose unaza) para gjoksit me trup të drejtë. Ule gjoksin mes dorezave me kontroll dhe shtyje lart. Fokus: gjoksi dhe stabiliteti i bërthamës.' },
  { name: 'Spiderman Push Up', muscle: 'Gjoks', instructions: 'Në pozicion shtytjeje, ndërsa ule gjoksin, tërhiq një gju drejt bërrylit të së njëjtës anë. Shtyje lart, ktheje këmbën dhe ndërro anën. Fokus: gjoksi, barku i përdredhur dhe fleksorët e ijes.' },
  { name: 'Smith Machine Incline Bench Press', muscle: 'Gjoks', instructions: 'Vendos stolin në 30-45° nën shufrën e Smith machine. Zgjidhe dhe ule drejt gjoksit të sipërm me kontroll, pastaj shtyje lart. Fokus: gjoksi i sipërm me stabilitet më të madh.' },

  // ---------- Shpinë (+10) ----------
  { name: 'Wide-Grip Cable Row', muscle: 'Shpinë', instructions: 'Ulu para kabllos me shufër të gjerë dhe kap me duar më gjerë se supet. Tërhiq shufrën drejt gjoksit të poshtëm duke hapur bërrylat dhe shtrënguar shpatullat, pastaj ktheje ngadalë. Fokus: shpina e sipërme dhe e mesme.' },
  { name: 'Single-Arm Lat Pulldown', muscle: 'Shpinë', instructions: 'Ulu para kabllos së lartë dhe kap dorezën me një dorë. Tërhiq bërrylin poshtë drejt belit duke ulur shpatullën dhe lëshoje ngadalë deri te shtrirja. Fokus: latissimus-i njëanshëm.' },
  { name: 'Seal Row', muscle: 'Shpinë', instructions: 'Shtrihu përmbys në stol të ngritur me shufrën nën të në dysheme. Tërhiq shufrën drejt barkut pa ndihmën e ijeve dhe ule kontrolluar. Fokus: shpina e mesme, pa ngarkesë në shpinën e poshtme.' },
  { name: 'Yates Row', muscle: 'Shpinë', instructions: 'Përkul trupin nga ijet në rreth 45° dhe kap shufrën me pëllëmbë nga ti. Tërhiqe drejt barkut të poshtëm duke mbajtur bërrylat pranë trupit dhe ule me kontroll. Fokus: latissimus-i dhe biceps.' },
  { name: 'Trap Bar Deadlift', muscle: 'Shpinë', instructions: 'Qëndro brenda trap bar me këmbët sa ijet dhe kap dorezat. Me shpinë drejt, shtyje dyshemenë dhe drejto ijet e gjunjët njëkohësisht, pastaj ule kontrolluar. Fokus: shpina, gluteus dhe kofshët.' },
  { name: 'Snatch-Grip Deadlift', muscle: 'Shpinë', instructions: 'Kap shufrën shumë gjerë (afër pllakave). Me shpinë drejt dhe gjoks lart, ngrije duke shtyrë dyshemenë, pastaj ule ngadalë. Përdor peshë më të lehtë se deadlift-i normal. Fokus: shpina e sipërme dhe hamstring-et.' },
  { name: 'Commando Pull Up', muscle: 'Shpinë', instructions: 'Kap shufrën me duar njëra pas tjetrës (pëllëmbë përballë), me kokën anash shufrës. Tërhiq trupin lart derisa koka kalon shufrën dhe ndërro anën. Fokus: latissimus-i, biceps dhe kapja.' },
  { name: 'Suspension Row', muscle: 'Shpinë', instructions: 'Mbaj dorezat e sistemit të suspensionit dhe anoje trupin prapa me krahë të shtrirë. Tërhiq gjoksin drejt dorezave duke shtrënguar shpatullat dhe ule ngadalë. Fokus: shpina dhe bërthama.' },
  { name: 'Reverse Hyperextension', muscle: 'Shpinë', instructions: 'Shtrihu përmbys mbi stol me ijet te cepi dhe këmbët të lira. Ngri këmbët prapa deri në vijë me trupin duke shtrënguar gluteus-in dhe ule kontrolluar. Fokus: shpina e poshtme dhe gluteus-i.' },
  { name: 'Renegade Row', muscle: 'Shpinë', instructions: 'Në pozicion shtytjeje me duar mbi dumbell, shtrëngo barkun dhe tërhiq një dumbell drejt ijes pa rrotulluar trupin, ule dhe ndërro anën. Fokus: shpina dhe stabiliteti i bërthamës.' },

  // ---------- Shpatulla (+10) ----------
  { name: 'Dumbbell Push Press', muscle: 'Shpatulla', instructions: 'Mbaj dumbellët në nivel supesh. Përkul pak gjunjët dhe shtyji menjëherë lart duke drejtuar këmbët, mbyll krahët mbi kokë dhe ulji kontrolluar. Fokus: shpatullat dhe fuqia e trupit.' },
  { name: 'Kettlebell Clean and Press', muscle: 'Shpatulla', instructions: 'Nga dyshemeja, ngrije kettlebell-in te supi (clean) duke drejtuar ijet, pastaj shtyje lart mbi kokë dhe ule ngadalë. Fokus: shpatullat, ijet dhe bërthama.' },
  { name: 'Dumbbell Clean and Press', muscle: 'Shpatulla', instructions: 'Me dumbell në çdo dorë, ngri peshat te supet duke drejtuar ijet, shtyji mbi kokë dhe ulji kontrolluar. Fokus: shpatullat, trapezi dhe këmbët.' },
  { name: 'Wall Walk', muscle: 'Shpatulla', instructions: 'Shtrihu përmbys me këmbët pas murit dhe ec me duar drejt murit deri sa trupi të jetë pothuaj vertikal. Mbaje pak dhe kthehu me kontroll. Fokus: shpatullat dhe bërthama.' },
  { name: 'Plate Halo', muscle: 'Shpatulla', instructions: 'Mbaj një pllakë para gjoksit me dy duar dhe rrotulloje rreth kokës në rreth të kontrolluar pa e anuar trupin. Ndërro drejtimin. Fokus: shpatullat dhe mobiliteti i tyre.' },
  { name: 'Kettlebell Halo', muscle: 'Shpatulla', instructions: 'Mbaj kettlebell-in me dy duar nga doreza para gjoksit dhe rrotulloje rreth kokës pa përkulur shpinën. Ndërro drejtimin. Fokus: shpatullat dhe stabiliteti i shpatullave.' },
  { name: 'Neutral-Grip Dumbbell Shoulder Press', muscle: 'Shpatulla', instructions: 'Mbaj dumbellët në nivel supesh me pëllëmbë përballë. Shtyji lart derisa krahët drejtohen dhe ulji kontrolluar. Fokus: shpatullat me më pak stres te kyçet.' },
  { name: 'Cable Internal Rotation', muscle: 'Shpatulla', instructions: 'Qëndro anash kabllos me bërrylin e mbështetur te ijet dhe parakrahun jashtë. Rrotulloje parakrahun drejt barkut dhe kthehu ngadalë me peshë të lehtë. Fokus: rrotatorët e brendshëm të shpatullës.' },
  { name: 'Alternating Dumbbell Shoulder Press', muscle: 'Shpatulla', instructions: 'Mbaj dumbellët në nivel supesh. Shtyje njërin lart derisa krahu drejtohet, ule dhe shtyje tjetrin, duke mbajtur trupin të palëvizshëm. Fokus: shpatullat dhe bërthama.' },
  { name: 'Dumbbell Upright Row', muscle: 'Shpatulla', instructions: 'Mbaj dumbellët para kofshëve. Tërhiqi lart afër trupit deri te gjoksi me bërryla më lart se duart, jo mbi nivelin e supeve. Ulji ngadalë. Fokus: shpatullat e mesme dhe trapezi.' },

  // ---------- Biceps (+10) ----------
  { name: 'Incline Hammer Curl', muscle: 'Biceps', instructions: 'Ulu në stol të pjerrët me dumbell neutral (pëllëmbë përballë) dhe krahët varur pas trupit. Përkul lart pa lëvizur bërrylat përpara dhe ule ngadalë. Fokus: brachialis dhe koka e gjatë e biceps-it.' },
  { name: 'Cable Preacher Curl', muscle: 'Biceps', instructions: 'Mbështet krahët mbi jastëkun e preacher-it me kabllon e ulët përpara. Përkul dorezën lart dhe ule ngadalë deri te shtrirja. Fokus: biceps me tension të vazhdueshëm.' },
  { name: 'Wide-Grip Barbell Curl', muscle: 'Biceps', instructions: 'Kap shufrën më gjerë se supet me pëllëmbë lart dhe bërryla pranë trupit. Përkul lart dhe ule ngadalë. Fokus: koka e brendshme e biceps-it.' },
  { name: 'Close-Grip Barbell Curl', muscle: 'Biceps', instructions: 'Kap shufrën me duar pak më afër se supet. Përkul lart me bërryla fiks dhe ule kontrolluar. Fokus: koka e jashtme e biceps-it.' },
  { name: 'Suspension Biceps Curl', muscle: 'Biceps', instructions: 'Mbaj dorezat e suspensionit me krahë të shtrirë dhe trup të pjerrët prapa. Përkul bërrylat që duart të shkojnë drejt ballit dhe ule ngadalë. Fokus: biceps me peshën e trupit.' },
  { name: 'Isometric Biceps Hold', muscle: 'Biceps', instructions: 'Përkul krahët në 90° me dumbell ose shufër dhe mbaji pa lëvizur 20-30 sekonda, me bërryla pranë trupit. Regjistro sekondat. Fokus: qëndrueshmëria e biceps-it.' },
  { name: 'Behind-the-Back Cable Curl', muscle: 'Biceps', instructions: 'Qëndro para kabllos së ulët me krahun pak pas trupit. Përkul dorezën lart pa e çuar bërrylin përpara dhe ule ngadalë. Fokus: shtrirja e biceps-it.' },
  { name: 'Pinwheel Curl', muscle: 'Biceps', instructions: 'Mbaj dumbellët anash me pëllëmbë përballë trupit. Përkuli drejt gjoksit duke mbajtur pëllëmbën nga trupi, ndërro krahun dhe ule ngadalë. Fokus: brachialis dhe biceps.' },
  { name: 'Resistance Band Hammer Curl', muscle: 'Biceps', instructions: 'Qëndro mbi elastik dhe kap skajet me pëllëmbë përballë. Përkul lart duke mbajtur bërrylat pranë trupit dhe lëshoje ngadalë. Fokus: brachialis dhe parakrahu, ideal për shtëpi.' },
  { name: 'Kettlebell Curl', muscle: 'Biceps', instructions: 'Mbaj kettlebell-in nga doreza me pëllëmbë lart. Përkul bërrylin duke e mbajtur peshën para gjoksit dhe ule ngadalë. Fokus: biceps dhe kapja.' },

  // ---------- Triceps (+10) ----------
  { name: 'Bodyweight Triceps Extension', muscle: 'Triceps', instructions: 'Vendos duart në një shufër të ulët ose stol dhe trupin të drejtë. Ule ballin drejt duarve duke përkulur bërrylat dhe shtyje lart duke drejtuar krahët. Fokus: triceps me peshën e trupit.' },
  { name: 'Ring Dips', muscle: 'Triceps', instructions: 'Mbaj unazat me krahë të shtrirë dhe ule trupin deri sa bërrylat të jenë rreth 90°, pastaj shtyje lart. Mbaji unazat pranë trupit. Version i avancuar. Fokus: triceps, gjoksi dhe stabiliteti i shpatullave.' },
  { name: 'Cross-Body Cable Triceps Extension', muscle: 'Triceps', instructions: 'Qëndro para kabllos së lartë dhe kap dorezën me një dorë. Drejto krahun poshtë dhe përtej trupit dhe kthehu ngadalë. Fokus: triceps njëanshëm.' },
  { name: 'Seated EZ-Bar Overhead Extension', muscle: 'Triceps', instructions: 'Ulu me shpinë drejt dhe mbaj shufrën EZ mbi kokë. Përkul bërrylat që shufra të shkojë pas kokës dhe drejtoji ngadalë. Fokus: koka e gjatë e triceps-it.' },
  { name: 'Band Overhead Triceps Extension', muscle: 'Triceps', instructions: 'Qëndro mbi elastik dhe mbaje mbi kokë me dy duar, bërryla pranë veshëve. Drejto krahët lart dhe kthehu ngadalë. Fokus: triceps, ideal për shtëpi.' },
  { name: 'Machine Dip', muscle: 'Triceps', instructions: 'Ulu në makinën e dips dhe kap dorezat. Shtyji poshtë derisa krahët drejtohen dhe kthehu ngadalë. Fokus: triceps me ngarkesë të rregullueshme.' },
  { name: 'Katana Extension', muscle: 'Triceps', instructions: 'Me kabllon e lartë pas teje, kap dorezën me një dorë mbi shpatull. Drejto krahun përpara dhe poshtë përtej trupit, pastaj kthehu. Fokus: koka e gjatë e triceps-it.' },
  { name: 'Close-Grip Floor Press', muscle: 'Triceps', instructions: 'Shtrihu në dysheme dhe kap shufrën sa gjerësia e supeve. Ule derisa bërrylat prekin dyshemenë, bëj pauzë të shkurtër dhe shtyje lart. Fokus: triceps dhe kyçet e mbrojtur.' },
  { name: 'Kettlebell Overhead Triceps Extension', muscle: 'Triceps', instructions: 'Mbaj kettlebell-in me dy duar mbi kokë nga doreza. Përkul bërrylat duke e ulur pas kokës dhe drejtoji ngadalë. Fokus: triceps dhe stabiliteti i shpatullave.' },
  { name: 'Single-Arm Reverse-Grip Pushdown', muscle: 'Triceps', instructions: 'Në kabllon e lartë, kap dorezën me një dorë me pëllëmbë lart. Shtyje poshtë derisa krahu drejtohet dhe kthehu ngadalë me bërryl pranë trupit. Fokus: koka mediale e triceps-it.' },

  // ---------- Këmbë (+10) ----------
  { name: 'Box Squat', muscle: 'Këmbë', instructions: 'Vendos një stol ose kuti pas teje. Ulu duke shtyrë ijet prapa derisa të ulesh lehtë mbi kutinë, pa u shtrirë, pastaj ngrihu fuqishëm. Fokus: kuadriceps, gluteus dhe hamstring.' },
  { name: 'Zercher Squat', muscle: 'Këmbë', instructions: 'Mbaj shufrën në pjesën e brendshme të bërrylave, para barkut. Ulu thellë me gjoks lart dhe ngrihu. Fokus: kuadriceps, gluteus dhe bërthama.' },
  { name: 'Single-Leg Romanian Deadlift', muscle: 'Këmbë', instructions: 'Qëndro në një këmbë me gju pak të përkulur dhe dumbell në dorë. Përkul trupin përpara nga ija duke ngritur këmbën tjetër prapa dhe ngrihu. Fokus: hamstring, gluteus dhe balanca.' },
  { name: 'Pistol Squat', muscle: 'Këmbë', instructions: 'Qëndro në një këmbë me tjetrën të shtrirë përpara. Ulu ngadalë deri sa gluteus-i të jetë afër dyshemesë dhe ngrihu pa u ndihmuar. Version i avancuar. Fokus: kuadriceps, gluteus dhe balanca.' },
  { name: 'Lateral Lunge', muscle: 'Këmbë', instructions: 'Hidh një hap të gjerë anash dhe ulu mbi atë këmbë duke mbajtur këmbën tjetër të shtrirë. Shtyje dyshemenë për t’u kthyer. Fokus: kofshët e brendshme, gluteus dhe kuadriceps.' },
  { name: 'Curtsy Lunge', muscle: 'Këmbë', instructions: 'Hidh këmbën prapa dhe përtej këmbës tjetër si në kolltuk, duke ulur gjurin e pasmë drejt dyshemesë. Kthehu në fillim dhe ndërro. Fokus: gluteus dhe kofshët e jashtme.' },
  { name: 'Nordic Hamstring Curl', muscle: 'Këmbë', instructions: 'Gjunjëzohu me këmbët të siguruara. Ule trupin përpara ngadalë duke shtrënguar hamstring-et dhe kthehu me ndihmën e duarve nëse duhet. Version i avancuar. Fokus: hamstring.' },
  { name: 'Cossack Squat', muscle: 'Këmbë', instructions: 'Këmbët shumë gjerë. Ulu mbi një këmbë duke mbajtur këmbën tjetër të shtrirë me gishtat lart, pastaj kalo në anën tjetër. Fokus: kofshët e brendshme, kuadriceps dhe lëvizshmëria.' },
  { name: 'Hip Abduction Machine', muscle: 'Këmbë', instructions: 'Ulu në makinë me jastëkët jashtë gjunjëve. Hap këmbët anash kundër rezistencës dhe mbylli ngadalë. Fokus: gluteus-i i jashtëm.' },
  { name: 'Banded Lateral Walk', muscle: 'Këmbë', instructions: 'Vendos elastikun mbi gjunjë ose kyçe dhe ec anash me gjunjë pak të përkulur, duke mbajtur elastikun të tendosur. Fokus: gluteus i mesëm dhe stabiliteti i ijeve.' },

  // ---------- Bark (+10) ----------
  { name: 'Dragon Flag', muscle: 'Bark', instructions: 'Shtrihu në stol dhe kap pas kokës. Ngri trupin drejt si dërrasë mbi supet dhe ule ngadalë pa e përkulur. Version shumë i avancuar. Fokus: barku dhe bërthama.' },
  { name: 'Hanging Windshield Wipers', muscle: 'Bark', instructions: 'Varur në shufër, ngri këmbët drejt lart dhe rrotulloji majtas e djathtas si fshirëse. Fokus: oblikët dhe barku.' },
  { name: 'L-Sit Hold', muscle: 'Bark', instructions: 'Mbështet duart në shufra ose dysheme, ngri këmbët të shtrira para trupit në formë L dhe mbaji. Regjistro sekondat. Fokus: barku dhe fleksorët e ijes.' },
  { name: 'Plank Shoulder Tap', muscle: 'Bark', instructions: 'Në pozicion shtytjeje, prek shpatullën e kundërt me një dorë duke mbajtur ijet të palëvizshme, pastaj ndërro. Fokus: barku, shpatullat dhe stabiliteti.' },
  { name: 'Copenhagen Plank', muscle: 'Bark', instructions: 'Në plank anësor me këmbën e sipërme mbi stol, ngri ijet derisa trupi të jetë drejt dhe ndërro anën. Fokus: oblikët dhe kofshët e brendshme.' },
  { name: 'Dumbbell Side Bend', muscle: 'Bark', instructions: 'Në këmbë me dumbell në njërën dorë, përkul trupin anash drejt peshës dhe ngrihu duke shtrënguar oblikët. Ndërro anën. Fokus: oblikët.' },
  { name: 'Stability Ball Crunch', muscle: 'Bark', instructions: 'Shtrihu mbi topin me shpinën e poshtme të mbështetur dhe ngri shpatullat drejt gjunjëve duke shtrënguar barkun, pastaj ule ngadalë. Fokus: barku me shtrirje më të madhe.' },
  { name: 'Stir the Pot', muscle: 'Bark', instructions: 'Në plank me bërryla mbi një top stabiliteti, rrotullo topin në rreth të vogël me bërrylat, duke mbajtur trupin të drejtë. Ndërro drejtimin. Fokus: barku dhe stabiliteti i bërthamës.' },
  { name: 'Toes-to-Bar', muscle: 'Bark', instructions: 'Varur në shufër, ngri këmbët të drejta deri sa gishtat të prekin shufrën dhe ule me kontroll. Version i avancuar. Fokus: barku dhe fleksorët e ijes.' },
  { name: 'Landmine Rotation', muscle: 'Bark', instructions: 'Mbaj skajin e shufrës landmine me dy duar para gjoksit. Rrotullo trupin dhe krahët majtas e djathtas në hark, me ije të stabilizuara. Fokus: oblikët dhe rrotullimi i trupit.' },

  // ---------- Kardio (+10) ----------
  { name: 'Double Unders', muscle: 'Kardio', instructions: 'Rrotullo litarin dy herë gjatë çdo kërcimi, me kyçet e shpejtë dhe kërcim pak më të lartë. Mbaj trupin të drejtë. Fokus: kardio, koordinimi dhe pulpat.' },
  { name: 'Bear Crawl', muscle: 'Kardio', instructions: 'Në katër këmbë me gjunjë pak mbi dysheme, ec përpara duke lëvizur dorën dhe këmbën e kundërt njëkohësisht. Mbaj shpinën të sheshtë. Fokus: kardio, shpatullat dhe bërthama.' },
  { name: 'Sled Drag', muscle: 'Kardio', instructions: 'Lidh litarin ose rripat te saja dhe ec prapa duke e tërhequr me hapa të shkurtër dhe gjunjë të përkulur. Regjistro distancën. Fokus: kardio dhe kuadriceps.' },
  { name: 'Medicine Ball Slam', muscle: 'Kardio', instructions: 'Ngri topin e rëndë mbi kokë dhe përplasë poshtë me forcë duke përkulur trupin, pastaj merre dhe përsërit. Fokus: kardio, shpatullat dhe bërthama.' },
  { name: 'Hill Sprints', muscle: 'Kardio', instructions: 'Vrapo shpejt në një ngjitje 10-20 sekonda dhe zbrit ecur. Përsërit seritë dhe regjistro numrin e tyre. Fokus: kardio dhe fuqia e këmbëve.' },
  { name: 'Shuttle Run', muscle: 'Kardio', instructions: 'Vrapo shpejt mes dy pikash 10-20 m larg, prek vijën dhe kthehu. Përsërit për kohë ose numër. Fokus: kardio dhe ndryshimi i drejtimit.' },
  { name: 'Lateral Shuffle', muscle: 'Kardio', instructions: 'Në pozicion gjysmë-squat, lëviz anash me hapa të shpejtë pa i kryqëzuar këmbët. Regjistro minutat ose seritë. Fokus: kardio dhe kofshët e jashtme.' },
  { name: 'Tuck Jump', muscle: 'Kardio', instructions: 'Kërce lart dhe tërhiq gjunjët drejt gjoksit në ajër, pastaj ulu butë. Mbaj ritëm të kontrolluar. Fokus: fuqia, kardio dhe bërthama.' },
  { name: 'Inchworm', muscle: 'Kardio', instructions: 'Nga këmbë, përkul trupin dhe ec me duar përpara deri në pozicion shtytjeje, pastaj ec me këmbët drejt duarve. Fokus: kardio, shpatullat dhe hamstring-et.' },
  { name: 'SkiErg', muscle: 'Kardio', instructions: 'Tërhiq dorezat poshtë me krahë të shtrirë duke përkulur trupin dhe gjunjët, pastaj ngrihu dhe ktheji lart. Regjistro minutat. Fokus: kardio i trupit të plotë.' },

  // ---------- Trapez (+10) ----------
  { name: 'Power Shrug', muscle: 'Trapez', instructions: 'Me shufër para kofshëve, përkul pak gjunjët dhe ngri supet shpejt me një kërcim të vogël të ijeve, pastaj ule kontrolluar. Fokus: trapezi dhe fuqia.' },
  { name: 'Seated Dumbbell Shrug', muscle: 'Trapez', instructions: 'Ulu drejt në stol me dumbell anash. Ngri supet drejt veshëve pa i rrotulluar dhe ule ngadalë. Fokus: trapezi i sipërm pa ndihmën e këmbëve.' },
  { name: 'Wide-Grip Barbell Shrug', muscle: 'Trapez', instructions: 'Kap shufrën më gjerë se supet. Ngri supet lart drejt veshëve, mbaj një sekondë dhe ule. Fokus: trapezi i sipërm dhe i mesëm.' },
  { name: 'Overhead Barbell Shrug', muscle: 'Trapez', instructions: 'Mbaj shufrën mbi kokë me krahë të shtrirë dhe ngri supet drejt veshëve pa përkulur bërrylat, pastaj ule. Përdor peshë të lehtë. Fokus: trapezi dhe stabiliteti i shpatullave.' },
  { name: 'Kettlebell Waiter Walk', muscle: 'Trapez', instructions: 'Mbaj një kettlebell mbi kokë me krahun e shtrirë dhe ec ngadalë me shpinë drejt. Ndërro krahun. Regjistro distancën. Fokus: trapezi, shpatullat dhe bërthama.' },
  { name: 'Prone Cobra Hold', muscle: 'Trapez', instructions: 'Shtrihu përmbys, ngri gjoksin pak nga dyshemeja, hap krahët anash me gishtat e mëdhenj lart dhe mbaje. Regjistro sekondat. Fokus: trapezi i poshtëm dhe shpina.' },
  { name: 'Rack Shrug', muscle: 'Trapez', instructions: 'Vendos shufrën në rack në nivel gjuri. Kapi dhe ngri supet lart me krahë të shtrirë, pastaj ule kontrolluar. Fokus: trapezi i sipërm me peshë të rëndë.' },
  { name: 'Hang Dumbbell Shrug', muscle: 'Trapez', instructions: 'Me dumbell në duar, përkul trupin lehtë përpara dhe lëri krahët të varen. Ngri supet drejt veshëve dhe ule ngadalë. Fokus: trapezi me shtrirje më të madhe.' },
  { name: 'Single-Arm Cable Shrug', muscle: 'Trapez', instructions: 'Qëndro anash kabllos së ulët dhe kap dorezën me një dorë. Ngri supin drejt veshit dhe ule ngadalë, pastaj ndërro. Fokus: trapezi njëanshëm.' },
  { name: 'Kettlebell Rack Carry', muscle: 'Trapez', instructions: 'Mbaj një kettlebell në pozicion rack te supi me bërrylin pranë trupit dhe ec me hapa të qëndrueshëm. Ndërro anën. Regjistro distancën. Fokus: trapezi, shpatullat dhe bërthama.' },

  // ---------- Parakrah (+10) ----------
  { name: 'Wrist Ulnar Deviation', muscle: 'Parakrah', instructions: 'Mbaj një çekan ose dumbell nga skaji me parakrahun e mbështetur. Anoje kyçin drejt gishtit të vogël dhe ule ngadalë, me peshë shumë të lehtë. Fokus: stabiliteti i kyçit.' },
  { name: 'Thick-Bar Hold', muscle: 'Parakrah', instructions: 'Mbaj një shufër të trashë ose doreza të trasha para trupit sa më gjatë. Regjistro sekondat. Fokus: kapja dhe parakrahu.' },
  { name: 'Rice Bucket Drill', muscle: 'Parakrah', instructions: 'Fut duart në një kovë me oriz dhe bëj rrotullime, shtrëngime dhe hapje të gishtave. Regjistro minutat. Fokus: parakrahu, gishtat dhe lëvizshmëria.' },
  { name: 'Finger Extension with Band', muscle: 'Parakrah', instructions: 'Vendos një elastik të vogël rreth gishtave dhe hapi gishtat kundër rezistencës, pastaj mbylli ngadalë. Fokus: shtrirësit e gishtave dhe balanca e parakrahut.' },
  { name: 'Pinch Grip Carry', muscle: 'Parakrah', instructions: 'Mbaj dy pllaka me gishtat dhe ec me to ose qëndro pa i lëshuar. Regjistro distancën ose sekondat. Fokus: kapja me gishta.' },
  { name: 'Towel Wring', muscle: 'Parakrah', instructions: 'Mbaj një peshqir të lagur me dy duar dhe shtrydhe në drejtime të kundërta si për ta shtrydhur. Ndërro drejtimin. Fokus: kapja dhe parakrahu.' },
  { name: 'Hammer Lever', muscle: 'Parakrah', instructions: 'Mbaj një çekan nga skaji i dorezës me krahun e shtrirë përpara dhe anoje kokën e çekanit lart e poshtë me kyçin. Peshë e lehtë. Fokus: parakrahu dhe stabiliteti i kyçit.' },
  { name: 'One-Arm Dead Hang', muscle: 'Parakrah', instructions: 'Varu në shufër me një dorë dhe krahun tjetër te trupi. Mbaje sa më gjatë pa u lëkundur. Regjistro sekondat. Fokus: kapja dhe stabiliteti i shpatullës.' },
  { name: 'Rope Climb', muscle: 'Parakrah', instructions: 'Kap litarin e trashë dhe tërhiq trupin lart me duar dhe këmbë, ose ulu e ngjitu vetëm me duar. Zbrit me kontroll. Version i avancuar. Fokus: kapja, parakrahu dhe shpina.' },
  { name: 'Bottoms-Up Kettlebell Walk', muscle: 'Parakrah', instructions: 'Mbaj kettlebell-in me pjesën e rëndë lart nga doreza dhe ec ngadalë duke e mbajtur peshën të qëndrueshme. Ndërro krahun. Regjistro distancën. Fokus: kapja dhe stabiliteti i kyçit.' },

  // ---------- SUPET (30): deltoidi anterior (10) ----------
  { name: 'Seated Barbell Shoulder Press', muscle: SUPET, subgroup: ANT, instructions: 'Ulu në stol me mbështetëse shpine dhe kap shufrën pak më gjerë se supet. Shtyje lart derisa krahët drejtohen dhe ule te mjekra me kontroll. Fokus: deltoidi anterior.' },
  { name: 'Single-Arm Dumbbell Shoulder Press', muscle: SUPET, subgroup: ANT, instructions: 'Mbaj një dumbell në nivel supi dhe shtrëngo barkun. Shtyje lart derisa krahu drejtohet dhe ule ngadalë, pastaj ndërro. Fokus: deltoidi anterior njëanshëm.' },
  { name: 'Z Press', muscle: SUPET, subgroup: ANT, instructions: 'Ulu në dysheme me këmbët e shtrira para teje dhe shpinën drejt. Shtyje shufrën nga gjoksi lart mbi kokë pa u mbështetur prapa dhe ule kontrolluar. Fokus: deltoidi anterior dhe bërthama.' },
  { name: 'Bottoms-Up Kettlebell Press', muscle: SUPET, subgroup: ANT, instructions: 'Mbaj kettlebell-in me pjesën e rëndë lart nga doreza në nivel supi. Shtyje lart duke e mbajtur të qëndrueshëm dhe ule ngadalë. Fokus: deltoidi anterior dhe stabiliteti i shpatullës.' },
  { name: 'Dumbbell Scaption', muscle: SUPET, subgroup: ANT, instructions: 'Mbaj dumbellët para kofshëve. Ngri krahët e shtrirë përpara dhe pak anash (30° nga vija e përparme) deri në nivel supesh me gishtat e mëdhenj lart. Ule ngadalë. Fokus: deltoidi anterior dhe i brendshëm.' },
  { name: 'Barbell Front Raise', muscle: SUPET, subgroup: ANT, instructions: 'Mbaj shufrën me duar sa supet para kofshëve. Ngrije përpara me krahë të shtrirë deri në nivel supesh dhe ule ngadalë. Fokus: deltoidi anterior.' },
  { name: 'Band Overhead Press', muscle: SUPET, subgroup: ANT, instructions: 'Qëndro mbi elastik dhe mbaj skajet në nivel supesh. Shtyji lart mbi kokë derisa krahët drejtohen dhe kthehu ngadalë. Fokus: deltoidi anterior, ideal për shtëpi.' },
  { name: 'Single-Arm Cable Shoulder Press', muscle: SUPET, subgroup: ANT, instructions: 'Qëndro para kabllos së ulët dhe mbaj dorezën në nivel supi. Shtyje lart mbi kokë dhe ule kontrolluar, duke mbajtur trupin të palëvizshëm. Fokus: deltoidi anterior me tension të vazhdueshëm.' },
  { name: 'Wall Handstand Push Up', muscle: SUPET, subgroup: ANT, instructions: 'Në pozicion handstand me shpinën dhe këmbët mbështetur pas murit, ule kokën drejt dyshemesë duke përkulur bërrylat dhe shtyje lart. Version shumë i avancuar. Fokus: deltoidi anterior dhe triceps.' },
  { name: 'Seesaw Press', muscle: SUPET, subgroup: ANT, instructions: 'Mbaj dumbellët në nivel supesh. Shtyje njërin lart ndërsa e ul tjetrin, ndërro në mënyrë të vazhdueshme dhe të kontrolluar. Fokus: deltoidi anterior dhe bërthama.' },

  // ---------- SUPET: deltoidi lateral (10) ----------
  { name: 'Seated Dumbbell Lateral Raise', muscle: SUPET, subgroup: LAT, instructions: 'Ulu drejt në stol me dumbell anash. Ngri krahët anash deri në nivel supesh me bërryla pak të përkulur dhe ule ngadalë. Fokus: deltoidi lateral pa ndihmën e trupit.' },
  { name: 'Machine Lateral Raise', muscle: SUPET, subgroup: LAT, instructions: 'Ulu në makinë me jastëkët mbi parakrahët. Ngri krahët anash deri në nivel supesh dhe ule ngadalë. Fokus: deltoidi lateral i izoluar.' },
  { name: 'Behind-the-Back Cable Lateral Raise', muscle: SUPET, subgroup: LAT, instructions: 'Qëndro me kabllon e ulët pas shpinës dhe kap dorezën me dorën e largët. Ngrije anash deri në nivel supi dhe ule ngadalë. Fokus: deltoidi lateral me tension më të madh.' },
  { name: 'Side-Lying Dumbbell Lateral Raise', muscle: SUPET, subgroup: LAT, instructions: 'Shtrihu anash në stol me një dumbell të lehtë në dorën e sipërme. Ngrije lart me krah pak të përkulur dhe ule ngadalë. Fokus: deltoidi lateral nga këndi i poshtëm.' },
  { name: 'Band Lateral Raise', muscle: SUPET, subgroup: LAT, instructions: 'Qëndro mbi elastik dhe mbaj skajet. Ngri krahët anash deri në nivel supesh kundër rezistencës dhe ule ngadalë. Fokus: deltoidi lateral, ideal për shtëpi.' },
  { name: 'Lu Raise', muscle: SUPET, subgroup: LAT, instructions: 'Ngri dumbellët anash deri në nivel supesh, pastaj vazhdo lart mbi kokë me bërryla të buta dhe ule në të njëjtën rrugë. Përdor peshë shumë të lehtë. Fokus: deltoidi lateral dhe shpatullat.' },
  { name: 'Incline Bench Chest-Supported Lateral Raise', muscle: SUPET, subgroup: LAT, instructions: 'Shtrihu anash ose me gjoks mbi stol të pjerrët dhe ngri dumbellët anash me krahë pak të përkulur. Ulji ngadalë. Fokus: deltoidi lateral pa impuls.' },
  { name: 'Dual Cable Lateral Raise', muscle: SUPET, subgroup: LAT, instructions: 'Qëndro mes dy kabllove të ulëta dhe kap dorezat të kryqëzuara para trupit. Ngri krahët anash deri në nivel supesh dhe ule ngadalë. Fokus: deltoidi lateral i të dy anëve.' },
  { name: 'Lateral-to-Front Raise', muscle: SUPET, subgroup: LAT, instructions: 'Ngri një dumbell anash deri në nivel supi, ule dhe ngrije përpara në të njëjtin nivel, pastaj ule. Ndërro ose bëj të dy krahët. Fokus: deltoidi lateral dhe anterior.' },
  { name: 'Lean-Away Cable Lateral Raise', muscle: SUPET, subgroup: LAT, instructions: 'Mbahu te një shtyllë me një dorë dhe anoje trupin larg kabllos. Ngri dorezën anash deri në nivel supi dhe ule ngadalë. Fokus: deltoidi lateral me shtrirje më të madhe.' },

  // ---------- SUPET: deltoidi posterior (10) ----------
  { name: 'Chest-Supported Rear Delt Raise', muscle: SUPET, subgroup: POS, instructions: 'Shtrihu me gjoks në stol të pjerrët me dumbell të lehtë. Hapi krahët anash deri në nivel shpatullash duke shtrënguar shpinën e sipërme dhe ulji ngadalë. Fokus: deltoidi posterior pa impuls.' },
  { name: 'Single-Arm Cable Reverse Fly', muscle: SUPET, subgroup: POS, instructions: 'Qëndro anash kabllos në nivel supi dhe kap dorezën me dorën e largët. Tërhiqe përtej trupit dhe prapa në hark të kontrolluar dhe kthehu. Fokus: deltoidi posterior njëanshëm.' },
  { name: 'Band Face Pull', muscle: SUPET, subgroup: POS, instructions: 'Fikso elastikun në nivel fytyre dhe tërhiqe drejt fytyrës duke hapur bërrylat anash dhe prapa. Mbaj një sekondë dhe kthehu ngadalë. Fokus: deltoidi posterior dhe rrotatorët e jashtëm.' },
  { name: 'Dumbbell Rear Delt Row', muscle: SUPET, subgroup: POS, instructions: 'Përkul trupin përpara nga ijet me dumbell, bërryla të hapur anash. Tërhiq dumbellët drejt gjoksit të sipërm dhe ulji ngadalë. Fokus: deltoidi posterior dhe shpina e sipërme.' },
  { name: 'Cable Rear Delt Row', muscle: SUPET, subgroup: POS, instructions: 'Ulu para kabllos me litar dhe tërhiqe drejt gjoksit të sipërm me bërryla të hapur lart. Shtrëngo shpatullat dhe kthehu ngadalë. Fokus: deltoidi posterior.' },
  { name: 'Lying Face-Down Rear Delt Fly', muscle: SUPET, subgroup: POS, instructions: 'Shtrihu përmbys në stol të sheshtë me krahët varur dhe dumbell të lehtë. Hapi anash deri në nivel shpatullash dhe ulji ngadalë. Fokus: deltoidi posterior.' },
  { name: 'Standing Band External Rotation', muscle: SUPET, subgroup: POS, instructions: 'Mbaj elastikun me bërryl të mbështetur te ijet dhe parakrah përpara. Rrotulloje parakrahun jashtë dhe kthehu ngadalë. Fokus: rrotatorët e jashtëm dhe deltoidi posterior.' },
  { name: 'Side-Lying Dumbbell External Rotation', muscle: SUPET, subgroup: POS, instructions: 'Shtrihu anash me bërrylin e përkulur 90° te ijet dhe dumbell të lehtë. Rrotulloje parakrahun lart dhe ule ngadalë. Fokus: rrotatorët e jashtëm të shpatullës.' },
  { name: 'Suspension Reverse Fly', muscle: SUPET, subgroup: POS, instructions: 'Mbaj dorezat e suspensionit dhe anoje trupin prapa me krahë të shtrirë. Hapi krahët anash duke shtrënguar shpatullat dhe ktheji ngadalë. Fokus: deltoidi posterior dhe shpina e sipërme.' },
  { name: 'Barbell Rear Delt Row', muscle: SUPET, subgroup: POS, instructions: 'Përkul trupin nga ijet me shufër në duar me kapje të gjerë. Tërhiqe drejt gjoksit të sipërm me bërryla anash dhe ule kontrolluar. Fokus: deltoidi posterior dhe shpina e sipërme.' },
]
