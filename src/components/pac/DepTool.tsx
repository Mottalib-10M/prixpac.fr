/**
 * Les 96 départements de métropole côte à côte : climat (DJU Météo-France), zone, besoin de chauffage,
 * facture avant / après et prime CEE pour le même logement. Calculé dans le navigateur.
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { formatNumber } from '../../lib/format';
import { readParams, updateURL } from '../../lib/url-state';
import { DEPARTEMENTS, simuler, DEFAUT, type Energie, type Iso, type TypePac } from '../../lib/engine/pac';
import { eur, type L } from '../calc/kit';

interface Props { lang: L; id: string; methodHref?: string; region?: string }
type Tri = 'dju' | 'eco' | 'nom';

export default function DepTool({ lang, id, methodHref, region }: Props) {
  const fr = lang === 'fr';
  const [surface, setSurface] = useState(100);
  const [iso, setIso] = useState<Iso>('moyenne');
  const [energie, setEnergie] = useState<Energie>('gaz');
  const [type, setType] = useState<TypePac>('air_eau');
  const [tri, setTri] = useState<Tri>('dju');
  const [q, setQ] = useState(region ?? '');
  useEffect(() => {
    const u = readParams(window.location.search);
    if (u.get('s')) setSurface(Number(u.get('s')) || 100);
    if (u.get('e') && ['gaz', 'fioul', 'elec'].includes(u.get('e')!)) setEnergie(u.get('e') as Energie);
  }, []);
  useEffect(() => { updateURL({ s: surface, e: energie, t: type, iso }); }, [surface, energie, type, iso]);
  const regions = useMemo(() => [...new Set(DEPARTEMENTS.map((d) => d.region))].sort((a, b) => a.localeCompare(b, 'fr')), []);
  const rows = useMemo(() => DEPARTEMENTS.filter((d) => !q || d.region === q).map((d) => ({ d, r: simuler({ ...DEFAUT, dep: d.code, surface, iso, energie, type }) }))
    .sort((a, b) => tri === 'nom' ? a.d.code.localeCompare(b.d.code) : tri === 'eco' ? b.r.economie - a.r.economie : a.d.dju - b.d.dju), [surface, iso, energie, type, tri, q]);
  const n = (x: number) => formatNumber(Math.round(x), 0, lang);
  return (
    <div className="rechner not-prose rounded-xl border border-navy-200 bg-white p-4 sm:p-6" data-chrome data-calc={id}>
      <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-4">
        <NumberField id={`${id}-s`} label={fr ? 'Surface chauffée' : 'Heated area'} value={surface} onChange={setSurface} unit="m²" min={10} max={600} lang={lang} />
        <SelectField id={`${id}-e`} label={fr ? 'Chauffage actuel' : 'Current heating'} value={energie} onChange={(v) => setEnergie(v as Energie)} options={[{ value: 'gaz', label: fr ? 'Gaz' : 'Gas' }, { value: 'fioul', label: fr ? 'Fioul' : 'Heating oil' }, { value: 'elec', label: fr ? 'Électrique' : 'Electric' }]} />
        <SelectField id={`${id}-t`} label={fr ? 'Pompe à chaleur' : 'Heat pump'} value={type} onChange={(v) => setType(v as TypePac)} options={[{ value: 'air_eau', label: fr ? 'Air/eau' : 'Air-to-water' }, { value: 'geo', label: fr ? 'Géothermique' : 'Ground-source' }, { value: 'air_air', label: fr ? 'Air/air' : 'Air-to-air' }]} />
        <SelectField id={`${id}-iso`} label={fr ? 'Isolation' : 'Insulation'} value={iso} onChange={(v) => setIso(v as Iso)} options={[{ value: 'faible', label: fr ? 'Faible' : 'Poor' }, { value: 'moyenne', label: fr ? 'Moyenne' : 'Average' }, { value: 'bonne', label: fr ? 'Bonne' : 'Good' }, { value: 'bbc', label: fr ? 'Très bonne' : 'Very good' }]} />
        <SelectField className="col-span-2" id={`${id}-reg`} label={fr ? 'Région' : 'Region'} value={q} onChange={setQ} options={[{ value: '', label: fr ? 'Toute la métropole (96)' : 'All mainland France (96)' }, ...regions.map((x) => ({ value: x, label: x }))]} />
        <SelectField className="col-span-2" id={`${id}-tri`} label={fr ? 'Classer par' : 'Sort by'} value={tri} onChange={(v) => setTri(v as Tri)} options={[{ value: 'dju', label: fr ? 'Climat, du plus doux au plus froid' : 'Climate, mildest first' }, { value: 'eco', label: fr ? 'Économie annuelle, la plus forte d’abord' : 'Yearly saving, largest first' }, { value: 'nom', label: fr ? 'Numéro de département' : 'Département number' }]} />
      </form>
      <div data-resultat className="mt-5 max-h-[34rem] overflow-auto rounded-lg border border-navy-200">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-navy-50"><tr>
            {[fr ? 'Département' : 'Département', 'DJU', 'Zone', fr ? 'Avant / an' : 'Before / yr', fr ? 'PAC / an' : 'Heat pump / yr', fr ? 'Économie' : 'Saving', 'CEE'].map((h, i) => <th key={h} scope="col" className={`border-b border-navy-300 px-2 py-2 font-semibold text-navy-900 ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(({ d, r }, i) => (
              <tr key={d.code} className={i % 2 ? 'bg-navy-50/40' : ''}>
                <td className="border-b border-navy-100 px-2 py-1.5 text-navy-900">{d.code} {d.nom}</td>
                <td className="tabular-nums border-b border-navy-100 px-2 py-1.5 text-right">{n(d.dju)}</td>
                <td className="border-b border-navy-100 px-2 py-1.5 text-right">{d.zone}</td>
                <td className="tabular-nums border-b border-navy-100 px-2 py-1.5 text-right">{eur(r.coutAvant, lang)}</td>
                <td className="tabular-nums border-b border-navy-100 px-2 py-1.5 text-right">{eur(r.coutPac, lang)}</td>
                <td className="tabular-nums border-b border-navy-100 px-2 py-1.5 text-right font-semibold">{eur(r.economie, lang)}</td>
                <td className="tabular-nums border-b border-navy-100 px-2 py-1.5 text-right">{r.cee.chiffre ? eur(r.cee.eur, lang) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-navy-700">{fr
        ? `DJU : moyenne 2015-2024 de la station Météo-France de référence (base 18 °C). Prime CEE pour un ménage aux revenus intermédiaires, Coup de pouce compris. ${n(rows.length)} départements affichés.`
        : `HDD: 2015-2024 average at the reference Météo-France station (18 °C base). CEE bonus for a middle-income household, Coup de pouce included. ${n(rows.length)} départements shown.`}{methodHref && <> <a href={methodHref} className="font-medium text-accent-700 underline">{fr ? 'Méthode' : 'Method'}</a></>}</p>
    </div>
  );
}
