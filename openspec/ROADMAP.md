# Roadmap

The todo list of future OpenSpec changes: each step is the input of a later run. A step is `### <change>` — the name of the change it will become — then one field
per line: `Depends:` (change names or —; a step needs another's code or decision, including
writing into an entity or feed it creates; `<change>@<repo>` for a step of another roadmap —
`<repo>` is a folder of `~/projects`, `.claude` is `~/.claude` — done when archived there), `Read:` (only what an agent would not find in
openspec/specs/ or adr/), `Goal:` (one sentence), `Scope:` (what is included; the model and
rules are decided by the step's explore), `Out:`, `Done when:`, `Decide:` (the user's
decisions the step leaves open — no ground in specs, ADRs or research, not technical —
written as cases, or `—` when there are none), `Hands:` (what only the owner can do: a key,
an account, a purchase), `Waits:` (an external event that is not a step of any roadmap, e.g. a
request; both optional, `—` or absent when none), optionally `Effort:` (the
architect's effort: `xhigh` for a step that opens a new capability or carried a
`Decide:`, `high` without the field; the owner may set any). About eight lines per step.
A mechanical step has `Decide: —` and no `Hands:` or `Waits:` (a step without `Decide:` is not
one). A step lives in the roadmap of the repo whose code it changes; a step that creates a repo
lives in `~/.claude` until the repo exists, then moves there.
A step is for work that waits — later in this session or in another one: session findings
to keep, a task large enough for its own explore. Every piece of work is a step: work that
waits stays here, and work the user takes now is a step too, built by a run of that one step
(`roadmap-run` with `only`); a session explores and writes steps and builds none itself. The step
is all its later reader gets: what the session found is written first into the doc that
owns the topic (a new file under `docs/research/` only when none does) and `Read:` names
that file.
State lives in OpenSpec: an active change of that name — in progress; archived — done, and
the block is deleted. What is free: `python3 openspec/roadmap-ready.py`; only the free
mechanical steps (defined above): `--mechanical`. Taking a step is a `roadmap-run`: of the
step the user names, or of every free mechanical step after its «Before the run» has shown the
blockers by what they unblock.

## Steps

### site-v2-sync
Depends: —
Read: CLAUDE.md (команды сборки PDF); `~/projects/freelance_leads/cv/ai-experience.md` (v2 — подходы), `~/projects/freelance_leads/cv/cv-en.md`
Goal: сайт и PDF резюме сходятся с ресёрчем подходов v2 и новым `cv-en.md` — ничего сильного не упущено, ничего не противоречит.
Scope: сверить страницу с записями `ai-experience.md` v2 («задача → подход → почему → что ломалось»): что на сайте нет, но сильнее того, что есть, — добавить в кейс harness или проекты; что расходится с v2 — поправить; подача прежняя (D7: подходы, без счётчиков активности). Пересобрать `site/ivan-alexandrov-cv.pdf` из нового `cv-en.md` командами из CLAUDE.md, снять skip с теста «The PDF matches the current CV». Список «добавлено / не взято и почему» — в PR.
Out: правка `cv-en.md` и `ai-experience.md` (роадмап freelance_leads).
Done when: в PR список сверки с v2; PDF на `https://axinvd.github.io/ivan-alexandrov-cv.pdf` с заголовком «AI Product Engineer · Senior Frontend»; тест PDF проходит; полная проверка зелёная, живой сайт проверен в 390.
Decide: ждёт шагов `ai-experience-v2@freelance_leads` и `cv-ai-refresh@freelance_leads` — запускать после их мержа (зависимость между роадмапами скрипт пока не читает).
### walk-fixes-1
Depends: cv-site
Goal: мелкие замечания персоны ко второму проходу сайта-резюме, которые не блокировали cv-site.
Scope: одной строкой на каждое (polish):
- inline-ссылка «PlatformColor fix» на телефоне 20 px в высоту, трудно нажать.
- «Leads come in through the site.» повторяется дословно в обеих карточках проектов; строка «Both sites were built with Claude Code…» стоит между карточками и кейсом без заголовка.
- страница нигде не определяет, что такое «шаг» харнесса, цифры «74 steps» / «14 of 46» висят без привязки ко времени (одна строка-определение).
Out: ссылка на репозиторий и скриншоты проектов (владелец решил, что ссылок достаточно); PDF (обновление `cv-en.md` — отдельная строка Follow-ups).
Done when: каждая строка исправлена или снята владельцем; полная проверка зелёная; телефон 390 без обрезки.
Decide: —

## Follow-ups

- После мержа cv-site руками владельца: Settings → Pages → Source «GitHub Actions» (или `gh api -X PUT repos/axinvd/axinvd.github.io/pages -f build_type=workflow`), один раз запустить workflow Pages, затем живая проверка `BASE_URL=https://axinvd.github.io npx playwright test`, скриншот живой страницы в 390 и `/CLAUDE.html` → 404 (из cv-site, репо axinvd.github.io)
- JSON-LD: `Person` должен быть отдельным узлом `@graph`, а `ProfilePage.mainEntity` — ссылкой по `@id`; хелпер контрактных тестов разворачивает только `@graph`, вложенный `Person` ломает «The three copies are identical» (из cv-site, репо axinvd.github.io; знание для правки JSON-LD)
- GitHub App бота не может пушить `.github/workflows/*` без права `workflows` (владелец выдал 2026-11-18); любой шаг, трогающий workflow, зависит от него (из cv-site, репо axinvd.github.io)
- Обновить `~/projects/freelance_leads/cv/cv-en.md` под AI product (заголовок, summary, строка про harness: сейчас «Senior Frontend Developer», «Looking for remote frontend roles»), затем пересобрать `site/ivan-alexandrov-cv.pdf` двумя командами из CLAUDE.md репо axinvd.github.io, открыть страницу 1 и снять skip с теста «The PDF matches the current CV» (из cv-site; обновление CV — репо freelance_leads, PDF — репо axinvd.github.io)
- В `~/.claude/memory/projects-map.md` у `caro_md` вместо «Django-шаблоны» написать «Next.js + Django admin»: публичный сайт на Next.js, Django только админка и API (проверено в репо caro_md при cv-site; репо `.claude`)
- `/llms.txt` на локальном `python3 -m http.server` отдаётся без charset (Chișinău читается кракозябрами); на Pages utf-8, так что касается только превью и тестового сервера шага (из cv-site, репо axinvd.github.io)

## Candidates (user decides)
