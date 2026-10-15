// Tests the dispatch fallback chain — the path that had never been exercised.
//
// The chain exists for one reason: when agy runs out of budget mid-build, a long
// run must not stall. Only budget errors fall through. A real failure — a bad
// request, a dead network — must surface, because silently answering with a
// different model is how a course ends up full of content of unknown provenance.
//
// Run: node --test test/dispatch.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dispatch } from '../scripts/dispatch.mjs';

const budgetErr = () => Object.assign(new Error('agy budget error: budget exhausted'), {});

/** Records which runners were called, so we can assert the path taken. */
function chain(behaviour) {
  const calls = [];
  return {
    calls,
    runners: {
      gemini: async () => {
        calls.push('gemini');
        if (behaviour.gemini === 'ok') return { source: 'gemini-direct', result: 'ok' };
        throw new Error(behaviour.gemini === 'nokey' ? 'No Gemini API key' : 'gemini 500');
      },
      agy: async () => {
        calls.push('agy');
        if (behaviour.agy === 'ok') return { source: 'agy', result: 'ok' };
        throw new Error(behaviour.agy);
      },
      deepseek: async () => {
        calls.push('deepseek');
        return { source: 'deepseek', result: 'ok' };
      },
    },
  };
}

test('step 1 answers when the direct Gemini path works, and stops there', async () => {
  const c = chain({ gemini: 'ok' });
  const r = await dispatch('x', {}, c.runners);
  assert.equal(r.source, 'gemini-direct');
  assert.deepEqual(c.calls, ['gemini'], 'must not call the CLIs when the API works');
});

test('a missing key falls through to agy without warning noise', async () => {
  const c = chain({ gemini: 'nokey', agy: 'ok' });
  const r = await dispatch('x', {}, c.runners);
  assert.equal(r.source, 'agy');
  assert.deepEqual(c.calls, ['gemini', 'agy']);
});

test('a non-key Gemini failure falls through to agy', async () => {
  const c = chain({ gemini: 'boom', agy: 'ok' });
  const r = await dispatch('x', {}, c.runners);
  assert.equal(r.source, 'agy');
});

test('the whole point: an agy BUDGET error falls through to deepseek', async () => {
  // This is the path the whole chain exists for, and it had never been run.
  const c = chain({ gemini: 'nokey', agy: 'budget exhausted' });
  const r = await dispatch('x', {}, c.runners);
  assert.equal(r.source, 'deepseek');
  assert.deepEqual(c.calls, ['gemini', 'agy', 'deepseek']);
});

test('every documented budget signal triggers the fallthrough', async () => {
  for (const msg of ['budget exhausted', 'Vibe budget exceeded', '402 Payment Required', 'billing suspended']) {
    const c = chain({ gemini: 'nokey', agy: msg });
    const r = await dispatch('x', {}, c.runners);
    assert.equal(r.source, 'deepseek', `"${msg}" should fall through`);
  }
});

test('a NON-budget agy error must propagate, not be answered by another model', async () => {
  // Silently substituting a model is the failure this design exists to prevent.
  for (const msg of ['connection refused', 'command not found', '400 Bad Request']) {
    const c = chain({ gemini: 'nokey', agy: msg });
    await assert.rejects(() => dispatch('x', {}, c.runners), /connection refused|command not found|400 Bad Request/);
    assert.ok(!c.calls.includes('deepseek'), `deepseek must not run after "${msg}"`);
  }
});

test('deepseek is the last resort, and its failure is not swallowed', async () => {
  const c = chain({ gemini: 'nokey', agy: 'budget exhausted' });
  c.runners.deepseek = async () => {
    throw new Error('opencode: not installed');
  };
  await assert.rejects(() => dispatch('x', {}, c.runners), /not installed/);
});