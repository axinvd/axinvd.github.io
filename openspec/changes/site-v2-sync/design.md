# Design

## Context

See proposal.md for why. The page is static HTML in `site/index.html` (ADR-0001). Its copy came from
the D7 copy table of `openspec/changes/archive/2026-11-18-cv-site/design.md`, sourced from
`ai-experience.md` v1 by line number (`AX:n`). v2 of that file (slice 2026-11-18) renumbers
everything into entries `R1.1 … Q4.3` and drops v1's counters. `cv-en.md` was rewritten for AI
product (line 3: «**AI Product Engineer · Senior Frontend Developer — React, Next.js, TypeScript**»).

Constraints that shape the copy:
- The harness case must stay at most 1266 px tall at 390 and 375 in 16 px type (cv-page spec).
  Today it is 1138 px at 390 and 1162 px at 375. The copy below was applied to a scratch copy of the
  site and measured at **1210 px at 390 and 1234 px at 375**, which leaves 32 px. Nothing more fits
  without cutting something.
- Presentation stays as cv-site D7: approaches and measured findings with their baseline, no
  activity counters. The page bans «circuit breaker», «407», «IP ban» (kept off the site by the owner).

## Goals / Non-Goals

**Goals:**
- No line on the page contradicts v2 or `cv-en.md`, and every figure has a current source.
- Of what v2 has and the page lacks, the strongest fits within the case's height budget.
- The PDF is the current `cv-en.md`, and a test proves it.

**Non-Goals:**
- No change to look, layout, markup structure, styles, script, JSON-LD, `llms.txt` or the workflow.
- No re-check of the project practices against the caro_md and dreamHome repos. They are sourced from
  those repos (cv-site D7), not from v2.
- No edit of `cv-en.md` or `ai-experience.md`.

## Decisions

### D1. Copy table of this change

Only the lines this change writes. Every other line keeps its cv-site D7 row. Sources: `V2:<entry>`
= `~/projects/freelance_leads/cv/ai-experience.md` v2, `CV:<line>` = `cv-en.md` as of 2026-11-21 (line 3 is the headline).
Each row gives the text as it goes on the page, inline markup included.

| id | Text (as on the page) | Source | Replaces |
|---|---|---|---|
| o1 | Each roadmap step gets an orchestrator that leads an architect, a designer, a tester, an implementer and a fresh verifier from plan to pull request. The tester writes tests from the spec without reading the code, and the implementer never edits them. | V2:R2.1, V2:R2.2; CV:45–51 | o1 (adds the last clause) |
| hard1 | One agent per step re-paid everything it read on every call and tested its own code, so I split it into roles. | V2:R2.1 Why; CV:47 | hard1 («peaked at 130–681k tokens of context», a v1-only figure) |
| m3 | `<strong>Pay in job posts:</strong> asked for dollars, a model guessed <span class="nowrap">90 roubles</span> per dollar against the central bank's <span class="nowrap">82.51</span>, so it now copies pay as written and code converts it.` | V2:Q2.2 (Broke, Measured); CV:72–75 | m3 lead ranking (contradicts V2:Q2.1) |
| l1 | A hook keeps unattended sessions writing only inside the project, but it covers file tools only; role order and pre-merge checks are a model following a written skill, with the merge pinned by `<code>--match-head-commit</code>`. | V2:R4.3, V2:R8.2 Open, V2:Limits; CV:60–66 | l1 (adds what the hook does) |
| asof | Figures as of 18 November 2026, from my own runs. | V2 header («Срез 2026-11-18»); Q2.2's figure is from 2026-11-17 | asof (12 November) |
| p-note | Both sites were built with Claude Code before the harness existed. | V2:Limits, V2:R1.3 Open; CV:44 | p-note («it appeared on 3 November 2026», a v1-only date) |
| dh-leads | Quote requests pass one validation module shared by the form and its handler, and land in the owner's inbox through Resend, with silent bot filtering. Leads come in through the site. | V2:R6.2; CV:96–97; OWN (leads) | dh-leads (adds the shared module) |
| exp-free-h | (first item of the freelance position) Multi-agent harness on Claude Code: my own tool, used daily on my and my studio's repositories, not production at an employer. | CV:43–44; V2:Limits | new |
| skills | The seven groups in the order of `cv-en.md`: Frontend, Quality, AI, Mobile, Backend & data, Integrations, Delivery, each with its tools verbatim. AI: «multi-agent orchestration on Claude Code (subagents, skills, hooks), MCP servers, tests of agents on the live model (prompt injection included), with-and-without-skill evals, model output narrowed to facts and validated in code, LLM features (OpenAI, Claude), real-time chat over SSE, GitHub Copilot». Backend & data ends «…, REST, GraphQL, Python (agent tooling)». | CV:23–37 | skills (old order and old AI group) |
| footer | CV (PDF) · llms.txt · Figures as of 18 November 2026 | asof | footer |

Rows kept from cv-site D7 whose facts are not in `cv-en.md` (the Scope asks for these to be checked):
- «three-person studio» (o3): its source is the profile README (RM:20–23), and V2:R8.1 says «a small
  team». Kept.
- «none of 74 steps», «14 of 46» (m1): V2:Q3.3 Measured. Kept.
- «135,948», «6,344» (m2): V2:R3.2 Measured and CV:56–57. Kept.
- hard2 (the agent that tried to approve, the GitHub App): V2:R4.2 (Broke, Why). Kept as is. The
  more exact v2 wording («under my login, and the classifier stopped it») costs a line the budget
  does not have, and the current line does not contradict v2.
- Project practices (Pencil, e2e, patch notes, Open Design, specs, content modules), and «Leads come
  in through the site»: sourced from the project repos and the owner's answers. Out of this step.

### D2. Reconciliation list for the PR («добавлено / не взято и почему»)

The implementer pastes this list into the PR body in Russian, as is in substance.

Added or corrected:
- Q2.1 → the lead-ranking line is removed. In v2 the formula in code put the skipped leads on top;
  no model did.
- Q2.2 → replaces it: the model copies pay as written, code converts it (90 vs 82.51). The topic
  stays «where a model is not needed», now with a correct measurement.
- R2.1 → «the implementer never edits them»: the contract-test ownership, the core of the split.
- R4.3 → Limits say what the hook does before naming its ceiling. Before, the page named «the write
  hook» without introducing it.
- R6.2 → infodreamhome.com: one validation module for the form and its handler.
- v1-only figures removed: «130–681k tokens», «3 November 2026».
- `cv-en.md` → the Skills groups in the new order, with the new AI group and Python. The freelance
  position names the harness. The as-of date is 18 November 2026. The PDF is rebuilt.

Kept (already on the page and matching v2): R2.1/R2.2 pipeline, R3.1 MCP server, R3.2 MCP
measurement, R4.1/R8.2 consent and Approve, R4.2 GitHub App, R7.1 live-model tests, Q3.3 verifier
measurement, Limits.

Not taken, and why:
- R2.2 (the orchestrator continues the role that asked), R7.3 (skill eval 93% vs 59%), R7.2 (model
  chosen on hand-made ground truth), R3.3 (skills over APIs instead of MCP), R4.4 (`dontAsk` chat
  agent), Q4.1 (the agent points, code copies): all strong, and all in the PDF. The case is at
  1234 of 1266 px at 375, and the owner's rule is a screen and a half at most.
- R2.3, R2.4, R5.1, R5.4, R8.1, R8.2 details: harness internals. Same height budget.
- R1.1, R1.2, R1.4, R3.4, R6.1, Q2.3, Q4.3: fathom, a personal product not deployed to users. The
  page shows production projects and the harness.
- R1.3 (indexing closed unless production): a dreamHome detail, in the PDF. The entry leads with its
  hard part.
- R3.5: a hackathon prototype, not production.
- R4.5, R4.6: kept off the site by the owner (cv-site D7; the page bans «circuit breaker», «407»).
- Q3.5 (LCP 11 s was a measuring artifact), R4.7, Q3.4: good engineering stories, not in `cv-en.md`.
  The caro.md entry already leads with its catalog.
- R5.2, R5.3, R7.4, Q1.4, Q2.4: interview material (ai-talk-kit), not in `cv-en.md`.
- R6 (GraphQL, LangGraph), R9: v2 has no entries.

### D3. The PDF test reads the served PDF with `node:zlib`, no new dependency

The test fetches `/ivan-alexandrov-cv.pdf` through the test's `request` with the suite's `baseURL`,
so the live run (`BASE_URL=…`) checks the deployed file too. It takes page 1, the first `/Kids`
entry of the root `/Pages`. It inflates the page's content stream and the `ToUnicode` CMaps of the
page's fonts (`beginbfchar` and `beginbfrange`), maps each hex string to text by the font set with
the last `Tf`, then applies NFKC and removes all whitespace. It compares that text with line 3 of
`~/projects/freelance_leads/cv/cv-en.md` (via `os.homedir()`), with `**` and whitespace removed.
When the file is absent, it calls `test.skip(true, 'missing <path>')`.

- Why: Chromium (Skia) writes text as Identity-H glyph ids with a ToUnicode CMap, so a plain search
  of the bytes finds nothing. Probe 2026-11-21: a 30-line reader of this shape got page 1 of both the
  committed PDF and a fresh build right. Kerning splits words across strings, so whitespace is
  dropped before comparing.
- Rejected: `pdfjs-dist`, a new dev dependency for one test, when the stdlib plus about 40 lines do
  it. No `pdftotext` or `mutool` on the machine.
- Ceiling, as a comment in the code: it reads PDFs written by Chromium (FlateDecode, Identity-H,
  ToUnicode). The upgrade path is `pdfjs-dist` if the PDF ever comes from another generator.
- Today: the committed PDF's page 1 reads «IvanAlexandrovSeniorFrontendDeveloper—React,Next.js,TypeScript…»,
  so the new test is red. The scratch rebuild reads
  «IvanAlexandrovAIProductEngineer·SeniorFrontendDeveloper—React,Next.js,TypeScript…», which
  contains line 3 and no `**`. It has 4 pages.

The manual skip «A reviewer checks the copy» stays manual. The verifier does that check against D1
plus cv-site D7.

### D4. The PDF is rebuilt with the CLAUDE.md commands, scratch in the step's folder

`pandoc -f gfm ~/projects/freelance_leads/cv/cv-en.md -s --metadata pagetitle="Ivan Alexandrov — CV" -o /tmp/roadmap-run/site-v2-sync/cv.html`,
then `npx playwright pdf --paper-format A4 file:///tmp/roadmap-run/site-v2-sync/cv.html site/ivan-alexandrov-cv.pdf`.
These are the same commands as CLAUDE.md with the step's scratch path (the brief puts scratch files there).
The PDF is not part of the 150 KB budget. The new file is about 114 KB against about 101 KB today.

## Decided without the user

| Decision | Default taken | Ground |
|---|---|---|
| The contradicted lead-ranking line | Removed, replaced by the pay-reading finding (Q2.2) | Roadmap Scope names the contradiction; V2:Q2.1 says the formula ranked the skipped leads; Q2.2 carries the same principle with a measurement, and `cv-en.md` uses it as its evidence |
| Which figure fills the third slot | Q2.2 (90 vs 82.51), not R7.3 (93% vs 59%) or R7.2 | Keeps the topic the owner chose for the slot (where code replaces a model); only one fits the height budget; the others are in the PDF |
| v1-only figures («130–681k», «3 November 2026») | Removed | The sources rule names `ai-experience.md`, and v2 dropped them on purpose (its header); neither is in `cv-en.md` |
| As-of date | 18 November 2026 | V2's slice date; the new figure is dated 17 November, so «12 November» would be false |
| Additions from v2 | R2.1 clause, R4.3 hook, R6.2 module only | The case is 1234/1266 px with them (measured on a scratch copy); the rest is in the PDF (D2) |
| hard2 wording | Kept | Matches V2:R4.2; the exact wording costs a line |
| «three-person studio», verifier figures | Kept | Sourced in the profile README and V2:Q3.3 |
| Skill group order | Follows `cv-en.md` (AI third) | The page lists skills «from the CV»; the CV moved AI up |
| Harness in Experience | One line in the freelance position | `cv-en.md` lists it first there; the case carries the detail |
| PDF test reader | `node:zlib`, no dependency, skip only when `cv-en.md` is missing | Least code; probe on both PDFs; the source lives only on this machine |

## Risks / Trade-offs

- [The case grows past 1266 px with a font or wrap change] → the existing height test guards it.
  There is 32 px of margin today. If it fails, drop the l1 addition first: it is the only clause
  that does not fix a mismatch.
- [`cv-en.md` changes after the PDF is built] → the PDF test turns red on this machine, which is the
  intended signal: rebuild with D4.
- [The hand-rolled PDF reader misreads a future Chromium output] → the ceiling comment names
  `pdfjs-dist`. The test fails loudly, it does not pass silently.
- [The live PDF lags the merge] → Done when is checked by `BASE_URL=https://axinvd.github.io npx playwright test`
  after the Pages deploy.

## Migration Plan

Merge into main, and the Pages workflow deploys `site/`. Then run the live check with `BASE_URL`,
which includes the PDF test. Take a 390-wide screenshot of the live page. Rollback is a revert
commit.

## ADR

Relied on: ADR-0001 (static HTML in `site/`, published by the Pages workflow). Created or
superseded: none. Copy and a test helper do not meet the bar.
