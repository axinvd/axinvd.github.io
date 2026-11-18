# Tasks

## Context

Read these and nothing else:

- Specs of this change: `openspec/changes/cv-site/specs/cv-page/spec.md`,
  `specs/search-readiness/spec.md`, `specs/site-deploy/spec.md`.
- `openspec/changes/cv-site/design.md`. D1–D6 are the stack, the deploy, the checks, the PDF, search
  readiness and the ports. D7 is the page copy with the source line of every fact, plus what is kept
  out. Then Screens, Hands, and the text of ADR-0001 under «ADR».
- Sources of the copy and the PDF: `~/projects/freelance_leads/cv/cv-en.md`,
  `~/projects/freelance_leads/cv/ai-experience.md` and the profile README `~/projects/axinvd/README.md`.
  Read them only at the lines D7 names. The project facts (D7 rows tagged CARO: and DH:) were checked
  in `~/projects/caro_md` and `~/projects/dreamHome`. Do not read those repositories again unless a
  row is in doubt; they are client repositories, so no code or client detail goes onto the page. The
  owner's answers are in the `### cv-site` Scope of `openspec/ROADMAP.md` and in D7's intro.
- `CLAUDE.md` (its second paragraph is rewritten in 2.6) and `adr/README.md` (the ADR format).
- Contract tests from group 1, which the implementer does not edit: `tests/page.spec.ts`,
  `tests/search.spec.ts`, `tests/deploy.spec.ts`, and their harness `package.json`,
  `playwright.config.ts`, `.gitignore`.
- `site/index.html`, `site/style.css`, `site/script.js`, `site/llms.txt`: variant c, the owner's
  choice, built by the designer. Group 4 reworks it to D7 v3 and «Screens» 1–11.

Today (2026-11-18, d06d1cf): `ls site` prints `index.html variants`.
`ls .github package.json playwright.config.ts tests` prints «No such file or directory» for all four.
`ls adr` prints `README.md`, and `git diff --check` exits 0.

## 1. Contract tests

Tester. Write every test red from the scenarios, without reading `site/`. One `test()` per scenario,
titled with the scenario name.

- [x] 1.1 Harness, per design D3. `package.json` (`"private": true`, devDependencies pinned exactly
  `@playwright/test` `1.64.1` and `@axe-core/playwright` `4.14.0`, script `"test": "playwright test"`),
  `package-lock.json` from `npm install`, `playwright.config.ts` (port `4111 + 10 * RUN_SLOT`;
  `BASE_URL` switches off the `webServer`; `webServer` `python3 -m http.server <port> --bind 127.0.0.1 --directory site`),
  and a `.gitignore` for `node_modules/`, `test-results/`, `playwright-report/`. Verify:
  `npx playwright test --list` lists every test below. Today: `npx --no-install playwright test` →
  `npm error npx canceled due to missing packages`.
  → package.json, package-lock.json, playwright.config.ts, .gitignore: `npx playwright test --list` lists 41 tests
- [x] 1.2 `tests/page.spec.ts`, cv-page «A recruiter opens the Portfolio URL»: `lang`, one `h1`, role
  line, first paragraph of `main`.
  → tests/page.spec.ts: A recruiter opens the Portfolio URL
- [x] 1.3 cv-page «The page says what roles he is open to».
  → tests/page.spec.ts: The page says what roles he is open to
- [x] 1.4 cv-page «Two named outcomes follow the intro»: the intro block names caro.md,
  infodreamhome.com and the harness.
  → tests/page.spec.ts: Two named outcomes follow the intro
- [x] 1.5 cv-page «First screen at phone width»: at 390 × 844 with no scroll, `getBoundingClientRect().top < 844`
  for the `h1`, the role line, the first `p` of `main`, both outcome items and the GitHub, PDF and
  `mailto:` links.
  → tests/page.spec.ts: First screen at phone width
- [x] 1.6 cv-page «Skill groups are shown».
  → tests/page.spec.ts: Skill groups are shown
- [x] 1.7 cv-page «Positions, education and languages are shown».
  → tests/page.spec.ts: Positions, education and languages are shown
- [x] 1.8 cv-page «The role chain reads as text»: inside the harness section, the chain's list (or
  diagram) text holds the nine step names in the given order, matched case-insensitively. Match on the
  chain element, not on the whole section, since the outcome sentences name the roles too.
  → tests/page.spec.ts: The role chain reads as text
- [x] 1.9 cv-page «Measured findings are shown with their baseline and date»: the six quoted phrases
  (case-insensitive) and «as of 12 November 2026» in the harness section. The baseline clause, in the
  same sentence or the one before, is checked by the verifier against D7 (m1–m3).
  → tests/page.spec.ts: Measured findings are shown with their baseline and date
- [x] 1.10 cv-page «Hard problems come with their fixes»: three or four items, with the three named
  topics (own approval, comment as consent, the first verifier).
  → tests/page.spec.ts: Hard problems come with their fixes
- [x] 1.11 cv-page «How agents are checked, and the limits»: «live model», «prompt injection»,
  «file tools», «--match-head-commit» in the harness section.
  → tests/page.spec.ts: How agents are checked, and the limits
- [x] 1.12 cv-page «The case does not overclaim or count activity»: the required statements present (for
  the «built before the harness» sentence, «both sites» or the two names both pass),
  every listed phrase absent (case-insensitive, over `body.innerText`).
  → tests/page.spec.ts: The case does not overclaim or count activity
- [x] 1.13 cv-page «Project links open the live sites»: the two `href`s, with no network call to the
  external sites.
  → tests/page.spec.ts: Project links open the live sites
- [x] 1.14 cv-page «Each project leads with its hard part»: per entry, «9,000+», «stale copy»,
  «turnkey», «Pencil»; «Las Vegas», «100», «90+», «Open Design»; «leads come in» in both
  (case-insensitive).
  → tests/page.spec.ts: Each project leads with its hard part
- [x] 1.15 cv-page «Contacts are links»: the four literal `href`s inside `header`. For email, one
  `mailto:` link in `header` whose `href` matches `^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$` and whose
  visible text equals the address after `mailto:`. No literal email address anywhere in `tests/`:
  a privacy hook on this machine refuses it, and no role works around the hook.
  → tests/page.spec.ts: Contacts are links
- [x] 1.16 cv-page «The PDF CV downloads»: status, content type, `%PDF` magic bytes.
  → tests/page.spec.ts: The PDF CV downloads
- [x] 1.17 cv-page «A reviewer checks the copy»: a manual scenario. Write it as `test.skip` whose
  title points to the D7 table, so the list shows it.
  → tests/page.spec.ts: A reviewer checks the copy (test.skip, manual)
- [x] 1.18 cv-page «Phone width has no horizontal scroll»: at 390 × 844, `scrollWidth <= 390`, every
  element's `getBoundingClientRect().right <= 390`, and the first `p` of `main` at least 330 px wide.
  Save a full-page screenshot to `test-results/` for the human look.
  → tests/page.spec.ts: Phone width has no horizontal scroll
- [x] 1.19 cv-page «Desktop width has no horizontal scroll» (1280 × 800).
  → tests/page.spec.ts: Desktop width has no horizontal scroll
- [x] 1.20 cv-page «Content is readable at once»: right after load, with no scroll, the listed elements
  in `main` have computed opacity `1` and visibility `visible`.
  → tests/page.spec.ts: Content is readable at once
- [x] 1.21 cv-page «Scrolling is the browser's own»: `page.mouse.wheel(0, 800)`, then `scrollY` within
  700–900 after 500 ms; `scroll-snap-type` of `html` and `body` is `none`.
  → tests/page.spec.ts: Scrolling is the browser's own
- [x] 1.22 cv-page «One motion only»: `getAnimations()` of `header` and the intro, including their
  subtrees, is empty after load; after `hover()` on the first project entry and on a contact link,
  their computed `transform` is `none`.
  → tests/page.spec.ts: One motion only
- [x] 1.23 cv-page «Reduced motion shows the finished state»: `reducedMotion: 'reduce'`, scroll to the
  bottom, `document.getAnimations().length === 0`.
  → tests/page.spec.ts: Reduced motion shows the finished state
- [x] 1.24 cv-page «Dark preference gets the dark theme»: `colorScheme` emulated as `dark` and as
  `light`; computed `body` background and text colors differ.
  → tests/page.spec.ts: Dark preference gets the dark theme
- [x] 1.25 cv-page «axe finds nothing serious»: AxeBuilder in both color schemes; no violation of
  impact `serious` or `critical`.
  → tests/page.spec.ts: axe finds nothing serious
- [x] 1.26 cv-page «Structure is navigable»: one each of `header`, `main`, `footer`; no heading-level
  jump greater than 1.
  → tests/page.spec.ts: Structure is navigable
- [x] 1.27 cv-page «Focus is visible»: `keyboard.press('Tab')`, then the focused element's
  `outline-style` is not `none`, or its `box-shadow` is not `none`.
  → tests/page.spec.ts: Focus is visible
- [x] 1.28 cv-page «No third-party requests»: every request's origin equals the page origin.
  → tests/page.spec.ts: No third-party requests
- [x] 1.29 cv-page «Weight budget»: the sum of response body sizes, the PDF aside, is at most
  150 × 1024 bytes; the `footer` text contains «under 150 KB» and not «Lighthouse».
  → tests/page.spec.ts: Weight budget
- [x] 1.30 `tests/search.spec.ts`, search-readiness «robots.txt allows all and points to the
  sitemap».
  → tests/search.spec.ts: robots.txt allows all and points to the sitemap
- [x] 1.31 search-readiness «The sitemap lists the canonical URL»: parse it with `DOMParser` in the
  page context; namespace, and exactly one `loc`.
  → tests/search.spec.ts: The sitemap lists the canonical URL
- [x] 1.32 search-readiness «Head tags are present and consistent»: canonical, `og:*`,
  `twitter:card`, title length at most 60, description 120–160, viewport, no `noindex`.
  → tests/search.spec.ts: Head tags are present and consistent
- [x] 1.33 search-readiness «JSON-LD parses and matches the page»: `jobTitle` text present in
  `body.innerText`; `Person.email`, if present, equals the header `mailto:` link's `href`, with no
  literal address.
  → tests/search.spec.ts: JSON-LD parses and matches the page
- [x] 1.34 search-readiness «The three copies are identical»: first `p` of `main`,
  `Person.description` and the `> ` line of `/llms.txt`, whitespace collapsed.
  → tests/search.spec.ts: The three copies are identical
- [x] 1.35 search-readiness «llms.txt is in llmstxt.org shape».
  → tests/search.spec.ts: llms.txt is in llmstxt.org shape
- [x] 1.36 search-readiness «The page links llms.txt».
  → tests/search.spec.ts: The page links llms.txt
- [x] 1.37 search-readiness «JavaScript disabled»: a new context with `javaScriptEnabled: false`;
  the named elements are visible.
  → tests/search.spec.ts: JavaScript disabled
- [x] 1.38 search-readiness «No broken internal link»: every same-origin `href` or `src` answers 200.
  → tests/search.spec.ts: No broken internal link
- [x] 1.39 `tests/deploy.spec.ts`, site-deploy «The workflow uploads site/ only»: read
  `.github/workflows/pages.yml` from disk; check `path: site`, `actions/upload-pages-artifact`,
  `actions/deploy-pages`, the two permissions, and no `write` permission other than `pages`.
  → tests/deploy.spec.ts: The workflow uploads site/ only
- [x] 1.40 site-deploy «Triggers and concurrency»: `push` to `main`, `workflow_dispatch`,
  `concurrency`.
  → tests/deploy.spec.ts: Triggers and concurrency
- [x] 1.41 site-deploy «Repository files are not served»: `/CLAUDE.html` and `/openspec/ROADMAP.html`
  answer 404 against the base URL. This holds locally too, since the server serves `site/` only.
  → tests/deploy.spec.ts: Repository files are not served
- [x] 1.42 site-deploy «Local run» and «Live run after the deploy»: covered by the config itself.
  Write one test asserting `baseURL` is `BASE_URL` when set, else `http://127.0.0.1:<4111 + 10 × RUN_SLOT>`.
  The live run itself is a post-deploy step (Workflow follow-up).
  → tests/deploy.spec.ts: Local run and live run are one config: BASE_URL or the local server on site/
- [x] 1.43 Red run. Verify: `export RUN_SLOT=1 && npx playwright test` fails. Each failing test fails
  for what is missing: no PDF, no search files, no workflow, or a page element or text the D7 copy
  does not have yet. None fails from a test error. 1.41 and 1.42 pass already. Tests that pass on the
  designer's page as it stands are fine; list them in the report. Commit as `cv-site: tests`.
  → npx playwright test: red run, RUN_SLOT=1: 41 tests, 1 skipped, 30 pass, 10 red

## 2. Site

Implementer. Each task is done when the named tests pass under
`export RUN_SLOT=1 && npx playwright test <file>`.

- [x] 2.1 Write `adr/0001-the-site-is-static-html-published-from-site-by-a-pages-workflow.md` from
  design «ADR», in the format of `adr/README.md`. Verify: `ls adr` prints `0001-…` and `README.md`.
  Today: `README.md` only.
- [x] 2.2 `site/index.html`, built on the designer's chosen variant if there is one: the copy of D7 in
  its order, landmarks, theme by `prefers-color-scheme`, no third-party request. Verify:
  `tests/page.spec.ts` passes except 1.16, which waits for 2.4. Today: `site/index.html` already holds the D7 copy (designer commit 60354bc); the head, JSON-LD and the search files were missing.
- [x] 2.3 Search readiness, per D5: the head tags and the JSON-LD `@graph` in `site/index.html`, plus
  `site/robots.txt`, `site/sitemap.xml` and `site/llms.txt`, with the footer linking `llms.txt` and the
  PDF. Verify: `tests/search.spec.ts` passes.
- [x] 2.4 Generate `site/ivan-alexandrov-cv.pdf` with the two commands of D4 (`-f gfm`, A4).
  Verify: `head -c 5 site/ivan-alexandrov-cv.pdf` prints `%PDF-`; the size is about 100 KB; test
  1.16 passes. Open page 1 as an image (`sips -s format png … --out /tmp/roadmap-run/cv-site/p1.png`) and
  look at it: the lists are lists, not run-on text.
- [x] 2.5 `.github/workflows/pages.yml`, per D2. Verify: `tests/deploy.spec.ts` passes. Today: no
  `.github/`.
- [x] 2.6 `CLAUDE.md`, second paragraph rewritten. Full check: `git diff --check && npx playwright test`.
  `setup`: `npm ci`, plus once per machine `npx playwright install chromium`. `RUN_SLOT=<n>`: tests on
  port `4111 + 10n`, preview on `4011 + 10n`. Preview command from D3. The PDF regeneration commands of
  D4. Live check after a deploy: `BASE_URL=https://axinvd.github.io npx playwright test`. PR preview:
  none, the step's preview is the local server. Verify: the full-check command exactly as written in
  `CLAUDE.md` passes with `export RUN_SLOT=1`. Today, `CLAUDE.md:8` reads «Полная проверка — пока
  `git diff --check`…».
- [x] 2.7 Look at the page: raise the preview (`lsof -i :4021` empty first), then take screenshots
  with playwright-cli at 390 x 844 and 1280 x 800, each in light and dark. Open every image: no
  clipped text, the role chain readable, the tap targets of contacts and links clear of each other.
  Stop the server by the listener on its port. Then check every figure on the page against D7: each
  has a row, and none is new.

- [ ] 2.8 Rebuild the PDF after `cv-en.md` changes. The owner updates
  `~/projects/freelance_leads/cv/cv-en.md` for AI product in his own repository. After that lands,
  regenerate `site/ivan-alexandrov-cv.pdf` with the two D4 commands (`-f gfm`, A4). Verify: open page
  1 as an image and check that its headline equals line 3 of `cv-en.md` and the lists are lists
  (cv-page «The PDF matches the current CV»). `head -c 5` prints `%PDF-`, and «The PDF CV downloads»
  passes. Today: the PDF carries «Senior Frontend Developer», line 3 of the current `cv-en.md`.

## 3. Integration

- [x] 3.1 Full check from a clean tree. Verify: `export RUN_SLOT=1 && git diff --check && npx playwright test`
  passes with only the manual 1.17 skipped, and `git status --short` prints nothing after the commit
  `cv-site: apply`. Today: `git diff --check` exits 0, and the suite does not exist.

## 4. Revision round (owner, 2026-11-18)

The owner looked at the built page and answered. The changes are in design D7 (v3 copy), «Screens»
6–11, cv-page and search-readiness. Today (beb6e5b): `export RUN_SLOT=1 && npx playwright test` →
`40 passed, 1 skipped`.

Tester. Adapt `tests/` to the scenarios as they now read, without reading `site/`, then run the
suite and expect red on the old page.
- [ ] 4.1 Changed: cv-page «A recruiter opens the Portfolio URL». The first `p` of `main` contains
  «I build», and no sentence of it starts with «He ».
- [ ] 4.2 New: cv-page «Section order». The `h2` texts of `main` come in the given order, and none
  starts with «Case:».
- [ ] 4.3 Changed: cv-page «Project links open the live sites». The link texts are the domains, with
  no `↗`, `→` or `➚` in them.
- [ ] 4.4 New: cv-page «caro.md leads with its hard part and its practices», and «infodreamhome.com
  leads with its hard part and its practices». These replace «Each project leads with its hard part».
  Match each entry by its link to its domain.
- [ ] 4.5 New: cv-page «Leads, and when the sites were built». «leads come in through the site» in
  each entry, and the «built before the harness» sentence («both sites» or the two names).
- [ ] 4.6 New: cv-page «The case fits a screen and a half». At 390 × 844, the
  `getBoundingClientRect().height` of the harness `section` (the one with the `h2` «A multi-agent
  harness on Claude Code») is at most 1266.
- [ ] 4.7 Replaced: «The role chain reads as text» becomes «The pipeline and its control points read as
  text». The nine words come in order over the harness section's `innerText`, plus «one line» and
  «three-person studio».
- [ ] 4.8 Replaced: «Hard problems come with their fixes» becomes «Hard problems come with what
  changed». One or two items under the hard-problems `h3`, one naming the agent's own pull request
  and the GitHub App.
- [ ] 4.9 Changed: cv-page «Measured findings are shown with their baseline and date». No
  «121 roadmap steps»; the five figures and «as of 12 November 2026» in the harness section.
- [ ] 4.10 Replaced: «How agents are checked, and the limits» becomes «Live-model testing and the
  limits».
- [ ] 4.11 Replaced: «The case does not overclaim or count activity» becomes «The page does not
  overclaim or count activity», with the new forbidden phrases («121», «roadmap steps have run»,
  «around the clock»).
- [ ] 4.12 New, manual: cv-page «The PDF matches the current CV», as `test.skip` pointing to task
  2.8.
- [ ] 4.13 Changed: cv-page «No third-party requests and no errors». Also no response status ≥ 400
  during load.
- [ ] 4.14 New: cv-page «The icon is inline». Changed: «Weight budget» (no footer sentence). New:
  «The footer is plain».
- [ ] 4.15 Replaced: search-readiness «The three copies are identical» becomes «The definition
  copies agree». JSON-LD `Person.description` equals the `> ` line of `llms.txt` and starts with
  «Ivan Alexandrov is». It and the first `p` of `main` each contain the three phrases.
- [ ] 4.16 Red run. Verify: `export RUN_SLOT=1 && npx playwright test` fails, and only the tests of
  4.1–4.15 fail, each for the old page's content or order, not for a test error. Commit as
  `cv-site: tests — revision round`.

Designer, then implementer.
- [ ] 4.17 Designer: rebuild `site/index.html` and `site/style.css` to D7 v3 and «Screens» 1–11.
  That means the order, the short case, real subheadings, plain project links, the plain footer and
  the inline SVG favicon. Verify: the 4.x tests pass, and screenshots at 390 × 844 and 1280 × 800 in
  light and dark are opened. Commit `cv-site: page — revision round`.
- [ ] 4.18 Implementer: the JSON-LD `Person.description` and the `> ` line of `site/llms.txt` become
  D7 «def-3p». Verify: `tests/search.spec.ts` passes.
- [ ] 4.19 Full check. Verify: `export RUN_SLOT=1 && git diff --check && npx playwright test` passes,
  with only the manual tests skipped, and `git status --short` prints nothing after the commit.

## Workflow follow-up

- After the merge: the owner switches Pages Source to «GitHub Actions» and re-runs the Pages workflow
  (design, Hands).
- After the deploy: `BASE_URL=https://axinvd.github.io npx playwright test` passes. A 390 px
  screenshot of the live page is opened. `https://axinvd.github.io/CLAUDE.html` answers 404. These are
  the step's Done when.
- Archive per `openspec/config.yaml` archive guidance: `openspec archive cv-site -y`, then
  `openspec validate --specs`.
