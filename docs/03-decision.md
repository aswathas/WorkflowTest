# 03 — Decision

**Date.** 2026-10-15

## Orchestrator writes and agents draft

**Chosen.** From `9baacbc`:

> "Orchestrator wrote the build script; agents did the content drafting;
> orchestrator wired it."

And from `3cfef5b`: *"All four lessons authored by agy (Gemini) and integrated by the
orchestrator."*

### What ruled out the alternative

Any single agent writing the whole course. One session does not produce 119
template-valid, mutually consistent lessons, and the failure mode is worse than
running out: each lesson is individually plausible and the seams show.

The split puts the boring, consequential work in the orchestrator — build scripts,
wiring, integration, validation — and the generative work in the agents. A drafted
lesson is cheap to review and expensive to get structurally wrong, which is exactly
the wrong way round.

### What made this work

A lesson template, and a validator against it. `3cfef5b` states that all four
lessons "pass the lesson template validator."

That validator is the part worth defending. It is the only automated check in this
repository, and it is the reason 119 lessons have a consistent shape — not review,
not discipline, but a check that fails.

### What would change this decision

If drafting quality from one agent were high enough that integration cost exceeded
drafting cost, the split inverts. There is no measurement of that yet.

## Dispatch across agents with explicit fallback, and only non-budget errors fall through

**Chosen.** A three-step chain, from `f0f3e2c`:

> 1. Direct Gemini API (fastest, requires env var)
> 2. agy CLI (Gemini via Antigravity)
> 3. opencode / deepseek-v4.1-flash

> "Any non-budget error from Gemini direct is logged and the chain continues. Agy
> budget errors fall through to deepseek."

**Step 1 bypasses the CLI entirely.** `scripts/dispatch-gemini.mjs` calls the Gemini
REST API directly with the key from `GEMINI_API_KEY`, `GOOGLE_API_KEY`, or
`~/.config/agy/config.toml`. No CLI in the path, and no rate-limit coupling to
Antigravity.

### What ruled out the alternatives

**The in-workflow agent alone.** `4f02b12` names the reason: it "routes to MiniMax
and bypasses the real external CLIs." For a course *about* working with agents, having
the curriculum built by a path nobody will use is self-defeating.

**Direct Gemini API alone.** It requires an env var the user has not supplied. Until
they do, step 2 carries the load — which is why the chain is ordered fastest-first
and degrades rather than failing.

**Fall-through on any error.** Ruled out by the specific rule: only *budget* errors
fall through to deepseek. A real failure — a malformed request, a network error —
should surface, not be silently answered by a different model. Silently substituting
a model is how a course ends up full of content nobody knows the provenance of.

### What would change this decision

If the user supplies a Gemini key, step 3 becomes vestigial and the chain is really
two steps. It is kept because "the user pastes a key" is an event that has not
happened yet.

## Lessons name patterns, not products

**Chosen.** `bbef2fb` retitled lesson 25 from "Decision Models — Jev, Jeff, and the
LFM line" to "Decision Models Beat Generation on Cost".

> "Product names (Jev, Jeff, LFM, etc.) become examples in prose rather than titles.
> If verified later, rename in place; until then the pattern is the lesson."

### What ruled out the alternative

Naming the products in the title.

The repository's own `CLAUDE.md` records the governing principle:

> "Verify before asserting. Both false claims in this repo's history came from
> asserting a capability without checking. Prefer 'unconfirmed' over a guess."

A title is the least correctable place to make an unverified claim. A title gets
remembered, quoted, and taught; a claim buried in prose is at least findable later
and correctable in place.

### What would change this decision

If the products are verified, they become titles again. The commit says so
explicitly: "If verified later, rename in place."

## Design decisions come from a reverse-engineering report

**Chosen.** `9baacbc`: *"Reverse-engineering report from agy drove every design
decision."*

The site uses the reference site's design system verbatim, down to `--font-display
VT323` and blueprint blue `#3553ff`, and the 119 lesson pages are generated from
markdown source by `scripts/build-site.mjs`, written to be Windows path-safe.

### What ruled out the alternative

Designing the course site from scratch.

Matching a known-good design system verbatim is cheaper than inventing one and
easier to verify — there is a reference to compare against. The Windows path-safety
note is a smaller version of the same instinct: the generator has to run on the
machine it was written on.

### What would change this decision

Nothing imminent. It does mean the site's visual identity is borrowed, and that is
worth knowing before anyone asks why it looks like that.