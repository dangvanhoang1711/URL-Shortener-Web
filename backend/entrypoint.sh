#!/bin/sh

echo "Waiting for database to be ready..."

for i in $(seq 1 30); do
  node -e "
    const { PrismaClient } = require('@prisma/client');
    new PrismaClient().\$queryRaw\`SELECT 1\`.then(() => process.exit(0)).catch(() => process.exit(1));
  " 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "Database is ready!"
    break
  fi

  echo "Database not ready, waiting... ($i/30)"
  sleep 2
done

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Generating Prisma Client..."
npx prisma generate

echo "Starting application..."
exec node src/server.js