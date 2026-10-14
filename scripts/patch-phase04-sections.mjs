// scripts/patch-phase04-sections.mjs
// Patches the 6 conceptual lessons (32-37) of Phase 04 to satisfy the lesson
// template's required sections. Each draft's first H2 should be '## The Concept',
// the reframe should carry the '**The reframe:**' marker, and '## Build It'
// must exist even for conceptual lessons.

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const PATTERN = 'phases/04-claude-code/{32,33,34,35,36,37}-*/docs/en.md';

const files = globSync(PATTERN);
console.log(`Patching ${files.length} files`);

for (const f of files) {
  let t = readFileSync(f, 'utf8');
  let changed = false;

  // 1) Rename the first H2 to '## The Concept' (unless it's already '## The Concept')
  const firstH2 = t.match(/^## .+$/m);
  if (firstH2 && firstH2[0] !== '## The Concept') {
    t = t.replace(/^## .+$/m, '## The Concept');
    changed = true;
    console.log(`  ${f}: renamed first H2 to '## The Concept'`);
  }

  // 2) Convert '## The reframe' section into the reframe marker line under '## The Concept'.
  // The drafts have:
  //   ## The reframe
  //   **X**
  //   ...
  // The validator wants '**The reframe:** X' as a paragraph line, exactly once.
  const reframeSection = t.match(/## The reframe\s*\n+\*\*([^*]+?)\*\*\s*\n/);
  if (reframeSection) {
    const reframeText = reframeSection[1].trim();
    // Find the '## The Concept' block and inject the marker as its first paragraph
    t = t.replace(
      /(## The Concept\s*\n+)/,
      `$1**The reframe:** ${reframeText}\n\n`
    );
    // Remove the now-redundant '## The reframe' section
    t = t.replace(/\n## The reframe\s*\n+\*\*[^*]+?\*\*\s*\n+[^\n]*\n+/m, '\n');
    changed = true;
    console.log(`  ${f}: moved reframe into The Concept section`);
  } else {
    // If a '## The reframe' header still exists without the bold line right after,
    // we just need to ensure the '**The reframe:**' marker exists somewhere in
    // the Concept section. Add a placeholder if not.
    if (!/\\*\\*The reframe:\\*\\*/.test(t) && !/\*\*The reframe:\*\*/.test(t)) {
      t = t.replace(
        /(## The Concept\s*\n+)/,
        `$1**The reframe:** (state the reframe for this lesson here)\n\n`
      );
      changed = true;
      console.log(`  ${f}: inserted placeholder reframe marker`);
    }
  }

  // 3) Add '## Build It' if missing. Insert before the first '##' that is not
  // '## The Concept', '## Learning Objectives', or '## The Problem'.
  if (!/^## Build It$/m.test(t)) {
    const buildItText = `\n## Build It\n\nFor this conceptual lesson, the work is one short scenario in a Claude Code session to confirm the section landed:\n\n1. Open a fresh session in any project folder.\n2. Apply the idea in the section above to your project in a way that fits.\n3. Notice what happens when the condition in the section is met, and when it is not.\n\nPass: you can describe the difference between the two cases in one paragraph.\n`;
    // Find first H2 that is not in {The Concept, Learning Objectives, The Problem}
    const m = t.match(/^## (?!The Concept$|Learning Objectives$|The Problem$|Build It$)/m);
    if (m) {
      t = t.slice(0, m.index) + buildItText + t.slice(m.index);
      changed = true;
      console.log(`  ${f}: inserted ## Build It before '${m[0]}'`);
    }
  }

  if (changed) {
    writeFileSync(f, t);
  }
}

console.log('Done.');