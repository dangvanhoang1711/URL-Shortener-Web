# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ .
RUN npm run build

# Stage 2: Prepare backend
FROM node:20-alpine AS backend-builder
WORKDIR /backend
# Copy thêm package.json để prisma generate có ngữ cảnh
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm install --legacy-peer-deps
# Đảm bảo phiên bản prisma khớp với dự án của bạn
RUN npx prisma generate

# Stage 3: Production image
FROM node:20-alpine
WORKDIR /app

# Thêm bash vì file entrypoint.sh của bạn dùng bash logic
RUN apk add --no-cache dumb-init curl mysql-client bash

# Copy backend
COPY --from=backend-builder /backend/node_modules ./node_modules
COPY --from=backend-builder /backend/package*.json ./
COPY --from=backend-builder /backend/prisma ./prisma
COPY backend/src ./src
COPY backend/.env* ./
COPY backend/entrypoint.sh ./

# Copy frontend dist
COPY --from=frontend-builder /frontend/dist ./public

# Cấp quyền thực thi và sửa lỗi kết thúc dòng (line ending) 
# Rất quan trọng nếu bạn làm việc trên Windows để tránh lỗi "env: sh\r: no such file or directory"
RUN chmod +x ./entrypoint.sh && sed -i 's/\r$//' ./entrypoint.sh

EXPOSE 3000

# Health check 
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Khuyên dùng đường dẫn tương đối từ WORKDIR
CMD ["./entrypoint.sh"]