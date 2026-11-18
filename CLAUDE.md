# axinvd.github.io

Сайт-резюме Ивана Александрова для найма на AI product и фронтенд-роли: `https://axinvd.github.io`
(GitHub Pages, публичный репо). Текст и факты берутся из `~/projects/freelance_leads/cv/` (`cv-en.md`,
`ai-experience.md`); там же — почему сайт и для кого (`docs/ai-product-engineer.md`). Профиль GitHub
(README) — соседний репо `~/projects/axinvd`.

Сайт — статический HTML и CSS в `site/`, без сборки; на Pages его публикует `.github/workflows/pages.yml`
(только `site/`, ADR-0001). Pages Source должен оставаться «GitHub Actions».

Полная проверка: `git diff --check && npx playwright test`. `setup` свежего worktree: `npm ci`, и раз на
машину `npx playwright install chromium`. `RUN_SLOT=<n>` — тесты на порту `4111 + 10n`, превью на
`4011 + 10n`: `python3 -m http.server $((4011 + 10 * ${RUN_SLOT:-0})) --bind 127.0.0.1 --directory site`.
Проверка живого сайта после деплоя: `BASE_URL=https://axinvd.github.io npx playwright test`. Превью PR —
нет; превью шага — локальный сервер из worktree.

PDF CV (`site/ivan-alexandrov-cv.pdf`) собирается из `cv-en.md`; после правки CV пересобрать:
`pandoc -f gfm ~/projects/freelance_leads/cv/cv-en.md -s --metadata pagetitle="Ivan Alexandrov — CV" -o /tmp/cv.html`,
затем `npx playwright pdf --paper-format A4 file:///tmp/cv.html site/ivan-alexandrov-cv.pdf`.

<!-- openspec-kit -->
## OpenSpec

- `openspec/ROADMAP.md` — todo of future changes; its header holds the step format and how
  to take a step. A session with no named task starts here.
- `openspec/specs/` — what the system does now; `openspec/changes/archive/` — each change's
  proposal and design, the why behind the specs.
- `adr/` — durable decisions in force; format and rules in `adr/README.md`.
- `docs/research/` — research and the decisions it led to, when the project keeps it.
- Step chain: a session explores (`/opsx:explore`) and writes steps into the roadmap; each
  step is built by `roadmap-run`: the step's orchestrator, a session of its own, leads the
  step's roles as its subagents from the first exploring to the merge of its pull request.
  Work the user takes now is a step too, built by a run of that one step; the session does not
  run `/opsx:propose` for a step. A session's explore ends in roadmap steps (the rule is in
  `openspec/config.yaml`).
- A step that comes back with variants (one draft PR of the step, its preview switches them
  by `?variant=<letter>`): the user chooses a variant, and the choice is written into the
  step (`Decide: —`, the answer with its letter at the end of `Scope:`) by the chat agent
  from the topic or by the session; the step's orchestrator keeps the chosen variant in the
  step's branch and has the others removed in a commit of it, then the step goes on in the
  same PR as any step with screens (contract tests, apply, publication as a draft PR,
  review, persona pass, verifier). The session does not build it.
- A step the run ended with a PR: its orchestrator keeps the step until the merge. The PR
  opens as a draft and is marked ready for review only after the verifier's ok. The
  consent is an Approve in GitHub: the owner's in his own repos, two different people's of
  the team in shared ones; a word in the chat or a comment in the PR is not consent. Then a
  role of the step archives the change in the step's branch and pushes, and the step's
  orchestrator merges the pull request into the work branch itself; after the consent nobody
  does anything.
- Approval: an Approve in GitHub as is, or at once a text of what the user disagrees with
  (a remark, a review requesting changes); that text goes back to the step's role that built
  it, as a fix within the same change, and the approval is asked again after it. There is no
  separate reject.
- Each link is its own skill call or agent; `/opsx:verify` is a manual command, not a
  link. Between links, propose the next one in one line and wait.
<!-- /openspec-kit -->
