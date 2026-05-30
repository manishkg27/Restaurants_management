# 🍽️ Eatify — Full-Stack Food Delivery Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**A production-ready MERN-stack food delivery platform with real-time order tracking, Razorpay payment integration, and a complete restaurant management dashboard.**

[Features](#-key-features) · [Tech Stack](#-tech-stack) · [Installation](#-installation) · [API Docs](#-api-overview) · [Architecture](#-architecture-overview)

</div>

---

## 📋 Project Overview

**Eatify** is a comprehensive food delivery web application built on the MERN stack (MongoDB, Express.js 5, React 19, Node.js). It serves two user roles:

- **Customers** can discover restaurants, browse menus, search dishes, manage a cart with single-restaurant enforcement, place orders via Razorpay online payments, track order status in real-time via WebSockets, manage multiple delivery addresses, and leave star-rated reviews on menu items.

- **Restaurant Owners** get a dedicated dashboard with revenue analytics, real-time incoming-order alerts, a full order fulfillment pipeline (pending → confirmed → preparing → out-for-delivery → delivered), menu CRUD with image uploads, a transaction ledger with search/date-range filters, and manager profile management with banking details.

The platform features **MongoDB transactions** for atomic order placement, a **state machine** for delivery status transitions, **Razorpay HMAC-SHA256 signature verification**, **Socket.IO** room-based real-time events, **Cloudinary CDN** for image management, **Helmet** security headers, **rate limiting**, and **Zod schema validation**.

---

## ✨ Key Features

### Implemented Features

#### Customer-Facing
| Feature | Evidence |
|---------|----------|
| **Restaurant Discovery** | Browse with search by name/city, server-side pagination — [`restaurantController.js`](backend/controllers/restaurantController.js), [`RestaurantsPage.jsx`](frontend/src/pages/customer/RestaurantsPage.jsx) |
| **Advanced Dish Search** | Filter by dish name, restaurant, location, vegetarian, sort by rating/price — [`itemController.js#searchItems`](backend/controllers/itemController.js), [`SearchPage.jsx`](frontend/src/pages/customer/SearchPage.jsx) |
| **Menu Browsing** | Restaurant detail page with items, open/close time detection, operating hours — [`RestaurantDetailPage.jsx`](frontend/src/pages/customer/RestaurantDetailPage.jsx) |
| **Smart Cart** | Single-restaurant enforcement (409 conflict + mismatch modal), add/update/remove items — [`cartController.js`](backend/controllers/cartController.js), [`CartContext.jsx`](frontend/src/context/CartContext.jsx) |
| **Razorpay Payment Integration** | Dynamic SDK loading, server-side order creation, HMAC-SHA256 signature verification, payment history audit trail — [`paymentController.js`](backend/controllers/paymentController.js), [`CheckoutPage.jsx`](frontend/src/pages/customer/CheckoutPage.jsx) |
| **Retry Failed Payments** | Unpaid orders tab with retry payment flow — [`OrdersPage.jsx`](frontend/src/pages/customer/OrdersPage.jsx) |
| **Real-Time Order Tracking** | Socket.IO pushes `orderStatusUpdate` to customer's room, 5-step visual progress timeline — [`socketHandler.js`](backend/socket/socketHandler.js), [`OrdersPage.jsx`](frontend/src/pages/customer/OrdersPage.jsx) |
| **Order History** | Tabbed view: Active / Unpaid / Past orders with expandable details — [`OrdersPage.jsx`](frontend/src/pages/customer/OrdersPage.jsx) |
| **Order Cancellation** | Customers can cancel unpaid orders — [`orderService.js#cancelOrder`](backend/services/orderService.js) |
| **Item Reviews & Ratings** | Star ratings (1–5) with text experience per item per order, edit existing reviews — [`feedbackController.js`](backend/controllers/feedbackController.js), [`FeedbackForm.jsx`](frontend/src/components/feedback/FeedbackForm.jsx) |
| **Real-Time Notifications** | Bell icon with unread count, Socket.IO push events, mark as read/delete — [`NotificationDropdown.jsx`](frontend/src/components/layout/NotificationDropdown.jsx), [`notificationController.js`](backend/controllers/notificationController.js) |
| **Address Book** | CRUD for multiple saved delivery addresses (Home, Work, etc.) — [`userController.js`](backend/controllers/userController.js), [`ProfilePage.jsx`](frontend/src/pages/customer/ProfilePage.jsx) |
| **Profile Management** | Edit full name, contact number via profile page — [`ProfilePage.jsx`](frontend/src/pages/customer/ProfilePage.jsx) |

#### Restaurant Owner Dashboard
| Feature | Evidence |
|---------|----------|
| **Dashboard Analytics** | Total revenue, total orders, pending/delivered/cancelled counts via aggregation pipeline — [`orderService.js#getDashboardStats`](backend/services/orderService.js), [`OwnerDashboardPage.jsx`](frontend/src/pages/owner/OwnerDashboardPage.jsx) |
| **Transaction Ledger** | Searchable/filterable table with date range, debounced search (500ms) — [`orderService.js#getTransactions`](backend/services/orderService.js), [`OwnerDashboardPage.jsx`](frontend/src/pages/owner/OwnerDashboardPage.jsx) |
| **Restaurant CRUD** | Create/edit restaurant with image upload, operating hours, contact details — [`restaurantController.js`](backend/controllers/restaurantController.js), [`RestaurantSetupPage.jsx`](frontend/src/pages/owner/RestaurantSetupPage.jsx) |
| **Menu Management** | Full CRUD for items with image uploads, vegetarian flag, pricing — [`itemController.js`](backend/controllers/itemController.js), [`MenuManagementPage.jsx`](frontend/src/pages/owner/MenuManagementPage.jsx) |
| **Order Fulfillment Pipeline** | Status state machine with valid transitions, update orders through pipeline — [`orderService.js#updateDeliveryStatus`](backend/services/orderService.js), [`OrdersManagementPage.jsx`](frontend/src/pages/owner/OrdersManagementPage.jsx) |
| **Real-Time New Order Alerts** | Socket.IO `newOrder` event pushed to restaurant room on payment — [`paymentController.js`](backend/controllers/paymentController.js), [`OrdersManagementPage.jsx`](frontend/src/pages/owner/OrdersManagementPage.jsx) |
| **Manager Profile** | Create/edit manager with banking details (name, IFSC, account) — [`managerController.js`](backend/controllers/managerController.js), [`ManagerProfilePage.jsx`](frontend/src/pages/owner/ManagerProfilePage.jsx) |

#### Platform-Wide
| Feature | Evidence |
|---------|----------|
| **JWT Cookie Authentication** | httpOnly `eatify_token` cookie, secure in production, 7-day token expiry — [`authController.js`](backend/controllers/authController.js), [`authMiddleware.js`](backend/middleware/authMiddleware.js) |
| **Role-Based Access Control** | `customer`/`owner` roles with `authorizeRole()` middleware and frontend route guards — [`authMiddleware.js`](backend/middleware/authMiddleware.js), [`OwnerRoute.jsx`](frontend/src/components/common/OwnerRoute.jsx) |
| **Cloudinary Image CDN** | Buffer-to-stream upload for restaurants, items, profiles — [`cloudinaryUpload.js`](backend/utils/cloudinaryUpload.js) |
| **API Versioning** | All endpoints under `/api/v1/` — [`server.js`](backend/server.js) |
| **Helmet Security Headers** | XSS protection, content-type sniffing prevention — [`server.js`](backend/server.js) |
| **Rate Limiting** | Auth: 10 req/15min; Feedback: 20 req/hour — [`server.js`](backend/server.js) |
| **Request Logging** | Morgan with request IDs (dev/production formats) — [`server.js`](backend/server.js) |
| **Zod Schema Validation** | Order placement and status update validation — [`orderValidator.js`](backend/validators/orderValidator.js) |
| **MongoDB Transactions** | Atomic order+items creation with session — [`orderService.js#placeOrder`](backend/services/orderService.js) |
| **Error Boundary** | React error boundary with graceful fallback — [`ErrorBoundary.jsx`](frontend/src/components/common/ErrorBoundary.jsx) |
| **Code Splitting** | All pages lazy-loaded with `React.lazy()` + `Suspense` — [`App.jsx`](frontend/src/App.jsx) |
| **Price Drift Protection** | `expectedTotal` check prevents ordering at stale prices — [`orderService.js`](backend/services/orderService.js) |

### Partially Implemented Features

| Feature | Status | Evidence |
|---------|--------|----------|
| **Manager Banking Details** | Data model stores bank account/IFSC but no payout integration | [`Manager.js`](backend/models/Manager.js) — banking fields exist but are informational only |
| **User Profile Updates** | Controller handles `profile.phone` and `profile.avatar` but schema uses `contactNumber` and has no `avatar` field | [`userController.js`](backend/controllers/userController.js) vs [`User.js`](backend/models/User.js) — field name mismatch |

### Suggested Features (Not Yet Implemented)

- **Password Reset / Forgot Password** — no recovery flow exists
- **Email Verification** — registration has no email confirmation
- **User Avatar Upload** — no profile picture support
- **Delivery Fee Calculation** — orders only sum item prices
- **Coupon / Discount System** — no promotional pricing
- **Order Tracking Map** — status is text-only, no geolocation
- **Admin Panel** — no super-admin role for platform management
- **Restaurant Deletion** — owners can create/edit but cannot delete restaurants

---

## 👥 User Roles

| Role | Registration | Capabilities |
|------|-------------|--------------|
| **Customer** | Signs up with `role: "customer"` (default) | Browse restaurants & menus, search dishes, manage cart, place orders, pay via Razorpay, track orders in real-time, manage delivery addresses, leave item reviews |
| **Owner** | Signs up with `role: "owner"` | Create & manage restaurant, manage menu items, process order fulfillment, view dashboard analytics & transaction ledger, manage manager profile, receive real-time order alerts |
| **Manager** | Created by owner via dashboard | Data model exists ([`Manager.js`](backend/models/Manager.js)) but has no independent authentication or dashboard — informational profile only |

---

## 🏗 Architecture Overview

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
                  HTTP │REST          │ WebSocket
                       ▼              ▼
┌───────────────────────────────────────────────────────────┐
│                   SERVER (Node.js)                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         Express 5 + Socket.IO 4 + Helmet           │  │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────────────┐   │  │
│  │  │Routes v1 │ │Middleware │ │  Controllers      │   │  │
│  │  │(10 route │ │(Auth,CORS │ │  (Business Logic) │   │  │
│  │  │ files)   │ │ Rate Limit│ │                   │   │  │
│  │  │          │ │ Upload,Zod│ │                   │   │  │
│  │  └──────────┘ └───────────┘ └──────────────────┘   │  │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────────────┐   │  │
│  │  │OrderSvc  │ │ Mongoose  │ │  Zod Validators  │   │  │
│  │  │(Service  │ │ Models    │ │  (Schema-based)  │   │  │
│  │  │ Layer)   │ │ (10)      │ │                  │   │  │
│  │  └──────────┘ └───────────┘ └──────────────────┘   │  │
│  └─────────────────────────────────────────────────────┘  │
└───────┬────────────────────┬─────────────────┬────────────┘
        │                    │                 │
        ▼                    ▼                 ▼
 ┌────────────┐      ┌────────────┐     ┌────────────┐
 │  MongoDB   │      │ Cloudinary │     │  Razorpay  │
 │  Atlas     │      │   (CDN)    │     │ (Payments) │
 └────────────┘      └────────────┘     └────────────┘
```

### Data Flow — Order Placement & Payment

```
Customer adds items to cart
        │
        ▼
POST /orders (MongoDB Transaction)
  ├── Read cart items → validate prices → create Order + OrderItems atomically
  └── Return orderId + totalPrice
        │
        ▼
POST /payments/checkout/:orderId
  ├── Create Razorpay order (amount in paise)
  └── Return razorpay order details + key to frontend
        │
        ▼
Razorpay Modal (client-side)
  ├── User completes payment
  └── Frontend receives payment response
        │
        ▼
POST /payments/verify
  ├── Verify HMAC-SHA256 signature
  ├── Fetch payment from Razorpay API (double-check "captured")
  ├── Mark order as paid
  ├── Clear customer's cart
  ├── Create PaymentHistory audit record
  ├── Create Notification for restaurant owner
  └── Emit Socket.IO "newOrder" to restaurant room
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.6 | UI framework with hooks and lazy loading |
| **Vite** | 8.0.12 | Build tool and dev server |
| **React Router** | 7.15.1 | Client-side routing with nested guards |
| **Axios** | 1.16.1 | HTTP client with interceptors |
| **Socket.IO Client** | 4.8.3 | Real-time WebSocket communication |
| **Lucide React** | 1.16.0 | SVG icon library |
| **React Toastify** | 11.1.0 | Toast notification system |
| **Vanilla CSS** | — | BEM-methodology component-colocated stylesheets |
| **Google Fonts (Inter)** | 400–700 | Typography |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express** | 5.2.1 | HTTP framework (latest major version) |
| **Mongoose** | 9.6.2 | MongoDB ODM with schema validation |
| **Socket.IO** | 4.8.3 | WebSocket server for real-time events |
| **Zod** | 4.4.3 | Runtime schema validation |
| **jsonwebtoken** | 9.0.3 | JWT authentication |
| **bcryptjs** | 3.0.3 | Password hashing (10 salt rounds) |
| **Multer** | 2.1.1 | Multipart file upload (memory storage, 5MB limit) |
| **Helmet** | 8.2.0 | Security headers |
| **express-rate-limit** | 8.5.2 | API rate limiting |
| **Morgan** | 1.10.1 | HTTP request logging |
| **cookie-parser** | 1.4.7 | Cookie parsing |
| **CORS** | 2.8.6 | Cross-origin resource sharing |
| **streamifier** | 0.1.1 | Buffer-to-stream conversion for Cloudinary |

### Database
| Technology | Purpose |
|------------|---------|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Mongoose ODM** | Schema definition, validation, hooks, aggregation pipelines, transactions |

### Third-Party Services
| Service | Purpose | Integration Point |
|---------|---------|-------------------|
| **Razorpay** | Online payment processing (INR) | [`paymentController.js`](backend/controllers/paymentController.js) |
| **Cloudinary** | Image storage, optimization, CDN delivery | [`cloudinaryUpload.js`](backend/utils/cloudinaryUpload.js) |

### Dev Tools
| Tool | Purpose |
|------|---------|
| **Nodemon** | Auto-restart during development |
| **Jest** 30.4.2 | Testing framework |
| **Supertest** 7.2.2 | HTTP assertion testing |
| **ESLint** 10 | Code linting |
| **PostCSS + Autoprefixer** | CSS processing |

---

## 📁 Folder Structure

```
Restaurants Management/
├── backend/
│   ├── __tests__/
│   │   └── health.test.js           # Health endpoint test (Jest + Supertest)
│   ├── config/
│   │   ├── db.js                    # MongoDB/Mongoose connection (Atlas, poolSize: 10)
│   │   └── cloudinary.js            # Cloudinary SDK configuration
│   ├── controllers/                 # Route handler business logic
│   │   ├── authController.js        # Register, login, logout, getProfile
│   │   ├── cartController.js        # Cart CRUD with single-restaurant enforcement
│   │   ├── feedbackController.js    # Reviews: submit, edit, check, get (with rating recalc)
│   │   ├── itemController.js        # Menu item CRUD + advanced search aggregation
│   │   ├── managerController.js     # Manager CRUD (one per restaurant)
│   │   ├── notificationController.js # Notification read/unread/delete
│   │   ├── orderController.js       # Thin controller delegating to OrderService
│   │   ├── paymentController.js     # Razorpay order creation + signature verification
│   │   ├── restaurantController.js  # Restaurant CRUD with image uploads
│   │   └── userController.js        # Profile updates + address CRUD
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verify (cookie/Bearer) + role authorization
│   │   ├── errorHandler.js          # asyncHandler wrapper + global error handler
│   │   ├── uploadMiddleware.js      # Multer (memory, 5MB, images only)
│   │   └── validate.js              # Generic Zod validation middleware
│   ├── models/                      # Mongoose schema definitions (10 models)
│   │   ├── User.js                  # Users with embedded profile + addresses
│   │   ├── Restaurant.js            # Restaurant with text indexes for search
│   │   ├── Item.js                  # Menu items with rating aggregation fields
│   │   ├── Cart.js                  # Per-item cart entries (user+item unique index)
│   │   ├── Order.js                 # Orders with delivery info + status pipeline
│   │   ├── OrderItem.js             # Denormalized order line items (price snapshot)
│   │   ├── Feedback.js              # Item reviews (user+item+order unique index)
│   │   ├── Notification.js          # Push notifications with order reference
│   │   ├── Manager.js               # Manager profile with banking details
│   │   └── PaymentHistory.js        # Razorpay payment audit trail
│   ├── routes/v1/                   # Versioned API route definitions (10 route files)
│   │   ├── authRoutes.js            # POST /register, /login, /logout; GET /profile
│   │   ├── cartRoutes.js            # POST, GET, PATCH, DELETE cart operations
│   │   ├── feedbackRoutes.js        # POST, GET, PUT feedback endpoints
│   │   ├── itemRoutes.js            # GET search/list; POST/PUT/DELETE CRUD
│   │   ├── managerRoutes.js         # POST, GET, PUT manager endpoints
│   │   ├── notificationRoutes.js    # GET, PATCH, DELETE notifications
│   │   ├── orderRoutes.js           # POST place; GET orders/stats; PATCH status
│   │   ├── paymentRoutes.js         # POST checkout + verify
│   │   ├── restaurantRoutes.js      # POST, GET, PUT restaurant CRUD
│   │   └── userRoutes.js            # PUT profile; POST/PUT/DELETE addresses
│   ├── services/
│   │   └── orderService.js          # OrderService class: place, update status, cancel,
│   │                                #   getMyOrders, getRestaurantOrders, transactions, stats
│   ├── socket/
│   │   └── socketHandler.js         # Socket.IO: JWT auth, room join, event handlers
│   ├── utils/
│   │   ├── cloudinaryUpload.js      # Buffer-to-stream Cloudinary upload
│   │   └── generateToken.js         # JWT generation (7-day expiry)
│   ├── validators/
│   │   └── orderValidator.js        # Zod schemas: placeOrder, updateDeliveryStatus
│   ├── .env                         # Environment variables (⚠️ see Security section)
│   ├── package.json                 # Dependencies (Express 5, Mongoose 9, Zod 4)
│   ├── server.js                    # App entry: Express + Socket.IO + middleware + routes
│   └── test-rzp.js                  # Manual Razorpay connectivity test script
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg              # Eatify favicon
│   │   └── icons.svg                # SVG icon sprite
│   ├── src/
│   │   ├── api/                     # Axios service modules (10 files)
│   │   │   ├── axios.js             # Base instance (withCredentials, 401 interceptor)
│   │   │   ├── authAPI.js           # Auth endpoints
│   │   │   ├── cartAPI.js           # Cart endpoints
│   │   │   ├── feedbackAPI.js       # Feedback endpoints (submit, check, edit, get)
│   │   │   ├── itemAPI.js           # Item CRUD + search
│   │   │   ├── managerAPI.js        # Manager + user profile/address endpoints
│   │   │   ├── notificationAPI.js   # Notification endpoints
│   │   │   ├── orderAPI.js          # Order + dashboard + transaction endpoints
│   │   │   ├── paymentAPI.js        # Razorpay checkout + verify
│   │   │   └── restaurantAPI.js     # Restaurant CRUD
│   │   ├── components/
│   │   │   ├── cart/                # CartItem, CartSidebar, RestaurantMismatchModal
│   │   │   ├── common/              # ErrorBoundary, LoadingSpinner, ProtectedRoute, OwnerRoute
│   │   │   ├── feedback/            # FeedbackForm, ReviewsModal, StarRating
│   │   │   ├── layout/              # Navbar, Footer, NotificationDropdown
│   │   │   └── restaurant/          # ItemCard, RestaurantCard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Auth state: user, login, logout, isOwner, bootstrap
│   │   │   └── CartContext.jsx      # Cart state: items, total, mismatch modal, CRUD
│   │   ├── hooks/
│   │   │   └── useSocket.js         # Socket.IO hook: connect, rooms, listeners
│   │   ├── lib/
│   │   │   └── formatCurrency.js    # INR formatter (Intl.NumberFormat)
│   │   ├── pages/
│   │   │   ├── auth/                # LoginPage, RegisterPage
│   │   │   ├── customer/            # HomePage, RestaurantsPage, RestaurantDetailPage,
│   │   │   │                        #   SearchPage, CheckoutPage, OrdersPage,
│   │   │   │                        #   OrderConfirmationPage, ProfilePage, NotFoundPage
│   │   │   └── owner/               # OwnerDashboardPage, RestaurantSetupPage,
│   │   │                            #   MenuManagementPage, OrdersManagementPage,
│   │   │                            #   ManagerProfilePage
│   │   ├── styles/
│   │   │   └── index.css            # Global tokens, reset, typography, utility classes
│   │   ├── types/                   # (Empty — reserved for future TypeScript)
│   │   ├── App.jsx                  # Root: providers, routing, lazy loading, layout
│   │   └── main.jsx                 # React DOM entry point
│   ├── dist/                        # Production build output
│   ├── index.html                   # HTML shell with Inter font from Google Fonts
│   ├── vite.config.js               # Vite config (React plugin)
│   ├── eslint.config.js             # ESLint flat config
│   └── package.json                 # Frontend dependencies
│
├── .gitignore
└── README.md                        # This file
```

---

## 🗄 Database Design Summary

### Collections & Relationships

```
User ──(1:1)──▶ Restaurant (owner field, unique)
  │                  │
  │(1:N)             │(1:N)
  ▼                  ▼
 Cart ◀──(N:1)── Item (with text index on name+description)
  │                  │
  │(N:1)             │(1:N)
  ▼                  ▼
  └──────────▶ Order ◀──(1:N)── OrderItem (denormalized price snapshot)
                 │                    │
                 │(1:N)               │(N:1)
                 ▼                    ▼
            Notification            Item
                 │
                 │(1:N)
                 ▼
            Feedback (user+item+order unique)
                 │
                 │(1:1)
                 ▼
            PaymentHistory (Razorpay audit trail)

Restaurant ──(1:1)──▶ Manager (unique, with banking details)
```

### Schema Summary

| Collection | Key Fields | Indexes | Notes |
|------------|------------|---------|-------|
| **User** | username (unique), email (unique), password (select:false), role (customer/owner), profile.addresses[] | username, email | Pre-save password hashing; embedded address subdocuments |
| **Restaurant** | owner (ref:User, unique), name, city, location, openTime, closeTime, restaurantImage | Text: name+city+location | One restaurant per owner constraint |
| **Item** | restaurant (ref), name, price, image, isVegetarian, averageRating, totalRatings | Text: name+desc; price asc; rating desc | Rating aggregation fields updated on feedback |
| **Cart** | user (ref), item (ref), restaurant (ref), quantity (1–50) | user; (user+item unique); (user+restaurant) | One entry per item per user; single-restaurant enforced at controller level |
| **Order** | user (ref), restaurant (ref), deliveryInfo (embedded), totalPrice, paymentStatus (bool), deliveryStatus (enum), razorpayOrderId | (user+createdAt); (restaurant+createdAt); (paymentStatus+deliveryStatus) | Status pipeline: pending→confirmed→preparing→out-for-delivery→delivered / cancelled |
| **OrderItem** | order (ref), item (ref), itemName, itemPrice, quantity, totalPrice | order; item | Denormalized — snapshots item data at order time |
| **Feedback** | user (ref), item (ref), order (ref), rating (1–5), experience | (item+createdAt); (user+item+order unique) | One review per user per item per order |
| **Notification** | recipient (ref:User), type (order_update/new_order/system_alert), message, relatedOrder, isRead | (recipient+createdAt) | Auto-created on status changes and payments |
| **Manager** | restaurant (ref, unique), name, email, contact, address, bankName, bankBranch, bankIFSC, bankAccount | restaurant | One manager per restaurant; banking details in plaintext |
| **PaymentHistory** | order (ref), razorpayOrderId, razorpayPaymentId, razorpaySignature | order; razorpayOrderId | Audit trail for Razorpay payments |

### Order Delivery Status State Machine

```
pending ──▶ confirmed ──▶ preparing ──▶ out-for-delivery ──▶ delivered
  │              │              │
  ▼              ▼              ▼
cancelled    cancelled      cancelled
```

Transitions are enforced by `VALID_TRANSITIONS` map in [`orderService.js`](backend/services/orderService.js). Terminal states (`delivered`, `cancelled`) have no outgoing transitions.

---

## 🔌 API Overview

All endpoints are prefixed with `/api/v1`. Auth uses httpOnly cookie (`eatify_token`).

### Authentication
| Method | Endpoint | Auth | Rate Limited | Description |
|--------|----------|------|:---:|-------------|
| `POST` | `/auth/register` | ❌ | ✅ 10/15min | Register new user (customer/owner) |
| `POST` | `/auth/login` | ❌ | ✅ 10/15min | Login with email + password |
| `POST` | `/auth/logout` | ✅ | — | Clear auth cookie |
| `GET` | `/auth/profile` | ✅ | — | Get current user session |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT` | `/users/profile` | ✅ | Update profile (fullName, contactNumber) |
| `POST` | `/users/addresses` | ✅ | Add new delivery address |
| `PUT` | `/users/addresses/:addressId` | ✅ | Update existing address |
| `DELETE` | `/users/addresses/:addressId` | ✅ | Delete address |

### Restaurants
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/restaurants` | ✅ Owner | Create restaurant (with image upload) |
| `GET` | `/restaurants` | ❌ | List restaurants (search by name/city, pagination) |
| `GET` | `/restaurants/mine` | ✅ Owner | Get own restaurant + menu items |
| `GET` | `/restaurants/:id` | ❌ | Get restaurant by ID + menu items |
| `PUT` | `/restaurants/:id` | ✅ Owner | Update restaurant details |

### Menu Items
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/items` | ❌ | List all items (pagination) |
| `GET` | `/items/search` | ❌ | Advanced search (name, restaurant, location, veg, sort) |
| `POST` | `/items/:restaurantId` | ✅ Owner | Add menu item (multipart image upload) |
| `PUT` | `/items/:itemId` | ✅ Owner | Update menu item |
| `DELETE` | `/items/:itemId` | ✅ Owner | Delete menu item |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/cart` | ✅ | Add item to cart (409 if restaurant mismatch) |
| `GET` | `/cart` | ✅ | Get cart with aggregated item + restaurant details |
| `PATCH` | `/cart/:cartId` | ✅ | Update cart item quantity |
| `DELETE` | `/cart/:cartId` | ✅ | Remove item from cart |
| `DELETE` | `/cart/clear` | ✅ | Clear entire cart |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/orders` | ✅ | Place order (Zod validated, MongoDB transaction) |
| `GET` | `/orders/my-orders` | ✅ | Get user's orders (filter: current/unpaid/delivered) |
| `DELETE` | `/orders/:orderId` | ✅ | Cancel unpaid order |
| `GET` | `/orders/dashboard-stats` | ✅ Owner | Get aggregated dashboard statistics |
| `GET` | `/orders/transactions` | ✅ Owner | Get transaction ledger (search, date range) |
| `GET` | `/orders/restaurant-orders` | ✅ Owner | Get restaurant's paid orders |
| `PATCH` | `/orders/:orderId/delivery` | ✅ Owner | Update delivery status (Zod validated, state machine) |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/payments/checkout/:orderId` | ✅ | Create Razorpay payment order |
| `POST` | `/payments/verify` | ✅ | Verify HMAC-SHA256 signature + confirm payment |

### Feedback
| Method | Endpoint | Auth | Rate Limited | Description |
|--------|----------|------|:---:|-------------|
| `POST` | `/feedback` | ✅ | ✅ 20/hr | Submit item review |
| `GET` | `/feedback/item/:itemId` | ❌ | — | Get item reviews (paginated) |
| `GET` | `/feedback/check/:orderId/:itemId` | ✅ | — | Check if user already reviewed |
| `PUT` | `/feedback/:feedbackId` | ✅ | — | Update existing review |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/notifications` | ✅ | Get last 30 notifications + unread count |
| `PATCH` | `/notifications/:id/read` | ✅ | Mark notification as read |
| `PATCH` | `/notifications/read-all` | ✅ | Mark all notifications as read |
| `DELETE` | `/notifications/:id` | ✅ | Delete notification |

### Managers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/managers` | ✅ Owner | Create manager profile |
| `GET` | `/managers/my-restaurant` | ✅ Owner | Get manager profile |
| `PUT` | `/managers/:managerId` | ✅ Owner | Update manager profile |

### Health Check
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/health` | ❌ | Server health check |

---

## 🔐 Authentication & Authorization Flow

### Authentication Mechanism

```
1. Registration / Login
   Client ──POST /auth/register or /auth/login──▶ Server
   Server ──validates credentials──▶ generates JWT (7-day expiry)
   Server ──sets httpOnly cookie "eatify_token" (30-day expiry)──▶ Client

2. Session Bootstrap (on app load)
   Client ──GET /auth/profile (sends cookie automatically)──▶ Server
   Server ──verifies JWT from cookie──▶ returns user data OR 401

3. Authenticated Requests
   Every Axios request sends cookies (withCredentials: true)
   authMiddleware.protect: cookie "eatify_token" → jwt.verify → req.user

4. Dual Token Source
   Middleware reads JWT from:
     1st: req.cookies.eatify_token
     2nd: req.headers.authorization (Bearer token) — fallback

5. Logout
   Server clears cookie (expired date) + Client clears localStorage
```

### Authorization Layers

```
Layer 1: Route-Level Guards (Frontend)
  ├── <ProtectedRoute>  → any authenticated user, else redirect to /login
  └── <OwnerRoute>      → must be owner role, else redirect to /

Layer 2: Middleware (Backend)
  ├── protect           → JWT verification, attaches user to req
  └── authorizeRole()   → checks req.user.role ∈ allowed roles

Layer 3: Controller-Level (Backend)
  └── Ownership checks  → e.g., restaurant.owner.equals(req.user._id)
```

---

## 🚀 Installation

### Prerequisites

| Requirement | Minimum Version |
|-------------|----------------|
| **Node.js** | v18+ |
| **npm** | v9+ |
| **MongoDB** | Atlas (cloud) or local v6+ |
| **Cloudinary Account** | Free tier at [cloudinary.com](https://cloudinary.com) |
| **Razorpay Account** | Test mode at [razorpay.com](https://razorpay.com) |

### Clone the Repository

```bash
git clone https://github.com/yourusername/eatify.git
cd eatify
```

### Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# Authentication
JWT_SECRET=your_long_random_secret_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (Payment Processing)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

The frontend uses these optional environment variables (set via `.env` in `frontend/`):

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000
```

| Variable | Required | Description |
|----------|:--------:|-------------|
| `PORT` | Yes | Backend server port (default: 8000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing — use a long random string |
| `FRONTEND_URL` | No | CORS allowed origin (default: `http://localhost:5173`) |
| `CLOUDINARY_CLOUD_NAME` | Yes | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Yes | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Yes | From Cloudinary dashboard |
| `RAZORPAY_KEY_ID` | Yes | Razorpay key (use `rzp_test_*` for testing) |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay secret key |

> ⚠️ **Never commit `.env` to version control.** Add it to `.gitignore`.

---

## 💻 Local Development Setup

### 1. Set Up MongoDB

Option A — **MongoDB Atlas** (recommended):
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user and get your connection string
3. Whitelist your IP in Network Access

Option B — **Local MongoDB**:
```bash
mongosh
use eatify_db
```

### 2. Configure Environment

```bash
cd backend
# Create .env and fill in your credentials (see Environment Variables section above)
```

### 3. Start the Backend

```bash
cd backend
npm run dev
# ✅ Eatify MERN Server running on port 8000
# ✅ MongoDB Connected: <cluster-host>
```

### 4. Start the Frontend

```bash
cd frontend
npm run dev
# ✅ Vite dev server at http://localhost:5173
# API calls to /api/v1 are sent to the backend via VITE_API_URL
```

### 5. Access the Application

Open **http://localhost:5173** in your browser.

---

## 🏗 Build Instructions

### Frontend Production Build

```bash
cd frontend
npm run build       # Output: frontend/dist/
npm run preview     # Preview production build locally
```

### Run Tests

```bash
cd backend
npx jest            # Runs health check test
```

### Lint

```bash
cd frontend
npm run lint        # ESLint checks
```

---

## 🚢 Deployment Instructions

### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)

1. **Provision** a Linux server with Node.js 18+
2. **Clone** and install dependencies
3. **Build frontend**: `cd frontend && npm run build`
4. **Set environment variables** with production values (`NODE_ENV=production`)
5. **Serve with PM2**:
   ```bash
   npm install -g pm2
   cd backend
   pm2 start server.js --name eatify-api
   pm2 save && pm2 startup
   ```
6. **Configure Nginx** as reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       # API and health check
       location /api {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # WebSocket support
       location /socket.io {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
       }

       # Frontend static files
       location / {
           root /path/to/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### Option 2: Platform-as-a-Service

| Component | Platform Options |
|-----------|-----------------|
| **Backend** | [Render](https://render.com), [Railway](https://railway.app), [Heroku](https://heroku.com) |
| **Frontend** | [Vercel](https://vercel.com), [Netlify](https://netlify.com) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) (already used) |

> **Important**: Update `FRONTEND_URL`, `VITE_API_URL`, `VITE_SOCKET_URL`, and Razorpay webhook URLs for production domains.

---

## 📸 Screenshots

> Replace these placeholders with actual screenshots of your application.

| Screen | Description |
|--------|-------------|
| ![Home Page](screenshots/home.png) | Landing page with hero search, category chips, featured restaurants, popular items |
| ![Restaurant Listing](screenshots/restaurants.png) | Browse restaurants with search and city filter |
| ![Restaurant Menu](screenshots/menu.png) | Restaurant detail with operating hours, items, reviews |
| ![Search](screenshots/search.png) | Advanced search with filters: veg, sort by rating/price |
| ![Cart Sidebar](screenshots/cart.png) | Slide-in cart with items, total, checkout button |
| ![Checkout](screenshots/checkout.png) | Address selection, order summary, Razorpay payment |
| ![Orders](screenshots/orders.png) | Tabbed orders view with progress timeline, retry payment, review |
| ![Owner Dashboard](screenshots/dashboard.png) | Stats cards, transaction ledger with date range filter |
| ![Menu Management](screenshots/menu-management.png) | Add/edit/delete menu items with image upload |
| ![Order Management](screenshots/order-management.png) | Fulfillment pipeline status updates |

---

## 🧩 Challenges Solved

### 1. Atomic Order Placement with MongoDB Transactions
Order creation reads cart, validates prices, creates both `Order` and `OrderItem` documents atomically in a single MongoDB session/transaction. If any step fails, the entire operation rolls back — preventing partial order states.
📄 [`orderService.js#placeOrder`](backend/services/orderService.js)

### 2. Price Drift Protection
The `expectedTotal` parameter protects customers from ordering at stale prices. If item prices change between cart view and checkout, the server rejects the order with a descriptive error showing the updated total.
📄 [`orderService.js`](backend/services/orderService.js)

### 3. Single-Restaurant Cart Constraint
The cart controller enforces that all items must be from one restaurant. Adding an item from a different restaurant returns a `409 Conflict` with both restaurant names, and the frontend displays a confirmation modal offering to clear the cart and switch.
📄 [`cartController.js`](backend/controllers/cartController.js), [`RestaurantMismatchModal.jsx`](frontend/src/components/cart/RestaurantMismatchModal.jsx)

### 4. Real-Time Bidirectional Updates via Socket.IO Rooms
Socket.IO rooms segregate events by user (`user_{id}`) and restaurant (`restaurant_{id}`). On payment verification, owners receive `newOrder`; on status change, customers receive `orderStatusUpdate`. JWT authentication on socket handshake prevents unauthorized room joins.
📄 [`socketHandler.js`](backend/socket/socketHandler.js)

### 5. Secure Payment Verification
Razorpay integration implements a two-phase verification: HMAC-SHA256 signature check on the server, followed by a `razorpay.payments.fetch()` API call to confirm `"captured"` status — preventing replay attacks and forged payment notifications.
📄 [`paymentController.js`](backend/controllers/paymentController.js)

### 6. Delivery Status State Machine
A `VALID_TRANSITIONS` map enforces the allowed status progression, preventing invalid state changes (e.g., jumping from "pending" directly to "delivered") and ensuring the fulfillment pipeline is respected.
📄 [`orderService.js#updateDeliveryStatus`](backend/services/orderService.js)

### 7. Denormalized Order Items
`OrderItem` snapshots item name and price at order time, ensuring historical order records remain accurate even if menu prices are later updated or items are deleted.
📄 [`OrderItem.js`](backend/models/OrderItem.js)

---

## 🔮 Future Improvements

- [ ] **Password Reset Flow** — Forgot password with email-based OTP/link
- [ ] **Email Verification** — Confirm email on registration
- [ ] **User Avatar Upload** — Profile picture with Cloudinary
- [ ] **Complete Manager Auth** — Independent login and dashboard for managers
- [ ] **Restaurant Deletion** — Allow owners to delete their restaurant
- [ ] **Delivery Fee Calculation** — Distance/area-based delivery charges
- [ ] **Coupon/Discount System** — Promotional codes with validation rules
- [ ] **Order Tracking Map** — Real-time delivery tracking with map integration
- [ ] **Admin Panel** — Super-admin for platform-wide management
- [ ] **TypeScript Migration** — Leverage the empty `types/` directory
- [ ] **Server State Caching** — Add React Query/SWR for API response caching
- [ ] **Skeleton Loading States** — Replace spinners with content-aware skeletons
- [ ] **Comprehensive Testing** — Expand beyond the single health check test
- [ ] **CI/CD Pipeline** — Automated testing and deployment with GitHub Actions
- [ ] **Encrypt Sensitive Data** — Encrypt manager banking details at rest
- [ ] **Dark Mode** — Theme toggle with CSS custom property switching
- [ ] **Multi-Language Support** — i18n integration
- [ ] **Vite API Proxy** — Configure Vite proxy for development convenience

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ using the MERN Stack**

MongoDB · Express.js 5 · React 19 · Node.js

</div>