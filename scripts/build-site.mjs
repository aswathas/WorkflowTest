// scripts/build-site.mjs
// Render the curriculum into the static site under site/.
//
// Two kinds of page:
//   * lesson pages — site/phases/NN-phase/NN-slug.html, one per docs/en.md
//   * index surfaces — index.html, catalog.html, glossary.html, sitemap.xml,
//     llms.txt, all generated from the same pass
//
// The index surfaces used to be hand-written, and they rotted the moment the
// corpus moved: catalog.html listed four phases and claimed "20 phases",
// llms.txt claimed 16 practice modules, and every page linked to
// prereqs.html, glossary.html and about.html, none of which existed. Anything
// that can be derived is now derived, so it cannot drift again.
//
// Design classes (site/container/lesson-meta-tag/lesson-motto/status-square/
// ascii-rule) come from site/style.css and are reused verbatim — this script
// generates content, not a new look.
//
// Usage:  node scripts/build-site.mjs [--check]
//   --check  render nothing; exit 1 if a generated page would change

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE = join(ROOT, 'site');
const CHECK = process.argv.includes('--check');

const SITE_NAME = 'Harnessing Claude Code';
const SITE_TAGLINE = 'From zero to graph engineering on AI agents — for people who use them.';
const CANONICAL = 'https://harnessing.example';

// Scaffold markers. Same set the validator and scripts/lib/workflow-lib.mjs use.
const LESSON_SKELETON = [/^\s*>\s*Skeleton\./m, /Replace this placeholder/];
const BRIEF_SKELETON = [/Fill this in/, /\[your artifact \+ evidence\]/];
const RUBRIC_SKELETON = [/\|\s*2\s*\|\s*Fill in\s*\|/];

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── read the corpus ─────────────────────────────────────────────────────────
function readCatalog() {
  // CATALOG.md is the source of phase names, lesson titles and practice modules.
  // Three machine-read shapes (they are documented at the top of the file):
  //   ## Phase NN — Name          (next non-empty line is the one-line thesis)
  //   | N | Title | `path` |      (title may be **bolded** to mark load-bearing)
  //   **Module NN.N** — Title (`Type`)   then   → `practice/NN-slug`
  const text = readFileSync(join(ROOT, 'CATALOG.md'), 'utf8');
  const lines = text.split(/\r?\n/);
  const phases = [];
  let phase = null;
  let awaitingThesis = false;
  let awaitingModule = false;
  let currentModule = null;

  for (const raw of lines) {
    const line = raw.trim();

    const ph = line.match(/^## Phase (\d+)\s+—\s+(.+)$/);
    if (ph) {
      phase = { num: ph[1], name: ph[2].trim(), slug: null, thesis: '', lessons: [], module: null };
      phases.push(phase);
      awaitingThesis = true;
      continue;
    }
    if (awaitingThesis && line.startsWith('## ')) { awaitingThesis = false; } // next phase already handled
    if (awaitingThesis && line && !line.startsWith('|') && !line.startsWith('**Module')) {
      phase.thesis = line.replace(/^Prereq:.*$/, '').trim();
      awaitingThesis = false;
      continue;
    }

    const row = line.match(/^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*`([^`]+)`\s*\|$/);
    if (row && phase) {
      const title = row[2].replace(/\*\*/g, '').replace(/\s+—\s+.*$/, '').trim();
      const gloss = (row[2].match(/—\s+(.+)$/)?.[1] ?? '').replace(/\*\*/g, '').trim();
      const path = row[3];
      const [phaseSlug, lessonSlug] = path.split('/');
      if (!phase.slug) phase.slug = phaseSlug;
      phase.lessons.push({ num: Number(row[1]), title, gloss, path, phaseSlug, lessonSlug });
      continue;
    }

    const mod = line.match(/^\*\*Module (\d+\.\d+)\*\*\s+—\s+(.+?)\s+\(`?(\w+)`?\)/);
    if (mod) {
      currentModule = { num: mod[1], title: mod[2], type: mod[3], dir: null };
      awaitingModule = true;
      continue;
    }
    if (awaitingModule && line.startsWith('→')) {
      currentModule.dir = line.replace(/^→\s*`?/, '').replace(/`$/, '').trim();
      if (phase) phase.module = currentModule;
      awaitingModule = false;
      continue;
    }
  }
  return phases.filter((p) => p.slug && p.lessons.length);
}

function lessonStatus(dir) {
  const md = join(dir, 'docs', 'en.md');
  if (!existsSync(md)) return 'missing';
  return LESSON_SKELETON.some((re) => re.test(readFileSync(md, 'utf8'))) ? 'scaffold' : 'authored';
}

function moduleStatus(dir) {
  if (!dir) return 'missing';
  const b = join(ROOT, dir, 'BRIEF.md');
  const r = join(ROOT, dir, 'RUBRIC.md');
  if (!existsSync(b) || !existsSync(r)) return 'missing';
  if (BRIEF_SKELETON.some((re) => re.test(readFileSync(b, 'utf8')))) return 'scaffold';
  if (RUBRIC_SKELETON.some((re) => re.test(readFileSync(r, 'utf8')))) return 'scaffold';
  return 'authored';
}

function loadCurriculum() {
  const phases = readCatalog();
  for (const p of phases) {
    for (const l of p.lessons) {
      const dir = join(ROOT, 'phases', l.phaseSlug, l.lessonSlug);
      l.dir = dir;
      l.status = lessonStatus(dir);
      l.outPath = `phases/${l.phaseSlug}/${l.lessonSlug}.html`;
      const md = join(dir, 'docs', 'en.md');
      if (l.status === 'authored') {
        const body = readFileSync(md, 'utf8');
        const m = body.match(/^#\s+(.*)$/m);
        l.title = m ? m[1].trim() : l.title; // the file wins over the catalog
      }
    }
    p.moduleStatus = moduleStatus(p.module?.dir);
    const done = p.lessons.filter((l) => l.status === 'authored').length;
    p.authored = done;
    p.total = p.lessons.length;
    p.status = done === p.total && p.moduleStatus === 'authored' ? 'complete'
      : done === 0 && p.moduleStatus !== 'authored' ? 'planned'
      : 'in-progress';
  }
  return phases;
}

// ── lesson page ─────────────────────────────────────────────────────────────
function readLesson(path) {
  const text = readFileSync(path, 'utf8');
  const lines = text.split('\n');
  const meta = { title: 'Untitled', type: null, prereq: null, time: null, hook: null };
  let i = 0;
  for (; i < lines.length; i++) if (lines[i].startsWith('# ')) { meta.title = lines[i].slice(2).trim(); i++; break; }
  for (; i < lines.length; i++) { const l = lines[i].trim(); if (l.startsWith('>')) { meta.hook = l.replace(/^>\s*/, ''); i++; break; } }
  for (; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.startsWith('**Type:**')) meta.type = l.replace(/^\*\*Type:\*\*\s*/, '');
    if (l.startsWith('**Prerequisites:**')) meta.prereq = l.replace(/^\*\*Prerequisites:\*\*\s*/, '');
    if (l.startsWith('**Time:**')) meta.time = l.replace(/^\*\*Time:\*\*\s*/, '');
    if (l.startsWith('## ')) break;
  }
  return { meta, body: lines.slice(i).join('\n') };
}

const NAV = [
  ['catalog.html', 'Catalog'],
  ['glossary.html', 'Glossary'],
  ['llms.txt', 'llms.txt'],
  ['developer.html', 'Developer'],
];

function head(title, depth) {
  const p = depth ? '../'.repeat(depth) : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — ${SITE_NAME}</title>
<link rel="stylesheet" href="${p}style.css">
</head>
<body>
<header class="site">
  <div class="container">
    <a class="logo" href="${p}index.html">■ HARNESSING CLAUDE CODE</a>
    <nav>${NAV.map(([h, t]) => `<a href="${p}${h}">${esc(t)}</a>`).join('')}</nav>
  </div>
</header>
`;
}

const foot = `</body>\n</html>\n`;

function lessonPage(l) {
  const { meta, body } = readLesson(join(l.dir, 'docs', 'en.md'));
  const rel = '../../../'; // site/phases/NN-phase/NN-slug.html
  return `${head(meta.title, 0).replace(/(href|src)="(?!http)/g, `$1="${rel}`)}
<article class="lesson-article">
  <p class="lesson-meta-tag">${esc((meta.type ?? 'LESSON').toUpperCase())}</p>
  <h1>${esc(meta.title)}</h1>
  ${meta.hook ? `<p class="lesson-motto">${esc(meta.hook)}</p>` : ''}

  <div class="lesson-meta-block">
    <p><strong>Type:</strong> ${esc(meta.type ?? '—')}</p>
    <p><strong>Prerequisites:</strong> ${esc(meta.prereq ?? '—')}</p>
    <p><strong>Time:</strong> ${esc(meta.time ?? '—')}</p>
  </div>

  <div class="ascii-rule"></div>

  <pre style="white-space:pre-wrap;font-family:var(--font-body);font-size:1rem;line-height:1.62;background:transparent;border:0;padding:0;">${esc(body)}</pre>
</article>
${foot}`;
}

// ── glossary: aggregate every lesson's Key Terms table ──────────────────────
function keyTermsOf(l) {
  if (l.status !== 'authored') return [];
  const md = readFileSync(join(l.dir, 'docs', 'en.md'), 'utf8');
  const section = /^## Key Terms\b([\s\S]*?)(?=^## |\Z)/m.exec(md)?.[1] ?? '';
  return section.split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\|/.test(line) && !/^\|\s*-+/.test(line) && !/\|\s*(Term|What people say|What it actually means)\s*\|/i.test(line))
    .map((line) => line.split('|').slice(1, -1).map((c) => c.trim()))
    .filter((cells) => cells.length >= 3 && cells[0]);
}

// ── render the index surfaces ───────────────────────────────────────────────
function renderIndex(cur, totals) {
  const rows = cur.map((p) => {
    const sq = `<span class="status-square ${p.status}"></span>`;
    return `      <li>${sq} <strong>Phase ${p.num} — ${esc(p.name)}.</strong> ${esc(p.thesis)} (${p.authored}/${p.total})</li>`;
  }).join('\n');
  return `${head('Home', 0)}
<main class="container">
  <section>
    <p class="lesson-meta-tag">HARNESSING / CLAUDE CODE</p>
    <h1>${esc(SITE_TAGLINE)}</h1>
    <p class="lesson-motto">A free, open-source course. ${totals.lessons} lessons across ${totals.phases} phases. MCP, hooks, plugins, worktree isolation, dynamic workflows, harness engineering, task graphs.</p>

    <div class="ascii-rule"></div>

    <p>Every abstraction in Claude Code resolves to something you can reason about, break, and rebuild. This course teaches the mechanism — not the prompt.</p>

    <h2>Why this course exists</h2>
    <p>Most agentic tooling is taught in two broken ways: as a list of features, or as prompts to copy. Neither teaches the <em>mechanism</em>. The same fear — losing work to an agent run — drives both failures. The fix is to know what the agent is doing. This course is that.</p>

    <h2>Start here</h2>
    <table>
      <thead><tr><th>You want to…</th><th>Read</th></tr></thead>
      <tbody>
        <tr><td>See the whole map</td><td><a href="catalog.html">Catalog</a></td></tr>
        <tr><td>Give an agent the full context</td><td><code>llms.txt</code></td></tr>
        <tr><td>Start learning now</td><td><a href="phases/00-setup-and-tooling/01-dev-environment.html">Lesson 00.1 — Dev Environment</a></td></tr>
        <tr><td>Look a term up</td><td><a href="glossary.html">Glossary</a></td></tr>
        <tr><td>Understand the repo</td><td><a href="developer.html">Developer / API</a></td></tr>
      </tbody>
    </table>

    <h2>Teaching it to yourself, with an agent</h2>
    <p>This repo is designed to be pointed at an AI agent. The <a href="developer.html">MCP server and REST API</a> are the agent entry points. Four skills, each invoked deliberately by the learner:</p>
    <table>
      <thead><tr><th>Command</th><th>Does</th></tr></thead>
      <tbody>
        <tr><td><code>/teach-me</code></td><td>Teach one lesson, at the learner's actual level</td></tr>
        <tr><td><code>/run-module</code></td><td>Start or grade a practice module</td></tr>
        <tr><td><code>/where-am-i</code></td><td>What's demonstrated, what's next</td></tr>
        <tr><td><code>/write-lesson</code></td><td>Author a new lesson</td></tr>
      </tbody>
    </table>
    <p>Authoring the corpus itself is also a workflow: <code>node scripts/dynamic-workflow.mjs</code> reports what is missing, authors it in isolated worktrees, validates, and rebuilds this site. See <a href="developer.html">Developer</a>.</p>

    <h2>What you will learn</h2>
    <ul>
${rows}
    </ul>

    <p><a class="button primary" href="phases/00-setup-and-tooling/01-dev-environment.html" style="display:inline-block;text-decoration:none;background:var(--blueprint);color:#fff;padding:0.5em 1em;box-shadow:var(--shadow-hard);">Start with Phase 0 →</a></p>
  </section>
</main>
${foot}`;
}

function renderCatalog(cur, totals) {
  const body = cur.map((p) => {
    const items = p.lessons.map((l) => {
      const sq = l.status === 'authored' ? 'complete' : 'planned';
      return `      <li><span class="status-square ${sq}"></span> <a href="${l.outPath}">${l.num}. ${esc(l.title)}</a>${l.gloss ? ` — ${esc(l.gloss)}` : ''}</li>`;
    }).join('\n');
    const mod = p.module
      ? `<p>Practice module ${esc(p.module.num)} — ${esc(p.module.title)} (<em>${esc(p.module.type)}</em>). <span class="status-square ${p.moduleStatus === 'authored' ? 'complete' : 'planned'}"></span></p>`
      : '';
    return `    <h2>Phase ${p.num} — ${esc(p.name)} <span class="status-square ${p.status}"></span></h2>
    <p>${esc(p.thesis)} <em>${p.authored}/${p.total} lessons authored.</em></p>
    <ol>
${items}
    </ol>
${mod}`;
  }).join('\n\n');

  return `${head('Catalog', 0)}
<main class="container">
  <article class="lesson-article">
    <p class="lesson-meta-tag">CATALOG / ALL LESSONS</p>
    <h1>${totals.lessons} lessons across ${totals.phases} phases</h1>
    <p class="lesson-motto">Each lesson is a single claim you can act on. The phase structure is the dependency graph; the path is the URL.</p>

    <p>${totals.authored} of ${totals.lessons} lessons are authored. ${totals.modulesAuthored} of ${totals.modules} practice modules are written.
    For the agent-readable form, see <a href="llms.txt">/llms.txt</a>. For the API, see <a href="developer.html">/developer.html</a>.</p>

${body}
  </article>
</main>
${foot}`;
}

function renderGlossary(cur) {
  const groups = cur.map((p) => {
    const rows = p.lessons.flatMap((l) => keyTermsOf(l).map((cells) => ({ lesson: l, cells })));
    if (!rows.length) return '';
    const trs = rows.map(({ lesson, cells }) =>
      `      <tr><td>${esc(cells[0])}</td><td>${esc(cells[1])}</td><td>${esc(cells[2])}</td><td><a href="${lesson.outPath}">${lesson.num}</a></td></tr>`).join('\n');
    return `    <h2>Phase ${p.num} — ${esc(p.name)}</h2>
    <table>
      <thead><tr><th>Term</th><th>What people say</th><th>What it actually means</th><th>Lesson</th></tr></thead>
      <tbody>
${trs}
      </tbody>
    </table>`;
  }).filter(Boolean).join('\n\n');

  const count = cur.flatMap((p) => p.lessons).reduce((n, l) => n + keyTermsOf(l).length, 0);
  return `${head('Glossary', 0)}
<main class="container">
  <article class="lesson-article">
    <p class="lesson-meta-tag">GLOSSARY</p>
    <h1>Every key term, and the misconception it corrects</h1>
    <p class="lesson-motto">${count} terms, aggregated from the Key Terms table of every authored lesson. The middle column is the point: it names the wrong intuition in the same breath as the definition.</p>
${groups || '    <p>No authored lessons yet.</p>'}
  </article>
</main>
${foot}`;
}

function renderSitemap(cur) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    '', 'catalog.html', 'glossary.html', 'developer.html', 'llms.txt',
    ...cur.flatMap((p) => p.lessons.filter((l) => l.status === 'authored').map((l) => l.outPath)),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${CANONICAL}/${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
}

function renderLlms(cur, totals) {
  const phases = cur.map((p) => {
    const lessons = p.lessons.map((l) =>
      `- [${l.title}](${l.outPath})${l.gloss ? ` — ${l.gloss}` : ''}${l.status === 'authored' ? '' : ' _(scaffold)_'}`).join('\n');
    return `## Phase ${p.num}: ${p.name}\n${p.thesis}\n\n${lessons}`;
  }).join('\n\n');

  return `# ${SITE_NAME}

> ${SITE_TAGLINE}
> ${totals.lessons} lessons across ${totals.phases} phases. The path is the URL.

Canonical site: ${CANONICAL}
Lessons authored: ${totals.authored} of ${totals.lessons}. Practice modules: ${totals.modulesAuthored} of ${totals.modules}.

## Lesson URL scheme

\`/phases/NN-phase-slug/NN-lesson-slug.html\` — every lesson is one directory at this path. The path is the URL.
Source of truth: \`phases/NN-phase-slug/NN-lesson-slug/docs/en.md\`.

## Developer resources

- [Developer documentation](developer.html) — public read-only API, MCP server, errors, quotas, versioning
- [OpenAPI 3.1](openapi.json) — typed REST operations
- [MCP manifest](server.json) — Streamable HTTP
- [Catalog](catalog.html) — all ${totals.lessons} lessons
- [Glossary](glossary.html) — every key term across authored lessons
- [Sitemap](sitemap.xml) — canonical URL inventory

## Plugin surface (for agents)

- Streamable HTTP MCP at \`/mcp\` — tools: \`search_curriculum\`, \`read_resource\` (read-only)
- REST API: \`/api/v1/catalog\`, \`/api/v1/resource?path=…\`, \`/api/v1/markdown?path=…\`
- OpenAPI: \`/openapi.json\`; MCP manifest: \`/server.json\` (also \`/.well-known/mcp.json\`)
- Content negotiation: \`Accept: text/markdown\` on any page returns the markdown twin
- All routes are static; no auth, no accounts, no write endpoints

## Lessons

${phases}
`;
}

// ── write ───────────────────────────────────────────────────────────────────
function ensureDir(p) { mkdirSync(p, { recursive: true }); }

let changed = 0;
function writeOut(rel, content) {
  const target = join(SITE, rel);
  const before = existsSync(target) ? readFileSync(target, 'utf8') : null;
  if (before === content) return false;
  if (CHECK) { console.error(`would change: site/${rel}`); return true; }
  ensureDir(dirname(target));
  writeFileSync(target, content);
  return true;
}

const curriculum = loadCurriculum();
const totals = {
  phases: curriculum.length,
  lessons: curriculum.reduce((n, p) => n + p.lessons.length, 0),
  authored: curriculum.reduce((n, p) => n + p.authored, 0),
  modules: curriculum.filter((p) => p.module).length,
  modulesAuthored: curriculum.filter((p) => p.moduleStatus === 'authored').length,
};

console.log(`Building ${totals.lessons} lesson pages (${totals.authored} authored)…`);

for (const p of curriculum) {
  for (const l of p.lessons) {
    if (l.status !== 'authored') continue;
    if (writeOut(l.outPath, lessonPage(l))) changed++;
  }
}

// A page for a lesson that is back to being a scaffold would publish the
// placeholder as if it were the lesson. Delete anything that is no longer
// expected rather than leaving it lying around.
const expected = new Set(curriculum.flatMap((p) =>
  p.lessons.filter((l) => l.status === 'authored').map((l) => l.outPath.replace(/\\/g, '/'))));
const phasesRoot = join(SITE, 'phases');
if (existsSync(phasesRoot)) {
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      if (!entry.endsWith('.html')) continue;
      const rel = full.replace(SITE, '').replace(/\\/g, '/').replace(/^\//, '');
      if (expected.has(rel)) continue;
      if (CHECK) { console.error(`would remove: site/${rel}`); changed++; continue; }
      rmSync(full);
      changed++;
    }
  };
  walk(phasesRoot);
}
for (const [rel, html] of [
  ['index.html', renderIndex(curriculum, totals)],
  ['catalog.html', renderCatalog(curriculum, totals)],
  ['glossary.html', renderGlossary(curriculum)],
  ['sitemap.xml', renderSitemap(curriculum)],
  ['llms.txt', renderLlms(curriculum, totals)],
]) {
  if (writeOut(rel, html)) changed++;
}

if (CHECK) {
  console.log(changed ? `${changed} file(s) would change.` : 'site is up to date.');
  process.exit(changed ? 1 : 0);
}
console.log(`Done. ${changed} file(s) written under site/.`);
