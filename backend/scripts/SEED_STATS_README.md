# Seed Stats Data - Hướng dẫn sử dụng

## 📊 Tổng quan

Scripts này giúp bạn tạo fake data cho stats để demo. Nó sẽ tạo clicks với:
- IP addresses từ nhiều quốc gia khác nhau
- User agents từ nhiều browsers và devices
- Timestamps trong 7-30 ngày qua

## 🚀 Cách sử dụng

### 1. Seed tất cả URLs trong database

```bash
cd backend
npm run db:seed-stats
```

Sẽ tạo 50-200 clicks cho mỗi URL có trong database.

### 2. Seed cho một URL cụ thể

```bash
cd backend
npm run db:seed-url <shortCode> [số lượng clicks]
```

**Ví dụ:**
```bash
# Tạo 100 clicks (mặc định)
npm run db:seed-url abc123X

# Tạo 500 clicks
npm run db:seed-url abc123X 500
```

### 3. Chạy trực tiếp trong Docker

```bash
# Seed tất cả URLs
docker exec -it docker-app-1 npm run db:seed-stats

# Seed một URL cụ thể
docker exec -it docker-app-1 npm run db:seed-url abc123X 200
```

## 📋 Quy trình demo

1. **Tạo một short URL:**
   - Truy cập http://localhost:3000
   - Login và tạo short URL
   - Ví dụ: `google.com` → `http://localhost:3000/aB3xK9m`

2. **Seed stats cho URL đó:**
   ```bash
   docker exec -it docker-app-1 npm run db:seed-url aB3xK9m 150
   ```

3. **Xem stats:**
   - Truy cập http://localhost:3000/stats/aB3xK9m
   - Sẽ thấy 150 clicks với nhiều IP và User Agents khác nhau

## 🌍 Fake Data

### IP Addresses (16 IPs từ nhiều quốc gia):
- Vietnam: `203.113.45.12`
- USA: `8.8.8.8`, `1.1.1.1`, `13.107.42.14`, etc.
- Singapore: `103.21.244.0`
- Japan: `202.12.94.33`
- China: `180.149.132.47`
- Germany: `46.101.163.119`
- UK: `185.220.101.1`

### User Agents (12 browsers/devices):
- Chrome on Windows
- Chrome on Mac
- Firefox on Windows
- Safari on Mac
- Edge on Windows
- Chrome on Android
- Safari on iPhone
- Chrome on Linux
- Firefox on Mac
- Opera on Windows
- Samsung Internet
- Chrome on iPad

## 💡 Tips

- Clicks được phân bố ngẫu nhiên trong 7 ngày qua (seed-single-url) hoặc 30 ngày (seed-stats)
- IP và User Agent được chọn ngẫu nhiên
- Mỗi lần chạy sẽ thêm clicks mới (không xóa clicks cũ)
- Nếu muốn reset, xóa database và migrate lại

## 🔧 Troubleshooting

**Lỗi: "URL not found"**
- Đảm bảo shortCode đúng
- Kiểm tra URL có tồn tại: `docker exec -it docker-app-1 npx prisma studio`

**Lỗi: "Cannot find module"**
- Chạy trong container: `docker exec -it docker-app-1 npm run db:seed-url ...`
- Hoặc đảm bảo đã `npm install` trong backend folder

## 📈 Kết quả

Sau khi seed, bạn sẽ thấy:
- **Total Clicks**: Tổng số clicks
- **Recent Clicks**: Danh sách clicks gần đây
- **Clicks Over Time**: Biểu đồ 7 ngày
- **Click History**: Bảng với Time, IP Address, User Agent
