import { useGoogleLogin } from '../hooks/useGoogleLogin';

export default function GoogleButton() {
    const { loginWithGoogle, isPending, error } = useGoogleLogin();

    return (
        <div className="w-full">
            {error && (
                <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                    {error}
                </div>
            )}

            <button
                type="button"
                onClick={loginWithGoogle}
                disabled={isPending}
                className="w-full flex justify-center items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <svg className="animate-spin h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.49c0,-0.61 -0.05,-1.2 -0.16,-1.78Z" fill="#4285F4" />
                        <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.57c-0.91,0.61 -2.08,0.98 -3.3,0.98c-2.34,0 -4.33,-1.58 -5.04,-3.71H2.93v2.65c1.48,2.95 4.54,4.83 8.01,4.83Z" fill="#34A853" />
                        <path d="M6.96,13.12a5.15,5.15 0 0,1 0,-3.24V7.23H2.93a8.6,8.6 0 0,0 0,7.94l4.03,-3.05Z" fill="#FBBC05" />
                        <path d="M12,6.17c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.59C16.46,3.48 14.42,2.6 12,2.6c-3.47,0 -6.53,1.88 -8.01,4.83l4.03,3.05c0.71,-2.13 2.7,-3.71 5.04,-3.71Z" fill="#EA4335" />
                    </svg>
                )}
                {isPending ? 'Conectando...' : 'Continuar con Google'}
            </button>

            {/* Divisor estético elegante */}
            <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-gray-400 uppercase font-medium tracking-wider">
                        O continúa con correo
                    </span>
                </div>
            </div>
        </div>
    );
}