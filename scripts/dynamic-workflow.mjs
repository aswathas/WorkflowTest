#!/usr/bin/env node
// dynamic-workflow.mjs — end-to-end: plan → write → validate → publish.
//
// One entry point. Runs each step in order; each step is allowed to fail loudly
// so the next step is never fed garbage. CLI agents do all content work; this
// script only orchestrates and never authors prose.
//
// Steps
//   1. agy plans the authoring order from CATALOG.md
//   2. write-all-phases.mjs fans one headless claude worker per phase
//   3. validate-lessons.mjs checks every lesson against LESSON-TEMPLATE.md
//   4. publish-site.mjs renders the validated corpus to site/
//
// Usage
//   node scripts/dynamic-workflow.mjs [--concurrency N] [--phases a,b,c] [--skip-publish]
//
// Exit codes
//   0  every step succeeded
//   1  planning failed (agy returned no order or the order is invalid)
//   2  authoring failed (one or more phases did not commit)
//   3  validation failed (problems array non-empty)
//   4  publishing failed (write to site/ failed or HTML render threw)

import { spawnSync, spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const argv = process.argv.slice(2);
const get = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i === -1 ? dflt : argv[i + 1];
};
const flag = (f) => argv.includes(f);

const CONCURRENCY = Number(get('--concurrency', '4'));
const PHASES_ARG = get('--phases', null);
const SKIP_AGY = flag('--no-agy');
const SKIP_PUBLISH = flag('--skip-publish');

const CLAUDE = process.env.CLAUDE_BIN || 'C:/Users/aswat/.local/bin/claude.exe';

const node = (script, args = []) =>
  spawnSync(process.execPath, [join(ROOT, 'scripts', script), ...args], {
    cwd: ROOT, stdio: 'inherit', shell: false,
  });

const log = (...m) => console.log('\n=== ' + m.join(' '));

function runClaudePrompt(prompt, label) {
  // Headless claude, prompt on stdin (Windows CLI lives under "C:\Program Files\...";
  // shell:true makes cmd split on the space and fail). acceptEdits blocks Bash so
  // planning never accidentally edits the repo.
  const res = spawnSync(
    CLAUDE,
    [
      '-p',
      '--permission-mode', 'acceptEdits',
      '--allowedTools', 'Read,Glob,Grep',
      '--model', 'sonnet',
      '--max-turns', '50',
    ],
    { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'], input: prompt, shell: false, encoding: 'utf8' },
  );
  if (res.status !== 0) throw new Error(`[${label}] claude exited ${res.status}: ${res.stderr}`);
  return res.stdout;
}

// ── Step 1: agy plans the authoring order ────────────────────────────────────
function plan() {
  if (SKIP_AGY) return ['00-setup-and-tooling', '01-foundations-of-ai', '02-git-deep',
    '03-models-and-families', '04-claude-code', '05-commands-and-skills',
    '06-subagents', '07-mcp', '08-hooks', '09-plugins', '10-memory-and-instructions',
    '11-parallelism-i', '12-parallelism-ii', '13-context-engineering',
    '14-harness-engineering', '15-graph-engineering', '16-worktrees-in-practice',
    '17-scaling-and-operations', '18-capstone'];

  log('agy plans authoring order from CATALOG.md');
  const out = runClaudePrompt(`
You are the architecture reviewer for a 19-phase curriculum (see CATALOG.md at
${ROOT}/CATALOG.md). Read it, then return a strict JSON array of phase slugs
in the order they should be authored. Grounding matters: a phase may only use
a concept an earlier phase established. Return ONLY the JSON array — no prose,
no markdown fences, no commentary. Example shape:

["00-setup-and-tooling","01-foundations-of-ai","02-git-deep","..."]
`, 'agy-plan');

  // Pull the first [...] block; tolerate prose around it.
  const m = out.match(/\[[\s\S]*?\]/);
  if (!m) throw new Error('agy returned no JSON array');
  const order = JSON.parse(m[0]);
  if (!Array.isArray(order) || order.length === 0) throw new Error('agy order is empty');

  const onDisk = readdirSync(join(ROOT, 'phases'));
  const unknown = order.filter((p) => !onDisk.includes(p));
  if (unknown.length) throw new Error('agy referenced unknown phases: ' + unknown.join(','));
  return order;
}

// ── Step 2: fan one worker per phase (reuses write-all-phases.mjs) ──────────
function author(order) {
  log('authoring phases via write-all-phases.mjs');
  const res = node('write-all-phases.mjs', ['--concurrency', String(CONCURRENCY), ...order.flatMap((p) => ['--force'])]);
  if (res.status !== 0) throw new Error('authoring failed (exit ' + res.status + ')');
}

// ── Step 3: validate every lesson ────────────────────────────────────────────
function validate() {
  log('validating every lesson');
  const res = node('validate-lessons.mjs');
  if (res.status !== 0) throw new Error('validation failed');
}

// ── Step 4: publish static site ──────────────────────────────────────────────
function publish() {
  log('publishing static site');
  const res = node('publish-site.mjs');
  if (res.status !== 0) throw new Error('publish failed');
}

// ── driver ──────────────────────────────────────────────────────────────────
(async () => {
  try {
    let order = plan();
    if (PHASES_ARG) {
      const wanted = new Set(PHASES_ARG.split(','));
      order = order.filter((p) => wanted.has(p));
    }
    log('order:', order.join(' → '));

    author(order);
    validate();
    if (!SKIP_PUBLISH) publish();

    console.log('\n=== done: every step succeeded.');
    process.exit(0);
  } catch (err) {
    console.error('\n=== FAILED:', err.message);
    const code = /authoring/.test(err.message) ? 2
      : /validation/.test(err.message) ? 3
      : /publish/.test(err.message) ? 4
      : 1;
    process.exit(code);
  }
})();