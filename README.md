This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# ✅ **Full Summary of What We Built So Far**

### **1️⃣ Created a basic Next.js poll application**

- Home page with a **Poll** button.
- Clicking it opens a **modal** where user selects:

  - Gender (Male/Female)
  - Age (with validation: must be 17+)

- Modal auto-closes after **10 seconds**, with countdown warnings.

---

### **2️⃣ Created the Poll Page (/poll)**

- Shows the poll question.
- User selects **Yes / No**.
- Page auto-closes after **10 seconds**.
- Submitting vote goes through **/api/poll**.

---

### **3️⃣ Implemented session tracking**

- When starting poll → we generate a **sessionId**.
- sessionId, gender, age passed to `/poll` via URL.
- If values missing → redirect to home.
- If modal times out → cancel session.

---

### **4️⃣ Added device-based vote restriction (Feature flag)**

- Added a feature flag:
  `ENFORCE_SINGLE_VOTE = true | false`
- When true:

  - A unique **deviceId** is stored in localStorage.
  - A flag `hasVoted` prevents voting multiple times.
  - If user already voted → show a yellow warning banner.

- When false:

  - Multiple voting allowed (for testing).

---

### **5️⃣ Added IP tracking in backend**

In API route `/api/poll`:

- Extracted IP from:

  - `x-forwarded-for`
  - `x-real-ip`

- Logged it along with session data.

This IP will be stored in DB in the future.

---

### **6️⃣ Added a Pie Chart on the Home Page**

- Displays Yes/No percentages.
- Currently uses **mock data**, will later come from DB.

---

### **7️⃣ Fixed many bugs**

- Flickering modal issue fixed.
- Timer reset issues fixed.
- State update conflicts resolved.
- Navigation errors removed.

---

### **8️⃣ Complete Code Refactor (Industry Standard)**

We reorganized the whole project into clean architecture:

#### **Shared config**

`lib/pollConfig.ts`
Holds:

- Feature flag
- Storage keys
- Single source of truth

#### **Reusable utilities**

`lib/device.ts`

- Get/create device ID
- Check if device voted
- Mark device as voted

#### **Reusable UI component**

`components/PollResultsPie.tsx`

#### **Pages become clean**

- `app/page.tsx` handles only screen logic.
- `app/poll/page.tsx` handles poll screen.
- All helpers/constants removed from pages.

---

### **9️⃣ API route (POST /api/poll)**

- Receives:

  - sessionId
  - gender
  - age
  - answer
  - deviceId
  - ip

- Validates payload.
- Logs data (later will save to DB).

---

# ✅ Result of the Work

You now have:

✔ A fully functional poll flow
✔ Session-based tracking
✔ Device-based vote prevention
✔ IP tracking
✔ Timed modals
✔ Clean file structure
✔ Shared constants
✔ Reusable components
✔ Scalable architecture for the next features

---

If you want next:

- Add DB (MongoDB / PostgreSQL / Firebase)
- admin dashboard
- live counting
- geo analytics by IP
- QR-code poll access
- multiple poll questions
- authentication
- export results to CSV

Just tell me — I’m ready.
