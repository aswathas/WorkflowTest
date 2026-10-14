#!/usr/bin/env node
// publish-site.mjs — render the validated curriculum into a static site.
//
// Zero deps. Reads every phases/NN-*/NN-* /docs/en.md and its quiz.json,
// writes minimal HTML to site/ that mirrors the layout of aiengineeringfrom-
// scratch.com (long-form reading: phase index → lesson index → lesson page,
// with a fixed sidebar of phases and a clean reading column).
//
// Usage:  node scripts/publish-site.mjs [--out <dir>]
// Exit:   0 on success, 1 on the first render failure.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const argv = process.argv.slice(2);
const outIdx = argv.indexOf('--out');
const OUT = outIdx === -1 ? join(ROOT, 'site') : argv[outIdx + 1];

const SITE_TITLE = 'Harnessing Claude Code — From Zero to Graph Engineering';
const SITE_DESC = 'A 19-phase, 119-lesson curriculum on Claude Code, agents, and the harness around them.';

// ── tiny markdown → HTML (no deps; covers headings, code, lists, bold, links) ──
function md(src) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = src.split(/\r?\n/);
  const out = [];
  let inCode = false, codeLang = '', codeBuf = [];
  let inList = null; // 'ul' | 'ol'

  const closeList = () => { if (inList) { out.push(`</${inList}>`); inList = null; } };
  const closeCode = () => {
    if (!inCode) return;
    out.push(`<pre><code class="lang-${esc(codeLang)}">${esc(codeBuf.join('\n'))}</code></pre>`);
    inCode = false; codeLang = ''; codeBuf = [];
  };

  for (const raw of lines) {
    const line = raw;

    if (inCode) {
      if (/^```/.test(line)) { closeCode(); continue; }
      codeBuf.push(line);
      continue;
    }
    if (/^```/.test(line)) {
      closeList();
      inCode = true;
      codeLang = line.replace(/^```/, '').trim();
      continue;
    }

    // headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeList();
      const lvl = h[1].length;
      out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`);
      continue;
    }

    // ordered list item
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if (ol || ul) {
      const kind = ol ? 'ol' : 'ul';
      if (inList && inList !== kind) closeList();
      if (!inList) { out.push(`<${kind}>`); inList = kind; }
      out.push(`<li>${inline((ol ? ol : ul)[1])}</li>`);
      continue;
    }
    if (line.trim() === '') { closeList(); continue; }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeCode(); closeList();
  return out.join('\n');
}

function inline(s) {
  const esc = (x) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let t = esc(s);
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/_([^_]+)_/g, '<em>$1</em>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return t;
}

// ── model ──
function loadCurriculum() {
  const phasesDir = join(ROOT, 'phases');
  const phases = readdirSync(phasesDir).sort().map((phaseSlug) => {
    const lessonsDir = join(phasesDir, phaseSlug);
    const lessons = readdirSync(lessonsDir)
      .filter((d) => existsSync(join(lessonsDir, d, 'docs', 'en.md')))
      .sort()
      .map((lessonSlug) => {
        const dir = join(lessonsDir, lessonSlug);
        const mdPath = join(dir, 'docs', 'en.md');
        const quizPath = join(dir, 'quiz.json');
        const body = readFileSync(mdPath, 'utf8');
        const title = (body.match(/^#\s+(.*)$/m) || [, 'Untitled'])[1].trim();
        const num = parseInt(lessonSlug.split('-')[0], 10);
        let quiz = [];
        if (existsSync(quizPath)) {
          try { quiz = JSON.parse(readFileSync(quizPath, 'utf8')).questions ?? []; }
          catch { quiz = []; }
        }
        return { slug: lessonSlug, dir, title, num, body, quiz };
      });
    return { slug: phaseSlug, lessons };
  });
  return phases;
}

// ── render ──
const wrap = (title, body, sidebar) => `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} — Harnessing Claude Code</title>
<meta name="description" content="${esc(SITE_DESC)}">
<link rel="stylesheet" href="/assets/site.css">
</head><body>
<header><a href="/"><strong>Harnessing Claude Code</strong></a></header>
<div class="layout">
<nav class="sidebar">${sidebar}</nav>
<main>${body}</main>
</div></body></html>`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function sidebar(active) {
  return curriculum.map((p) => {
    const items = p.lessons.map((l) => {
      const isActive = active && active.phaseSlug === p.slug && active.lessonSlug === l.slug;
      return `<li${isActive ? ' class="active"' : ''}><a href="/${p.slug}/${l.slug}/">${l.num}. ${esc(l.title)}</a></li>`;
    }).join('');
    return `<section><h3>${esc(p.slug)}</h3><ul>${items}</ul></section>`;
  }).join('');
}

function renderLesson(p, l) {
  const idx = curriculum.flatMap((p) => p.lessons).findIndex((x) => x.dir === l.dir);
  const all = curriculum.flatMap((p) => p.lessons);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;
  const findPhase = (ls) => curriculum.find((p) => p.lessons.includes(ls));

  const nav = (other) => other
    ? `<a class="nav-next" href="/${findPhase(other).slug}/${other.slug}/">${other.num}. ${esc(other.title)} →</a>`
    : '';
  const prevNav = prev ? `<a class="nav-prev" href="/${findPhase(prev).slug}/${prev.slug}/">← ${prev.num}. ${esc(prev.title)}</a>` : '';

  const quiz = l.quiz.length ? `<section class="quiz"><h2>Quiz</h2>${l.quiz.map((q, i) => `
    <details><summary>Q${i + 1}. ${esc(q.prompt || '')}</summary>
      <ol type="A">${(q.options || []).map((o) => `<li>${esc(o)}</li>`).join('')}</ol>
      <p class="ans"><strong>Answer:</strong> option ${q.answer}. ${esc(q.explanation || '')}</p>
    </details>`).join('')}</section>` : '';

  return wrap(l.title, `
<article>
<p class="crumbs"><a href="/">Home</a> · ${esc(p.slug)}</p>
${md(l.body)}
${quiz}
<nav class="paging">${prevNav}${nav(next)}</nav>
</article>`, sidebar({ phaseSlug: p.slug, lessonSlug: l.slug }));
}

function renderPhase(p) {
  const items = p.lessons.map((l) =>
    `<li><a href="/${p.slug}/${l.slug}/">${l.num}. ${esc(l.title)}</a></li>`).join('');
  return wrap(p.slug, `
<article>
<h1>${esc(p.slug)}</h1>
<ul class="lesson-list">${items}</ul>
</article>`, sidebar({ phaseSlug: p.slug, lessonSlug: null }));
}

function renderIndex() {
  const body = curriculum.map((p) => `
    <section><h2>${esc(p.slug)}</h2><ul>
    ${p.lessons.map((l) => `<li><a href="/${p.slug}/${l.slug}/">${l.num}. ${esc(l.title)}</a></li>`).join('')}
    </ul></section>`).join('');
  return wrap('Home', `
<article>
<h1>${esc(SITE_TITLE)}</h1>
<p>${esc(SITE_DESC)}</p>
${body}
</article>`, sidebar(null));
}

const CSS = `/* minimal, reading-first */
:root { color-scheme: light dark; --fg:#222; --muted:#666; --bg:#fff; --accent:#0a66c2; --rule:#eee; --code-bg:#f6f8fa; }
@media (prefers-color-scheme: dark) { :root { --fg:#e6e6e6; --muted:#9aa; --bg:#111; --accent:#7bb4ff; --rule:#222; --code-bg:#1b1b1b; } }
body { font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: var(--fg); background: var(--bg); margin: 0; }
header { padding: 14px 24px; border-bottom: 1px solid var(--rule); }
header a { color: var(--fg); text-decoration: none; }
.layout { display: grid; grid-template-columns: 260px 1fr; max-width: 1200px; margin: 0 auto; }
.sidebar { border-right: 1px solid var(--rule); padding: 16px; font-size: 14px; max-height: calc(100vh - 56px); overflow: auto; position: sticky; top: 56px; }
.sidebar section { margin-bottom: 14px; }
.sidebar h3 { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); margin: 6px 0; }
.sidebar ul { list-style: none; padding: 0; margin: 0; }
.sidebar li.active a { color: var(--accent); font-weight: 600; }
.sidebar a { color: var(--fg); text-decoration: none; display: block; padding: 3px 0; }
.sidebar a:hover { color: var(--accent); }
main { padding: 24px 32px; max-width: 760px; }
main h1, main h2, main h3 { line-height: 1.25; }
main p, main li { margin: .5em 0; }
main code { background: var(--code-bg); padding: 1px 5px; border-radius: 3px; font: 14px ui-monospace, Consolas, monospace; }
main pre { background: var(--code-bg); padding: 12px; border-radius: 6px; overflow: auto; }
main pre code { background: transparent; padding: 0; }
main a { color: var(--accent); }
.crumbs { color: var(--muted); font-size: 13px; }
.paging { display: flex; justify-content: space-between; margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--rule); }
.quiz details { border: 1px solid var(--rule); border-radius: 6px; padding: 8px 12px; margin: 8px 0; }
.quiz summary { cursor: pointer; font-weight: 600; }
.quiz .ans { color: var(--muted); font-size: 14px; }
ul.lesson-list { list-style: none; padding: 0; }
ul.lesson-list li { padding: 4px 0; border-bottom: 1px solid var(--rule); }
@media (max-width: 800px) { .layout { grid-template-columns: 1fr; } .sidebar { position: static; max-height: none; border-right: 0; border-bottom: 1px solid var(--rule); } }
`;

// ── main ──
const curriculum = loadCurriculum();
mkdirSync(OUT, { recursive: true });
mkdirSync(join(OUT, 'assets'), { recursive: true });

writeFileSync(join(OUT, 'assets', 'site.css'), CSS);
writeFileSync(join(OUT, 'index.html'), renderIndex());

let rendered = 1;
for (const p of curriculum) {
  mkdirSync(join(OUT, p.slug), { recursive: true });
  writeFileSync(join(OUT, p.slug, 'index.html'), renderPhase(p));
  rendered++;
  for (const l of p.lessons) {
    mkdirSync(join(OUT, p.slug, l.slug), { recursive: true });
    writeFileSync(join(OUT, p.slug, l.slug, 'index.html'), renderLesson(p, l));
    rendered++;
  }
}
console.log(`rendered ${rendered} page(s) to ${OUT}`);