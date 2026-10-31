# Database setup and migration safety

The following migrations are included:

1. `202610310001_initial`: existing User/Resume/Analysis schema.
2. `202610310002_request_limits`: additive request-budget table.
3. `202610310003_resume_favorites`: adds the persistent resume favorite flag.

## Empty database

Set `DATABASE_URL` to the application pooled connection and `DIRECT_URL` to the migration connection in the secret manager or local `.env.local`. Then run `npm run db:deploy`. Do not put the connection strings into shell arguments, logs or source control.

## Existing database created with db push

Do not run the initial migration against populated matching tables. First take a provider snapshot/backup and inspect schema drift in a separate environment. If and only if the existing schema matches the initial migration, mark that migration as applied:

```sh
npx prisma migrate resolve --applied 202610310001_initial
npm run db:deploy
```

If the schema differs, prepare and review a reconciliation migration before proceeding. Do not blindly baseline an unknown schema and do not use reset or accept-data-loss. No production database has been inspected or modified in this delivery.

The Prisma 7 datasource URL is configured in `prisma.config.ts`, not `schema.prisma`. Database clients are instantiated lazily so build/test tools do not require production credentials.

## Data behavior

Each authenticated Clerk identity gets one local User row through a unique `clerkId` upsert. Profile details remain in Clerk. All resume operations use the local owner's ID. Analysis history filters through `resume.userId`. Deleting a resume permanently deletes its analyses via the database foreign key.

The rate-limit table has at most one row per Clerk user/endpoint. Account-deletion cleanup and retention policy are release prerequisites, not implemented lifecycle features.
