# 📁 `apis/` Folder

This folder contains all API call functions used in the project.

## 📌 Naming Convention

- Use **singular** names for files  
  **Format:** `[item].api.ts`  
  **Examples:** `user.api.ts`, `product.api.ts`, `order.api.ts`

## 📌 Structure

Each file should export an object named `[item]API` that groups all related API methods.

### Example: `user.api.ts`

```ts
export const userAPI = {
  getAll: () => {
    // fetch all users
  },
  getById: (id: string) => {
    // fetch user by ID
  },
  create: (data: any) => {
    // create a new user
  }
}
```

# Types Directory

This directory contains TypeScript type definitions used across the application.

## Files

- `admin.types.ts` - Admin-related type definitions
- `apointment.type.ts` - Appointment-related types
- `auth.type.ts` - Authentication and authorization types
- `branch.type.ts` - Branch management types
- `chat.types.ts` - Chat and messaging types
- `inventory.type.ts` - Inventory management types
- `manage-user.type.ts` - User management types
- `notification.types.ts` - Notification system types
- `response.ts` - Common API response types
