# ADR-0006: Pin the Next.js Webpack path for the preview

- Status: Accepted
- Date: 2026-07-18

## Context

The release is imported through workspace packages that include strict Zod
schemas and a generated JSON artifact. In this environment, the Next.js 16
Turbopack production path raised a temporal-dead-zone error while collecting
API page data. The same source compiled and ran successfully through the
supported Webpack path.

## Decision

Pin both `next dev` and `next build` to `--webpack` for the Build Week preview.
Keep this choice visible in package scripts and test the same path in CI. Do
not weaken schemas or duplicate the release to accommodate a bundler-specific
failure.

## Consequences

- Local development, CI, and the standalone image use one verified bundler.
- The preview does not depend on an unresolved Turbopack interaction.
- Builds may be slower than Turbopack builds.
- A future change back to Turbopack requires a clean build plus API, browser,
  and release-verification regression testing.
