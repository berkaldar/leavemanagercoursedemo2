---
description: "Segment ANALYZE: intent → clarify → spec → spec approval. Always stops at the handoff."
argument-hint: short feature description
---
Read AGENTS.md, docs/roles/analyst.md, and workflows/segments.md. Run the ANALYZE segment for:
$ARGUMENTS

Follow the segment contract exactly: entry check (no twin spec), prompts/clarify.md then
prompts/spec.md, the spec approval gate, set "Status: Approved", write the handoff, STOP.

Project rule (docs/decisions/0001-claude-design-in-analyze.md): if the spec has a user
interface, before the spec approval gate create a Claude Design artifact (Artifact tool,
quickstart intent "design"), titled "Spec NNNN — <name>", one artboard per state in User
experience, and put its link in "Design reference". At approval, republish it with the label
"Spec NNNN — approved" and record that label and the date next to the link.
Never produce a plan, a plan suggestion, or code.
