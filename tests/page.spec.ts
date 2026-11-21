import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { open, found, missing, norm, pdfPage1Text } from './helpers';

// Contract tests of the cv-page spec (openspec/specs/cv-page/spec.md, as changed by
// openspec/changes/site-v2-sync/specs/cv-page/spec.md). One test per
// scenario, titled with the scenario's name. A phrase quoted in a scenario is matched in the visible
// text case-insensitively with whitespace collapsed; an href is matched exactly.

const PHONE = { width: 390, height: 844 };

// The email is checked by shape and by agreement with the page; no literal address in the tests.
const CONTACTS = [
  'https://www.linkedin.com/in/axinvd/',
  'https://github.com/axinvd',
  'https://t.me/axinvd',
  'tel:+37378297494',
];

test.describe('Who he is', () => {
  test('A recruiter opens the Portfolio URL', async ({ page }) => {
    await open(page);
    const d = await page.evaluate(() => {
      const t = window.__t;
      const parts = t.introParts();
      return {
        lang: document.documentElement.getAttribute('lang'),
        h1s: Array.from(document.querySelectorAll('h1')).map((h) => t.norm(h.textContent || '')),
        role: parts.role ? t.norm(parts.role.textContent || '') : null,
        firstP: parts.p ? t.norm(parts.p.textContent || '') : null,
      };
    });
    expect(d.lang).toBe('en');
    expect(d.h1s).toEqual(['ivan alexandrov']);
    expect(d.role, 'a role line after the h1 naming both roles').not.toBeNull();
    expect(missing(d.role!, ['AI Product Engineer', 'Senior Frontend'])).toEqual([]);
    expect(d.firstP, 'a paragraph in main').not.toBeNull();
    expect(missing(d.firstP!, ['Chișinău', 'remote', 'harness', 'I build'])).toEqual([]);
    const he = d.firstP!.split(/(?<=[.!?])\s+/).filter((x) => x.startsWith('he '));
    expect(he, 'sentences of the first paragraph that start with «He »').toEqual([]);
  });

  test('The page says what roles he is open to', async ({ page }) => {
    await open(page);
    const lines = await page.evaluate(() => window.__t.intro().lines);
    const ok = lines.some(
      (l) => missing(l, ['open to', 'remote', 'AI product engineer', 'senior frontend']).length === 0,
    );
    expect(ok, `no intro line says he is open to remote AI product engineer and senior frontend roles; intro lines: ${JSON.stringify(lines)}`).toBe(true);
  });

  test('Two named outcomes follow the intro', async ({ page }) => {
    await open(page);
    const d = await page.evaluate(() => {
      const t = window.__t;
      const p = t.introParts();
      return {
        text: t.intro().lines.join(' '),
        out1: p.out1 ? t.norm(p.out1.textContent || '') : null,
        out2: p.out2 ? t.norm(p.out2.textContent || '') : null,
        sameItem: !!p.out1 && !!p.out2 && (p.out1 === p.out2 || p.out1.contains(p.out2) || p.out2.contains(p.out1)),
      };
    });
    expect(missing(d.text, ['caro.md', 'infodreamhome.com', 'harness'])).toEqual([]);
    expect(d.out1, 'an outcome item naming caro.md and infodreamhome.com, apart from the definition').not.toBeNull();
    expect(d.out2, 'an outcome item naming the multi-agent harness on Claude Code, apart from the definition').not.toBeNull();
    expect(d.sameItem, 'the two outcomes are two items').toBe(false);
  });
});

test.describe('The first phone screen', () => {
  test.use({ viewport: PHONE });

  test('First screen at phone width', async ({ page }) => {
    await open(page);
    const tops = await page.evaluate(() => {
      const p = window.__t.introParts();
      const top = (el: Element | null) => (el ? el.getBoundingClientRect().top : null);
      const link = (sel: string) => top(document.querySelector(sel));
      return {
        scrollY: window.scrollY,
        h1: top(p.h1),
        role: top(p.role),
        firstParagraph: top(p.p),
        outcome1: top(p.out1),
        outcome2: top(p.out2),
        github: link('a[href="https://github.com/axinvd"]'),
        pdf: link('a[href="/ivan-alexandrov-cv.pdf"]'),
        email: link('header a[href^="mailto:"]'),
      };
    });
    expect(tops.scrollY).toBe(0);
    for (const [name, top] of Object.entries(tops)) {
      if (name === 'scrollY') continue;
      expect(top, `${name} exists`).not.toBeNull();
      expect(top as number, `${name} top edge is above 844 px`).toBeLessThan(844);
    }
  });
});

test('Section order', async ({ page }) => {
  await open(page);
  const d = await page.evaluate(() => ({
    h2: Array.from(document.querySelectorAll('main h2')).map((h) => window.__t.norm(h.textContent || '')),
    all: Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => window.__t.norm(h.textContent || '')),
  }));
  expect(d.h2).toEqual([
    'projects',
    'a multi-agent harness on claude code',
    'experience',
    'skills',
    'education and languages',
  ]);
  expect(d.all.filter((h) => h.startsWith('case:')), 'headings that start with «Case:»').toEqual([]);
});

// The groups in the order of cv-en.md (the spec fixes the order), each with tools from that file.
const SKILLS: Record<string, string[]> = {
  Frontend: [
    'React', 'Next.js', 'App Router', 'prerendering', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS',
    'React Hook Form', 'Zod', 'TanStack Query', 'Redux Toolkit', 'Redux Saga', 'RxJS', 'next-intl', 'i18n',
    'Storybook', 'Figma REST API',
  ],
  Quality: ['Playwright', 'Lighthouse', 'WCAG AA', 'Core Web Vitals', 'SEO', 'Sentry'],
  AI: [
    'Claude Code', 'MCP servers', 'live model', 'with-and-without-skill evals', 'OpenAI', 'real-time chat', 'SSE',
    'GitHub Copilot',
  ],
  Mobile: ['React Native', 'Expo', 'native navigation', 'Fastlane', 'WatermelonDB', 'react-native-track-player', 'native modules'],
  'Backend & data': ['Node.js', 'NestJS', 'Hono', 'Prisma', 'PostgreSQL', 'Redis', 'Django admin', 'REST', 'GraphQL', 'Python'],
  Integrations: ['Stripe', 'Clerk', 'Resend', 'Firebase', 'third-party APIs', 'proxies'],
  Delivery: ['GitHub Actions', 'Docker', 'Dokploy', 'Orval', 'ESLint', 'oxlint', 'Husky', 'Bun'],
};

test('Skill groups are shown', async ({ page }) => {
  await open(page);
  const lines = await page.evaluate(() => {
    const r = window.__t.region(/^skills$/);
    return r ? r.lines : null;
  });
  expect(lines, 'a heading «Skills»').not.toBeNull();
  const groups = Object.keys(SKILLS);
  // A group starts at the line that begins with its name, then «:», a dash, a dot or the line's end.
  const starts = groups.map((g) => {
    const re = new RegExp('^' + norm(g).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*([:·|-]|$)');
    return lines!.findIndex((l) => re.test(norm(l)));
  });
  groups.forEach((g, i) => expect(starts[i], `group «${g}» starts a line in the Skills section`).toBeGreaterThanOrEqual(0));
  expect(starts, 'the groups follow one another in the order of cv-en.md').toEqual([...starts].sort((a, b) => a - b));
  const order = starts.map((s, i) => [s, i]).sort((a, b) => a[0] - b[0]);
  order.forEach(([s, i], k) => {
    const end = k + 1 < order.length ? order[k + 1][0] : lines!.length;
    const body = lines!.slice(s, end).join(' ');
    expect(missing(body, SKILLS[groups[i]]), `tools of «${groups[i]}»`).toEqual([]);
  });
});

test('Positions, education and languages are shown', async ({ page }) => {
  await open(page);
  const d = await page.evaluate(() => {
    const r = window.__t.region(/^experience$/);
    return { exp: r ? r.lines.join(' ') : null, body: document.body.innerText };
  });
  expect(d.exp, 'a heading «Experience»').not.toBeNull();
  const exp = d.exp!;
  const near = (role: string, dates: string) => {
    const h = norm(exp);
    const d0 = norm(dates);
    const at = (s: string) => {
      const out: number[] = [];
      for (let i = h.indexOf(s); i >= 0; i = h.indexOf(s, i + 1)) out.push(i);
      return out;
    };
    const roles = at(norm(role));
    const ds = at(d0);
    return roles.some((r) => ds.some((x) => Math.abs(x - r) <= 120));
  };
  expect(missing(exp, ['Freelance']), 'the freelance position').toEqual([]);
  expect(near('Freelance', 'Jun 2025 – present'), 'Freelance with Jun 2025 – present').toBe(true);
  expect(missing(exp, ['Otherweb', 'Raters', 'DexTechnology'])).toEqual([]);
  // The freelance position (up to the next employer) names the harness as his own tool.
  const ne = norm(exp);
  const f0 = ne.indexOf('freelance');
  const next = ['otherweb', 'raters', 'dextechnology'].map((e) => ne.indexOf(e)).filter((i) => i > f0);
  const freelance = ne.slice(f0, next.length ? Math.min(...next) : undefined);
  expect(
    missing(freelance, ['multi-agent harness', 'Claude Code', 'not production at an employer']),
    'the freelance position names the multi-agent harness on Claude Code as «not production at an employer»',
  ).toEqual([]);
  const positions: Array<[string, string]> = [
    ['Web Developer', 'Dec 2024 – May 2025'],
    ['Lead Mobile Developer', 'Aug 2023 – Dec 2024'],
    ['Raters', 'Jan 2022 – May 2023'],
    ['Frontend Team Lead', 'Dec 2021 – Jul 2022'],
    ['React Native Developer', 'Jul 2018 – Dec 2021'],
  ];
  for (const [role, dates] of positions) expect(near(role, dates), `${role} with ${dates}`).toBe(true);
  expect(missing(d.body, ['Dniester State University']), 'the university').toEqual([]);
  expect(missing(d.body, ['Information Systems and Technologies', 'Informatics and Computer Engineering']), 'both degrees').toEqual([]);
  expect(missing(d.body, ['English', 'Russian']), 'both languages').toEqual([]);
  // Two degrees from the same university: the name appears at least twice or once with both degrees.
  expect(norm(d.body).includes('msc') && norm(d.body).includes('bs,'), 'MSc and BS').toBe(true);
});

test.describe('The harness case', () => {
  const NINE = ['orchestrator', 'architect', 'designer', 'tester', 'implementer', 'verifier', 'pull request', 'approve', 'merge'];
  const harnessText = async (page: any): Promise<string | null> =>
    page.evaluate(() => {
      const h = window.__t.harness();
      return h ? h.text : null;
    });

  for (const vp of [{ width: 390, height: 844 }, { width: 375, height: 812 }]) {
    test(`The case fits a screen and a half (${vp.width} × ${vp.height})`, async ({ page }) => {
      await page.setViewportSize(vp);
      await open(page);
      const d = await page.evaluate(() => {
        const h = window.__t.harness();
        if (!h || !h.section) return null;
        const sizes = Array.from(h.section.querySelectorAll('p')).map((p) => parseFloat(getComputedStyle(p).fontSize));
        return { height: h.section.getBoundingClientRect().height, sizes };
      });
      expect(d, 'a section holding the h2 «A multi-agent harness on Claude Code»').not.toBeNull();
      expect(d!.height, `height of the harness section at ${vp.width} px`).toBeLessThanOrEqual(1266);
      expect(d!.sizes.length, 'paragraphs in the harness section').toBeGreaterThan(0);
      expect(Math.min(...d!.sizes), 'smallest paragraph font-size in it').toBeGreaterThanOrEqual(16);
    });
  }

  test('The pipeline and its control points read as text', async ({ page }) => {
    await open(page);
    const text = await harnessText(page);
    expect(text, 'a section with the h2 «A multi-agent harness on Claude Code»').not.toBeNull();
    let at = 0;
    for (const w of NINE) {
      const i = text!.indexOf(w, at);
      expect(i, `«${w}» comes after the one before it`).toBeGreaterThanOrEqual(0);
      at = i + w.length;
    }
    expect(
      missing(text!, ['without reading the code', 'never edits them', 'one line', 'three-person studio', 'own tool']),
      'phrases of the pipeline part',
    ).toEqual([]);
    expect(missing(text!, ['chat message', 'comment', 'count']), 'a chat message or a PR comment does not count').toEqual([]);
  });

  test('Hard problems come with what changed', async ({ page }) => {
    await open(page);
    const items = await page.evaluate(() => {
      const t = window.__t;
      const r = t.region(/^what went wrong$/);
      if (!r) return null;
      const lis = r.els.filter((e: Element) => e.tagName === 'LI');
      const list = lis.length ? lis : r.els.filter((e: Element) => e.tagName === 'P');
      return list.filter((l: Element) => !list.some((o: Element) => o !== l && l.contains(o))).map((e: Element) => t.norm(e.textContent || ''));
    });
    expect(items, 'an h3 «What went wrong»').not.toBeNull();
    expect(items!.length, `one or two problems (got ${items!.length})`).toBeGreaterThanOrEqual(1);
    expect(items!.length, `one or two problems (got ${items!.length})`).toBeLessThanOrEqual(2);
    expect(
      items!.some((s) => s.includes('approve') && s.includes('own pull request') && s.includes('github app')),
      "an item names the agent's own pull request and the GitHub App",
    ).toBe(true);
    const fix = /\b(now|changed|instead|fix\w*|split|recount\w*|replac\w*|moved|since|so i|no longer)\b/;
    for (const s of items!) expect(fix.test(s), `an item says what changed: «${s.slice(0, 80)}…»`).toBe(true);
  });

  test('Measured findings are shown with their baseline and date', async ({ page }) => {
    await open(page);
    const text = await harnessText(page);
    expect(text, 'a harness section').not.toBeNull();
    expect(missing(text!, ['135,948', '6,344', 'none of 74 steps', '14 of 46', '90 roubles', '82.51', 'as of 18 November 2026'])).toEqual([]);
    expect(found(text!, ['121 roadmap steps']), 'no step count').toEqual([]);
    expect(missing(text!, ['copies pay as written', 'code converts it']), 'the pay-reading finding says what changed').toEqual([]);
    // Each finding says what its figure was compared with, in the sentence that holds the figure or the one just before.
    const raw = await page.evaluate(() => {
      const h = window.__t.harness();
      return h && h.section ? (h.section as HTMLElement).innerText : '';
    });
    const sents = raw.split(/\n+|(?<=[.!?])\s+/).map(norm).filter(Boolean);
    const at = (needle: string) => sents.findIndex((x) => x.includes(norm(needle)));
    const near = (a: string, b: string) => at(a) >= 0 && at(b) >= 0 && Math.abs(at(a) - at(b)) <= 1;
    expect(near('14 of 46', 'none of 74 steps'), 'the verifier: «14 of 46» next to its baseline «none of 74 steps»').toBe(true);
    expect(near('135,948', '6,344'), 'MCP: the two figures of one call in the same or neighbouring sentences').toBe(true);
    expect(sents.slice(Math.max(0, Math.min(at('135,948'), at('6,344')) - 1), Math.max(at('135,948'), at('6,344')) + 1).join(' '), 'the MCP finding names MCP').toContain('mcp');
    expect(near('90 roubles', '82.51'), 'pay: «90 roubles» next to the central bank rate «82.51»').toBe(true);
    expect(sents.slice(Math.max(0, Math.min(at('90 roubles'), at('82.51')) - 1), Math.max(at('90 roubles'), at('82.51')) + 1).join(' '), 'the rate «82.51» is the central bank\'s').toContain('central bank');
  });

  test('Live-model testing and the limits', async ({ page }) => {
    await open(page);
    const text = await harnessText(page);
    expect(text, 'a harness section').not.toBeNull();
    expect(
      missing(text!, ['chat agent', 'live model', 'prompt injection', 'hook', 'inside the project', 'file tools', 'written skill', '--match-head-commit']),
    ).toEqual([]);
  });

  test('The page does not overclaim or count activity', async ({ page }) => {
    await open(page);
    const body = await page.evaluate(() => document.body.innerText);
    const banned = [
      'sandboxed', 'eval suite', '011.md', 'Distru', 'main contributor', 'pull requests merged', '47 pull requests',
      '31 merged', '121', 'roadmap steps have run', 'around the clock', '$474.9', '469 role calls', '413 tests', '2,923',
      '325 of 596', '81 of 108', 'circuit breaker', '407', 'IP ban', '8 of its top 10', '130–681k',
    ];
    expect(found(body, banned), 'phrases the page must not contain').toEqual([]);
  });
});

test.describe('Projects', () => {
  const CARO = 'https://caro.md/';
  const DH = 'https://infodreamhome.com/';
  async function entry(page: any, href: string, other: string) {
    return page.evaluate(([h, o]: string[]) => {
      const e = window.__t.entryOf(h, o);
      return e ? { text: e.text, linkText: e.linkText } : null;
    }, [href, other]);
  }

  test('Project links open the live sites', async ({ page }) => {
    await open(page);
    const d = await page.evaluate(() => {
      const r = window.__t.region(/^projects$/);
      if (!r) return null;
      return r.els
        .filter((e: Element) => e.tagName === 'A')
        .map((e: Element) => ({
          href: e.getAttribute('href'),
          text: (e.textContent || '').replace(/\s+/g, ' ').trim(),
          pseudo: getComputedStyle(e, '::before').content + getComputedStyle(e, '::after').content,
        }));
    });
    expect(d, 'a heading «Projects»').not.toBeNull();
    for (const [href, text] of [[CARO, 'caro.md'], [DH, 'infodreamhome.com']]) {
      const l = d!.find((x: any) => x.href === href);
      expect(l, `a link to ${href}`).toBeTruthy();
      expect(l.text, `link text of ${href}`).toBe(text);
      expect(l.text + l.pseudo, 'no arrow glyph in the text or added by CSS').not.toMatch(/[↗→➚]/);
    }
  });

  test('caro.md leads with its hard part and its practices', async ({ page }) => {
    await open(page);
    const e = await entry(page, CARO, DH);
    expect(e, 'a caro.md entry (the ancestor of its link that holds no other project)').not.toBeNull();
    expect(missing(e.text, ['9,000+', 'stale copy', 'turnkey', 'Pencil', 'end-to-end', 'patch note'])).toEqual([]);
  });

  test('infodreamhome.com leads with its hard part and its practices', async ({ page }) => {
    await open(page);
    const e = await entry(page, DH, CARO);
    expect(e, 'an infodreamhome.com entry (the ancestor of its link that holds no other project)').not.toBeNull();
    expect(missing(e.text, ['Las Vegas', 'Lighthouse', '100', '90+', 'Open Design', 'scenarios', 'content modules', 'one validation module'])).toEqual([]);
  });

  test('Leads, and when the sites were built', async ({ page }) => {
    await open(page);
    const caro = await entry(page, CARO, DH);
    const dh = await entry(page, DH, CARO);
    expect(caro && dh, 'both project entries').toBeTruthy();
    expect(missing(caro.text, ['leads come in through the site']), 'caro.md entry').toEqual([]);
    expect(missing(dh.text, ['leads come in through the site']), 'infodreamhome.com entry').toEqual([]);
    const text = await page.evaluate(() => {
      const r = window.__t.region(/^projects$/);
      return r ? r.lines.join(' ') : '';
    });
    const sents = norm(text).split(/(?<=[.!?])\s+/);
    expect(
      sents.some(
        (s) =>
          s.includes('before the harness existed') &&
          s.includes('claude code') &&
          (s.includes('both sites') || (s.includes('caro.md') && s.includes('infodreamhome.com'))),
      ),
      'a sentence in Projects says both production sites were built with Claude Code before the harness existed',
    ).toBe(true);
    // A date (a month name with a day or a year) in a sentence that speaks of the harness. The sites' own
    // launch dates («live since October 2026») are not the harness's.
    const month = '(?:january|february|march|april|may|june|july|august|september|october|november|december)';
    const dated = sents.filter(
      (x) => /\bappeared on\b/.test(x) || (x.includes('harness') && new RegExp(`\\b${month}\\s+\\d|\\b\\d+\\s+${month}\\b`).test(x)),
    );
    expect(dated, 'sentences in Projects that give a date for when the harness appeared').toEqual([]);
  });
});

test('Contacts are links', async ({ page }) => {
  await open(page);
  const d = await page.evaluate(() =>
    Array.from(document.querySelectorAll('header a')).map((a) => ({
      href: a.getAttribute('href') || '',
      text: (a.textContent || '').replace(/\s+/g, ' ').trim(),
    })),
  );
  const hrefs = d.map((x) => x.href);
  for (const c of CONTACTS) expect(hrefs, `a link ${c} in the header`).toContain(c);
  const mails = d.filter((x) => x.href.startsWith('mailto:'));
  expect(mails.length, 'one mailto: link in the header').toBe(1);
  expect(mails[0].href).toMatch(/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/);
  expect(mails[0].text, 'its visible text is the same address').toBe(mails[0].href.slice('mailto:'.length));
});

test('The PDF CV downloads', async ({ request }) => {
  const res = await request.get('/ivan-alexandrov-cv.pdf');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toMatch(/^application\/pdf/);
  expect((await res.body()).subarray(0, 4).toString('latin1')).toBe('%PDF');
});

// The served PDF's page 1 holds line 3 of cv-en.md (design D3). Read through the suite's baseURL, so
// BASE_URL=… checks the deployed file. The source lives only on the owner's machine: absent, skip.
test('The PDF matches the current CV', async ({ request }) => {
  const cv = `${homedir()}/projects/freelance_leads/cv/cv-en.md`;
  test.skip(!existsSync(cv), `missing ${cv}`);
  const headline = readFileSync(cv, 'utf8').split(/\r?\n/)[2];
  const want = headline.replace(/\*\*/g, '').normalize('NFKC').replace(/\s+/g, '');
  const res = await request.get('/ivan-alexandrov-cv.pdf');
  expect(res.status()).toBe(200);
  const got = pdfPage1Text(await res.body());
  expect(got, `page 1 of the PDF contains line 3 of cv-en.md (${headline})`).toContain(want);
  expect(got, 'page 1 has no «**»: bold text and list items were rendered, not printed as Markdown').not.toContain('**');
});

// Manual: the verifier compares the page text with the copy table of design.md (D7).
test.skip('A reviewer checks the copy: each figure and claim on the page has a row in the D7 table of design.md', () => {});

test.describe('Fits a phone and a desktop', () => {
  test('Phone width has no horizontal scroll', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await open(page);
    const d = await page.evaluate(() => {
      const over = Array.from(document.body.querySelectorAll('*'))
        .filter((el) => !['SCRIPT', 'STYLE'].includes(el.tagName))
        .map((el) => ({ el, right: el.getBoundingClientRect().right }))
        .filter((x) => x.right > 390.01)
        .slice(0, 6)
        .map((x) => `${x.el.tagName.toLowerCase()}.${(x.el as HTMLElement).className || ''} right=${x.right}`);
      const p = window.__t.firstP();
      return { scrollWidth: document.documentElement.scrollWidth, over, pWidth: p ? p.getBoundingClientRect().width : null };
    });
    expect(d.scrollWidth, 'document scroll width').toBeLessThanOrEqual(390);
    expect(d.over, 'elements whose right edge passes 390 px').toEqual([]);
    expect(d.pWidth, 'a first paragraph in main').not.toBeNull();
    expect(d.pWidth!, 'first paragraph of main is at least 330 px wide').toBeGreaterThanOrEqual(330);
    // For the human look the scenario asks for: every block readable.
    await page.screenshot({ path: test.info().outputPath('phone-390.png'), fullPage: true });
  });

  test('Desktop width has no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page);
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(w).toBeLessThanOrEqual(1280);
  });
});

test.describe('Motion', () => {
  test('Content is readable at once', async ({ page }) => {
    await open(page);
    const bad = await page.evaluate(() =>
      Array.from(document.querySelectorAll('main p, main li, main h2, main h3, main dt, main dd, main a'))
        .map((el) => {
          const cs = getComputedStyle(el);
          return { el: el.tagName.toLowerCase() + ':' + (el.textContent || '').trim().slice(0, 30), opacity: cs.opacity, visibility: cs.visibility };
        })
        .filter((x) => x.opacity !== '1' || x.visibility !== 'visible'),
    );
    expect(bad).toEqual([]);
  });

  test("Scrolling is the browser's own", async ({ page }) => {
    await open(page);
    await page.mouse.move(640, 400);
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(500);
    const d = await page.evaluate(() => ({
      y: window.scrollY,
      html: getComputedStyle(document.documentElement).scrollSnapType,
      body: getComputedStyle(document.body).scrollSnapType,
    }));
    expect(d.y).toBeGreaterThanOrEqual(700);
    expect(d.y).toBeLessThanOrEqual(900);
    expect(d.html).toBe('none');
    expect(d.body).toBe('none');
  });

  test('One motion only', async ({ page }) => {
    await open(page);
    // The header and the intro (the h1, role line, definition, open line and outcomes) run nothing.
    const running = await page.evaluate(() => {
      const p = window.__t.introParts();
      const roots = [document.querySelector('header'), p.h1, p.role, p.p, p.open, p.out1, p.out2].filter(Boolean) as Element[];
      return roots.flatMap((r) => (r as any).getAnimations({ subtree: true }).map((a: Animation) => `${(a as any).animationName || (a as any).transitionProperty || a.constructor.name} on ${r.tagName.toLowerCase()}`));
    });
    expect(running, 'animations on the header and the intro').toEqual([]);
    // Hover the first project entry and a contact link: no lift.
    const marked = await page.evaluate(() => {
      const t = window.__t;
      const r = t.region(/^projects$/);
      if (!r) return false;
      const h = r.els.find((e: Element) => t.isHeading(e)) || r.els.find((e: Element) => e.tagName === 'A');
      if (!h) return false;
      const entry = (h as Element).closest('article, li, section') || h;
      (entry as HTMLElement).setAttribute('data-t-entry', '');
      const contact = document.querySelector('header a[href^="mailto:"]') || document.querySelector('header a');
      if (contact) contact.setAttribute('data-t-contact', '');
      return !!contact;
    });
    expect(marked, 'a project entry and a contact link to hover').toBe(true);
    for (const sel of ['[data-t-entry]', '[data-t-contact]']) {
      await page.locator(sel).first().hover();
      await page.waitForTimeout(400);
      const tf = await page.evaluate(
        (s) => {
          const el = document.querySelector(s)!;
          return [el, ...Array.from(el.querySelectorAll('a, h2, h3, li'))].map((e) => getComputedStyle(e).transform).filter((v) => v !== 'none');
        },
        sel,
      );
      expect(tf, `computed transform of ${sel} and its links while hovered`).toEqual([]);
    }
  });

  test('Reduced motion shows the finished state', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(600);
    const n = await page.evaluate(() => document.getAnimations().length);
    expect(n).toBe(0);
  });
});

test.describe('Themes and accessibility', () => {
  test('Dark preference gets the dark theme', async ({ page }) => {
    await open(page);
    const paint = async (scheme: 'dark' | 'light') => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.waitForTimeout(400);
      return page.evaluate(() => {
        // The background the reader sees: body's, or the root's when body is transparent.
        const bg = (el: Element) => getComputedStyle(el).backgroundColor;
        const clear = (c: string) => c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
        const body = bg(document.body);
        return { bg: clear(body) ? bg(document.documentElement) : body, color: getComputedStyle(document.body).color };
      });
    };
    const dark = await paint('dark');
    const light = await paint('light');
    expect(dark.bg, 'background color').not.toBe(light.bg);
    expect(dark.color, 'text color').not.toBe(light.color);
  });

  test('axe finds nothing serious', async ({ page }) => {
    await open(page);
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.waitForTimeout(400);
      const { violations } = await new AxeBuilder({ page }).analyze();
      const bad = violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id} (${v.impact}, ${v.nodes.length} nodes: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')})`);
      expect(bad, `axe in the ${scheme} theme`).toEqual([]);
    }
  });

  test('Structure is navigable', async ({ page }) => {
    await open(page);
    const d = await page.evaluate(() => ({
      header: document.querySelectorAll('header').length,
      main: document.querySelectorAll('main').length,
      footer: document.querySelectorAll('footer').length,
      levels: Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => Number(h.tagName[1])),
    }));
    expect(d.header, 'header elements').toBe(1);
    expect(d.main, 'main elements').toBe(1);
    expect(d.footer, 'footer elements').toBe(1);
    expect(d.levels[0], 'the first heading is the h1').toBe(1);
    const jumps = d.levels.map((l, i) => (i && l - d.levels[i - 1] > 1 ? `h${d.levels[i - 1]} → h${l} at heading ${i + 1}` : null)).filter(Boolean);
    expect(jumps, 'heading level jumps').toEqual([]);
  });

  test('Focus is visible', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab');
    const d = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const cs = getComputedStyle(el);
      return { tag: el.tagName, outline: cs.outlineStyle, shadow: cs.boxShadow };
    });
    expect(d.tag, 'Tab lands on a link').toBe('A');
    expect(d.outline !== 'none' || d.shadow !== 'none', `outline-style ${d.outline}, box-shadow ${d.shadow}`).toBe(true);
  });
});

test.describe('Light and self-contained', () => {
  test('No third-party requests and no errors', async ({ page, baseURL }) => {
    const urls: string[] = [];
    const bad: string[] = [];
    page.on('request', (r) => urls.push(r.url()));
    page.on('response', (r) => {
      if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    const origin = new URL(baseURL!).origin;
    const foreign = urls.filter((u) => /^https?:/.test(u) && new URL(u).origin !== origin);
    expect(foreign).toEqual([]);
    expect(bad, 'responses with status 400 or above').toEqual([]);
  });

  test('The icon is inline', async ({ page }) => {
    await open(page);
    const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll('link[rel~="icon"]')).map((l) => l.getAttribute('href') || ''));
    expect(hrefs.some((h) => h.startsWith('data:image/svg+xml')), `icon links: ${hrefs.map((h) => h.slice(0, 30)).join(', ')}`).toBe(true);
  });

  test('Weight budget', async ({ page }) => {
    const bodies: Array<Promise<{ url: string; size: number }>> = [];
    page.on('response', (r) => {
      if (/\.pdf($|\?)/.test(r.url())) return; // the PDF is not part of the budget
      bodies.push(r.body().then((b) => ({ url: r.url(), size: b.length }), () => ({ url: r.url(), size: 0 })));
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    const all = await Promise.all(bodies);
    const total = all.reduce((s, x) => s + x.size, 0);
    expect(total, `response bodies: ${all.map((x) => x.url.split('/').pop() + '=' + x.size).join(', ')}`).toBeLessThanOrEqual(150 * 1024);
  });

  test('The footer is plain', async ({ page }) => {
    await open(page);
    const d = await page.evaluate(() => {
      const f = document.querySelector('footer') as HTMLElement | null;
      return f ? { text: f.innerText, hrefs: Array.from(f.querySelectorAll('a')).map((a) => a.getAttribute('href')) } : null;
    });
    expect(d, 'a footer').not.toBeNull();
    expect(d!.hrefs).toContain('/ivan-alexandrov-cv.pdf');
    expect(d!.hrefs).toContain('/llms.txt');
    expect(norm(d!.text)).toContain('18 november 2026');
    expect(d!.text, 'no «KB» in the footer').not.toContain('KB');
    expect(norm(d!.text)).not.toContain('lighthouse');
  });
});
