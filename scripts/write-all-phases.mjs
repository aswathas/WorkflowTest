#!/usr/bin/env node
// write-all-phases.mjs — fan one authoring worker out per phase.
//
// Each phase gets its own git worktree (a branch off current HEAD) so two
// workers never touch the same file, and each is told to commit. Branches are
// merged here, in catalog order, one at a time — branches drift, merges worsen.
//
// Usage:  node scripts/write-all-phases.mjs [--concurrency N]

import { spawnSync, spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const argv = process.argv.slice(2);
const ci = argv.indexOf('--concurrency');
const CONCURRENCY = ci === -1 ? 4 : Number(argv[ci + 1]);

const git = (...args) =>
  spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', shell: true });

// A phase whose lessons are still template skeletons is unwritten. Validating
// alone isn't enough: the validator passes skeletons, which is exactly how 118
// unwritten lessons sat in the tree looking finished.
//
// `git grep -q` exits 0 on a hit but prints nothing, so stdout is empty either
// way. Read the exit code. No shell: it eats the backtick in the pattern.
const authored = (phase) =>
  spawnSync('git', ['grep', '-q', 'Skeleton. `/write-lesson`', '--', `phases/${phase}`], {
    cwd: ROOT,
  }).status !== 0;

const phases = readdirSync(join(ROOT, 'phases'))
  .sort()
  .filter((p) => argv.includes('--force') || !authored(p));

/** One worktree + branch per phase, off current HEAD. */
function workspace(phase) {
  const dir = join(ROOT, '.claude', 'worktrees', phase);
  const branch = `phase/${phase}`;
  if (existsSync(dir)) git('worktree', 'add', dir, branch);
  else git('worktree', 'add', '-b', branch, dir);
  return dir;
}

async function author(phase) {
  const dir = workspace(phase);
  console.log(`\n=== ${phase} -> ${dir}`);
  const code = await new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [join(ROOT, 'scripts', 'write-phase.mjs'), phase],
      { cwd: dir, stdio: 'inherit', shell: false },
    );
    child.on('close', resolve);
  });

  // A worker that exits without a commit lost nothing — but did nothing.
  const head = spawnSync('git', ['rev-parse', '--verify', 'HEAD'], {
    cwd: dir, encoding: 'utf8', shell: true,
  });
  const base = git('rev-parse', 'main').stdout.trim();
  const committed = head.stdout.trim() !== base;
  console.log(`=== ${phase}: exit=${code} committed=${committed}`);
  return { phase, dir, committed, ok: code === 0 && committed };
}

// Waves, so a dozen headless sessions don't stampede one machine.
const results = [];
for (let i = 0; i < phases.length; i += CONCURRENCY) {
  const wave = phases.slice(i, i + CONCURRENCY);
  results.push(...(await Promise.all(wave.map(author))));
}

console.log('\n=== merging in catalog order ===');
for (const { phase, committed } of results) {
  if (!committed) {
    console.log(`SKIP ${phase}: nothing committed`);
    continue;
  }
  const msg = git('log', '-1', '--format=%s', `phase/${phase}`).stdout.trim();
  const res = git('merge', '--no-ff', '-m', `merge(${phase}): ${msg}`, 'phase/' + phase);
  console.log(res.status === 0 ? `merged ${phase}` : `CONFLICT ${phase}\n${res.stderr}`);
}

for (const { phase, dir } of results) git('worktree', 'remove', '--force', dir);

const done = results.filter((r) => r.committed).length;
console.log(`\n${done}/${phases.length} phases authored and merged.`);