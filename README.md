# TickeGo — College-Only Event & Ticket Management Platform

## ROLE / INSTRUCTION FOR ANTIGRAVITY

You are continuing development of an existing MERN-stack project called **TickeGo**.

Your job is to **continue the existing implementation**, not rebuild the project from scratch.

Before changing anything:
1. Inspect the existing frontend and backend structure.
2. Inspect existing models, controllers, routes, middleware, services, pages, components, context, and utilities.
3. Reuse existing code and architecture wherever possible.
4. Do not duplicate routes, services, components, models, or authentication logic.
5. Do not break currently working functionality.
6. Make changes incrementally and test each feature after implementation.
7. If an existing implementation differs slightly from this document, prefer the actual working codebase and adapt this document to it.
8. Do not introduce unnecessary libraries.
9. Keep the code production-oriented and modular.

---

# 1. PROJECT OVERVIEW

**TickeGo** is a college-only event discovery, registration, ticket booking, payment, and QR-based entry management platform.

The platform is intended to be used **only within the college ecosystem**.

The main users are:

### Student/User
- Create an account
- Login
- Browse college events
- View event details
- Register for free events
- Purchase tickets for paid events
- Receive a digital ticket
- View ticket QR code
- View previous/upcoming tickets

### Organizer
Examples:
- College clubs
- Student organizations
- Departments
- College event teams
- Authorized event organizers

Organizers can:
- Create events
- Manage their events
- View registrations
- View ticket information
- Scan tickets at event entry

### Admin / College Authority

The admin role can eventually:
- Verify organizations/clubs
- Approve events
- Manage users
- Manage organizations/departments
- Monitor events
- View platform-level analytics

The first deployable version should prioritize:
**Student + Organizer + core Admin controls.**

---

# 2. COLLEGE-ONLY REQUIREMENT

This is a major requirement.

TickeGo should NOT behave like a public ticket marketplace.

The platform should be restricted to the college community.

## Recommended access policy

Only users with an approved college email domain should be able to register.

Example:

```text
student@college-domain.ac.in
```

Do NOT hardcode an incorrect domain.

Create a configurable environment variable:

```env
COLLEGE_EMAIL_DOMAIN=yourcollege.ac.in
```

The exact domain should be configurable from `.env`.

If the college has multiple valid domains, support:

```env
COLLEGE_EMAIL_DOMAINS=domain1.ac.in,domain2.ac.in
```

Registration should reject non-college email addresses.

Example:

```text
gmail.com          -> reject
yahoo.com          -> reject
college-domain.ac.in -> allow
```

The implementation should keep this configurable because the application may later be used by another college.

---

# 3. CORE PRODUCT FLOW

## Student Flow

```text
College Student
      |
      v
Signup with College Email
      |
      v
Login
      |
      v
Browse College Events
      |
      v
View Event Details
      |
      +----------------------+
      |                      |
      v                      v
Free Event              Paid Event
      |                      |
      v                      v
Register               Create Razorpay Order
                             |
                             v
                       Razorpay Checkout
                             |
                             v
                       Verify Payment
                             |
                             v
                       Generate Ticket
                             |
                             v
                       Generate QR Code
                             |
                             v
                       My Tickets
                             |
                             v
                       Event Entry
                             |
                             v
                       QR Scan
                             |
                             v
                       Mark Ticket Used
```

---

# 4. TECHNOLOGY STACK

## Frontend

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS v4
- React Hook Form
- React Hot Toast
- React Icons

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Razorpay
- QRCode
- Crypto
- Node Cron if required for future scheduled tasks

## Deployment

Preferred:

```text
Frontend -> Vercel
Backend  -> Render
Database -> MongoDB Atlas
Payments -> Razorpay
```

---

# 5. CURRENT PROJECT ARCHITECTURE

Frontend:

```text
frontend/
└── src/
    ├── assets/
    ├── components/
    │   ├── auth/
    │   ├── events/
    │   ├── layout/
    │   ├── organizer/
    │   └── tickets/
    ├── pages/
    │   ├── auth/
    │   ├── organizer/
    │   ├── public/
    │   └── user/
    ├── layouts/
    ├── routes/
    ├── services/
    ├── hooks/
    ├── context/
    ├── utils/
    ├── constants/
    └── styles/
```

Backend:

```text
backend/
├── controllers/
├── models/
├── routes/
├── middleware/
├── services/
├── utils/
├── config/
└── server/app entry point
```

Do not reorganize the project unnecessarily.

---

# 6. AUTHENTICATION

Existing authentication routes:

```http
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

Login response should contain:

```json
{
  "message": "Login Successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "Student Name",
    "email": "student@college.ac.in"
  }
}
```

Frontend AuthContext currently manages:

```text
token
user
login()
logout()
```

Token is stored in localStorage.

Protected routes use:

```text
ProtectedRoute
```

Do not create a second authentication system.

---

# 7. EXISTING EVENT API

Current routes:

```http
POST /api/event/create
POST /api/event/register/:id
GET  /api/event
GET  /api/event/:id
```

Event fields include:

```text
title
description
category
organization
department
createdBy
eventMode
isPaid
ticketPrice
visibility
location
eventDate
maxParticipants
registeredUsers
poster
```

Location:

```json
{
  "address": "",
  "city": "",
  "country": "",
  "latitude": null,
  "longitude": null
}
```

---

# 8. EVENT RULES

Implement proper validation.

## Event title

Required.

## Description

Required.

## Event date

Must be a valid future date when creating an event.

## Ticket price

For free events:

```text
isPaid = false
ticketPrice = 0
```

For paid events:

```text
isPaid = true
ticketPrice > 0
```

## Maximum participants

Must be greater than zero.

## Duplicate registration

A student must not be able to register twice for the same event.

## Event capacity

Do not allow registrations after:

```text
registeredUsers.length >= maxParticipants
```

Return a meaningful error.

---

# 9. ORGANIZATION AND DEPARTMENT

Existing routes include:

```http
GET /api/org
GET /api/dept
```

Creation routes already exist.

Organizations/departments are used when creating events.

The platform should eventually distinguish between:

```text
College
Department
Club
Student Organization
```

Do not allow random users to create verified organizations.

A future admin approval workflow should be supported.

---

# 10. PAYMENT SYSTEM

Razorpay integration already exists.

Routes:

```http
POST /api/payment/create-order
POST /api/payment/verify
```

Both are protected with authentication.

Create order flow:

```text
Frontend
   |
   v
POST /payment/create-order
   |
   v
Validate Event
   |
   v
Create Razorpay Order
   |
   v
Create pending Ticket
   |
   v
Return order + ticketId + Razorpay key
```

Payment verification:

```text
Razorpay Checkout
       |
       v
razorpay_order_id
razorpay_payment_id
razorpay_signature
       |
       v
Backend verifies HMAC signature
       |
       v
Ticket status = paid
       |
       v
Generate QR
```

IMPORTANT:

Never disable signature verification.

Use:

```js
crypto
  .createHmac("sha256", process.env.RAZORPAY_SECRET)
```

and compare against the Razorpay signature.

Never expose:

```text
RAZORPAY_SECRET
```

to the frontend.

Only the public Razorpay key may be returned to the frontend.

---

# 11. TICKET MODEL

Existing ticket fields include:

```text
user
event
paymentId
orderId
status
qrCode
isUsed
usedAt
ticketNumber
checkedInBy
```

Status:

```text
pending
paid
failed
```

Ticket number format currently resembles:

```text
TG-2026-XXXXXXXX
```

Keep ticket numbers unique.

---

# 12. QR CODE

A successful paid ticket receives a QR code.

Current implementation generates QR data from:

```text
ticket.ticketNumber
```

QR should not expose sensitive user information.

Preferred QR payload:

```text
unique ticket number
```

The backend should use the ticket number to retrieve the actual ticket.

---

# 13. TICKET SCANNING

Existing backend route:

```http
POST /api/ticket/scan
```

The frontend still needs a proper organizer QR scanner UI.

Recommended flow:

```text
Organizer Dashboard
       |
       v
Scan Ticket
       |
       v
Camera opens
       |
       v
QR detected
       |
       v
POST /api/ticket/scan
       |
       v
Validate ticket
       |
       +-----------------------------+
       |             |               |
       v             v               v
Valid             Already Used    Invalid
       |
       v
Mark isUsed=true
usedAt=Date.now()
checkedInBy=organizer/admin
       |
       v
Show successful entry
```

Responses should be clear:

```text
Ticket Valid
Ticket Already Used
Ticket Not Found
Ticket Not Paid
Ticket Does Not Belong To This Event
Unauthorized Scanner
```

---

# 14. IMPORTANT SECURITY REQUIREMENT FOR QR SCANNING

An organizer must not be able to scan arbitrary tickets for every event.

The backend should verify:

```text
scanner user is authorized organizer
AND
ticket belongs to an event owned/managed by that organizer
AND
ticket is paid/valid
AND
ticket is not already used
```

Do not trust event IDs or user IDs sent from the frontend.

Derive authorization from the authenticated JWT and database records.

---

# 15. FRONTEND PAGES ALREADY IMPLEMENTED

Authentication:

```text
/pages/auth/Login.jsx
/pages/auth/Signup.jsx
/pages/auth/ForgotPassword.jsx
/pages/auth/ResetPassword.jsx
```

Public:

```text
/pages/public/Events.jsx
/pages/public/EventDetails.jsx
```

User:

```text
/pages/user/Dashboard.jsx
/pages/user/MyTickets.jsx
```

Organizer:

```text
/pages/organizer/CreateEvent.jsx
```

---

# 16. FRONTEND COMPONENTS

Existing components include:

```text
components/auth/
  LoginForm
  SignupForm
  ForgotPasswordForm
  ResetPasswordForm
  ProtectedRoute

components/events/
  EventsList
  EventCard
  EventDetailsCard

components/tickets/
  TicketList
  TicketCard

components/organizer/
  CreateEventForm

components/layout/
  Navbar
```

Reuse these components.

---

# 17. FRONTEND SERVICES

Existing services:

```text
services/api.js
services/authService.js
services/eventService.js
services/organizationService.js
services/departmentService.js
services/ticketService.js
services/paymentService.js
```

Existing payment functions:

```js
createOrder(eventId, token)
verifyPayment(data, token)
```

Do not duplicate these services.

---

# 18. ROUTING

The application uses exactly ONE BrowserRouter.

Architecture:

```text
main.jsx
   |
   v
<BrowserRouter>
   |
   v
<AuthProvider>
   |
   v
<App>
   |
   v
<MainLayout>
   |
   v
<AppRoutes>
   |
   v
<Routes>
```

IMPORTANT:

Do NOT add another `BrowserRouter` inside `AppRoutes`.

Current routes include:

```text
/
/login
/signup
/forgot-password
/reset-password
/events
/events/:id
/dashboard
/my-tickets
/organizer/create-event
```

Protected routes:

```text
/dashboard
/my-tickets
/organizer/create-event
```

Add future protected routes through the existing `ProtectedRoute`.

---

# 19. NAVBAR

Navbar should show:

## Logged out

```text
Home
Events
Login
Signup
```

## Logged in

```text
Home
Events
My Tickets
Dashboard
Create Event
Logout
```

Later, display organizer/admin navigation according to role.

---

# 20. USER ROLES

Introduce/maintain a role field if it does not already exist.

Recommended:

```text
student
organizer
admin
```

Potential future:

```text
superadmin
```

Do not rely on frontend role checks alone.

Every privileged backend operation must verify the authenticated user's role.

---

# 21. COLLEGE-ONLY EVENT VISIBILITY

Events should belong to the college.

Do not build public/global event discovery.

All normal users should see only events belonging to the configured college.

If multiple colleges are ever supported, add a college/tenant model and associate:

```text
User -> College
Organization -> College
Department -> College
Event -> College
```

For the first version, a single college deployment is sufficient.

---

# 22. ADMIN FUNCTIONALITY TO IMPLEMENT

Create an admin dashboard with:

```text
Total Students
Total Organizers
Total Organizations
Total Events
Total Tickets
Total Revenue
Upcoming Events
```

Admin should be able to:

### Organizations
- View organizations
- Approve/reject organizations

### Events
- View events
- Approve/reject events if approval is enabled

### Users
- View students
- View organizers
- Disable accounts if required

Do not overbuild this before the core student/organizer flow works.

---

# 23. ORGANIZER DASHBOARD

Create:

```text
/organizer/dashboard
```

Display:

```text
My Events
Total Registrations
Paid Tickets
Revenue
Upcoming Events
```

For each event:

```text
Event Name
Date
Registrations
Capacity
Revenue
Status
Manage
Scan Tickets
```

---

# 24. EVENT MANAGEMENT

Organizer should eventually be able to:

```text
Create Event
View My Events
Edit Event
Delete/Cancel Event
View Participants
View Ticket Statistics
Scan Tickets
```

Before deleting an event, handle existing paid tickets safely.

Do not simply delete an event with active paid tickets.

---

# 25. USER DASHBOARD

Replace placeholder cards with real data.

Display:

```text
Upcoming Events
Registered Events
Paid Tickets
Used Tickets
```

Example:

```text
My Tickets       4
Upcoming Events  2
Used Tickets     1
```

Add quick links:

```text
Browse Events
My Tickets
```

---

# 26. EVENT SEARCH AND FILTERING

Add:

```text
Search by title
Category
Organization
Department
Event mode
Free/Paid
Date
```

Example:

```text
Search Events
[ React Workshop              ]

Category:
[All]

Mode:
[All]

Price:
[All]
```

Filtering should preferably happen through the backend when the dataset becomes large.

---

# 27. EVENT STATUS

Derive event status:

```text
Upcoming
Ongoing
Completed
Cancelled
```

Do not store redundant status unless there is a clear reason.

Use `eventDate` and optional end date/time where appropriate.

---

# 28. EMAIL NOTIFICATIONS

Future enhancement:

Send email for:

```text
Account verification
Password reset
Event registration
Successful payment
Ticket confirmation
Event reminder
Event cancellation
```

Do not hardcode SMTP/API credentials.

Use environment variables.

---

# 29. IMAGE / POSTER UPLOAD

Current event model has:

```text
poster
```

If poster upload is implemented, prefer Cloudinary or another proper object-storage provider.

Do not store large binary images directly in MongoDB.

Environment variables should be used for provider credentials.

---

# 30. ERROR HANDLING

Every API should return consistent errors.

Preferred format:

```json
{
  "message": "Human readable error",
  "code": "OPTIONAL_ERROR_CODE"
}
```

Frontend should display:

```js
error.response?.data?.message
```

Use toast notifications for user-facing errors.

Do not expose stack traces or secrets in production.

---

# 31. LOADING STATES

Every API-driven page should handle:

```text
Loading
Success
Empty
Error
```

Example:

```text
Loading events...
```

Empty:

```text
No events available.
```

Error:

```text
Unable to load events. Please try again.
```

Do not leave users staring at a blank screen.

---

# 32. RESPONSIVE UI

The application must work on:

```text
Desktop
Laptop
Tablet
Mobile
```

Use Tailwind responsive classes.

Test at approximately:

```text
375px
768px
1024px
1440px
```

---

# 33. PAYMENT EDGE CASES

Handle all of these:

### Payment success

```text
pending -> paid
QR generated
ticket visible
```

### Payment failure

```text
ticket remains pending/failed appropriately
```

### Payment cancellation

User closes Razorpay.

Do not mark ticket as paid.

### Duplicate payment verification

Do not create duplicate tickets or corrupt ticket state.

### Invalid signature

Reject the request.

### Invalid ticketId

Reject the request.

### Order mismatch

Ensure:

```text
ticket.orderId === razorpay_order_id
```

before confirming payment.

---

# 34. REGISTRATION EDGE CASES

Prevent:

```text
Duplicate registration
Event full
Past event registration
Unauthorized registration
Invalid event ID
```

---

# 35. DATABASE INDEXING

Review indexes for:

```text
User.email
Ticket.ticketNumber
Ticket.orderId
Ticket.paymentId
Event.eventDate
Event.organization
Event.department
```

Avoid unnecessary indexes.

---

# 36. ENVIRONMENT VARIABLES

Backend `.env` should contain values similar to:

```env
PORT=5000

MONGO_URI=...

JWT_SECRET=...

RAZORPAY_KEY_ID=...

RAZORPAY_SECRET=...

COLLEGE_EMAIL_DOMAIN=...

FRONTEND_URL=http://localhost:5173
```

Frontend should contain only public configuration such as:

```env
VITE_API_URL=http://localhost:5000/api
```

Never expose:

```text
MONGO_URI
JWT_SECRET
RAZORPAY_SECRET
SMTP_PASSWORD
```

to the frontend.

---

# 37. CORS

Development:

```text
http://localhost:5173
```

Production:

```text
https://your-frontend-domain.vercel.app
```

Do not use unrestricted:

```js
origin: "*"
```

in the final production configuration if authenticated APIs are being used.

---

# 38. DEPLOYMENT TARGET

Final architecture:

```text
                 ┌───────────────────┐
                 │      Student      │
                 │      Browser      │
                 └─────────┬─────────┘
                           |
                           v
                 ┌───────────────────┐
                 │      Vercel       │
                 │ React Frontend    │
                 └─────────┬─────────┘
                           |
                         HTTPS
                           |
                           v
                 ┌───────────────────┐
                 │      Render       │
                 │ Node + Express    │
                 └──────┬───────┬────┘
                        |       |
                        v       v
               ┌──────────┐  ┌──────────┐
               │ MongoDB  │  │ Razorpay │
               │  Atlas   │  │          │
               └──────────┘  └──────────┘
```

---

# 39. PRE-DEPLOYMENT CHECKLIST

Before deployment, verify:

## Backend

- [ ] Server starts without errors
- [ ] MongoDB connection works
- [ ] JWT authentication works
- [ ] College email restriction works
- [ ] Events API works
- [ ] Registration works
- [ ] Payment order creation works
- [ ] Razorpay signature verification works
- [ ] Ticket generation works
- [ ] QR generation works
- [ ] QR scanning works
- [ ] Role authorization works
- [ ] CORS configured
- [ ] Production environment variables configured

## Frontend

- [ ] Homepage works
- [ ] Signup works
- [ ] Login works
- [ ] Logout works
- [ ] Events page works
- [ ] Event details work
- [ ] Free registration works
- [ ] Paid checkout works
- [ ] Payment success works
- [ ] Payment failure works
- [ ] My Tickets works
- [ ] QR displayed correctly
- [ ] Organizer dashboard works
- [ ] Scanner works
- [ ] Protected routes work
- [ ] Mobile UI works
- [ ] No console errors

---

# 40. IMPORTANT DEVELOPMENT ORDER

Do NOT randomly add features.

Continue in this order:

## Phase 1 — Core Testing

1. Test signup/login
2. Test organization creation
3. Test department creation
4. Test event creation
5. Test event listing
6. Test event details
7. Test free registration

## Phase 2 — Payments

8. Test Razorpay create-order
9. Test Razorpay checkout
10. Test payment verification
11. Test ticket creation
12. Test QR generation
13. Test My Tickets

## Phase 3 — QR Entry

14. Build organizer dashboard
15. Build QR scanner
16. Implement ticket validation
17. Implement check-in
18. Prevent duplicate check-in

## Phase 4 — College Restriction

19. Add college email validation
20. Add role-based authorization
21. Ensure events are college-only

## Phase 5 — Product Polish

22. Search
23. Filters
24. Loading states
25. Empty states
26. Error handling
27. Responsive UI
28. Dashboard statistics

## Phase 6 — Admin

29. Admin dashboard
30. Organization approval
31. Event approval if required
32. User management

## Phase 7 — Deployment

33. Production environment variables
34. MongoDB Atlas configuration
35. Render deployment
36. Vercel deployment
37. CORS configuration
38. Razorpay production/test configuration
39. End-to-end production testing

---

# 41. DO NOT DO THESE THINGS

Do NOT:

- Rewrite the whole project.
- Replace React Router architecture.
- Add a second BrowserRouter.
- Create duplicate API services.
- Create duplicate authentication contexts.
- Store secrets in frontend code.
- Disable Razorpay signature verification.
- Trust user IDs sent from the frontend.
- Allow unauthorized organizers to scan tickets.
- Allow non-college users if college-only mode is enabled.
- Delete paid-event data without considering existing tickets.
- Use fake successful payment responses in production.
- Introduce unnecessary dependencies.
- Remove working functionality just to simplify code.

---

# 42. CURRENT PRIORITY

The immediate objective is:

```text
Make the existing project fully functional
        ↓
Complete payment testing
        ↓
Complete QR scanner
        ↓
Complete organizer dashboard
        ↓
Implement college-only restriction
        ↓
Improve user dashboard
        ↓
Add admin controls
        ↓
Polish UI
        ↓
Test production build
        ↓
Deploy
```

Do not spend excessive time on visual polish before the complete core flow works.

---

# 43. DEFINITION OF DONE

TickeGo v1 is considered complete when a student can:

```text
Sign up with college email
        ↓
Login
        ↓
Browse college events
        ↓
Open an event
        ↓
Register for a free event
        OR
Buy a paid ticket
        ↓
Complete Razorpay payment
        ↓
Receive QR ticket
        ↓
Open My Tickets
        ↓
Show QR at event
        ↓
Organizer scans QR
        ↓
Backend validates ticket
        ↓
Ticket becomes used
```

And an organizer can:

```text
Login
   ↓
Create event
   ↓
View own events
   ↓
View registrations/tickets
   ↓
Scan attendee QR codes
   ↓
See valid/invalid/already-used result
```

And the admin can:

```text
Manage college organizations
Manage users
Manage events
View platform statistics
```

---

# 44. FINAL INSTRUCTION TO ANTIGRAVITY

Start by **auditing the current codebase** against this document.

Do not immediately modify files.

First identify:

```text
1. What is already implemented?
2. What is partially implemented?
3. What is broken?
4. What is missing?
5. Which files need modification?
6. Which new files are actually necessary?
```

Then provide a concise implementation plan.

After that, implement the highest-priority missing functionality one feature at a time.

For every feature:

```text
Inspect
→ Plan
→ Implement
→ Run/test
→ Fix errors
→ Verify
→ Move to next feature
```

The goal is a **working, secure, college-only production-ready MVP**, not just a visually complete frontend.
