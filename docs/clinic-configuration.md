# Clinic configuration

## Purpose and current boundary

Clinic configuration supplies deterministic, versioned local-delivery data to
an Ariad release. It does not diagnose, triage, calculate whether a service is
open, or author clinical instructions.

The current configuration is a synthetic fixture. No real clinic identity,
contact information, local fever threshold, destination, reviewer, or approval
is represented.

## Data ownership

| Surface | Canonical owner | Review boundary |
|---|---|---|
| Clinic name, jurisdiction, timezone, locale, and care scope | `clinic_config.identity` | Operational configuration review |
| Contact labels, telephone values, availability display, and verification | `clinic_config.contact_routes` | Operational verification and configuration review |
| Fever or supportive-care patient wording | `educational_module` | Source, claim, safety, and clinical review |
| Mapping a local policy to contacts and a module | `clinic_config.clinical_policy_bindings` | Configuration review plus referenced module approval |
| Universal emergency statement | Application safety constant | Product safety change; never clinic-overridable |

## Configuration modes

- `synthetic_demo` is required for the current preview. Contact verification is
  explicitly synthetic and telephone values are display-only.
- `institutional` is reserved for a future owner-authorized onboarding. Every
  contact must be operationally verified and every configured or delegated
  clinical policy must bind an approved, source-linked module.

A synthetic configuration cannot enter a release with `clinical_use: true`.
The P0 publication gate also rejects configured/delegated policy bindings until
policy-purpose compatibility and exact runtime rendering are implemented; an
exact module reference alone is not yet treated as deployable clinical policy.

P0 validates Canadian clinic identity only: `country_code` is `CA`, and the
optional subdivision must be one of the official Canadian province/territory
codes. International expansion requires a prospective schema version rather
than an unvalidated ISO-like value.

## Contacts

P0 requires exactly one `daytime_team` and one `after_hours_team` telephone
route. Each route has a stable ID, patient-facing label, display value,
normalized E.164 value, non-computational availability state, and verification
metadata.

The renderer does not infer whether a service is currently open. Synthetic
telephone values are not emitted as actionable `tel:` links. Institutional
values are hidden until verification is current, and link eligibility is
rechecked against the clinic timezone while the page is open and when it
returns to the foreground.

## Clinical policy bindings

P0 defines `fever` and `supportive_care` bindings. Each binding records:

- `state`: `unresolved`, `delegated_to_team`, or `configured`;
- an exact educational-module kind, ID, and version when applicable;
- no destination while unresolved, or one or more exact contact-route IDs for
  a configured/delegated policy; and
- a governance-only unresolved reason when the state is `unresolved`.

`unresolved` requires a null module reference and an empty destination list, so
the data cannot imply that a local destination was chosen. It blocks publication.
`delegated_to_team` and `configured` require an exact module reference and no
unresolved reason. The referenced module—not the clinic configuration—contains
all patient-facing clinical wording. Those latter states remain schema-level
future seams in P0: publication stays fail-closed until the module declares a
compatible governed purpose and the patient renderer consumes the exact policy
and destination without personalized routing.

## Prospective versioning

The v1 synthetic clinic and historical content-addressed release artifact are
retained. The structured clinic is a new major object version with prospective
supersession metadata. The active preview manifest pins the new exact version
and compilation produces a new content hash. Generated artifacts are never
hand-edited.

## Future institutional intake gate

Before adding a real clinic, the owner must provide and verify:

1. approved display identity and service scope;
2. jurisdiction, IANA timezone, and supported locales;
3. daytime and after-hours contact routes;
4. operational verification identity, time, method, and review-due date;
5. the explicit fever policy decision and destination;
6. the explicit supportive-care policy decision;
7. source-linked patient modules and genuine clinical approval evidence; and
8. an implemented and tested policy-purpose compatibility and exact-rendering
   contract; and
9. authorization to compile a new institutional release.

Do not store staff personal contact information, credentials, patient data,
internal documents, or PHI in clinic configuration.

## P0 implementation limits

- The TypeScript/Zod content validator is authoritative. Generated JSON Schema
  is useful for structure but cannot express every cross-field rule above.
- Viewing-time contact freshness uses the patient device clock. Institutional
  deployment needs an explicit clock-trust/monitoring decision before links are
  relied upon operationally.
- Legacy v1 objects and releases are retained as audit evidence, not as a
  rollback path for the v2-only runtime resolver. Any rollback or migration
  contract requires separate design and authorization.
