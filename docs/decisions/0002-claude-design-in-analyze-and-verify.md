# ADR 0002 — UI specs get a Claude Design artifact; VERIFY checks it, not the one-pass review

- Status: Accepted
- Date: 2026-11-14

Supersedes [ADR 0001](0001-claude-design-in-analyze.md). Refines
[ANEW-0008](anew/ANEW-0008-ux-lives-in-the-spec.md) in the Claude Code adapter only.

## Context

ADR 0001 gave every UI spec a Claude Design artifact in ANALYZE and had VERIFY compare screenshots
against it. Its catch-up review (PR #3) found that the VERIFY half did not reach the session that
verifies:
- In lite, the one-pass review lets the read-only `reviewer` subagent write the VERIFY table. It
  follows core `prompts/verify.md` and has no Artifact tool.
- VERIFY had no way to tell whether the artifact had changed since approval.
- "A mismatch is a gap" was undefined.
- The ADR silently overrode `prompts/spec.md` ("Never invent visuals").
- Mini-specs and artboard data were not addressed.

The Artifact tool can publish with a version label, but a read always returns the current
version. The artifact listing shows a last-updated time.

## Decision

For a full spec with a user interface and no design link supplied by the human, the Analyst
(Claude Code) proposes the design as a Claude Design artifact before the spec approval gate. The
human approves spec and design together. VERIFY compares each screenshot against the artboard for
the same state, and does so only in a fresh session (not the builder's) that has the Artifact
tool. Such specs therefore never take the one-pass review.

Mechanics (wired in `.claude/commands/analyze.md`, `verify.md`, `new-feature.md` and
`.claude/agents/reviewer.md`):
- **Scope.** Applies when the spec's User experience is not "none — no user interface". Full
  specs only: mini-specs (CHANGE lane) keep ANEW-0008's `Design:` link unchanged. If the human
  supplies a design link (as `prompts/spec.md` asks), that link is used as is and no artifact is
  created.
- **Override.** This overrides `prompts/spec.md` "Never invent visuals" for Claude Code sessions
  in this project. The artboards are a proposal the human approves at the spec gate, not an
  invented design.
- **Create.**
  - Use the Artifact tool's Design type (`quickstart`, intent `design`), one artifact per spec,
    titled `Spec NNNN — <name>`. Designs are plain until a design system exists.
  - Each state in User experience gets one artboard, named like the state.
  - Before the gate, the link goes into `Design reference:`.
- **Data and sharing.**
  - Artboards show invented placeholder data only: no real employee names, leave reasons or
    credentials.
  - The artifact stays private. Access is granted per person, never by public link.
  - A link in a spec does not grant access.
- **Approve.**
  - At spec approval, republish the artifact *unchanged* with the label `Spec NNNN — approved`.
  - Then record the label and the artifact's last-updated time from the artifact listing:
    `Design reference: <URL> — version "Spec NNNN — approved", last updated <timestamp>`.
  - After an approved R-08 design change, republish with the label
    `Spec NNNN — approved (R-08, <date>)` and replace the recorded label and time.
- **Verify.**
  - VERIFY runs in a fresh Claude Code session, never the builder's (AGENTS.md rule 3). A session
    without the Artifact tool says so and stops; it never produces the table without the
    comparison.
  - Before comparing, VERIFY lists the artifact. If its last-updated time differs from the one
    recorded, stop and ask the human: either they confirm the design is unchanged (the new time
    is recorded next to the old one in `Design reference`), or they raise R-08.
  - A mismatch is a state whose content or structure differs from its artboard: a missing
    element, message or action, or the wrong state shown. Styling and pixel differences do not
    count.
  - A mismatch is a FAIL row in the evidence table. It goes to triage and is fixed in code, or
    in the design through R-08.
- **One-pass.** A spec whose `Design reference` is a Claude Design artifact is not eligible for
  the one-pass review. The subagent reviews only. After triage and fix rounds, `/new-feature`
  stops and hands VERIFY to a fresh session with the Artifact tool. The subagent does not get
  that tool, because it can also publish.
- **Gates.** No new gate: the spec approval gate covers the design (ANEW-0008).

## Consequences

- Benefits:
  - Every UI state has a visual target before PLAN, and the human sees the screens while changes
    are cheapest.
  - The comparison happens on every UI spec, never silently skipped.
  - A post-approval design edit is caught before it becomes VERIFY's target.
- Costs:
  - UI specs lose the one-pass review: one more session and handoff each.
  - ANALYZE takes longer for UI specs.
  - The design lives on claude.ai, outside the repo. That fits
    [ANEW-0006](anew/ANEW-0006-evidence-referenced-not-stored.md) (referenced, not stored), but
    readers of the spec need access to the artifact.
  - The last-updated check is coarse: any republish trips it, even one without a design edit. A
    human then confirms nothing changed, or raises R-08.
  - Other tools (Cursor, Copilot, Codex) can open the link but cannot create one. Their sessions
    follow ANEW-0008 unchanged.
  - `scripts/init --force claude-code` overwrites the adapter lines. This ADR is the source to
    restore them from.
  - Still Documented only ([ANEW-0004](anew/ANEW-0004-enforcement-levels.md)): `scripts/doctor`
    does not check it.

## Alternatives considered

- **Amend ADR 0001 in place:** accepted ADRs take editorial revisions only
  (`docs/decisions/README.md`), and most of these changes alter its meaning.
- **Give the `reviewer` subagent the Artifact tool:** that tool can also create and publish,
  which breaks the subagent's "never write" rule.
- **Put the rule in the ANEW core (`prompts/spec.md`, `prompts/verify.md`):** that breaks
  tool-neutrality ([ANEW-0011](anew/ANEW-0011-tool-neutral.md)).
- **A separate design gate before spec approval:** ANEW-0008 rejected it because it adds a stage
  ANEW cannot validate. Here it would also add a decision the spec gate already covers.
- **Include mini-specs now:** no UI change request exists yet. It is listed as a revisit trigger.

## Revisit triggers

- A design system is added. Designs should then start from it.
- Many R-08s for design changes: consider designing earlier, or a separate gate.
- A non-Claude tool joins the project and needs to create designs too.
- Artifact versions become readable by label or pinnable by URL: compare against the pinned
  version and drop the last-updated check.
- A UI change request comes in through the CHANGE lane: decide whether mini-specs get artifacts.
