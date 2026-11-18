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
- The definition (copy table, row «def»: two plain sentences, 43 words) is the first paragraph of
  `main`, the `Person` `description` and the `> ` line of `llms.txt`, word for word. It is the
  40–60-word answer block
  the ai-seo skill recommends.
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
The owner answered on 2026-11-18 (roadmap Scope, after the content and design research). The page
shows achievements, wins and difficulties, not counts of activity. A number stays only where it is a
measured finding that changed a design. Each one says what it was compared with, so any reader can
interpret it, and the as-of line dates them all.

Order: header (name, role, contacts with «CV (PDF)») → intro (def, open, out1, out2) → harness case
(o1–o4, chain, bridge, hard problems, what was measured, how agents are checked, limits, asof) →
projects (caro.md, infodreamhome.com, p-note) → experience (exp-lead, exp) → skills → education and
languages → footer.

Wording is the implementer's to polish, as long as a phrase the specs quote stays in one text run. A
new fact or figure is not: if it has no row here, it does not go on the page. The voice is first
person, except the definition, which is third person because it is also the JSON-LD description.
Sources: CV:n and AX:n as above. RM:n is line n of the profile README `~/projects/axinvd/README.md`.
OWN is the owner's answer in the roadmap Scope, 2026-11-18. «plan:48» is
`freelance_leads/docs/ai-product-engineer.md` line 48.

| id | Text (as on the page) | Source |
|---|---|---|
| name | Ivan Alexandrov | CV:1 |
| role | AI Product Engineer · Senior Frontend Developer (React, Next.js, TypeScript) | CV:3; plan:48 |
| contacts | In the header: the links of CV:4–5 as they are (email, LinkedIn, GitHub, phone, Telegram), plus «CV (PDF)». The `href`s are listed in the cv-page spec, «Contacts are links». | CV:4–5 |
| def | Ivan Alexandrov is an AI product and frontend engineer working remotely from Chișinău, Moldova. He builds web products in React and Next.js for clients and his own multi-agent harness on Claude Code, which takes a roadmap step from plan to merged pull request. | RM:3–4; CV:4; AX:39–41 |
| open | Open to remote AI product engineer and senior frontend roles · EET (UTC+2/+3) | roadmap Goal; CV:4, CV:15 |
| out1 | Two production Next.js sites for clients in 2026: caro.md and infodreamhome.com. | CV:10–11 |
| out2 | A multi-agent harness on Claude Code that takes a step from plan to merged pull request, and nothing merges without my approval. | AX:39–41, AX:140–143 |
| h-case | Case: a multi-agent harness on Claude Code | AX:39 |
| o1 | I ship software through a multi-agent harness I built on Claude Code. One orchestrator session per roadmap step leads an architect, a designer, a tester, an implementer and a fresh verifier, from the plan to the merged pull request. | AX:39–41; RM:16–18 |
| o2 | Nothing merges until I approve it on GitHub; a chat message or a PR comment does not count as approval. | AX:140–143; RM:18–19 |
| o3 | The tester writes the tests from the spec without reading the code, and the implementer may not edit them. | AX:44–45; RM:18 |
| o4 | 121 roadmap steps have run through it, with the cost of every role measured. It is my own tool, used daily on my and my studio's repositories. | AX:46–48, AX:335 |
| chain | Orchestrator (one session per step, keeps it until the merge) → Architect (turns the step into spec scenarios and tasks) → Designer (on screens: 2–3 variants on one preview) → Tester (tests from the spec, without the code) → Implementer (builds against them, may not edit them) → Verifier (a fresh agent checks the step) → Pull request (a draft until the verifier's ok) → Owner's Approve in GitHub → Merge (pinned to the reviewed head) | AX:39–45, AX:64, AX:71–72, AX:140–143, AX:170–172 |
| chain-par | Up to three steps run at once, each in its own git worktree. | AX:75–76 |
| bridge | tg-flow lets my studio start work from a Telegram chat. The chat agent has four tools through an MCP server I wrote. The only one that changes the repository, `write_step`, first passes a one-shot check agent that answers pass, return or ask. The bot acts on GitHub as its own app, never as me. | AX:100–105; RM:20–23 |
| h-hard | The hardest problems, and what I changed | AX:262 |
| hard1 | One agent per step did not scale. It peaked at 130–681k tokens of context, paid again for everything it had read on each of 100–180 apply calls, and wrote the tests for its own code. I split it into roles. A replay of real calls predicted peak context per agent at 0.54 of the single agent's, and total input at 0.42. That is a simulation, and I treat it as optimistic. | AX:49–52 |
| hard2 | An agent tried to approve its own pull request: the run wrote to GitHub under my login, and the permission classifier denied the approval. Now the bot acts as its own GitHub App, with a token scoped to one repository. | AX:268–270, AX:138–139 |
| hard3 | An «ok» in a PR comment archived a step, and two bridges acted on it. Now consent is a GitHub Approve, and the PR author and bots do not count. | AX:264–267 |
| hard4 | The figures of this very case failed their first verifier: two counts did not reproduce. I recounted them with the command written next to each figure, and the second verifier passed. | AX:296–300 |
| h-measured | What I measured | AX:209 |
| m1 | The verifier, before and after the split. When one agent built each step and a single verifier was the only check, the verifier changed none of 74 steps. Once the roles were split, it found something on 17 and changed 14 of 46 steps. | AX:293–295 |
| m2 | MCP schemas. The same headless call that answers «ok» cost 135,948 tokens with every MCP server loaded, and 6,344 with `--strict-mcp-config`: 21 times fewer. The flag now goes on every script call, and a test guards it. | AX:116–118 |
| m3 | Where code replaced a model. A model that ranked job leads by verdict put 8 of its top 10 among leads I had skipped myself. Now the model only extracts 15 facts by JSON schema, and a formula in code does the scoring. | AX:309–316 |
| h-check | How the agents are checked | AX:209 |
| k1 | The chat agent and the step check are tested on the live model, against prompt injection too: the real `claude -p` with the real agent definition, over a fake Telegram, a fake herdr and a fake GitHub. Among the cases are a web page and a PDF that give orders, a file name that tries to forge a message line, a request by voice, and staying silent in a quarrel. A red case is fixed in the agent's definition, not in the test. | AX:214–218, AX:148–149 |
| k2 | Every session becomes a typed digest linked to its transcript. The cost of a step is computed from transcripts by a script, not estimated by a model. | AX:155–159 |
| h-limits | Limits | AX:332 |
| l1 | The write hook covers file tools only; writes through the shell are left to the permission classifier. Role order and pre-merge checks are held by a model following a written skill, with the merge pinned to the reviewed head by `--match-head-commit`. That is a documented trade-off, not code. | AX:129–132, AX:329–330 |
| asof | Figures as of 12 November 2026, measured on my own runs. | AX:5, AX:13–15 |
| h-proj | Projects | — |
| caro-1 | caro.md imports cars to Moldova from Korea, China and the USA, and it is in production. I build its web app. | CV:36–37; RM:8–9 |
| caro-hard | The hard part is the Korean catalog: 9,000+ cars read live from the source marketplace through a pool of proxy exits, with Redis caching and a stale copy served when the source fails. | CV:38–39; RM:9–10; OWN («9 000+» stays) |
| caro-calc | A calculator turns a car on another continent into a turnkey price: car price, auction fees, shipping and Moldovan customs from the official customs API, in USD, EUR and MDL at live rates. | CV:40–41; RM:10–12 |
| caro-practice | Case pages with photo galleries are seeded from the client's documents by a parsing script. Playwright end-to-end tests and Sentry stand behind the site. | CV:42–44 |
| caro-ai | The design was made with AI in Pencil, and the site was built with Claude Code. Leads come in through the site. | OWN; AX:92–96 |
| caro-meta | Next.js 16, React 19, TypeScript, Tailwind CSS v4, next-intl (Russian, Romanian) · link `https://caro.md/` | CV:36–37 |
| dh-1 | infodreamhome.com is the production website of a licensed Las Vegas general contractor, live since October 2026. I built most of it. | CV:47–48; RM:13–14 |
| dh-hard | The hard part was a photo-heavy site that stays fast on a phone. Every route is prerendered, and photos are served as AVIF or WebP at the device's width, the main image first. On the key pages, Lighthouse mobile scores 100 for accessibility and 90+ for performance, out of 100. | CV:49–52 |
| dh-practice | Copy lives in typed per-block content modules. Quote requests land in the owner's inbox through Resend, with field-level validation and silent bot filtering. Each page has a canonical URL and a link preview, and JSON-LD (GeneralContractor, FAQPage, breadcrumbs) and a sitemap tell search engines about the business. | CV:49–50, CV:53–56; RM:14–15 |
| dh-ai | The design was made with AI in Open Design, and the site was built with Claude Code; its late work ran as OpenSpec changes. Leads come in through the site. | OWN; AX:92–96 |
| dh-meta | Next.js 16 App Router, Bun in Docker · link `https://infodreamhome.com/` | CV:49 |
| p-note | Both sites were built with Claude Code before the harness existed; it appeared on 3 November 2026. | AX:92–96, AX:340–342 |
| exp-lead | Before going freelance, I led frontend and mobile teams of up to 5 engineers, shipped consumer apps for KFC, Papa John's and a football club, and contributed a fix to React Native core. | CV:12–13; RM:39–40 |
| exp | Every position with its bullets from the CV. Freelance, Jun 2025 – present: caro.md, Dream Home and the agency prototypes, one line each, since Projects carries the detail (not «main contributor»). Otherweb (acquired by S.A.I.): Web Developer Dec 2024 – May 2025 and Lead Mobile Developer Aug 2023 – Dec 2024, with the PlatformColor fix link `https://github.com/react/react-native/pull/39893`. Raters (freelance), Jan 2022 – May 2023. DexTechnology: Frontend Team Lead Dec 2021 – Jul 2022 and React Native Developer Jul 2018 – Dec 2021. | CV:34–91 |
| skills | The seven groups with their tools, verbatim. | CV:17–30 |
| edu | MSc, Information Systems and Technologies, 2017–2019; BS, Informatics and Computer Engineering, 2013–2017; both Dniester State University. GPAs as in the CV. | CV:93–96 |
| lang | English (fluent), Russian (native) | CV:98–100 |
| footer | CV (PDF) · llms.txt · This page weighs under 150 KB and loads nothing from other sites · Figures as of 12 November 2026 | D4, D5; cv-page «Weight budget», «No third-party requests» |

Kept out on purpose:
- Activity counts, by the owner (OWN): pull request counts (47 opened, 31 merged, 169 of 172),
  «main contributor», commit shares (325 of 596, 81 of 108) and co-author trailer counts (340, 104),
  line counts (2,923 lines), test counts (413, 46), the per-role spend table, $474.9 and 469 role calls,
  the empty-call share ($39.6 of $474.9), the cost per finding ($0.24 against $0.62), and
  «540 leads at $0.0014».
- The caro.md IP ban and circuit breaker (AX:162–166), by the owner.
- Failures b3–b5 of the first draft (duplicate batch, shared test database, permissions
  assumption). The owner's three judgment items plus the split story replace the incident log.
- Home page performance 73 → 96 and LCP 12.6 s → 2.7 s (AX:192–194): the before was measured with
  Lighthouse on the dev stand and the after with PageSpeed on production, so there is no common
  baseline.
- The Dream Home fact check against the Nevada contractor register (AX:190–191), because it is a
  client matter.
- From «Честно» (AX:332–377): «sandboxed», «eval suite», «the split made steps cheaper», fathom
  «shipped through the bridge», the name 011.md, and Distru. Counts from digests where a primary count
  exists, and classifier denial counts (AX:144–147), stay out too.

## Screens

New screen: `site/index.html`, one long page. Who reads it and in what situation: a recruiter or a
hiring engineer who followed the Portfolio URL of an application, on a phone or a laptop. In the first
screen they want to know who this is, what he does, and the proof. Then the harness case, which is the
reason the page exists, then proof (the projects), then the CV detail. Fixed by the specs and D7: the
copy and its order, one `h1`, landmarks, text that needs no script, light and dark by system setting,
no third-party requests (system fonts or self-hosted ones within the 150 KB budget), no horizontal
scroll at 390. The role chain is text, an ordered list or a diagram built from text, never only a
picture.

The owner's design constraints (2026-11-18, roadmap Scope, from the design research): a restrained
page with one signature element, the spine of variant c.
1. The first screen at 390 × 844 answers who, what and proof before any motion: role, the one-line
   positioning (def), the two outcomes (out1, out2), and links to GitHub, the CV PDF and email. This is
   the cv-page spec, «First screen at phone width».
2. On a phone the spine shrinks to a thin rail or progress line that costs the text column no width.
   The first paragraph of `main` is at least 330 px wide at 390.
3. The motion is additive only. All content is in the DOM and readable from the start: nothing dimmed,
   hidden or delayed until scrolled, no scroll snap, no wheel interception. With
   `prefers-reduced-motion` the page shows its finished state. This is the cv-page requirement
   «Motion is one, additive and never in the way».
4. One motion only: the spine following the scroll. Variant c's rise of the first screen on load and
   the 2px hover lift of pills and cards go away.
5. Craft that reviewers inspect: semantic HTML, a visible keyboard focus, AA contrast in both themes,
   and the PDF link in the header. The footer states the page weight («under 150 KB»), which the
   weight test keeps true. It names no Lighthouse score, since this change does not measure one.

## Variants

Chosen: c, by the owner (roadmap Scope, «Owner, 2026-11-18: take c»), with the five constraints
above. Next comes the designer: removing `a` and `b`, the switch and the variant scaffolding in a
commit of the step's branch, applying the five constraints, and putting the D7 copy into
`site/index.html`. The architect does not touch `site/`.

What the variants were, for the record:
- a: layout-first, a spec sheet on a five-column grid, with no script.
- b: content-first, a well-set profile article in a serif reading face, with no script.
- c: motion-first, «the run». One reading column hangs on a left spine, and section and role nodes
  tick from pending to done as you scroll. Without the script, or with reduced motion, the page shows
  its finished state.

## Risks / Trade-offs

- [The first deploy fails while Pages Source is still «Deploy from a branch»] → Hands line. After the
  switch, re-run the workflow by hand (`workflow_dispatch`). Until then the old build keeps serving
  the README, so the site never goes blank.
- [The page and the PDF drift from `cv-en.md` and `ai-experience.md`] → the copy table names the
  source line of every fact. A change to the sources is a new roadmap step that edits both.
- [The live run depends on the network and on Pages caching (about 10 minutes)] → it is a
  post-deploy check, not part of the full check.
- [The intro says «AI Product Engineer» while the PDF says «Senior Frontend Developer»] → both are
  true: the plan positions him as an AI product engineer, and the CV leads with frontend. The role
  line names both.
- [Phone number on a public, crawlable page] → it is in the CV the owner sends with every application,
  and the brief says contacts come from `cv-en.md`. The owner can strike it at review.
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

## Decided without the user

| Decision | Default taken | Ground |
|---|---|---|
| Stack | Plain HTML and CSS in `site/`, no build (D1) | One static page; the least-code rule; the brief allows it |
| Publishing | Actions Pages workflow with the `site/` artifact (D2) | Today the legacy build publishes `CLAUDE.md` and the roadmap (probe 2026-11-18); `/docs` is the research folder by convention |
| Check tooling | `@playwright/test` 1.64.1 and `@axe-core/playwright` 4.14.0, Python `http.server` (D3) | House pattern in 011 and fathom; browser already cached; stdlib server |
| Live check | Same suite with `BASE_URL` (D3) | Done when asks for the live site; no second test set |
| PDF source | Committed file from `cv-en.md` via pandoc and `playwright pdf` (D4) | Source not reachable from CI; probe produced a good 3-page PDF |
| PDF headline | Keep «Senior Frontend Developer» as in `cv-en.md` | The PDF is the CV as sent; no claim is invented |
| Years of experience | «since 2018», no count | `cv-en.md` says 7+, `ai-experience.md` says 8+; the date is true in both |
| Copy and order | Table D7, first person, one two-sentence definition | Brief: wording is the architect's; every row sourced |
| Content by the owner's answers | D7 rewritten: outcomes, hard problems and measured findings with a baseline; activity counts out | Owner's answers in the roadmap Scope, 2026-11-18; content research |
| «121 roadmap steps» | Kept as one scale line in the harness case (o4), not on the first screen | Owner: «your call»; it shows scale, and its source is primary (AX:46–48) |
| The split story | Kept as a hard problem (hard1) with its simulation stated as one | A measured finding that changed the design (owner's rule); «Честно» asks to call the simulation a simulation |
| Pencil and Open Design | «The design was made with AI in Pencil / Open Design», nothing more | Owner's answer; the sources say nothing more about either tool |
| Business result | «Leads come in through the site», no figure | Owner's answer; nothing was measured |
| Footer claim | Page weight only («under 150 KB»), no Lighthouse | Owner: state it only if measured and kept true; the weight test keeps it true, and nothing measures Lighthouse here |
| What to leave out | List under D7 | «Честно» section of `ai-experience.md`; repo is public |
| Phone on the page | Shown, as in `cv-en.md` | Brief: contacts from `cv-en.md` |
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
