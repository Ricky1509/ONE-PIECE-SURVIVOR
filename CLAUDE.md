# Faro de Tormentas -- Claude Code Game Studios

Framework: [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) v1.2.0 (MIT, see `.claude/LICENSE-claude-code-game-studios`).

Indie game development managed through 49 coordinated Claude Code subagents.
Each agent owns a specific domain, enforcing separation of concerns and quality.

## Technology Stack

- **Game**: Faro de Tormentas (Storm Beacon), an original pirate survivors-like
- **Engine**: none (custom engine on HTML5 Canvas 2D, no framework)
- **Language**: JavaScript (vanilla ES2020, no build step); UI in `index.html`
- **Version Control**: Git, short-lived branches merged into `main` through PRs
- **Build System**: none for the web; Electron 38 + electron-builder in `desktop/` for the Windows `.exe`
- **Asset Pipeline**: procedural drawing (`js/dibujo.js`, `js/islas.js`) plus PNG sprite strips rendered by `tools/generar-sprites.js` (Playwright) into `sprites/`
- **Platforms**: Web (GitHub Pages, installable PWA via `sw.js`), PC (Windows Electron), itch.io (web zip)
- **Deploy**: `.github/workflows/pages.yml` (web) and `.github/workflows/escritorio.yml` (exe and zips in the `escritorio` release)

> **No Godot/Unity/Unreal.** The engine-specialist agents and `/setup-engine`
> do not apply to this project; use the general agents (design, art, audio,
> QA, production, UX). Code lives in `js/`, not `src/`.

### Code map

- `js/config.js`: all content (islands, characters, enemies, bosses, weapons, fruits, missions, chest, orders); edit data here before touching logic
- `js/juego.js`: game loop, combat, UI, saves (`localStorage` key `mdr_save`)
- `js/i18n.js` + `js/i18n-en.js`: languages; every visible text goes through `t('Spanish text')` with its English translation in `i18n-en.js`
- `sw.js`: bump `VERSION` when you change cached files

## Project Structure

@.claude/docs/directory-structure.md

## Technical Preferences

`project.yaml` at the repo root is the primary config store — engine, specialists,
naming, platform, performance, modes. Skills resolve it via `resolve_config`
(see `.claude/docs/config-resolution.md`).

`.claude/docs/technical-preferences.md` is the **legacy fallback**, read on demand
when a key is absent from `project.yaml`. It is not imported here: before
`/setup-engine` runs it is almost entirely `[TO BE CONFIGURED]` placeholders, and
after it runs `project.yaml` holds the real values.

## Coordination Rules

@.claude/docs/coordination-rules.md

## Collaboration Protocol

**User-driven collaboration, not autonomous execution.**
Every task follows: **Question -> Options -> Decision -> Draft -> Approval**

- Agents MUST ask "May I write this to [filepath]?" before using Write/Edit tools
  (exempt: `active.md` appends, agent memory, a subagent's new file at the path
  its orchestrating skill named; see `.claude/rules/agent-memory.md`)
- Agents MUST show drafts or summaries before requesting approval
- Multi-file changes require explicit approval for the full changeset
- No commits without user instruction
- A skipped or dismissed question is not an answer: act on nothing, re-ask in
  plain text and wait
- Started outside this file's folder? Warn first: hooks, deny rules and the
  ask-first mode load only when Claude Code starts here

See `docs/COLLABORATIVE-DESIGN-PRINCIPLE.md` for full protocol and examples.

> **First session?** If the project has no engine configured and no game concept,
> run `/start` to begin the guided onboarding flow.

## Coding Standards

@.claude/docs/coding-standards.md

## Context Management

Read `.claude/docs/context-management.md` on demand — it is a reference, not
session context. Two of its conventions are load-bearing and cited by name
elsewhere in the repo, so they are restated here rather than lost:

- **`production/session-state/active.md` is the session checkpoint.** The file is
  the memory, not the conversation. Read it first after any compaction, crash, or
  `/clear`.
- **Helpers in `.claude/scripts/` emit observations, never verdicts.** A script
  that scores or judges will eventually contradict a mode or override it cannot
  see. (Cited by `artifact-check.sh` and `adr-dep-graph.sh`.)
