import { defineGuide, type Helpers } from '../../lib/guide-types';
import { tableRegion } from '../../lib/region-pages';

const CODES = ['02', '59', '60', '62', '80'];
const spread = (h: Helpers) => { const v = CODES.map((c) => h.dep(c).dju); return Math.max(...v) / Math.min(...v) - 1; };

/** Station la plus douce et la plus froide de chaque département, et l'économie qui en découle. */
const ecarts = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = CODES.map((c) => {
    const d = h.dep(c), st = [...d.stations].sort((a, b) => a.d - b.d), lo = st[0], hi = st[st.length - 1];
    const eco = (dju: number) => h.M.simuler({ ...h.M.DEFAUT, dep: c, dju }).economie;
    return [d.nom, `${lo.n} (${h.num(lo.d)})`, `${hi.n} (${h.num(hi.d)})`, `${h.eur(eco(lo.d))} – ${h.eur(eco(hi.d))}`];
  });
  return h.table(fr ? ['Département', 'Station la plus douce (DJU)', 'Station la plus froide (DJU)', 'Économie / an'] : ['Département', 'Mildest station (HDD)', 'Coldest station (HDD)', 'Saving / yr'], rows,
    fr ? 'Stations Météo-France du département, moyenne 2015-2024 ; maison de 100 m² à isolation moyenne, chaudière gaz remplacée par une PAC air/eau' : 'Météo-France stations in the département, 2015-2024 average; averagely insulated 100 m² house, gas boiler replaced by an air-to-water heat pump', ['l', 'l', 'l', 'r']);
};

/** Puissance demandée par grand froid selon l'isolation. */
const puissances = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = CODES.map((c) => {
    const d = h.dep(c);
    return [d.nom, `${h.num(d.tbase, 1)} °C`, ...(['faible', 'moyenne', 'bonne'] as const).map((i) => `${h.num(h.M.puissanceFroid(100, i, d.tbase), 1)} kW`)];
  });
  return h.table(fr ? ['Département', 'Froid typique', 'Peu isolée', 'Isolation moyenne', 'Bien isolée'] : ['Département', 'Typical cold', 'Poorly insulated', 'Average insulation', 'Well insulated'], rows,
    fr ? 'Puissance de chauffage pour 100 m² sous 2,5 m, à 19 °C intérieur, pendant les jours les plus froids d’un hiver typique (station du chef-lieu)' : 'Heating output for 100 m² under 2.5 m ceilings, 19 °C indoors, during the coldest days of a typical winter (main-town station)', ['l', 'r', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'pompe-a-chaleur-hauts-de-france',
  group: 'territoires',
  order: 4,
  tool: 'departements',
  region: 'Hauts-de-France',
  related: ['pompe-a-chaleur-par-departement', 'puissance-pompe-a-chaleur', 'remplacer-chaudiere-fioul', 'climat-degres-jours-departement', 'pompe-a-chaleur-ile-de-france'],
  sources: ['meteo', 'zones', 'bar171', 'emmy', 'cre', 'eurostatGaz', 'wob'],
  fr: {
    slug: 'pompe-a-chaleur-hauts-de-france',
    nav: 'PAC en Hauts-de-France',
    card: 'Nord, Pas-de-Calais, Somme, Oise, Aisne : climat, puissance, économie.',
    title: 'Pompe à chaleur en Hauts-de-France : économie et aides 2026',
    description: 'Pompe à chaleur en Hauts-de-France : degrés-jours Météo-France, puissance par grand froid, économie, prime CEE dans le Nord, le Pas-de-Calais, la Somme, l’Oise.',
    h1: 'Pompe à chaleur en Hauts-de-France : les 5 départements',
    intro: 'Le tableau est filtré sur les Hauts-de-France : changez la surface, l’énergie ou l’isolation, ou passez à une autre région.',
    resume: (h) => {
      const all = CODES.map((c) => h.dep(c)).sort((a, b) => a.dju - b.dju), lo = all[0], hi = all[all.length - 1];
      const e = h.M.simuler({ ...h.M.DEFAUT, dep: hi.code }), f = h.M.simuler({ ...h.M.DEFAUT, dep: hi.code, energie: 'fioul' });
      return `Les Hauts-de-France sont l’une des régions où une pompe à chaleur rapporte le plus, parce qu’on y chauffe longtemps. Les cinq départements sont en zone climatique H1, celle du facteur de prime CEE le plus fort, et comptent entre ${h.num(lo.dju)} degrés-jours par an (${lo.nom}, station de ${lo.station}) et ${h.num(hi.dju)} (${hi.nom}, ${hi.station}), d’après les relevés Météo-France de 2015 à 2024. Pour une maison de 100 m² moyennement isolée dans l’${hi.nom}, remplacer une chaudière au gaz par une PAC air/eau fait gagner environ ${h.eur(e.economie)} par an ; si la chaudière marche au fioul, le gain passe à ${h.eur(f.economie)}. Le revers du climat est la puissance : par grand froid, la PAC doit fournir plus, et un appareil sous-dimensionné bascule sur sa résistance électrique. Le littoral, adouci par la mer, demande moins que l’intérieur. Le tableau calcule la consommation, l’économie et la prime pour chaque département.`;
    },
    faqs: (h) => [
      { q: 'Une PAC air/eau suffit-elle par grand froid dans le Nord ?', a: `Oui, si elle est dimensionnée pour la température de base du lieu. À Lille, les jours les plus froids d’un hiver typique tombent vers ${h.num(h.dep('59').tbase, 1)} °C : les PAC air/eau courantes fonctionnent jusqu’à −15 °C ou −20 °C, avec un rendement réduit. L’installateur doit calculer les déperditions de la maison plutôt que choisir la puissance au mètre carré.` },
      { q: 'Le bord de mer change-t-il le calcul ?', a: 'Oui, dans les deux sens. La mer adoucit l’hiver : Dunkerque, Calais ou Le Touquet comptent moins de degrés-jours que l’intérieur et demandent moins de puissance. Mais l’air salin use plus vite l’unité extérieure ; les fabricants proposent des traitements anticorrosion pour les sites proches du littoral, à demander dans le devis.' },
      { q: 'Quel gain en quittant le fioul dans l’Aisne ou l’Oise ?', a: `Pour une maison de 100 m² moyennement isolée dans l’Oise, le simulateur donne environ ${h.eur(h.M.simuler({ ...h.M.DEFAUT, dep: '60', energie: 'fioul' }).economie)} d’économie par an au prix du fioul de la semaine, publié par la Commission européenne. Le Coup de pouce chauffage s’applique aussi à la sortie du fioul, avec la prime CEE la plus haute de la zone H1.` },
    ],
    body: (h) => `<h2>Les cinq départements, du plus doux au plus froid</h2>
${tableRegion(h, CODES)}
<p>L’écart entre départements est faible, de l’ordre de ${h.pct(spread(h), 0)}. Il est plus fort à l’intérieur de chacun, entre la côte et les plateaux.</p>
<h2>Entre la côte et l’intérieur</h2>
${ecarts(h)}
<p>Si vous habitez loin du chef-lieu, choisissez la station la plus proche de chez vous dans le simulateur de la page d’accueil : il reprend toutes les stations Météo-France du département. La méthode est sur la page ${h.a('climat-degres-jours-departement', 'degrés-jours par département')}.</p>
<h2>La puissance à prévoir par grand froid</h2>
${puissances(h)}
<p>Ces puissances sont un ordre de grandeur pour comparer les départements, pas un dimensionnement : la page ${h.a('puissance-pompe-a-chaleur', 'puissance d’une pompe à chaleur')} explique le calcul et pourquoi l’étude thermique de l’installateur reste nécessaire.</p>`,
  },
  en: {
    slug: 'heat-pump-hauts-de-france',
    nav: 'Heat pump in Hauts-de-France',
    card: 'Nord, Pas-de-Calais, Somme, Oise, Aisne: climate, output, saving.',
    title: 'Heat pump in Hauts-de-France: savings and grants for 2026',
    description: 'Heat pumps in Hauts-de-France: Météo-France degree-days, output needed in the cold, yearly saving and CEE bonus in Nord, Pas-de-Calais, Somme, Oise and Aisne.',
    h1: 'Heat pumps in Hauts-de-France: the 5 départements',
    intro: 'The table is filtered on Hauts-de-France: change the floor area, energy or insulation, or switch to another region.',
    resume: (h) => {
      const all = CODES.map((c) => h.dep(c)).sort((a, b) => a.dju - b.dju), lo = all[0], hi = all[all.length - 1];
      const e = h.M.simuler({ ...h.M.DEFAUT, dep: hi.code }), f = h.M.simuler({ ...h.M.DEFAUT, dep: hi.code, energie: 'fioul' });
      return `Hauts-de-France is one of the regions where a heat pump pays most, because the heating season is long. All five départements are in climate zone H1, the one with the highest CEE bonus factor, and have between ${h.num(lo.dju)} degree-days a year (${lo.nom}, ${lo.station} station) and ${h.num(hi.dju)} (${hi.nom}, ${hi.station}), according to Météo-France records from 2015 to 2024. For an averagely insulated 100 m² house in ${hi.nom}, replacing a gas boiler with an air-to-water heat pump saves about ${h.eur(e.economie)} a year; if the boiler burns heating oil, the saving rises to ${h.eur(f.economie)}. The other side of the climate is output: in a cold snap the heat pump must deliver more, and an undersized unit falls back on its electric heater. The coast, softened by the sea, needs less than inland. The table works out the consumption, saving and bonus for each département.`;
    },
    faqs: (h) => [
      { q: 'Is an air-to-water heat pump enough in a northern cold snap?', a: `Yes, if it is sized for the local design temperature. In Lille, the coldest days of a typical winter come down to about ${h.num(h.dep('59').tbase, 1)} °C: common air-to-water heat pumps run down to −15 °C or −20 °C, with lower efficiency. The installer should calculate the house’s heat losses rather than pick the output per square metre.` },
      { q: 'Does living by the sea change the calculation?', a: 'Yes, both ways. The sea softens winter: Dunkirk, Calais or Le Touquet have fewer degree-days than inland and need less output. But salty air wears the outdoor unit faster; manufacturers offer anti-corrosion treatment for sites near the coast, which is worth asking for in the quote before signing.' },
      { q: 'How much do you save leaving heating oil in Aisne or Oise?', a: `For an averagely insulated 100 m² house in Oise, the calculator gives about ${h.eur(h.M.simuler({ ...h.M.DEFAUT, dep: '60', energie: 'fioul' }).economie)} saved a year at this week’s oil price, published by the European Commission. The Coup de pouce chauffage also applies when leaving oil, with the highest CEE bonus of zone H1.` },
    ],
    body: (h) => `<h2>The five départements, from mildest to coldest</h2>
${tableRegion(h, CODES)}
<p>The gap between départements is small, around ${h.pct(spread(h), 0)}. It is larger within each one, between the coast and the uplands.</p>
<h2>Between the coast and inland</h2>
${ecarts(h)}
<p>If you live far from the main town, pick the station nearest you in the calculator on the home page: it includes every Météo-France station in the département. The method is on the ${h.a('climat-degres-jours-departement', 'degree-days by département')} page.</p>
<h2>Output needed in a cold snap</h2>
${puissances(h)}
<p>These outputs are an order of magnitude to compare départements, not a sizing: the ${h.a('puissance-pompe-a-chaleur', 'heat pump output')} page explains the calculation and why the installer’s heat-loss study is still needed.</p>`,
  },
});
