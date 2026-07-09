import React, { useState } from 'react';
import { useRegisterMutation } from '../hooks/useRegisterMutation';
import GoogleButton from './GoogleButton';

// Enfoque Senior: Definimos la interfaz para las props con tipado estricto
interface RegisterFormProps {
  onSuccess: (email: string) => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { mutate, isPending, error } = useRegisterMutation();
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    // Enfoque Senior: Usamos FormData para extraer los valores de forma limpia
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validación básica antes de disparar la petición a Supabase
    if (!email || !password || !confirmPassword) {
      setValidationError('Todos los campos son obligatorios.');
      return;
    }

    if (password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden.');
      return;
    }

    // Ejecutamos la mutación de TanStack Query pasándole el callback de éxito
    mutate(
      { email, password },
      {
        onSuccess: () => {
          // Si la mutación en Supabase es exitosa, notificamos al contenedor padre
          onSuccess(email);
        },
      }
    );
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-xl border border-gray-100 dark:border-slate-800">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-slate-100">
          Crea tu cuenta en ConciliaFácil
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
          Automatiza tus conciliaciones bancarias en segundos
        </p>
      </div>

      <GoogleButton />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Manejo de errores visuales (Tanto locales como del servidor/Supabase) */}
        {(validationError || error) && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900/50">
            {validationError || error?.message}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            disabled={isPending}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 shadow-sm transition focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 placeholder:text-gray-400 dark:placeholder:text-slate-500 disabled:bg-gray-50 dark:disabled:bg-slate-800/50 disabled:text-gray-400"
            placeholder="contador@empresa.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            disabled={isPending}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 shadow-sm transition focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 placeholder:text-gray-400 dark:placeholder:text-slate-500 disabled:bg-gray-50 dark:disabled:bg-slate-800/50 disabled:text-gray-400"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Confirmar Contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            disabled={isPending}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-700 px-3 py-2 text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 shadow-sm transition focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 placeholder:text-gray-400 dark:placeholder:text-slate-500 disabled:bg-gray-50 dark:disabled:bg-slate-800/50 disabled:text-gray-400"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creando cuenta...
            </>
          ) : (
            'Registrarse'
          )}
        </button>
      </form>
    </div>
  );
}