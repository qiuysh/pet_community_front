import { create } from 'zustand';

interface LayoutStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const STORAGE_KEY = 'admin_sidebar_collapsed';

const getStoredSidebarState = (): boolean => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    return stored === 'true';
  }
  return false;
};

const setStoredSidebarState = (collapsed: boolean): void => {
  localStorage.setItem(STORAGE_KEY, collapsed.toString());
};

export const useLayoutStore = create<LayoutStore>((set) => ({
  sidebarCollapsed: getStoredSidebarState(),

  toggleSidebar: () => {
    set((state) => {
      const newState = !state.sidebarCollapsed;
      setStoredSidebarState(newState);
      return { sidebarCollapsed: newState };
    });
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    setStoredSidebarState(collapsed);
    set({ sidebarCollapsed: collapsed });
  },
}));