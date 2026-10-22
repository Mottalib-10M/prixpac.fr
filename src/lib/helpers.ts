/** Fabrique les outils d'écriture (`Helpers`) passés au corps de chaque guide. */
import { route, ROUTES, type Locale } from '../i18n/routes';
import { P } from './engine/params';
import type { SourceKey } from './engine/params';
import * as M from './engine/index';
import type { Helpers } from './guide-types';
import { formatMoney, formatNumber, formatPercent, displayDate } from './format';
import { LANG_TAGS } from '../data/site-config';
import { BUILD_TODAY } from './today';
import { depByCode } from './engine/pac';

const esc = (s: string | number) => String(s).replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;');

export function helpers(lang: Locale): Helpers {
  return {
    lang, P, M, today: BUILD_TODAY, dep: depByCode,
    a: (id, text) => (ROUTES.some((r) => r.id === id) ? `<a href="${route(id, lang)}">${text}</a>` : text),
    eur: (n, d = 0) => formatMoney(n, d, lang),
    num: (n, d = 0) => formatNumber(n, d, lang),
    pct: (x, d = 1) => formatPercent(x, d, lang),
    date: (iso) => displayDate(iso, LANG_TAGS[lang]),
    moisCee: new Date(`${P.cee.prix_mwh.mois}-01T00:00:00Z`).toLocaleDateString(LANG_TAGS[lang], { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    dateElec: displayDate(P.energie.electricite.date, LANG_TAGS[lang]),
    periodeGaz: ((y: string, s: string) => (lang === 'fr' ? `${s === 'S1' ? '1er' : '2d'} semestre ${y}` : `${s === 'S1' ? 'first' : 'second'} half of ${y}`))(...(P.energie.gaz.periode.split('-') as [string, string])),
    src: (key: SourceKey, text?: string) => { const s = P.sources[key]; return `<a href="${s.url}" target="_blank" rel="nofollow noopener noreferrer">${text ?? s.label[lang]}</a>`; },
    table: (headers, rows, caption, align = []) => {
      const al = (i: number) => (align[i] === 'r' ? 'text-right' : 'text-left');
      return `<div class="not-prose my-6 overflow-x-auto"><table class="w-full text-sm">${caption ? `<caption class="mb-2 text-left text-sm text-navy-600">${caption}</caption>` : ''}<thead><tr>${headers.map((h, i) => `<th scope="col" class="border-b border-navy-300 bg-navy-50 px-3 py-2 font-semibold text-navy-900 ${al(i)}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r, ri) => `<tr class="${ri % 2 ? 'bg-navy-50/40' : ''}">${r.map((c, i) => `<td class="tabular-nums border-b border-navy-100 px-3 py-2 text-navy-800 ${al(i)}">${typeof c === 'number' ? esc(formatNumber(c, 0, lang)) : c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    },
  };
}
