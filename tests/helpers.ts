import { inflateSync } from 'node:zlib';
import type { Page } from '@playwright/test';

// Browser-side helpers, installed as window.__t. They find parts of the page by what the page says
// (headings, quoted phrases) and never by class names or ids, since the specs fix the text, not the
// markup. The function is serialised, so it must not use anything from this module.
function pageHelpers() {
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'HEAD']);

  // Case-insensitive, whitespace collapsed, every dash and quote one kind.
  const norm = (s: string): string =>
    String(s)
      .normalize('NFC')
      .replace(/[‐-―−]/g, '-')
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, ' ')
      .replace(/ ?- ?/g, '-')
      .trim()
      .toLowerCase();

  const levelOf = (el: Element): number => Number(el.tagName[1]);
  const isHeading = (el: Element): boolean => /^H[1-6]$/.test(el.tagName);
  const headings = (): Element[] =>
    Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).filter((h) => (h as HTMLElement).checkVisibility());

  // The visible text between two nodes in document order, one array item per line (a line is
  // what a block element holds). start: exclusive, null = from the body's start. stop: exclusive.
  function lines(start: Element | null, stop: Element | null): string[] {
    let out = '';
    let on = !start;
    let done = false;
    const rec = (n: Node): void => {
      if (done) return;
      if (n.nodeType === 3) {
        if (on) out += (n as Text).data.replace(/\s+/g, ' ');
        return;
      }
      if (n.nodeType !== 1) return;
      const el = n as Element;
      if (SKIP.has(el.tagName)) return;
      if (el === stop && on) {
        done = true;
        return;
      }
      if (el === start) {
        on = true;
        return;
      }
      const cs = getComputedStyle(el);
      if (cs.display === 'none') return;
      const block = !cs.display.startsWith('inline');
      if (on && (block || el.tagName === 'BR')) out += '\n';
      el.childNodes.forEach(rec);
      if (on && block) out += '\n';
    };
    rec(document.body);
    return out
      .split('\n')
      .map((l) => l.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }

  // The next heading after h in document order whose level is not deeper than h's.
  function endOf(h: Element): Element | null {
    const all = headings();
    const i = all.indexOf(h);
    for (let j = i + 1; j < all.length; j++) if (levelOf(all[j]) <= levelOf(h)) return all[j];
    return null;
  }

  const headingMatching = (re: RegExp): Element | null =>
    headings().find((h) => re.test(norm(h.textContent || ''))) || null;

  // Elements that sit after heading h and before the next heading of its level or higher.
  function elementsAfter(h: Element, stop: Element | null): Element[] {
    return Array.from(document.body.querySelectorAll('*')).filter((el) => {
      if (SKIP.has(el.tagName)) return false;
      const afterStart = h ? !!(h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) && !h.contains(el) : true;
      if (!afterStart) return false;
      if (!stop) return true;
      if (el.contains(stop) || el === stop) return false;
      return !!(stop.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING);
    });
  }

  const region = (re: RegExp) => {
    const h = headingMatching(re);
    if (!h) return null;
    const stop = endOf(h);
    return { heading: h, stop, lines: lines(h, stop), els: elementsAfter(h, stop) };
  };

  // The harness case: the h2 «A multi-agent harness on Claude Code» and the section that holds it.
  const harnessHeading = (): Element | null =>
    Array.from(document.querySelectorAll('main h2')).find((h) => /^a multi-agent harness on claude code$/.test(norm(h.textContent || ''))) || null;
  const harness = () => {
    const h = harnessHeading();
    if (!h) return null;
    const section = h.closest('section');
    const r = region(/^a multi-agent harness on claude code$/)!;
    return { h2: h, section, lines: r.lines, els: r.els, text: norm(section ? (section as HTMLElement).innerText : r.lines.join(' ')) };
  };

  // Everything before the first h2 of main: the intro block (the header is included).
  const intro = () => {
    const stop = document.querySelector('main h2');
    const els = Array.from(document.querySelectorAll('main *')).filter(
      (el) => !stop || (!el.contains(stop) && el !== stop && !!(stop.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING)),
    );
    return { stop, lines: lines(null, stop), els };
  };

  // The entry of a project: the highest ancestor of its link that does not hold the other project's
  // link, taken inside the Projects section.
  const entryOf = (href: string, otherHref: string): { el: Element; text: string; linkText: string } | null => {
    const r = region(/^projects$/);
    if (!r) return null;
    const a = r.els.find((e) => e.tagName === 'A' && e.getAttribute('href') === href);
    const other = r.els.find((e) => e.tagName === 'A' && e.getAttribute('href') === otherHref);
    if (!a) return null;
    let el: Element = a;
    while (el.parentElement && el.parentElement !== document.body && (!other || !el.parentElement.contains(other)) && el.parentElement.tagName !== 'MAIN') el = el.parentElement;
    return { el, text: norm((el as HTMLElement).innerText || el.textContent || ''), linkText: (a.textContent || '').replace(/\s+/g, ' ').trim() };
  };

  const firstP = (): Element | null => document.querySelector('main p');

  // Smallest elements (no child qualifies) whose text passes the test, in document order.
  function leafMatches(els: Element[], test: (t: string) => boolean): Element[] {
    const ok = els.filter((el) => (el as HTMLElement).checkVisibility() && test(norm(el.textContent || '')));
    return ok.filter((el) => !ok.some((o) => o !== el && el.contains(o)));
  }

  // The two outcome items of the intro, and the role line, as elements.
  function introParts() {
    const i = intro();
    const p = firstP();
    const out1 = leafMatches(i.els, (t) => t.includes('caro.md') && t.includes('infodreamhome.com')).find(
      (el) => !(p && (p === el || p.contains(el) || el.contains(p))),
    ) || null;
    const out2 = leafMatches(i.els, (t) => t.includes('harness') && t.includes('claude code')).find(
      (el) => !(p && (p === el || p.contains(el) || el.contains(p))),
    ) || null;
    const h1 = document.querySelector('h1');
    const roleCands = leafMatches(
      Array.from(document.body.querySelectorAll('*')),
      (t) => t.includes('ai product engineer') && t.includes('senior frontend'),
    ).filter((el) => h1 && !!(h1.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING));
    const role = roleCands[0] || null;
    const open = leafMatches(i.els, (t) => t.includes('open to') && t.includes('remote'))[0] || null;
    return { out1, out2, role, open, p, h1 };
  }

  // Sentences of a text, split after . ! ? followed by a space.
  const sentences = (s: string): string[] => s.split(/(?<=[.!?])\s+/);

  return { norm, headings, lines, endOf, headingMatching, region, intro, harness, entryOf, firstP, leafMatches, introParts, sentences, levelOf, isHeading };
}

declare global {
  interface Window {
    __t: ReturnType<typeof pageHelpers>;
  }
}

/** Opens path and installs the browser-side helpers as window.__t. */
export async function open(page: Page, path = '/'): Promise<void> {
  await page.goto(path);
  await install(page);
}

export async function install(page: Page): Promise<void> {
  await page.evaluate(`window.__t = (${pageHelpers.toString()})()`);
}

// Node-side twin of the page's norm(), for the needles.
export const norm = (s: string): string =>
  String(s)
    .normalize('NFC')
    .replace(/[‐-―−]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .replace(/ ?- ?/g, '-')
    .trim()
    .toLowerCase();

/** Phrases from `needles` that the haystack does not contain (both normalised). */
export function missing(haystack: string, needles: string[]): string[] {
  const h = norm(haystack);
  return needles.filter((n) => !h.includes(norm(n)));
}

/** Phrases from `needles` that the haystack contains. */
export function found(haystack: string, needles: string[]): string[] {
  const h = norm(haystack);
  return needles.filter((n) => h.includes(norm(n)));
}

/**
 * Text of page 1 of a PDF, whitespace removed and compatibility characters folded (NFKC), for the
 * test «The PDF matches the current CV» (design D3).
 *
 * Ceiling: it reads PDFs written by Chromium (Skia): plain objects, FlateDecode streams, Identity-H
 * fonts with a ToUnicode CMap. No object streams, no encryption, no literal-string text. Upgrade
 * path: `pdfjs-dist` if the PDF ever comes from another generator. It throws, it never guesses.
 */
export function pdfPage1Text(pdf: Buffer): string {
  const s = pdf.toString('latin1'); // one char per byte, so offsets in `s` are offsets in `pdf`
  const objs = new Map<number, { dict: string; stream: Buffer | null }>();
  for (const m of s.matchAll(/(\d+) \d+ obj\b/g)) {
    const start = m.index! + m[0].length;
    const end = s.indexOf('endobj', start);
    const body = s.slice(start, end);
    const at = body.indexOf('stream');
    let stream: Buffer | null = null;
    let dict = body;
    if (at >= 0) {
      dict = body.slice(0, at);
      const from = start + at + 'stream'.length + (body[at + 6] === '\r' ? 2 : 1);
      const to = s.indexOf('endstream', from);
      stream = pdf.subarray(from, to);
    }
    objs.set(Number(m[1]), { dict, stream });
  }
  const obj = (n: number) => {
    const o = objs.get(n);
    if (!o) throw new Error(`PDF object ${n} not found (object streams are not supported)`);
    return o;
  };
  const ref = (dict: string, key: string): number | null => {
    const m = dict.match(new RegExp(`/${key}\\s+(\\d+) \\d+ R`));
    return m ? Number(m[1]) : null;
  };
  const data = (n: number): string => {
    const { dict, stream } = obj(n);
    if (!stream) throw new Error(`PDF object ${n} has no stream`);
    return (/FlateDecode/.test(dict) ? inflateSync(stream) : stream).toString('latin1');
  };

  // Root /Pages, then the first /Kids entry down to a /Page.
  const root = [...objs.values()].find((o) => /\/Type\s*\/Catalog\b/.test(o.dict));
  if (!root) throw new Error('PDF has no /Catalog');
  let page = obj(ref(root.dict, 'Pages')!);
  while (/\/Type\s*\/Pages\b/.test(page.dict)) {
    const kid = page.dict.match(/\/Kids\s*\[\s*(\d+) \d+ R/);
    if (!kid) throw new Error('PDF /Pages has no /Kids');
    page = obj(Number(kid[1]));
  }

  // Fonts of the page: resource name -> ToUnicode map (hex source code -> text).
  let res = page.dict;
  const resRef = ref(page.dict, 'Resources');
  if (resRef) res = obj(resRef).dict;
  let fontDict = res.match(/\/Font\s*<<([^>]*)>>/)?.[1];
  const fontRef = ref(res, 'Font');
  if (fontRef) fontDict = obj(fontRef).dict;
  const fonts = new Map<string, { map: Map<string, string>; width: number }>();
  for (const f of (fontDict || '').matchAll(/\/(\S+)\s+(\d+) \d+ R/g)) {
    const tu = ref(obj(Number(f[2])).dict, 'ToUnicode');
    if (!tu) continue;
    const cmap = data(tu);
    const map = new Map<string, string>();
    const chars = (h: string) => (h.match(/.{4}/g) || []).map((c) => String.fromCharCode(parseInt(c, 16))).join('');
    for (const b of cmap.matchAll(/beginbfchar([\s\S]*?)endbfchar/g))
      for (const e of b[1].matchAll(/<([0-9a-f]+)>\s*<([0-9a-f]+)>/gi)) map.set(e[1].toLowerCase(), chars(e[2]));
    for (const b of cmap.matchAll(/beginbfrange([\s\S]*?)endbfrange/g))
      for (const e of b[1].matchAll(/<([0-9a-f]+)>\s*<([0-9a-f]+)>\s*(\[[^\]]*\]|<[0-9a-f]+>)/gi)) {
        const lo = parseInt(e[1], 16);
        const hi = parseInt(e[2], 16);
        const dsts = e[3].startsWith('[') ? [...e[3].matchAll(/<([0-9a-f]+)>/gi)].map((x) => chars(x[1])) : null;
        const base = dsts ? '' : chars(e[3].slice(1, -1));
        for (let c = lo; c <= hi; c++) {
          const out = dsts ? dsts[c - lo] : base.slice(0, -1) + String.fromCharCode(base.charCodeAt(base.length - 1) + (c - lo));
          if (out !== undefined) map.set(c.toString(16).padStart(e[1].length, '0'), out);
        }
      }
    const width = map.size ? [...map.keys()][0].length : 4;
    fonts.set(f[1], { map, width });
  }

  // The page's content streams: each hex string is shown with the font set by the last Tf.
  const cont = page.dict.match(/\/Contents\s*(\[[^\]]*\]|\d+ \d+ R)/)?.[1] || '';
  let text = '';
  let font: { map: Map<string, string>; width: number } | undefined;
  for (const c of cont.matchAll(/(\d+) \d+ R/g)) {
    for (const t of data(Number(c[1])).matchAll(/\/(\S+)\s+[\d.]+\s+Tf|<([0-9a-fA-F\s]+)>/g)) {
      if (t[1]) font = fonts.get(t[1]);
      else if (font) {
        const h = t[2].replace(/\s+/g, '').toLowerCase();
        for (let i = 0; i < h.length; i += font.width) text += font.map.get(h.slice(i, i + font.width)) ?? '';
      }
    }
  }
  return text.normalize('NFKC').replace(/\s+/g, '');
}
