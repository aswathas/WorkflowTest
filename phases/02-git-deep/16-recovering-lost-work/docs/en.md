# Recovering Lost Work

> Four commands cover almost every lost-work situation you will ever have — and
> you can tell which one to reach for before you panic.

**Type:** Learn
**Prerequisites:** Phase 02, Lessons 12–15
**Time:** ~45 minutes

---

## Learning Objectives

- Pick the right one of soft / mixed / hard reset for a given situation
- Find a lost commit through the reflog and get back to it
- Choose `revert` over `reset` when the branch has been pushed
- Apply a pre-agent commit so any failure afterwards is a review, not a loss

---

## The Problem

An agent ran for twenty minutes, edited fourteen files, and told you it was
"about 60% done" before something went sideways. Two of the files look right.
Three look like a different design than you wanted. You cannot tell which.

You have two reactions available and both are bad. The first is `git checkout .`
— throw everything away, including the two good files and all the thinking.
The second is commit first, think later — which turns a recoverable mess into a
permanent one you now have to unpick in public.

There is a third option, and it exists because git never throws anything away
without leaving a pointer behind.

---

## The Concept

**The thing to unlearn: nothing is lost until garbage collection runs.** Every
command that "destroys work" moves a label. The old commits stay in the object
store, and the reflog records where every label pointed. Recovery is mostly
arithmetic over that list.

```mermaid
flowchart TD
    Q{What did you lose?}
    Q -->|A file you edited but never committed| A[git restore / git checkout --<br/>discards the edit; commit first if you want it]
    Q -->|A committed change you regret| B[git revert<br/>adds an undo commit]
    Q -->|Commits you want gone, unpushed| C[git reset --soft / --mixed / --hard]
    Q -->|Anything at all, "where was it?"| D[git reflog<br/>then reset back to the entry]
    Q -->|Uncommitted work you need to set aside| E[git stash<br/>Lesson 17]
```

### The four commands, in order of how much they destroy

| Command | Moves label? | Destroys uncommitted work? | Keeps the old commits? |
|---|---|---|---|
| `git reset --soft <sha>` | Yes | No | Yes, and the changes stay staged |
| `git reset --mixed <sha>` (default) | Yes | No — unstages instead | Yes |
| `git reset --hard <sha>` | Yes | **Yes** | Yes (in reflog) |
| `git revert <sha>` | No — adds a commit | No | Yes, and history stays honest |

`--soft` and `--mixed` are safe. `--hard` is the one that can cost you, and the
cost is always the same thing: **uncommitted work**, never committed work.

### The rule that saves you

> **Never `reset --hard` with uncommitted changes you have not read.**

Committed work is always recoverable through the reflog. Uncommitted work is not
in the object store at all — it exists only in your folder. `reset --hard` is
the one command in this lesson that reaches into that folder and overwrites it.

So: `git status` first. If it shows changes, `git add -A && git commit` first —
even a commit labelled `wip` is infinitely better than a folder you just
emptied. This is one line and it prevents the majority of horror stories.

### The reflog is the undo nobody teaches

```bash
git reflog                     # every position HEAD has held, newest first
git reset --hard HEAD@{3}      # go back to where it was three moves ago
```

`HEAD@{3}` is not a commit message, not a branch — it is "the third most recent
position of this label". It works after rebase, after reset, after a branch was
deleted, after a bad merge. If you take one thing from this lesson: when
something feels unrecoverable, run `git reflog` before anything else.

### The three real incidents worth knowing

**Isolated work with no commit is not a backup.** Three agents produced complete,
correct work in three separate worktrees. All three branches pointed at `main`.
Nothing to merge. Isolation without a commit is just three folders nobody was
looking at.

**`git reset --hard` after a merge you did not mean to make.** History is
intact; `git reset --hard ORIG_HEAD` or a reflog entry gets you back.

**Amending a pushed commit.** It works locally, the push is rejected, and
`git log --oneline` on the remote shows a commit you no longer have. It is
there — `git reflog` again — but you cannot push a replacement without
rewriting what others fetched, which is Lesson 14's rule about shared history.

> **The reframe:** git never deletes your commits, it moves labels — so recovery
> is not luck or forensics, it is reading the reflog and pointing a label back.

---

## Build It

### 1. Create a mistake worth recovering from

```bash
cd ~/git-drill
git switch main
printf 'good\n' > keep.txt && git add keep.txt && git commit -m "good state"
printf 'bad\n'  > oops.txt && git add oops.txt && git commit -m "oops"
printf 'junk\n' > junk.txt
git log --oneline
```

Note the hash of the "good state" commit.

✅ You pass when you can name that hash and there are two commits above it.

### 2. Recover with --soft, then --hard

```bash
git reset --hard <good-hash>
git log --oneline
git reset --soft HEAD~1
git status
```

`--hard` moves the label and discards `junk.txt` (uncommitted, gone). `--soft`
brings the "good state" commit back and keeps the tree changes staged.

✅ You pass when `git log --oneline` ends at "good state" after the first
command, and after `reset --soft HEAD~1` `git status` shows changes staged
against it.

### 3. Use the reflog instead of guessing

```bash
git reflog
```

Your previous positions are listed with short hashes, including the one before
the `--hard`.

✅ You pass when you can read the "oops" commit in the reflog output and say
that it is still there.

### 4. Undo a commit honestly with revert

```bash
git checkout -b keep-both
git revert HEAD        # or: git revert <oops-hash>
git log --oneline
```

History now contains both the mistake and its undo. Nothing was rewritten, so
this is safe on shared history.

✅ You pass when `git log --oneline` shows the original commit *and* a revert
commit above it, and you can say why that matters for a branch you pushed.

### 5. Watch uncommitted work disappear

```bash
printf 'expensive uncommitted work\n' > precious.txt
git status                              # precious.txt is untracked
git reset --hard <good-hash>
git status                              # precious.txt is gone. untracked files are not in git's way.
```

Note: `reset --hard` does not delete *untracked* files — it restores tracked
ones. To lose untracked work you need `git clean`, which is a different and much
more dangerous command.

✅ You pass when `precious.txt` still exists after `reset --hard`, and you can
state the command that *would* have removed it.

### 6. Break a merge and undo it

```bash
git switch feature
git merge main        # possibly conflicted
git merge --abort     # back to before the merge, while it's in progress
```

✅ You pass when the merge is gone and your branch is where it was before you
started it.

---

## Use It

| Command / concept | When you reach for it |
|---|---|
| `git status` | Before anything destructive. Always first. |
| `git reflog` | "Where was it?" — before you conclude anything is lost |
| `git reset --soft <sha>` | Undo commits, keep changes staged. Safe. |
| `git reset --hard <sha>` | Undo commits and discard uncommitted edits. Read `git status` first. |
| `git revert <sha>` | Undoing on shared history — history stays honest |
| `git merge --abort` | An in-progress merge went wrong |
| `ORIG_HEAD` | The position before the last merge or reset |
| `git cherry-pick <sha>` | Taking one commit from elsewhere without the rest |
| WIP commit | `git add -A && git commit -m "wip"` before anything risky |
| GC | When unreachable objects are actually reclaimed. The reason "recoverable" has a shelf life. |

---

## Exercises

1. Make five real mistakes in a scratch repo — a bad commit, a bad merge, an
   uncommitted file you clobbered, an amended commit, a deleted branch — and
   recover each one. Record the exact command.
   ✅ You pass when every recovery came from a command in the table above, and
   you can say for each one whether committed or uncommitted work was at risk.

2. Delete a branch holding unmerged commits with `-D`. Find the work again.
   ✅ You pass when `git reflog` got it back and you wrote down how long it is
   safe to wait before garbage collection makes it permanent.

3. Write your own two-line rule for before any agent run. Then read
   `AGENTS.md` in this repo and check whether your rule is already in force.
   ✅ You pass when your rule is a command, not an intention, and you can point
   at where this repo already states it.

---

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| recovery | "undoing my mistake" | Moving a label back. The commits were never deleted. |
| `reset --soft` / `--mixed` | "soft reset" | Moves the branch; keeps your working tree. Safe. |
| `reset --hard` | "starting over" | Moves the branch and overwrites tracked files. **The only command here that can destroy uncommitted work.** |
| `git revert` | "undo" | A new commit that undoes an old one. Correct on shared history. |
| reflog | "undo for git" | Every position each label has held, in order. `HEAD@{n}` indexes it. |
| `ORIG_HEAD` | "the backup" | Where HEAD was before the last merge or reset. |
| garbage collection | "cleanup" | When unreachable objects are actually reclaimed. Gives "recoverable" a shelf life. |
| untracked file | "my file" | Not in git's object store. `reset --hard` will not delete it; `git clean` will. |

---

## What this lesson skipped

**`git fsck --lost-found` and manual object plumbing.** When the reflog has
already been pruned and only dangling objects remain. Real, and much rarer than
the reflog not being checked.

**Recovering work that was never committed and the folder was overwritten.**
Git cannot help. The only recovery is a filesystem undelete tool or the editor's
local history. This is why the lesson's rule is "commit before anything risky" —
there is no second mechanism.

**Interactive rebase as a recovery tool.** `git rebase -i` to drop or reorder
commits. Same underlying reflog safety, more surface area.