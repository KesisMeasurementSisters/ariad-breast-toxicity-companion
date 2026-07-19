# Threat model

## Scope and assumptions

This is a concise competition-prototype threat model, not a penetration test,
privacy impact assessment, clinical safety case, or production authorization.
It covers the Next.js application, local browser state, compiled release, and
bounded OpenAI routes. The intended demo uses synthetic data and must not be
used with identifying or real patient information.

Current mode sets `ENABLE_GPT56=false`. The OpenAI adapters remain dormant, so
patient input does not cross the provider boundary during deterministic and
clinic-data development.

## Assets and trust boundaries

Assets:

- server-only OpenAI API key;
- integrity and review state of the compiled clinical-content artifact;
- user-entered symptom wording and observable answers during an active session;
- locally saved treatment IDs;
- availability and predictable behavior of the public demo.

Trust boundaries:

1. content author/reviewer → repository and compiler;
2. compiled release → patient browser;
3. browser → same-origin Next.js API route;
4. Next.js route → OpenAI API;
5. browser → local storage, clipboard, print system, and downloaded file.

## Threats, controls, and residual risk

| Threat | Current control | Residual risk / next step |
|---|---|---|
| Draft content mistaken for approved care | Persistent preview banner, `clinical_use: false`, mandatory notice, noindex, null reviewer/date, visible source/review panel | A user can still over-trust polished draft wording. Do not publicly position it for care; complete clinical review and usability testing. |
| Model invents a symptom or guidance | Strict output schemas, allowed IDs from active release, post-validation, patient confirmation, no model access to guidance selection | Structured output can still be semantically imperfect. Retain abstention, adversarial tests, monitoring without raw patient logs, and human-factors validation. |
| Model adds interpretation to summary | Field-level provenance, length/schema checks, prohibited-language guard, deterministic fallback | A finite phrase scan cannot catch every unsafe implication. Expand semantic test corpus and require clinical safety review before use. |
| Prompt injection in symptom text | Patient text is data inside a fixed server contract; no tools, web search, RAG, or state; output restricted to controlled IDs | Model behavior remains probabilistic. Keep confirmation and deterministic fallback mandatory. |
| API key disclosure | Key is server-only, `.env.local` is ignored, no `NEXT_PUBLIC_` key, provider call occurs on server | Deployment misconfiguration remains possible. Use managed secrets, rotate on exposure, and inspect build artifacts/logs. |
| Raw symptom text retained in logs | Application code avoids raw-input logging; no database or server history; provider storage is disabled in requests | Hosting/provider infrastructure may retain operational metadata under its policies. Review contracts, retention, and residency before real data. |
| User enters PHI despite notice | Interface asks for no identifying information; 500-character limit; no accounts/uploads | Free text cannot be guaranteed PHI-free. Real deployment needs privacy/legal assessment, data-minimization controls, and approved provider configuration. |
| Cross-site request abuse / unexpected origin | Same-origin request checks, JSON validation, bounded body size, simple rate limiting | In-memory limits are per instance and not a production abuse service. Use shared edge controls/WAF if publicly scaled. |
| Endpoint cost or denial of service | Rate limit, conservative output tokens, timeout, no retries, AI kill switch, deterministic fallback | Distributed abuse can bypass per-instance state. Add platform quotas/alerts and shared rate controls. |
| Tampered or stale clinical artifact | Exact version pins, strict compile/load schema, canonical JSON, SHA-256 content hash, content-addressed artifact | The hash is integrity evidence, not a signature. Production needs signed provenance, approval/hash verification, rollback, and release inventory. |
| Unsafe content passes pattern scan | Fixed prohibited-language rules and golden tests | Pattern scans are incomplete. Human clinical review and a formal hazard analysis remain mandatory. |
| Unsupported catalogue item appears supported | Explicit support states; complete guidance requires an exact relationship; unsupported UI avoids class inference | Labels may still be misunderstood. Test comprehension and keep catalogue/full-guidance distinction visible. |
| Local treatment ID exposed on shared device | Only non-identifying treatment IDs persist; reset clears the key | A treatment name is still sensitive in context. Add clearer device/privacy controls for any real deployment. |
| Clipboard/download leaks summary | Export is explicit and user-initiated; no automatic upload | Clipboard, browser downloads, printers, and shared devices are outside Ariad control. Add user warning and institutional policy for real use. |
| Third-party script exfiltration | No analytics, ads, trackers, or user-upload content; restrictive headers | Current CSP permits inline/eval script required by the framework/tooling. Tighten production CSP with nonces/hashes and verify dependencies. |

## Security headers and browser controls

The Next.js configuration removes the framework identification header and sets
content-type sniffing protection, frame denial, a strict referrer policy,
camera/microphone/geolocation denial, and a Content Security Policy. Preview
metadata blocks indexing/following. These are defense in depth, not proof that
the app is secure.

## Privacy posture

The prototype collects no account identity, name, date of birth, health-card
number, MRN, email, telephone, medical document, or analytics event. Saved
treatment IDs are the only durable application state. Symptom text and answers
are ephemeral locally, but model-enabled requests necessarily transmit the
minimum relevant input to the server and OpenAI provider.

Recommended patient-facing notice:

> This is an unreviewed demonstration. Do not enter your name, date of birth,
> health-card number, medical-record number, contact details, or other
> identifying information.

## Abuse and incident response for the demo

- Set `ENABLE_GPT56=false` to remove provider calls while retaining the core
  experience.
- Rotate the API key immediately if exposure is suspected.
- Take the public preview offline if the prototype notice, release integrity,
  or safety boundary is compromised.
- Do not inspect or reproduce raw user text during debugging; reproduce with
  synthetic fixtures.
- Preserve the affected release hash, commit, configuration, and timestamps for
  investigation.

## Production prerequisites

Before handling real patient data or supporting clinical workflows: formal
threat modeling and penetration testing; privacy impact and regulatory/legal
review; data-processing and residency decisions; managed secrets and audit;
central rate limiting; signed release provenance; dependency/SBOM controls;
incident response; clinical safety case; human-factors testing; and
institution-specific approval.

See [clinical safety](./clinical-safety.md) and [data flow](./data-flow.md).
