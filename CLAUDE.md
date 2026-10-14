# WorkflowTest

A teaching workspace for learning Claude Code from first principles. The `src/`
files are a deliberately tiny toy project used as experiment fodder; the real
subject of this repo is the curriculum.

## Agent skills

### Issue tracker

Local markdown: issues and specs live under `.scratch/<feature-slug>/`, one file
per ticket. This repo has no git remote. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary, unmapped: `needs-triage`, `needs-info`,
`ready-for-agent`, `ready-for-human`, `wontfix`. See
`docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. Neither exists
yet — `/domain-modeling` creates them lazily. See `docs/agents/domain.md`.

## Teaching workspace

`MISSION.md` records why the curriculum exists and gates every teaching decision.
`NOTES.md` records how the learner learns and which misconceptions to revisit.
`RESOURCES.md` holds primary sources. Lessons live in `lessons/`, quick-reference
in `reference/`, reusable UI in `assets/`, and demonstrated understanding in
`learning-records/`.

## Conventions that matter for agents

- **Always tell a spawned agent to commit.** Isolation without a commit is not a
  backup — we hit this bug on 2026-10-14 and lost nothing, but only by luck.
- **One agent, one branch.** Merge immediately; branches drift and merges worsen.
- **Ground a concept before leaning on it.** Borrowed from the
  `writing-fragments`/`writing-shape`/`writing-beats` skills. A later lesson may
  not use a concept an earlier one did not establish.
- **Verify before asserting.** Both false claims in this repo's history came from
  asserting a capability without checking. Prefer "unconfirmed" over a guess.