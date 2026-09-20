# KK PHARMACY — ONLINE PHARMACY & MEDICAL SUPPLIES PLATFORM
## COURSEWORK TECHNICAL SPECIFICATION & PROJECT DOCUMENTATION
**Module**: ITS1114 — Advanced API Development Module  
**Qualification**: Higher Diploma in Software Engineering (HDSE), Institute of Software Engineering (IJSE)  
**Module Weighting**: Coursework 60% + Exam 40%  
**Author**: Student Final Coursework Project  
**System Name**: KK PHARMACY Digital Pharmacy & Medical Equipment E-Commerce  
**Document Version**: 1.0.0 (Living Document — Updated with each architectural increment)

---

## TABLE OF CONTENTS
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Frontend Architecture & Layered Design](#2-frontend-architecture--layered-design)
3. [Healthcare UI Design System & Aesthetic Tokens](#3-healthcare-ui-design-system--aesthetic-tokens)
4. [Complete 15+ Normalized Relational Database Schema (Spring Data JPA)](#4-complete-15-normalized-relational-database-schema-spring-data-jpa)
5. [Spring Boot REST API Contract Specification](#5-spring-boot-rest-api-contract-specification)
6. [Security Architecture & JWT Authentication](#6-security-architecture--jwt-authentication)
7. [Role-Based Access Control (RBAC) Matrix](#7-role-based-access-control-rbac-matrix)
8. [Coursework Bonus Features Implemented](#8-coursework-bonus-features-implemented)
9. [Project Directory & Module Responsibilities](#9-project-directory--module-responsibilities)
10. [User Manual, Testing Guide & Demo Credentials](#10-user-manual-testing-guide--demo-credentials)

---

## 1. EXECUTIVE SUMMARY & PROBLEM STATEMENT

### 1.1 Business Problem Domain
Traditional retail pharmacies and medical supply stores face severe operational inefficiencies:
- **Manual Prescription Handling**: High risk of dispensing errors and slow fulfillment.
- **Fragmented Medical Equipment Retail**: Diagnostic instruments (e.g., blood pressure monitors, glucometers, nebulizers) are often unavailable in local community dispensaries.
- **Lack of Real-Time Stock Visibility**: Patients frequently travel to physical dispensaries only to find vital medications out of stock.
- **Absence of Centralized Order Tracking**: Disconnected fulfillment leads to missed deliveries for chronic-care patients requiring timely refills.

### 1.2 The KK PHARMACY Digital Solution
KK PHARMACY is a production-grade, API-first online healthcare and medical equipment marketplace. It provides:
1. **Direct Customer Storefront**: Intuitive browsing of prescription medicines, OTC drugs, diagnostic instruments, and daily vitamins.
2. **Prescription Upload & Validation**: Secure workflow for prescription-only pharmaceuticals.
3. **Real-Time Dynamic Cart & Checkout**: Automated threshold meters for free island-wide delivery and multi-method checkout (Card, Bank Transfer, COD).
4. **Role-Protected Admin Management Suite**: Real-time sales analytics, inventory tracking with batch/expiry monitoring, user role management, and order fulfillment workflows.
5. **AI Healthcare Assistant (Bonus Feature)**: Interactive clinical dosage advisor and OTC guidance assistant.

---

## 2. FRONTEND ARCHITECTURE & LAYERED DESIGN

The frontend strictly conforms to a **layered separation of concerns**, completely isolating presentation code from network requests and business rules.

```
Presentation Layer (HTML5 / Pages / Admin)
    ↓
Component Layer (navbar.js, product-card.js, modal.js, toast.js)
    ↓
Service Layer (auth-service.js, cart-service.js, product-service.js, order-service.js)
    ↓
API Client Layer (api-client.js, auth-api.js, product-api.js, order-api.js)
    ↓
Spring Boot REST API (Spring Security, JWT, JPA/Hibernate, MySQL)
```

### 2.1 Universal Relative Asset Resolution & Resilient Cart Synchronization
- **Asset Resolution Engine (`resolveImagePath`)**: Seamlessly normalizes image URIs across root (`/index.html`) and nested subdirectories (`/pages/`, `/admin/`) to guarantee zero 404 image errors with automatic fallback handling.
- **Cart Lifecycle & Re-ordering**: Following successful order checkout, the active cart clears its state while preserving real-time re-synchronization with `localStorage`, enabling users to seamlessly browse and add new items without page refresh or stale session conflicts.

### 2.2 Two-Tier Modern Glassmorphism & Centered Floating Capsule Navigation
- **Tier 1 (Top Main Header)**: Full-width glass capsule containing the **KK PHARMACY** brand logo with interactive 3D animated pills graphic, live search dropdown, wishlist counter badge, shopping cart counter badge, and patient account auth pill button.
- **Tier 2 (Under-Navbar Floating Bubble Bar)**: Horizontally centered standalone capsule navbar (`border-radius: 50px`, `backdrop-filter: blur(20px)`) holding category and store routing pills (Home, Products, Medicines, Equipment, Categories, About Us, Contact) with solid Healthcare Blue active indicator and smooth hover animations.

### Architectural Layer Responsibilities:
- **Layer 1 — Presentation & Pages (`pages/`, `admin/`, `index.html`)**: Defines semantic DOM structures, accessibility markers, and forms without hardcoded API calls.
- **Layer 2 — Reusable UI Components (`js/components/`)**: Pure UI rendering functions (`renderProductCard`, `renderNavbar`, `Toast.show`, `Modal.showQuickView`, `LoadingState`).
- **Layer 3 — Business & State Services (`js/services/`)**: Encapsulates client-side domain rules (cart calculations, currency formatting, JWT token decode, local session caching, mock fallback toggle).
- **Layer 4 — HTTP API Clients (`js/api/`)**: Central `APIClient` using standard Fetch API, handling Bearer header injection, response mapping, and HTTP error normalization (401, 403, 404, 500).
- **Layer 5 — Backend REST API (Spring Boot)**: Spring Security, BCrypt, JPA/Hibernate entities, SLF4J logging, and MySQL persistence.

---

## 3. HEALTHCARE UI DESIGN SYSTEM & AESTHETIC TOKENS

The interface uses a tailored, high-trust healthcare color palette strictly conforming to medical industry standards.

| Token Name | Hex Code | Semantic Purpose |
| :--- | :--- | :--- |
| `--primary-blue` | `#0066B3` | Primary brand accent, primary CTA buttons, active links |
| `--primary-hover` | `#005290` | Interactive hover state for primary elements |
| `--dark-navy` | `#003B66` | Typography headings (`h1`–`h6`), brand logo, navbar dark text |
| `--secondary-blue` | `#2D9CDB` | Informational highlights, secondary badges, timeline steps |
| `--light-medical-blue` | `#E8F4FC` | Healthcare banners, card backgrounds, hover fills |
| `--soft-bg` | `#F3F9FD` | Global body background (reduces eye strain) |
| `--white` | `#FFFFFF` | Content surfaces, modals, dropdowns, form controls |
| `--text-main` | `#0F172A` | Primary body typography (Slate 900) |
| `--text-muted` | `#475569` | Secondary captions, dosage instructions (Slate 600) |
| `--border-color` | `#D9E8F2` | Subtle healthcare borders |
| `--success` | `#16A34A` | In-stock tags, verified Rx badges, checkout confirmations |
| `--warning` | `#F59E0B` | Low-stock warnings, prescription-required notices |
| `--error` | `#DC2626` | Out-of-stock tags, invalid input alerts, 403/500 errors |

### Typography & Spacing:
- **Headings**: `Outfit`, sans-serif (Weights: 600, 700)
- **Body**: `Inter`, system-ui, sans-serif (Weights: 400, 500, 600)
- **Grid System**: Bootstrap 5 Responsive Grid (8px baseline scale)
- **Corner Radius**: `8px` (inputs/buttons), `14px` (cards/banners), `50px` (pills/badges)

---

## 4. COMPLETE 15+ NORMALIZED RELATIONAL DATABASE SCHEMA (SPRING DATA JPA)

To fulfill and exceed the coursework mandate (minimum 15 normalized tables), the database is normalized to 3rd Normal Form (3NF) comprising 18 relational entities.

```
+-------------------------------------------------------------------------------+
|                       DATABASE RELATIONAL SCHEMA (MySQL 8+)                   |
+-------------------------------------------------------------------------------+
 1. users               (id, email, password, full_name, phone, enabled, created_at)
 2. roles               (id, name [ROLE_GUEST, ROLE_USER, ROLE_ADMIN, ROLE_PHARMACIST])
 3. user_roles          (user_id, role_id) [Composite PK]
 4. user_addresses      (id, user_id, address_line1, city, postal_code, is_default)
 5. categories          (id, name, slug, description, icon_class, active)
 6. brands              (id, name, manufacturer_country, verified)
 7. products            (id, category_id, brand_id, name, sku, price, old_price, rx_required)
 8. medicine_details    (id, product_id, active_ingredient, dosage_form, strength, storage_info)
 9. product_images      (id, product_id, image_url, is_primary, display_order)
10. inventory           (id, product_id, current_stock, reorder_level, location_aisle)
11. inventory_batches   (id, inventory_id, batch_number, mfg_date, expiry_date, quantity)
12. cart_items          (id, user_id, product_id, quantity, updated_at)
13. orders              (id, user_id, order_number, total_amount, discount, status, created_at)
14. order_items         (id, order_id, product_id, unit_price, quantity, subtotal)
15. payments            (id, order_id, payment_method, transaction_ref, status, amount)
16. prescriptions       (id, user_id, order_id, doctor_name, prescription_url, status)
17. reviews             (id, user_id, product_id, rating, comment, is_verified_purchase)
18. wishlists           (id, user_id, product_id, created_at)
```

---

## 5. SPRING BOOT REST API CONTRACT SPECIFICATION

All endpoints return standard JSON payloads with consistent HTTP status codes:
- `200 OK` / `201 Created`: Success
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing or invalid JWT
- `403 Forbidden`: Insufficient role authority
- `404 Not Found`: Entity not found
- `500 Internal Server Error`: Unhandled server exception

### 5.0 Standard Response Envelope & HTTP Status Codes
All Spring Boot REST endpoints adhere to RFC 7807 and standardized DTO envelopes:
- `200 OK`: Successful data retrieval or state update
- `201 Created`: Resource successfully created (Users, Orders, Products, Batches)
- `204 No Content`: Successful action with empty response body
- `400 Bad Request`: Validation failure or malformed payload (`ErrorResponse`)
- `401 Unauthorized`: Missing, expired, or invalid JWT Bearer token (`ErrorResponse`)
- `403 Forbidden`: Authenticated user lacks required role authority (`ErrorResponse`)
- `404 Not Found`: Requested entity not found (`ErrorResponse`)
- `500 Internal Server Error`: Unhandled server exception (`ErrorResponse`)

---

### 5.1 Authentication Endpoints (`AuthController.java`)

#### 1. Register Customer Account
- **METHOD**: `POST`
- **FULL URL**: `http://localhost:8080/api/v1/auth/register`
- **AUTHENTICATION**: Public
- **ROLE**: `NONE`
- **REQUEST HEADERS**: `Content-Type: application/json`, `Accept: application/json`
- **REQUEST BODY**:
  ```json
  {
    "fullName": "Sarah Perera",
    "email": "user@example.com",
    "password": "password123",
    "phone": "+94 77 123 4567"
  }
  ```
- **SUCCESS RESPONSE (201 Created)**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "d8e3b4a2-...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "Sarah Perera",
      "phone": "+94 77 123 4567",
      "roles": ["ROLE_USER"],
      "enabled": true
    },
    "roles": ["ROLE_USER"]
  }
  ```
- **ERROR RESPONSES**: `400 Bad Request` (Email already in use / validation failed)
- **FRONTEND FILE USING ENDPOINT**: `js/api/auth-api.js`, `js/services/auth-service.js`, `js/pages/register.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.AuthController`

#### 2. User Login
- **METHOD**: `POST`
- **FULL URL**: `http://localhost:8080/api/v1/auth/login`
- **AUTHENTICATION**: Public
- **ROLE**: `NONE`
- **REQUEST HEADERS**: `Content-Type: application/json`, `Accept: application/json`
- **REQUEST BODY**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **SUCCESS RESPONSE (200 OK)**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "d8e3b4a2-...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "Sarah Perera",
      "phone": "+94 77 123 4567",
      "roles": ["ROLE_USER"],
      "enabled": true
    },
    "roles": ["ROLE_USER"]
  }
  ```
- **ERROR RESPONSES**: `401 Unauthorized` (Invalid credentials), `400 Bad Request`
- **FRONTEND FILE USING ENDPOINT**: `js/api/auth-api.js`, `js/services/auth-service.js`, `js/pages/login.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.AuthController`

#### 3. Refresh JWT Access Token
- **METHOD**: `POST`
- **FULL URL**: `http://localhost:8080/api/v1/auth/refresh-token`
- **AUTHENTICATION**: Public
- **ROLE**: `NONE`
- **REQUEST HEADERS**: `Content-Type: application/json`, `Accept: application/json`
- **REQUEST BODY**:
  ```json
  {
    "refreshToken": "d8e3b4a2-..."
  }
  ```
- **SUCCESS RESPONSE (200 OK)**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "d8e3b4a2-...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "user": { ... },
    "roles": ["ROLE_USER"]
  }
  ```
- **ERROR RESPONSES**: `401 Unauthorized` (Expired or invalid refresh token)
- **FRONTEND FILE USING ENDPOINT**: `js/api/api-client.js`, `js/api/auth-api.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.AuthController`

#### 4. Get Current User Session
- **METHOD**: `GET`
- **FULL URL**: `http://localhost:8080/api/v1/auth/me`
- **AUTHENTICATION**: Bearer JWT
- **ROLE**: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_PHARMACIST`
- **REQUEST HEADERS**: `Authorization: Bearer <JWT>`, `Accept: application/json`
- **SUCCESS RESPONSE (200 OK)**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Sarah Perera",
    "phone": "+94 77 123 4567",
    "roles": ["ROLE_USER"],
    "enabled": true
  }
  ```
- **ERROR RESPONSES**: `401 Unauthorized`
- **FRONTEND FILE USING ENDPOINT**: `js/api/auth-api.js`, `js/services/auth-service.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.AuthController`

#### 5. User Logout
- **METHOD**: `POST`
- **FULL URL**: `http://localhost:8080/api/v1/auth/logout`
- **AUTHENTICATION**: Bearer JWT
- **ROLE**: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_PHARMACIST`
- **REQUEST HEADERS**: `Authorization: Bearer <JWT>`, `Accept: application/json`
- **SUCCESS RESPONSE (200 OK)**:
  ```json
  {
    "status": 200,
    "message": "Logged out successfully",
    "data": null
  }
  ```
- **ERROR RESPONSES**: `401 Unauthorized`
- **FRONTEND FILE USING ENDPOINT**: `js/api/auth-api.js`, `js/services/auth-service.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.AuthController`

---

### 5.2 Products & Catalog Endpoints (`ProductController.java`)

#### 6. Get Filtered & Paginated Products Catalog
- **METHOD**: `GET`
- **FULL URL**: `http://localhost:8080/api/v1/products`
- **AUTHENTICATION**: Public
- **ROLE**: `NONE`
- **QUERY PARAMETERS**: `category` (string), `search` (string), `minPrice` (decimal), `maxPrice` (decimal), `sort` (string), `page` (int, default 0), `size` (int, default 12)
- **REQUEST HEADERS**: `Accept: application/json`
- **SUCCESS RESPONSE (200 OK)**:
  ```json
  {
    "content": [
      {
        "id": 1,
        "name": "Amoxicillin 500mg Antibiotic Capsules",
        "sku": "RX-AMX-500",
        "brand": "GlaxoSmithKline",
        "category": "medicines",
        "categoryName": "Medicines",
        "price": 650.00,
        "oldPrice": 750.00,
        "rating": 4.8,
        "reviewsCount": 42,
        "inStock": true,
        "requiresPrescription": true,
        "rxRequired": true,
        "image": "assets/images/medicine_1.png",
        "description": "Amoxicillin is a broad-spectrum penicillin-class antibiotic...",
        "activeIngredient": "Amoxicillin Trihydrate 500mg",
        "strength": "500mg per capsule",
        "dosageForm": "Hard Gelatin Capsules",
        "manufacturer": "GlaxoSmithKline Pharmaceuticals Ltd",
        "storageInfo": "Store below 25°C in a dry place."
      }
    ],
    "page": 0,
    "size": 12,
    "totalElements": 24,
    "totalPages": 2,
    "last": false
  }
  ```
- **ERROR RESPONSES**: `400 Bad Request`, `500 Internal Server Error`
- **FRONTEND FILE USING ENDPOINT**: `js/api/product-api.js`, `js/services/product-service.js`, `js/pages/products.js`, `js/pages/home.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.ProductController`

#### 7. Get Product Details by ID
- **METHOD**: `GET`
- **FULL URL**: `http://localhost:8080/api/v1/products/{id}`
- **AUTHENTICATION**: Public
- **ROLE**: `NONE`
- **PATH PARAMETERS**: `id` (Long, e.g. 1)
- **SUCCESS RESPONSE (200 OK)**: Returns single `ProductDTO`
- **ERROR RESPONSES**: `404 Not Found` (Product not found)
- **FRONTEND FILE USING ENDPOINT**: `js/api/product-api.js`, `js/services/product-service.js`, `js/pages/product-details.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.ProductController`

#### 8. Create Product (Admin Only)
- **METHOD**: `POST`
- **FULL URL**: `http://localhost:8080/api/v1/products`
- **AUTHENTICATION**: Bearer JWT
- **ROLE**: `ROLE_ADMIN`
- **REQUEST BODY**:
  ```json
  {
    "name": "Paracetamol Extra Strength 500mg",
    "sku": "OTC-PCM-100",
    "categoryId": 1,
    "category": "medicines",
    "brandId": 1,
    "brand": "GSK",
    "price": 480.00,
    "requiresPrescription": false,
    "description": "Fast-acting pain reliever and antipyretic caplets.",
    "activeIngredient": "Paracetamol 500mg",
    "dosageForm": "100s Bottle",
    "initialStock": 50,
    "reorderLevel": 10
  }
  ```
- **SUCCESS RESPONSE (201 Created)**: Returns created `ProductDTO`
- **ERROR RESPONSES**: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`
- **FRONTEND FILE USING ENDPOINT**: `js/api/product-api.js`, `js/services/product-service.js`, `js/pages/admin-products.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.ProductController`

#### 9. Delete Product (Admin Only)
- **METHOD**: `DELETE`
- **FULL URL**: `http://localhost:8080/api/v1/products/{id}`
- **AUTHENTICATION**: Bearer JWT
- **ROLE**: `ROLE_ADMIN`
- **PATH PARAMETERS**: `id` (Long)
- **SUCCESS RESPONSE (200 OK)**:
  ```json
  {
    "status": 200,
    "message": "Product deleted successfully",
    "data": null
  }
  ```
- **ERROR RESPONSES**: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`
- **FRONTEND FILE USING ENDPOINT**: `js/api/product-api.js`, `js/services/product-service.js`, `js/pages/admin-products.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.ProductController`

---

### 5.3 Shopping Cart Endpoints (`CartController.java`)

#### 10. Get User Cart
- **METHOD**: `GET`
- **FULL URL**: `http://localhost:8080/api/v1/cart`
- **AUTHENTICATION**: Bearer JWT
- **ROLE**: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_PHARMACIST`
- **REQUEST HEADERS**: `Authorization: Bearer <JWT>`, `Accept: application/json`
- **SUCCESS RESPONSE (200 OK)**:
  ```json
  {
    "items": [
      {
        "id": 1,
        "productId": 2,
        "name": "Digital Blood Pressure Monitor",
        "brand": "Omron Healthcare",
        "price": 14850.00,
        "image": "assets/images/bp_monitor.png",
        "category": "equipment",
        "requiresPrescription": false,
        "quantity": 1,
        "subtotal": 14850.00,
        "availableStock": 15
      }
    ],
    "count": 1,
    "subtotal": 14850.00,
    "deliveryFee": 0.00,
    "total": 14850.00,
    "freeShippingEligible": true,
    "freeShippingThreshold": 5000.00,
    "amountNeededForFreeShipping": 0.00
  }
  ```
- **ERROR RESPONSES**: `401 Unauthorized`
- **FRONTEND FILE USING ENDPOINT**: `js/api/cart-api.js`, `js/services/cart-service.js`, `js/pages/cart.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.CartController`

#### 11. Add Item to Cart
- **METHOD**: `POST`
- **FULL URL**: `http://localhost:8080/api/v1/cart/items`
- **AUTHENTICATION**: Bearer JWT
- **ROLE**: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_PHARMACIST`
- **REQUEST BODY**:
  ```json
  {
    "productId": 2,
    "quantity": 1
  }
  ```
- **SUCCESS RESPONSE (200 OK)**: Returns updated `CartResponseDTO`
- **ERROR RESPONSES**: `400 Bad Request` (Insufficient stock), `401 Unauthorized`, `404 Not Found`
- **FRONTEND FILE USING ENDPOINT**: `js/api/cart-api.js`, `js/services/cart-service.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.CartController`

#### 12. Remove Item from Cart
- **METHOD**: `DELETE`
- **FULL URL**: `http://localhost:8080/api/v1/cart/items/{id}`
- **AUTHENTICATION**: Bearer JWT
- **ROLE**: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_PHARMACIST`
- **PATH PARAMETERS**: `id` (Long - cart item ID)
- **SUCCESS RESPONSE (200 OK)**: Returns updated `CartResponseDTO`
- **ERROR RESPONSES**: `401 Unauthorized`, `404 Not Found`
- **FRONTEND FILE USING ENDPOINT**: `js/api/cart-api.js`, `js/services/cart-service.js`, `js/pages/cart.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.CartController`

---

### 5.4 Orders & Checkout Endpoints (`OrderController.java`)

#### 13. Create & Place Order
- **METHOD**: `POST`
- **FULL URL**: `http://localhost:8080/api/v1/orders`
- **AUTHENTICATION**: Bearer JWT
- **ROLE**: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_PHARMACIST`
- **REQUEST BODY**:
  ```json
  {
    "customerName": "Sarah Perera",
    "customerEmail": "user@example.com",
    "phone": "+94 77 123 4567",
    "address": "No. 45, Galle Road",
    "city": "Colombo",
    "postalCode": "00300",
    "shippingAddress": "No. 45, Galle Road, Colombo, 00300",
    "paymentMethod": "Credit Card",
    "items": [
      {
        "productId": 2,
        "quantity": 1,
        "price": 14850.00,
        "name": "Digital Blood Pressure Monitor"
      }
    ],
    "subtotal": 14850.00,
    "deliveryFee": 0.00,
    "discount": 0.00,
    "total": 14850.00
  }
  ```
- **SUCCESS RESPONSE (201 Created)**:
  ```json
  {
    "id": 101,
    "orderNumber": "MED-2026-101",
    "date": "2026-09-20",
    "customerName": "Sarah Perera",
    "shippingAddress": "No. 45, Galle Road, Colombo, 00300",
    "paymentMethod": "Credit Card",
    "paymentStatus": "PAID",
    "status": "PENDING",
    "subtotal": 14850.00,
    "deliveryFee": 0.00,
    "total": 14850.00,
    "trackingId": "MED-TRK-101",
    "estimatedDelivery": "2026-09-22",
    "items": [ ... ]
  }
  ```
- **ERROR RESPONSES**: `400 Bad Request` (Stock validation), `401 Unauthorized`
- **FRONTEND FILE USING ENDPOINT**: `js/api/order-api.js`, `js/services/order-service.js`, `js/pages/checkout.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.OrderController`

#### 14. Get User Order History
- **METHOD**: `GET`
- **FULL URL**: `http://localhost:8080/api/v1/orders/my-orders`
- **AUTHENTICATION**: Bearer JWT
- **ROLE**: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_PHARMACIST`
- **SUCCESS RESPONSE (200 OK)**: Returns `List<OrderResponseDTO>`
- **ERROR RESPONSES**: `401 Unauthorized`
- **FRONTEND FILE USING ENDPOINT**: `js/api/order-api.js`, `js/services/order-service.js`, `js/pages/orders.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.OrderController`

#### 15. Get Order Details & Invoice
- **METHOD**: `GET`
- **FULL URL**: `http://localhost:8080/api/v1/orders/{id}`
- **AUTHENTICATION**: Bearer JWT
- **ROLE**: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_PHARMACIST`
- **PATH PARAMETERS**: `id` (Long)
- **SUCCESS RESPONSE (200 OK)**: Returns single `OrderResponseDTO`
- **ERROR RESPONSES**: `401 Unauthorized`, `404 Not Found`
- **FRONTEND FILE USING ENDPOINT**: `js/api/order-api.js`, `js/services/order-service.js`, `js/pages/order-details.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.OrderController`

---

### 5.5 Admin Management & Inventory Endpoints (`AdminController.java`, `InventoryController.java`)

#### 16. Get Dashboard KPI Stats
- **METHOD**: `GET`
- **FULL URL**: `http://localhost:8080/api/v1/admin/dashboard-stats`
- **AUTHENTICATION**: Bearer JWT
- **ROLE**: `ROLE_ADMIN`
- **SUCCESS RESPONSE (200 OK)**:
  ```json
  {
    "totalRevenue": 284500.00,
    "revenueChange": "+14.8%",
    "totalOrders": 64,
    "ordersChange": "+8.2%",
    "totalProducts": 48,
    "lowStockCount": 3,
    "totalUsers": 142
  }
  ```
- **ERROR RESPONSES**: `401 Unauthorized`, `403 Forbidden`
- **FRONTEND FILE USING ENDPOINT**: `js/api/admin-api.js`, `js/services/admin-service.js`, `js/pages/admin-dashboard.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.AdminController`

#### 17. Get Low-Stock Inventory Alerts
- **METHOD**: `GET`
- **FULL URL**: `http://localhost:8080/api/v1/admin/inventory/low-stock`
- **AUTHENTICATION**: Bearer JWT
- **ROLE**: `ROLE_ADMIN`, `ROLE_PHARMACIST`
- **SUCCESS RESPONSE (200 OK)**: Returns `List<InventoryDTO>`
- **ERROR RESPONSES**: `401 Unauthorized`, `403 Forbidden`
- **FRONTEND FILE USING ENDPOINT**: `js/api/admin-api.js`, `js/services/admin-service.js`, `js/pages/admin-dashboard.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.InventoryController`

#### 18. Add Inventory Batch
- **METHOD**: `POST`
- **FULL URL**: `http://localhost:8080/api/v1/admin/inventory/batch`
- **AUTHENTICATION**: Bearer JWT
- **ROLE**: `ROLE_ADMIN`, `ROLE_PHARMACIST`
- **REQUEST BODY**:
  ```json
  {
    "productId": 1,
    "batchNumber": "AMX24-09",
    "quantity": 50,
    "expiryDate": "2027-12-31",
    "manufacturer": "GSK Pharma Ltd"
  }
  ```
- **SUCCESS RESPONSE (201 Created)**: Returns created `InventoryBatchDTO`
- **ERROR RESPONSES**: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`
- **FRONTEND FILE USING ENDPOINT**: `js/api/admin-api.js`, `js/services/admin-service.js`, `js/pages/admin-inventory.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.InventoryController`

#### 19. Update Order Fulfillment Status
- **METHOD**: `PATCH`
- **FULL URL**: `http://localhost:8080/api/v1/admin/orders/{id}/status`
- **AUTHENTICATION**: Bearer JWT
- **ROLE**: `ROLE_ADMIN`, `ROLE_PHARMACIST`
- **PATH PARAMETERS**: `id` (Long)
- **REQUEST BODY**:
  ```json
  {
    "status": "DISPATCHED",
    "trackingId": "MED-TRK-78912"
  }
  ```
- **SUCCESS RESPONSE (200 OK)**: Returns updated `OrderResponseDTO`
- **ERROR RESPONSES**: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`
- **FRONTEND FILE USING ENDPOINT**: `js/api/order-api.js`, `js/services/admin-service.js`, `js/pages/admin-orders.js`
- **BACKEND CONTROLLER**: `lk.ijse.pharmacy_backend.controller.AdminController`

---

## 6. SECURITY ARCHITECTURE & JWT AUTHENTICATION

1. **Password Hashing**: Spring Security utilizes `BCryptPasswordEncoder(12)` on all passwords.
2. **Stateless JWT Tokens**: Tokens are generated on login with an HMAC-SHA256 signature containing `sub` (email), `roles` (authorities), `iat`, and `exp` claims.
3. **Frontend Bearer Injection**: The central `APIClient` reads the token from safe storage and automatically attaches `Authorization: Bearer <token>` to all HTTP requests.
4. **Graceful Expired Session Handling**: Any `401 Unauthorized` response triggers an automatic purge of the token and dispatches an `auth:unauthorized` event to prompt the user to re-authenticate without crashing the UI.

---

## 7. ROLE-BASED ACCESS CONTROL (RBAC) MATRIX

| Feature / Page | GUEST | USER (Customer) | ADMIN |
| :--- | :---: | :---: | :---: |
| Browse Products & Categories | Yes | Yes | Yes |
| View Product Details & Dosage Info | Yes | Yes | Yes |
| Add to Cart (Local Storage) | Yes | Yes | Yes |
| Proceed to Checkout & Place Order | No (Prompted) | Yes | Yes |
| View Order History & Invoices | No | Yes | Yes |
| Manage Profile & Saved Addresses | No | Yes | Yes |
| Access Admin Dashboard & KPIs | No (403) | No (403) | Yes |
| Manage Products & Categories (CRUD) | No (403) | No (403) | Yes |
| Update Order Fulfillment Status | No (403) | No (403) | Yes |
| View Inventory Batches & Expiries | No (403) | No (403) | Yes |
| Export Sales & Jasper Reports | No (403) | No (403) | Yes |

---

## 8. COURSEWORK BONUS FEATURES IMPLEMENTED

1. **MediMate AI Healthcare Assistant & Clinical Advisor**: An intelligent clinical chatbot widget powered by Google Generative AI API (`gemini-2.0-flash-lite`, configurable in `js/chat/MediMate_training_data.js` and executed via `js/pages/chat-bot.js`) capable of answering customer questions with live database context awareness, explaining dosage and Rx upload requirements, recommending OTC medicines, enforcing token safety caps, and preserving customizable 5-message conversation memory.
2. **Visual Analytics & Revenue Dashboard**: Interactive sales graphs and category split charts built using Canvas on the admin dashboard.
3. **Prescription Upload & Zoom Inspection**: Interactive image preview with zoom modal allowing pharmacists to inspect doctors' signatures and prescriptions.
4. **Printable Invoice / Jasper Simulator**: Clean, printable itemized receipt generator with QR code and delivery tracking timeline.
5. **Real-time Free Shipping Threshold Meter**: Interactive progress bar in the cart indicating how much more needs to be added to unlock free island-wide delivery.

---

## 9. PROJECT DIRECTORY & MODULE RESPONSIBILITIES

```
pharmacy-frontend/
│
├── index.html                   # Complete 12-section homepage
├── DOCUMENTATION.md             # Master coursework specification (This document)
│
├── pages/                       # Customer Storefront Pages
│   ├── products.html            # Product catalog with filter sidebar
│   ├── product-details.html     # Medicine/instrument single view
│   ├── categories.html          # Browse all categories
│   ├── cart.html                # Cart management & free delivery meter
│   ├── checkout.html            # Checkout & payment forms
│   ├── login.html               # Sign-in page with quick demo buttons
│   ├── register.html            # User registration form
│   ├── profile.html             # Profile & address management
│   ├── orders.html              # Customer order history
│   ├── order-details.html       # Itemized receipt & delivery status
│   ├── wishlist.html            # Saved products
│   ├── about.html               # Pharmacy licensing & medical team
│   ├── contact.html             # Customer support & branch map
│   └── faq.html                 # Prescription & delivery FAQ
│
├── admin/                       # Admin Portal (Role Protected)
│   ├── dashboard.html           # Sales KPIs, charts, alerts
│   ├── products.html            # Product CRUD with modal forms
│   ├── categories.html          # Category CRUD
│   ├── orders.html              # Order management & status updater
│   ├── users.html               # User accounts & role manager
│   ├── inventory.html           # Batch tracking & expiry alerts
│   └── reports.html             # Jasper reports & analytics
│
├── css/
│   ├── style.css                # Brand colors, typography, buttons
│   ├── components.css           # Cards, modals, toasts, skeletons
│   ├── responsive.css           # Breakpoints (320px, 768px, 1200px, 1440px)
│   └── admin.css                # Admin sidebar, tables, stat cards
│
├── js/
│   ├── app.js                   # Application bootstrapper
│   ├── config.js                # API URLs & storage keys
│   ├── api/                     # Layer 1: HTTP API Clients
│   ├── services/                # Layer 2: Domain Services
│   ├── components/              # Layer 3: Reusable UI Components
│   └── pages/                   # Layer 4: Page Controllers
│
└── assets/images/               # High Quality Photographic Assets
```

---

## 10. USER MANUAL, TESTING GUIDE & DEMO CREDENTIALS

### 10.1 Quick Demo Login Credentials
For instant coursework demonstration and evaluation:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Customer User** | `user@example.com` | `password123` | Storefront, Cart, Checkout, Orders, Profile |
| **Administrator** | `admin@medora.com` | `admin123` | All Storefront + Full Admin Portal (`admin/`) |
| **Pharmacist** | `pharmacist@medora.com` | `pharma123` | Inventory, Prescriptions, Orders |

### 10.2 Switching between Mock Mode and Live Spring Boot API
In `js/config.js`:
- To run with built-in realistic mock data:
  ```javascript
  USE_MOCK_DATA: true
  ```
- To connect to a live running Spring Boot REST API:
  ```javascript
  USE_MOCK_DATA: false,
  API_BASE_URL: 'http://localhost:8080/api/v1'
  ```

---

## 11. PHARMACEUTICAL CATALOG REGISTRY (INCREMENT 1.1)

The system now hosts an expanded catalog of 14 certified healthcare products across 4 core departments:

| ID | Product Name | Brand | Department | Retail Price | Key Specification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Amoxicillin 500mg Antibiotic Capsules | GlaxoSmithKline | Medicines (Rx) | Rs. 650.00 | Amoxicillin Trihydrate 500mg (Rx Required) |
| **2** | Digital BP Upper Arm Monitor | Omron Healthcare | Medical Equipment | Rs. 14,850.00 | IntelliWrap Sensor & 60 Memory slots |
| **3** | Daily Multivitamin & Immunobooster 60s | Seven Seas | Vitamins | Rs. 3,200.00 | Multivitamins A, B, C, D3, E, Zinc, Iron |
| **4** | Instant Fingertip Pulse Oximeter OLED | Beurer | Medical Equipment | Rs. 4,950.00 | SpO2 Arterial Blood Oxygen & Pulse Rate |
| **5** | Accu-Chek Instant Blood Glucose Kit | Roche Diagnostics | Medical Equipment | Rs. 8,900.00 | 4-Second Test Time & Softclix Lancing Pen |
| **6** | Paracetamol Extra Strength 500mg (100s)| Haleon / Panadol | Medicines (OTC) | Rs. 480.00 | Paracetamol BP 500mg Pain & Fever Relief |
| **7** | Ultrasonic Compressor Nebulizer | Philips Respironics | Medical Equipment | Rs. 12,500.00 | Piston Compressor Aerosol Therapy 0.35ml/min |
| **8** | Non-Contact Forehead Thermometer | Microlife | Medical Equipment | Rs. 6,200.00 | 1-Second Infrared Fever Scanner (±0.2°C) |
| **9** | Gentle Baby Wash & Tear-Free Shampoo | Gentle Sprout / Sebamed | Baby Care | Rs. 2,450.00 | Hypoallergenic, pH 5.5, Chamomile & Panthenol |
| **10**| Baby Healing Diaper Rash Barrier Cream | Nurture Baby / Sudocrem| Baby Care | Rs. 1,850.00 | Zinc Oxide 15.25%, Calendula, Panthenol |
| **11**| Infant Natural Colic Relief Gripe Water| Tummy Calm | Baby Care | Rs. 780.00 | Dill Seed Oil & Sodium Bicarbonate (Alcohol-Free) |
| **12**| Effervescent Vitamin C 1000mg + Zinc | Vita-Immune / Redoxon | Vitamins | Rs. 1,950.00 | Fast-Dissolving Orange Effervescent (20 Tabs) |
| **13**| Omega-3 Triple Strength Fish Oil 1000mg| Vita-Premium | Vitamins | Rs. 4,600.00 | Concentrated EPA 360mg / DHA 240mg (90 Softgels) |
| **14**| Calcium Carbonate + Vitamin D3 60s | Vita-Premium | Vitamins | Rs. 2,800.00 | Calcium 600mg + Vit D3 400IU Bone Density |

---

## 12. ADMIN PANEL UI & HIGH-CONTRAST BADGE SYSTEM

To ensure optimal accessibility and readability across the Admin Management views (Products, Inventory, Categories, Orders):

- **Category Badges (`.badge-category-yellow`, `.badge-category`)**: Styled with a high-contrast soft amber/yellow background (`#FEF08A`), deep amber/brown text (`#854D0E`), golden border (`#FACC15`), and rounded pill geometry with 600 weight typography. This resolves contrast issues with white table row backgrounds.
- **Payment Method Badges (`.badge-payment-method`)**: Soft teal-blue pill badge with dark navy text.
- **Text Utility (`.text-navy`)**: Explicitly defined `#003B66 !important` to ensure text retains high contrast inside custom badges and light components.

---

## 13. HEALTHCARE STANDARD STAT TILES & PHARMACEUTICAL WATERMARK SYSTEM

The four core trust & volume metric tiles under *"The KK PHARMACY Healthcare Standard"* are styled with dynamic pharmaceutical visuals:

- **Background Art & Radial Gradients**: Soft themed radial gradients (`rgba(224, 242, 254, 0.65)` for Medicines, emerald for Patients, sapphire indigo for Delivery, and warm amber for Genuine Quality).
- **Embedded Pharmaceutical Watermarks (`.stat-bg-watermark`)**: Large, subtle (opacity 0.07 -> 0.15 on hover) pharmaceutical vector glyphs (`bi-capsule`, `bi-heart-pulse-fill`, `bi-truck-front-fill`, `bi-award-fill`) that rotate and smoothly expand when hovered.
- **Top Glow Accent Bars**: Multi-color linear gradient top caps representing each healthcare department.
- **Verification Micro-Badges (`.stat-tag`)**: Trust markers attached to each metric (*"Rx & OTC Verified"*, *"Trusted Care"*, *"Islandwide Express"*, *"NMRA Approved"*).

---

## 14. 4 PILLARS OF MEDICAL TRUST TILE SUITE (ABOUT & HOMEPAGE)

The *"4 Pillars of Medical Trust"* and core healthcare value boxes are upgraded with modern UI styling:

- **Clinical Card Architecture (`.trust-card`, `.feature-box`)**: Glassmorphic backgrounds with subtle themed radial color meshes (NMRA blue, Cold-Chain cryo-cyan, Pharmacist emerald, and Patient-first rose).
- **Background Medical Watermarks (`.trust-bg-watermark`)**: Oversized, ultra-crisp vector glyphs (`bi-shield-check`, `bi-snow2`, `bi-person-badge-fill`, `bi-heart-pulse-fill`) with subtle transparency (0.06 normal -> 0.16 hover) and smooth 3D rotation expansion.
- **Interactive Micro-Motions**: Cards lift on hover (`translateY(-8px)`) with expanded ambient shadow and squircle icon rotational pulse (`scale(1.1) rotate(5deg)`).
- **Trust Badges (`.trust-tag`)**: Departmental certification markers embedded into each card (*"Regulatory Approved"*, *"2°C – 8°C Monitored"*, *"Clinical Oversight"*, *"24/7 Care & Refills"*).

---

## 15. ABOUT US CORNER FLOATING LOGO ORB CLUSTER & STAR PARTICLES

The floating UI on the **About Us** page hero showcase has been streamlined into pure floating glassmorphic logo bubbles clustered around the hero image corner:

- **Word Removal & Pure Logo Orbs (`.floating-logo-bubble`)**: Replaced rectangular text pills with sleek, frosted-glass circular logo bubbles containing pure pharmaceutical glyphs/emojis (`💊`, `🛡️ NMRA Shield`, `🩺 Heartbeat Care`, `💉 Dispense`).
- **Corner Constellation & Separate Independent Floating**:
  1. **💊 3D Pill Capsule Orb (`.corner-orb-pill`)**: Floats up & down with rotational swing (`orbFloatSeparate1`).
  2. **🛡️ NMRA Shield Orb (`.corner-orb-shield`)**: Royal sapphire floating bubble with independent oscillation (`orbFloatSeparate2`).
  3. **🩺 Heartbeat Care Orb (`.corner-orb-heart`)**: Mint-emerald floating pulse orb (`orbFloatSeparate3`).
  4. **💉 Digital Dispense Orb (`.corner-orb-syringe`)**: Indigo-cyan floating syringe orb (`orbFloatSeparate4`).
- **Twinkling Star Particles (`.floating-star`)**: 4 glowing star sparkles (`bi-stars`, `bi-sparkle`, `bi-plus-lg`, `bi-star-fill`) continuing to twinkle and float like stars across the hero image.
- **Hover Interactions**: Hovering over any orb pauses its floating motion and smoothly scales it to `1.24x` with an illuminated medical halo.

---

## 16. MEDICAL CATEGORY TILE SUITE & CLINICAL AESTHETICS

The 6 departmental category tiles on [categories.html](file:///d:/sem%202/API%20Development/API%20Final%20Course%20Work/Pharmacy%20website/pharmacy_frontend/pages/categories.html) and homepage quick navigation are enhanced with professional pharmacy design language:

- **Departmental Radial Gradients (`.category-card-premium`)**: Individual soft clinical color meshes tailored to each healthcare division (Medicines cyan, Prescription cobalt, Equipment mint-teal, Vitamins amber, Personal Care azure, and Baby Care soft rose).
- **Background Pharmaceutical Watermarks (`.category-bg-watermark`)**: Large, subtle vector glyphs (`bi-capsule`, `bi-file-earmark-medical`, `bi-heart-pulse-fill`, `bi-lightning-charge-fill`, `bi-droplet-fill`, `bi-emoji-smile-fill`) in the bottom-right corner with 0.06 -> 0.16 hover expansion.
- **Top Accent Color Bars**: Linear gradient top indicator bars for visual department demarcation.
- **Micro-Interactions**: Smooth `translateY(-8px)` lift on hover with glowing squircle icon rotational pulse (`scale(1.1) rotate(5deg)`) and active pill badge transitions.

---

## 17. DYNAMIC REST API CATEGORY VISUAL METADATA ENRICHMENT

Resolved an issue where live Spring Boot REST API responses (which return numeric category IDs without frontend icon/theme mappings) were causing all 6 categories to fall back to a default capsule pill icon:

- **Smart Metadata Resolver (`ProductService._resolveCategoryMeta`)**: Intelligently classifies categories by keyword, slug, or ID into their respective clinical departments (*Medicines*, *Prescription Medicines*, *Medical Equipment*, *Vitamins & Supplements*, *Personal Care*, *Baby Care*).
- **Unique Visual Identifiers**: Restored dedicated Bootstrap icons (`bi-capsule`, `bi-file-earmark-medical`, `bi-heart-pulse`, `bi-lightning-charge`, `bi-droplet-half`, `bi-emoji-smile`), matching watermarks, and accurate product metrics (e.g. `1,200+ Products`, `850+ Products`, `420+ Devices`, `650+ Products`, `980+ Items`, `340+ Items`).
- **CSS Selector Mapping**: Supported both numeric IDs (`.category-card-1` through `.category-card-6`) and department slugs so all background radial gradients, glowing squircle icons, and top indicator bars render with live API data.

---

## 18. HOMEPAGE INFINITE HORIZONTAL MOVING CATEGORY MARQUEE

The **"Essential Healthcare Categories"** section on the homepage ([index.html](file:///d:/sem%202/API%20Development/API%20Final%20Course%20Work/Pharmacy%20website/pharmacy_frontend/index.html)) has been converted from a multi-line wrapping grid into a continuous, single-line **non-breaking infinite loop horizontal marquee carousel**:

- **Single Horizontal Stream (`.category-marquee-track`)**: Category cards are locked into a single horizontal row with fixed `220px` card widths and uniform `1.25rem` item margins.
- **Continuous Non-Breaking Stream (4x Quadrupled Set)**: Category tiles are rendered in a 4-fold sequence (Set 1 + Set 2 + Set 3 + Set 4) creating a wide (~6,700px) continuous stream that prevents any edge cutoff, empty screen spaces, or resets on any screen resolution (including 4K displays).
- **Mathematically Seamless Infinite Loop (`@keyframes categoryMarqueeLoop`)**: Smoothly glides horizontally from `translateX(0)` to `translateX(-25%)` in 30s. When resetting from -25% to 0%, the start of Set 2 perfectly aligns with Set 1's starting position for a 100% invisible, hitch-free continuous glide.
- **Edge Fading Masks**: Dual-sided gradient fade mask (`mask-image: linear-gradient(...)`) creating a smooth transition at the left and right edges.
- **Pause on Hover**: Hovering over the marquee track or any individual category card pauses the animation, lifts the card with a 3D elevation (`translateY(-8px) scale(1.03)`), illuminates the squircle icon (`rotate(6deg)`), and allows immediate category filtering on click.

---

## 19. EYE-COMFORT COLORFUL CATEGORY TILES & AVATAR PALETTE SYSTEM

Every healthcare category tile across the infinite horizontal carousel and category overview has been upgraded with distinct, eye-comfort pastel-mesh backgrounds and vibrant medical avatar icon boxes for high contrast and visual harmony:

- **Eye-Comfort Departmental Palettes**:
  1. **Medicines (`.category-card-medicines`, `.category-card-1`)**: Soft Sky Azure gradient (`#F0F9FF` -> `#BAE6FD`), Sky Blue squircle avatar icon box (`#0284C7`), cyan top accent bar, and subtle watermarked capsule.
  2. **Prescription Medicines (`.category-card-prescription`, `.category-card-2`)**: Soft Lavender Indigo gradient (`#F5F3FF` -> `#DDD6FE`), Royal Indigo squircle avatar icon box (`#4F46E5`), indigo top accent bar, and watermarked medical prescription glyph.
  3. **Medical Equipment (`.category-card-equipment`, `.category-card-3`)**: Soft Clinical Mint gradient (`#F0FDF4` -> `#BBF7D0`), Emerald squircle avatar icon box (`#059669`), emerald top accent bar, and watermarked heartbeat pulse.
  4. **Vitamins & Supplements (`.category-card-vitamins`, `.category-card-4`)**: Soft Warm Amber/Peach gradient (`#FFFBEB` -> `#FDE68A`), Amber Gold squircle avatar icon box (`#D97706`), amber top accent bar, and watermarked lightning energy charge.
  5. **Personal Care (`.category-card-personal-care`, `.category-card-5`)**: Soft Aqua Cyan gradient (`#ECFEFF` -> `#A5F3FC`), Deep Aqua Cyan squircle avatar icon box (`#0891B2`), cyan top accent bar, and watermarked hygiene droplet.
  6. **Baby & Mother Care (`.category-card-baby-care`, `.category-card-baby`, `.category-card-6`)**: Soft Rose Blossom gradient (`#FDF2F8` -> `#FBCFE8`), Rose Pink squircle avatar icon box (`#DB2777`), pink top accent bar, and watermarked happy baby smile.
  7. **First Aid & Emergency (`.category-card-first-aid`, `.category-card-7`)**: Soft Coral Ruby gradient (`#FEF2F2` -> `#FECACA`), Ruby Red squircle avatar icon box (`#DC2626`), crimson top accent bar, and watermarked bandaid glyph.
- **Enhanced Avatar Contrast**: Squircle icon boxes use vibrant background gradients with a crisp white icon glyph and soft matching drop shadows, ensuring instant visual recognition without harsh eye strain.

---
*Document maintained automatically with each build increment.*

