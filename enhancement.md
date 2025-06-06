# Enhancements and Modernization Plan

This document provides a detailed breakdown of suggested enhancements for the e-commerce platform, based on the code analysis performed. These suggestions aim to leverage modern web technologies, improve developer experience, and optimize performance and maintainability.

## 1. API and Data Handling Modernization

### 1.1. Standardize Sanity Data Reads with GraphQL

*   **Current State:**
    *   Product data (cloths) is read from Sanity using direct Sanity client calls with GROQ queries (e.g., in `src/lib/api/cloth.ts`).
    *   Category data is read from Sanity using its GraphQL API via a `graphqlClient` (in `src/server/infrastructure/repositories/group/category-repository.ts`).
*   **Proposed Enhancement:**
    *   Transition all Sanity read operations (primarily for products/cloths, but also for other content types like banners if not already using GraphQL) to utilize Sanity's GraphQL API.
*   **Benefits:**
    *   **Consistency:** A unified data fetching methodology for all Sanity content.
    *   **Precision:** GraphQL allows clients to request only the data they need, potentially reducing over-fetching.
    *   **Strong Typing:** Leverages GraphQL schemas for better type safety, complementing tools like `graphql-codegen` if desired.
*   **Implementation Steps (High-Level):**
    1.  Identify all direct Sanity client `fetch()` calls using GROQ for read operations (e.g., in `src/lib/api/cloth.ts`).
    2.  Translate these GROQ queries into their GraphQL equivalents.
    3.  Update the data fetching functions to use the existing `graphqlClient` (`src/server/infrastructure/clients/graphqlClient.ts`) or a similar client-side accessible GraphQL client.
    4.  Ensure Zod schemas are updated or confirmed to parse the GraphQL responses correctly.
*   **Considerations:**
    *   Some complex GROQ queries might require careful translation to GraphQL.
    *   Evaluate if Sanity's GraphQL API has any rate limits or query complexity limits that might affect very data-intensive pages.

### 1.2. Adopt tRPC for Internal Type-Safe APIs

*   **Current State:**
    *   Internal API communication (client components to Next.js backend, especially for admin panel operations) relies on Next.js API Route Handlers, functioning like REST endpoints (e.g., `POST /api/product`, `GET /api/banners`).
    *   Client-side calls are made using `ky` via helper functions (e.g., in `src/lib/api/banner.ts`).
*   **Proposed Enhancement:**
    *   Introduce tRPC to manage the internal API layer. This involves creating tRPC routers and procedures on the server that wrap existing command/query handlers or new business logic.
*   **Benefits:**
    *   **End-to-End Type Safety:** Automatic type inference from server to client, eliminating mismatches and improving code reliability.
    *   **Improved Developer Experience:** Simplified data fetching on the client, with autocompletion and type checking for API calls.
    *   **Reduced Boilerplate:** Less manual setup for API routes, request/response handling, and error parsing compared to traditional REST.
    *   **Seamless Integration with React Query:** `@trpc/react-query` provides excellent hooks.
*   **Implementation Steps (High-Level):**
    1.  Install tRPC packages (`@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@trpc/next`).
    2.  Define a main tRPC router (`src/server/trpc/root.ts`) and individual feature routers (e.g., `src/server/trpc/routers/bannerRouter.ts`).
    3.  In these routers, create procedures (queries for reads, mutations for writes) that call the existing application command/query handlers (e.g., `getBannersQueryHandler`, `createBannerCommandHandler`).
    4.  Expose the main tRPC router via a single Next.js API route (e.g., `src/app/api/trpc/[trpc]/route.ts`).
    5.  On the client-side, configure the tRPC client and use `@trpc/react-query` hooks (e.g., `trpc.banner.getAll.useQuery()`, `trpc.banner.create.useMutation()`) to interact with the backend, replacing direct `ky` calls.
*   **Considerations:**
    *   Start with new features or by refactoring a few existing API interactions to tRPC.
    *   This is primarily for internal client-server communication within the Next.js app.

### 1.3. Leverage Next.js Server Actions for Mutations

*   **Current State:**
    *   Data mutations (e.g., creating/updating products, categories from the admin panel) are typically handled by client-side form submissions that call API routes, which then invoke command handlers.
*   **Proposed Enhancement:**
    *   Refactor these mutation flows to use Next.js Server Actions. Server Actions allow server-side code to be called directly from client components (e.g., via the `action` prop on `<form>`).
*   **Benefits:**
    *   **Simplified Data Flow:** Reduces the need for explicit API route handlers for mutations.
    *   **Colocation:** Server Action logic can be defined closer to where it's used, even within client components (though it runs on the server).
    *   **Progressive Enhancement for Forms:** Forms can work even if client-side JavaScript fails (though less critical for admin panels).
    *   **Integrated with Next.js Features:** Works well with `revalidatePath`, `revalidateTag`, and `useOptimistic`.
*   **Implementation Steps (High-Level):**
    1.  Identify forms and mutation-triggering UI elements (e.g., delete buttons) in the admin panel.
    2.  Create Server Action functions (marked with `"use server"`). These functions will typically:
        *   Receive form data or arguments.
        *   Validate the input (e.g., using existing DTOs).
        *   Call the appropriate application command handler (e.g., `createProductCommandHandler`).
        *   Call `revalidatePath` or `revalidateTag` to update cached data.
        *   Return a response (e.g., success message or error details).
    3.  Attach these Server Actions to `<form action={myServerAction}>` or call them from event handlers in client components.
*   **Considerations:**
    *   Ensure proper validation and error handling within Server Actions.
    *   Server Actions are best suited for mutations, not for data queries (GET requests).

## 2. Enhancing SEO for Customer-Facing System

### 2.1. Dynamic Page Metadata & Optimal Rendering

*   **Current State:**
    *   SEO metadata (title, description) is stored in Sanity for products and categories.
    *   The root layout provides generic metadata for the admin panel.
    *   Customer-facing pages are not yet implemented or lack dynamic SEO metadata.
*   **Proposed Enhancement:**
    *   For all customer-facing page types (e.g., product detail pages, category listing pages):
        1.  Utilize appropriate Next.js rendering strategies:
            *   **SSR (Server-Side Rendering):** For content that must be fresh on every request and fully indexed.
            *   **SSG (Static Site Generation):** For content that changes infrequently, offering maximum speed.
            *   **ISR (Incremental Static Regeneration):** A balance, serving static content that auto-updates periodically. Ideal for many e-commerce scenarios.
        2.  Implement the `generateMetadata` async function in page components. This function will run server-side to fetch the corresponding SEO data (title, description, Open Graph details) from Sanity based on the page's slug or ID.
*   **Benefits:**
    *   **Improved Search Engine Visibility:** Ensures search engines can easily crawl and index page content and relevant metadata.
    *   **Better User Experience:** Accurate titles and descriptions in search results and social shares.
*   **Implementation Steps (High-Level):**
    1.  For each customer-facing page route (e.g., `src/app/products/[slug]/page.tsx`):
        *   Decide on the rendering strategy (SSR, SSG with `generateStaticParams`, or ISR with `revalidate` option).
        *   Create data fetching functions (if not already existing) to get SEO data from Sanity for a given slug/ID.
        *   Implement `export async function generateMetadata({ params }, parent) { ... }` to fetch this data and return a Next.js `Metadata` object.
        *   Ensure the main page component also fetches and displays the page content.
*   **Considerations:**
    *   Avoid CSR for primary content on SEO-critical pages.

### 2.2. Advanced SEO with `next-seo` Library

*   **Current State:** No evidence of advanced SEO features like JSON-LD.
*   **Proposed Enhancement:**
    *   While Next.js's built-in `generateMetadata` is good for common tags, consider integrating the `next-seo` library if you require:
        *   **JSON-LD Structured Data:** For rich snippets (e.g., product schema, breadcrumbs, FAQ schema).
        *   More fine-grained control over Open Graph and Twitter card tags.
        *   Easier management of complex SEO configurations.
*   **Benefits:**
    *   **Richer Search Results:** JSON-LD can lead to more attractive and informative listings in search results.
    *   **Simplified Management:** `next-seo` provides a component-based approach that can be easier for complex scenarios.
*   **Implementation Steps (High-Level):**
    1.  Install `next-seo`.
    2.  In page components, after fetching data (including SEO fields from Sanity), use the `<NextSeo />` component to set various SEO properties.
    3.  This can be used alongside `generateMetadata` (e.g., `generateMetadata` for core title/description, `NextSeo` for JSON-LD and specific Open Graph overrides).
*   **Considerations:**
    *   Start with Next.js built-ins and introduce `next-seo` if specific advanced needs arise.

### 2.3. Sitemaps and `robots.txt`

*   **Current State:** No evidence of `sitemap.xml` or custom `robots.txt`.
*   **Proposed Enhancement:**
    1.  **`robots.txt`:** Create a `public/robots.txt` file to instruct search engine crawlers (e.g., allow product/category paths, disallow admin/cart paths).
    2.  **Sitemap (`sitemap.xml`):** Implement dynamic sitemap generation using Next.js's `src/app/sitemap.ts` file. This function should:
        *   Fetch all publishable product slugs, category slugs, and other public page routes from Sanity.
        *   Construct the sitemap with URLs, last modification dates, and change frequencies.
*   **Benefits:**
    *   **Improved Crawlability:** Helps search engines discover all important pages on the site.
    *   **Efficient Indexing:** Provides hints about page importance and update frequency.
*   **Implementation Steps (High-Level):**
    1.  Create `public/robots.txt`.
    2.  Create `src/app/sitemap.ts`. Inside, write an async function that fetches necessary route data from Sanity and returns an array of sitemap entries.
*   **Considerations:**
    *   Ensure the sitemap is updated when new products/categories are published (ISR for the sitemap or regeneration on build).
```
