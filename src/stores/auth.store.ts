import { create } from 'zustand';
import { apiClient } from '../lib/api-client';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  userType: string;
  tenantId?: string;
  schoolId?: string;
  branchId?: string;
  roles: string[];
  permissions?: string[];
}

// Development default profile (Matches reference "Brandon Septimus / Admin")
const DEV_DEFAULT_USER: UserProfile = {
  id: 'dev-admin-user-id',
  email: 'admin@school.edu',
  firstName: 'Brandon',
  lastName: 'Septimus',
  userType: 'STAFF',
  tenantId: 'd0000000-0000-0000-0000-000000000001',
  schoolId: 'e0000000-0000-0000-0000-000000000001',
  roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ADMIN'],
  permissions: ['*'],
};

interface AuthState {
  user: UserProfile;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: UserProfile, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEV_DEFAULT_USER,
  accessToken: null,
  isAuthenticated: true, // Development bypass enabled by default
  isLoading: false,

  initialize: () => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          set({
            accessToken: storedToken,
            user: parsedUser,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        } catch (e) {
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
        }
      }
    }

    // Default to dev mode active session (bypasses login during development)
    set({
      user: DEV_DEFAULT_USER,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setAuth: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    try {
      if (get().accessToken) {
        await apiClient.post('/auth/logout');
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
      set({
        user: DEV_DEFAULT_USER,
        accessToken: null,
        isAuthenticated: true, // Keep accessible in dev mode
        isLoading: false,
      });
    }
  },

  fetchProfile: async () => {
    try {
      const token = get().accessToken;
      if (!token) return;

      const res = await apiClient.get('/auth/me');
      const permissionsRes = await apiClient.get('/rbac/my-permissions');

      const userData = {
        ...res.data.data,
        permissions: permissionsRes.data?.data || [],
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      set({ user: userData });
    } catch (err) {
      // Silent in dev
    }
  },
}));
