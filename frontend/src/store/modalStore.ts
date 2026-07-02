import { create } from "zustand";

export type ModalType = "success" | "danger" | "warning" | "info";

interface ModalOptions {
  title: string;
  message: string;
  type?: ModalType;
}

interface ConfirmOptions extends ModalOptions {
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: ModalType;
  isConfirm: boolean;
  onConfirm: (() => void | Promise<void>) | null;
  onCancel: (() => void) | null;
  showAlert: (options: ModalOptions) => void;
  showConfirm: (options: ConfirmOptions) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  title: "",
  message: "",
  type: "info",
  isConfirm: false,
  onConfirm: null,
  onCancel: null,

  showAlert: ({ title, message, type = "info" }) =>
    set({
      isOpen: true,
      title,
      message,
      type,
      isConfirm: false,
      onConfirm: null,
      onCancel: null,
    }),

  showConfirm: ({ title, message, type = "warning", onConfirm, onCancel }) =>
    set({
      isOpen: true,
      title,
      message,
      type,
      isConfirm: true,
      onConfirm,
      onCancel: onCancel || null,
    }),

  closeModal: () =>
    set({
      isOpen: false,
      onConfirm: null,
      onCancel: null,
    }),
}));
