# Spec Delta

## Purpose

The CV page at the site root: a hiring manager or recruiter who follows the Portfolio URL of an
application learns who Ivan Alexandrov is, what he can do, what he built with AI agents, and how to
contact him or take his CV as a PDF, on a phone or a desktop.

## ADDED Requirements

### Requirement: The page opens with who Ivan is
The site root SHALL serve one English page whose only `h1` is «Ivan Alexandrov». A role line follows
it and names «AI Product Engineer» and «Senior Frontend». The first paragraph of the main content is
the definition sentence: what he does, where he works from, and what he built.

#### Scenario: A recruiter opens the Portfolio URL
- **WHEN** a visitor opens `/`
- **THEN** the page has `lang="en"` and exactly one `h1`, with the text «Ivan Alexandrov»
- **AND** the role line under it contains «AI Product Engineer» and «Senior Frontend»
- **AND** the first paragraph of `main` contains «Chișinău», «remote» and «harness»

#### Scenario: The page says what roles he is open to
- **WHEN** a visitor reads the intro block
- **THEN** it says he is open to remote AI product engineer and senior frontend roles

### Requirement: The page lists skills from the CV
The page SHALL have a Skills section with the skill groups of `cv-en.md`: Frontend, Quality, Mobile,
Backend & data, Integrations, Delivery, AI.

#### Scenario: Skill groups are shown
- **WHEN** a visitor reads the section headed «Skills»
- **THEN** it names each group «Frontend», «Quality», «Mobile», «Backend & data», «Integrations»,
  «Delivery» and «AI», each followed by its tools from `cv-en.md`

### Requirement: The page lists experience from the CV
The page SHALL have an Experience section with every position of `cv-en.md`, with its employer, role
and dates. Education and languages follow it.

#### Scenario: Positions, education and languages are shown
- **WHEN** a visitor reads the section headed «Experience»
- **THEN** it shows the freelance position (Jun 2025 – present), Otherweb (Web Developer, Dec 2024 –
  May 2025; Lead Mobile Developer, Aug 2023 – Dec 2024), Raters (Jan 2022 – May 2023) and
  DexTechnology (Frontend Team Lead, Dec 2021 – Jul 2022; React Native Developer, Jul 2018 – Dec 2021)
- **AND** the page names both degrees from Dniester State University and the languages English and
  Russian

### Requirement: The page tells the harness case
The page SHALL have a section on Ivan's multi-agent harness. It shows the role chain from a roadmap
step to a merged pull request as readable text, measured figures with their date, failures with
their fixes, and how agents are checked. It presents the harness as his own tool.

#### Scenario: The role chain reads as text
- **WHEN** a visitor, or a screen reader, reads the harness section
- **THEN** the chain is present as text, in this order: orchestrator, architect, designer, tester,
  implementer, verifier, pull request, the owner's Approve, merge
- **AND** any diagram in it carries the same chain as text, not only as a picture

#### Scenario: Figures are shown with their date
- **WHEN** a visitor reads the harness section
- **THEN** it contains «121 roadmap steps», «469 role calls», «$474.9», «47 pull requests» with
  «31 merged», and «46 live-model tests»
- **AND** it states that the figures are as of 12 November 2026

#### Scenario: Failures come with their fixes
- **WHEN** a visitor reads the failures part of the harness section
- **THEN** it lists at least four failures, each with its cause and its fix, including an agent trying
  to approve its own pull request, a comment taken as consent, a batch delivered twice, and two agents
  sharing one test database

#### Scenario: The case does not overclaim
- **WHEN** the page text is searched
- **THEN** it says the harness is his own tool, used on his own and his studio's repositories
- **AND** it says that caro.md and infodreamhome.com were built with Claude Code before the
  harness existed
- **AND** it contains none of «sandboxed», «eval suite», «011.md», «Distru»

### Requirement: The page links the two production projects
The page SHALL have a Projects section for caro.md and infodreamhome.com. Each entry says what the
site is, Ivan's part in it, and its facts from `cv-en.md`, and links to the live site.

#### Scenario: Project links open the live sites
- **WHEN** a visitor reads the section headed «Projects»
- **THEN** it has a link to `https://caro.md/` and a link to `https://infodreamhome.com/`
- **AND** the caro.md entry says «main contributor» and names the 9,000+ car catalog
- **AND** the infodreamhome.com entry names the Las Vegas general contractor and Lighthouse
  accessibility 100

### Requirement: The page gives contacts and the PDF CV
The page SHALL list the contacts of `cv-en.md` as working links and SHALL link the CV as a PDF file
served by the site.

#### Scenario: Contacts are links
- **WHEN** a visitor looks for contacts
- **THEN** the page has links to `mailto:axinvd@gmail.com`, `https://www.linkedin.com/in/axinvd/`,
  `https://github.com/axinvd`, `https://t.me/axinvd` and `tel:+37378297494`

#### Scenario: The PDF CV downloads
- **WHEN** a visitor follows the link to the CV PDF
- **THEN** `/ivan-alexandrov-cv.pdf` answers 200 with content type `application/pdf`, and the body
  starts with `%PDF`

### Requirement: Facts come only from the source files
Every fact and figure on the page SHALL come from `freelance_leads/cv/cv-en.md` or
`cv/ai-experience.md`, as listed in the copy table of the design. The page SHALL carry no closed code,
secrets, or client-private details.

#### Scenario: A reviewer checks the copy
- **WHEN** the verifier compares the page text with the copy table of `design.md`
- **THEN** each figure and claim on the page has a row there with its source line, and none is missing
  from the source

### Requirement: The page fits a phone
At a viewport 390 px wide, the page SHALL show all its content without horizontal scrolling. The
same holds at 1280 px.

#### Scenario: Phone width has no horizontal scroll
- **WHEN** the page is loaded at 390 x 844
- **THEN** the document's scroll width is at most 390 px, and no element's right edge passes 390 px
- **AND** a screenshot at that width, opened and looked at, shows every block readable

#### Scenario: Desktop width has no horizontal scroll
- **WHEN** the page is loaded at 1280 x 800
- **THEN** the document's scroll width is at most 1280 px

### Requirement: The page follows the system light or dark theme
The page SHALL use a light theme or a dark theme according to the visitor's `prefers-color-scheme`.

#### Scenario: Dark preference gets the dark theme
- **WHEN** the page is loaded with the color scheme emulated as dark, and again as light
- **THEN** the computed background colors of `body` differ between the two, and the text colors differ
  too

### Requirement: The page is accessible
The page SHALL have no serious or critical axe violations in either theme. It has `header`, `main` and
`footer` landmarks, its headings do not skip a level, and each link has text that names its target.

#### Scenario: axe finds nothing serious
- **WHEN** axe runs on the page in the light theme and in the dark theme
- **THEN** it reports no violation of impact «serious» or «critical»

#### Scenario: Structure is navigable
- **WHEN** the page outline is read
- **THEN** there is one `header`, one `main` and one `footer`, and no heading is more than one level
  below the one before it

### Requirement: The page is light and self-contained
Loading the page SHALL request nothing outside the site's own origin. All its responses together,
the PDF aside, SHALL weigh at most 150 KB.

#### Scenario: No third-party requests
- **WHEN** the page loads and the network goes idle
- **THEN** every request went to the page's own origin

#### Scenario: Weight budget
- **WHEN** the page loads and the network goes idle
- **THEN** the body sizes of all responses add up to at most 150 KB
