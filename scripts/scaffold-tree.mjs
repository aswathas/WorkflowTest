#!/usr/bin/env node
// scaffold-tree.mjs — create every lesson and practice-module directory that
// CATALOG.md names, with a stub docs/en.md + quiz.json (or BRIEF/RUBRIC).
//
// CATALOG.md is the source of truth (see scripts/build-catalog.mjs, which
// generates it). This script only materializes the tree so parallel lesson-writing
// agents have somewhere to write. It never overwrites an existing file, so it is
// safe to re-run at any time.
//
// Usage:  node scripts/scaffold-tree.mjs           scaffold missing files
//         node scripts/scaffold-tree.mjs --check   report gaps, write nothing
//         node scripts/scaffold-tree.mjs --stats   counts only

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const CHECK = process.argv.includes('--check');
const STATS = process.argv.includes('--stats');

const plain = (s) => s.replace(/\*\*/g, '').replace(/[`*]/g, '').trim();

function parseCatalog() {
  const lines = readFileSync(join(ROOT, 'CATALOG.md'), 'utf8').split(/\r?\n/);
  const phases = [];
  let cur = null;
  for (const line of lines) {
    const head = line.match(/^## Phase (\d\d) — (.+)$/);
    if (head) {
      cur = { num: head[1], title: plain(head[2]), lessons: [], module: null };
      phases.push(cur);
      continue;
    }
    if (!cur) continue;
    // | 12 | Commit Is a Photograph, Not a Diff | `02-git-deep/12-...` |
    const row = line.match(/^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*`([^`]+)`\s*\|\s*$/);
    if (row) {
      cur.lessons.push({ num: Number(row[1]), title: plain(row[2]), path: row[3] });
      continue;
    }
    const mod = line.match(/^\*\*Module (\d\d\.\d)\*\* — (.+?)\s*\(`(\w+)`\)/);
    if (mod) cur.module = { id: mod[1], title: plain(mod[2]), type: mod[3] };
    const dest = line.match(/^→ `practice\/([^`]+)`/);
    if (dest && cur.module) cur.module.path = dest[1];
  }
  return phases;
}

const stubLesson = (title) => `# ${title}

> TODO: one line — what is different after this lesson that wasn't before.

**Type:** Learn
**Prerequisites:** TODO
**Time:** ~30 minutes

<!-- stub from scripts/scaffold-tree.mjs — author to LESSON-TEMPLATE.md -->

## Learning Objectives

- TODO

## The Problem

TODO

## The Concept

**The reframe:** TODO

## Build It

TODO

## Use It

| Command or concept | When you reach for it |
|---|---|

## Exercises

1. TODO
   ✅ You pass when TODO

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
`;

const stubQuiz = (num, title) =>
  JSON.stringify({ lesson: num, title, questions: [] }, null, 2) + '\n';

const stubBrief = (m) => `# ${m.id} — ${m.title}

**Type:** ${m.type}

## The task

TODO

## The constraint that makes it non-trivial

TODO

## Done means

Rubric criteria met, and you can explain the mechanism with the code closed.
`;

const stubRubric = (m) => `# ${m.id} — Rubric

**Type:** ${m.type}

## Observable criteria

- [ ] TODO

## Proof-of-understanding questions

1. TODO
`;

const phases = parseCatalog();
const lessons = phases.reduce((n, p) => n + p.lessons.length, 0);
const modules = phases.filter((p) => p.module).length;

if (STATS) {
  console.log(JSON.stringify({ phases: phases.length, lessons, modules }));
  process.exit(0);
}

const missing = [];
let written = 0;

function ensure(path, content) {
  if (existsSync(path)) return;
  missing.push(path.slice(ROOT.length + 1).replace(/\\/g, '/'));
  if (!CHECK) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    written++;
  }
}

for (const phase of phases) {
  for (const l of phase.lessons) {
    const base = join(ROOT, 'phases', l.path);
    ensure(join(base, 'docs', 'en.md'), stubLesson(l.title));
    ensure(join(base, 'quiz.json'), stubQuiz(l.num, l.title));
  }
  if (phase.module) {
    const dir = join(ROOT, 'practice', phase.module.path);
    ensure(join(dir, 'BRIEF.md'), stubBrief(phase.module));
    ensure(join(dir, 'RUBRIC.md'), stubRubric(phase.module));
  }
}

if (CHECK && missing.length) {
  console.error(`${missing.length} missing path(s):`);
  for (const p of missing) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(
  CHECK
    ? `complete — ${lessons} lessons / ${modules} modules present.`
    : `${written} file(s) written; ${lessons} lessons / ${modules} modules in catalog.`,
);