import { create } from 'zustand';
import { Admin, AdminLoginRequest } from '../types/admin';
import { login, getPublicKey } from '../api/admin';
import { encrypt, setPublicKey, getPublicKey as getStoredPublicKey } from '../utils/crypto';
import { clearAdminAuth, getAdminToken, setAdminAuth } from '../utils/authStorage';

interface AdminLoginOptions {
  remember?: boolean;
}

interface AdminStore {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  error: string;
  login: (data: AdminLoginRequest, options?: AdminLoginOptions) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: () => boolean;
  fetchPublicKey: () => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  admin: null,
  token: getAdminToken(),
  isLoading: false,
  error: '',

  fetchPublicKey: async (): Promise<void> => {
    try {
      const response = await getPublicKey();
      setPublicKey(response.publicKey);
    } catch (err) {
      console.error('Failed to fetch public key:', err);
    }
  },

  login: async (data: AdminLoginRequest, options?: AdminLoginOptions): Promise<boolean> => {
    set({ isLoading: true, error: '' });

    try {
      let currentPublicKey = getStoredPublicKey();
      if (!currentPublicKey) {
        try {
          const response = await getPublicKey();
          currentPublicKey = response.publicKey;
          setPublicKey(currentPublicKey);
        } catch {
          console.warn('Failed to fetch public key, using unencrypted password');
        }
      }

      const encryptedData: AdminLoginRequest = {
        username: data.username,
        password: currentPublicKey ? encrypt(data.password) : data.password,
      };

      const response = await login(encryptedData);
      const newToken = response.token;
      const remember = options?.remember ?? false;

      setAdminAuth(newToken, remember);
      set({
        token: newToken,
        admin: response.admin,
      });
      return true;
    } catch (err: unknown) {
      let errorMessage = '登录失败，请稍后重试';
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      set({ error: errorMessage });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    clearAdminAuth();
    set({ token: null, admin: null });
  },

  isAuthenticated: () => {
    return get().token !== null;
  },
}));
