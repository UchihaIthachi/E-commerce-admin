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

-   **Objective:** A custom JWT-based authentication system (credentials & Google OAuth2) using Next.js API Route Handlers is *already in place* and has been reviewed. This section outlines its current structure and planned refinements.
-   **Schema Interaction:** Leverages Prisma models: `User` (profile), `Account` (credentials, provider type), `Session` (active logins), `VerificationToken` (for email verification/password reset).
-   **Key API Routes (are implemented in `Customer/src/app/api/auth/` and include):**
    -   `POST /api/auth/register`:
        -   Input: email, password, name.
        -   Action: Hash password. Create `User` and `Account` records in Prisma. Optionally, send verification email (using `VerificationToken`).
    -   `POST /api/auth/login`:
        -   Input: email, password.
        -   Action: Validate credentials against `Account`. If valid, create `Session` record. Return session token (e.g., JWT or opaque token stored in HTTPOnly cookie).
    -   `POST /api/auth/logout`:
        -   Action: Clears client-side session cookies. Server-side session invalidation to be reviewed/enhanced to ensure robust lookup and deletion of hashed refresh tokens from the `Session` table.
    -   `GET /api/auth/session`:
        -   Action: Verify current session token, return user data if valid.
    -   `POST /api/auth/request-password-reset`:
        -   Input: email.
        -   Action: Generate `VerificationToken`, send password reset email.
    -   `POST /api/auth/reset-password`:
        -   Input: token, new password.
        -   Action: Verify token, update password in `Account`.
-   **Frontend Components:**
    -   Custom sign-in, sign-up, and password reset forms/pages are in use.
    -   **Action Item (Completed):** Reviewed `Customer/src/app/sign-in/` & `sign-up` pages; they are already using the custom authentication flow and have no Clerk-related conflicts.
-   **Session Management:**
    -   Uses secure HTTPOnly cookies for session tokens (access and refresh).
    -   Session expiry and refresh token rotation are implemented.

#### Refresh Token Mechanism (for Email/Password)
-   **Objective:** Enhance session security and user experience by implementing refresh tokens alongside access tokens for email/password authentication. (This is implemented).
-   **Token Strategy:**
    -   Access Token: Short-lived, stored in HTTPOnly cookie.
    -   Refresh Token: Longer-lived, stored in secure HTTPOnly cookie AND hashed in the `Session` table.
-   **API Endpoint Updates & Additions (in `Customer/src/app/api/auth/`):**
    -   `POST /api/auth/login`: (Implemented) Generate and return access token; set secure HTTPOnly cookie for refresh token; store hashed refresh token in DB.
    -   `POST /api/auth/refresh`: (Implemented) Input: refresh token from cookie. Action: Validate against DB. If valid, issue new access token and rotate refresh token.
    -   `POST /api/auth/logout`: (Implemented) Invalidate session, clear access/refresh token cookies, mark refresh token as invalid/delete from DB.
-   **Client-Side Logic:** Handles 401s by calling `/api/auth/refresh`, retries original request if successful, else redirects to login.
-   **Security Considerations:** Current implementation includes refresh token rotation and hashing. Further review planned for comprehensive revocation strategies and robust rate limiting for all sensitive auth endpoints.

#### Social Login - 'Login with Google'
-   **Objective:** Allow users to register and log in using their Google accounts. (This is implemented).
-   **OAuth 2.0 / OpenID Connect Flow:** Redirect flow (Frontend -> `/api/auth/google/login` -> Google -> `/api/auth/google/callback` -> Backend processing) is implemented.
-   **API Endpoints (Implemented in `Customer/src/app/api/auth/google/`):**
    -   `GET /api/auth/google/login`: Redirects to Google's OAuth URL.
    -   `GET /api/auth/google/callback`: Handles callback from Google. Exchanges auth code for tokens, fetches Google user info. Checks if user exists in local DB via `Account` (`provider: 'google'`, `providerAccountId`). If yes, logs in (creates session, issues app tokens/cookies). If no, creates new `User` and `Account` (auto-registration), then logs in.
-   **Prisma Schema Interaction:** Uses `Account` fields (`provider`, `providerAccountId`) and `User` model.
-   **Frontend Components:** "Login with Google" button implemented.
-   **Configuration:** Secure storage of Google Client ID/Secret, Google Console redirect URI setup is in place.

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
    -   Standardize on GraphQL for all Sanity reads for consistency and precision. Utilize the `graphqlClient`.
    -   Define GraphQL queries for: product listings (by category, search), single product details (including variants, images, description), category listings.
    -   Data fetching functions likely in `Customer/src/lib/api/` or new service modules in `Customer/src/server/application/features/product`.
-   **Frontend Pages & Components:**
    -   Home Page (`Customer/src/app/page.tsx`): Display featured products, categories, banners.
    -   Category Pages (`/category/{slug}`): List products within a category.
    -   Product Detail Pages (`/product/{slug}`): Show detailed product information.
    -   Search Results Page.
-   **Existing Components to Leverage:** `ProductCard.tsx`, `ProductCarousel.tsx`, `ProductDetailCard.tsx`, `CategoryCard.tsx`.

### 4. Shopping Cart & Checkout

-   **Objective:** Provide a seamless cart and checkout experience.
-   **Client-Side Cart Management:** Utilize `Customer/src/store/useCartStore.ts` (Zustand).
-   **Backend Cart Persistence (Optional but Recommended):** API routes to sync client cart with Prisma `Cart` for logged-in users.
-   **Checkout Process (Multi-Step):** Shipping info, shipping method, payment, review.
-   **Order Creation API Route:** `POST /api/orders/create`.
-   **Payment Gateway Integration (Future):** Stripe, Razorpay.

### 5. SEO & Content Presentation (Refined)

-   **Dynamic Page Metadata:** `generateMetadata` for products, categories, home from Sanity.
-   **Rendering Strategies:** ISR, SSR, SSG as appropriate.
-   **Advanced SEO (`next-seo`):** JSON-LD for Product, BreadcrumbList.
-   **Sitemaps & `robots.txt`:** Verify `robots.ts`, implement dynamic `sitemap.ts`.

## III. Customer Application Backend (`Customer/src/server/` & `Customer/src/app/api/`)

-   **API Route Organization:** Logical grouping (auth, account, products, cart, orders).
-   **Prisma Client Usage:** Direct use of Prisma client.
-   **Repository Pattern (Recommended):** For customer-specific queries.
-   **Error Handling:** Consistent error handling for API routes.

## IV. Other Considerations

-   **`/manage` section (`Customer/src/app/manage/`):**
    -   **Action Item:** Clarify purpose. If not for general customer use, out of scope or separate planning.
-   **Planned Features:** Improved Dashboard, Optimized UX (future), Analytics, Mobile App (future).
-   **UI Components:** Leverage existing and ShadCN UI.

## V. Implementation Roadmap (Phased Approach - More Granular)

### Phase 1: Authentication & Core Profile (Verification & Refinement)
1.  **Custom Email/Password Auth API:** (Largely Implemented) Undergoing final review, hardening, and documentation. Includes refresh token mechanism.
2.  **'Login with Google' API:** (Largely Implemented) Undergoing final review, hardening, and documentation.
3.  **Frontend Auth Pages:** (Implemented) Sign-in, sign-up forms (including "Login with Google" button) are functional.
4.  **Basic Profile Management:** (To be implemented) API and UI for viewing/editing basic user profile.
5.  **Remove/Refactor Clerk files:** (Completed) `Customer/src/app/sign-in` & `sign-up` use custom auth.
6.  **Enhance server-side logout to reliably invalidate sessions.** (New Action Item) Focus on robust refresh token invalidation from `Session` table.
7.  **Implement robust input validation (e.g., using Zod) for all auth API endpoints.** (New Action Item)
8.  **Implement Rate Limiting for Auth Endpoints:** Apply rate limiting to sensitive authentication API routes (e.g., login, register, refresh, request-password-reset) to mitigate abuse. (New Action Item)
9.  **Ensure comprehensive error handling and logging for auth flows.** (New Action Item)
10. **Develop/verify client-side UI and state management for authentication (context, redirects, error display).** (New Action Item)

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
