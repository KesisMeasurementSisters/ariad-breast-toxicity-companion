# ADR-0001: Bounded AI, deterministic clinical guidance

- Status: Accepted
- Date: 2026-07-18

## Context

Natural language helps patients describe symptoms, but an open-ended model that
authors clinical education or triage would violate Ariad's intended use and
make output non-reproducible.

## Decision

Use GPT-5.6 for only two structured tasks: select candidate IDs from the active
symptom catalogue and restate supplied observable facts. Require patient
confirmation after matching, validate summary provenance, and use deterministic
fallbacks. Guidance modules, warning sections, questions, and their ordering
rules come only from the immutable release.

## Consequences

- Model output cannot silently become clinical content.
- The core product remains usable with no API key or provider outage.
- Prompts and validators are small enough for adversarial testing.
- Language navigation may abstain more often than a general medical chatbot;
  this is an intentional safety tradeoff.
