# Admin Panel Documentation

## 1. Overview

The Admin Panel is a core component of the E-Commerce Platform, designed for administrators to manage all aspects of the online store. This includes product catalog management, inventory control, order processing, customer data management, and configuration of store settings. It is built to be a secure and efficient interface for all backend operations.

## 2. Key Features

*   **Product Management:** Create, update, delete products, including details like pricing, descriptions, images, and variants.
*   **Category Management:** Organize products into categories and subcategories.
*   **Inventory Management:** Track stock levels for products and variants. (Details to be expanded if UI/features exist)
*   **Order Management:** View incoming orders, update order statuses (e.g., processing, shipped, delivered, cancelled), and manage returns or refunds.
*   **Customer Management:** View customer information and order history. (Details to be expanded)
*   **Content Management:** Manage dynamic content like promotional banners, featured product selections, and potentially blog posts or informational pages via the integrated Sanity Studio.
*   **User Roles & Permissions:** (If applicable, typically managed by Clerk or similar auth system) Secure access based on administrator roles.

## 3. Technology Stack (Admin Panel)

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **UI Components:** ShadCN UI (or specify if different for Admin)
*   **API Communication:**
    *   **tRPC:** For type-safe client-server communication for internal data APIs.
    *   **Next.js Server Actions:** For handling form mutations and data operations directly from server/client components.
*   **Authentication:** Clerk Auth for secure administrator access and management.
*   **Content Management Interface:** Sanity Studio (details in [Sanity Studio README](../Sanity-Studio/README.md))
*   **Database ORM:** Prisma with Supabase PostgreSQL (for data not managed directly in Sanity, e.g., orders, customer accounts specific data).

## 4. Architecture (Admin Panel)

The Admin Panel is designed with a focus on maintainability and type safety.

*   **API Layer:**
    *   **tRPC:** Actively used and being expanded for most internal client-server communication, providing end-to-end type-safe APIs. Implemented for features like Banner, Color, and Size management, and dashboard data retrieval.
    *   **Next.js Server Actions:** Utilized for handling form mutations (e.g., Category management) to simplify data submission flows.
    *   For more details on API strategies, see [Admin Panel Enhancements](./enhancement.md#admin-panel-enhancements).
*   **Data Management:**
    *   **Sanity CMS:** Serves as the master datastore for the product catalog (products, variants, media) and related content (categories, banners, etc.). The Admin Panel provides the interface to manage this data, which is then written to Sanity.
    *   **Supabase (PostgreSQL via Prisma):** Used for managing operational data such as orders, customer information (beyond what Clerk manages), and potentially admin-specific configurations.
*   **Adherence to System Patterns:** The Admin Panel implements and benefits from the overall system architecture patterns like CQRS, DTOs, and a Layered Architecture where appropriate for its backend operations and data handling.

## 5. Setup and Running the Admin Panel

Refer to the main project [Getting Started section in the root README.md](../README.md#getting-started) for initial setup instructions for the entire monorepo.

Specific setup for the Admin Panel:

1.  **Navigate to Admin directory:** `cd Admin`
2.  **Install dependencies:** `npm install` (or `pnpm install`, `yarn install` as appropriate for the project)
3.  **Environment Variables:**
    *   Copy the `.env.example` file to `.env` (`cp .env.example .env`).
    *   Fill in the required environment variables. These will include:
        *   Clerk credentials (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
        *   Sanity project details (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`)
        *   Supabase/Prisma database URL (`DATABASE_URL`)
        *   Other relevant API keys or configurations.
4.  **Run Prisma commands (if applicable for initial setup):**
    *   `npx prisma generate` (often run automatically post-install)
    *   `npx prisma db push` or `npx prisma migrate dev` (for schema synchronization)
5.  **Run the development server:** `npm run dev`
6.  Access the Admin Panel at `http://localhost:3000` (or the configured port).

## 6. Deployment

(Details about deploying the Admin Panel specifically. This might involve Vercel, Docker, or other platform-specific instructions. To be added.)

## 7. Future Enhancements (Admin Panel)

The following are planned improvements specifically for the Admin Panel:

*   **Standardize Sanity Data Reads:** Complete the migration of all Sanity read operations to use its GraphQL API for a consistent data-fetching approach.
*   **Expand tRPC Adoption:** Continue refactoring remaining internal REST-like API routes to tRPC for all Supabase/PostgreSQL database interactions.
*   **Full Leverage of Server Actions:** Broaden the refactoring of mutation flows to Next.js Server Actions to further reduce boilerplate and streamline data flow.
*   **Enhanced Analytics Dashboard:** Develop a more comprehensive internal analytics dashboard for monitoring sales, product performance, and user activity from an administrative perspective.
*   (Add other admin-specific planned features if any)

---
*This README focuses on the Admin Panel. For details on the Customer Website, see [Customer README](../Customer/README.md). For overall project structure, see the [main README](../README.md).*
