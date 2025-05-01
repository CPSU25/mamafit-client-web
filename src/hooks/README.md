# 📁 `hooks/` Folder

This folder contains all custom React hooks used in the project.

## 📌 Naming Convention

- Use **camelCase** with `use` prefix for hook files  
  **Format:** `use[Feature].ts`  
  **Examples:** `useAuth.ts`, `useProduct.ts`, `useLocalStorage.ts`

## 📌 Structure

Each file should export a hook function that follows the React hooks pattern.

### Example: `useAuth.ts`

```ts
import { useState, useEffect } from 'react';
import { userAPI } from '../apis/user.api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const userData = await userAPI.login(credentials);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await userAPI.logout();
      setUser(null);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await userAPI.getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  return { user, loading, error, login, logout };
}