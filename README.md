# E-Commerce Platform

This repository contains the source code for a comprehensive E-Commerce Platform. The platform is designed to facilitate both product purchasing and selling, leveraging modern web technologies to provide a responsive, secure, and scalable experience.

## Overview

The platform is divided into three main components:

1.  **Admin Panel (`./Admin`):** For administrators to manage products, categories, inventory, orders, customers, and other store settings.
2.  **Customer Website (`./Customer`):** The public-facing e-commerce store where users browse products, manage their cart, complete purchases, and manage their accounts.
3.  **Sanity Studio (`./Sanity-Studio`):** A headless CMS interface for managing the product catalog, promotional banners, and other dynamic content displayed across the platform.

## High-Level System Interaction

The **Customer Website** allows users to interact with the store. Its backend API (built with Next.js API routes within the `./Customer` app) handles user accounts, orders, and carts, storing this data in **Supabase/PostgreSQL** via Prisma. The Customer Website also fetches product catalog and dynamic content (like banners) directly from **Sanity CMS** using GraphQL.

The **Admin Panel** provides administrators with tools to manage data in both **Supabase/PostgreSQL** (e.g., viewing orders, managing customer data segments not handled by Clerk) and **Sanity CMS** (e.g., creating and updating products, categories, banners). It uses Clerk for administrator authentication.

**Sanity Studio** is the dedicated interface for content editors to directly manage all content stored within Sanity CMS.

## Architecture Patterns

The project employs several key architecture patterns to ensure scalability, maintainability, and efficiency:

- **CQRS (Command Query Responsibility Segregation):**
  The application uses **CQRS** to separate the command (write) and query (read) operations, enabling better scalability and performance. This pattern helps to optimize the system for high-load environments by handling reads and writes separately.

- **DTO (Data Transfer Object):**
  Data is transferred between components using **DTOs**, which are lightweight objects containing only the necessary data for communication between components. This pattern minimizes the data transferred, improving performance and reducing overhead.

- **Repository Pattern:**
  The back-end services are designed using the **Repository pattern**, which abstracts the data access logic from the business logic. This separation allows for easier unit testing, better maintainability, and more flexibility when changing the data storage or retrieval methods.

- **Layered Architecture:**
  The system follows a **Layered Architecture** pattern, separating the application into distinct layers for better manageability and scalability:

  - **Frontend Layer:**
    This layer is responsible for the user interface and interaction. Built using **Next.js** and integrated with **ShadCN**, it handles user input, rendering, and communicating with the back-end.
  - **Business Logic Layer:**
    The **Business Logic Layer** handles the core functionality and operations of the platform. It includes services that process orders, manage inventory, and handle authentication and session management. This layer uses the **Repository pattern** for data access and ensures the integrity of business rules.
  - **Data Access Layer:**
    The **Data Access Layer** abstracts interactions with the database, utilizing **Prisma ORM** for seamless communication with the **PostgreSQL** database via **Supabase**. This layer is responsible for querying, inserting, and managing data records like **Delivery**, **Pickup**, **Orders**, **Cart**, and **User**.
  - **Database Layer:**
    The **Database Layer** contains the actual data storage, in this case, using **PostgreSQL** (via **Supabase**). It manages persistent storage for user data, orders, sessions, and more.

- **Headless CMS Pattern:**
  The system integrates **Sanity CMS** as a **Headless CMS**, enabling content management and delivery as structured data through APIs. This pattern decouples content management from the presentation layer, offering flexibility and scalability.

## Components

### 1. Admin Panel (`./Admin`)

The Admin Panel is used by administrators to manage products, categories, subcategories, inventory, orders, and customers.
*   **Technology**: Built with Next.js (App Router), TypeScript, ShadCN UI, tRPC, Next.js Server Actions.
*   **Authentication**: Uses Clerk Auth for secure admin access.
*   **Further Details**: For detailed information on the Admin Panel's architecture, features, setup, and ongoing enhancements, please see the [Admin README](./Admin/README.md).

### 2. Customer Website (`./Customer`)

The Customer Website is the public-facing e-commerce store where users can browse products, add items to their cart, manage their profiles, and complete purchases.
*   **Technology**: Built with Next.js 13 (App Router), TypeScript, ShadCN UI, Zustand. Features custom JWT-based authentication.
*   **Status**: Under active development.
*   **Further Details**: For detailed information on the Customer Website's architecture, features, setup, and planned enhancements, please refer to the [Customer README](./Customer/README.md). A detailed implementation plan can also be found in the [Customer Implementation Plan](./Customer/customer-plan.md).

### 3. Sanity Studio (`./Sanity-Studio`)

Sanity Studio is the content management interface used to manage the product catalog (products, variants, media) and related content (categories, banners, etc.) that is displayed on the Admin Panel and Customer Website.
*   **Technology**: Sanity.io.
*   **Further Details**: For more information on the Sanity Studio setup and schema, please consult the [Sanity Studio README](./Sanity-Studio/README.md).

## Project Structure Overview

*   `/Admin`: Contains the Next.js application for the Admin Panel.
*   `/Customer`: Contains the Next.js application for the Customer-facing website.
*   `/Sanity-Studio`: Contains the Sanity CMS configuration and custom schemas.
*   `/prisma`: Contains the Prisma schema definition, migrations, and seed scripts (if any) for the PostgreSQL database.
*   `/docs`: Contains additional documentation, diagrams, or design files.

## Getting Started

This section guides you through setting up and running the E-Commerce Platform locally.

### Prerequisites

*   **Node.js:** Version 18.x or later (check `.nvmrc` if present).
*   **npm, pnpm, or yarn:** Depending on the package manager used for the project (assume `npm` if not specified, but check root `package-lock.json` or `pnpm-lock.yaml` etc.).
*   **Git:** For cloning the repository.
*   **Supabase Account / PostgreSQL Instance:** You'll need a PostgreSQL database. You can use a local PostgreSQL instance or a Supabase project. The connection string will be required.
*   **Sanity.io Account:** To connect to Sanity Studio and manage content.
*   **Clerk Account:** For Admin Panel authentication.

### Setup Steps

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install Dependencies:**
    This project is a monorepo. It's recommended to check if a root `package.json` and specific scripts for installing dependencies across workspaces (e.g., using `pnpm -r install` or `npm run install:all`) exist. If not, you'll need to install dependencies for each application separately:
    ```bash
    cd Admin && npm install && cd ..
    cd Customer && npm install && cd ..
    cd Sanity-Studio && npm install && cd ..
    ```
    *(Adjust `npm install` to `pnpm install` or `yarn install` if a different package manager is indicated by lock files at the root or in subdirectories.)*

3.  **Environment Variables:**
    Each application (`Admin`, `Customer`, `Sanity-Studio`) requires its own `.env` file with specific credentials and configurations.
    *   In each directory (`./Admin`, `./Customer`, `./Sanity-Studio`), locate the `.env.example` file.
    *   Duplicate it and rename the copy to `.env`.
    *   Fill in the necessary values in each `.env` file. Refer to the "Setup" sections in their respective READMEs ([Admin README](./Admin/README.md#setup-and-running-the-admin-panel), [Customer README](./Customer/README.md#setup-and-running-the-customer-website), [Sanity Studio README](./Sanity-Studio/README.md#setup)) for details on required variables.
    *   **Key variables will include:**
        *   `DATABASE_URL` (for Prisma, in Admin & Customer)
        *   Sanity project IDs and datasets
        *   Clerk keys (for Admin)
        *   Google OAuth keys (for Customer)
        *   JWT secrets (for Customer)

4.  **Database Setup (Prisma):**
    Once your `DATABASE_URL` is configured (typically in `Admin/.env` and `Customer/.env`, though often a single `prisma/.env` might manage this if schema is shared directly):
    *   Navigate to the directory containing the Prisma schema (likely the root directory or `./prisma` if it exists, or within Admin/Customer if they have separate schemas). For a shared schema in `./prisma`:
        ```bash
        cd prisma
        npx prisma migrate dev
        # or npx prisma db push (if you are not using migrations yet for development)
        npx prisma generate
        cd ..
        ```
    *   If Admin and Customer have independent Prisma setups, run these commands within their respective directories after configuring their `.env` files. The current project structure suggests a shared Prisma schema in the root `prisma/` directory.

5.  **Running the Applications:**
    *   **Admin Panel:**
        ```bash
        cd Admin
        npm run dev
        ```
        Usually accessible at `http://localhost:3000`.

    *   **Customer Website:**
        ```bash
        cd Customer
        npm run dev
        ```
        Usually accessible at `http://localhost:3001` (or another port specified in its `package.json`).

    *   **Sanity Studio:**
        ```bash
        cd Sanity-Studio
        npm run dev
        # or sanity start
        ```
        Usually accessible at `http://localhost:3333`.

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these general guidelines:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/issue-number`.
3.  **Make your changes.** Ensure you follow any linting or code style guidelines (e.g., run `npm run lint` if available).
4.  **Commit your changes** with a clear and descriptive commit message.
5.  **Push your branch** to your fork: `git push origin feature/your-feature-name`.
6.  **Open a Pull Request** against the main repository's `main` or `develop` branch.
7.  Provide a clear description of your changes in the PR.

Please check the project's issue tracker for any open issues you might want to tackle.

## License

(To be added: Specify project license, e.g., MIT License. Create a `LICENSE` file if it doesn't exist.)
