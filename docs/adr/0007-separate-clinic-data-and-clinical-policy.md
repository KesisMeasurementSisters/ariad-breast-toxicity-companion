# ADR-0007: Separate clinic operations data from clinical policy

- Status: Accepted
- Date: 2026-07-19

## Context

The original clinic configuration is a flat object containing a clinic name,
two contact strings, a universal emergency statement, and free-text fever and
supportive-care instructions. That shape mixes operational facts with clinical
content, makes phone-number changes share a clinical wording boundary, and
places patient-facing clinical prose outside the educational-module safety and
approval workflow.

The first implementation remains a synthetic demonstration. It must establish
the data boundary without inventing a real institution, local threshold,
destination, reviewer, or approval.

## Decision

Treat `clinic_config` as an exact-version deployment bundle for:

- clinic identity, jurisdiction, timezone, locale, and care scope;
- structured, independently identified contact routes and their operational
  verification state; and
- exact bindings from named local-policy purposes to governed educational
  module versions and contact-route IDs.

Clinic configuration contains no patient-facing clinical instruction prose.
Fever and supportive-care wording remains in educational modules, where
sources, claims, placeholders, safety scanning, clinical review, approval, and
supersession already apply.

The universal emergency statement remains a product safety constant and cannot
be overridden by clinic data. Patient answers cannot choose a contact route or
change policy text. The P0 configuration remains `synthetic_demo`; real
institutional data requires a separate owner-authorized onboarding and
verification gate.

## Consequences

- Operational data and clinical content can change on separate review paths.
- Releases resolve one exact clinic configuration instead of selecting the
  first clinic object present.
- Unresolved local policies remain explicit and cannot enter a published
  clinical-use release.
- Synthetic telephone numbers remain non-actionable in the patient interface.
- Institutional contact values remain hidden unless verification is current at
  viewing time; verification expiry is rechecked while the page is open.
- P0 also blocks configured/delegated clinic policies from publication until a
  governed purpose-compatibility contract and exact runtime rendering exist.
- Supporting a real institution requires verified contacts, approved clinical
  modules, and a new immutable release; changing the mode flag is insufficient.
- The schema and compiler methodology versions change because the compiled
  clinic shape and safety coverage change.
