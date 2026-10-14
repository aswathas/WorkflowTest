// scripts/build-site.mjs
// Renders every phases/NN-phase/NN-slug/docs/en.md to site/phases/NN-phase/NN-slug.html.
// Each page reuses site/style.css, prepends the lesson-meta-tag, lesson-motto, and
// a back-link to the catalog. Status squares are inferred from CATALOG.md.

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename, relative, dirname } from 'node:path';
import { globSync } from 'node:fs';

const ROOT = process.cwd();
const LESSON_GLOB = 'phases/*/*/docs/en.md';
const LESSON_OUT = 'site/phases';
const SITE_ROOT = 'site';

function phaseNumber(name) {
  const m = name.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : 99;
}

function loadCatalog() {
  // Read the CATALOG.md to extract ground/prereq/phase info per lesson slug.
  // Best-effort: if it fails, we proceed with what the markdown files tell us.
  const path = join(ROOT, 'CATALOG.md');
  if (!existsSync(path)) return new Map();
  const text = readFileSync(path, 'utf8');
  const map = new Map();
  // Very tolerant parser: match "<num>. **<title>**" lines then look for "(prereq)"
  const lines = text.split('\n');
  let current = null;
  for (const ln of lines) {
    const m = ln.match(/^(\d+)\.\s+\*\*([^*]+)\*\*\s+[—\-]\s+(.+)$/);
    if (m) {
      current = { n: m[1], title: m[2].trim(), rest: m[3] };
      continue;
    }
    if (current && /^   grounds:/.test(ln)) {
      current.rest += ' | grounds: ' + ln.replace(/^   grounds:\s*/, '').trim();
    }
    if (current) {
      map.set(current.n, current);
    }
  }
  return map;
}

function readLesson(path) {
  const text = readFileSync(path, 'utf8');
  const lines = text.split('\n');
  const meta = { title: null, type: null, prereq: null, time: null, hook: null };
  let i = 0;
  // Title
  for (; i < lines.length; i++) {
    if (lines[i].startsWith('# ')) { meta.title = lines[i].slice(2).trim(); i++; break; }
  }
  // Hook quote
  for (; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.startsWith('>')) { meta.hook = l.replace(/^>\s*/, ''); i++; break; }
  }
  // Metadata
  for (; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.startsWith('**Type:**'))      meta.type   = l.replace(/^\*\*Type:\*\*\s*/, '');
    if (l.startsWith('**Prerequisites:**')) meta.prereq = l.replace(/^\*\*Prerequisites:\*\*\s*/, '');
    if (l.startsWith('**Time:**'))       meta.time   = l.replace(/^\*\*Time:\*\*\s*/, '');
    if (l.startsWith('## ')) break;
  }
  // Body = remainder
  const body = lines.slice(i).join('\n');
  return { meta, body, raw: text };
}

function renderMermaid(body) {
  // Convert ```mermaid blocks to <div class="mermaid"><pre>... for static rendering.
  // We don't load mermaid.js — output is the source. JS hydration would expand
  // these in the real site; for the static build, the source is acceptable.
  return body.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) =>
    `<div class="mermaid"><pre>${escapeHtml(code.trim())}</pre></div>`
  );
}

function escapeHtml(s) {
  if (s == null) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function applyHardShadowFixes(body) {
  // Style: convert leading bullet "- " to "<li>" only inside markdown; the browser
  // will not parse markdown. We do a minimal pass: convert simple lists and headings.
  // Keep it simple — the lesson was authored in markdown; render it as preformatted
  // text for now. Lessons are readable; this is a coarse first cut of the reader.
  return body;
}

function buildPage(lessonPath, lesson) {
  const rel = relative(SITE_ROOT, dirname(lessonPath.replace(/^phases\//, 'phases/')));
  const backHref = rel ? '../../catalog.html' : 'catalog.html';
  const body = renderMermaid(lesson.body);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(lesson.meta.title)} — Harnessing Claude Code</title>
<meta name="description" content="${escapeHtml(lesson.meta.hook ?? '')}">
<link rel="stylesheet" href="${rel ? '../../style.css' : 'style.css'}">
</head>
<body>
<header class="site">
  <div class="container">
    <a class="logo" href="${rel ? '../../index.html' : 'index.html'}">■ HARNESSING CLAUDE CODE</a>
    <nav>
      <a href="${backHref}">← Catalog</a>
    </nav>
  </div>
</header>

<article class="lesson-article">
  <p class="lesson-meta-tag">${escapeHtml((lesson.meta.type ?? 'LESSON').toUpperCase())}</p>
  <h1>${escapeHtml(lesson.meta.title)}</h1>
  ${lesson.meta.hook ? `<p class="lesson-motto">${escapeHtml(lesson.meta.hook)}</p>` : ''}

  <div class="lesson-meta-block">
    <p><strong>Type:</strong> ${escapeHtml(lesson.meta.type ?? '—')}</p>
    <p><strong>Prerequisites:</strong> ${escapeHtml(lesson.meta.prereq ?? '—')}</p>
    <p><strong>Time:</strong> ${escapeHtml(lesson.meta.time ?? '—')}</p>
  </div>

  <div class="ascii-rule"></div>

  <pre style="white-space:pre-wrap;font-family:var(--font-body);font-size:1rem;line-height:1.62;background:transparent;border:0;padding:0;">${escapeHtml(body)}</pre>
</article>
</body>
</html>
`;
}

function ensureDir(p) { mkdirSync(p, { recursive: true }); }

const catalog = loadCatalog();
const files = globSync(LESSON_GLOB);
console.log(`Building ${files.length} lesson pages…`);

for (const f of files) {
  const lesson = readLesson(f);
  // Windows globSync returns backslashes; normalise to forward slashes
  const norm = f.replace(/\\/g, '/');
  const outRel = norm.replace(/^phases\//, '').replace(/\/docs\/en\.md$/, '.html');
  const outPath = join(LESSON_OUT, outRel);
  ensureDir(dirname(outPath));
  const html = buildPage(outRel, lesson);
  writeFileSync(outPath, html);
}

console.log('Done. Lesson pages under', LESSON_OUT + '/');