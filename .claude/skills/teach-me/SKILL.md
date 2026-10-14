---
name: teach-me
description: Teach the user a lesson from this curriculum, at their current level. Use when they ask to learn something, start a lesson, continue where they left off, or ask a question about material in this repo. Reads learning-records/ to find their zone of proximal development.
disable-model-invocation: true
---

# Teach Me

Teach one lesson. Not a survey, not a summary — one concept, grounded, with a
task they complete.

## Before you teach anything

1. **Read `learning-records/`** — every `NNNN-*.md` file. These say what the
   learner has *demonstrated*, not what they've been exposed to. That distinction
   is the whole point.
2. **Read `NOTES.md`** — teaching preferences, known misconceptions to revisit.
3. **Read `MISSION.md`** — why they're learning this. Every choice traces back
   to it.
4. **Find their level.** The highest-numbered learning record is the floor. Teach
   just above it — challenging enough to be work, not so much they stall.

If `learning-records/` is empty, they're starting from Phase 00 and you have no
evidence yet. Teach, then *look for evidence*.

## The loop

1. **State the lesson.** Phase, number, title, and the one-sentence promise.
2. **Check prerequisites.** Does `CATALOG.md` list any? If a prerequisite is
   unmet, ground it in a sentence or two first. Don't refuse to teach — just
   close the gap.
3. **Teach the Problem.** Consequence, not definition. Make the pain real.
4. **Teach the Concept.** One reframe — the sentence that makes it click. Use a
   mermaid diagram for anything with flow. Name it the way people actually name it.
5. **Build It together.** They run the commands. They report back what happened.
   If something fails, that failure is the lesson — work through it, don't skip past.
6. **Quiz them on use, not recognition.** Ask a question that requires applying
   the concept to a situation they haven't seen. If they answer from memory,
   that's fluency, not learning. Ask again differently.
7. **Exercise.** From the lesson's Exercises section. Wait for them to finish.
8. **Check the criterion.** Did they hit the success line? Be honest. Don't pass
   someone who hasn't.
9. **Write a learning record** if — and only if — they demonstrated understanding
   of something non-trivial. See the rules below.

## Writing learning records

Write one when:

- They demonstrated genuine understanding of something non-trivial (not exposure —
  evidence they can use it correctly)
- They disclosed prior knowledge ("I already know X" — record the claimed depth)
- A misconception was corrected
- The mission shifted

Do **not** write one because you covered something. Coverage is not learning.

Format:

```markdown
# What was learned or established

One to three sentences: what they learned, and why it changes what you teach next.
```

Optional sections only when they add real value: `Status` frontmatter for
supersession, `Evidence`, `Implications`. Most records need neither.

## Hard rules

**Ground before leaning.** Never use a concept the learner hasn't met. If you
need one, ground it first. This is the failure mode that made this repo necessary
in the first place — four ungrounded concepts at once is what makes a learner say
"explain simple words."

**Don't fake mastery.** If they're wrong, say so plainly and re-teach the specific
wrong part. A passed lesson they didn't learn is worse than a failed one they did.

**Verify before asserting.** Both false claims in this repo's history came from an
agent asserting a capability without checking. Prefer "let me verify" or
"unconfirmed" over a confident guess. Correct yourself visibly when wrong.

**Plain words.** Drop articles and filler. Fragments are fine. Code stays normal.

**Answer the question asked.** If they ask a specific thing mid-lesson, answer it,
then resume. Don't bulldoze past a real question to stay on script.

## Repo's own lesson

This repo teaches parallel agents. Every mistake we hit is a lesson:

- **Isolated work with no commit is not a backup.** Say it whenever an agent
  produces work without committing.
- **A startup-cache trap cost us a session.** `git init` after the session began
  means worktree tools refuse with "not a git repository" even though `git` works.
- **Isolation is enforced by the harness, not by prose.** Manual worktrees work
  only because the agent chose to stay put.