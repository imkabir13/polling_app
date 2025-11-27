# User Error Messages - Complete Reference

This document shows all error messages that users can see in the polling application.

## 📱 Error Messages Users Will See

### 1. Rate Limiting Error
**When:** User tries to vote more than 5 times in 1 hour from the same IP

**Backend:** [app/api/poll/route.ts:26](app/api/poll/route.ts#L26)
```json
{
  "error": "Too many votes. Please try again later."
}
```

**Frontend Display:** [app/poll/PollPageContent.tsx:153](app/poll/PollPageContent.tsx#L153)
```
Alert popup: "Too many votes. Please try again later."
```

**HTTP Status:** 429 (Too Many Requests)

---

### 2. Duplicate Device Error (Server-Side Protection)
**When:** User tries to vote again from same device (bypassing localStorage check)

**Backend:** [app/api/poll/route.ts:46](app/api/poll/route.ts#L46)
```json
{
  "error": "This device has already voted"
}
```

**Frontend Display:** [app/poll/PollPageContent.tsx:153](app/poll/PollPageContent.tsx#L153)
```
Alert popup: "This device has already voted"
```

**HTTP Status:** 403 (Forbidden)

---

### 3. Duplicate Session Error
**When:** Same session tries to submit a vote twice (rare, usually a bug or attack)

**Backend:** [app/api/poll/route.ts:56](app/api/poll/route.ts#L56)
```json
{
  "error": "This session has already submitted a vote"
}
```

**Frontend Display:** [app/poll/PollPageContent.tsx:153](app/poll/PollPageContent.tsx#L153)
```
Alert popup: "This session has already submitted a vote"
```

**HTTP Status:** 403 (Forbidden)

---

### 4. Invalid Input Error
**When:** User submits invalid data (invalid age, gender, or answer)

**Backend:** [app/api/poll/route.ts:85](app/api/poll/route.ts#L85)
```json
{
  "error": "Invalid input data",
  "details": [/* Zod validation errors */]
}
```

**Frontend Display:** [app/poll/PollPageContent.tsx:153](app/poll/PollPageContent.tsx#L153)
```
Alert popup: "Invalid input data"
```

**HTTP Status:** 400 (Bad Request)

**Examples of invalid input:**
- Age < 17 or > 120
- Gender not "male" or "female"
- Answer not "yes" or "no"
- sessionId not a valid UUID

---

### 5. Already Voted (Client-Side Warning)
**When:** User tries to start voting after already voting (localStorage check)

**Frontend:** [app/page.tsx:161-163](app/page.tsx#L161-L163)
```tsx
"You have already participated in this poll from this device."
```

**Display:** Yellow warning box on home page
**Note:** This is a friendly UX message, NOT an error. The real enforcement is server-side.

---

### 6. Generic Network/Server Error
**When:** Network failure, server down, or unexpected error

**Frontend:** [app/poll/PollPageContent.tsx:152](app/poll/PollPageContent.tsx#L152)
```
Alert popup: "Something went wrong. Please try again."
```

**This shows when:**
- Network connection fails
- Server returns an error without a message
- Any unexpected exception

---

## 🎨 Error Display Methods

### Alert Popup (Current)
All errors currently show as browser `alert()` popups:

```typescript
alert(errorMessage);
```

**Pros:**
- Simple, works everywhere
- User must acknowledge

**Cons:**
- Not styled
- Blocks the page
- Can't be customized

### Recommendation: Toast/Banner (Future Improvement)

Consider replacing alerts with:
1. **Toast notifications** (temporary message at top/bottom)
2. **Error banner** (red bar with message)
3. **Modal dialog** (styled popup)

**Example with toast:**
```tsx
// Instead of: alert(errorMessage);
// Use: showToast(errorMessage, 'error');
```

---

## 🌍 Language Considerations

### Current Status
- **UI Text:** Bengali (বাংলা)
- **Error Messages:** English

**Examples:**
- Button: "ভোট প্রদান করুন" (Bengali)
- Error: "This device has already voted" (English)

### Recommendation: Translate Errors to Bengali

Update backend error messages:

**Before:**
```typescript
{ error: "This device has already voted" }
```

**After:**
```typescript
{ error: "এই ডিভাইস থেকে ইতিমধ্যে ভোট দেওয়া হয়েছে" }
```

**Full Translation Table:**

| English | Bengali (বাংলা) |
|---------|----------------|
| Too many votes. Please try again later. | অনেক বার ভোট দেওয়া হয়েছে। পরে আবার চেষ্টা করুন। |
| This device has already voted | এই ডিভাইস থেকে ইতিমধ্যে ভোট দেওয়া হয়েছে |
| This session has already submitted a vote | এই সেশন থেকে ইতিমধ্যে ভোট জমা দেওয়া হয়েছে |
| Invalid input data | অবৈধ তথ্য প্রদান করা হয়েছে |
| Something went wrong. Please try again. | কিছু ভুল হয়েছে। আবার চেষ্টা করুন। |

---

## 🧪 Testing Error Messages

### Test Rate Limiting
```bash
# Vote 6 times quickly (6th will fail with rate limit)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/poll \
    -H "Content-Type: application/json" \
    -d '{
      "sessionId": "'$(uuidgen)'",
      "deviceId": "'$(uuidgen)'",
      "gender": "male",
      "age": 25,
      "answer": "yes"
    }'
  echo ""
done
```

Expected: 6th request returns:
```json
{"error":"Too many votes. Please try again later."}
```

---

### Test Duplicate Device
```bash
# Vote once with deviceId
DEVICE_ID=$(uuidgen)
curl -X POST http://localhost:3000/api/poll \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'$(uuidgen)'",
    "deviceId": "'$DEVICE_ID'",
    "gender": "male",
    "age": 25,
    "answer": "yes"
  }'

# Try to vote again with SAME deviceId
curl -X POST http://localhost:3000/api/poll \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'$(uuidgen)'",
    "deviceId": "'$DEVICE_ID'",
    "gender": "male",
    "age": 25,
    "answer": "yes"
  }'
```

Expected: 2nd request returns:
```json
{"error":"This device has already voted"}
```

---

### Test Invalid Input
```bash
# Invalid age (999)
curl -X POST http://localhost:3000/api/poll \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'$(uuidgen)'",
    "deviceId": "'$(uuidgen)'",
    "gender": "male",
    "age": 999,
    "answer": "yes"
  }'
```

Expected:
```json
{
  "error": "Invalid input data",
  "details": [
    {
      "code": "too_big",
      "maximum": 120,
      "path": ["age"],
      "message": "Number must be less than or equal to 120"
    }
  ]
}
```

---

## 📊 Error Tracking (Future)

Consider logging these errors for analytics:

```typescript
// Track when rate limit is hit
if (!success) {
  logSecurityEvent({
    type: "rate_limit_exceeded",
    ip,
    timestamp: new Date()
  });
}

// Track duplicate vote attempts
if (existingVote) {
  logSecurityEvent({
    type: "duplicate_device_attempt",
    deviceId,
    ip,
    timestamp: new Date()
  });
}
```

This helps identify:
- Attack patterns
- Users confused about voting rules
- Technical issues causing false duplicates

---

## Summary

**Total Error Types:** 6
- 3 Security-related (rate limit, duplicate device, duplicate session)
- 1 Validation-related (invalid input)
- 1 Client-side warning (already voted message)
- 1 Generic fallback (network/server error)

**Display Method:** Browser `alert()` popups
**Language:** English (recommend translating to Bengali)
**Files Modified:**
- Backend: [app/api/poll/route.ts](app/api/poll/route.ts)
- Frontend: [app/poll/PollPageContent.tsx](app/poll/PollPageContent.tsx)
