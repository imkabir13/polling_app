# Security Setup Guide

## Overview
This document explains the security features implemented in the polling application.

## ✅ Implemented Security Features

### 1. Input Validation (NoSQL Injection Prevention)
- **What it does**: Validates all user input before storing in MongoDB
- **Technology**: Zod schema validation
- **Location**: `app/api/poll/route.ts`
- **Protects against**: NoSQL injection, invalid data, malicious payloads

### 2. Rate Limiting
- **What it does**: Limits votes to 5 per hour per IP address
- **Technology**: Upstash Ratelimit (with in-memory fallback)
- **Location**: `lib/ratelimit.ts`, `app/api/poll/route.ts`
- **Protects against**: Vote stuffing, DoS attacks, spam

### 3. Server-Side Vote Enforcement (One Vote Per Device)
- **What it does**: Enforces one vote per device at the database level
- **Technology**: MongoDB unique indexes + server-side validation
- **Location**: `app/api/poll/route.ts` (lines 41-59)
- **Database indexes**: Created via `scripts/setup-indexes.ts`
- **Protects against**:
  - Users clearing localStorage and voting again
  - Direct API calls bypassing the frontend
  - Multiple votes from same device/session
- **How it works**:
  - **Client-side**: Checks `localStorage` to show friendly UI message
  - **Server-side**: Queries database for existing `deviceId` or `sessionId`
  - **Database**: Unique indexes on `deviceId` and `sessionId` prevent duplicates

### 4. Secure MongoDB Connection
- **What it does**: Uses secure TLS connection without insecure flags
- **Location**: `lib/mongodb.ts`
- **Protects against**: Man-in-the-middle attacks

## 🔧 Production Setup Required

### Setting up Redis for Rate Limiting (Production)

For production, you should use Upstash Redis for distributed rate limiting:

1. **Create Upstash Account**
   - Go to https://upstash.com
   - Sign up for free account
   - Create a new Redis database

2. **Get Your Credentials**
   - Copy `UPSTASH_REDIS_REST_URL`
   - Copy `UPSTASH_REDIS_REST_TOKEN`

3. **Add to Vercel Environment Variables**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add:
     ```
     UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
     UPSTASH_REDIS_REST_TOKEN=your-token-here
     ```

4. **Redeploy**
   - Push your code to trigger a new deployment
   - Rate limiting will now work across all Vercel instances

### Without Redis (Development Only)
The app uses in-memory rate limiting as fallback. This works fine for development but **NOT recommended for production** because:
- Each Vercel serverless function has its own memory
- Rate limits won't be shared across instances
- Limits can be easily bypassed

## 📝 Current Configuration

### Rate Limits
- **Vote Endpoint**: 5 votes per hour per IP
- **Window**: 1 hour sliding window

To change these limits, edit `lib/ratelimit.ts`:
```typescript
limiter: Ratelimit.slidingWindow(5, "1 h"), // Change numbers here
```

### Input Validation Rules
- **sessionId**: Must be valid UUID v4
- **deviceId**: Must be valid UUID v4 or null
- **gender**: Must be exactly "male" or "female"
- **age**: Must be integer between 17-120
- **answer**: Must be exactly "yes" or "no"

To modify, edit the schema in `app/api/poll/route.ts`:
```typescript
const VoteSchema = z.object({
  // ... modify here
});
```

## 🚨 TODO: Additional Security Recommendations

### High Priority
1. **Add Authentication** for admin routes (`/admin`, `/api/analytics/*`)
2. **Implement CSRF Protection** on all POST endpoints
3. **Add Security Headers** in `next.config.ts`

### Medium Priority
1. **Create MongoDB Indexes** for better performance and query optimization
2. **Implement Server-Side Vote Enforcement** (check deviceId in database)
3. **Add Logging/Monitoring** for security events

### Low Priority
1. **Add Privacy Policy** and Terms of Service
2. **Implement Data Deletion** capabilities (GDPR compliance)
3. **Consider IP Anonymization** for better privacy

## 🔍 Testing Security Features

### Test Rate Limiting (Local)
```bash
# Run multiple requests quickly (should get 429 after 5 votes)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/poll \
    -H "Content-Type: application/json" \
    -d '{
      "sessionId": "'$(uuidgen)'",
      "gender": "male",
      "age": 25,
      "answer": "yes"
    }'
done
```

### Test Input Validation
```bash
# Invalid age (should return 400 error)
curl -X POST http://localhost:3000/api/poll \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'$(uuidgen)'",
    "gender": "male",
    "age": 999,
    "answer": "yes"
  }'

# Invalid gender (should return 400 error)
curl -X POST http://localhost:3000/api/poll \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'$(uuidgen)'",
    "gender": "invalid",
    "age": 25,
    "answer": "yes"
  }'
```

## 📖 References

- [Zod Documentation](https://zod.dev/)
- [Upstash Ratelimit](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
