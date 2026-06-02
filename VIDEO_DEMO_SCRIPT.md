# Eatify — Full Demo Video Script & Report

**Project:** Eatify (Restaurant Management & Food Delivery)  
**Stack:** MongoDB, Express 5, React 19, Node.js (+ Socket.IO, Razorpay, Cloudinary)  
**Purpose:** Complete narration guide — say what you need; cut the rest.

---

## Table of Contents

1. [Before You Record](#before-you-record)
2. [Section 1 — Opening & Problem Statement](#section-1--opening--problem-statement)
3. [Section 2 — What Is Eatify?](#section-2--what-is-eatify)
4. [Section 3 — MERN Stack Explained](#section-3--mern-stack-explained)
5. [Section 4 — Architecture & How Data Flows](#section-4--architecture--how-data-flows)
6. [Section 5 — Project Structure Tour](#section-5--project-structure-tour)
7. [Section 6 — Database & Models](#section-6--database--models)
8. [Section 7 — Authentication & Roles](#section-7--authentication--roles)
9. [Section 8 — Customer Demo (Full)](#section-8--customer-demo-full)
10. [Section 9 — Owner Demo (Full)](#section-9--owner-demo-full)
11. [Section 10 — Manager Flow](#section-10--manager-flow)
12. [Section 11 — Order & Payment Pipeline](#section-11--order--payment-pipeline)
13. [Section 12 — Real-Time (Socket.IO)](#section-12--real-time-socketio)
14. [Section 13 — Security & Best Practices](#section-13--security--best-practices)
15. [Section 14 — Backend Code Walkthrough](#section-14--backend-code-walkthrough)
16. [Section 15 — Frontend Patterns](#section-15--frontend-patterns)
17. [Section 16 — Third-Party Services](#section-16--third-party-services)
18. [Section 17 — Deployment & Environment](#section-17--deployment--environment)
19. [Section 18 — Challenges & Future Work](#section-18--challenges--future-work)
20. [Section 19 — Closing](#section-19--closing)
21. [Master Glossary](#master-glossary)
22. [Quick “What to Show” Index](#quick-what-to-show-index)

---

## Before You Record

### Accounts & data to prepare

| Role | What to set up |
|------|----------------|
| **Customer** | Registered, email verified, logged in, 1–2 saved addresses in Profile |
| **Owner** | Restaurant created with image, 4–6 menu items with photos, operating hours set |
| **Manager** | Optional: owner already invited manager and they completed `/setup-manager/:token` |

### Servers

```bash
# Terminal 1
cd backend && npm run dev    # Port 8000

# Terminal 2
cd frontend && npm run dev   # http://localhost:5173
```

### Environment (do not show secrets on camera)

- `MONGO_URI`, `JWT_SECRET`, Cloudinary keys, Razorpay **test** keys in `backend/.env`
- `VITE_API_URL=http://localhost:8000/api/v1` in `frontend/.env`

### Recording tips

- Use two browser windows (customer + owner) for real-time demo
- Zoom browser to 110–125%
- Hide bookmarks bar; close unrelated tabs
- Razorpay test card: use dashboard test mode credentials
- In development, verification emails print to **backend console** (`sendEmail.js`)

---

## Section 1 — Opening & Problem Statement

**SHOW:** Title slide or Eatify home page (`/`)

**SAY:**

> Hello, my name is [Your Name]. In this video I will present **Eatify**, a full-stack **food delivery and restaurant management** web application that I built using the **MERN stack**.
>
> Modern restaurants need more than a static menu online. They need a system where **customers** can discover food, place orders, pay securely, and track delivery — while **restaurant owners** manage their menu, fulfill orders, view sales analytics, and optionally delegate work to a **manager**.
>
> Eatify solves that problem in one integrated platform. It includes **email-verified authentication**, **role-based access control**, **Razorpay online payments**, **real-time order updates** using Socket.IO, and **image hosting** through Cloudinary.
>
> I will first explain the technology stack and architecture, then walk through the application from both the **customer** and **restaurant owner** perspectives, and finally discuss security, database design, and how the backend enforces business rules.

**OPTIONAL SHOW:** Logo, GitHub repo link, your name and course/project title.

---

## Section 2 — What Is Eatify?

**SHOW:** README feature table or live app navbar

**SAY:**

> **Eatify** is a MERN-stack food delivery platform. The name reflects the idea of eating made easy through technology.
>
> The application supports **three authenticated roles**:
>
> 1. **Customer** — browses restaurants, searches dishes, maintains a cart, checks out with Razorpay, tracks order status in real time, manages delivery addresses, and leaves star ratings and written reviews after delivery.
>
> 2. **Restaurant Owner** — registers as an owner, creates exactly **one restaurant** per account, uploads restaurant and menu images, manages the menu with full CRUD operations, processes incoming orders through a delivery status pipeline, views dashboard analytics and a searchable transaction ledger, invites a manager, and receives real-time alerts when a new paid order arrives.
>
> 3. **Manager** — is **not** self-registered through the public signup form. The owner creates the manager account from the dashboard. The manager receives an email with a setup link, verifies their email, sets a password, and then can access the dashboard, menu management, and order fulfillment — but cannot create or delete the restaurant or manage other managers.
>
> From a software engineering perspective, Eatify demonstrates a **client–server architecture**: a React single-page application talks to a Node.js REST API, which persists data in MongoDB and integrates external services for payments, images, and email.

---

## Section 3 — MERN Stack Explained

**SHOW:** Architecture diagram (from README) or draw on whiteboard:

```
Browser → React (Vite) → HTTP/REST + WebSocket → Express (Node) → MongoDB
                                              ↘ Cloudinary, Razorpay
```

**SAY:**

> Let me explain **MERN**, the foundation of this project.
>
> **M — MongoDB**  
> MongoDB is a **NoSQL document database**. Instead of tables with fixed columns like SQL, it stores **JSON-like documents** in **collections**. In Eatify, collections include users, restaurants, items, carts, orders, and more. I use **Mongoose**, which is an **ODM** — an Object Data Modeling library — to define **schemas** (rules for each document’s shape), validate data, and define **relationships** between documents using references (for example, an order references a user and a restaurant by their IDs).
>
> **E — Express.js**  
> Express is a **minimal web framework for Node.js**. It handles HTTP requests, defines **routes** (URL paths and methods like GET and POST), runs **middleware** (functions that execute before your main logic), and sends JSON responses. Eatify uses **Express version 5** and organizes all API routes under **`/api/v1`** for **API versioning**, so future breaking changes could go to `/api/v2` without breaking old clients.
>
> **R — React**  
> React is a **JavaScript library for building user interfaces** using **components** — reusable pieces of UI. Eatify’s frontend uses **React 19** with **Vite 8** as the build tool. Vite provides fast development with hot module replacement. The UI is a **SPA**, a **Single Page Application**: when you navigate from Home to Restaurants, React Router swaps components without reloading the entire HTML page from the server.
>
> **N — Node.js**  
> Node.js lets you run JavaScript **on the server**, outside the browser. The backend entry point is `backend/server.js`, which creates an HTTP server, attaches Socket.IO for WebSockets, connects to MongoDB, and mounts all route modules.
>
> **Beyond MERN**, this project also uses:
> - **Socket.IO** for real-time bidirectional communication
> - **Razorpay** as the payment gateway (INR)
> - **Cloudinary** as cloud image storage and CDN
> - **JWT** (JSON Web Tokens) for authentication, delivered via **httpOnly cookies**
> - **Zod** for request body validation
> - **Axios** on the frontend as the HTTP client

**TERMS TO MENTION IF ASKED:**

| Term | One-line definition |
|------|---------------------|
| NoSQL | Flexible schema; documents instead of rigid tables |
| REST | Representational State Transfer — resources identified by URLs, manipulated with HTTP verbs |
| SPA | Single Page Application — client-side routing |
| ODM | Object Document Mapper — Mongoose maps JS classes to MongoDB |
| Middleware | Functions in the request pipeline (auth, validation, error handling) |

---

## Section 4 — Architecture & How Data Flows

**SHOW:** `README.md` architecture ASCII diagram or `frontend/src/App.jsx` provider tree

**SAY:**

> Here is the **high-level architecture** of Eatify.
>
> On the **client side**, the browser runs the React application. Two React **Context** providers wrap the app: **AuthContext** holds the logged-in user and role helpers like `isOwner` and `isRestaurantStaff`; **CartContext** syncs the shopping cart with the server so the cart survives page refreshes and works across tabs for the same user.
>
> All API calls go through a shared **Axios instance** in `frontend/src/api/axios.js` with `withCredentials: true`, which tells the browser to send **cookies** (including the JWT cookie) on every request to the backend. Separate API modules (`authAPI.js`, `orderAPI.js`, etc.) keep each domain’s endpoints organized.
>
> For **real-time** features, a custom hook `useSocket.js` connects **socket.io-client** to the same server host. Customers join a **user room**; owners and managers join a **restaurant room**.
>
> On the **server side**, Express receives REST requests. The typical pipeline is:
>
> **Route → Middleware (protect, authorizeRole, upload, validate) → Controller → Service (for complex logic) → Mongoose Model → MongoDB**
>
> Errors bubble up to a global **error handler** middleware that returns consistent JSON error responses.
>
> External services:
> - **MongoDB Atlas** (or local MongoDB) stores all application data
> - **Cloudinary** receives image buffers uploaded via Multer and returns CDN URLs stored in the database
> - **Razorpay** creates payment orders and confirms capture status after the client pays

**SHOW (optional):** `backend/server.js` — point at `app.use("/api/v1/auth", ...)`, helmet, cors, rate limit.

**SAY (order placement summary):**

> When a customer places an order, the flow is deliberately **two-phase**: first we create an **unpaid order** in a **MongoDB transaction** (order header plus line items), then we initiate **Razorpay checkout**, and only after **signature verification** on the server do we mark the order paid, clear the cart, write a payment history record, notify the restaurant, and emit a Socket.IO `newOrder` event. This prevents marking an order as paid without actual payment confirmation.

---

## Section 5 — Project Structure Tour

**SHOW:** VS Code / file tree — `backend/` and `frontend/src/`

**SAY:**

> The repository is split into **backend** and **frontend** folders — a common MERN layout.
>
> **Backend (`backend/`):**
> - `server.js` — application entry, middleware, route mounting, Socket.IO initialization
> - `config/db.js` — MongoDB connection using `MONGO_URI`
> - `config/cloudinary.js` — Cloudinary SDK configuration
> - `routes/v1/` — versioned route files (auth, users, restaurants, items, cart, orders, payments, feedback, managers, notifications)
> - `controllers/` — request handlers; parse input, call services/models, send responses
> - `services/orderService.js` — core business logic for placing orders and updating delivery status (state machine)
> - `models/` — Mongoose schemas (User, Restaurant, Item, Cart, Order, OrderItem, Feedback, Notification, Manager, PaymentHistory)
> - `middleware/authMiddleware.js` — JWT verification and role authorization
> - `middleware/validate.js` + `validators/orderValidator.js` — Zod validation
> - `socket/socketHandler.js` — WebSocket authentication and room events
> - `utils/` — token generation, email sending, Cloudinary upload helpers
>
> **Frontend (`frontend/src/`):**
> - `main.jsx` — React entry point
> - `App.jsx` — Router, lazy-loaded pages, layout (Navbar, Footer, CartSidebar)
> - `pages/customer/` — public and customer flows (Home, Restaurants, Checkout, Orders, Profile)
> - `pages/owner/` — owner/manager dashboard pages
> - `pages/auth/` — Login, Register, password reset, email verify, manager setup
> - `components/` — reusable UI (cart, restaurant cards, feedback, layout, route guards)
> - `context/` — AuthContext, CartContext
> - `api/` — Axios wrappers per resource
> - `hooks/useSocket.js` — Socket.IO connection helper
>
> This structure follows **separation of concerns**: routes don’t contain business rules; controllers stay thin; complex order logic lives in `orderService.js`; UI logic stays in React pages and contexts.

**SHOW:** Route guards — `ProtectedRoute.jsx`, `StaffRoute.jsx`, `OwnerRoute.jsx`

**SAY:**

> On the frontend, **route guards** are React components that wrap routes. If the user is not authenticated, `ProtectedRoute` redirects to login. `StaffRoute` allows only `owner` or `manager`. `OwnerRoute` allows only `owner`. These mirror the backend’s `authorizeRole` middleware so users cannot access admin pages by typing URLs manually — though the real security enforcement always happens on the server.

---

## Section 6 — Database & Models

**SHOW:** `backend/models/` files or README relationship diagram

**SAY:**

> Eatify uses **10 Mongoose models**. Here is what each stores and why it matters.
>
> **User** — `username`, `email`, `password` (hashed, not returned by default), `role` (`customer` | `owner` | `manager`), `isEmailVerified`, tokens for email verification and password reset, and `profile` with `fullName`, `contactNumber`, and an array of **delivery addresses**. Passwords are hashed with **bcrypt** in a `pre('save')` hook.
>
> **Restaurant** — linked to one **owner** (unique: one restaurant per owner). Stores name, location fields, contacts, `openTime`/`closeTime`, `restaurantImage` URL, `status` (`active` or `deleted` for soft delete), and aggregated `averageRating`.
>
> **Item** — menu items belonging to a restaurant: name, description, price, image, `isVegetarian`, ratings.
>
> **Cart** — one document per user (`user` is unique). Contains `restaurant` ID and embedded `items` array with `item` reference and `quantity` (1–50). Enforces **single-restaurant cart** at the application level.
>
> **Order** — placed by a user at a restaurant. Includes `deliveryInfo` snapshot (name, phone, address fields), `totalPrice`, `paymentStatus` boolean, `deliveryStatus` enum, and `razorpayOrderId`.
>
> **OrderItem** — line items for an order. Stores **price snapshot** (`itemName`, `itemPrice`, `quantity`, `totalPrice`) so historical orders stay correct even if menu prices change later. `deletedAt` supports soft-delete when an unpaid order is cancelled.
>
> **PaymentHistory** — audit trail: Razorpay order ID, payment ID, and signature after successful verification.
>
> **Feedback** — per user, per item, per order review (rating 1–5, text). Unique compound index prevents duplicate reviews. Updating feedback recalculates item and restaurant average ratings.
>
> **Notification** — in-app notifications with types like `order_update`, `new_order`, `system_alert`. TTL index auto-deletes documents after 30 days.
>
> **Manager** — links a `user` account to a `restaurant` with contact and banking details (informational; no payout integration in this version).
>
> **Delivery status state machine** — valid statuses: `pending`, `confirmed`, `preparing`, `out-for-delivery`, `delivered`, `cancelled`. Transitions are strict in `orderService.js`. For example, from `pending` you can go to `confirmed` or `cancelled`, but you cannot skip directly to `delivered`. Terminal states `delivered` and `cancelled` have no outgoing transitions. This prevents invalid order states in production.

**SHOW:** `backend/models/Order.js` — `deliveryStatus` enum

---

## Section 7 — Authentication & Roles

**SHOW:** Login page, Register page, or `authController.js` / `AuthContext.jsx`

**SAY:**

> Authentication is **JWT-based** but the token is stored in an **httpOnly cookie** named `eatify_token`, not in JavaScript-accessible storage. That mitigates **XSS** theft of tokens because malicious scripts in the browser cannot read httpOnly cookies.
>
> **Registration flow:**
> 1. User submits `POST /api/v1/auth/register` with username, email, password, and role (`customer` or `owner` from the dropdown — managers are not created here).
> 2. Server creates user with `isEmailVerified: false`, hashes password, generates verification token (stored as SHA-256 hash in DB), sends email with link to `/verify-email/:token`.
> 3. User clicks link → `GET /auth/verify-email/:token` sets `isEmailVerified: true`.
> 4. **Login** is blocked until email is verified. If an unverified user tries to login, the API rejects and can resend verification.
>
> **Login flow:**
> 1. `POST /auth/login` with email and password.
> 2. Server checks bcrypt password, email verified flag, and for managers whether restaurant is deleted.
> 3. Server signs JWT with `JWT_SECRET`, payload `{ id: userId }`, expiry **7 days**.
> 4. Cookie set: httpOnly, `SameSite=Strict`, `secure` in production, 30-day maxAge on cookie (JWT itself expires in 7 days).
>
> **Session bootstrap:** On app load, `AuthContext` calls `GET /auth/profile` with credentials. If cookie is valid, user object populates; otherwise user stays null.
>
> **Logout:** `POST /auth/logout` clears the cookie; frontend clears user state.
>
> **Password reset:** `POST /auth/forgot-password` sends reset link; `PUT /auth/reset-password/:token` sets new password (token expires in 10 minutes).
>
> **Backend authorization:** `protect` middleware attaches `req.user`. `authorizeRole('owner', 'manager')` checks role array.
>
> **Frontend authorization:** Route guards + Navbar hides links based on `user.role`. Owners see Setup and Manager links; managers do not. Staff do not see the customer cart icon.
>
> **Role capabilities summary:**
> - Customer: browse, cart, order, pay, track, review, profile/addresses
> - Owner: everything staff can do + create/delete restaurant + invite manager
> - Manager: dashboard, menu, orders, update restaurant — no restaurant creation/deletion, no manager CRUD

**SHOW:** Register with role dropdown; verify email (dev: backend console link); login; profile page

**OPTIONAL SAY (manager):**

> Managers are created by the owner via `POST /api/v1/managers`. A user row is created with role `manager` and a random password. An email points to `/setup-manager/:token` where they set their real password and verify email in one step.

---

## Section 8 — Customer Demo (Full)

### 8.1 Home & discovery

**SHOW:** `http://localhost:5173/` — HomePage

**SAY:**

> As a **customer**, I start on the **home page**. Here I see featured restaurants and top-rated dishes, category chips, and a search bar. This page calls public APIs — no login required — demonstrating that read-heavy endpoints are open while write operations require authentication.
>
> I can click **Restaurants** to see a paginated list with search. Each restaurant card shows key info and ratings.

**SHOW:** `/restaurants` → click one restaurant → `/restaurants/:id`

**SAY:**

> On the **restaurant detail page**, I see the full menu, operating hours, and whether the restaurant is currently open based on `openTime` and `closeTime`. Each dish is an **ItemCard** component showing price, veg/non-veg flag, image from Cloudinary, and average rating. I can open **reviews** modal to read other customers’ feedback before ordering.

### 8.2 Search

**SHOW:** `/search?query=...` or navbar search

**SAY:**

> The **search page** hits `GET /api/v1/items/search` with query parameters: item name, restaurant name, location, vegetarian filter, and sort by rating or price. This shows how REST APIs use **query strings** for filtering without creating a new endpoint per filter combination.

### 8.3 Registration / login (if demonstrating auth)

**SHOW:** `/register` → `/login`

**SAY:**

> I register as a **customer** with username, email, and password. I select role Customer. After registration I verify email — in development the verification URL is logged in the backend terminal. Once verified, I log in and the server sets the JWT cookie automatically; I don’t manually copy tokens.

### 8.4 Cart

**SHOW:** Add items → open CartSidebar (navbar cart icon)

**SAY:**

> When I click **Add to cart**, the frontend calls `POST /api/v1/cart` through **CartContext**. The cart is **server-side**, not only in browser memory, so it persists across sessions.
>
> Important business rule: **one restaurant per cart**. If I already have items from Restaurant A and try to add from Restaurant B, the API returns **HTTP 409 Conflict** with code `RESTAURANT_MISMATCH`. The UI shows a **Restaurant Mismatch Modal** offering to clear the cart and add the new item. I’ll demonstrate that now.
>
> [Demonstrate mismatch, then clear and add.]
>
> I can update quantities with `PATCH /cart/:cartId` or remove lines. Quantity is capped between 1 and 50 in the schema.

### 8.5 Profile & addresses

**SHOW:** `/profile`

**SAY:**

> On the **profile page**, I update my full name and contact number via `PUT /users/profile`. I can add, edit, and delete **delivery addresses** — each with title, street, city, state, pin code. These addresses appear as options during checkout so repeat customers don’t retype data.

### 8.6 Checkout

**SHOW:** `/checkout` — CartSidebar → Checkout

**SAY:**

> I proceed to **checkout**. I select or enter delivery details. The page shows order summary with prices formatted in INR using a small utility `formatCurrency.js`.
>
> When I confirm, the app calls `POST /api/v1/orders` with delivery info and an **expectedTotal** — the client sends what it calculated; the server recomputes from live database prices and rejects if they differ by more than one paisa. This is **price drift protection** against tampered requests.
>
> The server runs a **MongoDB multi-document transaction**: validates cart not empty, restaurant is active, creates **Order** and **OrderItem** documents, but does **not** clear the cart yet because payment is still pending.

### 8.7 Razorpay payment

**SHOW:** Razorpay modal (test mode)

**SAY:**

> Next, `POST /payments/checkout/:orderId` creates a Razorpay order on the server (amount in **paise**). The frontend dynamically loads Razorpay’s checkout script and opens the payment modal.
>
> After I pay in test mode, the handler calls `POST /payments/verify` with `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
>
> On the server, we:
> 1. Verify **HMAC-SHA256** signature using the Razorpay secret
> 2. Fetch payment from Razorpay API and confirm status is **captured**
> 3. Set `paymentStatus: true` on the order
> 4. Clear the user’s cart
> 5. Save **PaymentHistory** for audit
> 6. Create **notifications** for owner and managers
> 7. Emit Socket.IO event **`newOrder`** to room `restaurant_{restaurantId}`
>
> Then I’m redirected to **order confirmation** page.

### 8.8 Orders & tracking

**SHOW:** `/orders` — tabs: Active, Unpaid, Delivered

**SAY:**

> On **My Orders**, I see three tabs:
> - **Active** — paid orders still in progress
> - **Unpaid** — orders placed but payment not completed; I can retry Razorpay from here
> - **Delivered** — completed orders where I can leave feedback
>
> Each active order shows a **visual timeline** of delivery status. When the restaurant updates status on their dashboard, I receive **`orderStatusUpdate`** over Socket.IO without refreshing the page — this is more efficient than **polling** the server every few seconds.
>
> I can **cancel** only **unpaid** orders via `DELETE /orders/:orderId`.

**SHOW:** Notification bell — NotificationDropdown

**SAY:**

> The **notification dropdown** loads from `GET /notifications`, shows unread count, and listens on Socket for new alerts. I can mark read or delete individual notifications.

### 8.9 Reviews

**SHOW:** Delivered order → FeedbackForm; or ReviewsModal on menu

**SAY:**

> After delivery, I submit a **feedback** entry: star rating 1–5 and optional text per item per order. The backend enforces one review per user-item-order combination. Aggregated ratings update the **Item** and **Restaurant** documents’ `averageRating` and `totalRatings` fields so discovery pages stay accurate.

---

## Section 9 — Owner Demo (Full)

**SHOW:** Log in as owner — navbar: Dashboard, Menu, Orders, Setup, Manager

**SAY:**

> Now I switch to the **restaurant owner** perspective. Owners register with role Owner at signup. The navbar changes: no shopping cart; instead staff links for operations.

### 9.1 Restaurant setup

**SHOW:** `/owner/restaurant` — RestaurantSetupPage

**SAY:**

> First, **restaurant setup**. An owner can have **only one restaurant** — enforced by a unique index on the `owner` field in the Restaurant model.
>
> I enter name, address fields, contact numbers, operating hours, and upload a cover image. The form uses **multipart/form-data**. Multer on the server accepts the file in memory (max 5 MB, images only), uploads to **Cloudinary**, and stores the returned URL in MongoDB.
>
> Owners can **update** details later; **managers** can also update but not delete. **Delete** is a **soft delete**: `status` becomes `deleted`, which blocks new orders and affects manager login.

### 9.2 Menu management

**SHOW:** `/owner/menu` — MenuManagementPage

**SAY:**

> **Menu management** is full **CRUD** on items: create with name, description, price, vegetarian flag, and image; edit; delete. All item routes require `owner` or `manager` role and verify the item belongs to their restaurant. This is **resource-level authorization** beyond just role checks.

### 9.3 Dashboard & transactions

**SHOW:** `/owner/dashboard` — OwnerDashboardPage

**SAY:**

> The **dashboard** calls `GET /orders/dashboard-stats` which uses MongoDB **aggregation** to compute metrics: revenue, counts of pending, delivered, and cancelled orders.
>
> Below that, the **transaction ledger** calls `GET /orders/transactions` with optional **search** and **date range** filters — useful for accounting and dispute resolution.
>
> The dashboard also uses Socket.IO to refresh when new orders arrive — the same `newOrder` event customers trigger after payment.

### 9.4 Order fulfillment

**SHOW:** `/owner/orders` — OrdersManagementPage

**SAY:**

> On **orders management**, I see paid orders for my restaurant. For each order I advance **delivery status** step by step: pending → confirmed → preparing → out for delivery → delivered.
>
> If I try an invalid jump — for example from pending straight to delivered — the API returns an error because `orderService.js` implements a **finite state machine**. Cancellation is allowed from early states and soft-deletes order line items.
>
> Each status change persists to MongoDB, creates a notification for the customer, and emits **`orderStatusUpdate`** to the customer’s user room so their timeline updates live.

**SHOW (split screen):** Owner changes status; customer Orders page updates

**SAY:**

> This demonstrates **event-driven architecture** on top of REST: HTTP for commands and mutations; WebSockets for pushing updates to interested clients.

### 9.5 Manager profile (owner only)

**SHOW:** `/owner/manager` — ManagerProfilePage

**SAY:**

> From **manager profile**, the owner enters manager name, contact, email, address, and optional bank details, then submits. The backend creates a User with role manager and a Manager document linked to the restaurant, then emails a setup link. Until the manager completes setup, they cannot log in meaningfully.

---

## Section 10 — Manager Flow

**SHOW:** Email/setup link or `/setup-manager/:token` page (optional second browser)

**SAY:**

> The **manager onboarding** flow is worth mentioning even if I don’t log in as manager on camera.
>
> 1. Owner submits manager form → `POST /managers`
> 2. Server creates user + manager records, sends email
> 3. Manager opens `/setup-manager/:token` → `PUT /auth/setup-manager/:token` sets password and verifies email
> 4. Manager logs in and accesses `/owner/dashboard`, `/owner/menu`, `/owner/orders` via **StaffRoute**
> 5. Manager **cannot** access `/owner/restaurant` create/delete or `/owner/manager` — **OwnerRoute** blocks them
>
> This is the **principle of least privilege**: managers operate the kitchen and orders, not business ownership settings.

---

## Section 11 — Order & Payment Pipeline

**SHOW:** README “Order Placement & Payment Flow” diagram or whiteboard

**SAY (step-by-step script):**

> Let me walk through the **complete order and payment pipeline** in detail.
>
> **Step 1 — Cart building**  
> Customer adds items. Cart document stores `restaurant` ID and line items. Single-restaurant rule enforced in `cartController.js`.
>
> **Step 2 — Place order (unpaid)**  
> `POST /orders` with Zod-validated body: delivery fields + `expectedTotal`.  
> `orderService.placeOrder` starts a **MongoDB session transaction**:
> - Load cart with populated items
> - Verify restaurant `status === active`
> - Recompute total from current item prices in DB
> - Compare with `expectedTotal` (±0.01 tolerance)
> - Create Order with `paymentStatus: false`, `deliveryStatus: pending`
> - Create OrderItem rows with price snapshots
> - Commit transaction  
> Cart remains until payment succeeds.
>
> **Step 3 — Create Razorpay order**  
> `POST /payments/checkout/:orderId` uses Razorpay SDK with amount in paise, stores `razorpayOrderId` on Order.
>
> **Step 4 — Client payment**  
> Razorpay checkout.js opens modal; user completes payment in Razorpay’s UI (PCI scope stays with Razorpay for card data).
>
> **Step 5 — Verify payment**  
> `POST /payments/verify` receives IDs and signature. Server:
> - Computes HMAC-SHA256 of `order_id|payment_id` with secret
> - Compares to `razorpay_signature`
> - Calls Razorpay API to ensure payment is `captured`
> - Updates order `paymentStatus: true`
> - Clears cart
> - Inserts PaymentHistory
> - Notifies owner/managers
> - Socket `newOrder` to restaurant room
>
> **Step 6 — Fulfillment**  
> Owner/manager PATCH delivery status through validated transitions until `delivered`.
>
> **Step 7 — Feedback**  
> Customer POST feedback; ratings aggregate to menu and restaurant.
>
> **Failure cases:**
> - User closes Razorpay without paying → order stays in **payment-pending** tab; retry payment supported
> - User cancels unpaid order → DELETE order, soft-delete line items
> - Invalid signature → payment rejected, order stays unpaid

---

## Section 12 — Real-Time (Socket.IO)

**SHOW:** `backend/socket/socketHandler.js`, `frontend/src/hooks/useSocket.js`

**SAY:**

> **Socket.IO** runs on the same HTTP server as Express. On connection, the server verifies the JWT from the handshake (cookie or auth header) — unauthenticated sockets are rejected.
>
> **Rooms** isolate events:
> - Customer emits `joinUserRoom` → joins `user_{userId}` — only allowed for own user ID
> - Owner/manager emits `joinRestaurantRoom` → joins `restaurant_{restaurantId}` — server verifies they own or manage that restaurant
>
> **Server → client events:**
> | Event | When | Who receives |
> |-------|------|--------------|
> | `newOrder` | Payment verified | Owner/manager in restaurant room |
> | `orderStatusUpdate` | Delivery status PATCH | Customer in user room |
>
> Notifications are **dual-written**: saved in MongoDB for history and pushed over Socket for instant UI. TTL on notifications prevents unbounded growth.
>
> Compared to **REST polling**, WebSockets reduce latency and server load for live dashboards — a common pattern in delivery apps like Swiggy or Zomato at a smaller scale.

---

## Section 13 — Security & Best Practices

**SHOW:** README Security Features table or `authMiddleware.js`, `server.js` helmet/rate limit

**SAY:**

> Security was considered at multiple layers:
>
> **Authentication & cookies**  
> - JWT in **httpOnly** cookie — mitigates XSS token theft  
> - **SameSite=Strict** — mitigates some CSRF scenarios  
> - **secure** flag in production — HTTPS only  
> - Bearer token fallback for API testing tools
>
> **Passwords**  
> - **bcrypt** with salt rounds on save  
> - Reset/verification tokens stored hashed (SHA-256), not plaintext
>
> **Authorization**  
> - Role middleware on routes  
> - Ownership checks in controllers (e.g., item belongs to owner’s restaurant)
>
> **Input validation**  
> - **Zod** for order placement and delivery updates  
> - Mongoose schema validators  
> - JSON body size limit 10 KB
>
> **Rate limiting**  
> - Auth routes: 10 requests per 15 minutes  
> - Feedback: 20 per hour
>
> **HTTP security**  
> - **Helmet** sets security headers  
> - **CORS** restricted to `FRONTEND_URL`  
> - **Morgan** logging with request IDs
>
> **Payments**  
> - Never trust client-only payment success; always verify signature server-side and confirm with Razorpay API
>
> **Uploads**  
> - Multer file filter: images only, 5 MB max
>
> **Known limitation (honesty for viva):**  
> Cookie-based auth without dedicated CSRF tokens relies on SameSite and CORS. README lists CSRF as a future improvement. SMTP transporter may be commented in dev — production needs real email config.

---

## Section 14 — Backend Code Walkthrough

**SHOW (pick 2–3 files):**

### `backend/server.js`

**SAY:**

> `server.js` wires everything: dotenv, database connect, express middleware stack, mount `/api/v1/*` routes, health check at `/api/v1/health`, 404 handler, global error handler, then creates HTTP server and attaches Socket.IO with CORS for the frontend origin.

### `backend/middleware/authMiddleware.js`

**SAY:**

> `protect` extracts JWT from `req.cookies.eatify_token` or Authorization header, verifies with `jwt.verify`, loads user without password, attaches to `req.user`. `authorizeRole` is a higher-order function returning middleware that checks `req.user.role` is in the allowed list.

### `backend/services/orderService.js`

**SAY:**

> This is the heart of order business logic: transactional place order, cancel unpaid orders, update delivery with state machine validation, dashboard aggregations. Keeping this out of the controller makes unit testing and maintenance easier.

### `backend/controllers/paymentController.js`

**SAY:**

> Payment controller creates Razorpay orders and implements verify with crypto HMAC and Razorpay fetch — the critical trust boundary for money.

---

## Section 15 — Frontend Patterns

**SHOW:** `App.jsx`, `AuthContext.jsx`, lazy imports

**SAY:**

> Frontend patterns worth highlighting:
>
> **React Context** for global auth and cart state instead of Redux — appropriate for this app size.
>
> **Code splitting** — pages imported with `React.lazy()` and wrapped in `Suspense` with a loading spinner — reduces initial bundle size.
>
> **Error boundary** — catches render errors and shows fallback UI instead of white screen.
>
> **Axios interceptor** — on 401, redirect toward login; removes legacy localStorage key if present.
>
> **Component-colocated CSS** — each page/component has its own `.css` file; global variables in `styles/index.css`.
>
> **Toast notifications** — `react-toastify` for success/error feedback.
>
> **Icons** — `lucide-react` for consistent iconography.
>
> Route map is centralized in `App.jsx` — easy to see entire application surface area.

---

## Section 16 — Third-Party Services

**SAY:**

> **MongoDB Atlas** — cloud-hosted MongoDB; connection string in `MONGO_URI`. Supports replica sets and transactions used in order placement.
>
> **Cloudinary** — image upload, transformation, CDN delivery. Avoids storing binary files on our server disk.
>
> **Razorpay** — Indian payment gateway; test keys for development. Server-side order creation and verification pattern follows Razorpay’s recommended flow.
>
> **Nodemailer** — transactional email for verification, password reset, manager invite. In development without SMTP, links log to console.
>
> Each integration is configured via **environment variables** — secrets never committed to Git (`.gitignore` on `.env`).

---

## Section 17 — Deployment & Environment

**SHOW:** README Deployment section (brief)

**SAY:**

> For production deployment, typical approach:
> - Build frontend: `npm run build` → static files
> - Run backend with **PM2** or similar process manager on a VPS, or deploy API to Render/Railway
> - Host frontend on Vercel/Netlify or serve via Nginx
> - MongoDB Atlas for database
> - Set `NODE_ENV=production`, `FRONTEND_URL`, secure cookies, production Razorpay keys
> - Nginx reverse proxy routes `/api` and `/socket.io` to Node
>
> Environment variables are documented in README for both backend and frontend (`VITE_API_URL`, `VITE_SOCKET_URL`).

---

## Section 18 — Challenges & Future Work

**SAY:**

> During development, key challenges included:
> - Coordinating **two-phase checkout** (order then pay) without leaving orphaned paid carts
> - Implementing a reliable **delivery state machine** that both API and UI respect
> - **Socket.IO auth** and room authorization so users cannot subscribe to others’ events
> - **Single-restaurant cart** UX when users browse multiple restaurants
>
> **Future improvements** from the project roadmap:
> - Profile avatar upload UI
> - CSRF tokens for cookie auth
> - Delivery fee calculation
> - Coupon system
> - Admin panel for platform-wide management
> - TypeScript migration
> - React Query for server state caching
> - Expanded Jest test coverage beyond health check
> - CI/CD with GitHub Actions

---

## Section 19 — Closing

**SHOW:** Home page or architecture slide

**SAY:**

> To summarize: **Eatify** is a production-style MERN application for food delivery and restaurant management. It demonstrates **REST API design** with versioning, **JWT cookie authentication**, **role-based access control**, **MongoDB transactions**, **payment gateway integration**, **cloud image storage**, and **real-time updates** with Socket.IO.
>
> Customers get a complete ordering experience from discovery to reviews. Owners and managers get operational tools to run a restaurant digitally.
>
> Thank you for watching. The source code and setup instructions are in the repository README. I’m happy to answer questions about any part of the stack.

---

## Master Glossary

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface — contract for client-server communication |
| **REST** | Architectural style using HTTP methods on resource URLs |
| **Endpoint** | Specific URL + method, e.g. `GET /api/v1/restaurants` |
| **JSON** | JavaScript Object Notation — data format for API bodies |
| **CRUD** | Create, Read, Update, Delete |
| **SPA** | Single Page Application |
| **Component** | Reusable UI unit in React |
| **Props / State** | Inputs to components / internal mutable UI data |
| **Context API** | React mechanism for global state without prop drilling |
| **Hook** | Functions like `useState`, `useEffect`, custom `useSocket` |
| **Middleware** | Express functions in request pipeline |
| **Controller** | Handles HTTP request/response for a route |
| **Service layer** | Business logic separated from HTTP layer |
| **Schema** | Structure definition for MongoDB documents |
| **Reference** | Storing another document’s `_id` as a foreign key |
| **Embedded document** | Sub-object stored inside parent document (cart items) |
| **Transaction** | Atomic multi-document operation in MongoDB |
| **JWT** | Signed token proving identity |
| **httpOnly cookie** | Cookie inaccessible to JavaScript |
| **bcrypt** | Password hashing algorithm |
| **RBAC** | Role-Based Access Control |
| **CORS** | Cross-Origin Resource Sharing — browser security for APIs |
| **409 Conflict** | HTTP status when cart restaurant mismatch |
| **HMAC** | Hash-based message authentication for Razorpay verify |
| **CDN** | Content Delivery Network — Cloudinary serves images fast |
| **WebSocket** | Persistent bidirectional connection |
| **Socket.IO** | Library abstracting WebSockets with rooms and fallbacks |
| **Room** | Named channel for targeted broadcasts |
| **Polling** | Repeated HTTP requests to check for updates (avoided here) |
| **State machine** | Allowed states and transitions for order status |
| **Soft delete** | Mark deleted without removing row |
| **Price snapshot** | Copy price at order time into OrderItem |
| **Aggregation** | MongoDB pipeline for analytics |
| **Zod** | TypeScript-first schema validator used at runtime |
| **Multer** | Express middleware for multipart uploads |
| **Rate limiting** | Throttle requests per IP to prevent abuse |
| **Helmet** | Sets secure HTTP headers |
| **Lazy loading** | Load code only when route is visited |
| **PCI** | Payment Card Industry standards — Razorpay handles card UI |

---

## Quick “What to Show” Index

| Topic | URL / File |
|-------|------------|
| Home | `/` |
| Restaurant list | `/restaurants` |
| Menu | `/restaurants/:id` |
| Search | `/search` |
| Login / Register | `/login`, `/register` |
| Cart | Navbar → CartSidebar |
| Cart conflict | Add from 2nd restaurant |
| Checkout | `/checkout` |
| Orders | `/orders` |
| Profile | `/profile` |
| Owner dashboard | `/owner/dashboard` |
| Restaurant setup | `/owner/restaurant` |
| Menu CRUD | `/owner/menu` |
| Owner orders | `/owner/orders` |
| Manager | `/owner/manager` |
| App routes | `frontend/src/App.jsx` |
| Auth context | `frontend/src/context/AuthContext.jsx` |
| Axios | `frontend/src/api/axios.js` |
| Order service | `backend/services/orderService.js` |
| Socket handler | `backend/socket/socketHandler.js` |
| Auth middleware | `backend/middleware/authMiddleware.js` |
| README architecture | `README.md` |

---

## Suggested Video Chapters (for YouTube)

1. Introduction (0:00)
2. MERN Stack & Architecture (—)
3. Database Design (—)
4. Customer Journey (—)
5. Owner Dashboard (—)
6. Payments & Real-Time (—)
7. Security (—)
8. Conclusion (—)

---

*End of full script. Trim any section to fit your target length. Good luck with your recording.*
