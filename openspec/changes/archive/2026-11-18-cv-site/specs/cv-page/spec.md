# Spec Delta

## Purpose

The CV page at the site root, a résumé: a hiring manager or recruiter who follows the Portfolio URL
of an application learns who Ivan Alexandrov is, what he shipped and what made it hard, how he works
with AI agents, and how to contact him or take his CV as a PDF, on a phone or a desktop. A phrase
quoted in a scenario here is matched in the page's visible text case-insensitively, with whitespace
collapsed; an `href` or a URL is matched exactly.

## ADDED Requirements

### Requirement: The page opens with who Ivan is
The site root SHALL serve one English page whose only `h1` is «Ivan Alexandrov». A role line follows
it and names «AI Product Engineer» and «Senior Frontend». The first paragraph of the main content is
the lede: two plain sentences in the first person on what he does, where he works from, and what he
builds. An open-to-roles line and two named outcomes follow it. The whole page speaks in one voice,
the first person.

#### Scenario: A recruiter opens the Portfolio URL
- **WHEN** a visitor opens `/`
- **THEN** the page has `lang="en"` and exactly one `h1`, with the text «Ivan Alexandrov»
- **AND** the role line under it contains «AI Product Engineer» and «Senior Frontend»
- **AND** the first paragraph of `main` contains «Chișinău», «remote» and «harness», contains «I build»,
  and has no sentence that starts with «He »

#### Scenario: The page says what roles he is open to
- **WHEN** a visitor reads the intro block
- **THEN** it says he is open to remote AI product engineer and senior frontend roles

#### Scenario: Two named outcomes follow the intro
- **WHEN** a visitor reads the intro block
- **THEN** it names two outcomes: the two production sites caro.md and infodreamhome.com, and his
  multi-agent harness on Claude Code

### Requirement: The first phone screen answers who, what and proof
At 390 × 844, the first viewport SHALL show, without scrolling, the name, the role line, the lede,
the two outcomes, and links to GitHub, the PDF CV and email.

#### Scenario: First screen at phone width
- **WHEN** the page loads at 390 × 844 and has not scrolled
- **THEN** the `h1`, the role line, the first paragraph of `main`, both outcome items, and the links to
  `https://github.com/axinvd`, `/ivan-alexandrov-cv.pdf` and the header's `mailto:` link each have
  their top edge above 844 px

### Requirement: The blocks come in résumé order
The main content SHALL present its blocks in this order: the intro, Projects, the harness case,
Experience, Skills, then Education and languages.

#### Scenario: Section order
- **WHEN** the `h2` headings of `main` are read in document order
- **THEN** they are «Projects», «A multi-agent harness on Claude Code», «Experience», «Skills» and
  «Education and languages», in this order
- **AND** no heading starts with «Case:»

### Requirement: The page tells the two production projects as stories
The page SHALL have a Projects section for caro.md and infodreamhome.com, before the harness case.
Each entry says what the site is and leads with its hard part. It names how its design was made with
AI and gives two or three agent practices from the project. It says that leads come in through the
site and links to the live site with an ordinary text link.

#### Scenario: Project links open the live sites
- **WHEN** a visitor reads the section headed «Projects»
- **THEN** it has a link to `https://caro.md/` whose text is «caro.md», and a link to
  `https://infodreamhome.com/` whose text is «infodreamhome.com»
- **AND** neither link's text contains an arrow character (`↗`, `→`, `➚`)

#### Scenario: caro.md leads with its hard part and its practices
- **WHEN** a visitor reads the caro.md entry
- **THEN** it names the live catalog of «9,000+» cars with a «stale copy» served when the source
  fails, and the «turnkey» price calculator
- **AND** it names «Pencil» as the design tool, the Playwright «end-to-end» tests against a mock
  backend, and the «patch note» written for every fix

#### Scenario: infodreamhome.com leads with its hard part and its practices
- **WHEN** a visitor reads the infodreamhome.com entry
- **THEN** it names the «Las Vegas» general contractor, and Lighthouse mobile «100» for accessibility
  and «90+» for performance
- **AND** it names «Open Design» as the design tool, the specs with «scenarios» that its late work
  went through, and the typed «content modules» that hold its copy

#### Scenario: Leads, and when the sites were built
- **WHEN** a visitor reads the Projects section
- **THEN** each entry says «leads come in through the site»
- **AND** one sentence says that both production sites were built with Claude Code before the harness
  existed. It names them as «caro.md» and «infodreamhome.com», or as «both sites», and either
  wording passes

### Requirement: The harness case is short and self-contained
The page SHALL have a section headed «A multi-agent harness on Claude Code», after Projects. It says
what the pipeline is and how it runs between control points, then one or two hard problems with what
changed, the measured findings with their baselines and date, and the limits. On a phone 390 or
375 px wide it SHALL be at most one and a half screens long, in the page's normal body type. It
names no count of steps.

#### Scenario: The case fits a screen and a half
- **WHEN** the page is loaded at 390 × 844, and again at 375 × 812
- **THEN** the harness section's height is at most 1266 px both times
- **AND** the computed `font-size` of its paragraphs is at least 16 px

#### Scenario: The pipeline and its control points read as text
- **WHEN** a visitor, or a screen reader, reads the harness section
- **THEN** its text names, in this order: «orchestrator», «architect», «designer», «tester»,
  «implementer», «verifier», «pull request», «approve», «merge»
- **AND** it says he starts a step with «one line», and that a chat message or a PR comment does not
  count as approval
- **AND** it says the harness is his own tool, used on his own repositories and those of his
  «three-person studio»

#### Scenario: Hard problems come with what changed
- **WHEN** a visitor reads the hard-problems part of the harness section
- **THEN** it lists one or two problems, each with what changed. One is the agent that tried to
  approve its own pull request, and the bot getting its own GitHub App identity

#### Scenario: Measured findings are shown with their baseline and date
- **WHEN** a visitor reads the harness section
- **THEN** it contains «135,948», «6,344», «none of 74 steps», «14 of 46» and «8 of its top 10»
- **AND** each of the verifier, MCP and lead-ranking findings says what its figure was compared
  with, in the sentence that holds the figure or the one just before it. The verifier's «14 of 46»
  after the split compares with «none of 74 steps» when one verifier was the only check. The MCP
  figures are the same call with and without every MCP server loaded. The model's top 10 compares
  with the leads he had skipped
- **AND** it states that the figures are as of 12 November 2026

#### Scenario: Live-model testing and the limits
- **WHEN** a visitor reads the harness section
- **THEN** it says the chat agent is tested on the «live model» against «prompt injection»
- **AND** a limits part says the write hook covers «file tools» only, and that role order and
  pre-merge checks are held by a model following a written skill, with the merge pinned by
  «--match-head-commit»

#### Scenario: The page does not overclaim or count activity
- **WHEN** the page text is searched
- **THEN** it contains none of «sandboxed», «eval suite», «011.md», «Distru», «main contributor»,
  «pull requests merged», «47 pull requests», «31 merged», «121», «roadmap steps have run», «around
  the clock», «$474.9», «469 role calls», «413 tests», «2,923», «325 of 596», «81 of 108», «circuit
  breaker», «407», «IP ban»

### Requirement: The page lists experience from the CV
The page SHALL have an Experience section with every position of `cv-en.md`, with its employer, role
and dates. Skills, education and languages follow it.

#### Scenario: Positions, education and languages are shown
- **WHEN** a visitor reads the section headed «Experience»
- **THEN** it shows the freelance position (Jun 2025 – present), Otherweb (Web Developer, Dec 2024 –
  May 2025; Lead Mobile Developer, Aug 2023 – Dec 2024), Raters (Jan 2022 – May 2023) and
  DexTechnology (Frontend Team Lead, Dec 2021 – Jul 2022; React Native Developer, Jul 2018 – Dec 2021)
- **AND** the page names both degrees from Dniester State University and the languages English and
  Russian

### Requirement: The page lists skills from the CV
The page SHALL have a Skills section with the skill groups of `cv-en.md`: Frontend, Quality, Mobile,
Backend & data, Integrations, Delivery, AI.

#### Scenario: Skill groups are shown
- **WHEN** a visitor reads the section headed «Skills»
- **THEN** it names each group «Frontend», «Quality», «Mobile», «Backend & data», «Integrations»,
  «Delivery» and «AI», each followed by its tools from `cv-en.md`

### Requirement: The page gives contacts and the PDF CV
The page SHALL list the contacts of `cv-en.md` as working links in its header, and SHALL link the CV
as a PDF file served by the site. The PDF is generated from `cv-en.md` and carries that file's
headline at the time it was generated. The page does not require a particular headline in it.

#### Scenario: Contacts are links
- **WHEN** a visitor looks for contacts
- **THEN** the header has links to `https://www.linkedin.com/in/axinvd/`, `https://github.com/axinvd`,
  `https://t.me/axinvd` and `tel:+37378297494`
- **AND** the header has one `mailto:` link whose `href` matches `^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$`
  and whose visible text is the same address. The page carries the real address of `cv-en.md` (CV:5),
  and the tests hold no literal address: they check its shape and its agreement with the page

#### Scenario: The PDF CV downloads
- **WHEN** a visitor follows the link to the CV PDF
- **THEN** `/ivan-alexandrov-cv.pdf` answers 200 with content type `application/pdf`, and the body
  starts with `%PDF`

#### Scenario: The PDF matches the current CV
- **WHEN** the reviewer opens page 1 of the PDF next to `~/projects/freelance_leads/cv/cv-en.md`
- **THEN** the PDF's headline is the CV's line 3 as it stands, and its lists render as lists

### Requirement: Facts come only from the sources
Every fact and figure on the page SHALL come from `freelance_leads/cv/cv-en.md`,
`cv/ai-experience.md`, the profile README, the owner's answers in the roadmap step, or a file of the
caro_md or dreamHome repository read for this change. Each is listed with its source in the copy
table of the design. The page SHALL carry no closed code, secrets, or client-private details.

#### Scenario: A reviewer checks the copy
- **WHEN** the verifier compares the page text with the copy table of `design.md`
- **THEN** each figure and claim on the page has a row there with its source, and none is missing
  from the source

### Requirement: The page fits a phone
At a viewport 390 px wide, the page SHALL show all its content without horizontal scrolling. The
signature spine SHALL cost the text column no width there. The same no-scroll rule holds at
1280 px.

#### Scenario: Phone width has no horizontal scroll
- **WHEN** the page is loaded at 390 × 844
- **THEN** the document's scroll width is at most 390 px, and no element's right edge passes 390 px
- **AND** the first paragraph of `main` is at least 330 px wide
- **AND** a screenshot at that width, opened and looked at, shows every block readable

#### Scenario: Desktop width has no horizontal scroll
- **WHEN** the page is loaded at 1280 × 800
- **THEN** the document's scroll width is at most 1280 px

### Requirement: Motion is one, additive and never in the way
The page SHALL have at most one motion, the spine that follows the reader's scroll. It never
hides, delays or moves content, and it never takes over scrolling. With `prefers-reduced-motion:
reduce`, the page shows its finished state and runs no animation.

#### Scenario: Content is readable at once
- **WHEN** the page has loaded and has not scrolled
- **THEN** every `p`, `li`, `h2`, `h3`, `dt`, `dd` and `a` in `main` has computed opacity 1 and
  visibility `visible`

#### Scenario: Scrolling is the browser's own
- **WHEN** the page is scrolled with the mouse wheel by 800 px
- **THEN** `scrollY` grows by about 800 px, and neither `html` nor `body` has a `scroll-snap-type`
  other than `none`

#### Scenario: One motion only
- **WHEN** the page loads, and a project entry and a contact link are hovered
- **THEN** the header and the intro have no running animation, and the hovered elements keep the
  computed transform `none`

#### Scenario: Reduced motion shows the finished state
- **WHEN** the page is loaded with `prefers-reduced-motion: reduce` and scrolled to the bottom
- **THEN** `document.getAnimations()` is empty

### Requirement: The page follows the system light or dark theme
The page SHALL use a light theme or a dark theme according to the visitor's `prefers-color-scheme`.

#### Scenario: Dark preference gets the dark theme
- **WHEN** the page is loaded with the color scheme emulated as dark, and again as light
- **THEN** the computed background colors of `body` differ between the two, and the text colors differ
  too

### Requirement: The page is accessible
The page SHALL have no serious or critical axe violations in either theme. It has `header`, `main` and
`footer` landmarks, its headings do not skip a level, each link has text that names its target, and
keyboard focus is visible.

#### Scenario: axe finds nothing serious
- **WHEN** axe runs on the page in the light theme and in the dark theme
- **THEN** it reports no violation of impact «serious» or «critical»

#### Scenario: Structure is navigable
- **WHEN** the page outline is read
- **THEN** there is one `header`, one `main` and one `footer`, and no heading is more than one level
  below the one before it

#### Scenario: Focus is visible
- **WHEN** the first link of the page receives focus from the keyboard (Tab)
- **THEN** its computed `outline-style` is not `none`, or its `box-shadow` is not `none`

### Requirement: The page is light and self-contained
Loading the page SHALL request nothing outside the site's own origin and SHALL get no error
response. The page declares its icon inline, so the browser does not ask for `/favicon.ico`. All its
responses together, the PDF aside, SHALL weigh at most 150 KB. The footer links the PDF and
`llms.txt`, gives the as-of date, and makes no performance claim.

#### Scenario: No third-party requests and no errors
- **WHEN** the page loads and the network goes idle
- **THEN** every request went to the page's own origin, and no response had a status of 400 or above

#### Scenario: The icon is inline
- **WHEN** the page head is read
- **THEN** a `link[rel~="icon"]` has an `href` that starts with `data:image/svg+xml`

#### Scenario: Weight budget
- **WHEN** the page loads and the network goes idle
- **THEN** the body sizes of all responses add up to at most 150 KB

#### Scenario: The footer is plain
- **WHEN** the footer is read
- **THEN** it links `/ivan-alexandrov-cv.pdf` and `/llms.txt` and contains «12 November 2026»
- **AND** it contains neither «KB» nor «Lighthouse»
