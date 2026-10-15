# 05 — MVP scope

**Date.** 2026-10-16

The MVP of `agent101` is not "a course with 119 lessons". It is **a machine-readable
catalog of 119 lessons, the tooling to author them against a template, one
authoritative automated check, and a generated surface an agent can read without
a browser.** The lessons themselves are the largest piece of work and the
smallest piece of what is finished.

Everything below is stated against the repository as it stands. Where a count is
given, it was counted, not estimated.

## What the MVP does

**Declares the whole curriculum.** 19 phases, 119 lessons, 19 practice modules,
in `CATALOG.md`, with a per-phase prerequisite line and a machine-readable table
row per lesson. Verified: 119 lesson directories exist under `phases/`, 19 phase
directories, 19 practice module directories.

**Materialises the entire tree from that one file.** `scripts/scaffold-catalog.mjs`
turns the catalog into `docs/en.md`, `quiz.json`, `code/`, `BRIEF.md`, `RUBRIC.md`
and `attempts/` for every entry, idempotently, and reports its intent with
`--dry-run`. One file to change, 119 lessons to re-scaffold.

**Enforces a lesson shape.** `scripts/validate-lessons.mjs` checks every lesson
against `LESSON-TEMPLATE.md`: ten required sections, exactly one reframe,
exercises with a stated pass criterion, valid quiz JSON, and — since `4b4d271` —
rejection of scaffold markers, because a template satisfies every structural rule
by construction.

**Enforces grounding.** A forbidden-term list keyed to lesson index: lesson 01
may not mention MCP, hooks, skills, subagents, plugins, worktree, isolation,
context window, or parallelism. This is `AGENTS.md`'s "ground a concept before
leaning on it" made executable rather than aspirational.

**Carries a body of real teaching.** 30 of 119 lessons are authored, checked by
counting scaffold markers rather than by file size. Phases 00, 01 and 02 are
complete; lesson 19 and lessons 27–37 are written. Phase 00 validates clean on
its own.

**Carries real practice work.** 3 of 19 practice modules — `00`, `01`, `02` —
have complete `BRIEF.md` and `RUBRIC.md` pairs.

**Generates a site an agent can use.** `scripts/build-site.mjs` produces 119 HTML
pages under `site/phases/`, plus `llms.txt` for every authored lesson, an
`openapi.json` describing typed catalog/resource/markdown endpoints, and
`server.json`, an MCP Registry manifest declaring two read-only tools over
Streamable HTTP.

**Dispatches drafting to an external model with a declared fallback.**
`scripts/dispatch.mjs` runs a three-hop chain — direct Gemini REST API, then the
`agy` CLI, then `opencode` with deepseek-v4.1-flash — where only budget errors
fall through.

**Says what it is for.** `MISSION.md` states the learner's success criteria and
what is out of scope; `NOTES.md` records how that learner learns and which
misconceptions to revisit; `CLAUDE.md` and `AGENTS.md` state the conventions
that make the whole thing safe to extend.

## What the MVP deliberately does not do

**89 lesson bodies.** Not "not yet" in the sense of a backlog item — the tooling
exists specifically to make the gap visible. Shipping 89 drafts that satisfy the
validator would have meant shipping 89 plausible-sounding lessons whose content
nobody checked, which is the failure `CLAUDE.md` names twice. The reason the
authoring fan-out stopped is *not recorded anywhere in the repository*; it is
left as a gap here rather than reconstructed.

**The other 16 practice modules.** Same reasoning, and the validator reaches
them: commit `4b4d271` notes that 19 BRIEFs and RUBRICs were "untouched by the
validator entirely, all still reading 'Fill this in'." Extending the validator
was part of the same fix.

**The four unverified product names.** `bbef2fb` moved Jev, Jeff and the LFM line
out of lesson titles and into prose with inline verification flags. Deferred, not
rejected — the commit says "rename in place" if verified later.

**A test suite for the scripts.** There is none. The toy project from phase 0 had
tests and they were deleted in `7e2e905`. The validator is the only automated
check in the repository, as `03-decision.md` says. Excluded because the scripts
were exercised by running them — and the fixes in `7f9cffe`, `77adb0b`, `e22dbf0`
record exactly what running them revealed. That is a real weakness, not a clean
trade: none of those bugs would have been caught by running the happy path once.

**Any test of the dispatch fallthrough.** The smoke test in `4f02b12` confirms
hop 2 answers. The budget-error path to hop 3 has never fired, because forcing a
budget error on demand is awkward. `06-verification.md` flags this as the single
most important untested behaviour in the repository, and it is a deliberate gap
rather than an oversight — but the reason it is still open is not documented.

**Authentication or rate limiting on the API and MCP surfaces.** `openapi.json`
and `server.json` declare endpoints. No commit discusses auth, and none is
present. Whether that was decided or simply not reached is not recorded.

**An accessibility pass.** 119 pages on a borrowed design system, no recorded
audit. The sibling repositories in this account ran one. Unrecorded why it was
skipped.

**A second language.** Every lesson is `docs/en.md`. There is no `docs/xx.md` for
any other locale, no translation tooling, and no commit mentioning one.

**Any end-to-end read of the site.** The build produces 119 pages. No commit
records opening them and following a path through more than one.

**One file was deliberately kept out of scope but is still there.** `lessons/`
contains a single HTML file, `0001-the-safety-net.html`, which predates the pivot
to `phases/`. Nothing references it. It was not added in this MVP and no commit
removes it; it is recorded here so the next person does not read it as a fourth
lesson location.

## A note on the exclusion that is a bug

`CLAUDE.md` describes a directory layout the repository does not have: "Lessons
live in `lessons/`, quick-reference in `reference/`, reusable UI in `assets/`,
and demonstrated understanding in `learning-records/`." Of those four,
`lessons/` exists but holds one orphan file; `reference/`, `assets/`, and
`learning-records/` do not exist. Lessons live in `phases/`. This is listed under
exclusions because the MVP genuinely does not include a quick-reference section, a
shared asset library, or a learner-record system — but the mismatch between the
convention and the tree is an uncorrected error in `CLAUDE.md`, not a scope
decision, and it should be fixed as a correction rather than treated as an
exclusion the next person should respect.