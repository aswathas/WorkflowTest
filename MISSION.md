# Mission: Claude Code Parallelism

## Why
The user builds real products and wants multiple AI agents working at once without
losing work or second-guessing which agent did what. Today they could not say which
of Claude Code's four parallelism mechanisms (subagents, agent teams, worktrees,
workflows) to reach for — so they guessed, and guessing cost them a restart and a
manual workaround.

## Success looks like
- Given a task, pick the right mechanism (or decide parallelism is wrong) in seconds
- Run N agents on N files with no collisions and no lost work
- Explain a merge conflict they just hit, and resolve it without panicking
- Recover work after an agent goes sideways, using git

## Constraints
- Git knowledge is rusty: branches, commits and merge conflicts are shaky
- Primary fear is **lost or corrupted work**. Isolation is a safety net, not a
  convenience. Lessons should foreground recoverability over throughput.
- Prefers plain language, minimal jargon, worked examples over abstractions
- Learned better by running things than by reading about them

## Out of scope
- The Claude Agent SDK and cloud-side agent infrastructure
- Prompt-engineering techniques for subagents
- Cost optimization and token budgeting
- Enterprise / managed-settings configuration