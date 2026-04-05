// Clipboard Store for Sentinela v17
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ClipboardItem {
  id: string;
  type: ClipboardItemType;
  data: unknown;
  source: string;
  copiedAt: number;
  expiresAt?: number;
}

type ClipboardItemType = 'text' | 'employee' | 'activity' | 'alert' | 'report' | 'row' | 'rows' | 'custom';

interface ClipboardState {
  items: ClipboardItem[];
  currentItem: ClipboardItem | null;
  maxItems: number;
  isSupported: boolean;

  copy: (type: ClipboardItemType, data: unknown, source?: string) => Promise<string>;
  paste: () => ClipboardItem | null;
  clear: () => void;
  clearItem: (id) => void;
  getItem: (id) => ClipboardItem | undefined;
  hasItem: (type?: ClipboardItemType) => boolean;
  copyToSystemClipboard: (text) => Promise<boolean>;
  readFromSystemClipboard: () => Promise<string | null>;
  setMaxItems: (max) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useClipboardStore = create<ClipboardState>()(
  devtools(
    (set, get) => ({
      items: [],
      currentItem: null,
      maxItems: 10,
      isSupported: typeof navigator !== 'undefined' && !!navigator.clipboard,

      copy: async (type, data, source = 'unknown') => {
        const id = generateId();
        const item: ClipboardItem = {
          id,
          type,
          data,
          source,
          copiedAt: Date.now(),
        };

        set((state) => ({
          items: [item, ...state.items].slice(0, state.maxItems),
          currentItem: item,
        }));

        // Also copy to system clipboard if text
        if (type === 'text' && typeof data === 'string') {
          await get().copyToSystemClipboard(data);
        }

        return id;
      },

      paste: () => {
        const { currentItem } = get();
        return currentItem;
      },

      clear: () => set({ items: [], currentItem: null }),

      clearItem: (id) =>
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== id);
          return {
            items: newItems,
            currentItem: state.currentItem?.id === id ? newItems[0] || null : state.currentItem,
          };
        }),

      getItem: (id) => get().items.find((item) => item.id === id),

      hasItem: (type) => {
        const { items } = get();
        if (type) {
          return items.some((item) => item.type === type);
        }
        return items.length > 0;
      },

      copyToSystemClipboard: async (text) => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
          }
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          const success = document.execCommand('copy');
          document.body.removeChild(textarea);
          return success;
        } catch {
          return false;
        }
      },

      readFromSystemClipboard: async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.readText) {
            return await navigator.clipboard.readText();
          }
          return null;
        } catch {
          return null;
        }
      },

      setMaxItems: (maxItems) => set({ maxItems }),
    }),
    { name: 'ClipboardStore' }
  )
);

// Helper hook
export function useClipboard() {
  const copy = useClipboardStore((state) => state.copy);
  const paste = useClipboardStore((state) => state.paste);
  const clear = useClipboardStore((state) => state.clear);
  const hasItem = useClipboardStore((state) => state.hasItem);
  const currentItem = useClipboardStore((state) => state.currentItem);
  const items = useClipboardStore((state) => state.items);

  return {
    copy,
    paste,
    clear,
    hasItem,
    currentItem,
    items,
    hasCopiedItem: !!currentItem,
  };
}
