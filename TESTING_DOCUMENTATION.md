# Testing Documentation - Polling Application

## Overview
This document outlines comprehensive test cases for the polling application, covering UI, API, security, and integration testing. Use this as a reference for implementing automated tests using Cypress or other testing frameworks.

---

## Table of Contents
1. [UI Testing](#ui-testing)
2. [API Testing](#api-testing)
3. [Security Testing](#security-testing)
4. [Integration Testing](#integration-testing)
5. [Performance Testing](#performance-testing)
6. [Error Handling Testing](#error-handling-testing)

---

## UI Testing

### Home Page Tests

#### TC-UI-001: Home Page Load
- **Description**: Verify home page loads successfully
- **Steps**:
  1. Navigate to `/`
  2. Verify page loads without errors
- **Expected Result**:
  - Page displays without errors
  - Question card is visible
  - CTA button "আপনার মতামত দিন" is visible
  - Poll results pie chart is visible

#### TC-UI-002: Question Card Display
- **Description**: Verify question card content
- **Steps**:
  1. Navigate to `/`
  2. Locate question card component
- **Expected Result**:
  - Title: "জনমত জরিপে আপনার মতামত দিন"
  - Main question is displayed
  - All 4 proposals (ক, খ, গ, ঘ) are visible
  - Disclaimer text is visible: "বিশেষ দ্রষ্টব্য: এই জনমত জরিপ বাংলাদেশ নির্বাচন কমিশন কর্তৃক ঘোষিত বা পরিচালিত আনুষ্ঠানিক ভোট নয়।"

#### TC-UI-003: CTA Button Functionality
- **Description**: Verify "আপনার মতামত দিন" button opens user info modal
- **Steps**:
  1. Navigate to `/`
  2. Click "আপনার মতামত দিন" button
- **Expected Result**:
  - User info modal opens
  - Modal contains gender selection buttons
  - Modal contains age input field
  - Modal contains "ভোট শুরু করুন" and "বাতিল করুন" buttons

#### TC-UI-004: Poll Results Pie Chart
- **Description**: Verify pie chart displays vote statistics
- **Steps**:
  1. Navigate to `/`
  2. Locate pie chart component
- **Expected Result**:
  - Pie chart is visible
  - Shows "Yes" and "No" vote counts
  - Chart updates when new votes are submitted

### User Info Modal Tests

#### TC-UI-005: Gender Selection
- **Description**: Verify gender selection functionality
- **Steps**:
  1. Open user info modal
  2. Click "পুরুষ" button
  3. Verify button state changes
  4. Click "মহিলা" button
  5. Verify button state changes
- **Expected Result**:
  - Selected gender button shows active state (green background)
  - Only one gender can be selected at a time
  - Unselected button shows inactive state (gray background)

#### TC-UI-006: Age Input Validation
- **Description**: Verify age input accepts only valid values
- **Steps**:
  1. Open user info modal
  2. Try entering letters in age field
  3. Try entering age < 16
  4. Try entering age > 120
  5. Try entering valid age (e.g., 25)
- **Expected Result**:
  - Only numeric input is accepted
  - Age < 16 shows error: "You are under 16."
  - Age > 120 shows error: "Please add valid age."
  - Valid age (16-120) shows no error
  - Age field accepts maximum 3 digits

#### TC-UI-007: Start Poll Button State
- **Description**: Verify "ভোট শুরু করুন" button enable/disable logic
- **Steps**:
  1. Open user info modal
  2. Verify button is disabled initially
  3. Select gender only
  4. Enter valid age only
  5. Select gender AND enter valid age
- **Expected Result**:
  - Button is disabled when gender or age is missing
  - Button is disabled when age is invalid
  - Button is enabled when both gender and valid age are provided
  - Disabled button has lighter color and cursor-not-allowed

#### TC-UI-008: Modal Countdown Timer
- **Description**: Verify 2-minute countdown timer in user info modal
- **Steps**:
  1. Open user info modal
  2. Observe countdown timer
  3. Wait for countdown to reach 0
- **Expected Result**:
  - Timer starts at 120 seconds (2 minutes)
  - Timer counts down every second
  - When timer reaches 0, modal closes automatically
  - User is redirected to home page
  - Analytics event "user_info_modal_timeout" is tracked

#### TC-UI-009: Cancel Button
- **Description**: Verify "বাতিল করুন" button closes modal
- **Steps**:
  1. Open user info modal
  2. Click "বাতিল করুন" button
- **Expected Result**:
  - Modal closes
  - User remains on home page
  - Form is reset (gender and age cleared)
  - Analytics event "user_info_modal_closed" is tracked

### Poll Page Tests

#### TC-UI-010: Poll Page Load
- **Description**: Verify poll page loads with user info
- **Steps**:
  1. Complete user info modal (select gender, enter age)
  2. Click "ভোট শুরু করুন"
  3. Verify navigation to `/poll?gender=male&age=25&sessionId=...`
- **Expected Result**:
  - Page navigates to `/poll` with query parameters
  - Poll question is displayed
  - "হ্যাঁ" and "না" buttons are visible
  - "ভোট প্রদান করুন" and "ফিরে যান" buttons are visible
  - Countdown timer starts at 120 seconds

#### TC-UI-011: Vote Selection
- **Description**: Verify "হ্যাঁ" and "না" button selection
- **Steps**:
  1. Navigate to poll page
  2. Click "হ্যাঁ" button
  3. Verify button state
  4. Click "না" button
  5. Verify button state
- **Expected Result**:
  - Selected "হ্যাঁ" button shows green background
  - Selected "না" button shows red background
  - Only one option can be selected at a time
  - Unselected buttons show gray background

#### TC-UI-012: Submit Vote Button State
- **Description**: Verify "ভোট প্রদান করুন" button logic
- **Steps**:
  1. Navigate to poll page
  2. Verify button is disabled initially
  3. Select "হ্যাঁ" or "না"
  4. Verify button is enabled
- **Expected Result**:
  - Button is disabled when no vote is selected
  - Button is enabled when vote is selected
  - Button shows loading spinner and "জমা হচ্ছে..." when submitting

#### TC-UI-013: Vote Submission Loading State
- **Description**: Verify loading state during vote submission
- **Steps**:
  1. Navigate to poll page
  2. Select vote and click "ভোট প্রদান করুন"
  3. Observe button state during submission
- **Expected Result**:
  - Button shows spinner icon
  - Button text changes to "জমা হচ্ছে..."
  - Button is disabled during submission
  - User cannot submit again while loading

#### TC-UI-014: Successful Vote Submission
- **Description**: Verify success modal after vote submission
- **Steps**:
  1. Navigate to poll page
  2. Select vote and submit
  3. Wait for success response
- **Expected Result**:
  - Success modal appears with green background
  - Modal shows "Thank You!" message
  - Modal shows "Your vote has been recorded."
  - "Close" button is visible
  - After 10 seconds, auto-redirects to home page

#### TC-UI-015: Poll Page Countdown
- **Description**: Verify countdown timer on poll page
- **Steps**:
  1. Navigate to poll page
  2. Observe countdown timer
  3. Wait until < 5 seconds remain
  4. Wait until timer reaches 0
- **Expected Result**:
  - Timer starts at 120 seconds
  - When <= 5 seconds, shows warning: "Please submit within X seconds."
  - When timer reaches 0, redirects to home page
  - Analytics event "poll_question_modal_timeout" is tracked

#### TC-UI-016: Return Button
- **Description**: Verify "ফিরে যান" button functionality
- **Steps**:
  1. Navigate to poll page
  2. Click "ফিরে যান" button
- **Expected Result**:
  - Redirects to home page
  - Vote is not submitted
  - Analytics event "poll_question_modal_closed" is tracked
  - Analytics event "vote_not_submitted" is tracked with reason: "user_closed"

### Error Notification Tests

#### TC-UI-017: Error Notification Display
- **Description**: Verify error notification appears centered on home page
- **Steps**:
  1. Trigger an error (e.g., try to vote twice)
  2. Observe error notification
- **Expected Result**:
  - Error notification appears centered on page (not at top)
  - Notification has red background
  - Error icon (✕) is visible
  - Error message is displayed in Bengali
  - Close button (×) is visible

#### TC-UI-018: Error Notification Auto-Dismiss
- **Description**: Verify error notification auto-dismisses after 5 seconds
- **Steps**:
  1. Trigger an error
  2. Wait 5 seconds
- **Expected Result**:
  - Notification disappears after 5 seconds
  - Page remains on home page

#### TC-UI-019: Error Notification Manual Close
- **Description**: Verify user can manually close error notification
- **Steps**:
  1. Trigger an error
  2. Click close button (×)
- **Expected Result**:
  - Notification closes immediately
  - Page remains on home page

### Responsive Design Tests

#### TC-UI-020: Mobile Viewport
- **Description**: Verify UI works on mobile devices
- **Steps**:
  1. Set viewport to mobile (375x667)
  2. Navigate through all pages
- **Expected Result**:
  - No horizontal scrolling
  - All elements are visible and accessible
  - Buttons are large enough to tap
  - Text is readable without zooming

#### TC-UI-021: Tablet Viewport
- **Description**: Verify UI works on tablet devices
- **Steps**:
  1. Set viewport to tablet (768x1024)
  2. Navigate through all pages
- **Expected Result**:
  - Layout adapts appropriately
  - Content is centered
  - No layout breaks

#### TC-UI-022: Desktop Viewport
- **Description**: Verify UI works on desktop
- **Steps**:
  1. Set viewport to desktop (1920x1080)
  2. Navigate through all pages
- **Expected Result**:
  - Layout is centered with max-width
  - Content is readable
  - No excessive white space

---

## API Testing

### Vote Token API Tests

#### TC-API-001: Generate Vote Token - Success
- **Description**: Verify `/api/vote-token` generates valid JWT token
- **Endpoint**: `POST /api/vote-token`
- **Request Body**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "gender": "male",
  "age": "25"
}
```
- **Expected Response**:
  - Status: 200
  - Body: `{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }`
  - Token contains valid JWT structure
  - Token expires in 2 minutes

#### TC-API-002: Generate Vote Token - Invalid Gender
- **Description**: Verify token generation fails with invalid gender
- **Endpoint**: `POST /api/vote-token`
- **Request Body**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "gender": "other",
  "age": "25"
}
```
- **Expected Response**:
  - Status: 400
  - Body: `{ "error": "Invalid request data" }`

#### TC-API-003: Generate Vote Token - Invalid SessionId
- **Description**: Verify token generation fails with invalid UUID
- **Endpoint**: `POST /api/vote-token`
- **Request Body**:
```json
{
  "sessionId": "invalid-uuid",
  "gender": "male",
  "age": "25"
}
```
- **Expected Response**:
  - Status: 400
  - Body: `{ "error": "Invalid request data" }`

#### TC-API-004: Generate Vote Token - Missing Fields
- **Description**: Verify token generation fails with missing fields
- **Endpoint**: `POST /api/vote-token`
- **Request Body**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "gender": "male"
}
```
- **Expected Response**:
  - Status: 400
  - Body: `{ "error": "Invalid request data" }`

### Poll Submission API Tests

#### TC-API-005: Submit Vote - Success
- **Description**: Verify successful vote submission
- **Endpoint**: `POST /api/poll`
- **Request Body**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "deviceId": "660e8400-e29b-41d4-a716-446655440000",
  "gender": "male",
  "age": 25,
  "answer": "yes",
  "voteToken": "valid-jwt-token"
}
```
- **Expected Response**:
  - Status: 200
  - Body: `{ "ok": true }`
  - Vote is stored in database

#### TC-API-006: Submit Vote - Rate Limit Exceeded
- **Description**: Verify rate limiting prevents spam
- **Endpoint**: `POST /api/poll`
- **Steps**:
  1. Submit multiple votes rapidly from same IP
  2. Exceed rate limit threshold
- **Expected Response**:
  - Status: 429
  - Body: `{ "error": "Too many votes. Please try again later." }`

#### TC-API-007: Submit Vote - Duplicate DeviceId
- **Description**: Verify device-based duplicate prevention
- **Endpoint**: `POST /api/poll`
- **Steps**:
  1. Submit vote with deviceId X
  2. Submit another vote with same deviceId X
- **Expected Response** (second request):
  - Status: 403
  - Body: `{ "error": "আপনি ইতিমধ্যে ভোট দিয়ে দিয়েছেন। একজন ভোটার কেবল একবারই ভোট দিতে পারবেন।" }`

#### TC-API-008: Submit Vote - Duplicate SessionId
- **Description**: Verify session-based duplicate prevention
- **Endpoint**: `POST /api/poll`
- **Steps**:
  1. Submit vote with sessionId Y
  2. Submit another vote with same sessionId Y
- **Expected Response** (second request):
  - Status: 403
  - Body: `{ "error": "এই সেশন থেকে ইতিমধ্যে ভোট জমা দেওয়া হয়েছে।" }`

#### TC-API-009: Submit Vote - IP Limit Exceeded
- **Description**: Verify IP-based vote limiting (max 20 votes per IP)
- **Endpoint**: `POST /api/poll`
- **Steps**:
  1. Submit 20 votes from same IP with different deviceIds and sessionIds
  2. Submit 21st vote
- **Expected Response** (21st request):
  - Status: 403
  - Body: `{ "error": "দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।" }`

#### TC-API-010: Submit Vote - Invalid Vote Token
- **Description**: Verify vote submission fails with invalid JWT
- **Endpoint**: `POST /api/poll`
- **Request Body**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "deviceId": "660e8400-e29b-41d4-a716-446655440000",
  "gender": "male",
  "age": 25,
  "answer": "yes",
  "voteToken": "invalid-token"
}
```
- **Expected Response**:
  - Status: 401
  - Body: `{ "error": "অননুমোদিত অনুরোধ। অনুগ্রহ করে পুনরায় চেষ্টা করুন।" }`

#### TC-API-011: Submit Vote - Expired Token
- **Description**: Verify vote submission fails with expired JWT (>2 minutes)
- **Endpoint**: `POST /api/poll`
- **Steps**:
  1. Generate vote token
  2. Wait 3 minutes
  3. Submit vote with expired token
- **Expected Response**:
  - Status: 401
  - Body: `{ "error": "অননুমোদিত অনুরোধ। অনুগ্রহ করে পুনরায় চেষ্টা করুন।" }`

#### TC-API-012: Submit Vote - Token Payload Mismatch
- **Description**: Verify vote fails when token data doesn't match request data
- **Endpoint**: `POST /api/poll`
- **Steps**:
  1. Generate token for sessionId A, gender "male", age "25"
  2. Submit vote with sessionId B (different from token)
- **Expected Response**:
  - Status: 401
  - Body: `{ "error": "অননুমোদিত অনুরোধ।" }`

#### TC-API-013: Submit Vote - Invalid Age
- **Description**: Verify age validation (must be 16-120)
- **Endpoint**: `POST /api/poll`
- **Request Body**:
```json
{
  "age": 15
}
```
- **Expected Response**:
  - Status: 400
  - Body contains validation error

#### TC-API-014: Submit Vote - Invalid Answer
- **Description**: Verify answer must be "yes" or "no"
- **Endpoint**: `POST /api/poll`
- **Request Body**:
```json
{
  "answer": "maybe"
}
```
- **Expected Response**:
  - Status: 400
  - Body contains validation error

#### TC-API-015: Submit Vote - Missing Required Fields
- **Description**: Verify all required fields are validated
- **Endpoint**: `POST /api/poll`
- **Request Body**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "gender": "male"
}
```
- **Expected Response**:
  - Status: 400
  - Body: `{ "error": "Invalid input data", "details": [...] }`

### Poll Stats API Tests

#### TC-API-016: Get Poll Stats - Success
- **Description**: Verify `/api/poll/stats` returns vote counts
- **Endpoint**: `GET /api/poll/stats`
- **Expected Response**:
  - Status: 200
  - Body:
```json
{
  "yesVotes": 150,
  "noVotes": 75,
  "totalVotes": 225
}
```

#### TC-API-017: Get Poll Stats - Real-time Updates
- **Description**: Verify stats update after new votes
- **Steps**:
  1. Get current stats
  2. Submit a new vote
  3. Get stats again
- **Expected Result**:
  - Vote count increases by 1
  - Correct category (yes/no) is incremented

### Analytics API Tests

#### TC-API-018: Log Analytics Event - Success
- **Description**: Verify analytics events are logged
- **Endpoint**: `POST /api/analytics/log`
- **Request Body**:
```json
{
  "type": "poll_opened",
  "deviceId": "660e8400-e29b-41d4-a716-446655440000",
  "context": {
    "screen": "home"
  }
}
```
- **Expected Response**:
  - Status: 200
  - Event is stored in database

#### TC-API-019: Get Analytics Summary
- **Description**: Verify analytics summary endpoint
- **Endpoint**: `GET /api/analytics/summary`
- **Expected Response**:
  - Status: 200
  - Body contains analytics data

---

## Security Testing

### Authentication & Authorization Tests

#### TC-SEC-001: JWT Token Tampering
- **Description**: Verify system rejects tampered JWT tokens
- **Steps**:
  1. Generate valid token
  2. Modify token payload (change sessionId)
  3. Submit vote with tampered token
- **Expected Result**:
  - Status: 401
  - Vote is rejected
  - Error: "অননুমোদিত অনুরোধ। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"

#### TC-SEC-002: JWT Signature Verification
- **Description**: Verify token signature is validated
- **Steps**:
  1. Create token with valid structure but invalid signature
  2. Submit vote
- **Expected Result**:
  - Status: 401
  - Vote is rejected

#### TC-SEC-003: Token Replay Attack
- **Description**: Verify token can't be reused after session is consumed
- **Steps**:
  1. Generate token and submit vote successfully
  2. Try to submit another vote with same token
- **Expected Result**:
  - Second vote is rejected due to duplicate sessionId
  - Status: 403

### Input Validation Tests

#### TC-SEC-004: SQL Injection Prevention
- **Description**: Verify NoSQL injection is prevented
- **Steps**:
  1. Submit vote with malicious input in fields:
```json
{
  "gender": { "$ne": null },
  "age": { "$gt": 0 }
}
```
- **Expected Result**:
  - Status: 400
  - Zod validation rejects malicious input

#### TC-SEC-005: XSS Prevention
- **Description**: Verify XSS attack prevention
- **Steps**:
  1. Submit vote with script tags in allowed text fields
  2. Check if script executes on page
- **Expected Result**:
  - Input is sanitized or rejected
  - No script execution

#### TC-SEC-006: Command Injection Prevention
- **Description**: Verify command injection is prevented
- **Steps**:
  1. Try injecting shell commands in input fields
- **Expected Result**:
  - Input is validated and rejected
  - No command execution

### Rate Limiting & DDoS Protection

#### TC-SEC-007: Rate Limiting Per IP
- **Description**: Verify rate limiting prevents spam
- **Steps**:
  1. Send multiple rapid requests from same IP
  2. Exceed rate limit threshold
- **Expected Result**:
  - After threshold, receive 429 status
  - Error: "Too many votes. Please try again later."

#### TC-SEC-008: Rate Limiting Reset
- **Description**: Verify rate limit resets after time window
- **Steps**:
  1. Hit rate limit
  2. Wait for rate limit window to expire
  3. Try submitting again
- **Expected Result**:
  - Can submit after window expires

### Data Protection Tests

#### TC-SEC-009: Sensitive Data Exposure
- **Description**: Verify no sensitive data in responses
- **Steps**:
  1. Make various API calls
  2. Check response bodies
- **Expected Result**:
  - No JWT_SECRET in responses
  - No MongoDB credentials in responses
  - No internal system details exposed

#### TC-SEC-010: HTTPS Enforcement (Production)
- **Description**: Verify HTTPS is enforced in production
- **Steps**:
  1. Try accessing via HTTP
- **Expected Result**:
  - Redirects to HTTPS
  - No data sent over HTTP

#### TC-SEC-011: CORS Policy
- **Description**: Verify CORS is properly configured
- **Steps**:
  1. Make API request from unauthorized origin
- **Expected Result**:
  - Request is blocked if origin not allowed
  - Proper CORS headers are set

### Session Security Tests

#### TC-SEC-012: Session Hijacking Prevention
- **Description**: Verify sessions can't be hijacked
- **Steps**:
  1. Capture sessionId from one user
  2. Try using it from different device/IP
- **Expected Result**:
  - Vote token is tied to sessionId, gender, age
  - Token validation ensures consistency

#### TC-SEC-013: Device Fingerprinting
- **Description**: Verify deviceId is properly validated
- **Steps**:
  1. Submit vote with deviceId A
  2. Try submitting with same deviceId A from different browser
- **Expected Result**:
  - Server-side device check prevents duplicate
  - Status: 403

---

## Integration Testing

### End-to-End User Flow Tests

#### TC-INT-001: Complete Voting Flow - Happy Path
- **Description**: Verify complete user journey from home to vote submission
- **Steps**:
  1. Visit home page
  2. Click "আপনার মতামত দিন"
  3. Select gender "male"
  4. Enter age "25"
  5. Click "ভোট শুরু করুন"
  6. Select "হ্যাঁ"
  7. Click "ভোট প্রদান করুন"
  8. Wait for success modal
  9. Click "Close"
- **Expected Result**:
  - All steps complete successfully
  - Vote is stored in database
  - User is redirected to home page
  - Vote count updates on home page
  - All analytics events are tracked

#### TC-INT-002: Voting Flow - User Cancels at User Info
- **Description**: Verify user can cancel at user info modal
- **Steps**:
  1. Visit home page
  2. Click "আপনার মতামত দিন"
  3. Select gender and age
  4. Click "বাতিল করুন"
- **Expected Result**:
  - Modal closes
  - User remains on home page
  - No vote is submitted
  - Analytics event "user_info_modal_closed" is tracked

#### TC-INT-003: Voting Flow - User Cancels at Poll Page
- **Description**: Verify user can cancel at poll page
- **Steps**:
  1. Complete user info modal
  2. Navigate to poll page
  3. Click "ফিরে যান"
- **Expected Result**:
  - Redirects to home page
  - No vote is submitted
  - Analytics events tracked

#### TC-INT-004: Voting Flow - Timeout at User Info
- **Description**: Verify timeout behavior at user info modal
- **Steps**:
  1. Open user info modal
  2. Wait 2 minutes without submitting
- **Expected Result**:
  - Modal closes automatically
  - User redirects to home page
  - Analytics event "user_info_modal_timeout" tracked

#### TC-INT-005: Voting Flow - Timeout at Poll Page
- **Description**: Verify timeout behavior at poll page
- **Steps**:
  1. Navigate to poll page
  2. Wait 2 minutes without voting
- **Expected Result**:
  - Redirects to home page automatically
  - Analytics events tracked
  - No vote submitted

#### TC-INT-006: Duplicate Vote - Device Check
- **Description**: Verify device-based duplicate prevention (server-side)
- **Steps**:
  1. Complete full voting flow
  2. Clear localStorage
  3. Try voting again from same browser
- **Expected Result**:
  - Second vote is rejected
  - Error notification appears on home page
  - Error: "আপনি ইতিমধ্যে ভোট দিয়ে দিয়েছেন। একজন ভোটার কেবল একবারই ভোট দিতে পারবেন।"

#### TC-INT-007: Duplicate Vote - IP Check
- **Description**: Verify IP-based duplicate prevention (20 vote limit)
- **Steps**:
  1. Submit 20 votes with different devices and sessions
  2. Try 21st vote
- **Expected Result**:
  - 21st vote is rejected
  - Error: "দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।"

#### TC-INT-008: Invalid Session Navigation
- **Description**: Verify direct access to poll page without session
- **Steps**:
  1. Navigate directly to `/poll` without query params
- **Expected Result**:
  - Redirects to home page immediately
  - No error shown

### Database Integration Tests

#### TC-INT-009: MongoDB Connection
- **Description**: Verify database connection is established
- **Steps**:
  1. Start application
  2. Check database connection
- **Expected Result**:
  - Connection successful
  - No connection errors in logs

#### TC-INT-010: Vote Storage
- **Description**: Verify vote is correctly stored in database
- **Steps**:
  1. Submit vote
  2. Query database for vote
- **Expected Result**:
  - Vote document contains:
    - sessionId
    - deviceId
    - ip
    - gender
    - age
    - answer
    - createdAt timestamp

#### TC-INT-011: Database Indexes
- **Description**: Verify indexes are created for performance
- **Steps**:
  1. Run `scripts/setup-indexes.ts`
  2. Check database indexes
- **Expected Result**:
  - Unique index on deviceId
  - Unique index on sessionId
  - Index on ip
  - Index on answer
  - Index on gender
  - Index on createdAt

#### TC-INT-012: Concurrent Vote Submissions
- **Description**: Verify database handles concurrent writes
- **Steps**:
  1. Submit 10 votes simultaneously from different users
- **Expected Result**:
  - All votes are stored successfully
  - No race conditions
  - Unique constraints are enforced

### Analytics Integration Tests

#### TC-INT-013: Analytics Event Tracking
- **Description**: Verify all analytics events are tracked
- **Steps**:
  1. Complete full voting flow
  2. Query analytics database
- **Expected Result**:
  - Events tracked:
    - poll_opened
    - user_info_modal_opened
    - poll_question_modal_opened
    - vote_submitted
  - All events contain deviceId and context

#### TC-INT-014: Analytics Event - Vote Not Submitted
- **Description**: Verify "vote_not_submitted" event tracking
- **Steps**:
  1. Open user info modal, then close it
  2. Navigate to poll page, then go back
  3. Let poll page timeout
- **Expected Result**:
  - "vote_not_submitted" event tracked with reason:
    - "user_closed" (when user closes)
    - "timeout" (when timer expires)

---

## Performance Testing

#### TC-PERF-001: Page Load Time
- **Description**: Verify pages load within acceptable time
- **Metrics**:
  - Home page: < 2 seconds
  - Poll page: < 2 seconds
- **Steps**:
  1. Measure First Contentful Paint (FCP)
  2. Measure Largest Contentful Paint (LCP)
  3. Measure Time to Interactive (TTI)

#### TC-PERF-002: API Response Time
- **Description**: Verify API endpoints respond quickly
- **Metrics**:
  - `/api/vote-token`: < 200ms
  - `/api/poll`: < 500ms
  - `/api/poll/stats`: < 300ms
- **Steps**:
  1. Measure average response time over 100 requests
  2. Measure 95th percentile response time

#### TC-PERF-003: Database Query Performance
- **Description**: Verify database queries are optimized
- **Steps**:
  1. Submit 10,000 votes
  2. Query vote counts
  3. Measure query time
- **Expected Result**:
  - Queries use indexes
  - Query time < 100ms

#### TC-PERF-004: Concurrent User Load
- **Description**: Verify system handles multiple concurrent users
- **Steps**:
  1. Simulate 100 concurrent users voting
  2. Measure response times and error rates
- **Expected Result**:
  - All requests complete successfully
  - Average response time < 1 second
  - Error rate < 1%

#### TC-PERF-005: Memory Usage
- **Description**: Verify application doesn't have memory leaks
- **Steps**:
  1. Run application for extended period
  2. Monitor memory usage
- **Expected Result**:
  - Memory usage remains stable
  - No continuous growth

---

## Error Handling Testing

### Client-Side Error Handling

#### TC-ERR-001: Network Failure During Vote Submission
- **Description**: Verify error handling when network fails
- **Steps**:
  1. Navigate to poll page
  2. Disable network
  3. Try submitting vote
- **Expected Result**:
  - Error notification appears
  - Error: "একটি ত্রুটি ঘটেছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"
  - User is redirected to home page
  - No console errors

#### TC-ERR-002: API Returns 500 Error
- **Description**: Verify error handling for server errors
- **Steps**:
  1. Mock API to return 500 error
  2. Submit vote
- **Expected Result**:
  - Error notification appears with appropriate message
  - User is redirected to home page
  - Error is logged to console

#### TC-ERR-003: Invalid Response Format
- **Description**: Verify error handling for malformed API responses
- **Steps**:
  1. Mock API to return invalid JSON
  2. Submit vote
- **Expected Result**:
  - Error notification appears
  - Application doesn't crash
  - User can continue using the app

### Server-Side Error Handling

#### TC-ERR-004: Database Connection Failure
- **Description**: Verify error handling when database is unavailable
- **Steps**:
  1. Disconnect from database
  2. Try submitting vote
- **Expected Result**:
  - Returns 500 status
  - Error message: "Failed to save poll response"
  - Error is logged on server

#### TC-ERR-005: Invalid Environment Variables
- **Description**: Verify application handles missing env vars
- **Steps**:
  1. Remove MONGODB_URI from env
  2. Start application
- **Expected Result**:
  - Application fails to start gracefully
  - Clear error message about missing env var

#### TC-ERR-006: Database Write Failure
- **Description**: Verify error handling for database write errors
- **Steps**:
  1. Simulate database write failure
  2. Submit vote
- **Expected Result**:
  - Returns appropriate error status
  - Error is logged
  - User receives error notification

---

## Accessibility Testing

#### TC-A11Y-001: Keyboard Navigation
- **Description**: Verify all interactive elements are keyboard accessible
- **Steps**:
  1. Navigate using Tab key only
  2. Activate buttons using Enter/Space
- **Expected Result**:
  - All buttons can be focused
  - All forms can be filled using keyboard
  - Focus indicators are visible

#### TC-A11Y-002: Screen Reader Support
- **Description**: Verify screen reader compatibility
- **Steps**:
  1. Use screen reader (NVDA/JAWS)
  2. Navigate through application
- **Expected Result**:
  - All content is announced
  - Button labels are descriptive
  - Form fields have labels
  - Error messages are announced

#### TC-A11Y-003: Color Contrast
- **Description**: Verify sufficient color contrast for readability
- **Steps**:
  1. Use color contrast checker
  2. Check all text against backgrounds
- **Expected Result**:
  - All text meets WCAG AA standards (4.5:1 ratio)
  - Important text meets WCAG AAA standards (7:1 ratio)

---

## Browser Compatibility Testing

#### TC-COMPAT-001: Chrome
- **Description**: Verify application works on Chrome
- **Versions**: Latest stable, Previous version
- **Expected Result**: All features work correctly

#### TC-COMPAT-002: Firefox
- **Description**: Verify application works on Firefox
- **Versions**: Latest stable, Previous version
- **Expected Result**: All features work correctly

#### TC-COMPAT-003: Safari
- **Description**: Verify application works on Safari
- **Versions**: Latest stable, Previous version
- **Expected Result**: All features work correctly

#### TC-COMPAT-004: Edge
- **Description**: Verify application works on Edge
- **Versions**: Latest stable
- **Expected Result**: All features work correctly

#### TC-COMPAT-005: Mobile Browsers
- **Description**: Verify application works on mobile browsers
- **Browsers**: Chrome Mobile, Safari iOS
- **Expected Result**: All features work correctly

---

## Test Data

### Valid Test Data

```javascript
// Valid User Data
const validUsers = [
  { gender: "male", age: "25" },
  { gender: "female", age: "30" },
  { gender: "male", age: "16" },  // minimum age
  { gender: "female", age: "120" } // maximum age
];

// Valid Vote Data
const validVotes = [
  { answer: "yes" },
  { answer: "no" }
];

// Valid UUIDs
const validUUIDs = [
  "550e8400-e29b-41d4-a716-446655440000",
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
];
```

### Invalid Test Data

```javascript
// Invalid Ages
const invalidAges = [
  "15",    // too young
  "121",   // too old
  "-5",    // negative
  "abc",   // non-numeric
  ""       // empty
];

// Invalid Genders
const invalidGenders = [
  "other",
  "nonbinary",
  "",
  null
];

// Invalid UUIDs
const invalidUUIDs = [
  "not-a-uuid",
  "123",
  "",
  null
];

// Invalid Answers
const invalidAnswers = [
  "maybe",
  "abstain",
  "",
  null
];
```

---

## Test Environment Setup

### Prerequisites
- Node.js 18+
- MongoDB instance
- Environment variables configured
- Cypress installed

### Environment Variables for Testing
```bash
MONGODB_URI=mongodb://localhost:27017/polling_app_test
MONGODB_DB=polling_app_test
JWT_SECRET=test-secret-key-for-testing-only
```

### Database Setup for Testing
```bash
# Create test database
# Run index setup
npx tsx scripts/setup-indexes.ts

# Seed test data if needed
```

### Running Tests
```bash
# Run all Cypress tests
npm run test:e2e

# Run specific test suite
npm run test:ui
npm run test:api
npm run test:security

# Run in headless mode
npm run test:headless

# Open Cypress test runner
npm run cypress:open
```

---

## Test Reporting

### Metrics to Track
- Total test cases: X
- Passed: X
- Failed: X
- Skipped: X
- Test coverage: X%
- Average execution time: X seconds

### Test Report Structure
```
/cypress/reports/
  ├── html/           # HTML reports
  ├── json/           # JSON reports
  ├── screenshots/    # Failure screenshots
  └── videos/         # Test execution videos
```

---

## Maintenance

### Test Review Schedule
- **Daily**: Review failed tests
- **Weekly**: Update test data
- **Monthly**: Review test coverage
- **Quarterly**: Refactor/optimize tests

### Test Updates
- Update tests when features change
- Add tests for new features
- Remove tests for deprecated features
- Keep test data current

---

## Notes

1. **Test Independence**: Each test should be independent and not rely on other tests
2. **Data Cleanup**: Clean up test data after each test run
3. **Idempotency**: Tests should produce same results when run multiple times
4. **Retry Logic**: Implement retry for flaky tests
5. **Parallel Execution**: Run tests in parallel when possible
6. **CI/CD Integration**: Integrate tests into CI/CD pipeline

---

## Contact

For questions or issues with tests:
- Developer: [Your Name]
- Email: [Your Email]
- Documentation: [Link to docs]
