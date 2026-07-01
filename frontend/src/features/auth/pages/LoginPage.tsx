import { LoginForm } from '../components/LoginForm';


export const LoginPage = () => {
    return (
        <div className='min-h-screen flex items-center justify-center bg-slate-50'>
            <div className="mx-auto max-w-md w-full px-4">
                <LoginForm />

                <p className="mt-6 text-center text-sm text-gray-500">
                    ¿No tienes una cuenta?{' '}
                    <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition">
                        Regístrate aquí
                    </a>
                </p>
            </div>
        </div>
    );
}