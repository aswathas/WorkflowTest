# 04 — Plan

**Date.** 2026-10-16

## Why this file is a reconstruction

No plan document was written before the work. The seven phases below were
recovered from the order of the 37 build commits, and this file is being written
after the fact rather than before the fact. The skill's rule is that a locked
plan is not edited to change the plan; that rule cannot apply to a plan that did
not exist at the time, so what follows is a description of the path the commits
actually took, with the point at which reality diverged from the stated aim
marked honestly rather than smoothed over.

## Phase 0 — Build something disposable first

**Commits.** `7b795ec` through `308941f`, 2026-10-14.

A toy project — `shout`, `double`, `sum`, `triple` — scaffolded with failing
stubs, implemented across three branches (`feat/a`, `feat/b`, `feat/c`), merged
one at a time, with a broken test glob found and fixed (`6c65b19`). The purpose
is stated in the repository's own `CLAUDE.md`: "The `src/` files are a
deliberately tiny toy project used as experiment fodder."

This phase also produced the convention that matters more than the toy: "Always
tell a spawned agent to commit. Isolation without a commit is not a backup — we
hit this bug on 2026-10-14 and lost nothing, but only by luck." The near-miss is
recorded as a convention because the fix is cheap and the general failure is not.

## Phase 1 — Abandon the experiment, keep the repo

**Commit.** `7e2e905`, 2026-10-15.

The toy project is deleted, the README is rewritten as the course front page, and
MIT licensing is added. The repo changes identity in one commit — 32 files,
1739 insertions, 106 deletions.

This is the first place the path forked. The original thread was a worktree
experiment; the commit subject says so. What survived was the harness idea and
the agent conventions. Everything else about the original direction was dropped.

## Phase 2 — Author one lesson by hand, fully, as the reference

**Commits.** `3360381`, `86a3c42`, `e08627e`.

Lesson 00.1 Dev Environment was written, then had its Problem section rewritten,
then was rewritten again "after pedagogical review" — 283 insertions against 159
deletions. It shipped with a runnable `code/setup-check.sh`.

Three passes on one lesson is the expensive part of this phase, and it was spent
deliberately: this file became the thing the automated path had to reproduce.
`4b4d271` later calls it "the one authored lesson."

## Phase 3 — Make the inventory the source of truth, and scaffold everything from it

**Commits.** `6768478`, `7848668`, `45fa9b4`, `55872d7`, `d2fcb5f`.

`scripts/scaffold-catalog.mjs` parses `CATALOG.md` and materialises every lesson
(`docs/en.md`, `quiz.json`, `code/`) and every practice module (`BRIEF.md`,
`RUBRIC.md`, `attempts/`). `CATALOG.md` is upgraded to carry a machine-readable
table row per lesson, a prerequisite line per phase, and a module line with type
and practice path — with a warning in the file itself: "Don't restyle those
without updating the parser."

Three problems surfaced inside this phase and each got its own commit:

- `45fa9b4` — three agents each wrote a scaffolder; two were broken. One survives.
- `55872d7` — duplicate `NN.N` practice directories, 874 deleted lines.
- `d2fcb5f` — **the scaffolder destroyed the only fully authored lesson in the
  repository**, 261 reviewed lines plus `setup-check.sh` replaced by a 72-line
  skeleton, in the same commit whose message claimed "Idempotent: never
  overwrites authored work." The surviving scaffolder did have an `existsSync`
  guard; the overwrite came from one of the two parallel scaffolders later
  deleted in `45fa9b4`. The lesson was restored from `e08627e`.

That commit is the clearest single entry in this repository's history for the
rule in `CLAUDE.md`: the false claim was not the prose, it was the commit
message asserting a property the code did not have.

## Phase 4 — Build the parallel authoring harness, and fix it five times

**Commits.** `c168c68`, `4b4d271`, `08ac47b`, `7f9cffe`, `66e088e`, `77adb0b`, `b25e45a`, `e22dbf0`.

`scripts/write-phase.mjs` is one headless worker that authors one phase and is
told to commit. `scripts/write-all-phases.mjs` gives each phase a worktree and a
branch and merges in catalog order. Before that harness is trusted, the
validator is hardened — `4b4d271` adds scaffold-marker rejection and takes the
report from "119 lesson(s) pass" to 271 real defects.

Then the harness is fixed five separate times, and every one of those fixes
describes a way in which the fan-out would have been a silent no-op that reported
success:

- `7f9cffe` — `const done` declared twice, a `SyntaxError`; the script had never
  run. And a phase filter that scoped lessons but not practice modules, so every
  phase would look unfinished forever and be re-authored on every run.
- `66e088e` — workers were leaving their worktrees.
- `77adb0b` — `git grep -lq` tested stdout, but `-q` suppresses output on a hit,
  so stdout was empty for every phase and the fan-out reported "0/0" having
  authored nothing. With `shell: true` the backtick in the pattern reached `cmd`
  unescaped and git exited 128 on both paths, which reads as "no skeleton
  found," which reads as "already authored."
- `b25e45a` — workers spawned by `execPath` rather than by name.
- `e22dbf0` — "Windows puts node under `C:\Program Files\nodejs`. `shell: true`
  hands cmd an unquoted argv, so all four workers in wave 1 died ENOENT before
  starting and the script reported success."

The verification note on `77adb0b` is the right discipline and worth keeping:
"Verified: 00 -> status 1 (skip), 01 and 18 -> status 0 (work)."

## Phase 5 — Produce content

**Commits.** `e358c23`, `0c2ad7b`, `c2aa31e`, `77fceeb`, `cdad3d0`, `3cfef5b`.

Phase 00 in full (five lessons plus module 00.1), then phase 01, then phase 02,
then lesson 19, then lessons 02–05 completed. The split is the decision recorded
in `03-decision.md`: drafts from external agents, structure and integration from
the orchestrator. `3cfef5b` states it per commit — "All four lessons authored by
agy (Gemini) and integrated by the orchestrator. All pass the lesson template
validator."

Lesson 1 gets a forbidden-term gate (no MCP, hooks, skills, subagents, worktree,
"context window", "parallel") because `AGENTS.md` requires grounding a concept
before a later lesson leans on it. Phase 00 validates clean on its own.

## Phase 6 — Ship a surface, then a dispatcher, then deployment

**Commits.** `9baacbc`, `bbef2fb`, `4f02b12`, `f0f3e2c`, `15a5d64`, `d3faccd`.

The static site: 119 generated pages, `llms.txt`, `openapi.json`, `server.json`,
full design tokens, built by a Windows path-safe generator. Then the retitling of
lessons 25 and 26. Then the dispatch chain, first two hops, then a direct Gemini
REST hop prepended, then two commits adding a GitHub Actions Jekyll workflow.

## Where the plan did not hold

**89 of the 119 lessons are still scaffolds.** 30 are authored. Running the
validator now exits 1 with 221 problems, and every one of them is an unwritten
scaffold rather than a structural defect — the shape is right, the content is
not there. Of 19 practice modules, 3 have a complete `BRIEF.md` and `RUBRIC.md`;
the rest still contain `Fill this in`.

The reason is not recorded anywhere in the repository. The commits that follow
the harness fixes move straight from phase 02 to lesson 19 to lessons 02–05, with
no commit saying the fan-out stopped, why, or whether the remaining work was ever
intended to be dispatched in bulk. `NOTES.md` and `ORCHESTRATOR-NOTES.md` describe
an orchestrator loop that was not what the shipped harness does. This is stated
here as a gap rather than filled with a plausible story.

**The two deployment paths were never reconciled.** See `02-options.md`.