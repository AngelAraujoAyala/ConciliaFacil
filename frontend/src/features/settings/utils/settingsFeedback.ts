import { toast } from "sonner";

interface ToastOptions {
  description?: string;
  duration?: number;
}

export const settingsFeedback = {
  success(message: string, options?: ToastOptions) {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
    });
  },

  error(message: string, options?: ToastOptions) {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration ?? 5000,
    });
  },

  info(message: string, options?: ToastOptions) {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
    });
  },
};
