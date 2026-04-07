import { create } from 'zustand';
import { IUser } from '@/types';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  setAuth: (user: IUser, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: IUser) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,

  hydrate: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('esl_token');
      const userStr = localStorage.getItem('esl_user');
      set({
        user: userStr ? JSON.parse(userStr) : null,
        token,
        isAuthenticated: !!token,
        isLoading: false,
        isHydrated: true,
      });
    } else {
      set({ isLoading: false, isHydrated: true });
    }
  },

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('esl_token', token);
      localStorage.setItem('esl_user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('esl_token');
      localStorage.removeItem('esl_user');
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  updateUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('esl_user', JSON.stringify(user));
    }
    set({ user });
  },
}));
