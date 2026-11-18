import { test, expect } from '@playwright/test';
import { open, missing, norm } from './helpers';

// Contract tests of the search-readiness spec (openspec/changes/cv-site/specs/search-readiness/spec.md).
// No literal email address here: the address is read from the page's own header link.

const CANON = 'https://axinvd.github.io/';
const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const collapse = (s: string) => s.replace(/\s+/g, ' ').trim();

test('robots.txt allows all and points to the sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const lines = (await res.text()).split(/\r?\n/).map((l) => l.trim());
  expect(lines.some((l) => /^user-agent:\s*\*$/i.test(l)), 'a «User-agent: *» group').toBe(true);
  expect(lines.filter((l) => /^disallow:\s*\S/i.test(l)), 'Disallow lines with a path').toEqual([]);
  expect(lines).toContain('Sitemap: https://axinvd.github.io/sitemap.xml');
});

test('The sitemap lists the canonical URL', async ({ page, request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  await page.goto('about:blank');
  const d = await page.evaluate((x) => {
    const doc = new DOMParser().parseFromString(x, 'application/xml');
    const ns = 'http://www.sitemaps.org/schemas/sitemap/0.9';
    return {
      error: doc.getElementsByTagName('parsererror').length > 0,
      ns: doc.documentElement.namespaceURI,
      locs: Array.from(doc.getElementsByTagNameNS(ns, 'loc')).map((l) => (l.textContent || '').trim()),
    };
  }, xml);
  expect(d.error, 'well-formed XML').toBe(false);
  expect(d.ns).toBe(SITEMAP_NS);
  expect(d.locs).toEqual([CANON]);
});

test('Head tags are present and consistent', async ({ page }) => {
  await open(page);
  const d = await page.evaluate(() => {
    const meta = (sel: string) => document.querySelector(sel)?.getAttribute('content') ?? null;
    return {
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
      ogUrl: meta('meta[property="og:url"]'),
      title: document.title,
      description: meta('meta[name="description"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogDescription: meta('meta[property="og:description"]'),
      ogType: meta('meta[property="og:type"]'),
      twitterCard: meta('meta[name="twitter:card"]'),
      viewport: meta('meta[name="viewport"]'),
      robots: Array.from(document.querySelectorAll('meta[name="robots" i]')).map((m) => m.getAttribute('content') || ''),
    };
  });
  expect(d.canonical).toBe(CANON);
  expect(d.ogUrl).toBe(d.canonical);
  expect(d.title.startsWith('Ivan Alexandrov'), `title «${d.title}» starts with the name`).toBe(true);
  expect(d.title.length, 'title length').toBeLessThanOrEqual(60);
  expect(d.description, 'a meta description').not.toBeNull();
  expect(d.description!.length, 'description length').toBeGreaterThanOrEqual(120);
  expect(d.description!.length, 'description length').toBeLessThanOrEqual(160);
  expect(missing(d.description!, ['AI product', 'frontend'])).toEqual([]);
  expect((d.ogTitle || '').length, 'og:title').toBeGreaterThan(0);
  expect(norm(d.ogTitle || ''), 'og:title describes the same person').toContain('ivan alexandrov');
  expect((d.ogDescription || '').length, 'og:description').toBeGreaterThan(0);
  expect(d.ogType).toBe('profile');
  expect(d.twitterCard).toBe('summary');
  expect(d.viewport || '', 'viewport meta').toContain('width=device-width');
  expect(d.robots.filter((r) => /noindex/i.test(r)), 'robots meta with noindex').toEqual([]);
});

// All JSON-LD nodes of the page, with @graph flattened.
async function jsonld(page: any) {
  return page.evaluate(() => {
    const out: { blocks: number; errors: string[]; nodes: any[] } = { blocks: 0, errors: [], nodes: [] };
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      out.blocks++;
      try {
        const j = JSON.parse(s.textContent || '');
        const walk = (x: any) => {
          if (Array.isArray(x)) return x.forEach(walk);
          if (x && typeof x === 'object') {
            out.nodes.push(x);
            if (x['@graph']) walk(x['@graph']);
          }
        };
        walk(j);
      } catch (e: any) {
        out.errors.push(String(e.message));
      }
    }
    return out;
  });
}

test('JSON-LD parses and matches the page', async ({ page }) => {
  await open(page);
  const ld = await jsonld(page);
  expect(ld.blocks, 'at least one JSON-LD block').toBeGreaterThan(0);
  expect(ld.errors, 'JSON-LD parse errors').toEqual([]);
  const types = (n: any) => ([] as string[]).concat(n['@type'] || []);
  const site = ld.nodes.find((n) => types(n).includes('WebSite'));
  expect(site, 'a WebSite').toBeTruthy();
  expect(site.url).toBe(CANON);
  const profile = ld.nodes.find((n) => types(n).includes('ProfilePage'));
  expect(profile, 'a ProfilePage').toBeTruthy();
  let person = profile.mainEntity;
  if (person && person['@id'] && !person['@type']) {
    person = ld.nodes.find((n) => n['@id'] === person['@id'] && types(n).includes('Person'));
  }
  expect(person && types(person), 'ProfilePage.mainEntity is a Person').toContain('Person');
  expect(person.name).toBe('Ivan Alexandrov');
  expect(person.url).toBe(CANON);
  expect(typeof person.jobTitle, 'a jobTitle').toBe('string');
  const page_ = await page.evaluate(() => ({
    body: document.body.innerText,
    mailto: document.querySelector('header a[href^="mailto:"]')?.getAttribute('href') ?? null,
  }));
  expect(norm(page_.body), `jobTitle «${person.jobTitle}» appears in the page text`).toContain(norm(person.jobTitle));
  expect(person.address?.addressLocality).toBe('Chișinău');
  expect(person.address?.addressCountry).toBe('MD');
  const same: string[] = ([] as string[]).concat(person.sameAs || []);
  expect(same).toContain('https://www.linkedin.com/in/axinvd/');
  expect(same).toContain('https://github.com/axinvd');
  if (person.email !== undefined) {
    expect(page_.mailto, "a header mailto: link to compare Person.email with").not.toBeNull();
    expect(person.email, "Person.email equals the header link's href").toBe(page_.mailto);
  }
});

test('The three copies are identical', async ({ page, request }) => {
  await open(page);
  const ld = await jsonld(page);
  const types = (n: any) => ([] as string[]).concat(n['@type'] || []);
  const person = ld.nodes.find((n) => types(n).includes('Person'));
  const firstP = await page.evaluate(() => (window.__t.firstP() as HTMLElement | null)?.innerText ?? null);
  const res = await request.get('/llms.txt');
  expect(res.status()).toBe(200);
  const quote = (await res.text()).split(/\r?\n/).find((l) => l.startsWith('> '));
  expect(firstP, 'a first paragraph in main').not.toBeNull();
  expect(person?.description, 'a Person description').toBeTruthy();
  expect(quote, 'a «> » line in llms.txt').toBeTruthy();
  const def = collapse(firstP!);
  expect(collapse(person.description)).toBe(def);
  expect(collapse(quote!.slice(2))).toBe(def);
});

test('llms.txt is in llmstxt.org shape', async ({ request }) => {
  const res = await request.get('/llms.txt');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toMatch(/^text\//);
  const text = await res.text();
  const lines = text.split(/\r?\n/);
  expect(lines[0]).toBe('# Ivan Alexandrov');
  expect(lines.slice(1).find((l) => l.trim() !== ''), 'a «> » summary line follows').toMatch(/^> /);
  expect(lines.some((l) => l.startsWith('## ')), 'a «## » section').toBe(true);
  expect(text).toContain('](https://axinvd.github.io/)');
  expect(text).toContain('](https://axinvd.github.io/ivan-alexandrov-cv.pdf)');
});

test('The page links llms.txt', async ({ page }) => {
  await open(page);
  const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href')));
  expect(hrefs).toContain('/llms.txt');
});

test('JavaScript disabled', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL: baseURL! });
  try {
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main p').first()).toBeVisible();
    await expect(page.locator('main p').first()).toContainText('Chișinău');
    const text = await page.locator('body').innerText();
    expect(missing(text, ['135,948', '6,344', 'none of 74 steps', '14 of 46', '8 of its top 10']), "the harness's measured findings").toEqual([]);
    const shown = [
      'a[href="https://caro.md/"]',
      'a[href="https://infodreamhome.com/"]',
      'a[href="/ivan-alexandrov-cv.pdf"]',
      'header a[href^="mailto:"]',
      'a[href="https://www.linkedin.com/in/axinvd/"]',
      'a[href="https://github.com/axinvd"]',
      'a[href="https://t.me/axinvd"]',
      'a[href="tel:+37378297494"]',
    ];
    for (const sel of shown) await expect(page.locator(sel).first(), sel).toBeVisible();
  } finally {
    await ctx.close();
  }
});

test('No broken internal link', async ({ page, request, baseURL }) => {
  await open(page);
  const urls: string[] = await page.evaluate(() => {
    const refs = Array.from(document.querySelectorAll('[href], [src]')).map((e) => (e as any).href || (e as any).src);
    return refs.filter((u: string) => typeof u === 'string' && u.startsWith(location.origin));
  });
  const unique = Array.from(new Set(urls.map((u) => u.split('#')[0])));
  expect(unique.length, `internal links on the page (origin ${new URL(baseURL!).origin})`).toBeGreaterThan(0);
  const bad: string[] = [];
  for (const u of unique) {
    const r = await request.get(u);
    if (r.status() !== 200) bad.push(`${r.status()} ${u}`);
  }
  expect(bad).toEqual([]);
});
