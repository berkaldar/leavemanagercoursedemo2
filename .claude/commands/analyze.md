---
description: "Segment ANALYZE: intent → clarify → spec → spec approval. Always stops at the handoff."
argument-hint: short feature description
---
Read AGENTS.md, docs/roles/analyst.md, and workflows/segments.md. Run the ANALYZE segment for:
$ARGUMENTS

Follow the segment contract exactly: entry check (no twin spec), prompts/clarify.md then
prompts/spec.md, the spec approval gate, set "Status: Approved", write the handoff, STOP.

Project rule (docs/decisions/0002-claude-design-in-analyze-and-verify.md): if a full spec has a
user interface and the human supplies no design link, before the spec approval gate create a
Claude Design artifact (Artifact tool, quickstart intent "design"), titled "Spec NNNN — <name>",
one artboard per state in User experience, named like the state, and put its link in "Design
reference". A design link the human supplies is used as is, with no artifact. This overrides prompts/spec.md "Never invent
visuals": the artboards are a proposal the human approves at the gate. Use invented placeholder
data only. Keep the artifact private; never share it by public link. At approval, republish it
unchanged with the label "Spec NNNN — approved", then record that label and the artifact's
last-updated time (from the artifact listing) next to the link. After an approved R-08 design
change, republish with the label "Spec NNNN — approved (R-08, <date>)" and replace the recorded
label and time.
Never produce a plan, a plan suggestion, or code.
