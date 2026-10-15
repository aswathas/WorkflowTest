# 01 — The problem

**Date.** 2026-10-15

## The curriculum problem

`agent101` is a course: how to work with an AI coding agent, from "what is an agent"
to the parts that are genuinely hard. It has 119 lesson pages, organised into
phases, with a catalog, a REST API, an MCP manifest, and an `llms.txt` index.

The problem it solves is not "where do I learn agents". The problem is that agents
are taught as either magic or as a product list. Neither survives first contact with
a real repository. What a learner actually needs is the unglamorous middle: how to
read what the agent is about to do, how to notice when it is wrong, how to make it
recoverable before it runs.

That is why Lesson 3 is "read what the agent is about to run" and not "prompting".

## The production problem, which was not expected

Building 119 lessons raised a problem nobody had planned for: **who writes them.**

One agent in one session does not produce 119 coherent, template-valid lessons. And
this repository already had a note saying that routing everything to one in-workflow
agent was the wrong shape:

> "Used by workflow scripts in place of the in-workflow agent: field, which routes
> to MiniMax and bypasses the real external CLIs."

So the question was not "how do I write a lesson" but "how do I get several
different agents to produce material that reads as one course". That question turned
out to be most of the project. It is recorded in `03-decision.md` and
`docs/agents/`.

## The reliability problem underneath it

The agents available from the command line are not reliable in the same way, and for
different reasons:

- **agy** (Gemini via Antigravity) runs out of budget partway through a long job.
- **opencode** works but routes to a different model.
- The in-workflow agent always works, but it is the one that does not exercise the
  real external tools.

So a long build could not depend on any single one of them. Commit `4f02b12`:

> "dispatch.mjs runs agy (Gemini) first, falls back to opencode with
> deepseek-v4.1-flash if agy reports a budget error."

## What it costs if unaddressed

A curriculum that stalls at whatever number the budget runs out at, and silently —
an agent that fails with a budget error looks a lot like an agent that finished, if
nobody reads the error. That is the failure the dispatch chain exists to prevent.