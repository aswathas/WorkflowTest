// scripts/dispatch.mjs
// Fallback chain: direct Gemini API → agy CLI (Gemini via Antigravity) →
// opencode / deepseek-v4.1-flash. Used by workflow scripts in place of the
// `agent:` field, which routes to a Claude/MiniMax subagent and bypasses the
// real external CLIs.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dispatchGemini } from './dispatch-gemini.mjs';

const exec = promisify(execFile);

const AGY_BUDGET_ERRORS = ['budget exhausted', 'Vibe budget', '402', 'billing'];

function isBudgetError(s) {
  return AGY_BUDGET_ERRORS.some((e) => String(s).toLowerCase().includes(e.toLowerCase()));
}

export async function runAgy(prompt, { timeoutMs = 120_000 } = {}) {
  try {
    const { stdout } = await exec('agy', ['-p', prompt, '--output-format', 'text'], {
      timeout: timeoutMs,
      maxBuffer: 8 * 1024 * 1024,
    });
    return { source: 'agy', result: stdout };
  } catch (e) {
    if (isBudgetError(e.message) || isBudgetError(e.stderr)) {
      throw new Error(`agy budget error: ${e.message} | ${e.stderr}`);
    }
    throw e;
  }
}

export async function runDeepseek(prompt, { timeoutMs = 180_000 } = {}) {
  const { stdout } = await exec(
    'opencode',
    ['run', '--model', 'opencode-go/deepseek-v4.1-flash', prompt],
    { timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024 }
  );
  const cleaned = stdout
    .replace(/\x1b\[[0-9;]*m/g, '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('> build'))
    .filter((l) => !l.trim().startsWith('build ·'))
    .join('\n')
    .trim();
  return { source: 'deepseek', result: cleaned };
}

export async function dispatch(prompt, opts = {}) {
  // 1. Direct Gemini API (fastest, no CLI in path, your key in env)
  try {
    return await dispatchGemini(prompt, opts);
  } catch (e) {
    if (!e.message || !e.message.includes('No Gemini API key')) {
      console.warn('[dispatch] gemini direct failed:', e.message.split('\n')[0]);
    }
  }
  // 2. agy CLI (Gemini via Antigravity)
  try {
    return await runAgy(prompt, opts);
  } catch (e) {
    if (!isBudgetError(e.message)) throw e;
    console.warn('[dispatch] agy budget error, falling back to deepseek');
  }
  // 3. opencode / DeepSeek
  return runDeepseek(prompt, opts);
}