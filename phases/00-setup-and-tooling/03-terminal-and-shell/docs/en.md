# Terminal & Shell

> After this lesson you can chain commands, keep long-running work alive while
> you do something else, and read a pipeline without guessing.

**Type:** Learn
**Prerequisites:** Lesson 1, Dev Environment
**Time:** ~35 minutes

---

## Learning Objectives

- Run a command's output straight into another command's input
- Keep a long job running while you get your terminal back
- Find the one flag that changes a command's behaviour, without reading its whole manual
- Explain why `cd` inside a piped command does nothing

---

## The Problem

An agent prints forty lines of build output and asks you to find the error. You
scroll. You miss it. You scroll back. You miss it again.

The terminal can do this for you, and the reason it can is a single character —
`|`. Every time you read a command with a pipe in it and shrug, you are giving up
a tool that already solves the exact problem in front of you.

---

## The Concept

Three ideas carry almost all of it.

### 1. Output flows; programs compose

Every command writes to two streams. `stdout` is the result. `stderr` is the
complaint. The pipe `|` sends the left one's stdout into the right one's stdin.

```mermaid
flowchart LR
    A[npm test] --stdout-->|pipe| B[grep FAIL]
    B --> C[head -5]
    C --> D[your screen]
```

Compose left to right. `A | B | C` means "run A, feed its output to B, feed that
to C." Each stage should do one thing.

### 2. Long jobs need to stop owning your terminal

`npm install` takes four minutes. Without a way to detach, you either wait or open
another tab and lose the output. Two answers:

| Need | Tool | Behaviour |
|---|---|---|
| Run in the background, check later | `command &` | Returns instantly, output accumulates |
| Run detached, reconnect later | `tmux` / `screen` | Detach and reattach to the same screen |
| Run detached, collect output to a file | `command > out.log 2>&1 &` | The log survives the process |

The last one is what an agent will use most. Capture to a file, read the file.

### 3. `cd` is a shell builtin, so pipes can't use it

`cd` changes the shell's own state. A program on the left of a pipe runs in a
subshell — its `cd` is discarded the moment it exits. This is not a bug, it's how
processes work, and it will waste you an hour if nobody says it.

```bash
cd src && npm test        # works — sequential, same shell
echo hi | cd src          # meaningless — the cd dies with the subshell
```

If you need "run this in that directory," wrap it:

```bash
(cd src && npm test)      # subshell — cd applies inside, discarded after
```

---

## Build It

### 1. Build a pipe that finds one error

```bash
npm test 2>&1 | grep -i "error" | head -20
```

Read it as three verbs: *run the tests, keep only lines mentioning error, show at
most twenty.* The `2>&1` folds stderr into stdout so `grep` sees the failures too.

✅ You pass when you see error lines without scrolling through raw output.

### 2. The same thing without a pipe

Worth doing once so you know what the pipe saves you:

```bash
npm test > out.log 2>&1
grep -i "error" out.log
```

✅ You pass when `out.log` exists and contains the same error lines.

### 3. Detach a long job into a log file

```bash
npm install > install.log 2>&1 &
echo "running as job $!"

# later, in another terminal
tail -f install.log        # follow it live
# or
cat install.log            # read it when it's done
```

✅ You pass when your prompt returns immediately and `install.log` grows.

### 4. Survive a closed terminal

```bash
npm test > test.log 2>&1
disown                    # detach it from this shell's job list
```

Close the tab. Reopen. `cat test.log`. If the process was killed with the shell,
you lost it — that's what `tmux` is for:

```bash
tmux new -s work         # start a named session
# ... run long things ...
# Ctrl-b, then d          detach
tmux ls                   # see sessions
tmux attach -t work       # come back
```

✅ You pass when you can detach and reattach and still see the session.

### 5. Use a subshell to run in a directory

```bash
(cd packages/api && npm test)
```

✅ You pass when the test runs in `packages/api` and your prompt is still where
it was before.

### 6. Find a command's one useful flag

```bash
git help -a | grep "  " | head        # what's available
git commit --help | less                # the real manual
man git-log | grep -A2 "--follow"       # one flag, with its neighbours
```

Most tools are consistent: `-h` short help, `--help` long, `-v` or `--version`.
Learn the two or three flags you use daily rather than the full manual.

✅ You pass when you find a specific flag without leaving the terminal.

---

## Use It

| Command / concept | When you reach for it |
|---|---|
| `cmd \| grep -i x` | Extracting one line from noisy output |
| `cmd 2>&1` | Making sure error output survives a pipe |
| `cmd > out.log 2>&1` | Capturing everything to a file to read later |
| `cmd &` | Starting something and getting your prompt back |
| `tail -f file` | Watching a file while it grows |
| `tmux new -s name` | A job that must survive a closed terminal |
| `(cd dir && cmd)` | Running a command somewhere else without moving |
| `cmd --help` / `man cmd` | One flag, not the whole manual |
| `Ctrl-r` | Re-running a previous command by typing a few letters |
| `!!` | The previous command again, e.g. `sudo !!` |

---

## Exercises

1. Run your test suite and produce a file containing only lines that mention
   either `FAIL` or `Error`.
   ✅ You pass when the file exists, is non-empty, and contains nothing else.

2. Start a long job, get your prompt back within a second, and read its output
   from a file three minutes later without having sat and watched.
   ✅ You pass when you never waited on the terminal and the log is complete.

3. Reproduce the `cd` surprise: show that `(cd src && pwd)` prints the new path
   while `pwd | cat` followed by a `cd` does not persist.
   ✅ You pass when you can show both behaviours and explain why in one sentence.

4. Find the flag for a command you use often that you had been guessing at, and
   write its one-line meaning in `NOTES.md`.
   ✅ You pass when you can state the flag's effect without re-reading `--help`.

---

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| pipe `\|` | "redirect" | Connects one command's **stdout** to another's **stdin**. Not a file redirect — that's `>`. |
| stdout / stderr | "output" / "errors" | Two separate streams. `2>&1` merges the second into the first so a pipe sees both. |
| subshell | "a new shell" | A shell spawned for one command. Its `cd` and environment changes vanish when it exits. |
| `&` | "run it later" | Start in background, return the prompt now. The job still dies if its parent shell exits. |
| `tmux` | "screen, better" | A terminal multiplexer. Detach and reattach, so the job survives the window closing. |
| flag | "option", "switch" | A single-letter or single-word argument that changes one behaviour of a command. |

---

## What this lesson skipped

No shell scripting — no `for`, no functions, no quoting rules beyond what appeared
in the examples. No job control (`Ctrl-Z`, `fg`), no process theory, no
`sed`/`awk` beyond grep. If a later lesson needs one of those it will ground it
inline; this lesson stays at the level that keeps you unblocked while reading
agent output.