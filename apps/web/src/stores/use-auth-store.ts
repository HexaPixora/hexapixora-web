import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEAM_MEMBER';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

/**
 * True for ADMIN / SUPER_ADMIN — full access, and the only roles that can
 * manage users and assign permissions.
 */
export function useIsAdmin(): boolean {
  const role = useAuthStore((s) => s.user?.role);
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * True when the current user may access a given section. ADMIN/SUPER_ADMIN
 * always can; a TEAM_MEMBER must have been granted that section. Mirrors the
 * API's PermissionsGuard.
 */
export function useHasPermission(section: string): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return true;
  return Array.isArray(user.permissions) && user.permissions.includes(section);
}
