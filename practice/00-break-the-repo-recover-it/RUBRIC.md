# Rubric: 00.1 — Break this repo on purpose. Recover it. Recover it faster.

Every criterion is **observable** — checkable without asking permission.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | A committed baseline exists before any breakage | `git log --oneline` shows the safety commit; `git status` was clean before recovery 1 began |
| 2 | All three recoveries used non-destructive commands | Your `NOTES.md` log contains no `reset --hard`, `clean -fd`, or re-clone. Read the history: the commits are still there. |
| 3 | Recovery 1 and 2 were performed manually, from the terminal | You can name the exact command you typed for each, without re-reading your log |
| 4 | Recovery 3 was performed by an agent and was faster than recovery 1 | Compare the seconds column. If it wasn't faster, the briefing was vague — fix the briefing, not the timing. |
| 5 | The `NOTES.md` "what I'd tell an agent" column is specific | Every entry names a symptom or literal output. "Fix the repo" or "it's broken" is a fail. |
| 6 | `git status` is clean and the program runs at the end | Run it. It works. Not "it should work." |

## should

| # | Criterion | What it signals |
|---|---|---|
| 7 | You kept the broken state long enough to record `git status` output | You captured evidence before fixing, which is what makes the log worth anything |
| 8 | You recovered selectively at least once (one file, not the whole tree) | You know `git checkout -- <file>` from `git checkout -- .`, and can say when each is right |
| 9 | You tried a bad briefing first and observed the difference | You have evidence for *why* briefing quality changes the outcome, not just an assertion |
| 10 | `NOTES.md` names a recovery command that would NOT have worked here | You know your tools' limits. Example: `git stash pop` after the changes were already discarded. |

## proof of understanding

Answered **without the repo open**:

1. You destroyed work with `git reset --hard` and now need it back. What exactly
   do you run, and what are the honest odds? *(Mechanism, not recall.)*
2. An agent made a good change and a bad one in the same file. Which single
   command gets you back to the last commit, and what exactly do you lose?
   *(The easy answer is "everything" and it's wrong.)*
3. You have a large agent-made change you want to reject but still be able to read
   later. Which command, and how do you get it back if you change your mind?
4. When would you **not** reach for git to recover work at all? *(Name a case
   where it cannot help.)*

If they're answered from memory, ask again with a new situation — swap in an
untracked file, a deleted branch, or a repo with no commits.

---

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |