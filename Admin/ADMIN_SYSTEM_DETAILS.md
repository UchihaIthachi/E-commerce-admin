# Admin Panel: System Details

This document provides a detailed look into the core backend systems of the Admin Panel, including database interactions with Prisma, content management with Sanity, and authentication using Clerk.

## 1. Prisma & Database (Supabase/PostgreSQL) Workflow

### 1.1. Overview
The Admin Panel uses Prisma as its ORM to interact with a PostgreSQL database hosted on Supabase. Prisma is responsible for database schema management, migrations, and providing a type-safe query builder for database operations.

### 1.2. Schema (`prisma/schema.prisma`)
- **Key Models:** Detail the main models found (User, Address, Cart, CartItem, Order, Delivery, Pickup, Account, Session, VerificationToken).
- **Relationships:** Describe important relationships (e.g., User-Order, Order-CartItem, Order-Delivery/Pickup, User-Address).
- **Enums:** List significant enums (PAYMENT_STATUS, DELIVERY_STATUS, ORDER_STATUS, SHIPPING_METHOD, PAYMENT_METHOD) and their purpose.

### 1.3. Prisma Client (`src/server/infrastructure/clients/prisma.ts`)
- **Initialization:** Explain how the Prisma client is initialized and managed, including the caching strategy for development environments.
- **Usage:** The client is imported and used by repository layers.

### 1.4. Repository Pattern
- **Location:** Repositories are primarily located in `src/server/infrastructure/repositories/`.
- **Function:** They abstract the direct Prisma database calls (e.g., `prisma.order.findMany`, `prisma.order.update`).
- **Example (Order Repository - `src/server/infrastructure/repositories/order/order-repository.ts`):**
    - `getOrders`: Fetches multiple orders with related data (orderItems, delivery, pickup addresses) and performs calculations (subtotal, total).
    - `getOrderSummary`: Fetches a single order with details.
    - `updateOrderStatus`, `updatePaymentStatus`, `updateDeliveryStatus`: Update specific fields on an order.
- **Data Flow:** Typically, Application layer query/command handlers call repository functions, which then use the Prisma client.

### 1.5. Data Validation
- Input data for mutations and query filters are often validated using Zod schemas defined in DTOs (Data Transfer Objects) (e.g., `OrderStatusFieldDTO`). This is seen in repository function signatures and tRPC router inputs.

### 1.6. Migrations
- (Assumption: Standard Prisma migration workflow is used: `prisma migrate dev`). This should be confirmed if possible, but is standard practice.

## 2. Sanity Integration Workflow

### 2.1. Overview
Sanity.io is used as a headless CMS for managing content like product catalogs (though not explicitly seen in the dive, this is a common use), categories, banners, and other dynamic content displayed in the Admin Panel or intended for the Customer Website.

### 2.2. Sanity Clients (`src/server/infrastructure/clients/sanity.ts`)
- **`staticClient`:**
    - Configuration: Uses `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`, `useCdn: true`.
    - Purpose: For fetching data that benefits from CDN caching (e.g., public, frequently accessed content).
- **`dynamicClient`:**
    - Configuration: Same Project ID/Dataset, but includes `SANITY_TOKEN` and `useCdn: false`.
    - Purpose: For fetching fresh, non-cached data or performing authenticated operations like creating, updating, or deleting documents in Sanity.
- **`graphqlClient` (`src/server/infrastructure/clients/graphqlClient.ts`):**
    - Configuration: Uses Sanity's GraphQL endpoint (`https://<projectId>.api.sanity.io/v<apiVersion>/graphql/<dataset>/default`) and the `SANITY_TOKEN` for authorization.
    - Purpose: To query Sanity data using GraphQL, allowing for precise data fetching.

### 2.3. Data Interaction Patterns (Example: Banners)
- **Reading Data (e.g., `getBanners` in `banner-repository.ts`):**
    - Uses the `graphqlClient` to send GraphQL queries to Sanity.
    - Fetched data is validated against Zod DTOs (e.g., `GetBannerDTO`).
- **Writing Data (e.g., `createBanner`, `updateBanner` in `banner-repository.ts`):**
    - Uses the `dynamicClient`.
    - `createBanner`: Constructs a Sanity document (e.g., `{ _type: "banner", ... }`) and uses `dynamicClient.create()`.
    - `updateBanner`: Uses `dynamicClient.patch(_id).set({...}).commit()`.
- **Content Structure:** Documents in Sanity have a `_type` field (e.g., "banner"). Unique IDs (`_id`) are used, sometimes generated using libraries like `@paralleldrive/cuid2`.

### 2.4. Data Flow for Sanity-Managed Content
- tRPC routers (e.g., `adminBannerRouter`) define procedures.
- These procedures call query/command handlers in the application layer (`src/server/application/features/`).
- Application layer handlers then call repository functions (`src/server/infrastructure/repositories/`) which encapsulate the Sanity client interactions (GraphQL or dynamicClient).
- (Note: Some command handlers like for banner creation/update were not found, and the tRPC router in `banner.ts` appeared to call repository functions directly for mutations. This is a slight deviation from a strict CQRS pattern but the underlying Sanity client usage is clear.)

## 3. Authentication Flow (Clerk)

### 3.1. Overview
Authentication and user management for the Admin Panel are handled by Clerk. It provides mechanisms for protecting routes, managing user sessions, and UI components for sign-in and sign-up.

### 3.2. Middleware (`src/middleware.ts`)
- **Integration:** Uses `clerkMiddleware` from `@clerk/nextjs/server`.
- **Route Protection:**
    - `createRouteMatcher` is used to define protected routes (e.g., `'/'` - the admin dashboard/homepage).
    - For matched protected routes, `auth().protect()` is called, redirecting unauthenticated users to the sign-in page.
- **Scope:** The middleware is configured to run on most paths, including API and tRPC routes.

### 3.3. Clerk Provider (`src/app/layout.tsx`)
- The root layout wraps the entire application with `<ClerkProvider>`.
- This provider makes Clerk's authentication state and hooks (like `useAuth`, `useUser`) available throughout the component tree.

### 3.4. Sign-in & Sign-up Pages
- **Location:** `src/app/sign-in/[[...sign-in]]/page.tsx` and `src/app/sign-up/[[...sign-up]]/page.tsx`.
- **UI:** Utilize Clerk's pre-built UI components (`<SignIn />` and `<SignUp />`) for a streamlined authentication experience.
- **Routing:** The `[[...]]` catch-all route syntax is used by Clerk to handle various steps and callbacks in its authentication flows.

### 3.5. Accessing User Information & Session Management
- (Assumption: Clerk's hooks like `useUser()` or server-side helpers like `auth()` or `currentUser()` from `@clerk/nextjs/server` would be used within components or API/tRPC routes to access authenticated user details and manage sessions.)
- For instance, to get `userId` for database queries related to the logged-in admin, or to implement role-based access control if needed (though explicit role management wasn't detailed in the dive).

### 3.6. tRPC Context Integration (Potential)
- The tRPC context (`src/server/trpc/context.ts`) could be (or is planned to be) integrated with Clerk to provide authenticated user information directly to tRPC procedures, enabling protected procedures. (The `enhancement.md` mentioned plans for this).

This document provides a foundational understanding of the Admin Panel's backend systems. Further details can be explored by examining specific feature implementations.

## 4. Granular Roadmap for Admin System Enhancements

This roadmap outlines potential enhancements and refactoring tasks for the Admin Panel's backend systems. It builds upon the details documented above and suggestions from `Admin/enhancement.md`.

### Phase 1: Strengthening Core Data Layers & Type Safety

*   **Task 1.1: Comprehensive Prisma Schema Review & Refinement.**
    - **Description:** Conduct a thorough review of `prisma/schema.prisma`. Identify any potential areas for normalization, missing relations, or opportunities to enforce stricter data integrity with constraints.
    - **Benefit:** Improved database design, reduced data redundancy, enhanced data integrity.
*   **Task 1.2: Standardize Command Handler Pattern for Mutations.**
    - **Description:** Ensure all mutation operations (create, update, delete) across all features (Orders, Banners, Products, etc.) consistently use the Command Handler pattern (Application Layer -> Repository Layer). Refactor any direct repository calls from tRPC routers for mutations (e.g., observed in Banner mutations).
    - **Files to check/update:** tRPC routers, application layer command handlers (create if missing, like for Banners), repositories.
    - **Benefit:** Consistent architecture, better separation of concerns, easier testing and maintenance.
*   **Task 1.3: Full Adoption of Zod for Sanity Data Validation.**
    - **Description:** While already used (e.g., `GetBannerDTO`), ensure Zod DTOs are implemented and consistently applied for *all* data structures fetched from or sent to Sanity (including Products, Categories, etc., once those are fully analyzed).
    - **Benefit:** Robust type safety and data integrity for Sanity interactions.
*   **Task 1.4: Explore GraphQL Code Generator for Sanity Queries.**
    - **Description:** Investigate using tools like GraphQL Code Generator to automatically generate TypeScript types from Sanity's GraphQL schema and queries.
    - **Benefit:** Enhanced type safety for GraphQL operations, reduced manual type definition.

### Phase 2: Enhancing Admin Authentication & Authorization

*   **Task 2.1: Implement Role-Based Access Control (RBAC) with Clerk.**
    - **Description:** Define admin roles (e.g., SuperAdmin, ContentManager, OrderManager). Integrate Clerk's custom claims or organization roles to manage these. Protect specific tRPC procedures or UI sections based on user roles.
    - **Files to check/update:** Clerk initialization, tRPC context, tRPC procedures, potentially UI components.
    - **Benefit:** Granular control over admin functionalities, improved security.
*   **Task 2.2: Secure all tRPC Admin Procedures.**
    - **Description:** Modify all tRPC procedures in `Admin/src/server/trpc/routers/admin/` (and any new ones) to be protected procedures, requiring authentication. Update the tRPC context (`src/server/trpc/context.ts`) to correctly pass down authenticated user information from Clerk.
    - **Benefit:** Ensures all admin API endpoints are secure by default.
*   **Task 2.3: Audit and Enhance Session Management.**
    - **Description:** Review Clerk's session management settings (lifetimes, revocation) to ensure they align with security best practices for an admin panel.
    - **Benefit:** Hardened security against session-related vulnerabilities.

### Phase 3: Optimizing Sanity Integration & Content Workflows

*   **Task 3.1: Centralized Sanity Schema Definitions.**
    - **Description:** If not already fully centralized, ensure all Sanity schema definitions (for products, categories, banners, etc.) are clearly defined and managed within the `Sanity-Studio` project. Document the source of truth for these schemas.
    - **Benefit:** Easier maintenance and understanding of Sanity content models.
*   **Task 3.2: Investigate Sanity Webhooks for Cache Invalidation/Data Sync.**
    - **Description:** Explore using Sanity webhooks to trigger cache invalidation in the Admin panel (or even the Customer site) when content is updated. For example, if a banner is updated in Sanity, a webhook could trigger a re-fetch or cache clear for banner data.
    - **Benefit:** Ensures data consistency and freshness with less manual intervention.
*   **Task 3.3: Streamline Product Management Workflow (Prisma <> Sanity).**
    - **Description:** (Requires deeper analysis of Product feature) Analyze how product data is managed if it involves both Prisma (e.g., for inventory, pricing variants tied to orders) and Sanity (e.g., for marketing descriptions, images). Define a clear workflow and data synchronization strategy if needed. For instance, core product definition in Sanity, with operational data like stock in Prisma.
    - **Benefit:** Efficient and clear product data management.

### Phase 4: Advanced Backend Operations & Monitoring

*   **Task 4.1: Implement Comprehensive Logging for Admin Actions.**
    - **Description:** Integrate a logging library (e.g., Pino, Winston) to log important admin actions (e.g., order status changes, product updates, user permission changes) for audit and debugging purposes.
    - **Benefit:** Improved traceability, easier debugging, security auditing.
*   **Task 4.2: Setup Basic Health Checks for Backend Services.**
    - **Description:** Create simple health check endpoints for the Admin backend (e.g., checking DB connectivity, Sanity connectivity).
    - **Benefit:** Easier monitoring and early detection of issues.
*   **Task 4.3: Review and Optimize Database Queries.**
    - **Description:** Periodically review complex Prisma queries for performance. Use `prisma.$on('query', ...)` or other tools to identify slow queries and optimize them (e.g., adding indexes, refactoring query logic).
    - **Benefit:** Improved Admin panel performance and responsiveness.

This roadmap is a living document and should be revisited and updated as the Admin Panel evolves.
