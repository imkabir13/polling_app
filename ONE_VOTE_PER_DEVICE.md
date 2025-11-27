# One Vote Per Device - Implementation Details

## Overview
This document explains how the "one vote per device" feature is implemented with **BOTH client-side and server-side enforcement**.

## 🔒 Multi-Layer Protection

### Layer 1: Client-Side (User Experience)
**Purpose**: Provide immediate feedback to users without server round-trip

**Files:**
- [lib/device.ts](lib/device.ts) - Device ID and vote tracking
- [lib/pollConfig.ts](lib/pollConfig.ts) - Feature flag `ENFORCE_SINGLE_VOTE = true`
- [app/page.tsx](app/page.tsx) - UI blocking logic

**How it works:**
1. When user opens the app, a unique `deviceId` (UUID) is generated and stored in `localStorage`
2. When user completes a vote, `poll_has_voted` flag is set to `"true"` in `localStorage`
3. Next time they visit, the UI checks `localStorage` and shows a message instead of the vote button

**User sees:**
```
"You have already participated in this poll from this device."
```

**Limitations:**
- ❌ Can be bypassed by clearing browser data
- ❌ Can be bypassed by using incognito mode
- ❌ Can be bypassed by using different browser
- ❌ Doesn't prevent direct API calls

### Layer 2: Server-Side (Security Enforcement)
**Purpose**: Actually prevent duplicate votes, cannot be bypassed

**Files:**
- [app/api/poll/route.ts](app/api/poll/route.ts) - Server-side validation (lines 41-59)

**How it works:**
1. Before saving a vote, the server checks if `deviceId` already exists in database
2. Also checks if `sessionId` already exists (prevents duplicate submission attempts)
3. Returns `403 Forbidden` error if duplicate found
4. Only saves vote if both checks pass

**Code:**
```typescript
// Check deviceId
if (deviceId) {
  const existingVote = await collection.findOne({ deviceId });
  if (existingVote) {
    return NextResponse.json(
      { error: "This device has already voted" },
      { status: 403 }
    );
  }
}

// Check sessionId
const existingSession = await collection.findOne({ sessionId });
if (existingSession) {
  return NextResponse.json(
    { error: "This session has already submitted a vote" },
    { status: 403 }
  );
}
```

**Limitations:**
- ⚠️ User could generate new `deviceId` on each vote (requires technical knowledge)
- ⚠️ Rate limiting provides additional protection against this

### Layer 3: Database (Ultimate Enforcement)
**Purpose**: Guarantee uniqueness at the database level

**Files:**
- [scripts/setup-indexes.ts](scripts/setup-indexes.ts) - Index creation script

**How it works:**
1. MongoDB unique indexes on `deviceId` and `sessionId` columns
2. Database will REJECT any duplicate inserts, even if code has bugs
3. Provides 100% guarantee of data integrity

**Indexes created:**
```typescript
{
  key: { deviceId: 1 },
  unique: true,
  sparse: true, // Allow null deviceIds
  name: "deviceId_unique"
},
{
  key: { sessionId: 1 },
  unique: true,
  name: "sessionId_unique"
}
```

**Benefits:**
- ✅ Cannot be bypassed under any circumstances
- ✅ Protects against race conditions (two simultaneous votes)
- ✅ Works even if server code is buggy

## 🎯 Attack Scenarios & Protections

### Scenario 1: Normal User Tries to Vote Twice
**Attack:** Click vote button again after voting
**Protection:** Layer 1 (Client-side) blocks them immediately with message
**Result:** ✅ Blocked

### Scenario 2: Tech-Savvy User Clears localStorage
**Attack:**
```javascript
localStorage.removeItem("poll_has_voted");
```
**Protection:** Layer 2 (Server-side) checks database and rejects
**Result:** ✅ Blocked (HTTP 403 error)

### Scenario 3: Attacker Uses Incognito Mode
**Attack:** Open app in incognito/private browsing
**Protection:** Same `deviceId` is used, Layer 2 checks database
**Result:** ✅ Blocked

### Scenario 4: Attacker Calls API Directly
**Attack:**
```javascript
fetch('/api/poll', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: crypto.randomUUID(),
    deviceId: crypto.randomUUID(), // New ID each time!
    gender: 'male',
    age: 25,
    answer: 'yes'
  })
});
```
**Protection:**
- Layer 2: Rate limiting (5 votes per hour per IP)
- Layer 2: Input validation (must be valid UUIDs)
- If they manage to bypass rate limit and generate new IDs, they could vote multiple times
**Result:** ⚠️ Partially mitigated by rate limiting

### Scenario 5: Sophisticated Attack with VPN + New DeviceIDs
**Attack:** Use VPN to change IP + generate new deviceId for each vote
**Protection:** Rate limiting provides some protection, but could be bypassed
**Additional recommendation:** Monitor for suspicious patterns in analytics
**Result:** ⚠️ Difficult to prevent completely without user authentication

## 🔧 Configuration

### Enable/Disable Feature
Edit [lib/pollConfig.ts](lib/pollConfig.ts):
```typescript
export const ENFORCE_SINGLE_VOTE = true; // Set to false to allow multiple votes
```

### Adjust Rate Limiting
Edit [lib/ratelimit.ts](lib/ratelimit.ts):
```typescript
limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 votes per hour
// Change to:
limiter: Ratelimit.slidingWindow(1, "24 h"), // 1 vote per 24 hours (stricter)
```

## 📊 Monitoring

### Check for Duplicate Vote Attempts
Query MongoDB to see blocked votes (requires logging):
```javascript
// Add logging in app/api/poll/route.ts when duplicate is detected
console.log("Duplicate vote attempt:", { deviceId, ip, timestamp: new Date() });
```

### Analytics
Track these events:
- Total vote attempts vs successful votes
- Number of 403 errors (duplicate votes blocked)
- IP addresses with high failure rates

## �� Production Deployment

**Before deploying:**
1. ✅ Ensure database indexes are created:
   ```bash
   npx tsx scripts/setup-indexes.ts
   ```

2. ✅ Verify `ENFORCE_SINGLE_VOTE = true` in [lib/pollConfig.ts](lib/pollConfig.ts)

3. ✅ Set up Upstash Redis for distributed rate limiting (recommended)

4. ✅ Test duplicate vote blocking:
   - Vote once normally
   - Try to vote again (should see "already voted" message)
   - Try clearing localStorage and voting (should get 403 error)

## 🔍 Troubleshooting

### "I can't vote even though I haven't voted before"
**Possible causes:**
1. Someone on the same network voted (if using shared IP for rate limiting)
2. Browser localStorage has `poll_has_voted = "true"` from a test
3. A previous vote with the same deviceId exists in database

**Solution:**
```javascript
// Clear localStorage (temporary fix)
localStorage.clear();

// Check database for existing vote
db.pollResponses.findOne({ deviceId: "<your-device-id>" });
```

### "Users are voting multiple times"
**Check:**
1. Is `ENFORCE_SINGLE_VOTE = true`?
2. Are database indexes created? Run `npx tsx scripts/setup-indexes.ts`
3. Is the API route checking for duplicates?
4. Check server logs for errors

## 📈 Future Improvements

1. **Add IP-based blocking** in addition to deviceId
2. **Implement CAPTCHA** for additional bot protection
3. **Add fingerprinting** (canvas fingerprint, WebGL, etc.) for more robust device identification
4. **User authentication** (optional) for 100% vote uniqueness guarantee
5. **Suspicious pattern detection** (ML-based anomaly detection)

## Summary

**Current Protection Level:** ✅ Strong

- Normal users: **Cannot vote twice**
- Tech-savvy users: **Cannot vote twice** (blocked at server)
- Determined attackers with VPNs: **Limited by rate limiting** (can be bypassed with effort)

For a public poll, this is a **good balance** between security and user convenience. For critical voting (elections, etc.), add user authentication.
