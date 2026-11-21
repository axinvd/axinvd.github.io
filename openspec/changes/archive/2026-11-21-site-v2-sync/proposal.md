# Proposal

## Why

The site and its PDF were written from `ai-experience.md` v1 and the old `cv-en.md`. Both sources
have moved since: v2 records approaches («task → approach → why → what broke») without activity
counters, and `cv-en.md` now leads with «AI Product Engineer · Senior Frontend». One measured line on
the page now contradicts v2: «a model put 8 of its top 10 among leads I had skipped, so code now does
the scoring». In v2 Q2.1 the formula in code, not a model, ranked the skipped leads on top. Two more
figures, «130–681k tokens» and «it appeared on 3 November 2026», survive only in v1. The PDF still
says «Senior Frontend Developer» and «Looking for remote frontend roles», and its test is skipped.

## What Changes

- The harness case:
  - The lead-ranking finding is replaced by the pay-reading finding of v2 Q2.2 and `cv-en.md`. A model
    asked for dollars guessed 90 roubles per dollar against the central bank's 82.51, so the model now
    copies pay as written and code converts it.
  - The case says the implementer never edits the tester's tests (v2 R2.1).
  - Limits now say what the write hook does before naming its ceiling (v2 R4.3).
  - The split story is told without the v1 figure «130–681k».
  - The as-of date becomes 18 November 2026, the date the sources were taken.
- Projects: the note on when the sites were built drops the v1 date. The infodreamhome.com entry
  says the quote form and its handler share one validation module (v2 R6.2, `cv-en.md`).
- Experience: the freelance position names the harness as his own tool, not production at an
  employer, as `cv-en.md` does.
- Skills: the groups follow `cv-en.md` in its new order (Frontend, Quality, AI, Mobile, Backend &
  data, Integrations, Delivery). The AI group lists its new tools, and Backend & data adds «Python
  (agent tooling)».
- The footer's as-of date becomes 18 November 2026.
- `site/ivan-alexandrov-cv.pdf` is rebuilt from the current `cv-en.md`. The test «The PDF matches
  the current CV» becomes automatic: it reads the served PDF's page 1 and compares it with line 3 of
  `cv-en.md`.
- The PR carries the reconciliation list against v2, «добавлено / не взято и почему» (design D2).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `cv-page`: the harness case's findings, date and limits; the dreamhome entry; the freelance
  position; skill groups and their order; the PDF match becomes a test; the facts-and-sources rule
  points at the copy table of this change; the footer's date.

## Impact

- `site/index.html` (copy only, no markup or style change), `site/ivan-alexandrov-cv.pdf` (rebuilt).
- `tests/page.spec.ts`, `tests/search.spec.ts` (contract tests follow the delta spec; the PDF test
  gets a small text reader on `node:zlib`, with no new dependency).
- No change to `style.css`, `script.js`, `llms.txt`, JSON-LD, the deploy workflow or ADR-0001.
- Out: `cv-en.md` and `ai-experience.md` (the freelance_leads roadmap owns them).
