# Authentication API Documentation

## Overview
This document describes all authentication endpoints for the URL Shortener API.

## Base URL
```
http://localhost:3001/api/auth
```

---

## Endpoints

### 1. Register User
**Endpoint:** `POST /register`

**Description:** Tạo tài khoản người dùng mới

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'
```

**Request Body:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | Email của user (phải là định dạng email hợp lệ) |
| password | string | Yes | Mật khẩu (tối thiểu 6 ký tự) |
| confirmPassword | string | Yes | Xác nhận mật khẩu (phải match với password) |

**Success Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2026-05-02T14:35:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Email hoặc password không hợp lệ
  ```json
  {
    "error": "Registration Failed",
    "message": "Invalid email format"
  }
  ```
- `400 Bad Request`: Email đã tồn tại
  ```json
  {
    "error": "Registration Failed",
    "message": "This email is already registered"
  }
  ```

---

### 2. Login User
**Endpoint:** `POST /login`

**Description:** Đăng nhập và lấy JWT token

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

**Request Body:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | Email của user |
| password | string | Yes | Mật khẩu |

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2026-05-02T14:35:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Email hoặc password không đúng
  ```json
  {
    "error": "Authentication Failed",
    "message": "Invalid email or password"
  }
  ```

**Token Usage:**
Lưu token này và gửi trong header của tất cả protected endpoints:
```bash
Authorization: Bearer <token>
```

---

### 3. Get Current User (Protected)
**Endpoint:** `GET /me`

**Description:** Lấy thông tin của user hiện tại

**Request:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <your-token>"
```

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Format: `Bearer <token>` |

**Success Response (200 OK):**
```json
{
  "message": "User information retrieved successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2026-05-02T14:35:00.000Z",
    "updatedAt": "2026-05-02T14:35:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Token không được cung cấp hoặc không hợp lệ
  ```json
  {
    "error": "Unauthorized",
    "message": "Invalid or expired token"
  }
  ```

---

### 4. Refresh Token (Protected)
**Endpoint:** `POST /refresh`

**Description:** Làm mới JWT token

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Authorization: Bearer <your-token>"
```

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Format: `Bearer <token>` |

**Success Response (200 OK):**
```json
{
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized`: Token không hợp lệ

---

### 5. Logout (Public)
**Endpoint:** `POST /logout`

**Description:** Đăng xuất (xoá token từ client side)

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/logout
```

**Success Response (200 OK):**
```json
{
  "message": "Logout successful. Please remove the token from your client."
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication failed |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## Token Information

### JWT Token Structure
Token được tạo bằng HS256 algorithm và chứa:
- **Header**: `{ "alg": "HS256", "typ": "JWT" }`
- **Payload**: `{ "userId": 1, "email": "user@example.com", "iat": ..., "exp": ... }`
- **Signature**: Được ký bằng JWT_SECRET

### Token Expiration
- Mặc định: 7 ngày (có thể cấu hình qua JWT_EXPIRE trong .env)
- Khi token hết hạn, phải gọi `/login` lại để lấy token mới

### Token Storage (Frontend)
```javascript
// Lưu token vào localStorage
localStorage.setItem('authToken', token);

// Lấy token khi gọi API
const token = localStorage.getItem('authToken');

// Gửi token trong header
fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Xoá token khi logout
localStorage.removeItem('authToken');
```

---

## Examples

### Register và Login Complete Flow

```bash
# 1. Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "MyPassword123",
    "confirmPassword": "MyPassword123"
  }'

# Response: User registered successfully

# 2. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "MyPassword123"
  }'

# Response: Token nhận được

# 3. Use token to access protected route
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <your-token-here>"

# Response: User info retrieved
```

### Protected Endpoint Example

```javascript
// Frontend - Request with Token
async function getUserInfo(token) {
  const response = await fetch('http://localhost:3001/api/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('User:', data.user);
  } else {
    console.error('Error:', response.status);
  }
}
```

---

## Common Issues

### Issue: "Invalid token" Error
**Solution:** 
- Kiểm tra token được gửi đúng format `Bearer <token>`
- Token có thể đã hết hạn, cần login lại
- JWT_SECRET trong .env có thể sai

### Issue: "Email already registered"
**Solution:**
- Dùng email khác khi register
- Hoặc login với email đó nếu đã có tài khoản

### Issue: "Invalid email or password"
**Solution:**
- Kiểm tra email và password chính xác
- Email phải tồn tại trong database

---

## Testing with Postman

1. **Create new Collection**: "URL Shortener Auth"
2. **Create new Environment** với variable:
   ```
   base_url = http://localhost:3001
   token = (sẽ được cập nhật sau login)
   ```
3. **Add requests**:
   - POST {{base_url}}/api/auth/register
   - POST {{base_url}}/api/auth/login
   - GET {{base_url}}/api/auth/me (with Authorization header)
   - POST {{base_url}}/api/auth/refresh (with Authorization header)

4. **Script trong Login request** (để tự động save token):
   ```javascript
   pm.environment.set('token', pm.response.json().token);
   ```

---

## Security Notes

1. **Token không bao giờ lưu vào server** - JWT là stateless
2. **Password luôn được hash** - Không bao giờ lưu plaintext password
3. **HTTPS recommended** - Sử dụng HTTPS trong production để bảo vệ token
4. **Logout trên client-side** - Frontend xoá token từ localStorage khi logout
5. **Environment variables** - JWT_SECRET phải được bảo vệ và không commit vào repo

