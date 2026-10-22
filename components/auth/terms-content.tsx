// Versioni i kushteve. Ndrysho datën kur përditëson tekstin më poshtë.
export const TERMS_VERSION = '2026-10-23'

const h = 'mt-4 text-sm font-semibold text-foreground first:mt-0'
const p = 'mt-1 text-sm leading-relaxed text-muted-foreground text-pretty'

export function TermsContent() {
  return (
    <div className="max-h-[60vh] overflow-y-auto pr-1">
      <h3 className={h}>1. Të drejtat e rezervuara</h3>
      <p className={p}>
        © 2026 FITSHQIP. Të gjitha të drejtat e rezervuara. Aplikacioni FITSHQIP, emri, logoja, dizajni, kodi, tekstet,
        biblioteka e ushtrimeve dhe rutinat e gatshme janë pronë e Rei Muho Developments dhe mbrohen nga e drejta e
        autorit.
      </p>

      <h3 className={h}>2. Përdorimi i lejuar</h3>
      <p className={p}>
        Të japim një leje personale, jo-ekskluzive dhe të revokueshme për ta përdorur aplikacionin për qëllime
        personale, jo-komerciale. Nuk lejohet të kopjosh, rishpërndash, shesësh, ndryshosh ose publikosh pjesë të
        aplikacionit, të nxjerrësh të dhëna në mënyrë automatike (scraping) ose të përpiqesh të cënosh sigurinë e tij.
      </p>

      <h3 className={h}>3. Llogaria jote</h3>
      <p className={p}>
        Je përgjegjës për saktësinë e të dhënave që jep dhe për fjalëkalimin tënd. Llogaritë që shkelin këto kushte
        mund të kufizohen ose mbyllen.
      </p>

      <h3 className={h}>4. Të dhënat e tua</h3>
      <p className={p}>
        Ruajmë emrin, email-in, moshën, gjatësinë, peshën, nivelin, stërvitjet, matjet dhe objektivat e tua vetëm që
        aplikacioni të funksionojë. Nuk i shesim të dhënat e tua. Kur përdor funksione sociale (miqtë, klasifikimi),
        pjesë të të dhënave të stërvitjes mund t’u shfaqen përdoruesve të tjerë brenda aplikacionit. Fotot e
        progresit që ngarkon ruhen private dhe nuk u shfaqen përdoruesve të tjerë. Stërvitjet, matjet, objektivat dhe
        fotot mund t’i fshish nga Profili → Rivendos të dhënat.
      </p>

      <h3 className={h}>5. Shëndeti</h3>
      <p className={p}>
        FITSHQIP jep informacion të përgjithshëm fitnesi dhe jo këshillë mjekësore. Konsulto mjekun para se të nisësh
        një program të ri stërvitjeje, sidomos nëse ke probleme shëndetësore. Stërvitesh me përgjegjësinë tënde.
      </p>

      <h3 className={h}>6. Ndryshime</h3>
      <p className={p}>
        Mund t’i përditësojmë këto kushte. Versioni i tanishëm është shënuar me datë më poshtë.
      </p>

      <p className="mt-4 text-[11px] text-muted-foreground">Versioni: {TERMS_VERSION}</p>
    </div>
  )
}
