#!/usr/bin/env node
// write-phase.mjs — author one phase's lessons with a headless Claude worker.
//
// One worker per phase, each isolated in its own git worktree and its own
// branch, each required to commit. Isolation without a commit is not a backup —
// that scar is recorded in AGENTS.md.
//
// Usage:  node scripts/write-phase.mjs <phase-slug>
//

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const phase = process.argv[2];
if (!phase) {
  console.error('usage: node scripts/write-phase.mjs <phase-slug>');
  process.exit(1);
}

const PHASES_DIR = join(ROOT, 'phases', phase);
if (!existsSync(PHASES_DIR)) {
  console.error(`no such phase: ${phase}`);
  process.exit(1);
}

const PROMPT = `
You are authoring lessons for a curriculum repo at ${ROOT}.

## Your assignment

Author the FULL lesson bodies for phase \`${phase}\` — every lesson directory
under \`phases/${phase}/\`, plus the practice module this phase points at.

For each lesson directory \`phases/${phase}/NN-lesson-slug/\`:
- Rewrite \`docs/en.md\` completely. No placeholder text survives.
- Rewrite \`quiz.json\`. Real questions, real options, integer answer index.
- If \`code/\` exists and the lesson is Type: Build, put a runnable file there.

Also author the phase's practice module (BRIEF.md and RUBRIC.md). Find its path
from the "**Module NN.N**" block for this phase in CATALOG.md.

## Read these first, in order

1. \`LESSON-TEMPLATE.md\` — the structure. The structure IS the product.
2. \`CATALOG.md\` — your phase's entry. Each lesson row states its promise.
3. \`COURSE-CONTEXT.md\` — the concept spine and the grounding rule.
4. \`MISSION.md\` and \`NOTES.md\` — who the learner is and how they learn.
5. \`AGENTS.md\` — the teaching brief.
6. Two or three sibling lessons from EARLIER phases, to match voice and depth.

## Non-negotiable rules

**Ground before leaning.** A lesson may only use a concept an earlier lesson
established. Phases 00-03 exist so 04-18 don't collapse. If you need a term the
reader hasn't met, ground it inline in a sentence or two, or cut it. Check the
"concept spine" in COURSE-CONTEXT.md for what is safe to assume.

**One reframe per lesson.** Exactly one \`**The reframe:**\` line. Not ten.

**Problem before definition.** Open with consequence. Real incident, not a
hypothetical. The reader must feel the pain in a sentence before the concept.

**Every exercise gets a pass criterion.** A line starting with ✅ containing
"You pass when" and an observable state. If you can't write one, the exercise
is too vague — rewrite it.

**Plain words.** Fragments fine. Code stays normal.
Bad:  "The worktree abstraction provides isolation for concurrent modification."
Good: "Each agent gets its own folder. Nobody steps on anyone."

**Cite, don't assert.** Claude Code ships weekly and model IDs age fast. Teach
aliases (\`sonnet\`, \`opus\`), never hardcoded versions. Link
https://code.claude.com/docs/llms.txt and date anything version-gated.

**Quiz on use, not recognition.** Every question needs a new situation, not
"what did this lesson say". Each question: options[] with 4 entries, an integer
\`answer\` index, \`distractors\` of equal length, and an \`explanation\` saying
why the right answer is right AND why the tempting wrong one is wrong.

**Say what you skipped.** Name anything deliberately not covered, and when to
come back for it.

## Verify before you finish

Run: \`node scripts/validate-lessons.mjs ${phase}\`

It must pass. It checks required sections, the reframe count, exercise pass
criteria, and quiz shape. Fix everything it reports, re-run until clean.

## Commit (mandatory)

\`\`\`
git add -A phases/${phase} practice
git commit -m "feat(${phase}): author lesson bodies"
\`\`

Work in your assigned worktree directory, not the main checkout. A session
that ends without a commit loses all of its work. Do not push; do not merge.
`;

// Prompt goes on stdin: passing it as an argv string loses it to shell quoting.
const res = spawnSync(
  'claude',
  ['-p', '--permission-mode', 'acceptEdits', '--model', 'sonnet', '--max-turns', '200'],
  { cwd: process.cwd(), stdio: ['pipe', 'inherit', 'inherit'], input: PROMPT, shell: true },
);

process.exit(res.status ?? 1);