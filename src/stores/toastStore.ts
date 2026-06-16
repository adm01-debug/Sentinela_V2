// Toast Store for Sentinela v17
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: ToastAction;
  createdAt: number;
}

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  title?: string;
  duration?: number;
  dismissible?: boolean;
  action?: ToastAction;
}

interface ToastState {
  toasts: Toast[];
  position:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  maxToasts: number;

  add: (type: ToastType, message: string, options?: ToastOptions) => string;
  remove: (id) => void;
  removeAll: () => void;
  update: (id: string, updates: Partial<Toast>) => void;
  setPosition: (position: ToastState["position"]) => void;
  setMaxToasts: (max) => void;

  // Convenience methods
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  loading: (message: string, options?: ToastOptions) => string;
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => Promise<T>;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useToastStore = create<ToastState>()(
  devtools(
    (set, get) => ({
      toasts: [],
      position: "top-right",
      maxToasts: 5,

      add: (type, message, options = {}) => {
        const id = generateId();
        const toast: Toast = {
          id,
          type,
          message,
          title: options.title,
          duration: options.duration ?? (type === "loading" ? 0 : 5000),
          dismissible: options.dismissible ?? true,
          action: options.action,
          createdAt: Date.now(),
        };

        set((state) => ({
          toasts: [toast, ...state.toasts].slice(0, state.maxToasts),
        }));

        if (toast.duration && toast.duration > 0) {
          setTimeout(() => get().remove(id), toast.duration);
        }

        return id;
      },

      remove: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      removeAll: () => set({ toasts: [] }),

      update: (id, updates) =>
        set((state) => ({
          toasts: state.toasts.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      setPosition: (position) => set({ position }),

      setMaxToasts: (maxToasts) => set({ maxToasts }),

      success: (message, options) => get().add("success", message, options),
      error: (message, options) => get().add("error", message, options),
      warning: (message, options) => get().add("warning", message, options),
      info: (message, options) => get().add("info", message, options),
      loading: (message, options) => get().add("loading", message, options),

      promise: async (promise, messages) => {
        const id = get().loading(messages.loading);
        try {
          const result = await promise;
          get().update(id, { type: "success", message: messages.success, duration: 5000 });
          setTimeout(() => get().remove(id), 5000);
          return result;
        } catch (error) {
          get().update(id, { type: "error", message: messages.error, duration: 5000 });
          setTimeout(() => get().remove(id), 5000);
          throw error;
        }
      },
    }),
    { name: "ToastStore" }
  )
);

// Convenience export
export const toast = {
  success: (message: string, options?: ToastOptions) =>
    useToastStore.getState().success(message, options),
  error: (message: string, options?: ToastOptions) =>
    useToastStore.getState().error(message, options),
  warning: (message: string, options?: ToastOptions) =>
    useToastStore.getState().warning(message, options),
  info: (message: string, options?: ToastOptions) =>
    useToastStore.getState().info(message, options),
  loading: (message: string, options?: ToastOptions) =>
    useToastStore.getState().loading(message, options),
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => useToastStore.getState().promise(promise, messages),
  dismiss: (id) => useToastStore.getState().remove(id),
  dismissAll: () => useToastStore.getState().removeAll(),
};
