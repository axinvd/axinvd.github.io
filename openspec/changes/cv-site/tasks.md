# Tasks

## Context

Read these and nothing else:

- Specs of this change: `openspec/changes/cv-site/specs/cv-page/spec.md`,
  `specs/search-readiness/spec.md`, `specs/site-deploy/spec.md`.
- `openspec/changes/cv-site/design.md`. D1–D6 are the stack, the deploy, the checks, the PDF, search
  readiness and the ports. D7 is the page copy with the source line of every fact, plus what is kept
  out. Then Screens, Hands, and the text of ADR-0001 under «ADR».
- Sources of the copy and the PDF: `~/projects/freelance_leads/cv/cv-en.md` and
  `~/projects/freelance_leads/cv/ai-experience.md`. Read them only at the lines D7 names.
- `CLAUDE.md` (its second paragraph is rewritten in 2.6) and `adr/README.md` (the ADR format).
- Contract tests from group 1, which the implementer does not edit: `tests/page.spec.ts`,
  `tests/search.spec.ts`, `tests/deploy.spec.ts`, and their harness `package.json`,
  `playwright.config.ts`, `.gitignore`.
- The designer's chosen variant in `site/`, if it is already in the branch. Build on it; do not
  restyle it.

Today (2026-11-18): `ls site .github package.json playwright.config.ts tests` prints «No such file or
directory» for all five, `ls adr` prints `README.md`, and `git diff --check` exits 0.

## 1. Contract tests

Tester. Write every test red from the scenarios, without reading `site/`. One `test()` per scenario,
titled with the scenario name.

- [ ] 1.1 Harness, per design D3. `package.json` (`"private": true`, devDependencies pinned exactly
  `@playwright/test` `1.64.1` and `@axe-core/playwright` `4.14.0`, script `"test": "playwright test"`),
  `package-lock.json` from `npm install`, `playwright.config.ts` (port `4111 + 10 * RUN_SLOT`;
  `BASE_URL` switches off the `webServer`; `webServer` `python3 -m http.server <port> --bind 127.0.0.1 --directory site`),
  and a `.gitignore` for `node_modules/`, `test-results/`, `playwright-report/`. Verify:
  `npx playwright test --list` lists every test below. Today: `npx --no-install playwright test` →
  `npm error npx canceled due to missing packages`.
- [ ] 1.2 `tests/page.spec.ts`, cv-page «A recruiter opens the Portfolio URL»: `lang`, one `h1`, role
  line, first paragraph of `main`.
- [ ] 1.3 cv-page «The page says what roles he is open to».
- [ ] 1.4 cv-page «Skill groups are shown».
- [ ] 1.5 cv-page «Positions, education and languages are shown».
- [ ] 1.6 cv-page «The role chain reads as text»: the nine terms appear in the given order in the
  harness section's text.
- [ ] 1.7 cv-page «Figures are shown with their date».
- [ ] 1.8 cv-page «Failures come with their fixes»: at least four items, with the four named topics.
- [ ] 1.9 cv-page «The case does not overclaim»: the required statements present, the four phrases
  absent (case-insensitive).
- [ ] 1.10 cv-page «Project links open the live sites»: `href`s and entry facts. No network call to
  the external sites.
- [ ] 1.11 cv-page «Contacts are links»: the five `href`s.
- [ ] 1.12 cv-page «The PDF CV downloads»: status, content type, `%PDF` magic bytes.
- [ ] 1.13 cv-page «A reviewer checks the copy»: a manual scenario. Write it as `test.skip` whose
  title points to the D7 table, so the list shows it.
- [ ] 1.14 cv-page «Phone width has no horizontal scroll»: at 390 x 844, `scrollWidth <= 390` and
  every element's `getBoundingClientRect().right <= 390`. Save a full-page screenshot to
  `test-results/` for the human look.
- [ ] 1.15 cv-page «Desktop width has no horizontal scroll» (1280 x 800).
- [ ] 1.16 cv-page «Dark preference gets the dark theme»: `colorScheme` emulated as `dark` and as
  `light`; computed `body` background and text colors differ.
- [ ] 1.17 cv-page «axe finds nothing serious»: AxeBuilder in both color schemes; no violation of
  impact `serious` or `critical`.
- [ ] 1.18 cv-page «Structure is navigable»: one each of `header`, `main`, `footer`; no heading-level
  jump greater than 1.
- [ ] 1.19 cv-page «No third-party requests»: every request's origin equals the page origin.
- [ ] 1.20 cv-page «Weight budget»: the sum of response body sizes, the PDF aside, is at most
  150 × 1024 bytes.
- [ ] 1.21 `tests/search.spec.ts`, search-readiness «robots.txt allows all and points to the
  sitemap».
- [ ] 1.22 search-readiness «The sitemap lists the canonical URL»: parse it with `DOMParser` in the
  page context; namespace, and exactly one `loc`.
- [ ] 1.23 search-readiness «Head tags are present and consistent»: canonical, `og:*`,
  `twitter:card`, title length at most 60, description 120–160, viewport, no `noindex`.
- [ ] 1.24 search-readiness «JSON-LD parses and matches the page»: `jobTitle` text present in
  `body.innerText`.
- [ ] 1.25 search-readiness «The three copies are identical»: first `p` of `main`,
  `Person.description` and the `> ` line of `/llms.txt`, whitespace collapsed.
- [ ] 1.26 search-readiness «llms.txt is in llmstxt.org shape».
- [ ] 1.27 search-readiness «The page links llms.txt».
- [ ] 1.28 search-readiness «JavaScript disabled»: a new context with `javaScriptEnabled: false`;
  the named elements are visible.
- [ ] 1.29 search-readiness «No broken internal link»: every same-origin `href` or `src` answers 200.
- [ ] 1.30 `tests/deploy.spec.ts`, site-deploy «The workflow uploads site/ only»: read
  `.github/workflows/pages.yml` from disk; check `path: site`, `actions/upload-pages-artifact`,
  `actions/deploy-pages`, the two permissions, and no `write` permission other than `pages`.
- [ ] 1.31 site-deploy «Triggers and concurrency»: `push` to `main`, `workflow_dispatch`,
  `concurrency`.
- [ ] 1.32 site-deploy «Repository files are not served»: `/CLAUDE.html` and `/openspec/ROADMAP.html`
  answer 404 against the base URL. This holds locally too, since the server serves `site/` only.
- [ ] 1.33 site-deploy «Local run» and «Live run after the deploy»: covered by the config itself.
  Write one test asserting `baseURL` is `BASE_URL` when set, else `http://127.0.0.1:<4111 + 10 × RUN_SLOT>`.
  The live run itself is a post-deploy step (Workflow follow-up).
- [ ] 1.34 Red run. Verify: `export RUN_SLOT=1 && npx playwright test` fails. Every test fails
  for the missing site (a 404, a missing element, or a missing workflow file), not for a test error.
  The exceptions are 1.32 and 1.33, which pass already: nothing outside `site/` is served, and the
  config is in place.
  Commit as `cv-site: tests`.

## 2. Site

Implementer. Each task is done when the named tests pass under
`export RUN_SLOT=1 && npx playwright test <file>`.

- [ ] 2.1 Write `adr/0001-the-site-is-static-html-published-from-site-by-a-pages-workflow.md` from
  design «ADR», in the format of `adr/README.md`. Verify: `ls adr` prints `0001-…` and `README.md`.
  Today: `README.md` only.
- [ ] 2.2 `site/index.html`, built on the designer's chosen variant if there is one: the copy of D7 in
  its order, landmarks, theme by `prefers-color-scheme`, no third-party request. Verify:
  `tests/page.spec.ts` passes except 1.12, which waits for 2.4. Today: no `site/`.
- [ ] 2.3 Search readiness, per D5: the head tags and the JSON-LD `@graph` in `site/index.html`, plus
  `site/robots.txt`, `site/sitemap.xml` and `site/llms.txt`, with the footer linking `llms.txt` and the
  PDF. Verify: `tests/search.spec.ts` passes.
- [ ] 2.4 Generate `site/ivan-alexandrov-cv.pdf` with the two commands of D4 (`-f gfm`, A4).
  Verify: `head -c 5 site/ivan-alexandrov-cv.pdf` prints `%PDF-`; the size is about 100 KB; test 1.12
  passes. Open page 1 as an image (`sips -s format png … --out /tmp/roadmap-run/cv-site/p1.png`) and
  look at it: the lists are lists, not run-on text.
- [ ] 2.5 `.github/workflows/pages.yml`, per D2. Verify: `tests/deploy.spec.ts` passes. Today: no
  `.github/`.
- [ ] 2.6 `CLAUDE.md`, second paragraph rewritten. Full check: `git diff --check && npx playwright test`.
  `setup`: `npm ci`, plus once per machine `npx playwright install chromium`. `RUN_SLOT=<n>`: tests on
  port `4111 + 10n`, preview on `4011 + 10n`. Preview command from D3. The PDF regeneration commands of
  D4. Live check after a deploy: `BASE_URL=https://axinvd.github.io npx playwright test`. PR preview:
  none, the step's preview is the local server. Verify: the full-check command exactly as written in
  `CLAUDE.md` passes with `export RUN_SLOT=1`. Today, `CLAUDE.md:8` reads «Полная проверка — пока
  `git diff --check`…».
- [ ] 2.7 Look at the page: raise the preview (`lsof -i :4021` empty first), then take screenshots
  with playwright-cli at 390 x 844 and 1280 x 800, each in light and dark. Open every image: no
  clipped text, the role chain readable, the tap targets of contacts and links clear of each other.
  Stop the server by the listener on its port. Then check every figure on the page against D7: each
  has a row, and none is new.

## 3. Integration

- [ ] 3.1 Full check from a clean tree. Verify: `export RUN_SLOT=1 && git diff --check && npx playwright test`
  passes with only the manual 1.13 skipped, and `git status --short` prints nothing after the commit
  `cv-site: apply`. Today: `git diff --check` exits 0, and the suite does not exist.

## Workflow follow-up

- After the merge: the owner switches Pages Source to «GitHub Actions» and re-runs the Pages workflow
  (design, Hands).
- After the deploy: `BASE_URL=https://axinvd.github.io npx playwright test` passes. A 390 px
  screenshot of the live page is opened. `https://axinvd.github.io/CLAUDE.html` answers 404. These are
  the step's Done when.
- Archive per `openspec/config.yaml` archive guidance: `openspec archive cv-site -y`, then
  `openspec validate --specs`.
