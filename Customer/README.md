# Customer Website Documentation

## 1. Overview

The Customer Website is the public-facing e-commerce store for the platform. It allows users to browse products, discover new items through categories and search, manage their shopping cart, complete purchases, and manage their user accounts (profiles, addresses, order history). It is built with a focus on user experience, performance, and SEO.

## 2. Key Features

*   **Product Discovery:**
    *   Homepage with featured products and categories.
    *   Dynamic category and subcategory pages.
    *   Product detail pages with image galleries, descriptions, pricing, and variant information.
    *   Basic product search functionality.
*   **Shopping Cart:**
    *   Client-side cart management (add, update quantity, remove items).
    *   Cart persistence in localStorage for guests and synchronized to database for logged-in users.
*   **Checkout Process:**
    *   Multi-step checkout (Shipping Address, Shipping Method (placeholder), Payment, Review).
    *   Currently supports Cash on Delivery (COD).
    *   Order confirmation page.
*   **User Account Management:**
    *   Custom user authentication (Email/Password and Google OAuth2).
    *   Profile management (view/edit basic profile).
    *   Address book (add, edit, delete, set primary shipping address).
    *   Order history (paginated list and detailed view of past orders).
*   **SEO:**
    *   Dynamic page metadata (titles, descriptions, Open Graph tags) for products and categories.
    *   Dynamic sitemap (`sitemap.xml`) and `robots.txt`.
    *   JSON-LD structured data for products, breadcrumbs, organization, and website search.

## 3. Technology Stack (Customer Website)

*   **Framework:** Next.js 13 (App Router)
*   **Language:** TypeScript
*   **UI Components:** ShadCN UI, Tailwind CSS
*   **State Management (Client-side):** Zustand (primarily for shopping cart)
*   **Data Fetching (from Sanity CMS):** GraphQL via Sanity's API
*   **API Routes:** Next.js API Route Handlers (for custom backend logic)
*   **Database ORM:** Prisma with Supabase PostgreSQL

## 4. Architecture (Customer Website)

The Customer Website utilizes a modern frontend architecture with a supporting backend for its specific functionalities.

*   **Frontend Architecture:**
    *   Built with Next.js 13 leveraging the App Router for routing and layouts.
    *   Utilizes React Server Components (RSC) for server-rendered content and Client Components for interactivity.
*   **Backend for Frontend (BFF):**
    *   Custom API routes are implemented within `Customer/src/app/api/` to handle operations like user authentication, account management (addresses, orders), cart synchronization, and order creation. These routes interact directly with the Prisma ORM.
*   **Authentication:**
    *   A custom JWT-based authentication system is implemented using Next.js API Route Handlers and Prisma.
    *   Supports email/password registration & login, and Google OAuth2 social login.
    *   Manages user data via Prisma models: `User` (profile), `Account` (credentials, provider type), `Session` (active logins, refresh tokens).
    *   Employs secure HTTPOnly cookies for session and refresh tokens, with refresh token rotation.
    *   (Further details on authentication flow can be found in `Customer/docs/Authentication.md` - if this doc exists or is planned)
*   **Content Delivery:**
    *   **Sanity CMS:** Product catalog (products, variants, images, descriptions), categories, and promotional banners are sourced from Sanity CMS via GraphQL queries. The Sanity client configuration is in `Customer/src/lib/sanity/client.ts`.
    *   **Sanity CDN:** Used for optimizing delivery of static content from Sanity (e.g., product images).
    *   **Cloudflare:** May be used in front of the Next.js application for general CDN benefits, caching, and security.
*   **Database Interaction:**
    *   User-specific data such as profiles (extending auth user), shipping addresses, shopping carts (for logged-in users), and order history are stored in Supabase (PostgreSQL) and accessed via Prisma ORM through the BFF API routes.
*   **Adherence to System Patterns:** The Customer Website's backend logic (API routes) follows patterns like Repository Pattern for data access and uses DTOs (implicitly via Zod schemas for validation) where appropriate. The overall application structure aligns with a Layered Architecture.

## 5. Setup and Running the Customer Website

Refer to the main project [Getting Started section in the root README.md](../README.md#getting-started) for initial setup instructions for the entire monorepo.

Specific setup for the Customer Website:

1.  **Navigate to Customer directory:** `cd Customer`
2.  **Install dependencies:** `npm install` (or `pnpm install`, `yarn install` as appropriate)
3.  **Environment Variables:**
    *   Copy the `.env.example` file to `.env` (`cp .env.example .env`).
    *   Fill in the required environment variables. These will include:
        *   Sanity project details (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`).
        *   Supabase/Prisma database URL (`DATABASE_URL`).
        *   Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
        *   JWT secret (`JWT_SECRET`).
        *   Public application URL (`NEXT_PUBLIC_APP_URL`).
4.  **Run Prisma commands (if applicable for initial setup):**
    *   `npx prisma generate`
    *   `npx prisma db push` or `npx prisma migrate dev`
5.  **Run the development server:** `npm run dev`
6.  Access the Customer Website at `http://localhost:3001` (or the configured port, often different from Admin).

## 6. Deployment

(Details about deploying the Customer Website. This might involve Vercel, Docker, or other platform-specific instructions. To be added.)

## 7. SEO Strategy Overview

The Customer Website implements several SEO best practices:

*   **Dynamic Metadata:** Uses Next.js `generateMetadata` function for product and category pages to provide unique titles, descriptions, and Open Graph tags sourced from Sanity.
*   **Structured Data:** Implements JSON-LD for `Product`, `BreadcrumbList`, `Organization`, and `WebSite` to enhance search engine understanding.
*   **Sitemaps:** Dynamically generates `sitemap.xml` via `Customer/src/app/sitemap.ts`, including static pages, active products, and categories.
*   **`robots.txt`:** Configured via `Customer/src/app/robots.ts`.
*   **Rendering:** Employs Server-Side Rendering (SSR) and Static Site Generation (SSG) where appropriate for optimal crawlability and performance.

## 8. Future Enhancements (Customer Website)

Refer to the [Customer Implementation Plan](./customer-plan.md) for a detailed roadmap. Key planned improvements include:

*   **Improved Customer Dashboard:** More comprehensive interface for order tracking, wishlists, and personalized recommendations.
*   **Optimized User Experience:** Potential AI/ML capabilities for tailored product recommendations.
*   **Payment Gateway Integrations:** Support for Stripe, Razorpay, etc.
*   **Enhanced Analytics:** Integration of analytics tools for customer behavior tracking.
*   **Mobile App:** Development of iOS and Android applications.

---
*This README focuses on the Customer Website. For details on the Admin Panel, see [Admin README](../Admin/README.md). For overall project structure, see the [main README](../README.md).*
