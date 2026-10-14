# Orchestrator's plan — for me to follow when agy returns

Agy is being asked: which phase first, second, third, and why, in authoring
order, not importance. I expect an ordered list. When it lands I work from
that list, not from a parallel priority queue.

## Roles

- **me (orchestrator)** — picks the next phase, picks the lesson inside it, writes
  the two parts the agents cannot (The Problem, the reframe), runs the
  validator, commits, updates NOTES.md
- **agy** — second opinion on architecture, ordering, technical correctness
- **vibe** — content draft (lesson body, exercises, quiz.json), output as text
- **opencode** — second implementation pass, code snippets, alternative phrasings,
  output as text

## Loop per lesson

1. Orchestrator picks the next lesson from the agy-ordered schedule
2. Hand the scaffold to **vibe** with: the grounding note, what earlier
   lessons established, the title and hook, the structural skeleton. Vibe
   returns the full lesson body as text in its response. Never asks vibe to
   write files.
3. Hand vibe's draft to **opencode** for: alternative phrasings, harder
   exercises, code sanity. Opencode returns text.
4. I write The Problem and the reframe (the two parts that need a human or a
   scarred orchestrator).
5. Write the lesson file myself, paste vibe's body, paste mine, run the
   validator, commit.
6. NOTES.md gets one line: "lesson X done, ground was Y, hardest part was Z."

## Hard rules

- Workflows and agents output text. Period. If anyone wants to write files,
  refuse and dispatch a subagent with explicit output-as-text instructions.
- One commit per lesson, in the format: `feat(lesson): <NN-slug>`.
- Validator must pass before commit. If it fails, fix or rewrite — never
  bypass.
- The four user names (Jeff, LFM, Jev-lite) are unverified. Every reference
  to them in a lesson flags the verification status inline.
- If agy returns a different phase order than I'd pick, I follow agy's. The
  whole point of dispatching it is to check my reasoning.

## When this plan changes

- If vibe consistently returns prose I have to rewrite, vibe is the wrong
  tool for prose and I should write it myself.
- If opencode's "alternative phrasings" never get used, drop opencode from the
  loop. Don't pay for agents that don't earn their keep.
- If a phase takes 3 sessions to author, the next phase should be lighter
  to recover. Don't chain three heavy phases in a row.

## What I'm NOT doing

- Not running any more workflows for content. Workflows coordinate, agents
  generate, I decide. (See learning-records/0002.)
- Not asking for a parallel fan-out. Sequential is slower per lesson but
  doesn't blow up the repo.
- Not drafting phase plans into files until agy has spoken.