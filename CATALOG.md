# Harnessing Claude Code — Catalog

> From zero to graph engineering. 20 phases, 118 lessons, 16 practice modules.
> Every lesson is one directory. The path is the URL.

**Format:** `phases/NN-phase-slug/NN-lesson-slug/docs/en.md`
**Also per lesson:** `code/` (runnable), `quiz.json` (machine-readable)

---

## Phase 00 — Setup & Tooling
Your tools shape your thinking. Set them up once.

1. Dev Environment
2. **Git & Collaboration** ← your safety net, not optional
3. Terminal & Shell
4. Editor Setup
5. Debugging & Profiling

> **Module 00.1** — Break this repo on purpose. Recover it. Recover it faster.

---

## Phase 01 — Foundations of AI
The words everything else leans on.

6. What a Language Model Is
7. Tokens — why text becomes currency
8. The Context Window — the only budget that matters
9. Prompt, Inference, API
10. What "Agentic" Means
11. Latency, Cost, and Rate Limits

> **Module 01.1** — Explain any codebase to yourself, out loud. Find the jargon leaks.

---

## Phase 02 — Git Deep
Commit = photograph. Branch = label. `worktree` hides `working tree`.

12. Commit Is a Photograph, Not a Diff
13. Branches Are Movable Labels, Not Copies
14. Merge and Rebase
15. Conflicts: What They Are, How They Resolve
16. Recovering Lost Work
17. Stashing, and Why Agents Break Things
18. Remotes, Forks, and the Full Mental Model

> **Module 02.1** — Break it. Recover it. Recover it again, faster.

---

## Phase 03 — Models & Families
Open-weight vs frontier. What actually costs money.

19. Open-Weight vs Frontier
20. Model Aliases and Routing — teach `sonnet`, never hardcoded IDs
21. Effort Levels and Extended Thinking
22. Prompt Caching — why switching models makes a turn slow
23. Quantization, Distillation, Fine-Tuning
24. **SLMs — When a 350M Model Wins**
25. **Decision Models — Jev, Jeff, and the LFM line**
26. **The Taxonomy: LLM / Jev / Jeff / LFM**

> **Module 03.1** — Route a real workload across model tiers. Find where the frontier model was wasted.

---

## Phase 04 — Claude Code
The tool, from first run to fluency.

27. What Claude Code Is
28. Install, First Run, Verify
29. Files and Edits — and When It Refuses
30. Sessions, `/clear`, `/compact`
31. **The Agentic Loop** — the one concept everything hangs on
32. What Loads Into the Window, and What Doesn't
33. Permissions and Permission Modes
34. Settings — 4 Files, 5 Precedence Levels
35. Plan Mode and Checkpoints
36. Checkpointing, `/rewind`, Recovery
37. Troubleshooting — Reading Errors Properly

> **Module 04.1** — Configure a real project. Know which settings file won.

---

## Phase 05 — Commands & Skills
The most flexible extension layer.

38. Built-in Commands *(renamed from "slash commands")*
39. Why Custom Commands **Merged Into Skills**
40. What a Skill Is
41. **Anatomy — the 21-Field Frontmatter Table**
42. The Invocation Matrix — Who Can Trigger It
43. **Install a Skill**
44. **Author a Skill From Scratch**

> **Module 05.1** — Author a skill. Use it. Break it. Fix the frontmatter.

---

## Phase 06 — Subagents
Context isolation.

45. Subagent Markdown Format
46. Built-ins — `Explore`, `Plan`, `general-purpose`
47. **Author a Subagent** + the fork-context subtlety
48. Skills Inside Subagents — the genuinely confusing case

> **Module 06.1** — Write a subagent that does one job perfectly and refuses everything else.

---

## Phase 07 — MCP
A protocol, not a tool.

49. What MCP Is
50. **Four Transports** — http / sse *(deprecated)* / stdio / ws
51. Scopes, Precedence, Config Shape
52. **Build an MCP Server From Scratch**
53. The Trust Model and Prompt Injection
54. OAuth, Headers, and MCP Tool Search

> **Module 07.1** — Build an MCP server. Then ask: would you trust a repo you cloned?

---

## Phase 08 — Hooks
Events on the loop. Enforcement, not requests.

55. What a Hook Is
56. **All 32 Events**, Matchers, Handler Types
57. Script Shape — stdin JSON → stdout / exit code
58. **The Exit-1-vs-2 Trap**
59. **Build a Guardrail Hook**
60. Debugging Hooks

> **Module 08.1** — Write a hook that makes an unsafe action *impossible*.

---

## Phase 09 — Plugins
The packaging layer. Comes last for a reason.

61. *"Plugins Are the Packaging Layer"* — and why
62. Anatomy and the Manifest
63. Install from Marketplace, and Author One
64. Plugin Economics — What Every Enabled Plugin Costs

> **Module 09.1** — Package your skill + subagent + hook as one installable plugin.

---

## Phase 10 — Memory & Instructions
How context persists.

65. CLAUDE.md — the 200-Line Rule
66. AGENTS.md, CLAUDE.local.md
67. Rules and Path-Scoped Rules
68. Auto Memory and `MEMORY.md`
69. Output Styles
70. Imports and External Context

> **Module 10.1** — Write a CLAUDE.md that changes behavior. Prove it.

---

## Phase 11 — Parallelism I
The five names, and why they're different.

71. The Five Names
72. Subagents as Isolation
73. Agent Teams — Mailbox, Task List, Documented Limits
74. **Worktrees, Deep** — session vs per-agent
75. Base Ref, Cleanup, and the `/batch` Path
76. **How Isolation Is Actually Enforced** — the blocking checks

> **Module 11.1** — Build a parallel system. Prove isolation held.

---

## Phase 12 — Parallelism II
Orchestration.

77. Cross-Session Messaging
78. Dynamic Workflows — the Script Decides
79. `parallel()` vs `pipeline()`
80. **The Completion-Order Gotcha**
81. Workflow Runtime Caps
82. Loops — Scheduled and Recurring
83. Hooks-Driven Automation — Events as Control Flow
84. **The Decision Framework** — Which Mechanism, When
85. **When NOT to Parallelize**

> **Module 12.1** — Write a workflow with propose → verify. Hit the completion-order trap *on purpose*.

---

## Phase 13 — Context Engineering
Context as architecture.

86. What Loads, What Costs
87. Progressive Disclosure — Skills as a Loading Strategy
88. **Context as Architecture, Not a Dump**
89. Prompt Caching as a Design Constraint
90. Reducing Context Without Losing Capability

> **Module 13.1** — Cut a bloated context by half. Prove capability survived.

---

## Phase 14 — Harness Engineering
The loop minus the intelligence.

91. What a Harness Is
92. **Most Agent Calls Are Decisions, Not Generation**
93. **Decision Models Inside a Loop**
94. **Confidence Gating** — Escalate Only When Unsure
95. **Verification Loops** — the prerequisite for unattended runs
96. **Guardrails vs Instructions** — requests vs enforcement
97. **Design Your Own Harness** — and defend the trade-offs

> **Module 14.1** — Instrument a real loop. Find the 20% of calls costing 80%.

---

## Phase 15 — Graph Engineering
Nodes, edges, and what genuinely parallelizes.

98. Nodes and Edges
99. **Task Graphs** — Dependencies and the Frontier
100. **Blocking Edges** — What's Actually Parallelizable
101. **Claiming** — Stopping Two Agents Doing One Job
102. Wayfinding — Producing Decisions, Not Deliverables
103. Fan-Out / Fan-In Patterns
104. Failure Propagation — What Happens When One Node Dies
105. **Design a Graph** for a Real Project

> **Module 15.1** — Decompose a real project. Find the critical path.

---

## Phase 16 — Worktrees in Practice
Deep on the one you came for.

106. Session vs Agent Scope
107. Manual Worktrees — `git worktree add`
108. The Startup-Cache Trap (cost us a session)
109. Merge Strategy for Agent Branches
110. **Isolation Without a Commit Is Not a Backup**

> **Module 16.1** — Reproduce the empty-branch bug. Then prevent it.

---

## Phase 17 — Scaling & Operations
Running it for real.

111. Headless / Non-Interactive Mode
112. The Claude Agent SDK
113. Channels and Surfaces
114. Sandboxing and Security Model
115. Managing Settings at Scale

> **Module 17.1** — Automate a real task headlessly, end to end.

---

## Phase 18 — Capstone
Ship it.

116. Spec → Graph → Build → Verify
117. Review Against the Docs
118. What Breaks in Production
119. Keeping Up — Claude Code Ships Weekly

> **Module 18.1** — End-to-end with everything.

---

## Coverage note

Phases 04–17 cover material **aiengineeringfromscratch.com does not have** (542 lessons, and none of it is Claude Code as a harness). Phases 00–03 overlap in spirit only.

**Open item:** Phase 03 lessons 24–26 need "Liar = LFM?" confirmed. I won't title a lesson on a guess.