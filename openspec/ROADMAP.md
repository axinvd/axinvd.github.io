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

### cv-site
Depends: —
Read: `~/projects/freelance_leads/docs/ai-product-engineer.md` (план п. 2); `~/projects/freelance_leads/cv/cv-en.md`, `~/projects/freelance_leads/cv/ai-experience.md`
Goal: сайт-резюме для найма на AI product и фронтенд-роли: ссылка идёт в поле Portfolio URL откликов (у Distru оно есть).
Scope: одна страница по-английски по `cv/cv-en.md` и `cv/ai-experience.md` из `~/projects/freelance_leads`: кто, что умеет, опыт; кейс harness (схема, числа, что ломалось и как чинили — без закрытого кода); проекты caro.md и infodreamhome.com со ссылками; контакты и PDF резюме. Хостинг — GitHub Pages этого репо (`https://axinvd.github.io`); стек — explore (статический экспорт). Owner, 2026-11-18: аудитория — найм (AI product + фронт), не фриланс-клиенты; хостинг — GitHub Pages. Owner, 2026-11-18, по двум ресёрчам (дизайн и контент): дизайн — сдержанно + один фирменный элемент (спина варианта c), на телефоне тонкая линия, первый экран с кто/что/доказательство, одно движение; контент — достижения, победы и сложности вместо счётчиков активности: без числа pull request и без «main contributor», без долей коммитов; «9 000+» оставить; числа харнесса оставить, но с пояснением базы сравнения, чтобы читатель сам их истолковал; историю с IP-баном caro.md не включать; делать акцент на работе с ИИ (caro.md — дизайн через Pencil, infodreamhome.com — через Open Design) и на практиках, которые можно вытащить из проектов; бизнес-результат проектов есть, но не измерен — не выдумывать, писать, что заявки идут. Owner, 2026-11-18: take c.
Out: тексты LinkedIn; раздел для фриланс-клиентов.
Done when: сайт открыт по `https://axinvd.github.io`, проходит проверку телефона (390) и SEO/AEO по правилам владельца.
Decide: —

### walk-fixes-1
Depends: cv-site
Goal: поправить сайт-резюме по замечаниям персоны (нанимающий менеджер AI-продукта) и дизайнера после cv-site.
Scope: замечания, которые не блокировали cv-site, одной строкой на каждое (friction → polish):
- friction — у кейса harness нет ссылки на репозиторий, демо или пример прогона, проверить «правда ли это» нельзя; ждётся ссылка или честное «private; shown on request» (решение владельца: что можно показать).
- friction — кейс harness занимает около 4000 px прокрутки на телефоне до блока Projects, вторая половина — жаргон (MCP, `--strict-mcp-config`, `claude -p`, `--match-head-commit`, worktree); ждётся короткое резюме сверху, детали свёрнуты или после проектов (меняет порядок блоков из D7 и спеку).
- friction — «121 roadmap steps» рядом с «harness appeared 3 November 2026» и «as of 12 November» читается как завышение: страница не говорит, что такое шаг и каков диапазон дат; ждётся строка-определение шага и даты.
- friction — PDF позиционирует иначе, чем страница: «Senior Frontend Developer», «Looking for remote frontend roles», без harness; сайт ведёт с AI product engineer (решение владельца: обновить `cv-en.md` или оставить как есть).
- friction — у карточек caro.md и infodreamhome.com нет скриншота, результаты (Lighthouse 100/90+, 9 000+) ничем не подтверждены.
- polish — голос меняется: лид в третьем лице («He builds…»), дальше первое лицо («I ship…»).
- polish — «my studio» / «tg-flow lets my studio…»: студия нигде не представлена.
- polish — подзаголовки кейса («The hardest problems…», «What I measured», «How the agents are checked», «Limits») мелкие серые моно и читаются как подписи, а не заголовки.
- polish — строка футера «under 150 KB and loads nothing from other sites» читателю-нанимателю не нужна (спека cv-page требует «under 150 KB»: правка спеки).
- polish — `/favicon.ico` отдаёт 404: ошибка в консоли и пустая иконка вкладки.
- polish — заголовок «Case: a multi-agent harness on Claude Code» с префиксом «Case:» звучит странно.
- polish — `/llms.txt` на локальном `python3 -m http.server` отдаётся без charset (Chișinău читается как «ChiÈ™inÄƒu»); на Pages charset utf-8, так что только превью шага: тестовому и превью-серверу дать UTF-8 или принять.
Out: новые разделы; тексты LinkedIn.
Done when: каждая строка либо исправлена, либо снята владельцем с причиной; полная проверка зелёная; телефон 390 без обрезки.
Decide: —

## Follow-ups

- [репо `.claude`] Приватность: хук cc-plugin-privacy режет запись собственного email владельца рядом с именами его проектов (caro.md, infodreamhome.com), в том числе в тестах публичного сайта-резюме, и роль не вправе его обходить; хука нет ни в `settings.json`, ни среди плагинов, снять его из сессии нельзя. Завести шаг в roadmap `~/.claude`: где живёт хук и как его настроить или снять, и будет ли это скил или агент (решение владельца, cv-site, 2026-11-18).
## Candidates (user decides)
