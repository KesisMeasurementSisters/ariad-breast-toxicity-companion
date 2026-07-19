# ADR-0005: Single Next.js application in a modular monorepo

- Status: Accepted
- Date: 2026-07-18

## Context

Build Week rewards a polished, reliable vertical slice. The product needs a
mobile interface and two server-side model endpoints, while the knowledge layer
must stay extractable.

## Decision

Use one Next.js App Router application in a pnpm workspace. Separate shared Zod
contracts and pure knowledge behavior into `packages/contracts` and
`packages/knowledge-core`. Deploy as one Vercel-compatible service or one
standalone Docker image, with no microservices or database.

## Consequences

- Local setup and competition deployment remain small.
- The OpenAI key stays server-side while the release queries run locally.
- Knowledge packages can migrate independently into Nyx.
- Application availability is a single-service concern; this is appropriate
  for the prototype and can be revisited only when scale requires it.
