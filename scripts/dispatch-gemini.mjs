// scripts/dispatch-gemini.mjs
// Direct Gemini API caller. Bypasses the agy CLI entirely — useful when the CLI
// is down, broken, or rate-limited, and you have a Gemini API key.
//
// Primary path: GEMINI_API_KEY env var.
// Fallback path: GOOGLE_API_KEY env var (some tools set that name).
// Last resort: read the key from ~/.config/agy/config.toml if it is set there.
//
// This module exports dispatchGemini(prompt, opts) which returns
// { source: 'gemini', result: <text> } or throws on a non-recoverable error.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { request } from 'node:https';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.0-flash';
const TIMEOUT_MS = 120_000;

function loadKey() {
  if (process.env.GEMINI_API_KEY) return { key: process.env.GEMINI_API_KEY, src: 'GEMINI_API_KEY' };
  if (process.env.GOOGLE_API_KEY) return { key: process.env.GOOGLE_API_KEY, src: 'GOOGLE_API_KEY' };
  // Last-resort: parse the agy config toml for an api_key line. Best-effort,
  // not a real TOML parser.
  const candidates = [
    join(homedir(), '.config', 'agy', 'config.toml'),
    join(homedir(), '.config', 'antigravity', 'config.toml'),
  ];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    try {
      const text = readFileSync(path, 'utf8');
      const m = text.match(/api_key\s*=\s*['"]([^'"]+)['"]/);
      if (m) return { key: m[1], src: path };
    } catch (_) { /* ignore */ }
  }
  return null;
}

function callGemini(prompt, model, apiKey) {
  return new Promise((resolve, reject) => {
    const url = `${ENDPOINT}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
    });
    const req = request(
      {
        method: 'POST',
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
        headers: { 'Content-Type': 'application/json' },
        timeout: TIMEOUT_MS,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode >= 400) {
            return reject(new Error(`gemini http ${res.statusCode}: ${data.slice(0, 500)}`));
          }
          try {
            const json = JSON.parse(data);
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text
              ?? json.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('')
              ?? '';
            resolve(text);
          } catch (e) {
            reject(new Error(`gemini parse error: ${e.message}; body: ${data.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error('gemini request timed out'));
    });
    req.write(body);
    req.end();
  });
}

export async function dispatchGemini(prompt, opts = {}) {
  const model = opts.model || process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const keyInfo = loadKey();
  if (!keyInfo) {
    throw new Error('No Gemini API key found. Set GEMINI_API_KEY env var.');
  }
  const result = await callGemini(prompt, model, keyInfo.key);
  return { source: `gemini:${model}:${keyInfo.src}`, result };
}

// Smoke test: if run directly (`node scripts/dispatch-gemini.mjs "ping"`), print
// the first 200 chars of the response and exit.
if (import.meta.url === `file://${process.argv[1]}`) {
  const prompt = process.argv[2] || 'Reply with exactly: gemini-ok';
  dispatchGemini(prompt)
    .then((r) => {
      console.log('source:', r.source);
      console.log('result:', JSON.stringify(r.result.slice(0, 200)));
    })
    .catch((e) => {
      console.error('FAIL:', e.message);
      process.exit(1);
    });
}