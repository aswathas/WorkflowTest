# Rubric: 02.1 — Break it. Recover it. Recover it again, faster.

Every criterion is **observable** — checkable without asking permission.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | Six breaks performed, each from a committed baseline | `git log --oneline` shows a safety commit before each break. Six rows in `NOTES.md`. |
| 2 | Every recovery used a command from this phase's tables | Read the command column. No nuke command, no re-clone, no `.git` deletion. |
| 3 | The colleague's commit from break 6 was recorded before the force-push | The hash appears in `NOTES.md` with a timestamp earlier than the break. If it does not, the break was not set up — redo it. |
| 4 | The "smallest command that would have worked" column is filled in for all six | It is the graded column. `reset --hard` in that column for a single-file problem is a fail. |
| 5 | The second pass was completed with only commands you can explain | Second-pass section of `NOTES.md`, and you can explain each command when asked, without looking. |
| 6 | Second pass was faster than the first | Compare the timing totals. If it was not, identify which of the six was slow and why. |
| 7 | The repo is in a working state at the end | `git status` is clean. The program runs. Not "should work." |

## should

| # | Criterion | What it signals |
|---|---|---|
| 8 | Break 5 was recovered selectively, one file at a time | You know `checkout -- <file>` from `checkout -- .`, and can say when each is right |
| 9 | You hit at least one surprise and wrote it down | A documented surprise is worth more than a smooth run — it means you were watching |
| 10 | `NOTES.md` names a command that would NOT have worked here | You know your tools' limits. Example: `git stash pop` after the changes were already discarded, or `--ours` during a rebase meaning the opposite of what you assumed |
| 11 | Break 4's `ours`/`theirs` labels were checked in the file before choosing | The single most common silent-loss mistake in this phase. Reading them takes five seconds |
| 12 | You committed before every break, not after | Not an artefact — a habit. The whole module is built on this being automatic |

## proof of understanding

Answered **without the repo open** and without looking at `NOTES.md`:

1. An agent made a good change and a bad one in the same file, and you want the
   good one. Which single command commits only the good one, and what exactly
   does it leave out?
2. You force-pushed over a colleague's commit two minutes ago and have the hash.
   What do you run, and what is the honest odds? *(Distinguish "I wrote the hash
   down" from "I didn't.")*
3. You are mid-rebase, conflicted, and want the version your branch had before
   the rebase started. Which flag, and why is it not the one that sounds right?
4. During a rebase you run `git checkout --ours file` and the wrong content
   lands. What actually happened, and what command would have been correct?
5. A branch was deleted with `-D` four weeks ago and the reflog still has it.
   What is the honest probability it is still recoverable, and what has changed
   in those four weeks?
6. You never committed the change you lost. Name one thing that could still get
   it back, and one thing that definitely cannot.

If they're answered from memory, ask again with a new situation — swap in an
untracked file, a `git clean -fd`, or a repo where the colleague's commit was
never hashed.

---

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |