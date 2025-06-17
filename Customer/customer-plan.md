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
4.  **Basic Profile Management:** (Verified Existing) API (`Customer/src/app/api/account/profile/route.ts`) and UI (`Customer/src/app/account/profile/page.tsx`) for viewing/editing basic user profile were found to be already implemented and functional.
5.  **Remove/Refactor Clerk files:** (Completed) `Customer/src/app/sign-in` & `sign-up` use custom auth.
6.  **Enhance server-side logout to reliably invalidate sessions.** (Verified Existing) Server-side logout at `Customer/src/app/api/auth/logout/route.ts` was verified to be robust, correctly invalidating sessions by comparing the cookie's refresh token with hashed tokens in the `Session` table.
7.  **Implement robust input validation (e.g., using Zod) for all auth API endpoints.** (Verified Existing) Zod input validation was confirmed to be already implemented for all relevant auth API endpoints (`login`, `register`, `request-password-reset`, `reset-password`), using schemas from `@/lib/validators/auth-schemas.ts`.
8.  **Implement Rate Limiting for Auth Endpoints:** (Verified Existing) Rate limiting was confirmed to be correctly implemented for `login`, `register`, `refresh`, and `request-password-reset` routes, using predefined limiters from `@/lib/rate-limiter.ts`.
9.  **Ensure comprehensive error handling and logging for auth flows.** (Completed) Standardized and enhanced logging across all authentication API routes by ensuring consistent use of the `log(severity, message)` utility and adding specific log points for key events.
10. **Develop/verify client-side UI and state management for authentication (context, redirects, error display).** (Largely Verified) Core client-side authentication components (`AuthContext`, sign-in, sign-up, middleware, request-password-reset page) were reviewed and found to be well-implemented, handling state, errors, and redirects correctly. Full verification of reset password token page and dynamic UI updates (e.g., header) was pending when focus shifted to Phase 2.

### Phase 2: Product Display & Sanity Integration

**Prerequisite:** A new `product` schema has been designed and implemented in Sanity Studio (`Sanity-Studio/schemaTypes/product.schema.ts` and `size.schema.ts`). This schema provides a comprehensive structure for managing product details, including name, description, pricing, images, categories, variants (with color, size, stock), and SEO fields directly within Sanity. The following tasks will leverage this new product schema.

1.  **Define and Implement Sanity GraphQL Queries:** (Completed)
    *   Developed GraphQL queries to fetch product listings (e.g., for category pages, featured products).
    *   Created queries for single product details, including all relevant fields from the `product` schema (description, variants, images, etc.).
    *   Developed queries for category and subcategory information, including `_updatedAt` for sitemap generation.
    *   Stored these queries in `Customer/src/lib/sanity/queries.ts`.
2.  **Implement Data Fetching Logic in Customer App:** (Completed)
    *   Created `Customer/src/lib/sanity/client.ts` to configure the Sanity client.
    *   Implemented TypeScript interfaces for fetched data structures (Product, Category, etc.).
    *   Developed data fetching functions corresponding to the GraphQL queries, with error handling.
    *   Implemented `Customer/src/lib/sanity/image.ts` for building image URLs.
3.  **Develop Core Product Display Pages:** (Completed)
    *   **Home Page (`Customer/src/app/page.tsx`):** Enhanced to display featured products fetched from Sanity using `ProductCard`.
    *   **Category Pages (`Customer/src/app/category/[slug]/page.tsx`):** Created dynamic pages that list products belonging to a specific category, using data from Sanity and `ProductCard`. Includes basic pagination.
    *   **Product Detail Pages (`Customer/src/app/product/[slug]/page.tsx`):** Created dynamic pages to display detailed information for a single product, including its description, images, price, and other attributes from Sanity.
    *   Leveraged existing `ProductCard.tsx` component, which was updated to use Sanity data.
    *   *Note: Placeholders exist for full Portable Text rendering, functional variant selection UI, and add-to-cart logic on product detail pages. These are considered future enhancements within or beyond this phase.*
4.  **Implement Basic SEO for Product & Category Pages:** (Completed)
    *   Utilized Next.js `generateMetadata` function in `Customer/src/app/category/[slug]/page.tsx` and `Customer/src/app/product/[slug]/page.tsx` to dynamically set page titles, descriptions, and Open Graph metadata using data fetched from Sanity.
    *   Updated `Customer/src/app/robots.ts` to point to the dynamic sitemap.
    *   Implemented a dynamic `Customer/src/app/sitemap.ts` that includes URLs for static pages, all active products, and all categories, using `_updatedAt` for `lastModified` dates.
5.  **(Optional - if time permits or as follow-up) Basic Product Search Functionality:** (Not Started)
    *   Implement a simple search input that queries Sanity for products based on name or tags.
    *   Display search results on a dedicated search results page.

### Phase 3: Cart & Basic Checkout
1.  **Client-Side Cart:** (Completed)
    *   Reviewed and solidified `Customer/src/store/useCartStore.ts` (Zustand).
    *   Refactored to use `CartItemType` with a composite `cartItemId` for variant handling, ensuring prices and totals are calculated correctly.
    *   Implemented helper functions for total calculation and updated cart actions (`addToCart`, `removeFromCart`, `deleteFromCart`, `clearCart`).
    *   Ensured cart state is persisted to localStorage.
2.  **Cart Display:** (Completed)
    *   Implemented the cart page at `Customer/src/app/cart/page.tsx`.
    *   Displays items from `useCartStore` with details (image, name, price, quantity).
    *   Allows users to update item quantities and remove items from the cart.
    *   Shows cart subtotal and total amount, with a "Proceed to Checkout" button.
    *   Handles the empty cart scenario gracefully.
3.  **Checkout API (COD):** (Completed)
    *   Implemented the order creation API route at `Customer/src/app/api/orders/create/route.ts`.
    *   The API is authenticated and validates request payloads using Zod schemas.
    *   It performs server-side verification of the total order amount.
    *   Handles creation of new shipping addresses or uses existing ones (with ownership check).
    *   Uses a Prisma transaction to create `Order`, `Delivery`, and associated `CartItem` records. Payment method is set to 'COD' and initial order/payment statuses are 'PENDING'. Prices in `CartItem` are stored in cents.
4.  **Basic Checkout UI:** (Completed)
    *   Developed a multi-step checkout page at `Customer/src/app/checkout/page.tsx`.
    *   Steps include: 1. Shipping Address (new address entry, pre-fills some user data), 2. Shipping Method (placeholder) & Payment Method (COD only), 3. Order Review.
    *   Integrates with `useAuth` for user data and `useCartStore` for cart details.
    *   Includes client-side form validation and appropriate loading/error states.
    *   Calls the order creation API and redirects to an order confirmation page upon success.
5.  **Order Confirmation Page:** (Completed)
    *   Implemented a dynamic order confirmation page at `Customer/src/app/order-confirmation/[orderId]/page.tsx`.
    *   Displays a "Thank You" message and the `orderId` extracted from the URL.
    *   Provides links for users to continue shopping or navigate to their (future) order history page.

### Phase 4: Full Account Management
1.  **Address Management:** (Completed)
    *   **API:** Implemented API routes under `Customer/src/app/api/account/addresses/` for full CRUD operations (GET all, POST new, GET single, PUT update, DELETE single) and a dedicated PATCH route to set a primary address. Features include Zod validation for request payloads, user authentication, ownership checks for address manipulation, and transactional updates for ensuring a single primary address.
    *   **UI:** Developed the address management page at `Customer/src/app/account/addresses/page.tsx`. This page allows authenticated users to view their list of saved addresses, add new addresses through a form, edit existing ones, delete addresses (with confirmation), and set one address as their primary. The UI provides feedback on these operations.
2.  **Order History:** (Completed)
    *   **API:** Implemented API routes under `Customer/src/app/api/account/orders/`.
        *   The `GET /api/account/orders` route provides a paginated list of orders for the authenticated user, including essential details like order ID, date, total amount (calculated from cents to float), item count, and statuses.
        *   The `GET /api/account/orders/[orderId]` route provides detailed information for a specific order, verifying user ownership. This includes all order items (with prices converted from cents), shipping address, and various statuses.
    *   **UI:**
        *   Developed the order history listing page at `Customer/src/app/account/orders/page.tsx`. This page fetches and displays the paginated list of orders in a table, with links to individual order detail pages and pagination controls. Statuses are visually distinguished using badges.
        *   Developed the dynamic order detail page at `Customer/src/app/account/orders/[orderId]/page.tsx`. This page fetches and displays comprehensive details for a specific order, including item images, names, quantities, prices, shipping information, and order/payment/delivery statuses.

### Phase 5: Advanced Features & UX Optimizations
1.  **Basic Product Search Functionality:** (Completed)
    *   **API:** Implemented an API route (`Customer/src/app/api/products/search/route.ts`) that queries Sanity for products matching a search term (targets product `name` and `excerpt`). Includes Zod validation for search parameters.
    *   **Sanity Client:** Updated `Customer/src/lib/sanity/client.ts` and `queries.ts` with search-specific functions and GraphQL queries.
    *   **UI:** Developed the search results page (`Customer/src/app/search/page.tsx`) which includes a search input form. The page fetches results from the API, displays them using `ProductCard` components, and handles loading, error, and no-results states. URL query parameters are used for managing search terms.
2.  **Advanced SEO with JSON-LD:** (Completed)
    *   Implemented JSON-LD structured data snippets manually within page components to enhance SEO:
        *   Added `Product` schema JSON-LD to Product Detail Pages (`Customer/src/app/product/[slug]/page.tsx`), including dynamic fields like name, description, image, SKU, brand, and offers (with price, currency, availability).
        *   Added `BreadcrumbList` schema JSON-LD to Category Pages (`Customer/src/app/category/[slug]/page.tsx`) to define navigation hierarchy.
        *   Added `Organization` and `WebSite` (including `SearchAction` for Sitelinks Search Box potential) schema JSON-LD to the Home Page (`Customer/src/app/page.tsx`).
3.  **Persistent Cart (Database-backed for logged-in users):** (Completed)
    *   **API (`Customer/src/app/api/cart/route.ts`):**
        *   `GET` endpoint: Fetches an authenticated user's cart from Prisma, maps DB `CartItem`s to client-side `CartItemType` (includes price conversion from cents, `cartItemId` generation).
        *   `POST` endpoint: Syncs a client's cart to Prisma for an authenticated user. Uses a transaction to delete old cart items and create new ones (includes price conversion to cents for DB). Validates input with Zod.
    *   **Client-Side Integration:**
        *   `useCartStore.ts`: Added `setCart` action (for hydrating store from DB) and `syncCartToDb` async action (to POST cart to API). Assumes unit prices are stored in Zustand `CartItemType.price`.
        *   `AuthContext.tsx`: Modified to call `fetchAndSetDbCart` (which uses the GET cart API and `setCart`) upon user login or session verification. Clears local cart on logout.
        *   UI components (e.g., `CartPage.tsx`) updated to call `syncCartToDb` after local cart modifications if the user is authenticated.
4.  **Analytics Integration:** (Deferred)
    *   Initial strategy discussion was prepared, but implementation has been deferred based on user request. This task can be revisited later.

### Future Phases:
-   AI/ML Powered Search & Recommendations.
-   Payment Gateway Integrations.
-   Mobile Application.

This revised plan provides a more detailed and actionable roadmap for the Customer website. It will be a living document, updated as development progresses.
