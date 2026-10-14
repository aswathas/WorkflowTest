# Course Context — load this into any agent session

> **Purpose:** give an agent the whole map in one file. Paste it at the start of a
> session, or point your agent at it. It's ~250 lines and replaces nothing else —
> after reading it, the agent still reads `learning-records/` before each lesson.
>
> **Who it's for:** the learner's AI agent, and any agent asked to help with this course.

---

## What this course is

**Zero → graph engineering on Claude Code as an agentic harness.**

119 lessons, 20 phases. The learner builds real things: MCP servers, hooks,
plugins, parallel agent systems, harnesses, task graphs.

The premise: you don't need to be an ML researcher to build with agents, but you
*do* need to understand what the agent is doing. Every abstraction in Claude Code
resolves to a mechanism you can reason about, break, and rebuild.

**Not covered here** (complementary, not competing): building AI from linear
algebra up. `aiengineeringfromscratch.com` does that in 542 lessons. This course
assumes you're using models, not training them.

---

## The map

| Phase | Name | Lessons | The turn |
|---|---|---|---|
| 00 | Setup & Tooling | 5 | Tools shape thinking |
| 01 | Foundations of AI | 6 | Text becomes currency |
| 02 | **Git Deep** | 7 | Commits are photographs; branches are labels |
| 03 | Models & Families | 8 | Decision models beat generation on cost |
| 04 | **Claude Code** | 11 | The agentic loop — everything hangs on this |
| 05 | Commands & Skills | 7 | The most flexible extension |
| 06 | Subagents | 4 | Context isolation |
| 07 | MCP | 6 | A protocol, not a tool |
| 08 | Hooks | 6 | Events on the loop — enforcement, not requests |
| 09 | Plugins | 4 | The packaging layer |
| 10 | Memory & Instructions | 6 | How context persists |
| 11 | Parallelism I | 6 | The five names; isolation |
| 12 | Parallelism II | 9 | Orchestration; when *not* to parallelize |
| 13 | Context Engineering | 5 | Context as architecture |
| 14 | **Harness Engineering** | 7 | The loop minus the intelligence |
| 15 | **Graph Engineering** | 8 | What's genuinely parallelizable |
| 16 | Worktrees in Practice | 5 | Deep on the one that bites |
| 17 | Scaling & Operations | 5 | Running it for real |
| 18 | Capstone | 4 | Ship it |

**Bold phases are the destination.** Phases 00–03 exist so 04–18 don't collapse.

---

## The concept spine

Everything later leans on these. Ground them, in order:

```
tokens           text becomes countable currency
   ↓
context window   the only budget that matters
   ↓
agentic loop     model decides → tool executes → result returns → repeat
   ↓
tools            the loop's only way to touch reality
   ↓
compaction       the window fills; something must give
   ↓
isolation        separate windows = the reason parallelism works
   ↓
harness          the loop minus the intelligence
   ↓
graph            dependencies = what's genuinely parallelizable
```

**A lesson may only use a concept an earlier lesson established.** Forward
references are the primary failure mode of a course like this, and the reason
this rule is stated three times across this repo.

---

## Phases 00–03: why they come first

Learners consistently ask "explain in simple words" not because the words are
hard, but because four ungrounded concepts arrived at once.

- **Phase 00** — you can't learn anything without a terminal you're comfortable in
- **Phase 01** — `context window` is used in every later lesson; it must land first
- **Phase 02** — the word `worktree` contains `working tree`. Git is not optional.
  If a learner can't recover lost work, they can't safely use parallel agents,
  and every advanced phase inherits that fear.
- **Phase 03** — where most of the "why not just use the big model" intuition dies

**Don't let a learner skip to Phase 11.** They'll ask for parallelism, get it, and
be confused by four terms that all mean "many agents."

---

## What "grounded" means operationally

Before teaching a lesson, an agent should be able to answer: *which earlier
lesson established each concept this lesson uses?* If it can't name one, either
ground it inline or cut the reference.

In practice:

- **Lesson 47** ("fork-context subtlety") uses "context isolation" → grounded in
  Lesson 45. Fine.
- A workflow lesson using "compaction" → grounded in Phase 04. Fine.
- A hooks lesson using "agentic loop" → grounded in Phase 04. Fine.
- A Phase 06 lesson assuming "frontmatter" → **not** grounded. Phase 05 comes
  first. Fix it or reorder.

---

## The practice model

Every phase ends in a module. Modules are **graded artifacts, not exercises**.

```
practice/NN-module-name/
├── BRIEF.md      the task, with a real constraint
├── RUBRIC.md     how it's judged, criteria are observable
└── attempts/     learner's work + agent feedback
```

A module is **not** done when code runs. It's done when the rubric's criteria are
met and the learner can explain the trade-off they made.

The four module archetypes:

| Type | What it produces | Example |
|---|---|---|
| **Instrument** | A measurement | Phase 14 — find the 20% of calls costing 80% |
| **Build** | A working artifact | Phase 07 — an MCP server |
| **Break** | A recovery | Phase 02 — break the repo, recover it |
| **Decide** | A defended choice | Phase 15 — a task graph with a stated critical path |

**Break** and **Decide** modules are the ones learners remember. Favor them.

---

## Rules that make teaching work

1. **Problem before definition.** Consequence first. Make the pain real in one sentence.
2. **One reframe per lesson.** The single sentence that makes it click. Not ten.
3. **Ground, then lean.** Never use an ungrounded concept.
4. **Make them do it.** They run commands. Their failures are the lesson.
5. **Quiz on use, not recognition.** New situations only — memory is fluency.
6. **Be honest about passing.** Don't pass someone who hasn't learned it.
7. **Plain words.** Fragments fine, code stays normal.
8. **Verify before asserting.** Say "let me check" rather than guessing.

---

## What the repo has already learned

Real failures from building this course. Teach them when relevant — they carry
more weight than abstraction.

- **Isolated work with no commit is not a backup.** Three agents produced perfect
  work in separate worktrees; all three branches pointed at `main`. Nothing to
  merge. If you spawn agents, instruct them to commit.
- **The startup-cache trap.** `git init` after the session starts means worktree
  tools refuse with *"not in a git repository"* even though `git rev-parse`
  returns `true`. The harness probes cwd once at launch. Fix: restart in an
  existing repo.
- **A red suite isn't proof the agents failed.** Ours was a wrong glob in
  `package.json`. Check the runner before blaming the work.
- **Isolation is enforced by the harness, not by prose.** Manual `git worktree
  add` works only because the agent chose to stay put. Native
  `isolation: "worktree"` makes the violation impossible.
- **Two false claims, both corrected.** Workflow subagent worktrees: *unconfirmed*,
  not impossible. Cross-session workers surviving a closed tab: *they don't* —
  the transport is a per-session socket.

---

## Files an agent needs

| File | Purpose |
|---|---|
| `COURSE-CONTEXT.md` | This file — the map |
| `CATALOG.md` | All 119 lessons, per-phase |
| `LESSON-TEMPLATE.md` | Lesson structure + rules |
| `MISSION.md` | Why this learner |
| `NOTES.md` | How this learner learns |
| `learning-records/` | What they've **demonstrated** |
| `AGENTS.md` | Operating brief for the teaching agent |
| `practice/` | Modules, briefs, rubrics |

**Read `learning-records/` before teaching.** That's the difference between a
course that adapts and one that replays itself.

---

## Drift warning

Claude Code ships weekly. Model IDs and version-gated behaviour (`v2.1.2xx`+)
age badly. Teach aliases (`sonnet`, `opus`), never hardcoded versions. Link doc
pages; don't quote behaviour as permanent.

Check `https://code.claude.com/docs/llms.txt` before revising the syllabus.