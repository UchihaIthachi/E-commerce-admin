# System Diagram Descriptions

This document provides textual descriptions that can be used as a basis for generating visual system diagrams (e.g., using Mermaid.js or other diagramming tools).

## 1. System Architecture Diagram Description

This diagram outlines the major components of the E-Commerce platform and their interactions.

```mermaid
graph LR
    %% Users
    UserAdmin["Admin User"]
    UserCustomer["Customer"]

    %% Frontend Systems
    subgraph Next_js_Admin_Panel
        AdminUI["Admin UI Components"]
        AdminAPICalls["API Calls / tRPC / Server Actions"]
    end

    subgraph Next_js_Customer_Website
        CustomerUI["Customer UI Components"]
        CustomerAPICalls["API Calls / GraphQL Queries"]
    end

    %% Backend Services & Data Stores
    subgraph Next_js_Backend
        APIRoutes["API Routes / tRPC Router"]
        AppLogic["Application Logic (Command/Query Handlers, Repositories)"]
    end

    subgraph Sanity_CMS
        SanityStudio["Sanity Studio (Content Input)"]
        SanityAPI["Sanity Document & GraphQL API"]
        SanityData["Product Catalog, Categories, Banners, Content"]
        SanityCDN["Sanity CDN (for static assets/images)"]
    end

    subgraph Supabase_PostgreSQL
        PrismaClient["Prisma ORM Client"]
        SupabaseDB["User Accounts, Orders, Carts, Sessions, Delivery Info"]
    end

    subgraph Third_Party_Services
        ClerkAuth["Clerk.dev (Authentication)"]
        CloudflareCDN["Cloudflare CDN (Static Assets)"]
    end

    %% Connections
    UserAdmin --> AdminUI
    AdminUI --> AdminAPICalls
    AdminAPICalls --> APIRoutes

    UserCustomer --> CustomerUI
    CustomerUI --> CustomerAPICalls
    CustomerAPICalls --> APIRoutes
    CustomerAPICalls --> SanityAPI

    APIRoutes --> AppLogic
    AppLogic --> SanityAPI
    AppLogic --> PrismaClient

    SanityStudio --> SanityAPI
    SanityAPI --> SanityData
    SanityAPI --> SanityCDN

    PrismaClient --> SupabaseDB

    %% Authentication and CDN
    AdminUI --> ClerkAuth
    CustomerUI --> ClerkAuth
    Next_js_Admin_Panel --> CloudflareCDN
    Next_js_Customer_Website --> CloudflareCDN

```

**Explanation of Components and Flows (System Architecture):**

*   **Users:**
    *   `Admin User`: Interacts with the Admin Panel.
    *   `Customer`: Interacts with the Customer Website.
*   **Frontend Systems:**
    *   **Next.js Admin Panel:** Interface for administrators, making backend calls (current REST-like, suggested tRPC/Server Actions).
    *   **Next.js Customer Website:** Public store interface, fetching data via GraphQL from Sanity or backend APIs for actions.
*   **Backend Services & Data Stores:**
    *   **Next.js Backend Logic:** Handles API requests, contains business logic (command/query handlers, repositories).
    *   **Sanity Headless CMS:** Manages product catalog and content, accessed via Document and GraphQL APIs. Includes Sanity Studio for content input and a CDN.
    *   **Supabase - PostgreSQL Database:** Stores transactional data (orders, carts), user accounts, sessions, etc., accessed via Prisma.
    *   **Third-Party Services:** Clerk.dev for authentication, Cloudflare for CDN.
*   **Connections:** Illustrates data flow between users, frontends, backend logic, data stores, and services.


## 2. Database Diagram Description (Supabase/PostgreSQL - Conceptual)

This conceptual diagram describes the likely structure and relationships for the PostgreSQL database managed via Supabase, based on the models listed in the README.

```mermaid
erDiagram
    User {
        string id PK "User ID (from Clerk or Supabase Auth)"
        string email
        string name
        string clerkId FK "Optional: Clerk User ID if synced"
        timestamp createdAt
        timestamp updatedAt
    }

    Account {
        string id PK
        string userId FK "references User(id)"
        string type "e.g., oauth, credentials"
        string provider "e.g., google, github"
        string providerAccountId
        string access_token
        string refresh_token
        integer expires_at
        string token_type
        string scope
        string id_token
        string session_state
        timestamp createdAt
        timestamp updatedAt
    }

    Session {
        string id PK
        string sessionToken PK
        string userId FK "references User(id)"
        timestamp expires
        timestamp createdAt
        timestamp updatedAt
    }

    VerificationToken {
        string identifier
        string token PK
        timestamp expires
        timestamp createdAt
        timestamp updatedAt
    }

    Address {
        string id PK
        string userId FK "references User(id)"
        string street
        string city
        string state
        string postalCode
        string country
        boolean isDefaultShipping
        boolean isDefaultBilling
        timestamp createdAt
        timestamp updatedAt
    }

    Order {
        string id PK
        string userId FK "references User(id)"
        string status "e.g., pending, paid, shipped, delivered, cancelled"
        decimal totalAmount
        string currency
        string shippingAddressId FK "references Address(id)"
        string billingAddressId FK "references Address(id)"
        string paymentIntentId "Optional: Stripe or other payment gateway ID"
        timestamp orderDate
        timestamp createdAt
        timestamp updatedAt
    }

    Cart {
        string id PK
        string userId FK "references User(id) - or session ID for guest carts"
        timestamp createdAt
        timestamp updatedAt
    }

    CartItem {
        string id PK
        string cartId FK "references Cart(id)"
        string productId "ID of the product (likely from Sanity)"
        string productName "Snapshot of product name"
        integer quantity
        decimal priceAtPurchase "Snapshot of price when added to cart"
        string variantId "Optional: ID of specific product variant (from Sanity)"
        json variantDetails "Optional: Snapshot of variant details"
        timestamp createdAt
        timestamp updatedAt
    }

    Delivery {
        string id PK
        string orderId FK "references Order(id)"
        string method "e.g., standard, express"
        string trackingNumber
        string status "e.g., processing, shipped, out_for_delivery, delivered"
        timestamp estimatedDeliveryDate
        timestamp actualDeliveryDate
        timestamp createdAt
        timestamp updatedAt
    }

    Pickup {
        string id PK
        string orderId FK "references Order(id)"
        string locationId "ID of pickup location"
        string status "e.g., ready_for_pickup, picked_up"
        timestamp pickupDeadline
        timestamp actualPickupDate
        timestamp createdAt
        timestamp updatedAt
    }

    %% Relationships
    User ||--o{ Account : "has"
    User ||--o{ Session : "has"
    User ||--o{ Address : "has"
    User ||--o{ Order : "places"
    User ||--o{ Cart : "has"

    Order ||--o{ Delivery : "has_delivery_info"
    Order ||--o{ Pickup : "has_pickup_info"
    Order }|--|| Address : "uses_shipping_address"
    Order }|--|| Address : "uses_billing_address"

    Cart ||--o{ CartItem : "contains"
```

**Explanation of Entities and Relationships (Database - Conceptual):**

*   **User:** Core user entity, potentially linked to Clerk or Supabase Auth.
*   **Account:** For OAuth account linking (e.g., via NextAuth.js).
*   **Session:** Manages user sessions (e.g., via NextAuth.js).
*   **VerificationToken:** For email verification tokens.
*   **Address:** Stores user shipping and billing addresses.
*   **Order:** Represents a customer's order, linked to a user, addresses, and potentially delivery/pickup info.
*   **Cart:** User's shopping cart, containing cart items.
*   **CartItem:** An item in the cart, referencing product details (which live in Sanity) and snapshotting price/name.
*   **Delivery:** Shipping details for an order.
*   **Pickup:** Pickup details for an order.

**Note:** This database model is conceptual. `OrderItem`s are typically generated from `CartItem`s at purchase but not explicitly listed in the provided models. Product details in `CartItem` reference the main product data in Sanity.
```
