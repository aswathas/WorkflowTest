# 07 — Retro

**Date.** 2026-10-16

Written after the repository shipped, with the code in its final state and the
validator run against it. Where this file says something is unrecorded, it means
the commit history does not say it and the person who wrote this file did not
watch the work happen.

## What worked, and was worth the pain

**The validator got hardened at the right moment, and it is the reason the
repository is honest about itself.** `4b4d271` is the single most valuable
commit in the history. The validator reported "119 lesson(s) pass" while 118 of
them were 72-line scaffolds, and the reason it could be fooled is now written
down in the code: every structural rule is satisfied by the template, because
the template is the input. Adding scaffold-marker rejection took the honest
count from 119 to 30.

The lesson generalises past this repository: **a check that cannot distinguish
the real thing from a plausible copy of it is not a check.** That is worth more
than the 30 lessons.

**Commit messages recorded failures at the point they happened.** `77adb0b` does
not say "fix git grep"; it says that `-q` suppresses stdout on a hit, that
stdout was therefore empty for every phase, that the fan-out reported "0/0"
having authored nothing, and that the same commit verified the fix — "00 -> status
1 (skip), 01 and 18 -> status 0 (work)." Six months from now that commit is the
entire explanation. Nobody needs to reconstruct it from a diff.

**`d2fcb5f` is the model for how to write up a mistake.** It names the damage
(261 reviewed lines plus `setup-check.sh` replaced by a skeleton), names the
cause precisely (the overwrite came from one of the two parallel scaffolders
later deleted, not from the surviving one), names why it cannot recur, and names
where the restored content came from. It also, by naming the false claim in its
own message, becomes the evidence for the rule in `CLAUDE.md`.

**The scope decision to reject scaffolds rather than ship them held up.** 89
lessons are unwritten and the repository says so, loudly, every time anyone runs
a check. That is the correct outcome for a course about not asserting
unverified things.

## What did not work

**The harness reported success while doing nothing, five separate times.** This
is the real failure of the project, and every instance has the same shape: a
silent no-op that looks like completion.

`7f9cffe` — a duplicate `const done` declaration meant the script had never
executed. `e22dbf0` — `shell: true` handed `cmd` an unquoted argv containing a
path with a space, so all four workers died ENOENT before starting and the script
reported success. `77adb0b` — `git grep -lq` tested stdout, and `-q` suppresses
output on a hit, so stdout was empty for every phase; the shell variant exited
128 on both paths, which reads as "no skeleton found," which reads as "already
authored." Two independent ways to skip all 18 unwritten phases.

None of these were found by reading the code. They were found by checking what
the harness actually did. That is the correct time to find them and the wrong
time to find them.

**The harness was shipped before it worked.** The first version landed in
`c168c68` and was fixed in the next four commits. The fixes are small, but each
one is a case where a run would have appeared to succeed. The lesson is not
"test your scripts" in the abstract — it is that a parallel orchestration script
should assert on its own observable effect before declaring a phase done.

**The plan did not exist.** This file and `04-plan.md` were written on 2026-10-16,
after the fact, by reading the commit order. `ORCHESTRATOR-NOTES.md` describes a
per-lesson loop with a specific agent role assignment; `NOTES.md` describes a
different learner-facing approach; neither is what the shipped harness does. A
reader who finds `ORCHESTRATOR-NOTES.md` reasonably is being misled, because it
is written in the present tense about work that did not proceed that way.

**89 lessons were never written, and no commit says why.** The commits after the
harness fixes move from phase 02 to lesson 19 to lessons 02–05 and then to the
site. There is no "stop", no budget note, no decision file. Either the fan-out was
tried and abandoned, or it was never run at scale, and the repository does not say
which. Given `01-problem.md`'s claim that a curriculum stalling at a budget
ceiling is the failure mode this project exists to prevent, the absence of that
note is the most consequential missing record in the repository.

**The scaffolding destroyed the work it was scaffolding.** `d2fcb5f` again,
because it is the one that cost something. Three agents each wrote a scaffolder;
the one that lacked an `existsSync` guard ran and overwrote the only fully
authored lesson, in a commit whose message asserted the opposite. The lesson was
recoverable only because it had been committed recently. It was luck, and the
commit that restores it says so.

## What to keep

The scaffold-marker check in the validator. It is three regular expressions and
it is the difference between a truthful count and a false one.

The one-agent-one-worktree convention and the "always tell a spawned agent to
commit" rule. Both are cheap, and the near-miss that produced them is recorded.

The commit message discipline. Every fix in the harness names the mechanism, not
the symptom. That is why this retro could be written without reconstructing
anything.

The forbidden-term grounding gate in lesson 01. It is the only place in the
repository where `AGENTS.md`'s "ground a concept before leaning on it" is
enforced by code rather than by good intentions.

## What to change

**Never commit a scaffolder before committing a dry run against real authored
content.** The `existsSync` guard existed in the surviving scaffolder. The bug
was not a missing guard, it was three tools running against the same tree with
different assumptions and no one owning the merge. Pick one generator, in one
commit, and run `--dry-run` before it writes.

**Every orchestration script should print what it skipped and why, per unit, and
a run that skips everything should be an error rather than a success.** Half the
harness fixes would never have been written.

**Never assert a property in a commit message that the commit does not
demonstrate.** "Idempotent: never overwrites authored work" was false at the
moment it was typed, and it is the same mistake the repository already names twice
in `CLAUDE.md`. If a claim is hard to check, it does not belong in the subject
line.

**Write the plan.** Not this one — the original. A dozen lines naming the phases
before they start would have made the abandoned fan-out an event rather than a
silence.

**Fix `CLAUDE.md`.** It describes `lessons/`, `reference/`, `assets/` and
`learning-records/`. Only `lessons/` exists, and it holds one orphan HTML file
from before the pivot. An agent that follows the convention file will write to the
wrong tree.

**Decide the deployment path.** `scripts/build-site.mjs` generates a static
site; `.github/workflows/` contains both `static.yml` and `jekyll-gh-pages.yml`.
Nothing records which one serves the course, whether both run, or why Jekyll was
added after a generator already existed.

## What the next iteration should start with

**Phase 03, then phase 05, in that order, one lesson per commit, validator green
before each commit.** By phase the real state is: 00, 01, 02 and 04 are complete
(5, 6, 7 and 11 lessons); 03 has 1 of 8; 05 has 0 of 7; everything from 06 onward
is empty. Phase 04 being complete means the grounding preconditions for phase 05
are already in place, and that the fan-out harness is no longer the thing to
debug.

The skip predicate in `write-all-phases.mjs` is the part to reuse, and it should be
run against one phase by hand before it is pointed at the tree. If the run reports
a skip, the fix is `77adb0b`.

**Then: one test for the dispatch fallthrough.** It is the only untested behaviour
that the whole design rests on, and `06-verification.md` says so. Forcing a
budget error does not need to be elegant; it needs to happen once, recorded.

**Then: an accessibility pass over the 119 pages**, since the design system is
borrowed and the sibling repositories in this account already did it.

**Not first, and not soon: reconciling `ORCHESTRATOR-NOTES.md` with what was
actually built.** It should not be rewritten as though the loop worked — it did
not — but it should carry a header saying the per-lesson loop was superseded by
`write-phase.mjs`, so that the next reader is not misled by a plan in the present
tense about work that never ran that way.