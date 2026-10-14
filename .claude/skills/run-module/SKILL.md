---
name: run-module
description: Run or grade a practice module in practice/. Use when the learner asks to start a module, submit an attempt, or find out if they passed. Reads the BRIEF and RUBRIC, guides the work, then grades against observable criteria.
disable-model-invocation: true
---

# Run Module

Practice modules are the part of this course where the learner finds out whether
they actually learned something. Grade honestly.

## Starting a module

1. **Read `BRIEF.md` and `RUBRIC.md` for the module** before saying anything.
2. **State the task and the constraint.** The constraint is the point — lead with it,
   don't let them skip to the happy path.
3. **Read `learning-records/`** to confirm the prerequisites are real. If the learner
   hasn't demonstrated them, ground that first. Don't refuse — close the gap.
4. **Set up `attempts/`** with a `NOTES.md` stub containing the headings they need:
   what you did / what surprised you / what you'd do differently.
5. **Step back.** They work. Answer questions, don't narrate over their shoulder.

## While they work

- Let failures happen. A broken command they diagnosed is worth more than a
  smooth path you smoothed.
- If they're stuck for more than ~10 minutes, give a hint, not the answer.
- If they discover the brief is wrong, **take that seriously.** Write it down. A
  corrected brief is a finding, and it means the curriculum had a bug.

## Grading an attempt

1. **Run it.** From a clean state. An artifact that only worked on your machine
   is a fail, not a maybe.
2. **Walk the rubric literally.** Every criterion, in order. Say which passed and
   which didn't. Don't round up — partial passes get named as partial.
3. **Check `NOTES.md` exists and reasons.** Code alone is not a submission.
4. **Ask the proof-of-understanding questions.** *With the code closed.* Memory is
   fluency, not learning. If they answer from recall, ask a new situation.
5. **Write the outcome** to the rubric's attempt history: date, criteria met,
   what to fix.

## Outcomes

- **pass** — every `must` met, and they can explain the mechanism cold
- **partial** — some criteria met. Name exactly which. Say what to do next.
- **not yet** — the foundation isn't there. Say so and ground the prerequisite.
  Do not soften it.
- **pass + finding** — they met the criteria *and* found a brief error. This is
  the best outcome. Record both.

## After grading

If they genuinely learned something non-trivial, write a learning record. Evidence,
not coverage.

## Module types

| Type | What "done" means |
|---|---|
| **Instrument** | You measured something real and can explain the number |
| **Build** | It works from a clean state, and you know why it works |
| **Break** | You broke it *and* recovered it — both halves |
| **Decide** | You chose, and can defend the trade-off against alternatives |

**Break** and **Decide** modules are where the learning sticks. If a phase offers a
choice, prefer those.