# ResolveHub — Customer Complaint Management System

> A reliable, secure, and intuitive Full-Stack Complaint Management System built with React, Node.js, Express, and MongoDB.

---

## 1. Project Overview
**ResolveHub** is an enterprise-grade Customer Complaint Management System designed to bridge the gap between consumers, support agents, and administrative leadership. It streamlines the lifecycle of customer grievances from initial ticket submission through administrative triage, agent investigation, transparent resolution, customer verification, and full immutable audit history.

## 2. Business Problem
In modern service industries (e.g. e-commerce, banking, consumer electronics), customer dissatisfaction often escalates due to:
- **Lack of Transparency**: Customers are left in the dark after submitting a grievance.
- **Disorganized Routing**: Complaints sit in generic inboxes without clear ownership or SLA priority.
- **Accountability Gaps**: Disputed resolutions occur when there is no verifiable audit trail of who performed what action.
- **Siloed Communication**: Support agents lack structured investigation workflows.

**ResolveHub solves this** by enforcing strict Role-Based Access Control (RBAC), mandatory resolution logging, customer acceptance/reopening controls, and an event-sourced audit timeline.

---

## 3. Key Features
- **Authentication & Security**: Cookie-based JWT authentication, secure bcrypt password hashing, and role-based route protection.
- **Role-Based Access Control (RBAC)**:
  - **CUSTOMER**: File complaints, monitor live status, add notes, close accepted resolutions, reopen unresolved issues.
  - **AGENT**: View assigned queue, initiate investigation (`ASSIGNED` → `IN_PROGRESS`), add internal investigation notes, resolve tickets with mandatory explanation.
  - **ADMIN**: System-wide oversight, complaint reassignment, priority adjustment (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), ticket escalation, and category management.
- **Complaint Lifecycle Workflow**: Strict state machine transitions:
  `OPEN` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED` (with `ESCALATED` and `REOPENED` branches).
- **Audit Trail & Event History**: Dedicated, append-only `ComplaintHistory` collection logging every status update, note, assignment change, and performer role.
- **Search & Multi-Filter Query Engine**: Instant search across Complaint IDs, titles, and customer names, with dynamic filters for Status, Priority, Category, Agent, and Date ranges.
- **Interactive Dashboards**: Role-specific dashboards featuring live metric counters, status distribution progress bars, and recent activity tables.
- **Robust Validation & Error Handling**: Server-side `express-validator` schemas, client-side touched-state validation, clean HTTP status codes (`400`, `401`, `403`, `404`, `500`), and global exception handling.

---

## 4. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v7 (Role-based Protected Routes)
- **HTTP Client**: Axios with `withCredentials: true`
- **Architecture**: 4-Layer Architecture (Service Layer, State Layer, Hook Layer, Presentation Layer)
- **Styling**: Vanilla CSS & TailwindCSS utility tokens (no heavy glossy effects; clean business UI)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Web Framework**: Express 5
- **Database**: MongoDB Atlas via Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & HTTP Cookies (`cookie-parser`)
- **Password Security**: `bcryptjs`
- **Validation**: `express-validator`

---

## 5. System Architecture
ResolveHub follows a clean decoupled monolithic client-server architecture:

```
[ React Frontend (Vite on :5173) ]
       │
       │ HTTP / JSON (Credentials / Cookie-based JWT)
       ▼
[ Express API Server (Node.js on :3000) ]
       │
       ├── authUser / authorize Middleware (RBAC)
       ├── express-validator Middleware (Data Integrity)
       ├── Controllers (Business Logic & State Transitions)
       └── Central Error Handler (400, 401, 403, 404, 500)
       │
       ▼
[ MongoDB Atlas Database ]
       ├── users (Admin, Agent, Customer)
       ├── categories (Billing, Hardware, Account, etc.)
       ├── complaints (Current state, assignment, priority)
       └── complaint_histories (Immutable append-only audit trail)
```

---

## 6. Project Structure

```text
project/
├── backend/
│   ├── server.js                   # Application entry point
│   ├── package.json
│   ├── src/
│   │   ├── app.js                  # Express app & route mounting
│   │   ├── config/db.js            # MongoDB Mongoose connection
│   │   ├── controllers/            # auth, complaint, category, user controllers
│   │   ├── middleware/             # authUser, authorize, notFound, errorHandler
│   │   ├── models/                 # User, Complaint, Category, ComplaintHistory
│   │   ├── routes/                 # auth, complaint, admin, agent, customer, category, user routes
│   │   ├── validators/             # auth.validator, complaint.validator
│   │   └── seed.js                 # Database seeder (Demo accounts & categories)
│   └── tests/
│       └── suite.test.mjs          # Automated test suite (TC01-TC15)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── app/                    # App.jsx, app.routes.jsx
│       └── features/
│           ├── auth/               # Service (api.js), State (authContext), Hook (useAuth), Pages
│           ├── complaints/         # Service, Components (FilterBar, Timeline), Pages (Detail, Admin, Agent, Customer)
│           └── dashboard/          # Layout & Role-based Dashboard Pages
└── docs/                           # Comprehensive Engineering Documentation (01 to 11)
```

---

## 7. Setup & Installation Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Active internet connection (for MongoDB Atlas connection configured in `.env`)

### Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Verify environment configuration in `backend/.env`:
   ```env
   PORT=3000
   MONGO_URI=<Your MongoDB Atlas Connection String>
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```
3. Seed the database with demo users, categories, and sample complaints:
   ```bash
   npm run seed
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   The backend will start listening at `http://localhost:3000`.

### Frontend Setup
1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The web application will open at `http://localhost:5173`.

---

## 8. Demo Accounts

For quick assessment and testing, the application includes pre-configured demo credentials:

| Role | Name | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Admin User | `admin@resolvehub.com` | `admin123` | Full system management, assignment, priority, escalation |
| **AGENT 1** | Amit Kumar | `amit@resolvehub.com` | `agent123` | Assigned queue, start investigation, add notes, resolve |
| **AGENT 2** | Priya Sharma | `priya@resolvehub.com` | `agent123` | Independent agent queue, investigation, resolution |
| **CUSTOMER 1**| Rahul Verma | `rahul@example.com` | `customer123` | Submit complaints, track status, accept/close, reopen |
| **CUSTOMER 2**| Sneha Patel | `sneha@example.com` | `customer123` | Customer complaint submission and tracking |

*(Tip: The login page includes 1-click Quick Demo Login buttons to seamlessly switch between personas).*

---

## 9. Automated Testing
Run the comprehensive test suite verifying TC01 through TC15:
```bash
cd backend
npm test
```
All 15 automated test cases verify user registration, login errors, complaint submission, role authorization, resolution enforcement, closure, reopening, and security scoping.

---

## 10. Future Improvements
- Email/SMS notification webhooks upon complaint status changes.
- SLA breach escalation timers (auto-escalate if unassigned after 24 hours).
- Customer CSAT / satisfaction rating score upon ticket closure.
