# 02 — Options

**Date.** 2026-10-16

This file records the choices that were genuinely open in `agent101`, including
the ones that lost. It is written after the fact from the commit history rather
than from a contemporaneous design note — no such note exists in the repository,
and reconstructing one that claimed to have been written at the time would be
the exact failure this repository warns about. Where an option below is recorded
as "dismissed early", that means it was dismissed before it was built, not that
it was built and thrown away.

## How to get 119 lessons written

The question that actually shaped the repository. One agent in one session does
not produce 119 mutually consistent, template-valid lessons.

**Option A — one agent writes everything.** The simplest thing to describe and
the shape most courses start from. Ruled out twice over. First, on quality: each
lesson would be individually plausible and the seams would show across 119 of
them. Second, and more specifically, the in-workflow agent was already ruled out
in the repository's own history. Commit `4f02b12` says it "routes to MiniMax and
bypasses the real external CLIs." A course about working with agents, built by a
path none of its learners will use, contradicts its own subject.

**Option B — several external agents, each owning a slice.** Real parallelism,
but it makes coherence a coordination problem across agents that never see each
other's output. This is close to what was actually built, and the failure mode
it invited is visible in commit `45fa9b4`: three agents each wrote a catalog
scaffolder in parallel, and only one of the three worked.

**Option C — orchestrator wires, agents draft.** Chosen, from `9baacbc`: "the
Orchestrator wrote the build script; agents did the content drafting; orchestrator
wired it." The boring consequential work — scaffolding, validation, integration,
site generation, git — stays in one place where one person can reason about it.
A drafted lesson is cheap to review and expensive to get structurally wrong,
which is the wrong way round for something produced in bulk.

**Option D — subagents per phase, worktree per phase, merged in catalog order.**
This is what `scripts/write-all-phases.mjs` does, added in `08ac47b`. The
per-phase worktree is justified in the same commit by `AGENTS.md`: "Branches
drift; merges worsen." Option D is Option B plus an isolation boundary that makes
a bad phase recoverable and lets the merge order be forced.

## How to get a model to answer

Three CLIs were available and none of them was reliable in the same way, or for
the same reason.

**Option A — the in-workflow agent.** Always works. Already ruled out, above.

**Option B — agy alone.** Renders the budget error partway through a long job,
which is the failure that motivates everything here.

**Option C — opencode alone.** Works, routes to a different model, and the commit
history does not record whether that was judged acceptable.

**Option D — agy first, fall back to opencode/deepseek on a budget error.** Chosen
in `4f02b12`, with the rule made explicit: only *budget* errors fall through. A
malformed request or a network error surfaces. Silently substituting a model is
how a course ends up full of content nobody knows the provenance of.

**Option E — direct Gemini REST API as the primary hop.** Added later, in
`f0f3e2c`, as step 1 of the chain. No CLI in the path and no rate-limit coupling
to Antigravity, but it needs a key the user has not supplied. It sits first
because when the key arrives it needs no work.

## How to check a lesson is real

This option set was found late and is the most consequential in the file.

**Option A — structural validation only.** Every lesson has ten required
sections, exactly one reframe, two exercises each with a pass criterion, valid
quiz JSON. The validator enforced all of it and reported "119 lesson(s) pass"
while 118 of them were 72-line scaffolds. Commit `4b4d271` names the reason
exactly: "Checking shape cannot tell a template from a lesson." Every structural
rule was satisfied by the template, because the template was the input.

**Option B — structural validation plus scaffold-marker rejection.** Chosen. The
markers are `> Skeleton.`, `Replace this placeholder`, `You pass when <observable
state>`, and for practice files `Fill this in` and `[your artifact + evidence]`.
The comment at `scripts/validate-lessons.mjs:118` is the whole argument:
"Structure is not authorship — reject an unwritten scaffold."

**Option C — no automated check, review by reading.** Never seriously entertained.
At 119 files it does not scale, and the repository's own convention puts review
behind whatever the check does not catch.

## How to hold the lesson inventory

**Option A — keep the catalog as prose and write lessons by hand as you go.** The
state of the repository through `3360381`–`e08627e`, where lesson 00.1 was
authored and reviewed three times. Excellent for one lesson, unusable for 119.

**Option B — a scaffolder per catalog format.** Three agents produced three
scaffolders in parallel; `45fa9b4` kept `scaffold-catalog.mjs` (which handles
both a table row with an explicit path and a bare numbered list with a derived
slug), dropped `scaffold-tree.mjs` as a partial file, and dropped
`build-catalog.mjs` for parsing zero lessons. One scaffolder, handling both
formats, survived.

**Option C — a bare numbered list as the single source of truth.** `7848668`
moved to it in practice: `CATALOG.md` now carries a machine-readable table row
per lesson plus a per-phase prerequisite line and a module line with type and
practice path. `7848668` also corrected count drift — 20 phases to 19, 16 modules
to 19 — across README, AGENTS, COURSE-CONTEXT, and PRACTICE.

**Option D — `practice/NN.N-slug` paths.** Dismissed. `55872d7` records that the
older `NN.N` directories "were duplicates of the same 19 modules," and they were
deleted.

## How to make the lessons look like something

**Option A — design the course site from scratch.** The usual default.

**Option B — reproduce a known-good reference design system verbatim.** Chosen,
in `9baacbc`: "Reverse-engineering report from agy drove every design decision,"
down to `--font-display VT323` and blueprint blue `#3553ff`. Matching a design
system that already exists is cheaper than inventing one and easier to verify,
because there is a reference to compare against. The cost is that the site's
visual identity is borrowed, and `03-decision.md` says so.

**Option C — ship the markdown only, no site.** Genuinely considered. Ruled out
by the audience: the repository is meant to be read both in a browser and by an
agent, which is why `llms.txt`, `openapi.json`, and `server.json` exist alongside
the HTML.

## What to put in a lesson title

**Option A — name the products.** Lesson 25 was "Decision Models — Jev, Jeff,
and the LFM line." `bbef2fb` retitled it "Decision Models Beat Generation on
Cost" and lesson 26 likewise, because those product names are unverified, and
`CLAUDE.md` records that "both false claims in this repo's history came from
asserting a capability without checking." A title is the least correctable place
to make an unverified claim.

**Option B — name the pattern, put the products in prose.** Chosen. The commit is
explicit that this is deferral rather than rejection: "If verified later, rename
in place; until then the pattern is the lesson."

## Dismissed before they were real

Two paths were never built and the history does not say they were considered.

**A custom CMS or lesson editor.** No trace in the commits. Lessons are markdown
in a directory; `CATALOG.md` says "Every lesson is one directory. The path is the
URL."

**A hosted course platform** (Moodle, Teachable, or similar). No trace. The
deliverable is a repository and a static site.

If either was weighed and dropped, the record of that weighing does not exist in
this repository.

## Still unresolved at the time of writing

**Two deployment paths.** `9baacbc` generates a static site with
`scripts/build-site.mjs`; `15a5d64` and `d3faccd` add a GitHub Actions workflow
that deploys with Jekyll. Which one is live, whether both run, and why Jekyll was
added after a static generator already existed — not recorded. Treated as open in
`07-retro.md` rather than resolved here.