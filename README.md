# Ticketing System — Complete Project README

A full-featured role-based ticketing frontend built with React, TypeScript and Vite. The project demonstrates a modular UI, centralized state with Zustand, admin-managed permissions, role-aware routing and a realtime simulation for dashboard metrics. This README documents all features, components, stores, types, seeded data, development workflows, and recommended next steps so you have a single reference for the entire codebase.

--

Table of contents

-   Project overview
-   Quick start (dev / build / lint)
-   High-level architecture
-   Data models & types
-   Stores (Zustand) and responsibilities
-   Pages, components and UI primitives (full file map)
-   Admin & permissions model
-   Realtime simulation & dashboard behavior
-   Seed data & where it lives (how to perform a full-clean)
-   Tests and how to enable them
-   Known local mocks to remove / migration suggestions
-   Troubleshooting & common gotchas
-   Contribution guidelines & roadmap

--

Project overview

This repository implements the frontend of a ticketing system designed for role-based access:

-   Roles: `user`, `manager`, `admin` (signup prevents creating `admin` directly)
-   Centralized user management in `authStore` — admin CRUD operations update a global source-of-truth for users
-   Permission toggles are managed by admins via `settingsStore` and map to logical permissions used by the app
-   The dashboard includes live/updating metrics produced by a simple realtime simulator in `ticketStore` that demonstrates how live events would update UI components
-   UI is built using Radix primitives and local UI components under `src/components/ui` for consistent styling
-   **Fast refresh optimized**: UI components are separated from utility functions (variants, hooks, styles) into dedicated files to ensure optimal React Fast Refresh support

--

Quick start (macOS / zsh)

Prerequisites:

-   Node.js >= 18 recommended
-   npm (or yarn, pnpm)

Install dependencies and run dev server:

```bash
cd /Users/aaryannara/Downloads/ticket
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Linting:

```bash
npm run lint
```

--

High-level architecture

-   Vite + React + TypeScript (fast dev feedback and optimized builds)
-   Zustand for small, focused stores (authStore, settingsStore, ticketStore, projectStore)
-   React Router v6 for routing and protected routes
-   Custom UI primitives in `src/components/ui` built on Radix + Tailwind/utility CSS
-   Simple realtime simulation (interval-based) in `ticketStore` to provide dynamic dashboard stats
-   **Modular UI architecture**: Components are separated from their utility functions (variants, styles, hooks) for optimal Fast Refresh support

--

Data models & types (source: `src/types/index.ts`)

Primary domain types (representative):

-   User

    -   id: string
    -   name: string
    -   email: string
    -   role: 'user' | 'manager' | 'admin'
    -   active?: boolean

-   Ticket

    -   id: string
    -   title: string
    -   description: string
    -   reporterId: string
    -   assigneeIds: string[]
    -   status: 'open' | 'in-progress' | 'closed' | 'blocked' | ...
    -   priority: 'low' | 'medium' | 'high' | 'critical'
    -   department?: string
    -   createdAt: string
    -   updatedAt?: string

-   DashboardStats
    -   openTickets: number
    -   inProgressTickets: number
    -   closedTickets: number
    -   criticalTickets: number
    -   ticketsByDepartment: Array<{ department: string; count: number }>
    -   ticketsByPriority: Array<{ priority: string; count: number }>
    -   recentActivity: Array<{ id: string; message: string; createdAt: string }>

Note: exact TS definitions live in `src/types/index.ts`. When updating computed aggregates, ensure the returned object conforms exactly to `DashboardStats` to satisfy TypeScript checks.

--

Zustand stores (source files)

-   `src/store/authStore.ts`

    -   Canonical user store: maintains current users, currentUser session, login, logout, register, and admin user CRUD (createUser, updateUser, deleteUser)
    -   Permission helpers: `hasPermission(permission)` consults rolePermissions and `settingsStore` feature toggles
    -   Seeded state: the repository intentionally seeds a single admin user by default for a "full-clean" start

-   `src/store/settingsStore.ts`

    -   Feature toggles controlled by admins
    -   Maps to UI feature availability; used by `authStore.hasPermission` via `permissionToFeature` mapping

-   `src/store/ticketStore.ts`

    -   Tickets list, ticket CRUD operations, comments/attachments helpers
    -   `computeStatsFromTickets()` returns `DashboardStats`
    -   `startRealtimeUpdates()` / `stopRealtimeUpdates()` simulate ticket activity and mutate `tickets` + `dashboardStats`
    -   NOTE: the store used to seed `mockTickets`; to fully remove seeded domain data, empty any `mockTickets` arrays here

-   `src/store/projectStore.ts`
    -   Projects list & CRUD
    -   Recently modified to start empty; previously had mockProjects

Other stores: any additional small stores or helpers live under `src/store`.

--

Pages and components (full file map)

Below is a near-complete map of UI pages and components. Use this as a quick cross-reference when editing or adding features.

-   `src/main.tsx` — React entry and global providers
-   `src/App.tsx` — Router, route definitions, and global layout wrapper

Pages (top-level routes)

-   `src/components/auth/LoginPage.tsx` — Login UI and redirect after auth
-   `src/components/auth/SignupPage.tsx` — Signup flow; role selection forbids choosing `admin`
-   `src/components/auth/ProtectedRoute.tsx` — Route protection wrapper for authenticated/role-based access
-   `src/components/dashboard/Dashboard.tsx` — Role-aware dashboard that starts/stops realtime simulation; composes widgets
-   `src/components/admin/AdminPage.tsx` — Admin console: manage users, projects, permissions; now uses `authStore` as source-of-truth for users
-   `src/components/admin/PermissionsPage.tsx` — UI for toggling feature flags per role (uses `settingsStore`)
-   `src/components/epics/EpicsPage.tsx` — Epics listing and modals for create/edit
-   `src/components/kanban/KanbanPage.tsx` — Kanban board view (drag-drop)
-   `src/components/projects/ProjectsPage.tsx` — Projects listing and project CRUD modals
-   `src/components/tickets/TicketsPage.tsx` — Tickets listing and management
-   `src/components/tickets/MyTicketsPage.tsx` — Current user's assigned tickets
-   `src/components/tickets/TicketDetailModal.tsx` — Edit/view ticket modal with comments/attachments
-   `src/components/tickets/CreateTicketModal.tsx` — Modal to create a ticket (assignee dropdown reads from `authStore`)
-   `src/components/profile/ProfilePage.tsx` — User profile view & edit
-   `src/components/reports/ReportsPage.tsx` — Reporting UI
-   `src/components/settings/SettingsModal.tsx` — App-wide settings modal

Dashboard widgets & reusable dashboard components

-   `src/components/dashboard/DashboardCard.tsx`
-   `src/components/dashboard/DashboardStats.tsx`
-   `src/components/dashboard/MyTicketsWidget.tsx`
-   `src/components/dashboard/RecentActivity.tsx`
-   `src/components/dashboard/TicketsByDepartment.tsx`
-   `src/components/dashboard/TicketsByPriority.tsx`
-   `src/components/dashboard/RoleWidgets.tsx` — role-specific widget rendering

Admin & dev utilities

-   `src/components/dev/Dashboard.tsx` — developer dashboard used during development/testing
-   `src/components/dev/DevChecks.tsx` — component to check store APIs and simulate flows

Layout & navigation

-   `src/components/layout/Header.tsx`
-   `src/components/layout/Layout.tsx`
-   `src/components/layout/PageHeader.tsx`
-   `src/components/layout/Sidebar.tsx`

Notifications

-   `src/components/notifications/NotificationCenter.tsx`

Reusable UI primitives (UI library in repo)

-   `src/components/ui/*` — a large set of UI primitives and composed components used throughout the app, examples:
    -   `button.tsx`, `button-variants.ts` — button component and variants (separated for Fast Refresh)
    -   `badge.tsx`, `badge-variants.ts` — badge component and variants (separated for Fast Refresh)
    -   `toggle.tsx`, `toggle-variants.ts` — toggle component and variants (separated for Fast Refresh)
    -   `form.tsx`, `form-hooks.ts` — form components and custom hooks (separated for Fast Refresh)
    -   `navigation-menu.tsx`, `navigation-menu-styles.ts` — navigation menu and styles (separated for Fast Refresh)
    -   Other components: `input.tsx`, `select.tsx`, `multi-select.tsx`, `checkbox.tsx`, `table.tsx`, `dialog.tsx`, `toast.tsx`, `toaster.tsx`, `card.tsx`, `avatar.tsx`, `tabs.tsx`, `popover.tsx`, `dropdown-menu.tsx`, etc.
    -   These are lightweight wrappers around Radix primitives and Tailwind styles to keep a consistent UI system.
    -   **Fast Refresh optimization**: Utility functions, variants, and hooks are separated into dedicated files to prevent "Fast refresh only works when a file only exports components" warnings.

Utilities, hooks and libs

-   `src/hooks/use-toast.ts` — toast convenience hook
-   `src/lib/utils.ts` — assorted helpers used by components and stores

Types and shared constants

-   `src/types/index.ts` — canonical type definitions for `User`, `Ticket`, `DashboardStats`, `Project`, etc.

--

Admin & permissions model (detailed)

-   Logical role permissions are defined in `authStore` (e.g., `rolePermissions`) mapping roles to allowed permission keys (ex: `manage_users`, `manage_projects`, `view_reports`, `manage_tickets`).
-   `permissionToFeature` maps logical permission keys to feature toggles stored in `settingsStore` (so admins can globally disable/enable a feature even when a role normally has the logical permission).
-   `authStore.hasPermission(permissionKey)` returns `true` only when both the role grants the permission and the corresponding feature toggle is enabled in `settingsStore`.
-   The Signup UI prevents selecting `admin` role; to create an `admin`, an existing admin must use `AdminPage`.

--

Realtime simulation & Dashboard behavior

-   `ticketStore.startRealtimeUpdates()` starts an interval that simulates activity:
    -   creates new tickets with different priorities
    -   adds comments to existing tickets
    -   randomly changes statuses
    -   recomputes `dashboardStats` via `computeStatsFromTickets()`
-   The `Dashboard` component starts the realtime updates on mount and stops them on unmount so metrics update while the dashboard is active.
-   In production you would replace the simulation with a WebSocket or SSE subscription to receive real-time server events.

--

Seed data & full-clean instructions

The repository has been cleaned to start with minimal seed data. By default, the app starts with:

-   A single seeded admin user in `authStore` (email: admin@company.com, password: password)
-   Empty tickets, projects, epics, notifications, and departments

Admin can create all domain data using the Admin UI.

If you want to add back seed data for development, you can modify the initial states in the respective stores (e.g., add mockTickets to `ticketStore.ts`).

--

Tests (how to enable and run)

-   Test files exist (e.g., `src/__tests__/permissions.spec.ts`), but the repo does not include Vitest in `devDependencies` by default.
-   To enable tests:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

-   Add a script to `package.json`:

```json
"scripts": {
  "test": "vitest"
}
```

-   Tips for tests that use Zustand stores:
    -   Reset store state between tests, or provide a `reset()` helper exported from your stores during testing only.
    -   Use isolated store instances where possible, or mock `useAuthStore` with `vi.fn()`.

--

Known local mocks and lint warnings (where they live)

Mock data has been removed. The following are intentionally kept for documentation/reference and may produce lint warnings:

-   `_permissions` and `_rolePermissions` in `src/components/admin/AdminPage.tsx` — documentation arrays prefixed with underscore
-   Some unused variables in UI components (e.g., 'loading' in RoleWidgets.tsx) — can be prefixed with underscore if desired

If you want a completely clean lint output, remove the underscored arrays.

--

Troubleshooting & common gotchas

-   "Hooks used at top-level" errors: ensure `useAuthStore()` or other hooks are called inside React components or use `useAuthStore.getState()` and zustand subscriptions outside components.
-   Type errors for dashboard stats: ensure `computeStatsFromTickets()` returns exactly the shape of `DashboardStats`.
-   After editing stores, the UI may retain old data in memory — restart the dev server to ensure initial state seeds are re-evaluated.
-   **Fast Refresh warnings**: If you see "Fast refresh only works when a file only exports components", ensure utility functions (variants, hooks, styles) are separated into dedicated files and only React components are exported from component files.
-   **Import errors after refactoring**: When moving variants or hooks to separate files, update all import statements in components that use them (e.g., `buttonVariants` should be imported from `button-variants.ts`, not `button.tsx`).

--

Contributing & recommended next steps

-   Keep a single source of truth for data (users in `authStore`). Avoid duplicating user arrays across stores/components.
-   Move `mockDepartments` into a `departmentStore.ts` if departments need to be created/persisted globally.
-   Replace the realtime simulator with a real event subscription (WebSocket/SSE) for production scenarios.
-   Add Vitest and a sensible test setup for stores (reset helpers) to make unit tests reliable.
-   Remove underscored documentation arrays to satisfy lint rules once the code is stable.
-   **UI Component Organization**: When creating new UI components, separate utility functions (variants, hooks, styles) into dedicated files (e.g., `component-variants.ts`, `component-hooks.ts`) to maintain Fast Refresh compatibility and follow the established pattern.

--

Roadmap (suggested enhancements)

-   ✅ **Fast Refresh optimization completed**: UI components separated from utility functions for optimal development experience
-   Persist store state to localStorage or server for demo persistence
-   Add proper authentication (JWT / OAuth) and replace local register/login with APIs
-   Add role-specific route guards and dynamic menus (menu items stored in `settingsStore`)
-   Add a backend service mock or simple Node server to support CRUD and WebSocket real-time events
-   Add e2e tests using Playwright (Playwright is included in `devDependencies`)

--

Where to find important files (quick map)

-   `src/store/authStore.ts` — user auth & permissions
-   `src/store/ticketStore.ts` — tickets & realtime
-   `src/store/settingsStore.ts` — feature toggles
-   `src/store/projectStore.ts` — projects
-   `src/components/admin/AdminPage.tsx` — admin console
-   `src/components/tickets/CreateTicketModal.tsx` & `TicketDetailModal.tsx` — ticket forms using central user list
-   `src/types/index.ts` — canonical types

--

Need help making the README even more tailored?

I can also:

-   ✅ **Fast Refresh optimization completed**: UI components have been separated from utility functions for optimal development experience
-   Generate an architecture diagram (Mermaid) and embed it in this README
-   Produce a migration PR that removes the remaining mock data (`mockTickets`, `mockDepartments`) and moves departments to a new `departmentStore.ts`
-   Add Vitest configuration and a basic test-run script

Choose one and I will apply the change.
