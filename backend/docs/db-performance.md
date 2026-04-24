# DB & Performance

## What was added

- Prisma schema for `users`, `urls`, and `clicks`
- SQL migration for the initial MySQL tables
- Seed script with demo data
- Simple Prisma client helper
- Simple Redis cache helper
- Cache-aside service for URL lookups
- Collision test script for Base62 IDs
- Lookup benchmark script

## Why these indexes exist

- `urls.shortCode`: exact lookup for redirect
- `urls.userId, createdAt`: list URLs by user
- `clicks.urlId, clickedAt`: fetch analytics timeline fast
- `clicks.clickedAt`: global time-based reports

## Commands

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run test:collision
npm run benchmark:lookup
```

## Example cache flow

1. Read `shortCode` from Redis.
2. If found, return immediately.
3. If not found, read from MySQL with Prisma.
4. Save the result back to Redis with TTL.

This keeps the code easy to follow and reduces repeated database reads for popular links.
