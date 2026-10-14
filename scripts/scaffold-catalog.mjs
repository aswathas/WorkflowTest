#!/usr/bin/env node
// scaffold-catalog.mjs — materialize the full course tree from CATALOG.md.
//
// CATALOG.md is the single source of truth: it declares every lesson's number,
// title and path, plus every practice module's path. This script turns those
// declarations into directories with template-conformant skeletons.
//
// Idempotent: never overwrites an existing file. Authored content is left alone.
//
// Usage:  node scripts/scaffold-catalog.mjs [--dry-run]

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const DRY = process.argv.includes('--dry-run');

const CATALOG = readFileSync(join(ROOT, 'CATALOG.md'), 'utf8');

/** Strip markdown emphasis so a title reads as prose, not as markup. */
const plain = (s) => s.replace(/\*\*/g, '').replace(/`/g, '').trim();

// CATALOG.md is edited by hand, so it has been seen in two shapes. Support both:
// a table row declaring an explicit path…
//   | 6 | What a Language Model Is | `01-foundations-of-ai/06-what-a-language-model-is` |
const LESSON_TABLE_RO = /^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*`([^`]+)`\s*\|\s*$/;
// …and a bare numbered line, where the path must be derived from the title.
//   6. What a Language Model Is
const LESSON_LIST_RO = /^(\d+)\.\s+(.+?)\s*$/;

// Practice modules, seen in two shapes:
//   **Module 00.1** — Break this repo on purpose. Recover it. (`Break`)
//   Type: Break. → `practice/00-break-the-repo-recover-it`
const MODULE_RO = /^(?:\s*>\s*)?\**Module\s+(\S+?)\**\s+—\s+(.+?)\s*$/;
const MODULE_TYPE_RO = /^(?:\s*>\s*)?\**Type:\s*(Instrument|Build|Break|Decide)\b.*$/;
const MODULE_PATH_RO = /→\s*`practice\/([^`]+)`/;

/** Derive a directory slug from a lesson title. The path is the URL. */
function slug(title) {
  return (
    plain(title)
      // Drop editorial asides ("← your safety net, not optional"); a URL should
      // carry the topic, not the author's commentary.
      .replace(/\s*[←(].*$/, '')
      .replace(/[)]$/, '')
      .replace(/&/g, ' and ')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
      .replace(/-+$/, '')
  );
}

function parse() {
  const lessons = [];
  const modules = [];
  const phase = new Map(); // phase number -> phase slug, for list-form paths
  let phaseNum = null;
  let pendingModule = null;

  for (const line of CATALOG.split(/\r?\n/)) {
    const ph = /^##\s+Phase\s+(\d+)\s+—\s+(.+)$/.exec(line);
    if (ph) {
      phaseNum = Number(ph[1]);
      phase.set(phaseNum, `${String(phaseNum).padStart(2, '0')}-${slug(ph[2])}`);
      continue;
    }

    const t = LESSON_TABLE_RO.exec(line);
    if (t) {
      lessons.push({ n: Number(t[1]), title: plain(t[2]), path: t[3] });
      continue;
    }

    const mod = MODULE_RO.exec(line);
    if (mod) {
      pendingModule = { id: mod[1], name: plain(mod[2]), type: 'Build' };
      continue;
    }

    // The `Type:` line may sit on its own or trail the path on the module line.
    const ty = MODULE_TYPE_RO.exec(line);
    if (ty && pendingModule) pendingModule.type = ty[1];

    const mp = MODULE_PATH_RO.exec(line);
    if (mp && pendingModule) {
      modules.push({ ...pendingModule, path: mp[1] });
      pendingModule = null;
      continue;
    }

    // List form: the phase header already recorded this phase's slug.
    const l = LESSON_LIST_RO.exec(line);
    if (l && phaseNum !== null) {
      lessons.push({
        n: Number(l[1]),
        title: plain(l[2]),
        path: `${phase.get(phaseNum)}/${String(Number(l[1])).padStart(2, '0')}-${slug(l[2])}`,
      });
    }
  }
  return { lessons, modules };
}

function write(rel, content) {
  const path = join(ROOT, rel);
  if (existsSync(path)) return false;
  if (!DRY) {
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, content, 'utf8');
  }
  return true;
}

const lessonDoc = ({ title, prev }) => `# ${title}

> Skeleton. \`/write-lesson\` replaces this line with what is different after this
> lesson that wasn't before.

**Type:** Learn
**Prerequisites:** ${prev ? `Lesson ${prev.n}, ${prev.title}` : 'none — first lesson in the course'}
**Time:** ~30 minutes

---

## Learning Objectives

- State one thing the reader can DO afterwards, not a thing they will understand
- Replace this placeholder

---

## The Problem

Consequence first. What breaks, what it costs, what happens if the reader lacks
this. Two sentences from a real incident — not a hypothetical.

---

## The Concept

The idea, named the way people actually name it. A mermaid diagram if it has flow
or structure.

> **The reframe:** the one sentence that makes it click. Replace this line.

---

## Build It

Numbered steps the reader runs. Each step ends in something observable.

1. First step.
2. Second step.

---

## Use It

| Command / concept | When you reach for it |
|---|---|
| — | — |

---

## Exercises

1. Do the thing.
   ✅ You pass when <observable state>.

2. Do the other thing.
   ✅ You pass when <observable state>.

---

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| — | — | — |

---

## What this lesson skipped

Name anything deliberately not covered, and when to come back for it.
`;

const lessonQuiz = ({ title, path }) => ({
  lesson: path,
  title,
  version: 1,
  passingScore: 3,
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: `Replace with a question about ${title} that needs a new situation, not recall.`,
      options: ['Replace me', 'Replace me', 'Replace me', 'Replace me'],
      answer: 0,
      distractors: [1, 2, 3],
      explanation: 'Why the answer is right, and why the tempting wrong one is wrong.',
      concept: 'replace-me',
    },
  ],
});

const brief = ({ id, name, type, phase, prevLesson }) => `# Module: ${id} — ${name}

**Type:** ${type}
**Phase:** ${phase}
**Time:** ~60 minutes
**Prerequisites:** Lesson ${prevLesson}

---

## The task

One paragraph. What you produce and why it isn't obvious.

> **Constraint:** the thing that makes the naive approach fail. Fill this in.

---

## Why this isn't just a tutorial

The thing this teaches that doing it the obvious way would not.

---

## The constraint, stated properly

- **What breaks:** the failure
- **How you'll know:** the observable signal
- **What it costs you:** time, data, a merge conflict, an afternoon

---

## What to submit

\`\`\`
attempts/
├── NOTES.md          what you did, what surprised you
└── [your artifact + evidence]
\`\`\`

\`NOTES.md\` is required. Code alone is not a submission.

---

## Done means

- [ ] The artifact exists and runs
- [ ] Each rubric criterion is met
- [ ] \`NOTES.md\` states the trade-off you made and why
- [ ] You can explain the mechanism without the code in front of you
`;

const rubric = ({ id, name }) => `# Rubric: ${id} — ${name}

Every criterion is **observable** — checkable without asking permission.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | The artifact exists and runs from a clean state | Run it. It works. |
| 2 | Fill in | Fill in |

## should

| # | Criterion | What it signals |
|---|---|---|
| 3 | \`NOTES.md\` names the trade-off explicitly | You understood, not just copied |

## proof of understanding

Answered **without the code open**:

1. A question requiring mechanism, not recall.
2. A question where the easy answer is wrong.
3. A "when would you NOT do this" question.

If they're answered from memory, ask again with a new situation.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |
`;

const { lessons, modules } = parse();
const written = [...new Set(lessons.map((l) => l.path.split('/')[0]))].map(
  (p) => (write(`phases/${p}/.gitkeep`, '') ? 1 : 0),
).length;

let made = 0;

for (const l of lessons) {
  const prev = lessons.find((x) => x.n === l.n - 1);
  if (write(`phases/${l.path}/docs/en.md`, lessonDoc({ title: l.title, prev }))) made++;
  if (write(`phases/${l.path}/quiz.json`, JSON.stringify(lessonQuiz(l), null, 2) + '\n')) made++;
  if (write(`phases/${l.path}/code/.gitkeep`, '')) made++;
}

for (const m of modules) {
  const phase = m.path.slice(0, 2);
  const lastLesson = lessons.filter((l) => l.path.startsWith(`${phase}-`)).at(-1)?.n ?? 1;
  if (write(`practice/${m.path}/BRIEF.md`, brief({ ...m, phase, prevLesson: lastLesson }))) made++;
  if (write(`practice/${m.path}/RUBRIC.md`, rubric(m))) made++;
  if (write(`practice/${m.path}/attempts/.gitkeep`, '')) made++;
}

console.log(
  `${DRY ? '[dry-run] ' : ''}${made} file(s) created across ${lessons.length} lessons ` +
  `(${written} new phases) and ${modules.length} practice modules`,
);