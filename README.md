🛒 **E-Commerce Admin Panel** 🛍️  
🏢 **System Architecture (Current)** 🛠️

---

The **E-Commerce Admin Panel** is a headless administration interface built with **Next.js 14 (App Router)** and **TypeScript**. It is focused entirely on **back-office management** of catalog and transactional data, not on customer-facing storefront features.

The admin app integrates three main backend pillars:

- **Sanity (Headless CMS)** for catalog and content (products, categories, banners, grid items, etc.).
- **PostgreSQL + Prisma** for transactional and account data (orders, carts, users, sessions, etc.).
- **Cloudflare R2** for media storage, accessed through the **AWS S3 SDK**.

Modern Next.js features (**Server Actions**, **Route Handlers**, and **tRPC**) are used to implement type-safe data flows, form mutations, and REST-style APIs. **Clerk** secures the admin surface via middleware-based authentication.

---

### 📚 **Table of Contents** 📚

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [System Design](#system-design)
4. [Development Methodology](#development-methodology)
5. [System Attributes](#system-attributes)
6. [System Review and Future Improvements](#system-review-and-future-improvements)

---

### 🧰 **Technology Stack** 🧰

**Framework & Language**

- **Next.js 14** (App Router, `app/` directory)
- **React** (Server Components + Client Components)
- **TypeScript**

**UI & Styling**

- **Tailwind CSS**
- **Radix UI / shadcn/ui** (headless UI primitives and components)

**Backend & Data**

- **Prisma** ORM
- **PostgreSQL** (transactional database)
- **Sanity** (Headless CMS for catalog/content)

**APIs & Integration**

- **tRPC** for type-safe internal APIs (e.g., admin dashboard stats, attribute queries)
- **Next.js Route Handlers** (`app/api/.../route.ts`) for REST-style endpoints
- **Next.js Server Actions** for form-driven mutations (Create/Update/Delete)

**Auth & Identity**

- **Clerk** for authentication and authorization on the admin side

**Storage & Delivery**

- **Cloudflare R2** for media/asset storage via **AWS S3 SDK**
- **Sanity CDN** for delivery of Sanity-hosted images and static content

---

### 🔧 **System Design** 🔧

The Admin Panel is organized into clear, focused components that manage different parts of the e-commerce backend:

- **Admin UI (Next.js 14)**
- **Content Management (Sanity)**
- **Transactional Database (PostgreSQL + Prisma)**
- **Identity Service (Clerk)**
- **Media Storage (Cloudflare R2, Sanity CDN)**

It uses Next.js App Router with a mix of **Server Components**, **Client Components**, **Server Actions**, **tRPC**, and **Route Handlers** to handle reads and writes in a predictable, type-safe way.

---

#### **Visual System Overview (Diagram Descriptions)**

For a visual understanding of the system, textual descriptions that can be rendered as diagrams (e.g. Mermaid.js) are available:

- **[System Diagram Descriptions](./docs/diagrams.md)**

These describe:

- High-level architecture of the Admin Panel
- Conceptual data model across Sanity and PostgreSQL
- Interactions between UI, content, transactional data, and storage

---

### 🧩 **Core Components**

1. **Admin System** (Next.js 14 App Router)
2. **Content Management** (Sanity CMS)
3. **Transactional Database** (PostgreSQL + Prisma)
4. **Identity Service** (Clerk)
5. **Media Storage** (Cloudflare R2, Sanity CDN)

> ⚠️ There is **no customer-facing frontend** in this repository. The scope is strictly the admin/back-office interface.

---

#### **Admin System**

The **Admin System** provides tools for managing:

- Products and product variants
- Categories and subcategories
- Banners and grid items
- Attributes (colors, sizes, etc.)
- Orders and other transactional entities (where implemented)

Key characteristics:

- Built with **Next.js 14 App Router** and **TypeScript**
- Uses **Server Actions** for typical admin mutations:
  - Create / update / delete categories, subcategories, banners, grid items, colors, sizes, etc.
- Uses **tRPC** for type-safe admin queries, such as:
  - Dashboard statistics
  - Summary metrics and attribute lists
- Uses **Route Handlers** for REST-style APIs when an HTTP endpoint contract is preferred

---

### 🗂 **Content Management – Sanity (Headless CMS)**

**Sanity** is the **source of truth** for catalog/content data:

- Products / “cloths” and variants
- Categories and subcategories
- Banners and grid items
- Content metadata and image references

The Admin Panel reads and writes this data through Sanity’s APIs:

- **Dynamic Client (non-CDN) access**  
  Used for managing dynamic entities where up-to-date content is required:
  - **category**
  - **subcategory**
  - **banner**
  - **color**
  - **grid-item**
  - **size**

- **Sanity CDN**  
  Used for delivering images and static assets (e.g., product images) with low latency.

When convenient, Sanity’s **GraphQL API** is used for structured read operations and standardized queries. Other reads use the Sanity client directly; over time, more reads can be unified under one approach.

---

### 🗄 **Backend – PostgreSQL & Prisma**

Transactional data is stored in **PostgreSQL** and accessed via **Prisma**. Typical models include:

- `Order`
- `Delivery`
- `Pickup`
- `User`
- `Account`
- `Session`
- `VerificationToken`
- `Address`
- `Cart`
- `CartItem` (or equivalent)

Prisma provides:

- Type-safe database access
- Centralized schema definition
- Migrations and consistent query patterns

This layer handles **operational data** (orders, carts, users, etc.) and complements Sanity, which focuses on catalog/content.

---

### 🔐 **Identity Service – Clerk**

**Clerk** manages authentication and authorization for the Admin Panel:

- Middleware in the App Router is used to protect admin routes.
- Only authenticated users can access admin pages and APIs.
- Clerk sessions are surfaced where needed in server logic for secure mutations and reads.

This ensures that product, order, and content management is restricted to authorized users.

---

### 🌐 **Media Storage & Delivery**

#### **Cloudflare R2 (via AWS S3 SDK)**

- Used to store binary assets such as product images and other media.
- Accessed via the **AWS S3 SDK**, giving a familiar S3-style programming model.
- Decouples file storage from the application runtime.

#### **Sanity CDN**

- Sanity’s image/CDN layer is used to deliver images referenced in Sanity documents.
- Provides:
  - Edge caching
  - Optimized image URLs and transformations (where configured)

---

### 🧱 **Architecture Patterns**

The Admin Panel follows well-known patterns to keep the codebase maintainable and scalable.

#### **CQRS (Command Query Responsibility Segregation)**

- **Commands** (write operations) are implemented via:
  - Server Actions
  - Command handlers that talk to repositories (Sanity, PostgreSQL, Cloudflare R2)
- **Queries** (read operations) are implemented via:
  - tRPC procedures
  - Sanity clients / GraphQL
  - Prisma queries

Separating reads and writes makes it easier to evolve each side independently.

#### **DTO (Data Transfer Object)**

- Lightweight DTOs are used when shaping data between layers:
  - Sanity/Prisma responses → Admin UI
  - Command inputs → repositories
- DTOs help avoid leaking internal data models directly into the UI.

#### **Repository Pattern**

- Data access is encapsulated behind repository interfaces:
  - Sanity repositories
  - Prisma/PostgreSQL repositories
  - Asset storage repositories (Cloudflare R2)
- This allows:
  - Easier unit testing
  - Safe refactoring of persistence details
  - A clear boundary between application logic and data access

#### **Layered Architecture**

The Admin Panel uses a layered architecture:

- **Frontend Layer**
  - Next.js 14 App Router, React, Tailwind, shadcn/ui
  - Renders pages, tables, and forms
  - Uses Client Components where interactivity is required

- **Application / Business Logic Layer**
  - Command and Query handlers
  - Implements operations such as:
    - Category / subcategory / banner / grid item management
    - Attribute management (color, size)
    - Order workflows (when present)
  - Coordinates between UI and repositories

- **Data Access Layer**
  - Concrete repositories for:
    - Sanity (content)
    - Prisma/PostgreSQL (transactions)
    - Cloudflare R2 (assets)

- **Data Storage Layer**
  - Sanity datasets for content
  - PostgreSQL tables for transactional data
  - R2 buckets for media files

#### **Headless CMS Pattern**

- **Sanity** is used as a **Headless CMS**:
  - Content is created and managed independently of the frontend.
  - The Admin Panel consumes this content over APIs.
- This pattern supports:
  - Multi-channel usage (e.g., if a future storefront or mobile app consumes the same catalog)
  - Independent evolution of content and admin UI

---

### 🔌 **Modern API Patterns (Admin Panel)**

The Admin Panel uses several Next.js-native patterns:

- **tRPC**
  - Provides type-safe APIs for internal admin use cases.
  - Particularly useful for dashboard data and structured admin queries.

- **Next.js Server Actions**
  - Used for form submissions and mutations (e.g., creating/updating/deleting categories, subcategories, banners, grid items, colors, sizes).
  - Keep mutation logic on the server without extra client-side API boilerplate.

- **Next.js Route Handlers**
  - Implement REST-style APIs under `app/api/...`.
  - Used where an HTTP endpoint contract is preferred or external integration is expected.

For deeper discussion of these patterns and examples, see:

- **[API Strategies and Design Patterns](./enhancement.md#3-api-strategies-and-design-patterns)**

---

### 🔨 **Development Methodology** 🔨

This section will be expanded over time.  
At present, development focuses on:

- Incremental improvements to the Admin Panel (new entities, flows, cleanups)
- Refactoring toward consistent usage of:
  - tRPC for reads
  - Server Actions for writes
  - Repository and CQRS patterns across all features
- Tracking improvement ideas and architecture notes in `enhancement.md`

---

### 📈 **System Attributes** 📈

#### **Reliability**

- Uses **Next.js App Router** and Server Actions to reduce client-side failure surface for critical admin operations.
- Sanity, PostgreSQL, and R2 are independent services, enabling clear responsibility boundaries.

#### **Availability**

- Headless integration with **Sanity** and **PostgreSQL** allows each service to be scaled and operated independently.
- Media delivery is offloaded to **Sanity CDN** and **Cloudflare R2**, keeping the admin runtime focused on logic, not file serving.

#### **Security**

- **Clerk** provides authentication and authorization on the admin side.
- Middleware-protected routes ensure that only authenticated users can access management screens and APIs.

---

### 🔍 **System Review and Future Improvements** 🔍

This section summarizes possible improvements for the Admin Panel. For details, see `enhancement.md`.

#### **1. Modernizing API and Data Handling**

- **Standardize Sanity Reads**  
  Some reads use Sanity client directly; others may use GraphQL. Over time, converge on a consistent pattern (all client or all GraphQL) to simplify maintenance.

- **Extend tRPC Coverage**  
  tRPC is already used for selected features (e.g., dashboard stats). It can be extended to more admin queries to leverage end-to-end type safety.

- **Broaden Server Actions Usage**  
  Continue moving mutation flows (especially CRUD on less-mature modules) onto Server Actions to reduce API boilerplate and keep logic server-side.

#### **2. Existing Planned Improvements (Admin-Focused)**

- **Richer Admin Dashboards**  
  More detailed metrics and operational views (orders, conversions, catalog health).

- **Bulk Operations**  
  Support for bulk edits (e.g., mass updates of categories, attributes, banners).

- **Stronger Validation & Error Handling**  
  Use schema validators (e.g., Zod) consistently across all forms and handlers to improve robustness.

- **Test Coverage**  
  Add unit and integration tests around repositories, command/query handlers, and critical Route Handlers/Server Actions.

---

### 🚀 **Deployment to Vercel (GitHub Actions)** 🚀

The deployment process is automated using GitHub Actions. Pushing code to the `deploy` branch triggers a workflow that builds and deploys the application to Vercel.

#### **GitHub Action Workflow**

- **File**: `.github/workflows/deploy-vercel.yml`
- **Trigger**: Push to `deploy` branch
- **Steps**:
  1. **Install**: Installs dependencies (with legacy peer deps handling).
  2. **Build**: Runs `npm run build` to generate the production build.
  3. **Deploy**: Uses the Vercel CLI to deploy to production.

#### **Required Environment Variables**

These environment variables must be configured in **Vercel Project → Settings → Environment Variables**. Do **not** commit these values to the repository.

**Database (PostgreSQL via Prisma)**
- `DATABASE_URL`: Connection string for the Prisma database.
- `DIRECT_URL`: Direct connection string for database migrations/access.

**Sanity (Headless CMS)**
- `NEXT_PUBLIC_SANITY_DATASET`: The dataset name (e.g., `production`).
- `NEXT_PUBLIC_SANITY_PROJECT_ID`: The unique project ID for Sanity.
- `SANITY_TOKEN`: API token for authenticated requests to Sanity.

**Cloudflare R2 (Storage)**
- `CLOUDFLARE_ACCESS_KEY_ID`: Access key for R2 authentication.
- `CLOUDFLARE_SECRET_ACCESS_KEY`: Secret key for R2 authentication.
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account identifier.
- `CLOUDFLARE_BUCKET_NAME`: Name of the storage bucket.
- `CLOUDFLARE_PUBLIC_DOMAIN`: Public domain URL for accessing stored assets.

**Clerk (Authentication)**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Public key for Clerk client-side usage.
- `CLERK_SECRET_KEY`: Secret key for Clerk server-side usage.
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: URL path for sign-in page.
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: URL path for sign-up page.
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: Redirect URL after successful sign-in.
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: Redirect URL after successful sign-up.

#### **Setup Steps**

1. **Connect Vercel Project**: Link your GitHub repository to a new Vercel project.
2. **Configure Secrets in GitHub**:
   Add the following secrets in **GitHub Repo Settings → Secrets and variables → Actions**:
   - `VERCEL_TOKEN`: Your Vercel account token.
   - `VERCEL_ORG_ID`: The Vercel Organization ID (found in `.vercel/project.json` or Vercel settings).
   - `VERCEL_PROJECT_ID`: The Vercel Project ID.
3. **Configure Environment Variables in Vercel**: Add all the variables listed above in the Vercel dashboard.
4. **Deploy**: Push changes to the `deploy` branch to trigger the pipeline.

   ```bash
   git checkout -b deploy
   git push origin deploy
   ```

> **Note on Environments**:
> - **Local Development**: Use a `.env` (or `.env.local`) file with the same variable names and run `npm run dev`.
> - **Production**: Variables are managed via Vercel, and deployment is handled via GitHub Actions.

---
