import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { open, found, missing, norm } from './helpers';

// Contract tests of the cv-page spec (openspec/changes/cv-site/specs/cv-page/spec.md). One test per
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
    expect(missing(d.firstP!, ['Chișinău', 'remote', 'harness'])).toEqual([]);
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
        email: link('a[href^="mailto:"]'),
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

const SKILLS: Record<string, string[]> = {
  Frontend: [
    'React', 'Next.js', 'App Router', 'prerendering', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS',
    'React Hook Form', 'Zod', 'TanStack Query', 'Redux Toolkit', 'Redux Saga', 'RxJS', 'next-intl', 'i18n',
    'Storybook', 'Figma REST API',
  ],
  Quality: ['Playwright', 'Lighthouse', 'WCAG AA', 'Core Web Vitals', 'SEO', 'Sentry'],
  Mobile: ['React Native', 'Expo', 'native navigation', 'Fastlane', 'WatermelonDB', 'react-native-track-player', 'native modules'],
  'Backend & data': ['Node.js', 'NestJS', 'Hono', 'Prisma', 'PostgreSQL', 'Redis', 'Django admin', 'REST', 'GraphQL'],
  Integrations: ['Stripe', 'Clerk', 'Resend', 'Firebase', 'third-party APIs', 'proxies'],
  Delivery: ['GitHub Actions', 'Docker', 'Dokploy', 'Orval', 'ESLint', 'oxlint', 'Husky', 'Bun'],
  AI: ['OpenAI', 'Claude', 'real-time chat', 'SSE', 'Claude Code', 'GitHub Copilot'],
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
  const NINE = ['Orchestrator', 'Architect', 'Designer', 'Tester', 'Implementer', 'Verifier', 'Pull request', 'Approve', 'Merge'];

  test('The role chain reads as text', async ({ page }) => {
    await open(page);
    const d = await page.evaluate((nine) => {
      const t = window.__t;
      const r = t.region(/harness/);
      if (!r) return null;
      const inOrder = (txt: string) => {
        let at = 0;
        for (const n of nine) {
          const i = txt.indexOf(n.toLowerCase(), at);
          if (i < 0) return false;
          at = i + n.length;
        }
        return true;
      };
      const cands = t.leafMatches(r.els, (txt: string) => inOrder(txt));
      return cands.map((el: Element) => ({ tag: el.tagName, text: t.norm(el.textContent || '') }));
    }, NINE);
    expect(d, 'a heading naming the harness').not.toBeNull();
    expect(d!.length, 'an element of the harness section that holds the nine steps in order').toBeGreaterThan(0);
    // The chain element, not the whole section: it is small, and it is not a section or main.
    const chain = d!.find((c) => c.text.length <= 1500 && !['SECTION', 'MAIN', 'BODY', 'ARTICLE'].includes(c.tag));
    expect(chain, `a chain element of its own (found: ${d!.map((c) => c.tag + ':' + c.text.length).join(', ')})`).toBeTruthy();
    const txt = chain!.text;
    const pr = txt.indexOf('pull request', txt.indexOf('verifier'));
    const merge = txt.indexOf('merge', txt.indexOf('approve', pr));
    const approveStep = txt.slice(pr, merge);
    expect(approveStep, "the Approve step names GitHub").toContain('github');
    expect(/owner|\bmy\b|\bhis\b|ivan/.test(approveStep), "the Approve step is the owner's").toBe(true);
  });

  test('Measured findings are shown with their baseline and date', async ({ page }) => {
    await open(page);
    const text = await page.evaluate(() => {
      const r = window.__t.region(/harness/);
      return r ? r.lines.join(' ') : null;
    });
    expect(text, 'a heading naming the harness').not.toBeNull();
    expect(
      missing(text!, ['121 roadmap steps', '135,948', '6,344', 'none of 74 steps', '14 of 46', '8 of its top 10', 'as of 12 November 2026']),
    ).toEqual([]);
  });

  test('Hard problems come with their fixes', async ({ page }) => {
    await open(page);
    const d = await page.evaluate(() => {
      const t = window.__t;
      const r = t.region(/hardest problems|hard problems/);
      if (!r) return null;
      const lis = r.els.filter((e: Element) => e.tagName === 'LI');
      const dts = r.els.filter((e: Element) => e.tagName === 'DT');
      const arts = r.els.filter((e: Element) => e.tagName === 'ARTICLE');
      const ps = r.els.filter((e: Element) => e.tagName === 'P');
      // The items are the list items, or the definition terms, or the articles, or else the paragraphs.
      let items: string[];
      if (lis.length) items = lis.filter((l: Element) => !lis.some((o: Element) => o !== l && l.contains(o))).map((e: Element) => t.norm(e.textContent || ''));
      else if (dts.length) items = dts.map((e: Element) => t.norm((e.textContent || '') + ' ' + (e.nextElementSibling?.textContent || '')));
      else if (arts.length) items = arts.map((e: Element) => t.norm(e.textContent || ''));
      else items = ps.map((e: Element) => t.norm(e.textContent || ''));
      return items;
    });
    expect(d, 'a heading «The hardest problems…»').not.toBeNull();
    const items = d!;
    expect(items.length, `three or four problems (got ${items.length})`).toBeGreaterThanOrEqual(3);
    expect(items.length, `three or four problems (got ${items.length})`).toBeLessThanOrEqual(4);
    const has = (pred: (s: string) => boolean) => items.some(pred);
    expect(has((s) => s.includes('approve') && s.includes('own pull request')), 'an agent trying to approve its own pull request').toBe(true);
    expect(has((s) => s.includes('comment') && (s.includes('consent') || s.includes('approve'))), 'a PR comment taken as consent').toBe(true);
    expect(has((s) => s.includes('first verifier')), "the case's own numbers failing the first verifier").toBe(true);
    const fix = /\b(now|changed|instead|fix\w*|split|recount\w*|replac\w*|moved|since|so that|no longer)\b/;
    for (const s of items) expect(fix.test(s), `an item says what changed: «${s.slice(0, 80)}…»`).toBe(true);
  });

  test('How agents are checked, and the limits', async ({ page }) => {
    await open(page);
    const text = await page.evaluate(() => {
      const r = window.__t.region(/harness/);
      return r ? r.lines.join(' ') : null;
    });
    expect(text, 'a heading naming the harness').not.toBeNull();
    expect(missing(text!, ['live model', 'prompt injection', 'file tools', '--match-head-commit'])).toEqual([]);
  });

  test('The case does not overclaim or count activity', async ({ page }) => {
    await open(page);
    const body = await page.evaluate(() => document.body.innerText);
    const flat = norm(body);
    const sents = flat.split(/(?<=[.!?])\s+/);
    expect(
      sents.some((s) => s.includes('own tool') && s.includes('studio') && s.includes('repositories')),
      "a sentence says the harness is his own tool, used on his own and his studio's repositories",
    ).toBe(true);
    expect(
      sents.some(
        (s) =>
          s.includes('before the harness existed') &&
          s.includes('claude code') &&
          (s.includes('both sites') || (s.includes('caro.md') && s.includes('infodreamhome.com'))),
      ),
      'a sentence says caro.md and infodreamhome.com were built with Claude Code before the harness existed',
    ).toBe(true);
    const banned = [
      'sandboxed', 'eval suite', '011.md', 'Distru', 'main contributor', 'pull requests merged', '47 pull requests',
      '31 merged', '$474.9', '469 role calls', '413 tests', '2,923', '325 of 596', '81 of 108', 'circuit breaker', '407', 'IP ban',
    ];
    expect(found(body, banned), 'phrases the page must not contain').toEqual([]);
  });
});

test.describe('Projects', () => {
  // The entry of a site: the text under the heading that names it inside the Projects section; if
  // the entries have no headings of their own, the lines from the first mention of the site.
  async function entries(page: any) {
    return page.evaluate(() => {
      const t = window.__t;
      const r = t.region(/^projects$/);
      if (!r) return null;
      const entry = (site: string, other: string) => {
        const h = r.els.find((e: Element) => t.isHeading(e) && t.norm(e.textContent || '').includes(site));
        if (h) {
          const stop = t.endOf(h);
          return t.lines(h, stop).join(' ');
        }
        const a = r.lines.findIndex((l: string) => t.norm(l).includes(site));
        if (a < 0) return null;
        const b = r.lines.findIndex((l: string, i: number) => i > a && t.norm(l).includes(other));
        return r.lines.slice(a, b > a ? b : undefined).join(' ');
      };
      return {
        links: r.els.filter((e: Element) => e.tagName === 'A').map((e: Element) => e.getAttribute('href')),
        caro: entry('caro.md', 'infodreamhome.com'),
        dh: entry('infodreamhome.com', 'caro.md'),
      };
    });
  }

  test('Project links open the live sites', async ({ page }) => {
    await open(page);
    const d = await entries(page);
    expect(d, 'a heading «Projects»').not.toBeNull();
    expect(d.links).toContain('https://caro.md/');
    expect(d.links).toContain('https://infodreamhome.com/');
  });

  test('Each project leads with its hard part', async ({ page }) => {
    await open(page);
    const d = await entries(page);
    expect(d, 'a heading «Projects»').not.toBeNull();
    expect(d.caro, 'a caro.md entry').not.toBeNull();
    expect(d.dh, 'an infodreamhome.com entry').not.toBeNull();
    expect(missing(d.caro, ['9,000+', 'stale copy', 'turnkey', 'Pencil', 'leads come in']), 'caro.md entry').toEqual([]);
    expect(missing(d.dh, ['Las Vegas', 'Lighthouse', '100', '90+', 'Open Design', 'leads come in']), 'infodreamhome.com entry').toEqual([]);
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
  test('No third-party requests', async ({ page, baseURL }) => {
    const urls: string[] = [];
    page.on('request', (r) => urls.push(r.url()));
    await page.goto('/', { waitUntil: 'networkidle' });
    const origin = new URL(baseURL!).origin;
    const foreign = urls.filter((u) => /^https?:/.test(u) && new URL(u).origin !== origin);
    expect(foreign).toEqual([]);
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
    const footer = await page.locator('footer').innerText();
    expect(norm(footer)).toContain('under 150 kb');
    expect(norm(footer)).not.toContain('lighthouse');
  });
});
