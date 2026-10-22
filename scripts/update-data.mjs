#!/usr/bin/env node
/**
 * Relit les prix publics qui bougent et les réécrit dans src/data/params-2026.json :
 *   - CEE : prix moyens mensuels du registre Emmy (classiques et précarité), CSV « Export » ;
 *   - électricité : tarif réglementé option Base 9 kVA, CSV open data de la CRE (data.gouv.fr) ;
 *   - gaz : prix moyen des ménages français, Eurostat nrg_pc_202 (tranche 20-199 GJ, toutes taxes) ;
 *   - fioul : prix du fioul de chauffage en France, Weekly Oil Bulletin (« Prices with taxes »).
 * Puis la date du relevé dans src/data/pac/fichier.json (affichée « données relues le … »).
 *
 * Chaque source est contrôlée (plage plausible, date) ; une source qui échoue garde sa valeur de la
 * veille et le script le dit. Aucune clé d'API. Lecture du xlsx du WOB avec `unzip` (présent sur les
 * runners Ubuntu et sur macOS).
 *
 *   node scripts/update-data.mjs                 # relève les quatre sources
 *   node scripts/update-data.mjs --dry           # affiche sans écrire
 *   node scripts/update-data.mjs --wob f.xlsx    # rejoue un fichier WOB local
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PARAMS = join(ROOT, 'src/data/params-2026.json');
const FICHIER = join(ROOT, 'src/data/pac/fichier.json');
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
const UA = { 'User-Agent': 'Mozilla/5.0 (update-data pompe-a-chaleur)' };

/** fetch, puis curl en secours : le serveur d'Emmy n'envoie pas son certificat intermédiaire, que Node refuse. */
const get = async (url, type = 'text') => {
  let buf;
  try {
    const r = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(120000) });
    if (!r.ok) throw new Error(`${url} : HTTP ${r.status}`);
    buf = Buffer.from(await r.arrayBuffer());
  } catch (e) {
    if (!e.cause) throw e;
    buf = execFileSync('curl', ['-sSfL', '--max-time', '120', '-A', UA['User-Agent'], url], { maxBuffer: 256 * 1024 * 1024 });
  }
  return type === 'buf' ? buf : type === 'json' ? JSON.parse(buf.toString('utf8')) : buf.toString('utf8');
};
const num = (s) => Number(String(s).trim().replace(',', '.'));
const frDate = (s) => { const [d, m, y] = s.split('/'); return `${y}-${m}-${d}`; };
const check = (nom, v, lo, hi) => { if (!(Number.isFinite(v) && v >= lo && v <= hi)) throw new Error(`${nom} hors plage (${v}, attendu ${lo}-${hi})`); return v; };

/* ---------- Emmy ---------- */
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
async function emmy(precarite) {
  const csv = (await get(`https://www.emmy.fr/public/downloadIndiceGlobal?precarite=${precarite}`)).replace(/^﻿/, '');
  const seen = new Map();
  for (const l of csv.split(/\r?\n/).slice(1)) {
    const c = l.split(';');
    if (c.length < 7 || !c[0]) continue;
    const prix = num(c[6] || c[3]);
    const m = MOIS.indexOf(c[2].trim().toLowerCase());
    if (m < 0 || !Number.isFinite(prix) || prix <= 0) continue;
    // Le mois concerné précède la publication (publié le 01/10 pour septembre).
    const [, pm, py] = c[0].split('/').map(Number);
    const annee = m + 1 > pm ? py - 1 : py;
    const key = `${annee}-${String(m + 1).padStart(2, '0')}`;
    if (!seen.has(key)) seen.set(key, check(`Emmy ${precarite ? 'précarité' : 'classique'} ${key}`, prix, 1, 60));
  }
  const keys = [...seen.keys()].sort();
  if (!keys.length) throw new Error('Emmy : aucune ligne lue');
  const last = keys[keys.length - 1], an = last.slice(0, 4);
  return { mois: last, prix: seen.get(last), annee: keys.filter((k) => k.startsWith(an)).map((k) => seen.get(k)) };
}

/* ---------- CRE ---------- */
async function cre() {
  const csv = await get('https://www.cre.fr/fileadmin/Documents/Open_data/Marches_de_detail/Option_Base.csv');
  const rows = csv.split(/\r?\n/).slice(1).map((l) => l.split(';')).filter((c) => c[2] === '9' && c[0]);
  rows.sort((a, b) => frDate(a[0]).localeCompare(frDate(b[0])));
  const r = rows[rows.length - 1];
  if (!r) throw new Error('CRE : aucune ligne 9 kVA');
  return { date: frDate(r[0]), kwh: check('CRE kWh', num(r[6]), 0.1, 0.5), abo: check('CRE abonnement', num(r[4]), 100, 600) };
}

/* ---------- Eurostat ---------- */
async function eurostat() {
  const d = await get('https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_202?geo=FR&nrg_cons=GJ20-199&unit=KWH&tax=I_TAX&currency=EUR&lastTimePeriod=4&format=JSON&lang=en', 'json');
  const t = d.dimension.time.category.index;
  const periodes = Object.keys(t).sort((a, b) => t[a] - t[b]);
  for (let i = periodes.length - 1; i >= 0; i--) {
    const v = d.value[String(t[periodes[i]])];
    if (v !== undefined && v !== null) return { periode: periodes[i], kwh: check('Eurostat gaz', Number(v), 0.04, 0.4) };
  }
  throw new Error('Eurostat : aucune valeur');
}

/* ---------- Weekly Oil Bulletin ---------- */
const unzip = (f, p) => execFileSync('unzip', ['-p', f, p], { maxBuffer: 256 * 1024 * 1024 }).toString('utf8');
async function wob() {
  let file = opt('--wob'), tmp;
  if (!file) {
    const page = 'https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en';
    const html = await get(page);
    const m = html.match(/href="(\/document\/download\/[^"]+Prices_History[^"]*)"/);
    if (!m) throw new Error('WOB : lien « Prices History » introuvable');
    tmp = mkdtempSync(join(tmpdir(), 'wob-'));
    file = join(tmp, 'wob.xlsx');
    writeFileSync(file, await get('https://energy.ec.europa.eu' + m[1].replace(/&amp;/g, '&'), 'buf'));
  }
  try {
    const wb = unzip(file, 'xl/workbook.xml'), rels = unzip(file, 'xl/_rels/workbook.xml.rels');
    const rid = wb.match(/<sheet [^>]*name="Prices with taxes"[^>]*r:id="(rId\d+)"/)?.[1];
    const target = rid && rels.match(new RegExp(`Id="${rid}"[^>]*Target="([^"]+)"`))?.[1];
    if (!target) throw new Error('WOB : feuille « Prices with taxes » introuvable');
    const ss = [...unzip(file, 'xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''));
    const xml = unzip(file, 'xl/' + target.replace(/^\/?xl\//, ''));
    const cells = (row) => Object.fromEntries([...row.matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)].map(([, c, a, b]) => {
      const v = b?.match(/<v>([^<]*)<\/v>/)?.[1];
      return [c, v === undefined ? null : /t="s"/.test(a) ? ss[Number(v)] : v];
    }));
    const rows = [...xml.matchAll(/<row [^>]*>([\s\S]*?)<\/row>/g)].map((m) => m[1]);
    const head = cells(rows[0]);
    const col = Object.keys(head).find((c) => head[c] === 'FR_price_with_tax_heating_oil');
    if (!col) throw new Error('WOB : colonne FR_price_with_tax_heating_oil introuvable');
    let best = null;
    for (const r of rows.slice(3)) {
      const c = cells(r), serial = Number(c.A), v = Number(c[col]);
      if (!Number.isFinite(serial) || serial < 40000 || !Number.isFinite(v) || v <= 0) continue;
      if (!best || serial > best.serial) best = { serial, v };
    }
    if (!best) throw new Error('WOB : aucune ligne France');
    const date = new Date(Date.UTC(1899, 11, 30) + best.serial * 86400000).toISOString().slice(0, 10);
    return { date, eur: check('WOB fioul', Math.round(best.v * 100) / 100, 600, 4000) };
  } finally {
    if (tmp) rmSync(tmp, { recursive: true, force: true });
  }
}

/* ---------- Écriture ---------- */
const P = JSON.parse(readFileSync(PARAMS, 'utf8'));
const avant = JSON.stringify(P);
const log = [], erreurs = [];
const step = async (nom, f, apply) => {
  try { const r = await f(); apply(r); log.push(`${nom} : ${JSON.stringify(r)}`); } catch (e) { erreurs.push(`${nom} : ${e.message} (valeur de la veille gardée)`); }
};

await step('Emmy classique', () => emmy(false), (r) => {
  P.cee.prix_mwh.mois = r.mois; P.cee.prix_mwh.classique = r.prix;
  P.cee.prix_mwh.classique_2026 = [Math.min(...r.annee), Math.max(...r.annee)];
});
await step('Emmy précarité', () => emmy(true), (r) => { P.cee.prix_mwh.precarite = r.prix; P.cee.prix_mwh.precarite_2026 = r.annee; });
await step('CRE Base 9 kVA', cre, (r) => { Object.assign(P.energie.electricite, { date: r.date, kwh_ttc: r.kwh, abonnement_9kva_ttc: r.abo }); });
await step('Eurostat gaz', eurostat, (r) => { Object.assign(P.energie.gaz, { periode: r.periode, kwh_ttc: r.kwh }); });
await step('WOB fioul', wob, (r) => { Object.assign(P.energie.fioul, { date: r.date, eur_1000l_ttc: r.eur }); });

for (const l of log) console.log('✓', l);
for (const e of erreurs) console.warn('✗', e);
const jour = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
if (DRY) { console.log(JSON.stringify(P) === avant ? 'aucun changement' : 'changements détectés (non écrits : --dry)'); process.exit(0); }
if (log.length) {
  writeFileSync(PARAMS, JSON.stringify(P, null, 2) + '\n');
  writeFileSync(FICHIER, JSON.stringify({ fichier: jour }) + '\n');
  console.log(JSON.stringify(P) === avant ? `aucun prix changé ; relevé daté du ${jour}` : `params-2026.json réécrit ; relevé daté du ${jour}`);
}
process.exit(log.length ? 0 : 1);
