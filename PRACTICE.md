# Practice

Sixteen modules. One per phase that has something worth building.

A module is **not** done when code runs. It's done when the rubric's criteria are
met and you can explain the mechanism with the code closed.

---

## The four types

| Type | You produce | Proves |
|---|---|---|
| **Instrument** | A measurement | You can find out what's actually happening |
| **Build** | A working artifact | You can make a thing |
| **Break** | A failure *and* a recovery | You understand the mechanism by its failure mode |
| **Decide** | A defended choice | You can choose under trade-offs |

Break and Decide modules are the ones people remember. Prefer them.

---

## Structure

```
practice/NN-module-name/
├── BRIEF.md      task + the constraint that makes it non-trivial
├── RUBRIC.md     observable criteria + proof-of-understanding questions
└── attempts/     your work (gitignored)
```

Template: `practice/TEMPLATE/`

---

## The modules

| # | Phase | Module | Type |
|---|---|---|---|
| 00.1 | 00 | Break the repo. Recover it. Recover it faster. | Break |
| 01.1 | 01 | Explain a codebase to yourself, out loud. Find the jargon leaks. | Instrument |
| 02.1 | 02 | Break it. Recover it. Recover it again, faster. | Break |
| 03.1 | 03 | Route a real workload across model tiers. | Instrument |
| 04.1 | 04 | Configure a project. Know which settings file won. | Build |
| 05.1 | 05 | Author a skill. Use it. Break it. Fix the frontmatter. | Break |
| 06.1 | 06 | A subagent that does one job and refuses everything else. | Build |
| 07.1 | 07 | Build an MCP server. Then: would you trust a cloned repo? | Decide |
| 08.1 | 08 | A hook that makes an unsafe action impossible. | Build |
| 09.1 | 09 | Package skill + subagent + hook as one plugin. | Build |
| 10.1 | 10 | Write a CLAUDE.md that changes behavior. Prove it. | Build |
| 11.1 | 11 | Build a parallel system. Prove isolation held. | Build |
| 12.1 | 12 | Hit the completion-order trap *on purpose*. Then fix it. | Break |
| 13.1 | 13 | Cut context by half. Prove capability survived. | Instrument |
| 14.1 | 14 | Find the 20% of agent calls costing 80%. | Instrument |
| 15.1 | 15 | Decompose a project. Find the critical path. | Decide |
| 16.1 | 16 | Reproduce the empty-branch bug. Then prevent it. | Break |
| 17.1 | 17 | Automate a real task headlessly, end to end. | Build |
| 18.1 | 18 | Spec → graph → parallel build → verify → ship. | Build |

---

## Grading

An agent grades using the module's `RUBRIC.md`. Criteria are observable — checked
by running something, not by asking permission.

Outcomes: **pass** · **partial** (name which criteria) · **not yet** (say what's
missing, don't soften it) · **pass + finding** (they found a brief error — the
best outcome, take it seriously).

---

## Rules

- Work in this repo. Commit as you go.
- If something doesn't work as the brief says, **the brief may be wrong.** Write
  down what actually happened. That's a finding, not a failure.
- `NOTES.md` is required. Code alone is not a submission — the reasoning is the
  part worth reading.