# E-Commerce Platform

This repository contains the source code for a comprehensive E-Commerce Platform. The platform is divided into three main components: an Admin Panel, a Customer-facing Website, and a Sanity Studio for content management.

## Overview

The E-Commerce Platform is designed to facilitate both product purchasing and selling. It leverages modern web technologies, including Next.js, Sanity (headless CMS), Supabase (database), and Cloudflare (CDN), to provide a responsive, secure, and scalable experience.

## Components

### 1. Admin Panel (`./Admin`)
The Admin Panel is used by administrators to manage products, categories, subcategories, inventory, orders, and customers.
- **Technology**: Built with Next.js.
- **Content Management**: Integrated with Sanity CMS for dynamic content.
- **Authentication**: Uses Clerk Auth for secure admin access.
- **Further Details**: For more detailed information on the Admin Panel's architecture, features, and ongoing enhancements, please see the [Admin README](./Admin/README.md).

### 2. Customer Website (`./Customer`)
The Customer Website is the public-facing e-commerce store where users can browse products, add items to their cart, manage their profiles, and complete purchases.
- **Technology**: Built with Next.js 13 (AppRouter) and ShadCN for UI components.
- **Status**: Currently under active development.
- **Further Details**: For more information on the Customer Website's architecture and planned features, please refer to the [Customer README](./Customer/README.md). A detailed implementation plan, including upcoming features and SEO strategies, can be found in [Customer Implementation Plan](./Customer/customer-plan.md). (Note: `customer-plan.md` will be created in a subsequent step).

### 3. Sanity Studio (`./Sanity-Studio`)
Sanity Studio is the content management interface used to manage the product catalog (products, variants, media) and related content (categories, banners, etc.) that is displayed on the Admin Panel and Customer Website.
- **Technology**: Sanity.io.
- **Further Details**: For more information on the Sanity Studio setup and schema, please consult the [Sanity Studio README](./Sanity-Studio/README.md).

## System Architecture
For a detailed overview of the system architecture, including technology stack, design patterns (CQRS, DTO, Repository, Layered Architecture, Headless CMS), and integrations, please refer to the README files within the [Admin](./Admin/README.md) and [Customer](./Customer/README.md) directories.

## Getting Started
(To be added: Instructions on how to set up and run each component of the project.)

## Contributing
(To be added: Guidelines for contributing to the project.)
