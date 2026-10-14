# Rubric: 01.1 — Explain any codebase to yourself, out loud. Find the jargon leaks.

Every criterion is **observable** — checkable without asking permission.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | Two explanations exist, verbatim, from separate sessions | Both files present. Session ids or timestamps differ. |
| 2 | `leaks.md` exists with one entry per leak: term, sentence, why, fix | Every entry has all four fields. An entry missing the fix is not an entry. |
| 3 | Both leak counts are written down, and the second is lower | `NOTES.md` shows two numbers. Equal counts mean pass two did not work — say why, or redo it. |
| 4 | `NOTES.md` names what changed between pass one and pass two | A specific change in the ask, not "I asked better." |

## should

| # | Criterion | What it signals |
|---|---|---|
| 5 | At least one untraced claim is listed | You caught fiction, not just jargon. This is the part that separates a careful reader from a tired one. |
| 6 | Every leak's fix is one line | You diagnosed the cause. A fix that needs a paragraph means the leak was not understood. |
| 7 | Project-specific names are counted as leaks | "Our `SessionManager`" is a leak. Treating it as ordinary vocabulary is the common miss. |

## proof of understanding

Answered **without either transcript open**:

1. A question requiring mechanism, not recall. *Why was the second explanation
   cheaper?* The correct answer is about what the agent was asked to return, not
   about the model being "smarter on the second try."
2. A question where the easy answer is wrong. *The agent described a class that
   does not exist. Which of your four link types — capability, context, surface,
   verification — explains that, and why?*
3. A "when would you NOT do this" question. *When is asking for an explanation
   with every term defined on first use the wrong instruction?*

If they're answered from memory, ask again with a new situation.

---

## Honest failure

A second count that is not lower is not automatically a fail — but it must be
explained. Common honest explanations:

- The codebase is small enough that the first explanation had nothing to leak.
- The leaks were vocabulary you genuinely already knew, and you marked them
  anyway.
- The second pass fixed jargon and created verbosity problems.

An unexplained equal count is a fail. It means the measurement was not a
measurement.

---

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |