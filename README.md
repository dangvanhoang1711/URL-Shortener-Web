# 🔗 URL Shortener Web

<p align="center">
  <strong>A modern URL shortening service built with Node.js and React</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20.x-green?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/React-18.x-blue?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/MySQL-8.0-orange?style=flat-square&logo=mysql" />
  <img src="https://img.shields.io/badge/Redis-Alpine-red?style=flat-square&logo=redis" />
  <img src="https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker" />
</p>

---

## ✨ Features

- 🔗 **URL Shortening** - Convert long URLs into short, shareable links
- 🎲 **Random Short Codes** - Secure 7-character alphanumeric codes
- 🚀 **Fast Redirects** - Redis caching for optimal performance
- 📊 **Analytics** - Track clicks and view statistics
- 🔐 **Authentication** - Secure user accounts with JWT
- 📱 **Responsive Design** - Works seamlessly on all devices

---

## 🛠️ Tech Stack

**Frontend:** React, Bootstrap 5, Vite  
**Backend:** Node.js, Express, Prisma ORM  
**Database:** MySQL 8.0  
**Cache:** Redis  
**Deployment:** Docker & Docker Compose

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                         User                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React)                       │
│              Bootstrap 5 + Vite                         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ▼
┌──────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)             │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │   Auth   │  │   URL    │  │Analytics │            │
│  │ Service  │  │ Service  │  │ Service  │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└────────┬───────────────────────────┬─────────────────┘
         │                           │
         ▼                           ▼
┌──────────────────┐        ┌──────────────────┐
│  Redis Cache     │        │  MySQL Database  │
│                  │        │   (Prisma ORM)   │
│  • Short codes   │        │                  │
│  • Fast lookup   │        │  • Users         │
│  • TTL: 1 hour   │        │  • URLs          │
│                  │        │  • Clicks        │
└──────────────────┘        └──────────────────┘
```

### Request Flow

**Shortening URL:**
```
User → React UI → Express API → Validate → Generate Code → MySQL → Return Short URL
```

**Redirecting:**
```
User → /:shortCode → Check Redis → (Hit) → Redirect
                          ↓
                       (Miss) → Query MySQL → Update Redis → Redirect
```

---

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/dangvanhoang1711/URL-Shortener-Web.git
cd URL-Shortener-Web

# Start application
cd docker
docker-compose up -d

# Access at http://localhost:3000
```

### Manual Setup

**Backend:**
```bash
cd backend
npm install
npx prisma migrate deploy
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 💻 Usage

1. **Register/Login** to your account
2. **Enter a URL** to shorten
3. **Copy** the generated short link
4. **View analytics** in your dashboard

---

## 🔒 Security Features

- ✅ Strict URL validation
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Password hashing with Bcrypt
- ✅ SQL injection prevention

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### URL Operations
- `POST /api/urls/shorten` - Create short URL
- `GET /api/urls/history` - Get user's URLs
- `GET /api/urls/stats/:shortCode` - Get URL statistics
- `GET /:shortCode` - Redirect to original URL

---

## 🎭 Demo Data

Seed fake analytics data for testing:

```bash
# Seed all URLs
docker exec -it docker-app-1 npm run db:seed-stats

# Seed specific URL
docker exec -it docker-app-1 npm run db:seed-url <shortCode> [count]
```

---

## 🐳 Docker Services

- **App** - Node.js application (Port 3000)
- **MySQL** - Database (Port 3307)
- **Redis** - Cache (Port 6379)

**Commands:**
```bash
docker-compose up -d        # Start
docker-compose down         # Stop
docker-compose logs -f app  # View logs
```

---

## 📈 Performance

- **Redirect Speed:** ~5-10ms (with cache)
- **Cache Hit Rate:** >95%
- **Database Queries:** <10ms (indexed)

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ using Node.js and React
</p>
