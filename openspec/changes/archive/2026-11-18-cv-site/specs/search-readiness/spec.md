# Spec Delta

## Purpose

What search engines and AI assistants get from the site. Asked «who is Ivan Alexandrov» or «what has
he built», they can find the page, index it under one URL, and quote a plain answer from it.

## ADDED Requirements

### Requirement: The site is open to crawlers and lists its page
The site SHALL serve `/robots.txt`, which allows every user agent and names the sitemap. It SHALL also
serve `/sitemap.xml`, a valid sitemap that lists exactly the canonical page URL.

#### Scenario: robots.txt allows all and points to the sitemap
- **WHEN** a crawler fetches `/robots.txt`
- **THEN** it answers 200 with a `User-agent: *` group that disallows nothing
- **AND** it has the line `Sitemap: https://axinvd.github.io/sitemap.xml`

#### Scenario: The sitemap lists the canonical URL
- **WHEN** a crawler fetches `/sitemap.xml`
- **THEN** it answers 200 with well-formed XML in the `http://www.sitemaps.org/schemas/sitemap/0.9`
  namespace, holding exactly one `<loc>`: `https://axinvd.github.io/`

### Requirement: The page has one canonical URL and complete meta
The page SHALL declare `https://axinvd.github.io/` as its canonical URL. It SHALL have a title,
a meta description, a viewport meta, and Open Graph and Twitter card tags that describe the same
person. It SHALL not be marked noindex.

#### Scenario: Head tags are present and consistent
- **WHEN** the page head is read
- **THEN** `link[rel=canonical]` is `https://axinvd.github.io/`, and `og:url` equals it
- **AND** the `title` starts with «Ivan Alexandrov» and is at most 60 characters long
- **AND** the meta description is 120 to 160 characters long and names «AI product» and «frontend»
- **AND** `og:title`, `og:description` and `og:type` = `profile` are set, and `twitter:card` is
  `summary`
- **AND** a viewport meta has `width=device-width`, and no robots meta contains `noindex`

### Requirement: The page describes Ivan in JSON-LD
The page SHALL carry one JSON-LD block that parses as JSON. It holds a `WebSite` and a `ProfilePage`
whose `mainEntity` is a `Person`. That `Person` has the name, job title, canonical URL, description,
location and profile links shown on the page.

#### Scenario: JSON-LD parses and matches the page
- **WHEN** every `script[type="application/ld+json"]` on the page is parsed
- **THEN** each one parses without error, and together they contain a `WebSite` with `url`
  `https://axinvd.github.io/` and a `ProfilePage` whose `mainEntity` has `@type` `Person`
- **AND** the `Person` has `name` «Ivan Alexandrov», `url` `https://axinvd.github.io/`, a `jobTitle`
  that appears in the page text, and an `address` with `addressLocality` «Chișinău» and
  `addressCountry` «MD»
- **AND** its `sameAs` includes `https://www.linkedin.com/in/axinvd/` and `https://github.com/axinvd`
- **AND** its `email`, when present, equals the `href` of the page's own header `mailto:` link (the
  check compares the two values and holds no literal address)

### Requirement: One definition answers who Ivan is
The JSON-LD `Person` `description` and the one-line summary of `llms.txt` SHALL be the same text: the
page's lede (the first paragraph of `main`) told in the third person, about «Ivan Alexandrov». The
page itself speaks in the first person. Its lede and the third-person definition share the three
phrases that carry the answer, so every reader, human or machine, gets the same facts.

#### Scenario: The definition copies agree
- **WHEN** the JSON-LD `Person.description` and the `> ` line of `llms.txt` are compared after
  collapsing whitespace
- **THEN** they are the same text, and it starts with «Ivan Alexandrov is»
- **AND** that text and the first paragraph of `main` each contain «AI product and frontend engineer
  working remotely from Chișinău, Moldova», «web products in React and Next.js for clients» and
  «multi-agent harness on Claude Code that takes a roadmap step from plan to merged pull request»

### Requirement: The site serves llms.txt
The site SHALL serve `/llms.txt` in the llmstxt.org format. It holds an `h1` with the name, a
blockquote summary, and link lists to the page and to the PDF CV. The page SHALL link to it.

#### Scenario: llms.txt is in llmstxt.org shape
- **WHEN** an agent fetches `/llms.txt`
- **THEN** it answers 200 with a text content type
- **AND** its first line is `# Ivan Alexandrov`, followed by a `> ` summary line
- **AND** it has at least one `## ` section with Markdown links to `https://axinvd.github.io/` and to
  `https://axinvd.github.io/ivan-alexandrov-cv.pdf`

#### Scenario: The page links llms.txt
- **WHEN** the page is read
- **THEN** it has a link to `/llms.txt`

### Requirement: The content needs no JavaScript
All text and links of the page SHALL be in the served HTML, so that crawlers and agents that run no
script see the whole page.

#### Scenario: JavaScript disabled
- **WHEN** the page is loaded in a browser context with JavaScript disabled
- **THEN** the `h1`, the lede, the harness's measured findings, the project links, the contacts
  and the PDF link are all present and visible

### Requirement: Internal links resolve
Every link and resource on the page that points inside the site SHALL answer 200.

#### Scenario: No broken internal link
- **WHEN** every `href` and `src` on the page that points to the page's own origin is requested
- **THEN** each answers 200
