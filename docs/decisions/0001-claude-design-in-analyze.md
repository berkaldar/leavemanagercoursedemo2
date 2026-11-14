# ADR 0001 — UI specs get a Claude Design artifact in ANALYZE

- Status: Accepted
- Date: 2026-11-14

## Context

ANEW-0008 puts user experience in the spec: flow, states, a design link, accessibility, and one
acceptance criterion per state. With no design, the spec says "none — the flow above is the
design", and VERIFY compares its screenshots against prose. This project has no designer and no
design tool. Claude Code here can create a **Design** artifact on claude.ai: a canvas of live
artboards. That gives every UI spec a visual target at almost no cost. ANEW-0008 kept design tools
out of the tool-neutral core, so this project decision refines it in the Claude Code adapter only.

## Decision

When a spec has a user interface, the Analyst in ANALYZE (Claude Code) creates a Claude Design
artifact with one artboard per state listed in the spec's User experience. The artifact's link
and a named version label go into `Design reference:` before the spec approval gate. Approving
the spec approves that design, and VERIFY compares its screenshots against those artboards.

Mechanics (wired in `.claude/commands/analyze.md` and `.claude/commands/verify.md`):
- Applies only when User experience is not "none — no user interface".
- Start from the Artifact tool's **Design** type (`quickstart` with intent `design`), one
  artifact per spec, titled `Spec NNNN — <name>`. There is no design system yet, so designs are
  plain unless one is added.
- Every state in User experience gets an artboard named like the state: empty, loading, error,
  success, no permission.
- At spec approval, publish the artifact once more with the label `Spec NNNN — approved`.
  `Design reference:` holds `<artifact URL> — version "Spec NNNN — approved", <YYYY-MM-DD>`.
- Changing the design after approval is a spec change (R-08), never a silent edit.
- No new gate: the spec approval gate covers the design (ANEW-0008 rejected a separate design gate).

## Consequences

- Benefits:
  - Every UI state has a visual target before PLAN.
  - The SHIP screenshot gallery compares against artboards, not prose.
  - The human sees the screens before approving the spec, where changes are cheapest.
- Costs:
  - ANALYZE takes longer for UI specs.
  - The design lives on claude.ai, private by default, outside the repo. That fits ANEW-0006
    (referenced, not stored), but anyone reading the spec needs access to the artifact.
  - Other tools (Cursor, Copilot, Codex) can open the link but cannot create one. Their sessions
    follow ANEW-0008 unchanged.
  - The version label is a convention, not proof: a URL may not pin a single version. The label
    and date in the spec are the record of what was approved.
  - `scripts/init --force claude-code` overwrites the adapter lines. This ADR is the source to
    restore them from.
  - Still Documented only (ANEW-0004): `scripts/doctor` does not check it.

## Alternatives considered

- **"None — the flow above is the design" (ANEW-0008 as is):** it works, but VERIFY has nothing
  visual to compare against. It lost because the tool is already here and costs little.
- **Put the rule in the ANEW core (`prompts/spec.md`, `prompts/verify.md`):** that breaks
  tool-neutrality (ANEW-0011) and would be overwritten on every ANEW upgrade.
- **A separate design gate before spec approval:** it adds one human decision per UI spec without
  new information, since the human approves spec and design together anyway. ANEW-0008 rejected
  it for the same reason.

## Revisit triggers

- A design system is added. Designs should then start from it.
- Designs often change after approval (many R-08s): consider designing earlier, or a separate gate.
- A non-Claude tool joins the project and needs to create designs too.
- Artifact versions become linkable by URL: pin the exact version instead of a label.
