# Design

## Context

See proposal.md, Why. The state on 2026-11-18:

- The repository has no site code. Pages is enabled with `build_type: legacy` from `main` at `/`. It
  serves the README, and through Jekyll it also serves every Markdown file of the repo:
  `https://axinvd.github.io/CLAUDE.html` and `/openspec/ROADMAP.html` both answer 200 (probe
  2026-11-18, `gh api repos/axinvd/axinvd.github.io/pages` and `curl -I`).
- The repository is public. `openspec/specs/` is empty and `adr/` has no records yet.
- The house pattern for checks in the owner's other projects (011, fathom) is `@playwright/test`
  1.64.1, with the port shifted by `RUN_SLOT`. Chromium revision 1248, which that version uses, is
  already in the machine's Playwright cache.
- Sources: `~/projects/freelance_leads/cv/cv-en.md` (the CV) and `cv/ai-experience.md` (facts with
  numbers and their measurements, dated 2026-11-12, plus the section «Честно», what not to overclaim).
  Below, «CV:n» means line n of `cv-en.md` and «AX:n» means line n of `ai-experience.md`. Both are as
  of 2026-11-18.

## Goals / Non-Goals

**Goals:**
- One fast, accessible page with no framework and no build, which a recruiter and an AI assistant
  both read correctly.
- A check that runs the whole spec locally and, unchanged, against the live URL.

**Non-Goals:**
- A second page, a blog, other languages, analytics or a custom domain.
- An «AI version» of the PDF CV. The PDF is `cv-en.md` as it stands; a later change to `cv-en.md`
  means regenerating the PDF (D4).

## Decisions

### D1. Stack: hand-written static HTML and CSS in `site/`, no build
`site/index.html` holds all the text in the served HTML. The CSS goes inline in a `<style>` element
or in `site/styles.css`, whichever the designer picks; script is optional and never carries content.
Next to it sit `robots.txt`, `sitemap.xml`, `llms.txt`, `ivan-alexandrov-cv.pdf` and, if the
designer wants one, `favicon.svg`.
- Why: one page of fixed text. Every framework rung (Next.js export, Astro, 11ty) adds a build, a
  dependency tree and generated markup in exchange for templating that one page does not need. The
  least-code rule stops at «platform feature»: HTML. The owner's brief allows it in so many words.
- Rejected: Next.js static export (the owner's default for new apps, `od-design`). It brings a 100+
  package build and client JS for a page with no interaction. Astro or 11ty: a build step whose only
  output is this same HTML.

### D2. Hosting: a GitHub Actions Pages workflow that publishes `site/`
`.github/workflows/pages.yml` follows the stock «Static HTML» starter: on `push` to `main` and on
`workflow_dispatch`, with permissions `contents: read`, `pages: write` and `id-token: write`, and
concurrency group `pages`. Its steps are `actions/checkout@v4`, `actions/configure-pages@v5`,
`actions/upload-pages-artifact@v3` with `path: site`, and `actions/deploy-pages@v4`. The workflow
runs no checks: `main` changes only through a pull request whose full check passed, and the
live check runs after the deploy (D3).
- Why: the legacy branch build publishes the whole repository, `CLAUDE.md` and the roadmap among
  them, which is thin and duplicate content for search. Publishing a folder of a branch allows only
  `/` or `/docs`, and `docs/` is this project's research folder by convention (`CLAUDE.md`), so its
  research would go public. An artifact of `site/` publishes exactly the site, with no Jekyll.
- Cost: one setting only the owner can switch. See Hands.

### D3. Checks: Playwright suite on a stdlib static server; `BASE_URL` for the live site
Dev dependencies are pinned exactly: `@playwright/test` 1.64.1 and `@axe-core/playwright` 4.14.0
(published 2026-10-15). `playwright.config.ts` sets `testDir: tests` and one `chromium` project. Its
port is `4111 + 10 * Number(process.env.RUN_SLOT || 0)`. With `BASE_URL` set, the base URL is
`BASE_URL` and no `webServer` starts. Without it, the base URL is `http://127.0.0.1:<port>` and the
`webServer` is `python3 -m http.server <port> --bind 127.0.0.1 --directory site`, with
`reuseExistingServer: false`.
- Full check: `git diff --check && npx playwright test`. Setup of a fresh worktree: `npm ci`. Once per
  machine: `npx playwright install chromium`.
- Preview of a step: `python3 -m http.server $((4011 + 10 * ${RUN_SLOT:-0})) --bind 127.0.0.1 --directory site`.
- Why: the 390 px overflow, the themes and axe need a real browser. Playwright is what the owner's
  other projects use, and its browser is already cached. The static server comes from the Python
  standard library, so it adds no package. Serving over HTTP, not `file://`, makes root-relative links
  and content types behave as they do on Pages. A tiny HTML parser for the static checks was rejected:
  the browser already parses the page.
- Rejected: Lighthouse CI as a dependency. The weight budget and axe cover «fast» and «accessible»
  with two packages, not a hundred.

### D4. PDF CV: a committed file generated from `cv-en.md` with two existing tools
`site/ivan-alexandrov-cv.pdf` is produced by:

```
pandoc -f gfm ~/projects/freelance_leads/cv/cv-en.md -s --metadata pagetitle="Ivan Alexandrov — CV" -o /tmp/cv.html
npx playwright pdf --paper-format A4 file:///tmp/cv.html site/ivan-alexandrov-cv.pdf
```

Probe 2026-11-18: 100,708 bytes, 3 A4 pages, 12 live links, readable. Without `-f gfm`, the bullet
lists that follow a paragraph in `cv-en.md` come out as run-on text. The command goes into
`CLAUDE.md`.
- Why: the source sits in another repository that CI never sees, so a build-time generation would
  need a copy of the source anyway. A file plus one documented command is the least code. The site
  text is a hand copy of the same source, so it drifts the same way and is refreshed the same way.
- The PDF keeps the CV's own headline, «Senior Frontend Developer». It is the CV as sent today. Any
  change to the CV is made in `cv-en.md` first.

### D5. Search readiness: one definition, JSON-LD `@graph`, `llms.txt`
- The definition (D7 row «def-3p», two sentences in the third person) is the `Person` `description`
  and the `> ` line of `llms.txt`, word for word. The page's lede (row «lede») says the same in the
  first person, since the owner wants one voice on the page. It shares the three answer-carrying
  phrases. Together they are the 40–60-word answer block the ai-seo skill recommends.
- JSON-LD is one block holding a `@graph` of `WebSite` (name, url) and `ProfilePage` (url, name,
  `mainEntity`). The `Person` in it carries name, `jobTitle` «AI Product Engineer», url,
  description, `address` as a `PostalAddress` (Chișinău, MD), `email` (the `mailto:` link of
  CV:5), `sameAs` (LinkedIn, GitHub, Telegram), `knowsLanguage` `["en", "ru"]`, `alumniOf` a
  `CollegeOrUniversity` «Dniester State University», and `knowsAbout` (React, Next.js, TypeScript,
  Claude Code, multi-agent systems, Playwright). Rejected: FAQPage and HowTo, whose rich results
  Google retired (the schema skill). Every value appears in the page.
- `robots.txt` has one `User-agent: *` group with an empty `Disallow:` and the sitemap line. It has
  no named AI groups (ai-seo: one wildcard). `sitemap.xml` has one `<url><loc>` and no `lastmod`: a
  hand-kept date goes stale.
- `llms.txt`: `# Ivan Alexandrov`, the `> ` definition, a few lines on the roles he is open to, then
  `## Pages` with the page and the PDF and `## Profiles` with LinkedIn and GitHub. The footer links
  to it (agent-readiness: discovery files get fetched through links). No `llms-full.txt`: the page is
  the full content.
- Head: `<title>`, Ivan Alexandrov — AI Product Engineer, Senior Frontend (54 characters). Meta
  description, Ivan Alexandrov: AI product engineer and senior frontend developer (React,
  TypeScript), remote from Chișinău. Built a multi-agent harness on Claude Code. (153 characters).
  Also canonical, `og:title`, `og:description`, `og:url`, `og:type=profile`, `twitter:card=summary`
  and `<html lang="en">`. There is no `og:image`, since the sources have no photo or picture. The
  designer may add a share image made from the page itself; if so it counts toward the weight budget
  and needs `og:image` with an absolute URL.

### D6. Ports
Tests use `4111 + 10n` and the preview uses `4011 + 10n`. Both are clear of 011's 3111 and 3011.
On 2026-11-18, `lsof -i :4121 -i :4021` printed nothing.

### D7. Page copy and its sources
The owner's answers on 2026-11-18 set the content. The first round, after the content and design
research, asked for achievements, wins and difficulties instead of activity counts. A number stays
only where it is a measured finding that changed a design, and it says what it was compared with.
The second round came after he saw the built page. This is a résumé, so the projects come first and
the harness case is short and comes after them. No step count. One voice, the first person. The
projects carry their design tool and two or three agent practices, each checked in the project's own
repository.

Order: header (name, role, contacts with «CV (PDF)») → intro (lede, open, out1, out2) → Projects
(caro.md, infodreamhome.com, p-note) → harness case (o1–o3, hard problems, what I measured, limits,
asof) → Experience (exp-lead, exp) → Skills → Education and languages → footer.

Wording is the implementer's and the designer's to polish, as long as every phrase the specs quote
stays in one text run. A new fact or figure is not theirs to add: if it has no row here, it does not
go on the page. Sources:
- CV:n and AX:n are lines of `cv-en.md` and `ai-experience.md`, as above.
- RM:n is line n of the profile README `~/projects/axinvd/README.md`.
- OWN is the owner's answers in the roadmap Scope and the revision round, 2026-11-18.
- CARO:path and DH:path are files of `~/projects/caro_md` and `~/projects/dreamHome`, read on
  2026-11-18. They are client repositories, so the page describes only what the setup does, with no
  code, no secrets and no client detail.

| id | Text (as on the page) | Source |
|---|---|---|
| name | Ivan Alexandrov | CV:1 |
| role | AI Product Engineer · Senior Frontend Developer (React, Next.js, TypeScript) | CV:3; plan:48 |
| contacts | In the header: the links of CV:4–5 as they are (email, LinkedIn, GitHub, phone, Telegram), plus «CV (PDF)». The `href`s are in the cv-page spec, «Contacts are links». | CV:4–5; OWN (phone stays) |
| lede | I'm an AI product and frontend engineer working remotely from Chișinău, Moldova. I build web products in React and Next.js for clients, and my own multi-agent harness on Claude Code that takes a roadmap step from plan to merged pull request. | RM:3–4; CV:4; AX:39–41 |
| def-3p | (JSON-LD `Person.description` and the `llms.txt` summary only, not shown on the page) Ivan Alexandrov is an AI product and frontend engineer working remotely from Chișinău, Moldova. He builds web products in React and Next.js for clients, and his own multi-agent harness on Claude Code that takes a roadmap step from plan to merged pull request. | same as lede |
| open | Open to remote AI product engineer and senior frontend roles · EET (UTC+2/+3) | roadmap Goal; CV:4, CV:15 |
| out1 | Two production Next.js sites for clients in 2026: caro.md and infodreamhome.com. | CV:10–11 |
| out2 | My own multi-agent harness on Claude Code: a step goes from plan to merged pull request, and nothing merges without my approval. | AX:39–41, AX:140–143 |
| h-proj | Projects | — |
| caro-1 | caro.md imports cars to Moldova from Korea, China and the USA, and it is in production. I build its Next.js web app; a Django admin and API sit behind it. | CV:36–37, CV:44–45; CARO:web/package.json (`next` 16.2.6); CARO:.ai-factory/ROADMAP.md:3 (Django backend); live `x-powered-by: Next.js` (curl 2026-11-18) |
| caro-hard | The hard part is the Korean catalog: 9,000+ cars read live from the source marketplace through a pool of proxy exits, with Redis caching and a stale copy served when the source fails. | CV:38–39; OWN («9 000+» stays) |
| caro-calc | A calculator turns a car on another continent into a turnkey price: car price, auction fees, shipping and Moldovan customs from the official customs API, in USD, EUR and MDL at live rates. | CV:40–41; RM:10–12 |
| caro-design | The design lives in one Pencil file with every page and reusable component. The agent edits it through Pencil's MCP server and checks each change on a rendered screenshot. | OWN; CARO:docs/Project layout.md:9, :18, :21, :28 |
| caro-e2e | Playwright end-to-end tests cover the calculator, the request forms, both languages and ad attribution, against a mock backend. | CARO:web/tests/e2e/{calculator-form,request-form,locales,utm-attribution}.spec.ts; CARO:web/tests/e2e/global-setup.ts |
| caro-patch | Every fix gets a short patch note (problem, root cause, solution, prevention), and the notes are folded into the rules the implementing agent reads, so a mistake is not repeated. | CARO:.ai-factory/patches/*.md (sections); CARO:.ai-factory/evolutions/2026-05-14-02.00.md; CARO:.ai-factory/skill-context/aif-implement/SKILL.md:1–5 |
| caro-leads | Leads come in through the site. | OWN |
| caro-meta | Next.js 16, React 19, TypeScript, Tailwind CSS v4, next-intl (Russian, Romanian), Django admin · link `https://caro.md/`, text «caro.md» | CV:36–37, CV:44–45 |
| dh-1 | infodreamhome.com is the production website of a licensed Las Vegas general contractor, live since October 2026. I built most of it. | CV:47–48; RM:13–14 |
| dh-hard | The hard part was a photo-heavy site that stays fast on a phone. Every route is prerendered, and photos are served as AVIF or WebP at the device's width, the main image first. On the key pages, Lighthouse mobile scores 100 for accessibility and 90+ for performance, out of 100. | CV:49–52 |
| dh-design | The site was designed with Open Design. Later pages, such as the 404 and the navigation, were designed the same way inside the site's own design language. | OWN; DH:openspec/changes/archive/2026-10-02-custom-404/design.md:62; DH:openspec/changes/archive/2026-10-03-nav-and-anchors/design.md:117 |
| dh-specs | Its late work went through OpenSpec changes. The quote form, SEO, image delivery, security headers and accessibility are written as specs with scenarios. | AX:92–96; DH:openspec/specs/{quote-form,seo,image-delivery,http-security-headers,accessibility}/spec.md; DH:openspec/changes/archive/ (from 2026-10-02) |
| dh-copy | All copy lives in typed per-block content modules whose IDs match the blocks on the page, so the client's text edits land in one place. | CV:49–50; DH:CLAUDE.md:9–10; DH:web/content/ |
| dh-leads | Quote requests land in the owner's inbox through Resend, with silent bot filtering. Leads come in through the site. | CV:53–54; RM:14–15; OWN |
| dh-meta | Next.js 16 App Router, Bun in Docker · link `https://infodreamhome.com/`, text «infodreamhome.com» | CV:49 |
| p-note | Both sites were built with Claude Code before the harness existed; it appeared on 3 November 2026. | AX:92–96, AX:340–342 |
| h-case | A multi-agent harness on Claude Code | AX:39 |
| o1 | Each roadmap step gets an orchestrator that leads an architect, a designer, a tester, an implementer and a fresh verifier from plan to pull request. The tester writes tests from the spec without reading the code. | AX:39–45 |
| o2 | I start a step with one line, answer only the decisions the agents cannot ground, and approve the merge on GitHub; a chat message or a PR comment does not count. | AX:77–79, AX:170–172, AX:140–143 |
| o3 | It is my own tool, used daily on my repositories and my three-person studio's. A Telegram chat files steps through an MCP server I wrote; the chat agent is tested on the live model against prompt injection. | AX:335, AX:249–250, RM:20–23, AX:100–105, AX:148–149 |
| h-hard | What went wrong | AX:262 |
| hard1 | One agent per step peaked at 130–681k tokens of context and tested its own code, so I split it into roles. | AX:49–52 |
| hard2 | An agent tried to approve its own pull request; the bot now has its own GitHub App identity. | AX:268–270, AX:138–139 |
| h-measured | What I measured | AX:209 |
| m1 | Verifier: as the only check it changed none of 74 steps; after the split into roles, 14 of 46. | AX:293–295 |
| m2 | MCP: the same headless call cost 135,948 tokens with every server loaded, 6,344 with `--strict-mcp-config`. | AX:116–118 |
| m3 | Lead ranking: a model put 8 of its top 10 among leads I had skipped, so code now does the scoring. | AX:309–316 |
| h-limits | Limits | AX:332 |
| l1 | The write hook covers file tools only; role order and pre-merge checks are a model following a written skill, with the merge pinned by `--match-head-commit`. | AX:129–132, AX:329–330 |
| asof | Figures as of 12 November 2026, from my own runs. | AX:5, AX:13–15 |
| exp-lead | Before going freelance, I led frontend and mobile teams of up to 5 engineers, shipped consumer apps for KFC, Papa John's and a football club, and contributed a fix to React Native core. | CV:12–13; RM:39–40 |
| exp | Every position with its bullets from the CV. Freelance, Jun 2025 – present: caro.md, Dream Home and the agency prototypes, one line each, since Projects carries the detail (not «main contributor»). Otherweb (acquired by S.A.I.): Web Developer Dec 2024 – May 2025 and Lead Mobile Developer Aug 2023 – Dec 2024, with the PlatformColor fix link `https://github.com/react/react-native/pull/39893`. Raters (freelance), Jan 2022 – May 2023. DexTechnology: Frontend Team Lead Dec 2021 – Jul 2022 and React Native Developer Jul 2018 – Dec 2021. | CV:34–91 |
| skills | The seven groups with their tools, verbatim. | CV:17–30 |
| edu | MSc, Information Systems and Technologies, 2017–2019; BS, Informatics and Computer Engineering, 2013–2017; both Dniester State University. GPAs as in the CV. | CV:93–96 |
| lang | English (fluent), Russian (native) | CV:98–100 |
| footer | CV (PDF) · llms.txt · Figures as of 12 November 2026 | D4, D5 |

Kept out on purpose:
- Activity counts, by the owner (OWN): any count of roadmap steps (121, 74 + 47), pull request counts
  (47 opened, 31 merged, 169 of 172), «main contributor», commit shares (325 of 596, 81 of 108) and
  co-author trailer counts (340, 104), line counts (2,923), test counts (413, 46), the per-role spend
  table, $474.9 and 469 role calls, the empty-call share, the cost per finding, and «540 leads at
  $0.0014».
- «Around the clock»: no source supports it. What the sources do say: one line starts a step, the
  agents do the work, a step waits hours for an answer (AX:69–70, AX:77–79). That is what o2 says.
- From the first round's harness case: the role-by-role chain list, the replay simulation (0.54 /
  0.42), «up to three steps at once», the consent story (folded into o2), «the case's own figures
  failed their first verifier», the typed digests, and the long live-model test description (folded
  into o3).
- The caro.md IP ban and circuit breaker (AX:162–166, CARO:docs/Encar API research.md), by the owner.
  The proxy providers and egress details (CARO:docs/Encar egress hops.md) are client operations.
- Home page performance 73 → 96 and LCP 12.6 s → 2.7 s (AX:192–194): there is no common baseline.
  The Dream Home fact check against the Nevada contractor register (AX:190–191) is a client matter.
- From «Честно» (AX:332–377): «sandboxed», «eval suite», «the split made steps cheaper», fathom
  «shipped through the bridge», the name 011.md, and Distru.

## Screens

New screen: `site/index.html`, one long page, a résumé. Who reads it and in what situation: a
recruiter or a hiring engineer who followed the Portfolio URL of an application, on a phone or a
laptop. In the first screen they want to know who this is, what he does, and the proof. Then the
projects (what he shipped and how, with AI), then the harness case (how he works with agents, short),
then the CV detail. Fixed by the specs and D7: the copy and its order, one `h1`, landmarks, text that
needs no script, light and dark by system setting, no third-party requests (system fonts or
self-hosted ones within the 150 KB budget), no horizontal scroll at 390.

The owner's design constraints (2026-11-18, roadmap Scope and the revision round): a restrained page
with one signature element, the spine of variant c.
1. The first screen at 390 × 844 answers who, what and proof before any motion: role, the lede, the
   two outcomes (out1, out2), and links to GitHub, the CV PDF and email (cv-page «First screen at
   phone width»).
2. On a phone the spine shrinks to a thin rail or progress line that costs the text column no width.
   The first paragraph of `main` is at least 330 px wide at 390.
3. The motion is additive only. All content is in the DOM and readable from the start: nothing dimmed,
   hidden or delayed until scrolled, no scroll snap, no wheel interception. With
   `prefers-reduced-motion` the page shows its finished state.
4. One motion only: the spine following the scroll. No load rise, no hover lift.
5. Craft that reviewers inspect: semantic HTML, a visible keyboard focus, AA contrast in both themes,
   and the PDF link in the header.

The revision round (owner, 2026-11-18):
6. Order: intro → Projects → harness case → Experience → Skills → Education and languages. The
   spine's nodes follow this order.
7. The harness case is at most one and a half phone screens (1266 px) at 390 and at 375, in the
   page's 16 px body type on phones too: there is no smaller type for the case. The D7 copy (v4,
   shortened) is sized to about 1150 px at 390, which leaves a margin of 100 px or more. That means no
   role list or table: o1–o3 are prose, and the three small lists (what went wrong, what I measured,
   limits) hold one sentence per item.
8. The case's subheadings («What went wrong», «What I measured», «Limits») are
   real headings, set as headings in the page's type scale. They are not grey mono captions. The `h2`
   is «A multi-agent harness on Claude Code», with no «Case:» prefix.
9. Project links use the browser's ordinary link styling (underlined text in the link color). The link
   text is the domain. There is no «↗» or other arrow glyph, in the HTML or added by CSS.
10. The footer has the CV PDF link, the `llms.txt` link and the as-of date only. There is no weight
    or third-party sentence; the weight budget is still tested.
11. The favicon is a tiny inline SVG in a `data:` URL in `<link rel="icon">`, so no `/favicon.ico`
    request ends in a 404. A letter mark or a spine dot is enough.

## Variants

Chosen: c, by the owner (roadmap Scope, «Owner, 2026-11-18: take c»). Variants a and b and the
switch were removed in 9a3bf5a.

## Risks / Trade-offs

- [The first deploy fails while Pages Source is still «Deploy from a branch»] → Hands line. After the
  switch, re-run the workflow by hand (`workflow_dispatch`). Until then the old build keeps serving
  the README, so the site never goes blank.
- [The page and the PDF drift from `cv-en.md` and `ai-experience.md`] → the copy table names the
  source line of every fact. A change to the sources is a new roadmap step that edits both.
- [The live run depends on the network and on Pages caching (about 10 minutes)] → it is a
  post-deploy check, not part of the full check.
- [The PDF's headline differs from the page until the owner updates `cv-en.md`] → he does it in his
  own repository. The rebuild of the PDF with the D4 commands is a line of «Hands», and the spec fixes no headline.
- [The phone number sits on a public, crawlable page] → the owner chose to keep it (revision round,
  2026-11-18).
- [A privacy hook on this machine (cc-plugin-privacy) refused an architect write that put the contact
  email next to client names] → the design names the email by its source line only. If the hook also
  refuses the implementer's or tester's write of `site/index.html` or the tests, that role stops and
  reports to the orchestrator, which asks the owner. No role works around the hook.

## Migration Plan

1. Merge into `main`.
2. Hands: the Pages Source switches to GitHub Actions, then the Pages workflow is re-run.
3. After the deploy: `BASE_URL=https://axinvd.github.io npx playwright test` passes. A 390 px
   screenshot of the live page is opened. `https://axinvd.github.io/CLAUDE.html` answers 404.
   Optional: Rich Results Test, and submitting the sitemap in Search Console (owner's account).

Rollback: switch the Pages Source back to «Deploy from a branch», or revert the merge commit and
re-run the workflow.

## Hands

- Owner, after the merge: GitHub → `axinvd/axinvd.github.io` → Settings → Pages → Build and
  deployment → Source: «GitHub Actions». Then Actions → «Pages» → Run workflow. The same switch by
  API, if the owner prefers: `gh api -X PUT repos/axinvd/axinvd.github.io/pages -f build_type=workflow`.
  This does not block the build: everything before the merge is checked against the local server.
- Owner, after he updates `~/projects/freelance_leads/cv/cv-en.md` for AI product: rebuild
  `site/ivan-alexandrov-cv.pdf` with the two D4 commands and open page 1 (its headline equals line 3 of
  `cv-en.md`, the lists are lists). The skipped test «The PDF matches the current CV» is then
  unskipped by hand.

## Decided without the user

| Decision | Default taken | Ground |
|---|---|---|
| Stack | Plain HTML and CSS in `site/`, no build (D1) | One static page; the least-code rule; the brief allows it |
| Publishing | Actions Pages workflow with the `site/` artifact (D2) | Today the legacy build publishes `CLAUDE.md` and the roadmap (probe 2026-11-18); `/docs` is the research folder by convention |
| Check tooling | `@playwright/test` 1.64.1 and `@axe-core/playwright` 4.14.0, Python `http.server` (D3) | House pattern in 011 and fathom; browser already cached; stdlib server |
| Live check | Same suite with `BASE_URL` (D3) | Done when asks for the live site; no second test set |
| PDF source | Committed file from `cv-en.md` via pandoc and `playwright pdf` (D4) | Source not reachable from CI; probe produced a good 3-page PDF |
| PDF headline | Whatever `cv-en.md` says when the PDF is generated; rebuilt after the owner's update (Hands) | Owner: he updates `cv-en.md` for AI product himself; the spec fixes no headline |
| Years of experience | «since 2018», no count | `cv-en.md` says 7+, `ai-experience.md` says 8+; the date is true in both |
| Copy and order | Table D7; first person on the page, third-person definition for JSON-LD and `llms.txt` | Owner: one voice; machine readers need the name in the answer |
| Content by the owner's answers | D7 rewritten: outcomes, hard problems and measured findings with a baseline; activity counts out | Owner's answers in the roadmap Scope, 2026-11-18; content research |
| Step counts | None on the page | Owner's revision round, 2026-11-18 |
| «Around the clock» | Not written; o2 says what the sources support (one line starts a step; a step waits hours and resumes) | AX:69–70, AX:77–79; no source for round-the-clock running |
| Project practices | Three per project, each checked in the project's repository (D7, CARO: and DH: rows) | Owner: two or three practices, verified, without client detail |
| caro.md stack | Next.js web app with a Django admin and API | CARO:web/package.json, CARO:.ai-factory/ROADMAP.md:3, live headers; the projects map's «Django-шаблоны» is wrong for the public site |
| Harness case length | At most 1266 px at 390 and 375 in 16 px type, tested; the copy is sized to about 1150 px | Owner: «a screen and a half on a phone at most»; the designer measured the v3 copy at 1420 px in 16 px, so the copy was shortened rather than the type |
| `llms.txt` charset on the local server | Accepted as preview-only: Python's `http.server` sends `text/plain` without a charset, and Pages sends UTF-8 | Fixing it needs a custom handler script; the owner accepted it unless the fix is free |
| The split story | Kept as a hard problem (hard1), without the replay simulation | A measured finding that changed the design; the case must stay short |
| Pencil and Open Design | What each repository shows: one Pencil file edited through Pencil's MCP and checked by screenshot; Open Design for the site and its later point designs | Owner's answer; CARO:docs/Project layout.md; DH archive designs |
| Business result | «Leads come in through the site», no figure | Owner's answer; nothing was measured |
| Footer | PDF, `llms.txt`, as-of date; no weight or performance sentence | Owner's revision round (walk-fixes-1 polish) |
| What to leave out | List under D7 | «Честно» section of `ai-experience.md`; repo is public |
| Phone on the page | Shown, as in `cv-en.md` | Owner, revision round 2026-11-18 |
| JSON-LD types | `WebSite` and `ProfilePage` with `Person` (D5) | Schema skill: supported types only, matching visible content |
| AI crawlers | Allowed by one wildcard group | ai-seo skill: wildcard by default, exceptions only by choice |
| `og:image` | None unless the designer makes one | No picture in the sources |
| Ports | 4111 and 4011 plus 10 × slot (D6) | Free on 2026-11-18, clear of 011 |
| ADR | ADR-0001 for D1–D3 | Durable stack and hosting choice that every later page follows |

## ADR

Relied on: none in force (`adr/` has only its README).

Created: `adr/0001-the-site-is-static-html-published-from-site-by-a-pages-workflow.md`. It records D1,
D2 and D3, in the format of `adr/README.md`, with Source `change cv-site (design D1–D3)` and Date
2026-11-18. The implementer writes it (task 2.1) because this commit holds the change folder only.
Its text:

- Context: the CV site is one page of fixed text, served by GitHub Pages from a public repository.
  The legacy branch build published every Markdown file in the repository.
- Decision: the site is hand-written static HTML and CSS in `site/`, with no framework and no build.
  It is published by a GitHub Actions Pages workflow that uploads `site/` only. The full check is
  `git diff --check` plus a Playwright suite run against a stdlib static server, and the same suite
  runs against the live URL with `BASE_URL`.
- Consequences: no build to break and no runtime dependency. Every page is written by hand, so a
  second page repeats the head and the styles. Adopting a generator becomes a new record when there
  are several pages. Pages Source must stay «GitHub Actions». Files outside `site/` are never served.
