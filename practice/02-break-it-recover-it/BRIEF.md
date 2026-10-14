# Module: 02.1 — Break it. Recover it. Recover it again, faster.

**Type:** Break
**Phase:** 02
**Time:** ~75 minutes
**Prerequisites:** Phase 02, Lessons 12–18

---

## The task

Break a repository in six ways, recover each one, then recover the same six
again **without using any git command that a beginner would not know** — using
only what you can explain.

The six breaks, one per lesson in this phase:

| # | The break | What you are simulating |
|---|---|---|
| 1 | A commit containing an agent's good fix and four files of unrelated damage | Lesson 12 — staging |
| 2 | A branch deleted with `-D` while holding unmerged commits | Lesson 13 — labels vs work |
| 3 | A merge that made a mess of your history | Lesson 14 — merge vs rebase |
| 4 | A rebase conflict you did not mean to start | Lesson 15 — ours/theirs |
| 5 | An agent that deleted a config, thrashed a source file, and added scope creep | Lesson 16 — selective recovery |
| 6 | A force-push over a colleague's commit | Lesson 18 — what nobody else has |

The deliverable is **not** the broken repo. It is a recovery log with timings,
and a second pass with no command in it that you cannot explain.

> **Constraint:** no re-cloning, no deleting `.git`, and no `git gc` or
> `git prune` at any point. Every recovery must come from a command that leaves
> the object store alone. Also: break #6 has a partner commit you must save
> *before* you break it. If you force-push over your colleague's work and never
> wrote its hash down, you have destroyed it — sit with that for a moment, then
> write it down and continue.

---

## Why this isn't just a tutorial

Anyone can read `git reflog` and repeat it. That is not the skill.

The skill is recovering under the condition that actually happens: an agent just
made thirty changes you have not looked at, it says it misunderstood something,
and you are deciding *right now* whether to roll back the whole thing or salvage
part of it. Nobody is calm in that moment on their first attempt. The point of
doing this while nothing is at stake is so the third recovery is boring.

The second pass is the part people skip and the part that matters most. A
recovery command you copied is not a recovery you can perform. The second pass
is where you find out which of the six you actually learned — and it is much
easier to find out here than at 11pm against a repo with a day of work on it.

And the pattern that repeats across all six: **every one of them is cheap if the
last known-good state was committed, and expensive if it was not.** Six breaks
is enough repetitions that you stop needing the rule to be told to you.

---

## The constraint, stated properly

- **What breaks:** tracked files deleted or overwritten, branch labels gone,
  history rearranged, a colleague's commit removed from a shared branch — the
  five ways damage actually happens to a repo.
- **How you'll know:** `git status` shows deletions or modifications; a push is
  rejected; `git log --graph` looks unfamiliar; a command you expected to work
  says a commit is gone.
- **What it costs you:** on a real repo, an afternoon and possibly a colleague's
  work. On this scratch repo, about seventy-five minutes. That ratio is the
  whole argument for doing it here.

---

## What to submit

```
attempts/
├── NOTES.md          the recovery log — required, and the actual deliverable
└── [evidence: git log output, timings, the before/after graphs]
```

`NOTES.md` must contain, per break:

| # | Command used | Seconds | The smallest command that would have worked | Why I chose this one |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |

Two graded columns. **"Smallest command that would have worked"** is where you
prove you chose rather than reached for the biggest tool. `git reset --hard`
always works and is almost never the right answer.

---

## Rules

- Work in a scratch repo. Not this one.
- Do the six breaks **in order**. Break 6 depends on the setup from break 1.
- Commit before each break. A commit you are about to destroy is the reference
  point for everything else.
- If something does not behave as this brief says, write down what actually
  happened. That is a finding, not a failure.

---

## Done means

- [ ] Six breaks performed, each from a committed baseline
- [ ] Each break has a recovery in `NOTES.md` with a timing and a smallest-command
      justification
- [ ] All six recovered again in a second pass using only commands you can explain
- [ ] The colleague's commit from break 6 was written down before the force-push
- [ ] `NOTES.md` names one command that would **not** have worked here, and why
- [ ] You can say, in one sentence, what makes every one of these six cheap or
      expensive to recover