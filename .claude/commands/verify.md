---
description: "Segment VERIFY: acceptance criteria against concrete evidence (QA). Always stops with the table."
argument-hint: spec number
---
Read AGENTS.md, docs/roles/qa.md, and workflows/segments.md. Run the VERIFY segment for spec
$ARGUMENTS. Soft entry check: triage is complete — if the plan's ## Triage has no record, say so
and ask. A clean one-pass review (lite, workflows/segments.md) already holds the table: point to
it instead of verifying again.

Use prompts/verify.md: run tests to capture real output and produce the criterion ↔ evidence
table; a claim without evidence is a gap, and gaps are findings. When the spec's Design reference
is a Claude Design artifact (docs/decisions/0002-claude-design-in-analyze-and-verify.md):
- This must be a fresh session, not the builder's. Without the Artifact tool, say so and stop:
  never produce the table without the design comparison.
- First list the artifact. If its last-updated time differs from the one in Design reference,
  stop and ask the human: either they confirm the design is unchanged (record the new time next
  to the old one), or they raise R-08.
- Otherwise read it with the Artifact tool and compare each screenshot against the artboard for
  the same state.
- A mismatch is a difference in content or structure: a missing element, message or action, or
  the wrong state shown. Styling and pixel differences do not count. A mismatch is a FAIL row.

Do not write or modify any production code. Write the handoff, STOP. Do not ship, merge, or move
files.
