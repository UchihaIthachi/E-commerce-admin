# Deployment and CI/CD Guide

This document outlines the CI/CD pipeline and deployment process for the Admin and Customer applications of the E-Commerce Platform to Vercel.

## Overview

The CI/CD process is automated using GitHub Actions. Separate workflows are defined for the Admin and Customer applications, allowing them to be built and deployed independently. Both applications are deployed to Vercel.

## 1. Vercel Project Setup

It is recommended to set up **two separate Vercel projects**:

1.  **Admin Application Project:**
    *   **Vercel Project Name (Example):** `ecommerce-admin`
    *   **Git Repository Connection:** Connect to your GitHub repository.
    *   **Framework Preset:** Next.js (usually auto-detected).
    *   **Root Directory:** Set to `Admin` (this tells Vercel to look inside the `./Admin` subdirectory of your monorepo).
    *   **Build & Output Settings:** Vercel's defaults for Next.js are typically sufficient (`npm run build` or `next build`, output directory `.next`).

2.  **Customer Application Project:**
    *   **Vercel Project Name (Example):** `ecommerce-customer`
    *   **Git Repository Connection:** Connect to the same GitHub repository.
    *   **Framework Preset:** Next.js (usually auto-detected).
    *   **Root Directory:** Set to `Customer` (this tells Vercel to look inside the `./Customer` subdirectory).
    *   **Build & Output Settings:** Defaults for Next.js are usually sufficient.

Using separate projects provides better isolation for environment variables, build logs, and domain management for each application.

## 2. GitHub Actions Workflows

The CI/CD workflows are defined in YAML files located (as templates/designs) in the `deploy/.github/workflows/` directory. To make them active, these files should be copied or moved to the `.github/workflows/` directory at the root of your repository.

*   **`deploy-admin.yml`**: Handles CI/CD for the Admin application.
*   **`deploy-customer.yml`**: Handles CI/CD for the Customer application.

Key features of these workflows include:

*   **Concurrency Control:** Each workflow uses a `concurrency` setting (e.g., `group: deploy-admin-${{ github.ref }}`) with `cancel-in-progress: true`. This ensures that for any given Git reference (like a branch or PR), only one workflow instance runs at a time, automatically cancelling any older, in-progress runs for that same reference. This is especially useful for pull requests that receive multiple commits in quick succession.

### Workflow Triggers

Both workflows are triggered by:
*   **Push to `main` branch:** Deploys to Vercel Production environment for the respective project.
*   **New GitHub Release (type: published):** Deploys to Vercel Production environment for the respective project. This trigger has special handling for `package.json` versioning (see below).
*   **Pull Request (opened, synchronize, reopened) targeting `main`:** Creates a Vercel Preview Deployment.
*   Workflows also trigger if their own YAML file is changed.
*   **Path Filtering:** Workflows only run if changes occur within their respective application directories (`Admin/**` or `Customer/**`) or their workflow file when triggered by push or pull_request events. (Release events are not subject to path filtering in the same way).

### Workflow Jobs (`deploy`)

Each workflow has a single `deploy` job that performs the following general steps:
1.  **Checkout Code:** Checks out the repository's code. For `release` events, it checks out the specific release tag. Includes `fetch-depth: 0` for full Git history.
2.  **Set up Node.js:** Configures Node.js (version 18).
3.  **Cache Global NPM Packages:** Caches `~/.npm` to potentially speed up global package installations (like the Vercel CLI).
4.  **Cache Application `node_modules`:** Caches the application-specific `node_modules` directory (e.g., `Admin/node_modules` or `Customer/node_modules`) based on its `package-lock.json` file. This is primarily for future-proofing and will speed up any CI steps that might be added later to run `npm install` or `npm ci` directly within the GitHub Actions runner for that application (e.g., for running tests or linters). Vercel's own build process uses its separate environment and caching mechanisms.
5.  **Install Vercel CLI:** Installs the Vercel CLI at a specific pinned version (e.g., `33.5.0`) to ensure build stability, rather than using `@latest`.
6.  **Update `package.json` Version (for Release Events Only):** If triggered by a GitHub Release, this step updates the application's `package.json` locally to match the release tag version. (Details below under "Special Handling for GitHub Release Triggers").
7.  **Determine Vercel Deployment Args & Context:**
    *   For pushes to `main` or new GitHub releases: Appends `--prod` for a production deployment and sets `IS_PRODUCTION_DEPLOY=true`.
    *   For pull requests or other branch pushes: Omits `--prod` for a preview deployment and sets `IS_PRODUCTION_DEPLOY=false`.
    *   Sets `--cwd ./Admin` or `--cwd ./Customer`.
    *   Outputs `IS_PULL_REQUEST`.
8.  **Deploy to Vercel:**
    *   Runs `vercel deploy <args> --token <VERCEL_TOKEN>`, deploying the current workspace state (including any local `package.json` updates for release events).
    *   Captures the deployment URL.
9.  **Commit and Push `package.json` Changes (for Release Events Only):** If triggered by a GitHub Release and deployment was successful, this step commits the updated `package.json` files back to the `main` branch. (Details below, including safety checks).
10. **Tag Successful Production Deployment:** If it's a production deployment, creates and pushes a Git tag according to the updated naming convention. (Details below).
11. **Pull Request Commenting:** For pull request triggered deployments, posts a comment on the PR with the preview URL.

#### Special Handling for GitHub Release Triggers:

When a deployment is triggered by publishing a new GitHub Release (e.g., `v1.2.3`):

1.  **Checkout Release Tag:** The workflow checks out the code associated with the specific release tag.
2.  **Update `package.json` Version (Local):** (Corresponds to step 6 in the general list above)
    *   The version number is extracted from the release tag (e.g., `v1.2.3` becomes `1.2.3`).
    *   The `package.json` (and `package-lock.json`) within the respective application directory (`Admin/` or `Customer/`) is updated locally in the workflow's workspace to this version using `npm version <version> --no-git-tag-version --allow-same-version`.
3.  **Vercel Production Deployment:** (Corresponds to step 8 in the general list)
    *   The `vercel deploy --prod` command is run.
    *   **Crucially, Vercel builds and deploys the application using the local workspace files, which include the `package.json` updated in the previous step.** This ensures the deployed application has the correct version baked into its build if the application uses this version information.
4.  **Commit and Push `package.json` Changes to `main`:** (Corresponds to step 9 in the general list)
    *   If the Vercel deployment is successful, the workflow then commits the changes made to `package.json` (and `package-lock.json`).
    *   This commit is pushed directly to the `main` branch.
    *   **Safer Push Mechanism:** The push is attempted carefully. If it would not be a fast-forward (e.g., if `main` has diverged from the release tag's base commit), the push is aborted, and the workflow step fails with an error message advising manual intervention. This prevents accidental overwrites of `main`.
    *   The commit message will indicate an automated version bump (e.g., "Bump Admin version to 1.2.3 for release v1.2.3 [skip ci-deploy]").
5.  **Git Tagging of Deployed Commit:** (Corresponds to step 10 in the general list) The "Automated Git Tagging for Production Deployments" step will then tag the original commit associated with the GitHub Release tag (`github.sha` for the release event).

This process ensures that production deployments triggered by GitHub Releases are correctly versioned and that this version is reflected back in the `main` branch's `package.json` history, where possible through a fast-forward push.

#### Automated Git Tagging for Production Deployments

Upon a successful production deployment (identified by `IS_PRODUCTION_DEPLOY == 'true'` and a successful Vercel deployment), the workflow automatically performs the following Git tagging operations:

*   **Tag Creation:** An annotated Git tag is created pointing to the commit that triggered the production deployment (`github.sha`).
*   **Updated Tag Naming Convention:**
    *   For deployments triggered by a **GitHub Release** (e.g., release `v1.2.0` becomes version `1.2.0`):
        *   Admin app: `vercel-admin-prod-1.2.0`
        *   Customer app: `vercel-customer-prod-1.2.0`
    *   For deployments triggered by a direct **push to `main`** (not a release event, using a timestamp `YYYYMMDD-HHMMSS`):
        *   Admin app: `vercel-admin-prod-YYYYMMDD-HHMMSS` (e.g., `vercel-admin-prod-20231027-153000`)
        *   Customer app: `vercel-customer-prod-YYYYMMDD-HHMMSS`
*   **Tag Push:** The newly created tag is automatically pushed to the origin repository. This requires the workflow to have `contents: write` permission.

This provides a clear Git history of successful production deployments for both applications.

## 3. Required GitHub Secrets
(Rest of the document remains the same)
...

## 4. Environment Variables in Vercel
...

## 5. Monitoring Deployments
...

## Future Considerations
...
