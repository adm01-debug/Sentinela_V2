import { create } from 'zustand';
interface State { items: any[]; loading: boolean; setItems: (items: any[]) => void; setLoading: (loading: boolean) => void; }
export const useStore = create<State>((set) => ({
  items: [], loading: false,
  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ loading }),
}));
