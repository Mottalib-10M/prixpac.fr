/**
 * Le simulateur du site : département → climat (DJU Météo-France), logement, chauffage actuel, PAC,
 * revenus → prix, MaPrimeRénov' 2026, prime CEE, écrêtement, reste à charge, facture avant / après,
 * temps de retour. Tout est calculé dans le navigateur ; rien n'est envoyé.
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { Shell, Head, Rows, Note, MethodLink, eur, type L } from '../calc/kit';
import { formatNumber, formatDecimal } from '../../lib/format';
import { readParams, updateURL } from '../../lib/url-state';
import { DEPARTEMENTS, depByCode, simuler, DEFAUT, plafondsRfr, prixDefaut, scopDefaut, rendementDefaut, prixKwh, type SimIn, type TypePac, type Energie, type Iso, type Logement } from '../../lib/engine/pac';
import { P } from '../../lib/engine/params';

export type Focus = 'rac' | 'eco' | 'mpr' | 'cee' | 'prix' | 'puissance' | 'conso' | 'couleur' | 'retour';
interface Props { lang: L; id: string; preset?: Partial<SimIn>; focus?: Focus; methodHref?: string; types?: TypePac[] }

const n0 = (x: number, l: L) => formatNumber(Math.round(x), 0, l);
const COUL = { fr: { bleu: 'Bleu (très modestes)', jaune: 'Jaune (modestes)', violet: 'Violet (intermédiaires)', rose: 'Rose (supérieurs)' }, en: { bleu: 'Blue (very low income)', jaune: 'Yellow (low income)', violet: 'Purple (middle income)', rose: 'Pink (higher income)' } };

export default function PacTool({ lang, id, preset = {}, focus = 'rac', methodHref, types }: Props) {
  const fr = lang === 'fr';
  const init: SimIn = { ...DEFAUT, ...preset };
  const [dep, setDep] = useState(init.dep);
  const [station, setStation] = useState('');
  const [surface, setSurface] = useState(init.surface);
  const [iso, setIso] = useState<Iso>(init.iso);
  const [energie, setEnergie] = useState<Energie>(init.energie);
  const [type, setType] = useState<TypePac>(init.type);
  const [logement, setLogement] = useState<Logement>(init.logement);
  const [personnes, setPersonnes] = useState(init.personnes);
  const [rfr, setRfr] = useState(init.rfr);
  const [rp, setRp] = useState(init.residencePrincipale ? '1' : '0');
  const [plus2, setPlus2] = useState(init.plus2ans ? '1' : '0');
  const [etas, setEtas] = useState(init.etasHaut ? '1' : '0');
  const [agree, setAgree] = useState(init.agree ? '1' : '0');
  const [conso, setConso] = useState(0);
  const [devis, setDevis] = useState(0);
  const [scop, setScop] = useState(0);
  const [rend, setRend] = useState(0);
  const [pAvant, setPAvant] = useState(0);

  // Lien partagé : lu après le premier rendu seulement (règle d'hydratation, lib/url-state.ts).
  useEffect(() => {
    const u = readParams(window.location.search);
    if (!u.toString()) return;
    const g = (k: string) => u.get(k);
    if (g('dep') && DEPARTEMENTS.some((d) => d.code === g('dep'))) setDep(g('dep')!);
    if (g('st')) setStation(g('st')!);
    if (g('s')) setSurface(Number(g('s')) || init.surface);
    if (g('iso') && g('iso')! in P.climat.g_estimation) setIso(g('iso') as Iso);
    if (g('e') && ['fioul', 'gaz', 'elec'].includes(g('e')!)) setEnergie(g('e') as Energie);
    if (g('t') && ['air_eau', 'geo', 'air_air'].includes(g('t')!)) setType(g('t') as TypePac);
    if (g('l') && ['maison', 'appartement'].includes(g('l')!)) setLogement(g('l') as Logement);
    if (g('p')) setPersonnes(Number(g('p')) || init.personnes);
    if (g('r')) setRfr(Number(g('r')) || 0);
    if (g('c')) setConso(Number(g('c')) || 0);
    if (g('d')) setDevis(Number(g('d')) || 0);
  }, []);

  const d = depByCode(dep);
  const st = d.stations.find((s) => s.n === station);
  const input: SimIn = {
    dep, dju: st?.d, surface, iso, energie, type, logement, personnes, rfr,
    residencePrincipale: rp === '1', plus2ans: plus2 === '1', etasHaut: etas === '1', agree: agree === '1',
    consoConnue: conso || undefined, prixTtc: devis || undefined, scop: scop || undefined, rendement: rend ? rend / 100 : undefined, prixKwhAvant: pAvant || undefined,
  };
  const r = useMemo(() => simuler(input), [JSON.stringify(input)]);
  useEffect(() => { updateURL({ dep, st: station || undefined, s: surface, iso, e: energie, t: type, l: logement, p: personnes, r: rfr, c: conso || undefined, d: devis || undefined }); }, [dep, station, surface, iso, energie, type, logement, personnes, rfr, conso, devis]);

  const typeOpts = (types ?? ['air_eau', 'geo', 'air_air'] as TypePac[]).map((t) => ({ value: t, label: fr ? { air_eau: 'PAC air/eau', geo: 'PAC géothermique', air_air: 'PAC air/air (clim réversible)' }[t] : { air_eau: 'Air-to-water heat pump', geo: 'Ground-source heat pump', air_air: 'Air-to-air (reversible AC)' }[t] }));
  const depOpts = DEPARTEMENTS.map((x) => ({ value: x.code, label: `${x.code} ${x.nom}` }));
  const stOpts = [{ value: '', label: fr ? `Station de référence : ${d.station} (${n0(d.dju, lang)} DJU)` : `Reference station: ${d.station} (${n0(d.dju, lang)} HDD)` }, ...d.stations.map((s) => ({ value: s.n, label: `${s.n}, ${n0(s.a, lang)} m : ${n0(s.d, lang)} DJU` }))];
  const pl = plafondsRfr(personnes, d.idf);
  const ans = r.retourAns;
  const retourTxt = ans === null ? (fr ? 'jamais (pas d’économie)' : 'never (no saving)') : `${formatDecimal(Math.round(ans * 10) / 10, 1, lang)} ${fr ? 'ans' : 'years'}`;

  const heads: Record<Focus, [string, string, string]> = {
    rac: [fr ? 'Reste à charge estimé' : 'Estimated out-of-pocket cost', eur(r.resteACharge, lang), fr ? `${eur(r.prixTtc, lang)} − ${eur(r.aides, lang)} d’aides` : `${eur(r.prixTtc, lang)} − ${eur(r.aides, lang)} in grants`],
    eco: [fr ? 'Économie de chauffage par an' : 'Heating saving per year', eur(r.economie, lang), fr ? `${eur(r.coutAvant, lang)} aujourd’hui, ${eur(r.coutPac, lang)} avec la PAC` : `${eur(r.coutAvant, lang)} today, ${eur(r.coutPac, lang)} with the heat pump`],
    mpr: [fr ? 'MaPrimeRénov’ versée' : 'MaPrimeRénov’ paid', eur(r.mpr, lang), r.ecrete > 0 ? (fr ? `forfait ${eur(r.forfait, lang)}, réduit de ${eur(r.ecrete, lang)} par l’écrêtement` : `flat rate ${eur(r.forfait, lang)}, cut by ${eur(r.ecrete, lang)} by the cap`) : (fr ? `forfait ${COUL.fr[r.couleur].split(' ')[0].toLowerCase()} 2026` : `2026 ${COUL.en[r.couleur].split(' ')[0].toLowerCase()} flat rate`)],
    cee: [fr ? 'Prime CEE estimée' : 'Estimated CEE bonus', r.cee.chiffre ? eur(r.cee.eur, lang) : (fr ? 'non chiffrée' : 'not calculated'), r.cee.chiffre ? `${n0(r.cee.kwhc, lang)} kWh cumac × ${formatDecimal(r.cee.prixMwh, 2, lang)} €/MWh` : (fr ? 'fiche CEE de ce type non relue : demandez le montant écrit' : 'CEE sheet not reviewed: ask for the amount in writing')],
    prix: [fr ? 'Prix TTC retenu' : 'Price incl. VAT used', eur(r.prixTtc, lang), devis ? (fr ? 'votre devis' : 'your quote') : type === 'geo' ? (fr ? 'exemple : plafond de dépense MaPrimeRénov’, pas un prix ; saisissez votre devis' : 'example: MaPrimeRénov’ expense ceiling, not a price; enter your quote') : (fr ? 'estimation : médiane des devis publiés, pas un prix officiel' : 'estimate: median of published quotes, not an official price')],
    puissance: [fr ? 'Puissance demandée au froid' : 'Power needed in cold spells', `${formatDecimal(Math.round(r.puissance * 10) / 10, 1, lang)} kW`, fr ? `3 jours les plus froids à ${d.tbaseStation} : ${formatDecimal(d.tbase, 1, lang)} °C` : `3 coldest days at ${d.tbaseStation}: ${formatDecimal(d.tbase, 1, lang)} °C`],
    conso: [fr ? 'Consommation de la PAC' : 'Heat pump consumption', `${n0(r.consoPac, lang)} kWh`, fr ? `soit ${eur(r.coutPac, lang)} d’électricité par an` : `i.e. ${eur(r.coutPac, lang)} of electricity a year`],
    couleur: [fr ? 'Votre catégorie de revenus' : 'Your income category', COUL[lang][r.couleur].split(' ')[0], COUL[lang][r.couleur]],
    retour: [fr ? 'Temps de retour' : 'Payback time', retourTxt, fr ? `${eur(r.resteACharge, lang)} ÷ ${eur(r.economie, lang)} par an` : `${eur(r.resteACharge, lang)} ÷ ${eur(r.economie, lang)} a year`],
  };
  const [hl, hv, hs] = heads[focus];

  const form = (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <SelectField id={`${id}-dep`} label={fr ? 'Département' : 'Département'} value={dep} onChange={(v) => { setDep(v); setStation(''); }} options={depOpts} />
        <NumberField id={`${id}-s`} label={fr ? 'Surface chauffée' : 'Heated floor area'} value={surface} onChange={setSurface} unit="m²" min={10} max={600} lang={lang} />
        <SelectField id={`${id}-e`} label={fr ? 'Chauffage actuel' : 'Current heating'} value={energie} onChange={(v) => setEnergie(v as Energie)} options={[{ value: 'gaz', label: fr ? 'Chaudière gaz' : 'Gas boiler' }, { value: 'fioul', label: fr ? 'Chaudière fioul' : 'Oil boiler' }, { value: 'elec', label: fr ? 'Radiateurs électriques' : 'Electric heaters' }]} />
        <SelectField id={`${id}-t`} label={fr ? 'Pompe à chaleur' : 'Heat pump'} value={type} onChange={(v) => setType(v as TypePac)} options={typeOpts} />
        <NumberField id={`${id}-p`} label={fr ? 'Personnes au foyer' : 'People in household'} value={personnes} onChange={setPersonnes} min={1} max={12} lang={lang} />
        <NumberField id={`${id}-r`} label={fr ? 'Revenu fiscal de référence' : 'Reference tax income'} value={rfr} onChange={setRfr} unit="€" max={500000} lang={lang} />
        <SelectField id={`${id}-iso`} label={fr ? 'Isolation' : 'Insulation'} value={iso} onChange={(v) => setIso(v as Iso)} options={[{ value: 'faible', label: fr ? 'Faible (avant 1975, rien refait)' : 'Poor (pre-1975, nothing redone)' }, { value: 'moyenne', label: fr ? 'Moyenne (combles ou fenêtres refaits)' : 'Average (loft or windows redone)' }, { value: 'bonne', label: fr ? 'Bonne (après 2000 ou rénové)' : 'Good (post-2000 or renovated)' }, { value: 'bbc', label: fr ? 'Très bonne (BBC, RT 2012)' : 'Very good (low-energy, RT 2012)' }]} />
        <SelectField id={`${id}-l`} label={fr ? 'Logement' : 'Home'} value={logement} onChange={(v) => setLogement(v as Logement)} options={[{ value: 'maison', label: fr ? 'Maison' : 'House' }, { value: 'appartement', label: fr ? 'Appartement' : 'Flat' }]} />
      </div>
      <details className="rounded-lg border border-navy-200 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-navy-800">{fr ? 'Affiner : station météo, consommation réelle, devis, conditions des aides' : 'Refine: weather station, real consumption, quote, grant conditions'}</summary>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
          <SelectField className="col-span-2" id={`${id}-st`} label={fr ? 'Station Météo-France la plus proche de chez vous' : 'Météo-France station nearest your home'} value={station} onChange={setStation} options={stOpts} />
          <NumberField id={`${id}-c`} label={fr ? (energie === 'fioul' ? `Conso. annuelle connue (kWh, 1 l = ${P.energie.fioul.kwh_pci_par_litre} kWh)` : 'Consommation annuelle connue (kWh)') : 'Known yearly use (kWh)'} value={conso} onChange={setConso} unit="kWh" max={200000} lang={lang} help={fr ? 'Vide : estimée avec les DJU' : 'Empty: estimated from degree days'} />
          <NumberField id={`${id}-d`} label={fr ? 'Prix TTC de votre devis' : 'Your quote, incl. VAT'} value={devis} onChange={setDevis} unit="€" max={100000} lang={lang} help={fr ? `Vide : ${eur(prixDefaut(type), lang)} (${type === 'geo' ? 'exemple, pas un prix' : 'estimation'})` : `Empty: ${eur(prixDefaut(type), lang)} (${type === 'geo' ? 'example, not a price' : 'estimate'})`} />
          <NumberField id={`${id}-scop`} label={fr ? 'Rendement annuel de la PAC (SCOP)' : 'Heat pump seasonal efficiency (SCOP)'} value={scop} onChange={setScop} max={7} decimals={1} lang={lang} help={fr ? `Vide : ${formatDecimal(scopDefaut(type, d.zone), 1, lang)} (${type === 'air_air' ? 'valeur par défaut du DPE' : 'mesure ADEME'})` : `Empty: ${formatDecimal(scopDefaut(type, d.zone), 1, lang)} (${type === 'air_air' ? 'DPE default value' : 'ADEME measurement'})`} />
          <NumberField id={`${id}-rd`} label={fr ? 'Rendement du chauffage actuel' : 'Current heating efficiency'} value={rend} onChange={setRend} unit="%" max={110} lang={lang} help={fr ? `Vide : ${n0(rendementDefaut(energie) * 100, lang)} %` : `Empty: ${n0(rendementDefaut(energie) * 100, lang)}%`} />
          <NumberField id={`${id}-pa`} label={fr ? 'Prix du kWh actuel' : 'Current price per kWh'} value={pAvant} onChange={setPAvant} unit="€" max={2} decimals={4} lang={lang} help={fr ? `Vide : ${formatDecimal(prixKwh(energie), 4, lang)} €` : `Empty: €${formatDecimal(prixKwh(energie), 4, lang)}`} />
          <SelectField id={`${id}-rp`} label={fr ? 'Résidence principale' : 'Main residence'} value={rp} onChange={setRp} options={[{ value: '1', label: fr ? 'Oui' : 'Yes' }, { value: '0', label: fr ? 'Non (secondaire)' : 'No (second home)' }]} />
          <SelectField id={`${id}-p2`} label={fr ? 'Logement de plus de 2 ans' : 'Home over 2 years old'} value={plus2} onChange={setPlus2} options={[{ value: '1', label: fr ? 'Oui' : 'Yes' }, { value: '0', label: fr ? 'Non' : 'No' }]} />
          <SelectField id={`${id}-et`} label={fr ? 'Efficacité saisonnière (Etas)' : 'Seasonal efficiency (Etas)'} value={etas} onChange={setEtas} options={[{ value: '0', label: type === 'geo' ? '111 % – 170 %' : '111 % – 140 %' }, { value: '1', label: type === 'geo' ? '≥ 170 %' : '≥ 140 %' }]} />
          <SelectField id={`${id}-ag`} label={fr ? 'Modèle agréé (décret 2026-413)' : 'Approved model (decree 2026-413)'} value={agree} onChange={setAgree} options={[{ value: '1', label: fr ? 'Oui' : 'Yes' }, { value: '0', label: fr ? 'Non ou inconnu' : 'No or unknown' }]} />
        </div>
      </details>
    </>
  );

  const result = (
    <>
      <Head label={hl} value={hv} sub={hs} />
      <Rows rows={[
        [fr ? (devis ? 'Prix de votre devis' : 'Prix estimé (médiane des devis)') : (devis ? 'Your quote' : 'Estimated price (median quote)'), eur(r.prixTtc, lang)],
        [`MaPrimeRénov’ (${COUL[lang][r.couleur].split(' ')[0].toLowerCase()})`, r.eligibleMpr ? eur(r.mpr, lang) : (fr ? 'non éligible' : 'not eligible')],
        ...(r.ecrete > 0 ? [[fr ? 'dont réduit par l’écrêtement' : 'of which cut by the cap', `− ${eur(r.ecrete, lang)}`] as [string, string]] : []),
        [fr ? `Prime CEE${r.coupDePouce ? ' Coup de pouce' : ''}` : `CEE bonus${r.coupDePouce ? ' (Coup de pouce)' : ''}`, r.cee.chiffre ? eur(r.cee.eur, lang) : (fr ? 'non chiffrée' : 'not calculated')],
        [fr ? 'Reste à charge' : 'Out of pocket', eur(r.resteACharge, lang), true],
        [fr ? 'Chauffage par an aujourd’hui' : 'Heating per year today', eur(r.coutAvant, lang)],
        [fr ? 'Chauffage par an avec la PAC' : 'Heating per year with heat pump', eur(r.coutPac, lang)],
        [fr ? 'Économie par an' : 'Saving per year', eur(r.economie, lang), true],
        [fr ? 'Temps de retour' : 'Payback', retourTxt],
        [fr ? 'Besoin de chauffage' : 'Heating need', `${n0(r.besoin, lang)} kWh`],
        [fr ? `Climat (${st ? st.n : d.station})` : `Climate (${st ? st.n : d.station})`, `${n0(r.dju, lang)} DJU, ${d.zone}`],
      ]} />
      <Note>{fr
        ? `Plafonds ${d.idf ? 'Île-de-France' : 'hors Île-de-France'} pour ${personnes} personne${personnes > 1 ? 's' : ''} : bleu ≤ ${eur(pl.bleu, lang)}, jaune ≤ ${eur(pl.jaune, lang)}, violet ≤ ${eur(pl.violet, lang)}. Estimation sans engagement : seule l’Anah calcule la prime, et le montant CEE est celui que l’entreprise vous écrit avant signature.`
        : `${d.idf ? 'Île-de-France' : 'Outside Île-de-France'} ceilings for ${personnes} ${personnes > 1 ? 'people' : 'person'}: blue ≤ ${eur(pl.bleu, lang)}, yellow ≤ ${eur(pl.jaune, lang)}, purple ≤ ${eur(pl.violet, lang)}. Estimate only: the Anah alone sets the grant, and the CEE amount is the one the firm puts in writing before you sign.`}</Note>
      <MethodLink href={methodHref} lang={lang} />
    </>
  );
  return <Shell id={id} form={form} result={result} />;
}
