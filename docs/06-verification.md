# 06 — Verification

**Date.** 2026-10-15

## What passed

**The lesson template validator.** Every authored lesson is checked against it, and
`3cfef5b` records that all four lessons in that commit pass. This is the only
automated verification in the repository and it is the one that matters most: it is
what keeps 119 pages shaped like one course rather than 119 pages.

**The dispatch chain was smoke-tested.** `4f02b12` records the actual test:

> "Smoke test: `dispatch('Reply with exactly: dispatch-ok')` → source agy, ok."

That is the correct shape for a smoke test — a prompt with exactly one verifiable
answer, and a check of which source answered, not just that something came back.
It confirms both that the chain works and that step 2 is carrying the load, which is
the fact `f0f3e2c` depends on.

**The site build generates 119 pages.** `scripts/build-site.mjs` produces
`site/phases/NN-phase/NN-slug.html` from the markdown source, Windows path-safe.

**The site ships more than HTML.** `9baacbc` lists a catalog, a REST API with
`openapi.json`, an MCP Registry manifest (`server.json`, Streamable HTTP, two
read-only tools), and an `llms.txt` index of every authored lesson. An agent can
consume this course without a browser, which is the appropriate shape for a course
about working with agents.

**Deployment is automated.** GitHub Actions with Jekyll, dependencies preinstalled.

## What failed

**Work was lost once, and only by luck.** From the repository's own `CLAUDE.md`:

> "Always tell a spawned agent to commit. Isolation without a commit is not a backup
> — we hit this bug on 2026-10-14 and lost nothing, but only by luck."

A spawned agent did work in isolation and produced no commit. Nothing was recovered
because the work happened to be reproducible. This is recorded as a convention rather
than as an incident report, and that framing is right — the fix is cheap and the
general failure is not.

**Two false claims entered this repository's history.** Again from `CLAUDE.md`:

> "Both false claims in this repo's history came from asserting a capability without
> checking."

The retitling in `bbef2fb` is a direct response to this. Both are recorded here so
the pattern is visible: the failure mode is stating a capability as fact without
checking it, and the fix is preferring "unconfirmed" over a guess.

**The workflow agent was the wrong dispatcher and had to be replaced.**
`4f02b12`: the in-workflow agent "routes to MiniMax and bypasses the real external
CLIs." For a course about agents, that made the build method contradict its subject.

## Still untested

**No test for the dispatch fallthrough.** The smoke test confirms step 2 works. It
does not confirm that a budget error falls through to step 3 — that path has never
been exercised, because forcing a budget error on demand is awkward. This is the
single most important untested behaviour in the repository: the chain's entire
purpose is the failure path.

**No test that a lesson is *good*.** The validator checks shape. Nothing checks that
a lesson teaches anything, that its examples work, or that it is not wrong. Given the
stated rule that both false claims came from unverified assertions, a lesson can
pass the validator while asserting something untrue.

**No end-to-end read of the site.** The build generates 119 pages; nobody has
recorded opening them and following a path through more than one.

**The MCP manifest is unexercised.** `server.json` declares two read-only tools over
Streamable HTTP. Declared is not the same as connected.

**The REST API has no test.** `openapi.json` describes typed endpoints for catalog,
resource and markdown. Whether they return what the schema says is untested.

**Windows path-safety is asserted, not demonstrated.** `build-site.mjs` is written to
be Windows path-safe and the site did build — on Windows. That is the one case that
matters and it passed, so this is noted rather than flagged.

**No accessibility record.** 119 lesson pages with a borrowed design system and no
recorded audit. The sibling repositories in this account both ran an accessibility
pass; this one has no record of one.