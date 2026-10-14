# Module: 01.1 — Explain any codebase to yourself, out loud. Find the jargon leaks.

**Type:** Instrument
**Phase:** 01
**Time:** ~60 minutes
**Prerequisites:** Lessons 6–11

---

## The task

Pick a codebase you did not write. Ask an agent to explain how it works. Then
do the part that matters: **listen to the explanation for places where the
explanation used a term without ever saying what it meant**, and for places
where the agent stated something confidently about code no tool had read.

Deliver a leak report. The artifact is the report — a list of every place the
explanation would have confused you, with the fix for each.

> **Constraint:** you may not read the source yourself until the report is
> written. The report is about what the explanation failed to carry, and reading
> the code first turns this into a fact-check you could have done without an
> agent.

---

## Why this isn't just a tutorial

The naive version is: ask an agent to explain a repo, read the answer, feel
informed. That teaches you nothing, because you cannot tell the difference
between an explanation that was accurate and one that was merely fluent.

This forces the discrimination that the whole phase is about. Lesson 6 gave you
*plausible fiction*. Lesson 7 gave you *why the fiction gets expensive*. Lesson 8
gave you *what happens to the middle of the conversation*. A leak report is where
those three meet a real codebase and you have to catch them by ear.

You are instrumenting your own comprehension, not the codebase. The number that
matters is how many leaks you caught — and whether you caught the same ones a
second time.

---

## The constraint, stated properly

- **What breaks:** an explanation that uses six undefined terms reads exactly
  like one that uses zero. Confidence is generated, not calibrated.
- **How you'll know:** a reader who knows nothing about the codebase — you, a
  week from now — cannot answer "what is X" from the explanation alone.
- **What it costs you:** an afternoon, and a wrong mental model that shows up
  weeks later as a bug you could have predicted.

---

## Method

1. **Choose.** A repo with 20–200 files. Big enough to need explaining, small
   enough to check.
2. **Ask.** One broad question: `How does this project work? Where does a
   request enter, and what happens to it?` Save the answer verbatim.
3. **Sweep the answer for leaks.** For every technical term, ask: could someone
   who has never seen this project explain it from what this answer says? Mark
   each one. Terms like "middleware", "ORM", "dependency injection", and
   "compiled" all count. A bare project-specific name counts — nothing in the
   answer should assume you have seen the tree.
4. **Sweep for fiction.** Every claim about what the code *does* must trace to
   something the agent actually read. List the claims that have no trace.
5. **Measure.** Count leaks and untraced claims. That is your baseline.
6. **Second pass.** Ask again, this time demanding that every term be defined on
   first use and that it say "not found" instead of guessing. Count again.
7. **Spot the difference.** The delta is what you learned about how to ask.

Steps 2 and 6 must be run in separate sessions. A fresh window is what makes the
second answer a measurement rather than a continuation.

---

## What to submit

```
attempts/
├── NOTES.md                 what you did, what surprised you, the two counts
├── explanation-1.md         the first explanation, verbatim
├── explanation-2.md         the second explanation, verbatim
└── leaks.md                 the leak report
```

`leaks.md` needs, for each leak: the term, the sentence it appeared in, why it
would have confused you, and the fix — one line.

`NOTES.md` is required. Transcripts alone are not a submission; they are evidence.

---

## Done means

- [ ] Both explanations exist, from separate sessions, saved verbatim
- [ ] `leaks.md` has at least one entry per leak, with a fix
- [ ] The two counts are written down, and the second is lower
- [ ] `NOTES.md` states what changed between pass one and pass two, and which of
      the four things you were measuring actually moved
- [ ] You can explain, without either transcript open, why the second pass was
      cheaper — in terms of what the agent was asked to return, not in terms of
      effort

---

## What this module does not grade

Whether the explanation was *correct*. A wrong-but-clear explanation is a better
teaching artifact than a right-but-opaque one, and this module measures opacity,
not accuracy. Accuracy is Phase 00's debugging loop.

Whether you understood the codebase. That is not the point. The point is that
you can now tell, by ear, when an explanation has stopped carrying its weight.