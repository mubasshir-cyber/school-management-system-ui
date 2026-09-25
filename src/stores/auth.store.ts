import { create } from 'zustand';
import { apiClient } from '../lib/api-client';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  userType: string;
  tenantId: string;
  schoolId: string;
  branchId?: string;
  roles: string[];
  permissions?: string[];
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: UserProfile, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

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
          get().fetchProfile();
          return;
        } catch (e) {
          localStorage.clear();
        }
      }
    }
    set({ isLoading: false, isAuthenticated: false, user: null });
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
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  fetchProfile: async () => {
    try {
      const res = await apiClient.get('/auth/me');
      const permissionsRes = await apiClient.get('/rbac/my-permissions');

      const userData = {
        ...res.data.data,
        permissions: permissionsRes.data.data || [],
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      set({ user: userData });
    } catch (err) {
      // Handled by 401 interceptor
    }
  },
}));
