# Tasks

## Context

Read these, and nothing else is needed:

- `openspec/changes/site-v2-sync/specs/cv-page/spec.md`: the delta. These requirements change: the
  production projects, the harness case, experience, skills, contacts and the PDF, facts and
  sources, light and self-contained.
- `openspec/changes/site-v2-sync/design.md`: D1 is the copy table with the exact text of every
  changed line, D2 is the reconciliation list for the PR body, D3 is the PDF reader, and D4 is the
  PDF build commands.
- `openspec/specs/search-readiness/spec.md`, «The content needs no JavaScript»: unchanged, but its
  test lists the measured findings.
- `site/index.html`: the only page file that changes. Copy only: no class, structure, style or
  script change.
- `site/ivan-alexandrov-cv.pdf`: rebuilt (D4).
- `tests/page.spec.ts`: these tests change: «Skill groups are shown» (the `SKILLS` table and order),
  «Positions, education and languages are shown», the `The harness case` describe (pipeline,
  measured findings, limits, overclaim list), the `Projects` describe (infodreamhome, leads), «The
  footer is plain», and the skipped «The PDF matches the current CV» (line 371).
- `tests/search.spec.ts`: «JavaScript disabled» (line 184 lists the measured findings).
- `tests/helpers.ts`: `norm`, `missing`, `found`, `region`, `harnessText`. Reuse them; a PDF text
  reader (D3) may live here or in `page.spec.ts`.
- `~/projects/freelance_leads/cv/cv-en.md`: read only, the PDF source and the skill groups (lines
  23–37).
- `adr/0001-the-site-is-static-html-published-from-site-by-a-pages-workflow.md`: in force, nothing
  to change.

Full check: `cd <worktree> && export RUN_SLOT=1 && git diff --check && npx playwright test`. Today:
`47 passed, 2 skipped`.

## 1. Contract tests (tester)

- [x] 1.1 Bring the tests of `page.spec.ts` and `search.spec.ts` to the delta scenarios. Measured
  findings: «90 roubles» and «82.51» replace «8 of its top 10», and «as of 18 November 2026».
  Pipeline: «never edits them». Limits: «inside the project». Overclaim list: add «8 of its top 10»
  and «130–681k». infodreamhome: «one validation module». Leads: no harness date. Experience: «not
  production at an employer». Skills: the new AI tools, «Python», and the group order of `cv-en.md`.
  Footer: «18 November 2026». Verify: the full check on today's tree is red only on those scenarios
  (today: `47 passed, 2 skipped`; expected after 1.1 and before 2: those tests fail, the rest pass).
- [x] 1.2 Replace the skipped «The PDF matches the current CV» with a test by D3. It fetches the
  served PDF, reads page 1 with `node:zlib`, and compares it with line 3 of `cv-en.md` and with
  no `**`. It skips naming the path only when `cv-en.md` is missing, and carries the ceiling comment.
  Verify: `npx playwright test -g "PDF matches"` is red today on the committed PDF. Probe
  2026-11-21: its page 1 reads «IvanAlexandrovSeniorFrontendDeveloper—…». Expected after 3.1: passed.

### Contract tests

Red before 2 and 3 (on today's tree): the ones marked «red».

- Project links open the live sites → tests/page.spec.ts: Projects › Project links open the live sites
- caro.md leads with its hard part and its practices → tests/page.spec.ts: Projects › caro.md leads with its hard part and its practices
- infodreamhome.com leads with its hard part and its practices → tests/page.spec.ts: Projects › infodreamhome.com leads with its hard part and its practices (red: «one validation module»)
- Leads, and when the sites were built → tests/page.spec.ts: Projects › Leads, and when the sites were built (red: the harness date «3 November 2026»)
- The case fits a screen and a half → tests/page.spec.ts: The harness case › The case fits a screen and a half (390 × 844), (375 × 812)
- The pipeline and its control points read as text → tests/page.spec.ts: The harness case › The pipeline and its control points read as text (red: «never edits them»)
- Hard problems come with what changed → tests/page.spec.ts: The harness case › Hard problems come with what changed
- Measured findings are shown with their baseline and date → tests/page.spec.ts: The harness case › Measured findings are shown with their baseline and date (red: «90 roubles», «82.51», «as of 18 November 2026»)
- Live-model testing and the limits → tests/page.spec.ts: The harness case › Live-model testing and the limits (red: «inside the project»)
- The page does not overclaim or count activity → tests/page.spec.ts: The harness case › The page does not overclaim or count activity (red: «8 of its top 10», «130–681k», «121» still on the page)
- Positions, education and languages are shown → tests/page.spec.ts: Positions, education and languages are shown (red: the freelance position lacks the harness line)
- Skill groups are shown → tests/page.spec.ts: Skill groups are shown (red: group order, new AI tools, Python)
- Contacts are links → tests/page.spec.ts: Contacts are links
- The PDF CV downloads → tests/page.spec.ts: The PDF CV downloads
- The PDF matches the current CV → tests/page.spec.ts: The PDF matches the current CV (red: the committed PDF's page 1 starts «IvanAlexandrovSeniorFrontendDeveloper»; reader in tests/helpers.ts `pdfPage1Text`)
- A reviewer checks the copy → tests/page.spec.ts: A reviewer checks the copy (manual, skipped)
- No third-party requests and no errors → tests/page.spec.ts: Light and self-contained › No third-party requests and no errors
- The icon is inline → tests/page.spec.ts: Light and self-contained › The icon is inline
- Weight budget → tests/page.spec.ts: Light and self-contained › Weight budget
- The footer is plain → tests/page.spec.ts: Light and self-contained › The footer is plain (red: «18 November 2026»)
- (search-readiness, «The content needs no JavaScript») → tests/search.spec.ts: JavaScript disabled (red: «90 roubles», «82.51»)

## 2. Page copy (implementer)

- [x] 2.1 Apply D1 rows o1, hard1, m3, l1, asof and footer in `site/index.html`, keeping the
  existing markup: the `nowrap` spans in m3 and the `<code>` in l1. Verify:
  `grep -c -E "8 of its top 10|130–681k|3 November 2026|12 November 2026" site/index.html`. Today
  it prints `5`; expected `0`. The harness tests pass. The case height test passes: measured on a
  scratch copy, 1210 px at 390 and 1234 px at 375, against a limit of 1266.
- [x] 2.2 Apply D1 rows p-note, dh-leads, exp-free-h (the first `li` of the freelance position) and
  skills (groups in the order of `cv-en.md`, tools verbatim). Verify:
  `grep -c -E "90 roubles|82.51|18 November 2026|never edits them|one validation module|not production at an employer|Python \(agent tooling\)" site/index.html`.
  Today it prints `0`; expected at least `7`. The Projects, Experience and Skills tests pass.

## 3. PDF (implementer)

- [x] 3.1 Rebuild `site/ivan-alexandrov-cv.pdf` with the two D4 commands, then open page 1 and look
  at it: the headline «AI Product Engineer · Senior Frontend Developer — React, Next.js, TypeScript»
  and lists as lists. Verify: `npx playwright test -g "PDF"` passes. The file is about 114 KB
  (today 100708 bytes). A scratch build on 2026-11-21 made 4 pages with the right headline.

## 4. Integration checks

- [x] 4.1 Full check green: `export RUN_SLOT=1 && git diff --check && npx playwright test`. Today
  `47 passed, 2 skipped`. Expected: all passed, 1 skipped (the manual copy review).
- [x] 4.2 Drive the page on the local preview (`python3 -m http.server 4021 --bind 127.0.0.1
  --directory site`, port free first, stopped by its listener after). Screenshot the harness
  section, Projects, Experience and Skills at 390 and 1280, and open the screenshots: no overflow,
  the case reads whole.
- [ ] 4.3 Write the PR body with the D2 reconciliation list in Russian («добавлено / не взято и
  почему») and the «Decided without you» rows of design.md. Verify: the body has both lists.

## Workflow follow-up

- After the merge and the Pages deploy: run `BASE_URL=https://axinvd.github.io npx playwright test`
  (it includes the PDF test against the live PDF), and take a screenshot of the live page at 390.
- Archive with `openspec archive site-v2-sync -y` in the step's branch after the owner's Approve.
