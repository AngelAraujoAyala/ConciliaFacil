import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50/50 p-4">
      {/* Un fondo sutil con gradiente para que resalte el diseño Fintech del SaaS */}
      <div className="w-full max-w-md">
        <RegisterForm />
        
        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}