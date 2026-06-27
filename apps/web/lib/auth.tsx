'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from './api';

export type Role = 'OWNER' | 'ADMIN' | 'INSTRUCTOR' | 'EVALUATOR' | 'STUDENT';
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  activeTenantId: string;
  memberships: Array<{ tenantId: string; role: Role }>;
}

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    try {
      setUser(await apiFetch<SessionUser>('/auth/me'));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void refresh(); }, []);
  const logout = async () => {
    await apiFetch<{ success: boolean }>('/auth/logout', { method: 'POST' });
    setUser(null);
  };
  return <AuthContext.Provider value={{ user, loading, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(options?: { required?: boolean; roles?: Role[] }) {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa de AuthProvider');
  const router = useRouter();
  const pathname = usePathname();
  const authorized = !options?.roles || options.roles.some((role) => context.user?.roles.includes(role));
  useEffect(() => {
    if (context.loading) return;
    if (options?.required && !context.user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (context.user && !authorized) router.replace('/');
  }, [authorized, context.loading, context.user, options?.required, pathname, router]);
  return { ...context, authorized };
}

