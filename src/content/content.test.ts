/**
 * Contrôle des pages de contenu avant le build (RECETTE §7, §11, §21) : titre 50-60 caractères,
 * description 150-160, bloc citable d'au moins 120 mots, FAQ propre à la page (réponses de 40 à 90
 * mots), liens associés existants, corps rendu sans erreur, mini-simulateurs connus.
 */
import { describe, it, expect } from 'vitest';
import { PAGES } from '../lib/guides';
import { helpers } from '../lib/helpers';
import { MINIS } from '../lib/mini-specs';
import { HOME } from './accueil';

const mots = (s: string) => s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const CORE = ['home', 'method', 'about', 'widget', 'contact', 'editorial', 'privacy', 'terms', 'cookies'];
const ids = new Set([...PAGES.map((p) => p.id), ...CORE]);

for (const lang of ['fr', 'en'] as const) {
  const H = helpers(lang);
  const textes = [...PAGES.map((p) => ({ id: p.id, x: p[lang], mini: p.mini })), { id: 'accueil', x: { ...HOME[lang], slug: '', nav: '', card: '' }, mini: undefined }];
  describe(`pages ${lang}`, () => {
    for (const { id, x, mini } of textes) {
      it(`${id} (${lang})`, () => {
        expect(x.title.length, `titre « ${x.title} »`).toBeGreaterThanOrEqual(50);
        expect(x.title.length, `titre « ${x.title} »`).toBeLessThanOrEqual(60);
        expect(x.description.length, `description « ${x.description} »`).toBeGreaterThanOrEqual(150);
        expect(x.description.length, `description « ${x.description} »`).toBeLessThanOrEqual(160);
        const r = x.resume(H);
        expect(mots(r), 'bloc citable ≥ 120 mots').toBeGreaterThanOrEqual(120);
        expect(r.includes('\n\n'), 'bloc citable en un seul paragraphe').toBe(false);
        const faqs = x.faqs(H);
        expect(faqs.length).toBeGreaterThanOrEqual(3);
        for (const f of faqs) {
          expect(mots(f.a), `FAQ « ${f.q} » : ${mots(f.a)} mots`).toBeGreaterThanOrEqual(40);
          expect(mots(f.a), `FAQ « ${f.q} » : ${mots(f.a)} mots`).toBeLessThanOrEqual(90);
        }
        const body = x.body(H);
        expect(body).not.toMatch(/undefined|NaN|\[object Object\]/);
        for (const m of body.matchAll(/<!--mini:([A-Za-z0-9]+)/g)) expect(MINIS[m[1]], `mini ${m[1]}`).toBeTruthy();
        if (mini) expect(MINIS[mini], `mini ${mini}`).toBeTruthy();
      });
    }
  });
}

describe('registre', () => {
  it('liens associés existants, slugs uniques', () => {
    for (const p of PAGES) for (const r of p.related) expect(ids.has(r), `${p.id} → ${r}`).toBe(true);
    for (const lang of ['fr', 'en'] as const) {
      const slugs = PAGES.map((p) => p[lang].slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
  it('questions de FAQ jamais reprises d’une page à l’autre', () => {
    for (const lang of ['fr', 'en'] as const) {
      const H = helpers(lang);
      const qs = [...PAGES.flatMap((p) => p[lang].faqs(H).map((f) => f.q)), ...HOME[lang].faqs(H).map((f) => f.q)];
      const dup = qs.filter((q, i) => qs.indexOf(q) !== i);
      expect(dup).toEqual([]);
    }
  });
  it('mini-simulateurs : chaque spec tourne avec ses valeurs par défaut', () => {
    for (const [k, f] of Object.entries(MINIS)) for (const l of ['fr', 'en'] as const) {
      const s = f(l), out = s.run(Object.fromEntries(s.inputs.map((i) => [i.id, i.def])));
      expect(out.head[1], `${k} ${l}`).not.toMatch(/NaN|undefined/);
      for (const [, v] of out.rows) expect(v, `${k} ${l}`).not.toMatch(/NaN|undefined/);
    }
  });
});
