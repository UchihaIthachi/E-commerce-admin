# Customer Website Implementation Plan (Revised)

This document outlines a detailed strategic plan for developing and enhancing the customer-facing e-commerce website. It leverages a deep understanding of the shared backend systems (Prisma/Supabase and Sanity CMS) and aims to create a robust, feature-rich, and user-friendly online shopping experience.

## I. Foundational Technology & Architecture

-   **Frontend:** Next.js 13 (AppRouter), React, ShadCN UI components.
-   **Backend (Customer Application):** The `Customer` application includes its own backend logic within `Customer/src/server/` utilizing Next.js API Routes (found in `Customer/src/app/api/`). This backend will directly interact with the Prisma ORM.
-   **Database:** Supabase (PostgreSQL) accessed via Prisma ORM. The shared schema (detailed in `Admin/ADMIN_SYSTEM_DETAILS.md` and `prisma/schema.prisma`) includes `User`, `Account`, `Session`, `Address`, `Cart`, `CartItem`, `Order` models crucial for customer functionality.
-   **Content Management:** Sanity CMS, accessed via GraphQL (primarily using the `staticClient` for cached content, or `graphqlClient` for specific queries, as configured in `Admin/src/server/infrastructure/clients/`).
-   **State Management (Client-side):** Zustand (`Customer/src/store/useCartStore.ts`) for UI state like the shopping cart.

## II. Core Customer Journeys & Features

### 1. User Authentication (Custom with Prisma)

-   **Objective:** Implement a secure and seamless custom authentication system using email/password.
-   **Schema Interaction:** Leverages Prisma models: `User` (profile), `Account` (credentials, provider type), `Session` (active logins), `VerificationToken` (for email verification/password reset).
-   **Key API Routes (to be created/verified in `Customer/src/app/api/auth/`):**
    -   `POST /api/auth/register`:
        -   Input: email, password, name.
        -   Action: Hash password. Create `User` and `Account` records in Prisma. Optionally, send verification email (using `VerificationToken`).
    -   `POST /api/auth/login`:
        -   Input: email, password.
        -   Action: Validate credentials against `Account`. If valid, create `Session` record. Return session token (e.g., JWT or opaque token stored in HTTPOnly cookie).
    -   `POST /api/auth/logout`:
        -   Action: Invalidate/delete `Session` record. Clear session cookie.
    -   `GET /api/auth/session`:
        -   Action: Verify current session token, return user data if valid.
    -   `POST /api/auth/request-password-reset`:
        -   Input: email.
        -   Action: Generate `VerificationToken`, send password reset email.
    -   `POST /api/auth/reset-password`:
        -   Input: token, new password.
        -   Action: Verify token, update password in `Account`.
-   **Frontend Components:**
    -   Develop custom sign-in, sign-up, and password reset forms/pages.
    -   **Action Item:** Review and remove/refactor existing Clerk-related files in `Customer/src/app/sign-in/` and `Customer/src/app/sign-up/` to avoid conflicts.
-   **Session Management:**
    -   Use secure HTTPOnly cookies for session tokens.
    -   Implement session expiry and renewal logic.

#### Refresh Token Mechanism (for Email/Password)
-   **Objective:** Enhance session security and user experience by implementing refresh tokens alongside access tokens for email/password authentication.
-   **Token Strategy:**
    -   Access Token: Short-lived, stored in HTTPOnly cookie (or client memory).
    -   Refresh Token: Longer-lived, stored in secure HTTPOnly cookie AND hashed/encrypted in DB (associated with `Session` or `Account`).
-   **API Endpoint Updates & Additions (in `Customer/src/app/api/auth/`):**
    -   `POST /api/auth/login`: (Update) Generate and return access token; set secure HTTPOnly cookie for refresh token; store hashed refresh token in DB.
    -   `POST /api/auth/refresh`: (New) Input: refresh token from cookie. Action: Validate against DB. If valid, issue new access token (and optionally rotate refresh token).
    -   `POST /api/auth/logout`: (Update) Invalidate session, clear access/refresh token cookies, invalidate refresh token in DB.
-   **Client-Side Logic:** Handle 401s by calling `/api/auth/refresh`, retry original request if successful, else redirect to login.
-   **Security Considerations:** Refresh token rotation, expiry, revocation mechanism, rate limiting for refresh endpoint.

#### Social Login - 'Login with Google'
-   **Objective:** Allow users to register and log in using their Google accounts.
-   **OAuth 2.0 / OpenID Connect Flow:** Describe the redirect flow (Frontend -> `/api/auth/google/login` -> Google -> `/api/auth/google/callback` -> Backend processing).
-   **API Endpoints (New in `Customer/src/app/api/auth/google/`):**
    -   `GET /api/auth/google/login`: Redirects to Google's OAuth URL.
    -   `GET /api/auth/google/callback`: Handles callback from Google. Exchanges auth code for tokens, fetches Google user info. Checks if user exists in local DB via `Account` (`provider: 'google'`, `providerAccountId`). If yes, logs in (creates session, issues app tokens/cookies). If no, creates new `User` and `Account` (auto-registration), then logs in.
-   **Prisma Schema Interaction:** Uses `Account` fields (`provider`, `providerAccountId`) and `User` model.
-   **Frontend Components:** "Login with Google" button.
-   **Configuration:** Secure storage of Google Client ID/Secret, Google Console redirect URI setup.

### 2. User Account Management

-   **Objective:** Allow authenticated users to manage their profile, addresses, and view order history.
-   **Key API Routes (to be created/verified in `Customer/src/app/api/account/`):**
    -   `GET /api/account/profile`: Fetches current user's profile data from `User` model.
    -   `PUT /api/account/profile`: Updates user profile data.
    -   `GET /api/account/addresses`: Fetches user's addresses from `Address` model.
    -   `POST /api/account/addresses`: Adds a new address.
    -   `PUT /api/account/addresses/{addressId}`: Updates an existing address.
    -   `DELETE /api/account/addresses/{addressId}`: Deletes an address.
    -   `GET /api/account/orders`: Fetches user's order history from `Order` model, including basic details and status.
    -   `GET /api/account/orders/{orderId}`: Fetches detailed information for a specific order.
-   **Frontend Pages/Components:**
    -   `/account/dashboard` (overview)
    -   `/account/profile` (edit profile form)
    -   `/account/addresses` (list, add, edit addresses)
    -   `/account/orders` (list orders)
    -   `/account/orders/{orderId}` (view order details)

### 3. Product Catalog & Display

-   **Objective:** Display products and categories effectively, sourced from Sanity CMS.
-   **Data Fetching:**
    -   Standardize on GraphQL for all Sanity reads for consistency and precision. Utilize the `graphqlClient` (configured in Admin, usable by Customer backend).
    -   Define GraphQL queries for: product listings (by category, search), single product details (including variants, images, description), category listings.
    -   Data fetching functions likely in `Customer/src/lib/api/` or new service modules in `Customer/src/server/application/features/product` (if adopting a heavier backend structure like Admin).
-   **Frontend Pages & Components:**
    -   Home Page (`Customer/src/app/page.tsx`): Display featured products, categories, banners (e.g., using `Billboard.tsx`).
    -   Category Pages (`/category/{slug}`): List products within a category. Utilize `ProductCard.tsx`.
    -   Product Detail Pages (`/product/{slug}`): Show detailed product information, images (`ProductCarousel.tsx`, `ProductDetailCard.tsx`), variants, add-to-cart functionality.
    -   Search Results Page.
-   **Existing Components to Leverage:** `ProductCard.tsx`, `ProductCarousel.tsx`, `ProductDetailCard.tsx`, `CategoryCard.tsx`.

### 4. Shopping Cart & Checkout

-   **Objective:** Provide a seamless cart and checkout experience.
-   **Client-Side Cart Management:**
    -   Utilize `Customer/src/store/useCartStore.ts` (Zustand) for managing cart items, quantities, and subtotal on the client.
    -   `AddToCartButton.tsx` will interact with this store.
    -   `CartSheet.tsx` or a dedicated `/cart` page will display cart contents using `CartProductCard.tsx` and `CartOrderTable.tsx`.
-   **Backend Cart Persistence (Optional but Recommended):**
    -   Consider API routes to sync client-side cart with Prisma `Cart` and `CartItem` models for logged-in users, allowing cart persistence across devices.
    -   `POST /api/cart/sync`: Syncs local cart with DB.
    -   `GET /api/cart`: Fetches user's cart from DB.
-   **Checkout Process (Multi-Step):**
    1.  **Shipping Information:** Collect/select shipping address (interacts with `Address` model).
    2.  **Shipping Method:** Select delivery/pickup.
    3.  **Payment Method:** Select payment option (e.g., COD, Credit Card - initially COD might be simpler).
    4.  **Order Review & Confirmation:** Display final order details.
-   **Order Creation API Route:**
    -   `POST /api/orders/create`:
        -   Input: Cart items, shipping address ID, shipping method, payment method details.
        -   Action: Validate data. Create `Order`, `Delivery`/`Pickup`, and associate `CartItem` records in Prisma. Clear client cart. Send order confirmation email.
-   **Payment Gateway Integration (Future):** For credit cards, integrate with a payment gateway (e.g., Stripe, Razorpay - `razorpay.png` is in public assets). This will involve client-side SDK and server-side webhook handling.

### 5. SEO & Content Presentation (Refined)

-   **Dynamic Page Metadata:**
    -   Implement `generateMetadata` in Next.js page components (products, categories, home) to fetch SEO fields (title, description, OpenGraph tags) from Sanity.
    -   Ensure Sanity schemas for products/categories include dedicated SEO fields.
-   **Rendering Strategies:**
    -   Product/Category Pages: ISR.
    -   Home Page: ISR or SSR.
    -   Static Pages: SSG.
-   **Advanced SEO (`next-seo`):**
    -   Integrate `next-seo` for JSON-LD structured data (Product schema, BreadcrumbList schema) on relevant pages.
-   **Sitemaps & `robots.txt`:**
    -   Verify `Customer/src/app/robots.ts` is correctly configured.
    -   Implement `Customer/src/app/sitemap.ts` to dynamically generate sitemap from Sanity content (products, categories, public pages).

## III. Customer Application Backend (`Customer/src/server/` & `Customer/src/app/api/`)

-   **Acknowledge and Structure:** The Customer application has its own backend logic.
-   **API Route Organization:** Group API routes logically (e.g., `/api/auth/*`, `/api/account/*`, `/api/products/*`, `/api/cart/*`, `/api/orders/*`).
-   **Prisma Client Usage:** API routes will import and use the Prisma client (from `Admin/src/server/infrastructure/clients/prisma.ts` or a shared location if refactored) for database operations.
-   **Repository Pattern (Recommended):** Consider implementing a repository pattern within `Customer/src/server/infrastructure/repositories/` for customer-specific database queries to keep API route handlers clean.
-   **Error Handling:** Implement consistent error handling and response formats for API routes.

## IV. Other Considerations

-   **`/manage` section (`Customer/src/app/manage/`):**
    -   **Action Item:** Clarify the purpose of this directory. If it's not for general customer use, it might be out of scope for this plan or require separate planning. If it's for specific customer roles (e.g., B2B customers managing their own orders), this needs to be detailed.
-   **Planned Features (from previous plan, still relevant):**
    -   Improved Customer Dashboard (covered in Account Management).
    -   Optimized UX (AI/ML Search, Intuitive Navigation - future phases).
    -   Enhanced Analytics.
    -   Mobile Application (long-term future goal).
-   **UI Components:** Leverage existing components in `Customer/src/components/` and ShadCN UI.

## V. Implementation Roadmap (Phased Approach - More Granular)

### Phase 1: Authentication & Core Profile
1.  **Setup Custom Email/Password Auth API:** Implement register, login, logout, session API routes. **Include refresh token mechanism.**
2.  **Setup 'Login with Google' API:** Implement `/google/login` and `/google/callback` routes, including auto-registration.
3.  **Frontend Auth Pages:** Create sign-in, sign-up forms (including "Login with Google" button).
4.  **Basic Profile Management:** API and UI for viewing/editing basic user profile.
5.  **Action Item:** Remove/Refactor Clerk files from `Customer/src/app/sign-in` & `sign-up`.

### Phase 2: Product Display & Sanity Integration
1.  **GraphQL Queries for Sanity:** Define and implement queries for products, categories.
2.  **Core Pages:** Home, Category, Product Detail pages with data from Sanity.
3.  **SEO Foundation:** `generateMetadata` for core pages, `robots.ts`, `sitemap.ts`.

### Phase 3: Cart & Basic Checkout
1.  **Client-Side Cart:** Solidify `useCartStore.ts` functionality.
2.  **Cart Display:** Implement `/cart` page or cart sheet.
3.  **Checkout API (COD):** API route to create order in Prisma with Cash-On-Delivery.
4.  **Basic Checkout UI:** Multi-step form for shipping, review, confirmation (COD).

### Phase 4: Full Account Management
1.  **Address Management:** API and UI for adding/editing/deleting addresses.
2.  **Order History:** API and UI for listing orders and viewing order details.

### Phase 5: Advanced Features & UX Optimizations
1.  **Advanced SEO:** JSON-LD with `next-seo`.
2.  **Persistent Cart:** API for DB-backed cart for logged-in users.
3.  **Search Functionality:** Basic product search.
4.  **Analytics Integration.**

### Future Phases:
-   AI/ML Powered Search & Recommendations.
-   Payment Gateway Integrations.
-   Mobile Application.

This revised plan provides a more detailed and actionable roadmap for the Customer website. It will be a living document, updated as development progresses.
