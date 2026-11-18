# Spec Delta

## Purpose

How the site reaches `https://axinvd.github.io`: what gets published, what triggers the publication,
and how the published site is checked against the same contract as the local one.

## ADDED Requirements

### Requirement: Only the site folder is published
Publication SHALL serve the contents of the repository's `site/` folder at the root of
`https://axinvd.github.io`, and nothing else from the repository.

#### Scenario: The workflow uploads site/ only
- **WHEN** the Pages workflow in `.github/workflows/` is read
- **THEN** it uploads one Pages artifact, from the path `site`, and deploys it with the GitHub Pages
  deploy action
- **AND** it grants `pages: write` and `id-token: write`, and nothing broader

#### Scenario: Repository files are not served
- **WHEN** the live site is checked after the first deploy
- **THEN** `https://axinvd.github.io/CLAUDE.html` and `https://axinvd.github.io/openspec/ROADMAP.html`
  answer 404

### Requirement: A push to main publishes the site
The Pages workflow SHALL run on every push to `main`, and SHALL also be startable by hand. Two runs
SHALL never deploy at the same time.

#### Scenario: Triggers and concurrency
- **WHEN** the Pages workflow is read
- **THEN** it triggers on `push` to the branch `main` and on `workflow_dispatch`
- **AND** it sets a `concurrency` group for Pages

### Requirement: The live site passes the same checks
The project's check suite SHALL run unchanged against any base URL given in `BASE_URL`. Without
`BASE_URL` it raises its own local server on the `site/` folder.

#### Scenario: Local run
- **WHEN** the suite runs with no `BASE_URL`
- **THEN** it serves `site/` on port `4111 + 10 × RUN_SLOT` (4111 without a slot) and tests against it

#### Scenario: Live run after the deploy
- **WHEN** the suite runs with `BASE_URL=https://axinvd.github.io`
- **THEN** it raises no server, and every page, search-readiness and deploy scenario passes against
  the live site
