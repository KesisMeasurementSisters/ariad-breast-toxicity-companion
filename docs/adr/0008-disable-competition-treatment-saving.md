# ADR-0008: Disable treatment saving in the competition build

- Status: Accepted
- Date: 2026-07-21

## Context

ADR-0004 allowed a small saved-treatment list in browser local storage. The
competition experience no longer needs that convenience, and removing it makes
the patient path and privacy explanation simpler.

## Decision

Treatment saving is default-off and requires the exact public build value
`NEXT_PUBLIC_ENABLE_TREATMENT_SAVING=true`. The competition preview, Docker,
CI, and browser-test configurations force the value to `false`.

When saving is disabled, Ariad does not render saved-treatment controls, does
not read a saved list into application state, and removes the legacy
`ariad:preferences` key. Direct treatment and clinic-code URLs remain available
because they are navigation inputs, not an Ariad-managed saved list.

## Consequences

- ADR-0004 remains a record of the earlier decision, but its persistence path is
  dormant in the competition build.
- Treatment choices and symptom answers are not stored by Ariad in that build.
- A direct treatment URL may still appear in ordinary browser history.
- Re-enabling saving later requires an explicit build decision and renewed
  privacy, usability, and security review.
