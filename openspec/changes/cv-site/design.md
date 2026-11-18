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

### D5. Search readiness: one definition sentence, JSON-LD `@graph`, `llms.txt`
- The definition sentence (copy table, row «def») is the first paragraph of `main`, the `Person`
  `description` and the `> ` line of `llms.txt`, word for word. It is the 40–60-word answer block
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
The page says these things in this order: intro, harness case, projects, experience, skills,
education and languages, contacts, footer. The designer may move contacts up into the header, but
the text itself does not change. Wording is the implementer's to polish. A new fact or figure is not:
if it has no row here, it does not go on the page. The voice is first person in the sections and
third person in the definition sentence, since that sentence is also the JSON-LD description.

| id | Text (as on the page) | Source |
|---|---|---|
| name | Ivan Alexandrov | CV:1 |
| role | AI Product Engineer · Senior Frontend Developer (React, Next.js, TypeScript) | CV:3; headline «AI Product Engineer»: `docs/ai-product-engineer.md`:48 |
| def | Ivan Alexandrov is a senior frontend and AI product engineer in Chișinău, Moldova, working remotely: React and TypeScript since 2018, two production Next.js sites shipped in 2026, and his own multi-agent harness on Claude Code that takes a roadmap step from plan to merged pull request. | CV:4, CV:10, CV:88; AX:39–41, AX:334–335 |
| open | Open to remote AI product engineer and senior frontend roles · EET (UTC+2/+3) | roadmap Goal (owner 2026-11-18); CV:4, CV:15 |
| intro2 | Earlier I led frontend and mobile teams of up to 5 engineers, shipped consumer apps for KFC, Papa John's and a football club, and contributed a fix to React Native core. | CV:12–13 |
| h-case | Case: a multi-agent harness on Claude Code | AX:39 |
| case-lead | One orchestrator session per roadmap step leads role subagents, from the plan to the merged pull request. It is my own tool, used daily on my and my studio's repositories. | AX:39–41, AX:335 |
| chain | Orchestrator (one session per step, keeps it until the merge) → Architect (turns the step into an OpenSpec change: spec scenarios and tasks) → Designer (on screens: 2–3 variants on one preview, switched by `?variant=`) → Tester (writes contract tests red from the spec scenarios without reading the implementation) → Implementer (builds against them and may not edit them) → Verifier (a fresh agent checks the step) → Pull request (a draft until the verifier's ok) → Owner's Approve in GitHub (a chat word or a PR comment is not consent) → Merge (pinned to the reviewed head with `--match-head-commit`) | AX:39–45, AX:64, AX:71–72, AX:140–143, AX:170–172 |
| chain-par | Up to three steps run at once, each in its own git worktree. | AX:75–76 |
| bridge | A Telegram bridge lets a team chat start work: a chat agent answers through my MCP server (4 tools: `reply`, `status`, `pr_comment`, `write_step`). `write_step` is the only way a chat changes the repository: a one-shot `step-check` agent answers pass, return or ask before the bridge commits. The bridge is one 2,923-line Python file with no dependencies and 413 tests. | AX:100–107, AX:202 |
| asof | Figures as of 12 November 2026, counted from git, `gh`, tests and transcripts. | AX:5, AX:13–15 |
| f-steps | 121 roadmap steps ran through it with per-role cost measured: 74 as one agent per step, then 47 with split roles: 469 role calls, $474.9. | AX:46–48 |
| f-roles | After the split (calls / spend): architect 50 / $169.2 (36%), implementer 59 / $82.3, tester 47 / $52.9, verifier 81 / $16.1. | AX:53–54 |
| f-why | Why split: one agent per step peaked at 130–681k tokens of context, re-paid everything it had read on 100–180 apply calls, and wrote tests for its own code. A replay of real calls predicted peak context at 0.54 of that and total input at 0.42 (a simulation, stated as optimistic). | AX:49–52 |
| f-prs | 47 pull requests opened by harness steps across four repositories, Nov 1–12; 31 merged. | AX:59–63 |
| f-empty | 74 of 362 judged role calls (20%) changed nothing, and cost $39.6 of $474.9 (8%): empty calls are mostly cheap verifiers. | AX:55–56 |
| f-persona | Cheapest finding: a persona reading the spec deltas, at $0.24 per finding, against $0.62 for a verifier finding that changed a step. | AX:57–58 |
| f-verifier | When one verifier was the only check, it changed none of 74 steps; after the split it found something on 17 of 46 steps, and 14 changed. | AX:293–295 |
| f-mcp | A headless call that loaded every MCP server cost 135,948 tokens for an «ok»; with `--strict-mcp-config`, 6,344 (21x fewer). The flag now goes on every script call, guarded by a test. | AX:116–118 |
| h-broke | What broke and how it was fixed | AX:262 |
| b1 | An agent tried to approve its own pull request: the run wrote to GitHub under my login, and the permission classifier denied the approval. Fix: the bot writes as its own GitHub App, with a token scoped to one repository. | AX:268–270, AX:138–139 |
| b2 | A comment taken as consent: an «ok» in a PR comment archived a step, and two bridges acted on it. Fix: consent is a GitHub Approve; the PR author and bots don't count. | AX:264–267 |
| b3 | A batch delivered twice: a SIGTERM between delivery and saving the cursor re-sent the batch in about one test run of two. Fix: the signal is blocked until the cursor is written. | AX:150–152, AX:271–272 |
| b4 | Two agents, one test database: parallel subagents truncated each other's tables. Fix: each agent gets its own database name, now a standing rule. | AX:285–287 |
| b5 | An assumption about permissions: «subagents inherit the session's permissions» was assumed, not checked. Fix: measured in `dontAsk` mode, then rebuilt as an orchestrator session with a path-scoped write hook. | AX:273–275 |
| b6 | This case's own numbers: the first verifier found two counts that did not reproduce. Fix: recounted with the command written next to each number, and the second verifier passed. | AX:296–300 |
| h-check | How the agents are checked | AX:209 |
| c1 | Code and its contract tests come from different agents. | AX:44–45 |
| c2 | 46 live-model tests drive the real `claude -p` with the real agent definition over a fake Telegram, fake herdr and fake GitHub: 36 chat-agent cases (a page that gives orders, a request by voice, staying silent in a quarrel) and 10 step-check cases. A red case is fixed in the agent's definition, not in the test. | AX:214–218 |
| c3 | Prompt injection is tested on the live model: a web page and a PDF that give orders, and a file name that tries to forge a message line; the fixture plants a fake secret. | AX:148–149 |
| c4 | Where code replaced the model: a lead-ranking model gave a verdict per lead, and 8 of its top 10 were leads I had skipped. Now the model only extracts 15 facts by JSON schema and the score is a formula in code: 540 leads read at $0.0014 each, 0 failures. | AX:309–316 |
| c5 | Write scope: a hook lets agents write files only inside the project or a temp directory; Bash writes are left to the permission classifier. | AX:129–132 |
| c6 | Every session becomes a typed digest linked to its transcript; step cost is computed from transcripts by a script, not estimated by a model. | AX:155–159 |
| p-caro | caro.md: a car import platform (Korea, China, USA → Moldova), in production. Main contributor to the web app (325 of 596 commits, 169 of 172 pull requests merged): Next.js 16, React 19, TypeScript, Tailwind CSS v4, next-intl (Russian, Romanian). Korea catalog of 9,000+ cars read live from the Encar API through a pool of proxy exits, with Redis caching and a stale-copy fallback; turnkey cost calculator for three markets in USD, EUR and MDL at live rates; 40+ case pages; Playwright end-to-end tests and Sentry. Link: `https://caro.md/` | CV:36–45; AX:25–29 |
| p-dh | infodreamhome.com: the production website of a licensed Las Vegas general contractor, live since October 2026. I built most of it (81 of 108 commits on main): Next.js 16 App Router with every route prerendered, Lighthouse mobile accessibility 100 and performance 90+ on the key pages, a quote form with email delivery through Resend, JSON-LD and a sitemap. Link: `https://infodreamhome.com/` | CV:47–56; AX:30–31 |
| p-note | Both were built with Claude Code before the harness existed (it appeared on 3 November 2026): 340 and 104 commits carry a Claude co-author trailer. | AX:92–96, AX:340–342 |
| exp | Every position with its bullets: freelance Jun 2025 – present (caro.md, Dream Home, agency prototypes in one or two lines each, since Projects carries the detail); Otherweb (acquired by S.A.I.), Web Developer Dec 2024 – May 2025 and Lead Mobile Developer Aug 2023 – Dec 2024, with the PlatformColor fix link `https://github.com/react/react-native/pull/39893`; Raters (freelance) Jan 2022 – May 2023; DexTechnology, Frontend Team Lead Dec 2021 – Jul 2022 and React Native Developer Jul 2018 – Dec 2021. | CV:34–91 |
| skills | The seven groups with their tools, verbatim. | CV:17–30 |
| edu | MSc, Information Systems and Technologies, 2017–2019; BS, Informatics and Computer Engineering, 2013–2017; both Dniester State University. GPAs as in the CV. | CV:93–96 |
| lang | English (fluent), Russian (native) | CV:98–100 |
| contacts | The links of CV:4–5 as they are (email, LinkedIn, GitHub, phone, Telegram), plus Chișinău, Moldova, remote, EET. The `href`s are listed in the cv-page spec, «Contacts are links». | CV:4–5 |
| footer | CV (PDF) · llms.txt · Figures as of 12 November 2026 | D4, D5 |

Kept out on purpose («Честно», AX:332–377): «sandboxed» (the hook covers file tools only), «eval
suite» (there is no labelled set), «the split made steps cheaper» (the before and after are not
comparable), fathom «shipped through the bridge», the name 011.md (the site does not open), the
caro.md IP-ban incident (client operations), counts taken from digests where a primary count exists,
and Distru (the page is for every application). Classifier denial counts (AX:144–147) come from
digests, so the page names no number for them.

## Screens

New screen: `site/index.html`, one long page. Who reads it and in what situation: a recruiter or a
hiring engineer who followed the Portfolio URL of an application, on a phone or a laptop. In the first
screen they want to know who this is and what he does. Then the harness case, which is the reason
the page exists, then proof (the projects), then the CV detail. Fixed by the specs and D7: the copy and
its order, one `h1`, landmarks, text that needs no script, light and dark by system setting, no
third-party requests (system fonts or self-hosted ones within the 150 KB budget), no horizontal scroll
at 390. The role chain is text, an ordered list or a diagram built from text, never only a picture.

Left to the designer: the visual design and its variants. Every variant uses the same HTML content
from D7 and differs only in look. The `?variant=<letter>` switch and the files of the losing variants
are scaffolding, removed when a variant is chosen. The chosen page must pass the JavaScript-disabled
scenario.

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
| Copy and order | Table D7, first person, one definition sentence | Brief: wording is the architect's; every row sourced |
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
