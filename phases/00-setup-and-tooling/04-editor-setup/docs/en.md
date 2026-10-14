# Editor Setup

> After this lesson an agent can point at a file and a line, and you land there
> without searching.

**Type:** Build
**Prerequisites:** Lesson 1, Dev Environment
**Time:** ~30 minutes

---

## Learning Objectives

- Jump straight to a file and line from a command, the way an agent will ask
- Find every reference to a name in one keystroke
- See, in one glance, the lines you are about to hand to an agent
- Reject an agent's edit while keeping it recoverable

---

## The Problem

An agent says: "the bug is at `src/parse.ts:142`." You open your editor, type
`parse`, wait for the file finder, scroll, look for line 142, check whether that
is the line. Forty seconds of ceremony, every time, for a fact you were already
told.

The cost is not the forty seconds. It is that the ceremony is where you stop
paying attention. Better: make the jump free, so reading what the agent actually
changed takes real thought.

---

## The Concept

Three capabilities, in the order you feel them.

### 1. Address a location directly

```bash
code src/parse.ts:142
```

Any terminal-to-editor setup that accepts `file:line` turns a sentence from an
agent into a cursor position. Worth setting up in whichever editor you actually
use — the `code` command here, `vim src/parse.ts +142`, `idea --line 142`.

### 2. Go to a definition, or every use, in one keystroke

| Key | VS Code | What it does |
|---|---|---|
| F12 | `Cmd/Ctrl+click` on a name | Jump to definition |
| Shift+F12 | `Alt+click` | All references |
| `Ctrl-Shift-F` | — | Search across files |
| F2 | `F2` on a name | Rename everywhere, safely |

Rename-everywhere is the one people under-use. When an agent renames a symbol in
three places and misses one, `F2` fixes it in one operation.

### 3. Stage a diff before you approve it

The habit that prevents disaster: never accept a large agent change by eye.

```bash
git diff                    # the whole change, in your terminal
git diff --stat             # how much changed, per file
git diff src/parse.ts       # just one file
```

`git diff` is the review surface. It shows exactly what will land, and it works
even if your editor is a text file you don't trust.

> **The reframe:** the editor is not where you write the change — it is where you
> *verify* it, and a review you do without reading the diff is not a review.

---

## Build It

### 1. Make `code` accept file:line

```bash
# add to your shell profile, then reload
alias c='code'
```

Test it on a real file with a real line number.

✅ You pass when the cursor lands on the line number you gave.

### 2. Set up the file you jump to most

Before an agent session, open the two or three files that task will touch.

```bash
code src/index.ts src/parse.ts
```

✅ You pass when both files open in tabs without touching the mouse.

### 3. Review the way you will actually be asked to

Make a change on a scratch branch, then read it three ways:

```bash
git diff --stat              # shape: how much, where
git diff                     # content: line by line
code --diff src/index.ts     # side-by-side, coloured, in your editor
```

✅ You pass when you can state exactly which lines changed without scrolling
through the file.

### 4. Reject an edit without losing it

The safety move. Never delete a bad agent change — park it.

```bash
git stash push -m "agent attempt: parse rewrite"
git status                   # clean
```

Later, look at what you threw away:

```bash
git stash list
git stash show -p stash@{0}
```

Bring it back if it turns out to be right:

```bash
git stash pop
```

✅ You pass when the file is restored to its committed state and the agent's
attempt is still recoverable from the stash list.

### 5. Find every place a name appears

Open any code file, put the cursor on a function name, press Shift+F12.

Then compare against what git thinks changed:

```bash
git diff --name-only
```

✅ You pass when you can say whether the agent's rename touched every reference
or missed some.

---

## Use It

| Command / concept | When you reach for it |
|---|---|
| `code file:line` | Jumping to what an agent pointed at |
| `git diff` | Reviewing any agent change before it lands |
| `git diff --stat` | Gauging how big a change is in one line |
| `git diff -- file` | Narrowing the review to one file |
| `git stash push -m "..."` | Parking a change you don't want yet |
| `git stash list` / `git stash show -p stash@{0}` | Looking at what you parked |
| `git stash pop` | Bringing a parked change back |
| Shift+F12 (find references) | Checking whether a rename was complete |
| F2 (rename symbol) | Fixing a rename an agent got wrong |
| `code --diff file` | The visual review surface |

---

## Exercises

1. Open a file at line 1, then at line 200, in two commands. No scrolling, no
   file-picker.
   ✅ You pass when you land on both lines exactly.

2. Make a ten-line change to one file, then describe the change using only
   `git diff --stat` and `git diff`. No opening the file.
   ✅ You pass when your description names the file and every changed region.

3. Have an agent (or a friend) make a change you dislike. Park it with `git
   stash push`, verify the file is back to its committed state, then recover the
   parked version with `git stash show -p` without applying it.
   ✅ You pass when the file is clean *and* you can still read the discarded diff.

4. Rename a function by hand in a file that has three call sites, then use
   rename-everywhere to verify nothing was missed.
   ✅ You pass when the project still builds and no stale references remain.

---

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| `file:line` | "a jump link" | A path plus a line number that editors turn into a cursor position. The agent's default way of pointing at code. |
| diff | "the changes" | The line-by-line difference between two states. `git diff` compares working tree to the last commit. |
| `git diff --stat` | "summary" | Files changed and lines added/removed, per file. No content. |
| stash | "save for later", "undo" | A commit that is not on any branch. Parks work off your working tree without deleting it. |
| find references | "global search" | Structural lookup of one symbol's uses, understanding scope. Search finds text; this finds code. |

---

## What this lesson skipped

No keybinding customisation, no themes, no extension recommendations, no
multi-cursor editing tutorial, no language-server setup. Those are taste, and
taste is not what this course teaches.

Also skipped: LSP setup beyond what editors do automatically. If a later lesson
needs language-server concepts it will ground them there — nothing above assumes
them.