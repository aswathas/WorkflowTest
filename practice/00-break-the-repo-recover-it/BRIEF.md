# Module: 00.1 — Break this repo on purpose. Recover it. Recover it faster.

**Type:** Break
**Phase:** 00
**Time:** ~60 minutes
**Prerequisites:** Lessons 1–5

---

## The task

Break a real repository badly on purpose, then recover it — first by hand, then
by letting an agent do it. Three recoveries, escalating:

1. Delete a file. Recover it yourself.
2. Corrupt a file with a large bad edit. Recover it yourself.
3. Break it again, and recover it by having an agent do the recovery.

Record how long each one took and what you did at each step. The artifact is not
the broken repo. The artifact is the recovery log, and the third recovery is the
one that has to be fast.

> **Constraint:** no `git reset --hard`, no `git clean -fd`, no re-cloning, and no
> "just undo it and start over". Every recovery must come from a command that
> leaves the working tree intact. If you find yourself wanting a nuke command,
> that is the signal you're one step from the interesting part.

---

## Why this isn't just a tutorial

Anyone can read `git checkout -- file` and repeat it. That is not the skill.

The skill is recovering under the condition that actually happens: an agent just
made thirty changes you have not looked at, it says it misunderstood something,
and you are deciding *right now* whether to roll back the whole thing or salvage
part of it. Nobody is calm in that moment on their first attempt. The point of
doing this while nothing is at stake is so the third recovery is boring.

The second half of the module is the part people skip and the part that matters
most: **delegated recovery is a different problem from manual recovery.** An agent
cannot see your screen. If you ask "fix the repo," it will flail. If you hand it
`git status` output and the exact symptom, it will be faster than you. You are
not practicing recovery — you are practicing *briefing*, which is a skill the whole
rest of this course depends on.

---

## The constraint, stated properly

- **What breaks:** tracked files get deleted, truncated, or overwritten with wrong
  content — the three ways an agent actually damages a repo.
- **How you'll know:** `git status` shows deletions and modifications; the program
  stops working.
- **What it costs you:** on a real repo, an afternoon and possibly the work you
  had not committed. On this scratch repo, about sixty minutes. That ratio is the
  whole argument for doing it here.

---

## What to submit

```
attempts/
├── NOTES.md          the recovery log — required, and the actual deliverable
└── [your evidence: terminal output, timings, transcripts]
```

`NOTES.md` must contain, per recovery:

| # | What broke | Command used | Seconds | What I'd tell an agent |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

The last column is the graded one. "Fix the repo" is a failing entry.

---

## Done means

- [ ] Three recoveries performed, each from a committed baseline
- [ ] Each recovery used a non-destructive command — nothing nuked
- [ ] Recovery 3 was performed by an agent and **faster** than recovery 1
- [ ] `NOTES.md` states the trade-off you made and why
- [ ] You can explain, without the repo open, why `git reset --hard` would have
      made recovery 3 impossible