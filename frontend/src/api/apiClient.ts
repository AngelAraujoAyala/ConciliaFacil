import axios from "axios";
import { supabase } from "./supabase";

// Creamos la instancia centralizada de Axios
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de Solicitud (Request Interceptor) de forma asíncrona
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Supabase gestiona la sesión y auto-refresca el token si expiró
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(
          "Error al obtener la sesión de Supabase en el interceptor:",
          error,
        );
      }

      const token = data?.session?.access_token;

      // Si existe un token activo, lo inyectamos en el header Authorization
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Fallo crítico en el interceptor HTTP:", error);
    }

    return config;
  },
  (error) => {
    // Manejo de errores de la solicitud antes de que se envíe
    return Promise.reject(error);
  },
);

// Interceptor de Respuesta (Opcional, útil para manejo global de errores 401/403)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Podrías forzar un logout global aquí si el backend invalida completamente al usuario
      console.warn("No autorizado. El JWT ya no es válido en el backend.");
    }
    return Promise.reject(error);
  },
);
