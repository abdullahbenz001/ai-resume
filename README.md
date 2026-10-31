# AI Resume & Job Match

A Next.js SaaS workspace for saving resumes and comparing them with job descriptions using Gemini. Clerk handles identity; Neon/PostgreSQL stores private resume and analysis records.

## Implemented

- Authenticated dashboard, PDF text extraction and editable analysis input.
- Resume workspace: create from PDF or text, rename, delete (including related analyses), empty/loading/error states.
- Analysis of saved resumes, transactional persistence, analysis history and live dashboard statistics.
- Server-side ownership checks, Zod validation, bounded request bodies and PostgreSQL-backed request budgets.
- Explicit AI failures: no fabricated scores or silently substituted results.

Search, favorites, optimizer, ATS scoring, job tracking, embeddings and billing are **not implemented** in this delivery. This is not yet a production release.

## Local setup

Use Node 22.12+ (CI uses Node 22).

```sh
npm ci
cp .env.example .env.local
# Configure the empty values locally, never in a commit or chat.
npm run db:deploy
npm run dev
```

The repository `.npmrc` preserves the peer-resolution mode needed by the existing Clerk/shadcn dependency tree. `postinstall` generates Prisma Client. No database connection is required for generation or build.

Configure Clerk's development instance and Gemini/Neon through their provider dashboards. Keep server credentials in `.env.local` or the deployment platform's secret manager. `GEMINI_MODEL` is configurable; verify that the selected model is available to your Gemini project. The existing model default is preserved.

**Existing database:** read [database setup](docs/database.md) before running migrations. Do not reset or drop an existing database to make migrations pass.

## Architecture

- `app/`: routing and thin HTTP entry points; Server Components read through services.
- `features/auth/services/`: derives local identity from verified Clerk sessions.
- `features/resume/`: schemas, DTOs, ownership-scoped repositories, services, Server Actions and workspace UI.
- `features/analysis/`: ownership checks and transactional result persistence.
- `features/dashboard/`: per-user aggregate data.
- `components/`: shared UI and preserved analyzer components.
- `lib/`: provider client, database connection, input limits and request budgets.

Browser-provided IDs identify targets only. Ownership always comes from the server session and is included in mutation predicates. Saved resume analyses use server-stored text. New pasted resume analyses create a resume and result in one transaction after successful AI validation. Failed analysis/save requests never appear as successful results.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Vitest covers authorization boundaries, schemas, HTTP status handling, failed model responses, UI interactions and repository filters. PGlite runs the actual SQL migrations and concurrent request-limit queries against a local PostgreSQL engine. These tests do not replace live Clerk, Neon and Gemini acceptance testing.

Sprint 5.3 now includes client-side search across title/file/preview, all/favorites filtering, updated/name sorting and a persistent favorite flag. List reads remain capped at 100 until pagination is added.

## Operational limits

- PDF: 5 MiB; resumes and job descriptions: 12,000 characters each.
- Authenticated limits: 10 analysis requests/hour and 20 PDF extraction requests/hour per Clerk user. Failed attempts after quota allocation count toward the limit.
- Workspace shows latest 100 resumes; history shows latest 50 analyses. Pagination is future work.
- PDF binary files are not persisted; extracted text is stored. Resume deletion cascades to its analyses.
- No automatic deployment or live migration is performed by CI. See [delivery status](docs/delivery-status.md).
