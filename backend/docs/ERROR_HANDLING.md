# Error Handling Documentation

## Overview

Hệ thống sử dụng comprehensive error handling với các custom error classes, proper logging, và informative error responses.

---

## Error Classes Hierarchy

```
AppError (Base Class)
├── ValidationError (400)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
├── ConflictError (409)
├── RateLimitError (429)
├── UnprocessableEntityError (422)
├── DatabaseError (500)
└── ExternalServiceError (503)
```

---

## Error Response Format

### Success Response:
```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response:
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "statusCode": 400,
  "timestamp": "2026-05-02T14:35:00.000Z"
}
```

### Error Response with Details (Development Mode):
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "statusCode": 400,
  "timestamp": "2026-05-02T14:35:00.000Z",
  "path": "/api/auth/register",
  "method": "POST",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  },
  "stack": [
    "Error: Invalid email format",
    "at ValidationError (/path/to/customErrors.js:13:12)",
    "..."
  ]
}
```

---

## Error Types & HTTP Status Codes

### 400 - Bad Request (Validation Error)
**When to use:** Invalid input data, validation failed

```javascript
throw new ValidationError('Password must be at least 6 characters long', {
  field: 'password',
  message: 'Too short'
});
```

**Example Response:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Password must be at least 6 characters long",
  "statusCode": 400,
  "details": {
    "field": "password",
    "message": "Too short"
  }
}
```

---

### 401 - Unauthorized (Authentication Error)
**When to use:** Invalid credentials, missing token, expired token

```javascript
throw new AuthenticationError('Invalid email or password');
```

**Example Response:**
```json
{
  "error": "AUTHENTICATION_ERROR",
  "message": "Invalid email or password",
  "statusCode": 401
}
```

---

### 403 - Forbidden (Authorization Error)
**When to use:** User authenticated but not authorized to access resource

```javascript
throw new AuthorizationError('You do not have permission to delete this URL');
```

---

### 404 - Not Found
**When to use:** Resource not found

```javascript
throw new NotFoundError('User', '123');
// or
throw new NotFoundError('Endpoint');
```

**Example Response:**
```json
{
  "error": "NOT_FOUND_ERROR",
  "message": "User not found: 123",
  "statusCode": 404
}
```

---

### 409 - Conflict (Duplicate/Constraint Error)
**When to use:** Email already exists, duplicate key, constraint violation

```javascript
throw new ConflictError('This email is already registered');
```

**Example Response:**
```json
{
  "error": "CONFLICT_ERROR",
  "message": "This email is already registered",
  "statusCode": 409
}
```

---

### 422 - Unprocessable Entity
**When to use:** Business logic error (e.g., invalid state transition)

```javascript
throw new UnprocessableEntityError('Cannot delete URL that is still active');
```

---

### 429 - Too Many Requests (Rate Limit)
**When to use:** Rate limit exceeded

```javascript
throw new RateLimitError('Too many login attempts. Try again in 60 seconds', 60);
```

**Response Headers:**
```
Retry-After: 60
```

**Example Response:**
```json
{
  "error": "RATE_LIMIT_ERROR",
  "message": "Too many requests, please try again later",
  "statusCode": 429,
  "retryAfter": 60
}
```

---

### 500 - Internal Server Error
**When to use:** Unhandled errors, database errors

```javascript
throw new DatabaseError('Database connection failed', originalError);
throw new ExternalServiceError('Email Service', 'Connection timeout');
```

**Example Response:**
```json
{
  "error": "DATABASE_ERROR",
  "message": "Database error occurred",
  "statusCode": 500
}
```

---

## How to Use in Controllers

### Using asyncHandler for Automatic Error Handling:

```javascript
// controllers/authController.js
const { asyncHandler, ValidationError } = require('../middlewares/errorHandler');

exports.register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email) {
    throw new ValidationError('Email is required');
  }
  
  const user = await AuthService.registerUser(email, password);
  
  res.status(201).json({
    message: 'User registered',
    user
  });
});
```

**Benefits of asyncHandler:**
- Automatically catches errors
- Passes them to error handler middleware
- No need for try-catch blocks
- Cleaner code

### Manual Error Handling:

```javascript
// If you need to handle specific errors differently
exports.someRoute = asyncHandler(async (req, res) => {
  try {
    // ...
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictError('Email already exists');
    }
    throw error; // Re-throw for error handler
  }
});
```

---

## Handling Prisma Errors

Prisma errors are automatically converted to appropriate HTTP errors:

```javascript
// Prisma Error Codes:
P2002 - Unique constraint violation
P2025 - Record not found
P2003 - Foreign key constraint failed
P2014 - Required relation violation

// Automatic conversion:
P2002 → ConflictError (409)
P2025 → NotFoundError (404)
P2003 → ValidationError (400)
P2014 → ConflictError (409)
```

Example:
```javascript
// If email exists in database
await prisma.user.create({ email: 'duplicate@test.com' });
// Automatically throws: ConflictError 409
```

---

## Handling JWT Errors

JWT errors are automatically converted:

```javascript
// JWT Error Names:
JsonWebTokenError → AuthenticationError (401)
TokenExpiredError → AuthenticationError (401)

// Example:
// If token is invalid: throw AuthenticationError
// If token expired: throw AuthenticationError
```

---

## Logging Strategy

### Log Levels:

**ERROR (5xx, unhandled):**
```
[ERROR] 2026-05-02T14:35:00.000Z - [GET /api/data]
Method: GET | Path: /api/data
Error: Database connection failed
Stack: Error: Connection refused...
```

**WARN (4xx, expected):**
```
[WARN] 2026-05-02T14:35:00.000Z - JWT Error: Token expired
```

**INFO (success):**
```
[INFO] 2026-05-02T14:35:00.000Z - User registered successfully
```

### Development Mode:
- Full stack traces
- Request details (method, path)
- Error details (field, message)

### Production Mode:
- Error messages only (no sensitive info)
- No stack traces
- No request details

---

## Best Practices

### 1. Always Use Custom Errors:
```javascript
// ✅ Good
throw new ValidationError('Invalid email');

// ❌ Bad
throw new Error('Invalid email');
```

### 2. Provide Context:
```javascript
// ✅ Good
throw new NotFoundError('User', userId);

// ❌ Bad
throw new NotFoundError();
```

### 3. Use asyncHandler in Routes:
```javascript
// ✅ Good
router.post('/register', asyncHandler(authController.register));

// ❌ Bad
router.post('/register', authController.register);
```

### 4. Catch and Re-throw Appropriately:
```javascript
// ✅ Good
try {
  await service.doSomething();
} catch (error) {
  if (error.code === 'SPECIFIC_CODE') {
    throw new SpecificError(error.message);
  }
  throw error; // Let error handler handle it
}
```

### 5. Validate Input Early:
```javascript
// ✅ Good
if (!email) throw new ValidationError('Email required');

// ❌ Bad
// Try to use email that might not exist
```

---

## Testing Error Scenarios

### Test Cases:

```bash
# 1. Valid Request
curl -X POST http://localhost:3001/api/auth/register \
  -d '{"email":"user@test.com","password":"Pass123","confirmPassword":"Pass123"}'
# Expected: 201 Created

# 2. Invalid Email
curl -X POST http://localhost:3001/api/auth/register \
  -d '{"email":"invalid","password":"Pass123","confirmPassword":"Pass123"}'
# Expected: 400 ValidationError

# 3. Email Exists
curl -X POST http://localhost:3001/api/auth/register \
  -d '{"email":"user@test.com","password":"Pass123","confirmPassword":"Pass123"}'
# Expected: 409 ConflictError

# 4. Invalid Token
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer invalid-token"
# Expected: 401 AuthenticationError

# 5. No Token
curl -X GET http://localhost:3001/api/auth/me
# Expected: 401 AuthenticationError

# 6. Not Found Endpoint
curl -X GET http://localhost:3001/api/nonexistent
# Expected: 404 NotFoundError
```

---

## Integration with Frontend

### Handle Errors on Frontend:

```javascript
// React example
async function login(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      
      switch (error.statusCode) {
        case 400:
          setErrorMessage('Invalid input: ' + error.message);
          break;
        case 401:
          setErrorMessage('Invalid email or password');
          break;
        case 429:
          setErrorMessage(`Too many attempts. Try again in ${error.retryAfter}s`);
          break;
        default:
          setErrorMessage('An error occurred');
      }
      return;
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
  } catch (error) {
    setErrorMessage('Network error: ' + error.message);
  }
}
```

---

## Monitoring & Alerting

### Error Rate Monitoring:
```bash
# Track error rates per endpoint
# Alert if error rate > 5% on production
```

### Critical Errors:
```bash
# Alert on any 500 errors
# Alert on DATABASE_ERROR
# Alert on EXTERNAL_SERVICE_ERROR
```

---

## Future Enhancements

- [ ] Add error rate limiting and alerting
- [ ] Implement error analytics
- [ ] Add structured logging (JSON format)
- [ ] Implement error recovery strategies
- [ ] Add circuit breaker for external services
- [ ] Implement error trace ID for debugging

