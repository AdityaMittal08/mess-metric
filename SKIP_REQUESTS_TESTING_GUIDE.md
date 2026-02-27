# 🎯 Skip Request & Coins System - Complete Implementation

## ✅ What's Been Implemented

### Backend Changes
1. **Skip Controller** (`server/controllers/skip.controller.js`)
   - POST `/api/meals/skip` - Students submit skip requests
   - GET `/api/meals` - Admins fetch pending skip requests
   - GET `/api/meals/my-requests` - Students view their skip requests
   - PUT `/api/meals/:id/approve` - Admins approve & award 50 coins

2. **Skip Routes** (`server/routes/skip.routes.js`)
   - All 4 endpoints properly mounted

3. **Database**
   - `User` model: Added `walletAddress` field
   - `SkipRequest` model: Tracks status (Pending/Approved/Rejected)

4. **Seed Data** (`server/seed.js`)
   - 5 demo students with complete data
   - `registrationNo`, `messName`, `walletAddress` included

### Frontend Changes
1. **Admin Dashboard** (`AdminDashboardPage.jsx`)
   - ✅ Fetches pending skip requests on load
   - ✅ Displays in table with student name, meal type, status
   - ✅ "Approve & Award 50🪙" button
   - ✅ On click: calls API, removes row, shows success alert
   - ✅ Approved requests show "Coins Awarded" disabled button

2. **Student Dashboard** (`DailyMealTracker.jsx`)
   - ✅ Toggle OFF a meal → Submits skip request
   - ✅ Sends POST to `/api/meals/skip`
   - ✅ Shows pending/approved status

---

## 🚀 Quick Start

### Step 1: Seed Database
```bash
cd server
node seed.js
```
Creates 5 test students with coins.

### Step 2: Create Test Skip Requests (Optional)
```bash
node seed_skip_requests.js
```
Creates pending skip requests for testing admin approval.

### Step 3: Start Server
```bash
npm start
# or
node index.js
```

### Step 4: Start Frontend
```bash
cd client
npm run dev
```

---

## 🧪 Testing Flow

### Test 1: Admin Approves Skip Request

**Precondition**: Skip requests exist (from seed_skip_requests.js)

1. **Login as Admin**
   - Email: (your admin credentials)
   - Navigate to Admin Dashboard
   - Click "Pending Approvals" tab

2. **See Pending Requests**
   - Table shows: Student Name | Meal Type | Status | Approve Button
   - Example:
     ```
     Raghav  | Breakfast | Pending Review | [Approve & Award 50🪙]
     Yash    | Lunch     | Pending Review | [Approve & Award 50🪙]
     ```

3. **Click Approve Button**
   - Button shows loading spinner
   - 2-3 seconds processing
   - Success alert: "✅ Approved! 50 coins awarded to Raghav"
   - Row disappears from table

4. **Check Backend Logs**
   ```
   ✅ Skip request approved | Student: Raghav | Coins awarded: +50 (Total: 170)
   ```

### Test 2: Student Submits Skip Request

1. **Login as Student**
   - Email: raghav@vit.ac.in (or any demo user)
   - Navigate to Student Dashboard

2. **Daily Meal Tracker**
   - See 4 meal cards: Breakfast, Lunch, Snacks, Dinner
   - Each has a toggle switch (green when eating, gray when skipping)

3. **Toggle Meal Off**
   - Click toggle on a meal card
   - Card turns gray/amber
   - Status changes to "Pending Biometric"

4. **Check Browser Console** (F12 > Console)
   - Should see: "Skip request submitted: { success: true, requestId: "..." }"
   - Backend logs: "STUDENT ID: [userId]"

5. **Check Network Tab** (F12 > Network)
   - POST to `/api/meals/skip`
   - Status 200
   - Response: `{ success: true, requestId: "..." }`

### Test 3: Verify Coins Updated

1. **Student View**
   - After admin approves, coins displayed in dashboard
   - Previously: 120 coins
   - After approval: 170 coins (120 + 50)

2. **Admin View**
   - Go to Admin Dashboard
   - Look at backend logs showing total coins

---

## 📊 API Response Examples

### Admin GET /api/meals
```json
{
  "success": true,
  "data": [
    {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "student": "Raghav",
      "regNo": "VIT001",
      "mealType": "Breakfast",
      "status": "Pending",
      "timestamp": "2/27/2026"
    }
  ]
}
```

### Admin PUT /api/meals/:id/approve
```json
{
  "success": true,
  "message": "Skip request approved! 50 coins awarded to Raghav",
  "data": {
    "skipRequest": { /* skip request object */ },
    "student": {
      "id": "...",
      "name": "Raghav",
      "mealCoins": 170
    }
  }
}
```

### Student POST /api/meals/skip
```json
{
  "success": true,
  "message": "Skip request submitted and is pending approval.",
  "requestId": "65f1a2b3c4d5e6f7g8h9i0j1"
}
```

### Student GET /api/meals/my-requests
```json
{
  "success": true,
  "data": {
    "skipRequests": [
      {
        "id": "...",
        "mealType": "Breakfast",
        "status": "Approved",
        "date": "2026-02-27T...",
        "createdAt": "2026-02-27T..."
      }
    ],
    "student": {
      "name": "Raghav",
      "mealCoins": 170,
      "email": "raghav@vit.ac.in"
    }
  }
}
```

---

## 🔍 Troubleshooting

### Button Not Clickable?
```
1. Check if data loaded: Network tab > GET /api/meals
2. Check if response has data array
3. Check browser console for errors
4. Verify status === "Pending" (case-sensitive!)
```

### Coins Not Updating?
```
1. Check backend logs for approval message
2. Verify User.findByIdAndUpdate is working
3. Check response includes student.mealCoins
4. Reload page to see updated coins
```

### Admin Dashboard Empty?
```
1. Run: node seed_skip_requests.js
2. Check Network: GET /api/meals status 200
3. Check role in admin JWT token (must have role: "admin")
4. Verify /api/meals route is mounted in server/index.js
```

### Student Request Not Submitting?
```
1. Check Network: POST /api/meals/skip
2. Check response status 200
3. Verify token in localStorage
4. Check browser console for errors
5. Verify mealType is one of: "Breakfast|Lunch|Snacks|Dinner"
```

---

## 📝 Database Schema

### SkipRequest
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,          // refs User
  mealType: String,             // "Breakfast|Lunch|Snacks|Dinner"
  date: Date,                   // createdAt
  status: String,               // "Pending|Approved|Rejected"
  createdAt: Date,
  updatedAt: Date
}
```

### User (Updated)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  registrationNo: String,       // ✅ Required
  messName: String,             // ✅ Required
  password: String,
  mealCoins: Number,            // ✅ Updated on approval
  walletAddress: String,        // ✅ Optional (null)
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Complete Workflow

```
1. Student Login
   ↓
2. View Days's Meals (DailyMealTracker)
   ↓
3. Toggle Meal OFF (mark as skipping)
   ↓
4. POST /api/meals/skip {"mealType": "Breakfast"}
   ↓
5. SkipRequest created with status: "Pending"
   ↓
6. Admin Login → Admin Dashboard → Pending Approvals tab
   ↓
7. See student's pending skip request in table
   ↓
8. Click "Approve & Award 50🪙" button
   ↓
9. PUT /api/meals/:id/approve
   ↓
10. Backend:
    - Update SkipRequest.status = "Approved"
    - Update User.mealCoins += 50
    ↓
11. Frontend: Alert shows "50 coins awarded to Raghav"
    ↓
12. Row removed from table
    ↓
13. Student (on next reload) sees +50 coins in dashboard
```

---

## ✨ Features Implemented

- ✅ Admin can view pending skip requests
- ✅ Admin can approve skip requests
- ✅ Coins automatically awarded (50 per approval)
- ✅ Coins reflected in User model
- ✅ Status updates properly (Pending → Approved)
- ✅ Toast/Alert feedback to admin
- ✅ Loading states on buttons
- ✅ Optimistic UI updates
- ✅ Error handling
- ✅ Role-based access (admin-only endpoints)

---

**System is ready for testing! Follow the "Testing Flow" section above.**
