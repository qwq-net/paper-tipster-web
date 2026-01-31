# Implementation Plan - Admin User Management

User requested a page to manage user permissions (specifically granting Admin role) at `/admin/permission` (or similar). I will use `/admin/users` as a standard convention.

## Goal

Enable Admin users to view all registered users and update their roles (USER <-> ADMIN).

## Proposed Changes

### 1. Feature Layer: Admin User Management

Create `src/features/admin/manage-users` slice.

- `[NEW] src/features/admin/manage-users/actions.ts`: Server Action `updateUserRole(userId, newRole)`. MUST verify the caller is currently an ADMIN.
- `[NEW] src/features/admin/manage-users/ui/user-role-select.tsx`: Client component dropdown to change role.
- `[NEW] src/features/admin/manage-users/index.ts`: Public API export.

### 2. Page Layer: Admin Users Page

Create `src/app/admin/users/page.tsx`.

- Fetch all users from DB.
- Render a table displaying ID, Name, Icon, and the `UserRoleSelect` component.
- Protect route (redirect if not Admin).

### 3. Page Layer: Admin Dashboard Update

Update `src/app/admin/page.tsx`.

- Add a link card to `/admin/users`.

## Verification Plan

1.  Navigate to `/admin`.
2.  Click "Manage Users".
3.  See list of users (including self).
4.  Try to change another user's role.
5.  Verify DB update.
