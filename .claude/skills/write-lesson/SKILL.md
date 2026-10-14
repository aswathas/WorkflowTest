---
name: write-lesson
description: Author a new lesson for this curriculum following LESSON-TEMPLATE.md. Use when the user asks to write, draft, or add a lesson, or when a lesson is marked planned in CATALOG.md.
disable-model-invocation: true
---

# Write Lesson

Author one lesson. Follow `LESSON-TEMPLATE.md` exactly — the structure is the
product, not a suggestion.

## Process

1. **Read `LESSON-TEMPLATE.md` in full.** The rules section matters as much as
   the structure.

2. **Read the target lesson's entry in `CATALOG.md`** for its promise and neighbors.

3. **Check grounding.** List the concepts this lesson will use. For each, name the
   lesson that established it. Anything ungrounded is either something this
   lesson must ground first, or a forward reference you must cut.

4. **Write `phases/NN-slug/NN-slug/docs/en.md`.**

5. **Write `quiz.json`** if the lesson has checkable facts — one object per
   question, `answer` and `distractors` of equal length.

6. **Write `code/`** if the lesson is `Type: Build`. It must run. Verify it runs.

## The failure modes to avoid

**The ungrounded leap.** The most common defect. A lesson using "the agentic loop"
before Phase 04 grounds it. Fix: ground inline, in a sentence or two, or move the
dependency.

**Ten reframes instead of one.** Find the sentence that makes it click. Delete
the others. A lesson with six insights has none.

**No success criteria.** Every exercise needs an observable "you pass when". If
you can't write one, the exercise is vague — rewrite it until you can.

**Asserting version-gated behaviour.** Claude Code ships weekly. Link the doc page;
teach the concept. If you state a fact that could change, date it.

**Inventing terminology.** Use the words the official docs use. If the docs
renamed something, teach the rename and note the old name as a redirect — don't
pretend the old name is current.

## Before you present it

Check:

- [ ] Every concept used is grounded in this or an earlier lesson
- [ ] Exactly one reframe
- [ ] Every exercise has a pass criterion
- [ ] Key Terms names the misconception, not just the definition
- [ ] Nothing asserted without a source or a date
- [ ] Code actually runs (if any)

Then present the lesson to the learner. Do not just hand them the file — teach it,
using the `teach-me` skill's loop.