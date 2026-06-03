# 🍽️ Eatify — Full-Stack Food Delivery Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**A MERN-stack food delivery platform with email-verified accounts, real-time order tracking, Razorpay payments, and a restaurant management dashboard for owners and managers.**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Installation--setup](#-installation--setup) · [API Overview](#-api-overview) · [Architecture Overview](#-architecture-overview)

</div>

---

## Project Overview

**Eatify** is a restaurant management web application built on the MERN stack (MongoDB, Express.js 5, React 19, Node.js). It supports three authenticated roles:

- **Customers** discover restaurants, search dishes, manage a single-restaurant cart, place orders via Razorpay, track delivery status in real time, manage delivery addresses, and leave item reviews.

- **Restaurant Owners** register and manage a restaurant, manage menus, process orders, view analytics and transaction history, invite a manager, and receive real-time order alerts.

- **Managers** are invited by owners via email. After verifying their email and setting a password, they can access the dashboard, menu management, and order fulfillment flows for their assigned restaurant.

The platform uses **MongoDB transactions** for atomic order placement, a **delivery status state machine**, **Razorpay HMAC-SHA256 verification**, **Socket.IO** room-based events, **Cloudinary** image uploads, **Nodemailer** for transactional email (console logging in development), and **Helmet**, **rate limiting**, **centralized error handling** (`AppError` + `asyncHandler`), and **Zod** validation across route payloads.

---

## Features

### Customer-Facing

| Feature | Description |
|---------|-------------|
| Restaurant discovery | Browse restaurants with search and pagination; deleted restaurants are hidden |
| Advanced dish search | Filter by `search` text, restaurant, location, vegetarian flag; sort by rating or price |
| Menu browsing | Restaurant detail page with items and operating hours |
| Smart cart | One cart per user with embedded items; single-restaurant enforcement (409 conflict + mismatch modal) |
| Razorpay payments | Server-side order creation, client modal, HMAC signature verification, payment audit trail |
| Retry failed payments | Unpaid orders tab with retry payment flow |
| Real-time order tracking | Socket.IO `orderStatusUpdate` events with visual progress timeline |
| Order history | Tabbed view: Active / Unpaid / Past orders |
| Order cancellation | Cancel unpaid orders only via status-update endpoint (`PATCH /orders/:orderId/cancel`) |
| Item reviews | Star ratings (1–5) with text per item per order; edit existing reviews |
| Real-time notifications | Bell icon with unread count; mark read / delete |
| Address book | CRUD for multiple saved delivery addresses |
| Profile management | Edit full name and contact number |

### Authentication

| Feature | Description |
|---------|-------------|
| Email verification | Required before login; verification link sent on registration |
| Resend verification | API endpoint to resend verification email |
| Forgot / reset password | Email link flow with token expiry (10 minutes) |
| Manager account setup | Combined verify-email + set-password flow via `/setup-manager/:token` |

### Restaurant Owner Dashboard

| Feature | Description |
|---------|-------------|
| Dashboard analytics | Revenue, order counts (pending, delivered, cancelled) via aggregation |
| Transaction ledger | Searchable table with date range filter |
| Restaurant CRUD | Create/edit restaurant with image upload and operating hours |
| Restaurant deletion | Soft delete (`status: deleted`); removes manager user accounts |
| Menu management | Full CRUD for items with image uploads |
| Order fulfillment | Status pipeline with enforced transitions |
| Real-time new order alerts | Socket.IO `newOrder` event on successful payment |
| Manager profile | Create/update manager; sends setup email to manager |

### Manager Dashboard

| Feature | Description |
|---------|-------------|
| Dashboard, menu, orders | Access via `StaffRoute` (same pages as owner for these areas) |
| Restaurant updates | Can update restaurant details for assigned restaurant |
| Real-time alerts | Receives `newOrder` notifications and Socket.IO events |
| Restricted access | Cannot create restaurant, delete restaurant, or manage manager profile |

### Platform-Wide

| Feature | Description |
|---------|-------------|
| JWT cookie authentication | httpOnly `eatify_token` cookie, `SameSite=Strict`|
| Role-based access control | `customer` / `owner` / `manager` with middleware and frontend route guards |
| Cloudinary CDN | Image uploads for restaurants and menu items |
| API versioning | All endpoints under `/api/v1/` |
| Security middleware | Helmet headers, rate limiting, 10 KB JSON body limit |
| Request logging | Morgan with request IDs |
| Zod validation | Route-level payload validation via dedicated validator schemas and middleware |
| Centralized errors | `AppError` + `asyncHandler` remove repetitive try/catch and standardize API error responses |
| MongoDB transactions | Atomic order + order-item creation |
| Error boundary | React error boundary with fallback UI |
| Code splitting | Pages lazy-loaded with `React.lazy()` + `Suspense` |
| Price drift protection | `expectedTotal` check at order placement |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.6 | UI framework |
| Vite | 8.0.12 | Build tool and dev server |
| React Router | 7.15.1 | Client-side routing with route guards |
| Axios | 1.16.1 | HTTP client (`withCredentials: true`) |
| Socket.IO Client | 4.8.3 | Real-time WebSocket communication |
| Lucide React | 1.16.0 | Icons |
| React Toastify | 11.1.0 | Toast notifications |
| Vanilla CSS | — | Component-colocated stylesheets |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 5.2.1 | HTTP framework |
| Mongoose | 9.6.2 | MongoDB ODM |
| Socket.IO | 4.8.3 | WebSocket server |
| Zod | 4.4.3 | Request validation |
| jsonwebtoken | 9.0.3 | JWT authentication |
| bcryptjs | 3.0.3 | Password hashing (10 salt rounds) |
| Multer | 2.1.1 | Multipart uploads (memory, 5 MB, images only) |
| Nodemailer | 8.0.10 | Transactional email (SMTP configurable) |
| Helmet | 8.2.0 | Security headers |
| express-rate-limit | 8.5.2 | Rate limiting |
| Morgan | 1.10.1 | HTTP logging |
| cookie-parser | 1.4.7 | Cookie parsing |
| CORS | 2.8.6 | Cross-origin requests |
| Razorpay SDK | 2.9.6 | Payment processing |
| streamifier | 0.1.1 | Buffer-to-stream for Cloudinary |

### Database & Services

| Technology | Purpose |
|------------|---------|
| MongoDB Atlas (or local) | Primary database |
| Cloudinary | Image storage and CDN |
| Razorpay | Online payments (INR) |
| Nodemailer + SMTP | Email delivery (optional; dev mode logs to console) |

### Dev Tools

| Tool | Purpose |
|------|---------|
| Nodemon | Backend auto-restart |
| Jest + Supertest | Backend testing (health check) |
| ESLint | Frontend linting |
| PostCSS + Autoprefixer | CSS processing |

---

## Architecture Overview

```
┌───────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              React 19 + Vite 8                      │  │
│  │  ┌───────────┐  ┌───────────┐  ┌────────────────┐  │  │
│  │  │ AuthCtx   │  │ CartCtx   │  │  useSocket()   │  │  │
│  │  │(JWT/Cookie)│  │(Cart CRUD)│  │ (Socket.IO)    │  │  │
│  │  └───────────┘  └───────────┘  └────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │         Axios API Layer (/api/v1)            │   │  │
│  │  │         withCredentials: true                │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────┬─────────────────────┘
                  HTTP │ REST         │ WebSocket
                       ▼              ▼
┌───────────────────────────────────────────────────────────┐
│                   SERVER (Node.js)                        │
│  Express 5 + Socket.IO + Helmet + Rate Limiting           │
│  Routes → Middleware (auth, upload, validate) → Controllers│
│  OrderService (business logic) + Mongoose Models (10)     │
└───────┬────────────────────┬─────────────────┬────────────┘
        ▼                    ▼                 ▼
   MongoDB              Cloudinary          Razorpay
```

### Order Placement & Payment Flow

```
Customer adds items to cart (single restaurant)
        │
        ▼
POST /orders (MongoDB transaction)
  ├── Validate cart, prices, restaurant active status
  └── Create Order + OrderItems atomically
        │
        ▼
POST /payments/checkout/:orderId → Razorpay order created
        │
        ▼
Razorpay Modal (client) → payment completed
        │
        ▼
POST /payments/verify
  ├── HMAC-SHA256 signature check
  ├── Razorpay API fetch to confirm "captured"
  ├── Mark order paid, clear cart
  ├── Create PaymentHistory record
  ├── Notify owner + managers
  └── Emit Socket.IO "newOrder" to restaurant room
```

---

## Installation & Setup

### Prerequisites

| Requirement | Minimum Version |
|-------------|----------------|
| Node.js | v18+ |
| npm | v9+ |
| MongoDB | Atlas (cloud) or local v6+ |
| Cloudinary account | Free tier |
| Razorpay account | Test mode keys |

### Clone & Install

```bash
git clone <repository-url>
cd "Restaurants Management"

cd backend && npm install
cd ../frontend && npm install
```

### Configure Environment

Create `backend/.env` (see [Environment Variables](#environment-variables)).

### Start Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Eatify MERN Server running on port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Vite dev server at http://localhost:5173
```

Open **http://localhost:5173**. In development, verification and password-reset links are printed to the backend console (see `sendEmail.js`).

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# Authentication
JWT_SECRET=your_long_random_secret_key_here

# CORS
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# SMTP (optional — required for real email, currently console based verification)
# Uncomment sendEmail transporter code in utils/sendEmail.js when configuring
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_EMAIL=your_smtp_user
SMTP_PASSWORD=your_smtp_password
FROM_NAME=Eatify
FROM_EMAIL=noreply@example.com
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000
```
---

## API Overview

All endpoints are prefixed with `/api/v1`. Authentication uses the httpOnly `eatify_token` cookie (Bearer token fallback supported).

### Authentication

| Method | Endpoint | Auth | Rate Limited | Description |
|--------|----------|------|:---:|-------------|
| `POST` | `/auth/register` | ❌ | ✅ 10/15 min | Register user; sends verification email |
| `POST` | `/auth/login` | ❌ | ✅ 10/15 min | Login (requires verified email) |
| `GET` | `/auth/verify-email/:token` | ❌ | — | Verify email address |
| `POST` | `/auth/resend-verification` | ❌ | — | Resend verification email |
| `POST` | `/auth/forgot-password` | ❌ | — | Send password reset email |
| `PUT` | `/auth/reset-password/:token` | ❌ | — | Reset password via token |
| `PUT` | `/auth/setup-manager/:token` | ❌ | — | Manager verify email + set password |
| `POST` | `/auth/logout` | ✅ | — | Clear auth cookie |
| `GET` | `/auth/profile` | ✅ | — | Get current user session |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT` | `/users/profile` | ✅ | Update profile (`fullName`, `contactNumber`, `avatar`) |
| `POST` | `/users/addresses` | ✅ | Add delivery address |
| `PUT` | `/users/addresses/:addressId` | ✅ | Update address |
| `DELETE` | `/users/addresses/:addressId` | ✅ | Delete address |

### Restaurants

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/restaurants` | ✅ Owner | Create restaurant (multipart image) |
| `GET` | `/restaurants` | ❌ | List active restaurants (search, pagination) |
| `GET` | `/restaurants/mine` | ✅ Owner/Manager | Get assigned restaurant + menu |
| `GET` | `/restaurants/:id` | ❌ | Get restaurant by ID + menu |
| `PUT` | `/restaurants/:id` | ✅ Owner/Manager | Update restaurant |
| `DELETE` | `/restaurants/:id` | ✅ Owner | Soft delete restaurant |

### Menu Items

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/items` | ❌ | List items (pagination) |
| `GET` | `/items/search` | ❌ | Advanced search with filters (`search`, `restaurantName`, `location`, `isVegetarian`, `sortBy`, `page`, `limit`) |
| `POST` | `/items/:restaurantId` | ✅ Owner/Manager | Add menu item |
| `PUT` | `/items/:itemId` | ✅ Owner/Manager | Update menu item |
| `DELETE` | `/items/:itemId` | ✅ Owner/Manager | Delete menu item |

### Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/cart` | ✅ | Add item (409 on restaurant mismatch) |
| `GET` | `/cart` | ✅ | Get cart with populated item details |
| `PATCH` | `/cart/:cartId` | ✅ | Update item quantity (subdocument `_id`) |
| `DELETE` | `/cart/:cartId` | ✅ | Remove item from cart |
| `DELETE` | `/cart/clear` | ✅ | Clear entire cart |

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/orders` | ✅ | Place order (Zod validated, transaction) |
| `GET` | `/orders/my-orders` | ✅ | User orders (`current`, `payment-pending`, `delivered`) |
| `PATCH` | `/orders/:orderId/cancel` | ✅ | Cancel unpaid order (status update) |
| `GET` | `/orders/dashboard-stats` | ✅ Owner/Manager | Dashboard statistics |
| `GET` | `/orders/transactions` | ✅ Owner/Manager | Transaction ledger |
| `GET` | `/orders/restaurant-orders` | ✅ Owner/Manager | Restaurant paid orders |
| `PATCH` | `/orders/:orderId/delivery` | ✅ Owner/Manager | Update delivery status |

### Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/payments/checkout/:orderId` | ✅ | Create Razorpay order |
| `POST` | `/payments/verify` | ✅ | Verify payment signature |

### Feedback

| Method | Endpoint | Auth | Rate Limited | Description |
|--------|----------|------|:---:|-------------|
| `POST` | `/feedback` | ✅ | ✅ 20/hr | Submit item review |
| `GET` | `/feedback/item/:itemId` | ❌ | — | Get item reviews |
| `GET` | `/feedback/check/:orderId/:itemId` | ✅ | — | Check if user reviewed |
| `PUT` | `/feedback/:feedbackId` | ✅ | — | Update review |

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/notifications` | ✅ | Last 30 notifications + unread count |
| `PATCH` | `/notifications/:id/read` | ✅ | Mark as read |
| `PATCH` | `/notifications/read-all` | ✅ | Mark all as read |
| `DELETE` | `/notifications/:id` | ✅ | Delete notification |

### Managers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/managers` | ✅ Owner | Create manager + send setup email |
| `GET` | `/managers/my-restaurant` | ✅ Owner | Get manager profile |
| `PUT` | `/managers/:managerId` | ✅ Owner | Update manager profile |

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/health` | ❌ | Server health check |

---

## Authentication Flow

### Registration & Login

```
1. POST /auth/register
   → User created (isEmailVerified: false)
   → Verification email sent with link to /verify-email/:token

2. GET /auth/verify-email/:token
   → Sets isEmailVerified: true

3. POST /auth/login
   → Rejects unverified users (auto-resends verification email)
   → Sets httpOnly eatify_token cookie (30-day maxAge, JWT expires in 7 days)
   → Blocks managers if restaurant is deleted
```

### Password Reset

```
POST /auth/forgot-password → email with /reset-password/:token link
PUT /auth/reset-password/:token → set new password (also verifies email if unverified)
```

### Manager Setup

```
Owner creates manager via POST /managers
→ User account created (role: manager, random password)
→ Email sent with /setup-manager/:token link
→ PUT /auth/setup-manager/:token sets password and verifies email
→ Manager logs in and accesses StaffRoute-protected pages
```

### Session & Authorization

```
Bootstrap: GET /auth/profile (cookie sent automatically)

Backend: protect middleware reads eatify_token cookie or Bearer token

Frontend guards:
  ProtectedRoute  → any authenticated user
  OwnerRoute      → owner role only
  StaffRoute      → owner or manager role

Backend: authorizeRole(...roles) on route groups
Controller-level ownership checks for restaurant-scoped resources
```

---

## User Roles & Permissions

| Role | How Created | Capabilities |
|------|-------------|--------------|
| **Customer** | Self-registration (`role: customer`) | Browse, cart, order, pay, track, review, manage addresses and profile |
| **Owner** | Self-registration (`role: owner`) | All customer capabilities plus: create/edit/delete restaurant, manage manager, full owner dashboard |
| **Manager** | Created by owner via dashboard | Dashboard, menu CRUD, order fulfillment, restaurant updates for assigned restaurant; no restaurant creation/deletion or manager management |

### Route Access Matrix (Frontend)

| Route | Customer | Owner | Manager |
|-------|:--------:|:-----:|:-------:|
| `/`, `/restaurants`, `/search` | ✅ | ✅ | ✅ |
| `/checkout`, `/orders`, `/profile` | ✅ | ✅ | ✅ |
| `/owner/dashboard`, `/owner/menu`, `/owner/orders` | ❌ | ✅ | ✅ |
| `/owner/restaurant`, `/owner/manager` | ❌ | ✅ | ❌ |

---

## Project Structure

```
Restaurants Management/
├── backend/
│   ├── __tests__/health.test.js
│   ├── config/                  # db.js, cloudinary.js
│   ├── controllers/             # auth, cart, feedback, item, manager,
│   │                            # notification, order, payment, restaurant, user
│   ├── middleware/              # auth, errorHandler, upload, validate
│   ├── models/                  # User, Restaurant, Item, Cart, Order,
│   │                            # OrderItem, Feedback, Notification,
│   │                            # Manager, PaymentHistory
│   ├── routes/v1/               # Versioned API routes (10 files)
│   ├── services/orderService.js # Order business logic
│   ├── socket/socketHandler.js  # Socket.IO auth + rooms
│   ├── utils/                   # cloudinaryUpload, generateToken, sendEmail
│   ├── validators/               # auth, cart, feedback, item, manager,
│   │                             # order, restaurant, user validators
│   └── server.js
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/                 # Axios service modules
│       ├── components/          # cart, common, feedback, layout, restaurant
│       ├── context/             # AuthContext, CartContext
│       ├── hooks/useSocket.js
│       ├── lib/formatCurrency.js
│       ├── pages/
│       │   ├── auth/            # Login, Register, Forgot/Reset Password,
│       │   │                    # VerifyEmail, SetupManager, SetupPassword
│       │   ├── customer/        # Home, Restaurants, Search, Checkout, Orders, Profile
│       │   └── owner/           # Dashboard, RestaurantSetup, Menu, Orders, Manager
│       ├── styles/index.css
│       └── App.jsx
│
└── README.md
```

---

## Database Models & Relationships

```
User ──(1:1)──▶ Restaurant (owner, unique)
  │                  │
  │                  ├──(1:N)── Item
  │                  └──(1:1)── Manager ──(N:1)── User (manager account)
  │
  ├──(1:1)── Cart (embedded items[])
  └──(1:N)── Order ──(1:N)── OrderItem
                  │
                  ├──(1:N)── Notification
                  ├──(1:N)── Feedback ──(N:1)── Item, Restaurant
                  └──(1:1)── PaymentHistory
```

| Model | Key Fields | Notes |
|-------|------------|-------|
| **User** | username, email, password, role, isEmailVerified, verification/reset tokens, profile (fullName, avatar, contactNumber, addresses[]) | Password hashed on save |
| **Restaurant** | owner, name, location, city, hours, image, status (active/deleted), averageRating | Soft delete support |
| **Item** | restaurant, name, price, image, isVegetarian, averageRating | Text index on name+description |
| **Cart** | user (unique), restaurant, items[{ item, quantity }] | One cart document per user |
| **Order** | user, restaurant, deliveryInfo, totalPrice, paymentStatus, deliveryStatus, razorpayOrderId | Status state machine |
| **OrderItem** | order, item, itemName, itemPrice, quantity, totalPrice, deletedAt | Price snapshot at order time |
| **Feedback** | user, item, restaurant, order, rating, experience | Unique per user+item+order |
| **Notification** | recipient, type, message, relatedOrder, isRead | TTL: auto-delete after 30 days |
| **Manager** | restaurant (unique), user, contact/banking details | Linked to User account |
| **PaymentHistory** | order, razorpayOrderId, razorpayPaymentId, razorpaySignature | Payment audit trail |

### Delivery Status State Machine

```
pending → confirmed → preparing → out-for-delivery → delivered
   │           │            │
   └───────────┴────────────┴──→ cancelled
```

Terminal states (`delivered`, `cancelled`) have no outgoing transitions.

---

## Security Features

| Feature | Implementation |
|---------|----------------|
| JWT authentication | 7-day token in httpOnly cookie (`eatify_token`) |
| Cookie security | `httpOnly`, `SameSite=Strict`, `secure` in production |
| Password hashing | bcryptjs, 10 salt rounds |
| Email verification | Required before login |
| Token hashing | Verification and reset tokens stored as SHA-256 hashes |
| Role authorization | `authorizeRole()` middleware + frontend route guards |
| Rate limiting | Auth: 10 req/15 min; Feedback: 20 req/hour |
| Helmet | Security HTTP headers |
| Request size limit | `express.json({ limit: "10kb" })` |
| Input validation | Zod schemas for orders; Mongoose schema validation |
| Payment verification | HMAC-SHA256 + Razorpay API status check |
| Socket.IO auth | JWT verified on handshake; room join authorization |
| Image upload filter | Multer accepts images only, 5 MB max |
| Soft deletes | Restaurants marked deleted rather than hard removed |


## Future Improvements

- [ ] Profile avatar upload UI with Cloudinary
- [ ] Frontend integration for resend-verification endpoint
- [ ] Production-ready SMTP email templates (HTML)
- [ ] CSRF protection for cookie-based auth
- [ ] Delivery fee calculation
- [ ] Coupon / discount system
- [ ] Order tracking map with geolocation
- [ ] Admin panel for platform-wide management
- [ ] Secure `ENCRYPTION_KEY` management (key rotation / remove dev fallback) for production
- [ ] React Query / SWR for server state caching
- [ ] Expanded test coverage beyond health check
- [ ] CI/CD pipeline with GitHub Actions
- [ ] TypeScript migration
- [ ] Vite dev proxy configuration

---

<div align="center">

**Built with the MERN Stack**

MongoDB · Express.js 5 · React 19 · Node.js

</div>
