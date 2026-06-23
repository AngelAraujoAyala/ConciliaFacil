
// Definimos la interfaz para tipar estrictamente los datos de entrada
export interface RegisterCredentials {
  email: string;
  password: Record<string, any> | string; // Supabase acepta string para password convencional
}

export interface LoginCredentials {
  email: string;
  password: string; // Supabase acepta string para password convencional
}
