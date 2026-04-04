// Modal Store for Sentinela v17
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ModalConfig {
  id: string;
  component: string;
  props?: unknown;
  options?: ModalOptions;
}

interface ModalOptions {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  centered?: boolean;
  animation?: 'fade' | 'slide' | 'scale' | 'none';
}

interface ConfirmConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'warning';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ModalState {
  modals: ModalConfig[];
  confirmDialog: ConfirmConfig | null;
  isAnyOpen: boolean;

  open: (modal: ModalConfig) => void;
  close: (id?: string) => void;
  closeAll: () => void;
  confirm: (config: ConfirmConfig) => void;
  closeConfirm: () => void;
  updateModal: (id: string, props: any) => void;
}

export const useModalStore = create<ModalState>()(
  devtools(
    (set, get) => ({
      modals: [],
      confirmDialog: null,
      isAnyOpen: false,

      open: (modal) =>
        set((state) => ({
          modals: [...state.modals.filter((m) => m.id !== modal.id), modal],
          isAnyOpen: true,
        })),

      close: (id) =>
        set((state) => {
          const newModals = id
            ? state.modals.filter((m) => m.id !== id)
            : state.modals.slice(0, -1);
          return {
            modals: newModals,
            isAnyOpen: newModals.length > 0 || state.confirmDialog !== null,
          };
        }),

      closeAll: () =>
        set({
          modals: [],
          confirmDialog: null,
          isAnyOpen: false,
        }),

      confirm: (config) =>
        set({
          confirmDialog: config,
          isAnyOpen: true,
        }),

      closeConfirm: () =>
        set((state) => ({
          confirmDialog: null,
          isAnyOpen: state.modals.length > 0,
        })),

      updateModal: (id, props) =>
        set((state) => ({
          modals: state.modals.map((m) =>
            m.id === id ? { ...m, props: { ...(m.props as object), ...(props as object) } } : m
          ),
        })),
    }),
    { name: 'ModalStore' }
  )
);

// Helper hooks
export const useModal = (id: string) => {
  const { modals, open, close, updateModal } = useModalStore();
  const modal = modals.find((m) => m.id === id);
  
  return {
    isOpen: !!modal,
    props: modal?.props,
    open: (props?: unknown) => open({ id, component: id, props }),
    close: () => close(id),
    update: (props: any) => updateModal(id, props),
  };
};

export const useConfirmDialog = () => {
  const { confirm, closeConfirm, confirmDialog } = useModalStore();
  
  return {
    isOpen: !!confirmDialog,
    config: confirmDialog,
    confirm,
    close: closeConfirm,
  };
};
