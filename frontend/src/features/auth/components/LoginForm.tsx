import React from "react";
import { useLoginMutation } from "../hooks/useLoginMutation";
import GoogleButton from "./GoogleButton";

export const LoginForm: React.FC = () => {
  const { mutate, isPending, error } = useLoginMutation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) return;

    mutate({ email, password });
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md border border-slate-100">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Ingresar a ConciliaFácil
        </h1>
        <p className="text-sm text-slate-500">
          Automatiza tus conciliaciones bancarias en segundos
        </p>
      </div>

      <GoogleButton />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error.message || "Credenciales incorrectas. Inténtalo de nuevo."}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            placeholder="contador@ejemplo.com"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-700"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={isPending}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Iniciando sesión..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};
