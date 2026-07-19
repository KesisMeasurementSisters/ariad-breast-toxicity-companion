# Data flow

## 1. Build-time content flow

```mermaid
sequenceDiagram
  participant Author as Author / clinician owner
  participant YAML as Versioned content YAML
  participant Loader as Repository loader
  participant Guard as Schema + graph + safety gates
  participant Compiler as Deterministic compiler
  participant Release as Immutable release JSON
  participant Web as Next.js bundle

  Author->>YAML: Draft content, provenance, review metadata
  YAML->>Loader: Sorted YAML/JSON discovery
  Loader->>Guard: Strict typed objects and manifest
  Guard->>Guard: References, DAG, sources, governance, language scan
  Guard-->>Author: Fail with object-specific issues
  Guard->>Compiler: Valid exact-version candidate
  Compiler->>Compiler: Sort, index, canonicalize, SHA-256
  Compiler->>Release: release.json + content-addressed artifact
  Release->>Web: Compile-time import and schema parse
```

The compiler never approves content. The current preview path additionally
requires the exact unreviewed-content acknowledgement and emits
`clinical_use: false` plus a mandatory notice. A normal build fails because no
published release exists.

## 2. Treatment and symptom search

Treatment and symptom indexes are generated from the active release. Browser
search normalizes the query and ranks exact name, exact alias, prefix, token,
and fuzzy matches. Results include the authored support status.

Selecting a catalogue item does not synthesize a relationship. If the exact
treatment/preparation or treatment–symptom path is missing, Ariad presents an
unsupported boundary and alternative search options.

## 3. Natural-language symptom navigation

```mermaid
sequenceDiagram
  participant P as Patient browser
  participant D as Deterministic matcher
  participant API as Ariad server route
  participant M as GPT-5.6
  participant R as Immutable release

  P->>D: Up to 500 characters, no identifiers requested
  D->>R: Match release names, aliases, and navigation terms
  alt Strong deterministic match
    D-->>P: Controlled candidate(s)
  else Insufficient confidence and AI enabled
    P->>API: Same-origin structured request
    API->>R: Allowed symptom ID catalogue
    API->>M: Text + bounded catalogue contract, store disabled
    M-->>API: Strict structured candidate IDs or abstention
    API->>R: Validate every returned ID
    API-->>P: Validated result or deterministic fallback
  else AI unavailable/disabled
    D-->>P: Deterministic fallback result
  end
  P->>P: Patient confirms a category
```

The model does not receive clinical modules and cannot enter the guidance path
without patient confirmation.

## 4. Questions and guidance

After category confirmation, the browser selects treatment context and asks the
pure resolver for the most specific eligible complete relationship. The
resolver's order is exact, regimen component, nearest treatment class, then
general safety, with a visible basis/reason for every fallback. The active
preview has complete content only for three exact combinations. A resolved
relationship's 3–7 question IDs determine the observable form. Answers live in
React state.

```text
observable answer
  → authored option summary text
  → authored priority tags
  → module emphasis/initial expansion
  → unchanged fixed six-section guidance
```

There is no scoring, toxicity grade, causal inference, urgency category, or
treatment recommendation. Clinical paragraphs and bullets come only from the
compiled modules.

## 5. Neutral summary

```mermaid
sequenceDiagram
  participant P as Patient browser
  participant F as Deterministic fallback
  participant API as Ariad server route
  participant M as GPT-5.6

  P->>P: Convert answered question IDs to label/value facts
  P->>F: Create immediate template summary
  P->>API: Treatment, symptom, and supplied facts only
  API->>M: Strict fact-restatement contract
  M-->>API: Items with sourceFieldIds
  API->>API: Validate schema, IDs, lengths, provenance, prohibited language
  alt Valid result
    API-->>P: Neutral structured summary
  else Disabled, error, timeout, or invalid output
    API-->>P: Deterministic template fallback
  end
  P->>P: Review, copy, print, or download
```

The summary is not written to a database or server history. The application
does not create a longitudinal record.

## 6. Persistence and reset

Only a versioned local-storage object persists:

```json
{
  "schemaVersion": 1,
  "savedTreatmentIds": ["weekly-paclitaxel"],
  "noticeAcknowledged": false
}
```

It is capped at 12 treatment IDs. Free text, answers, candidate matches, and
summary content remain in active React state and are cleared by reset or normal
session termination. “Reset demo and clear saved treatments” removes the local
storage key and ephemeral state.

When GPT-5.6 is enabled, the minimum request data crosses the server/provider
trust boundary. Users are explicitly asked not to enter identifying
information; this prototype is not authorized for PHI.

See [threat model](./threat-model.md) and [architecture](./architecture.md).
