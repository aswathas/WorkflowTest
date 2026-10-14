#!/usr/bin/env node
// validate-lessons.mjs — check every lesson matches LESSON-TEMPLATE.md.
//
// Catches the failure modes that are invisible when reading and obvious later:
// ungrounded forward references, wrong reframe count, exercises without pass
// criteria, and quiz.json shapes that break machine readers.
//
// Usage:  node scripts/validate-lessons.mjs [phase-slug]
// Exit 0 if every lesson passes, 1 otherwise.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const PHASES_DIR = join(ROOT, 'phases');

// Terms that must NOT appear in a lesson unless a prerequisite phase taught them.
// Keyed by lesson index — the value is the earliest phase that grounds it.
const GROUNDING = [
  { phase: '00-setup-and-tooling', lesson: '01', forbidden: /\bMCP\b|\bhooks?\b|\bskills?\b|\bsubagents?\b|\bplugins?\b|\bworktree\b|\bisolation\b|context window|\bparallel/i },
];

const REQUIRED_SECTIONS = [
  '# ',           // title
  '**Type:**',
  '**Prerequisites:**',
  '**Time:**',
  '## Learning Objectives',
  '## The Problem',
  '## The Concept',
  '## Build It',
  '## Use It',
  '## Exercises',
  '## Key Terms',
];

// A pass criterion is a line starting with ✅ and containing "You pass when".
const CRITERION = /^\s*(?:[-*]\s*)?✅/gm;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
  }
  return out;
}

function findLessons(phaseFilter) {
  if (!existsSync(PHASES_DIR)) return [];
  const phases = readdirSync(PHASES_DIR).filter((p) => !phaseFilter || p === phaseFilter);
  return phases.flatMap((p) =>
    readdirSync(join(PHASES_DIR, p))
      .map((l) => ({ phase: p, lesson: l, dir: join(PHASES_DIR, p, l) }))
      .filter(({ dir }) => statSync(dir).isDirectory()),
  );
}

const problems = [];
const lessons = findLessons(process.argv[2]);

if (!lessons.length) {
  console.log('No lessons found.');
  process.exit(0);
}

for (const { phase, lesson, dir } of lessons) {
  const label = `${phase}/${lesson}`;
  const mdPath = join(dir, 'docs', 'en.md');

  if (!existsSync(mdPath)) {
    problems.push(`${label}: missing docs/en.md`);
    continue;
  }

  const md = readFileSync(mdPath, 'utf8');

  for (const section of REQUIRED_SECTIONS) {
    if (!md.includes(section)) problems.push(`${label}: missing required section "${section.trim()}"`);
  }

  // Exactly one reframe.
  const reframes = md.match(/\*\*The reframe:/g) ?? [];
  if (reframes.length !== 1) {
    problems.push(`${label}: has ${reframes.length} explicit reframes, template requires exactly 1`);
  }

  // Every exercise needs an observable pass criterion. Scoped to the Exercises
  // section — "Build It" also uses a numbered list, and counting those says
  // nothing about whether exercises are checkable.
  const exercisesSection = /^## Exercises\b([\s\S]*?)(?=^## |\Z)/m.exec(md)?.[1] ?? '';
  const exerciseCount = (exercisesSection.match(/^\s*\d+\.\s/gm) ?? []).length;
  const criteria = exercisesSection.match(CRITERION) ?? [];
  if (exerciseCount > 0 && criteria.length < exerciseCount) {
    problems.push(`${label}: ${exerciseCount} exercises but ${criteria.length} pass criteria (✅ "You pass when…")`);
  }

  // No unfilled authoring placeholders.
  if (/<<\s*(YOU WRITE THIS|TODO|TBD)/i.test(md)) {
    problems.push(`${label}: contains an unfilled authoring placeholder`);
  }

  // Grounding: ungrounded forward references.
  const key = `${phase}/${lesson.split('-')[0]}`;
  const rule = GROUNDING.find((g) => `${g.phase}/${g.lesson.split('-')[0]}` === key);
  if (rule) {
    const found = md.match(rule.forbidden);
    if (found) {
      const unique = [...new Set(found.map((f) => f.toLowerCase()))];
      problems.push(`${label}: ungrounded term(s) ${unique.join(', ')} — must be established before use`);
    }
  }

  // quiz.json must be machine-readable: every question needs options[] and an
  // in-range integer answer. A boolean answer breaks any reader that assumes a
  // uniform shape.
  const quizPath = join(dir, 'quiz.json');
  if (existsSync(quizPath)) {
    try {
      const quiz = JSON.parse(readFileSync(quizPath, 'utf8'));
      for (const q of quiz.questions ?? []) {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          problems.push(`${label}: quiz ${q.id} has no options[] — readers assume a uniform shape`);
        } else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) {
          problems.push(`${label}: quiz ${q.id} answer ${JSON.stringify(q.answer)} out of range for ${q.options.length} options`);
        }
        if (!q.explanation) problems.push(`${label}: quiz ${q.id} has no explanation`);
      }
    } catch (err) {
      problems.push(`${label}: quiz.json is not valid JSON — ${err.message}`);
    }
  }
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error('');
  process.exit(1);
}

console.log(`${lessons.length} lesson(s) pass.`);