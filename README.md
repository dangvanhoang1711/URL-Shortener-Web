# 🔗 URL Shortener System (Bitly-like)

<p align="center">
  🚀 Modern URL Shortener built with Node.js, React & Redis  
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Node.js-green" />
  <img src="https://img.shields.io/badge/Frontend-React-blue" />
  <img src="https://img.shields.io/badge/Database-MySQL-orange" />
  <img src="https://img.shields.io/badge/Cache-Redis-red" />
  <img src="https://img.shields.io/badge/ORM-Prisma-purple" />
</p>

---

## 📌 Tổng quan

Hệ thống **URL Shortener (giống Bitly)** cho phép:

- 🔗 Rút gọn URL dài
- 🔁 Redirect nhanh
- 📊 Thống kê click (analytics)
- ⚡ Tối ưu hiệu năng bằng Redis

---

## 🎯 Mục tiêu hệ thống

- Xây dựng kiến trúc web hiện đại (Frontend - Backend - DB - Cache)
- Đảm bảo:
  - Hiệu năng cao
  - Khả năng mở rộng
  - Dễ bảo trì

---

## 🧠 Kiến trúc hệ thống

```mermaid
flowchart LR
    User[👤 User] -->|Request| Frontend["⚛️ React (Vite)"]
    Frontend -->|API| Backend["🚀 Express (Node.js)"]
    Backend --> DB[(🗄️ MySQL + Prisma)]
    Backend --> Cache[(⚡ Redis)]

    Note["📌 Cache giúp tăng tốc redirect và giảm tải DB"]

    DB --- Note
    Cache --- Note