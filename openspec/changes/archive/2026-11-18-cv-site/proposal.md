# Proposal

## Why

Applications for AI product and frontend roles (Distru's Lever form among them) have a Portfolio URL
field, and Ivan has nothing to put there. The packaging plan (`freelance_leads/docs/ai-product-engineer.md`,
item 2) calls for a CV site that opens with the harness case: the diagram, the numbers, what broke.
Recruiters read it, and so do the AI assistants they ask about a candidate. The facts already exist,
dated 2026-11-12, in `cv/cv-en.md` and `cv/ai-experience.md`. What is missing is the page.
`https://axinvd.github.io` is the repo's GitHub Pages address. Today Pages builds it straight from
`main` and serves the README.

## What Changes

- A single English page at `https://axinvd.github.io/`, a résumé. Contacts and the PDF CV sit in the
  header. Then come two first-person sentences on who Ivan is, the roles he is open to, and two named
  outcomes. The projects caro.md and infodreamhome.com follow as stories, hard part first, each with
  its design tool (Pencil, Open Design) and two or three agent practices checked in its repository.
  The harness case comes after them, at most one and a half phone screens: what the pipeline is, its
  control points, one or two hard problems, measured findings with their baselines, and the limits.
  Experience, skills and education close the page. Following the owner's answers (2026-11-18), the
  page shows achievements and difficulties, with no counts of activity or steps. Every claim comes
  from the CV sources, the profile README, the owner's answers, or the project repositories.
- The look is variant c, the owner's choice: a restrained page with one signature spine, whose motion
  is additive and never in the way.
- Plain static files under `site/`: the page, `robots.txt`, `sitemap.xml`, `llms.txt` and the PDF CV.
  There is no framework and no build step.
- Search readiness for SEO, AEO and GEO: canonical URL, meta and Open Graph tags, JSON-LD
  (`WebSite` and `ProfilePage` with a `Person`), and a two-sentence definition that the page,
  the JSON-LD and `llms.txt` share. The content stays readable with JavaScript off.
- Deploy: a GitHub Actions Pages workflow publishes `site/` only, on every push to `main`. Repository
  files (`CLAUDE.md`, `openspec/`, `adr/`) stop being served as pages.
- The project's full check becomes `git diff --check` plus a Playwright suite run against a local
  static server. The suite checks content, the 390 px layout, light and dark themes, accessibility
  (axe), page weight, search files and the deploy workflow. The same suite runs against the live URL
  with `BASE_URL`.
- `CLAUDE.md` gets the new full check, `setup`, the `RUN_SLOT` ports, the preview command and the
  command that regenerates the PDF.

## Capabilities

### New Capabilities

- `cv-page`: the content of the CV page and how it reads and behaves for a person: blocks and facts,
  links, the PDF, phone width, themes, accessibility, weight.
- `search-readiness`: what search engines and AI assistants get: indexing files, canonical, meta and
  Open Graph, JSON-LD, `llms.txt`, and content without JavaScript.
- `site-deploy`: how the site reaches `https://axinvd.github.io`: which files are published, when, and
  how the live site is checked.

### Modified Capabilities

None: `openspec/specs/` is empty.

## Impact

- New files: `site/` (page, search files, PDF), `.github/workflows/pages.yml`, `package.json` and
  `package-lock.json` (dev only: `@playwright/test` 1.64.1, `@axe-core/playwright` 4.14.0),
  `playwright.config.ts`, `tests/`, `.gitignore`, `adr/0001-…`.
- Edited: `CLAUDE.md` (full check, setup, ports, preview, PDF).
- GitHub setting: Pages Source has to change from «Deploy from a branch» to «GitHub Actions». Only the
  owner can make that switch, after the merge (see design, Hands). Until then the old build keeps
  serving the README.
- Out: LinkedIn texts, a section for freelance clients, a custom domain, analytics.
