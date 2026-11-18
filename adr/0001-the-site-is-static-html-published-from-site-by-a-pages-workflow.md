# ADR-0001: The site is static HTML published from site/ by a Pages workflow

- Status: accepted
- Date: 2026-11-18
- Source: change `cv-site` (design D1–D3)

## Context
The CV site is one page of fixed text, served by GitHub Pages from a public repository. The legacy
branch build published every Markdown file in the repository (`CLAUDE.md` and the roadmap among
them), which is thin and duplicate content for search.

## Decision
The site is hand-written static HTML and CSS in `site/`, with no framework and no build. It is
published by a GitHub Actions Pages workflow that uploads `site/` only. The full check is
`git diff --check` plus a Playwright suite run against a stdlib static server, and the same suite
runs against the live URL with `BASE_URL`.

## Consequences
No build to break and no runtime dependency. Every page is written by hand, so a second page repeats
the head and the styles. Adopting a generator becomes a new record when there are several pages.
Pages Source must stay «GitHub Actions». Files outside `site/` are never served.
