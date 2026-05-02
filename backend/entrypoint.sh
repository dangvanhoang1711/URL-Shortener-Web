#!/bin/sh

echo "------------------------------------------------"
echo "🚀 Waiting for database to be ready..."
echo "------------------------------------------------"

# Thử kết nối trong 30 giây
for i in $(seq 1 30); do
  # Thử ping database thông qua Prisma
  if npx prisma db pull --print 2>/dev/null; then
    echo "✅ Database is ready!"
    break
  fi
  
  echo "❌ Database not ready, waiting... ($i/30)"
  sleep 2
done

echo "------------------------------------------------"
echo "🔄 Running Prisma migrations (deploy)..."
npx prisma migrate deploy

# Nếu bạn muốn tự động tạo client Prisma mỗi khi khởi động (an toàn hơn)
echo "📦 Generating Prisma Client..."
npx prisma generate

echo "🚀 Starting application..."
echo "------------------------------------------------"

exec node src/server.js