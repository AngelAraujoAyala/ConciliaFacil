import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-3",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div
      className={`animate-spin rounded-full border-slate-200 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-400 ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="cargando"
    />
  );
};

interface LoadingPageProps {
  message?: string;
  subMessage?: string;
  fullscreen?: boolean;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = "Cargando...",
  subMessage,
  fullscreen = false,
}) => {
  const containerClasses = fullscreen
    ? "min-h-screen w-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6"
    : "flex flex-col items-center justify-center min-h-[50vh] p-6 space-y-4";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <LoadingSpinner size="md" />
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 animate-pulse">
            {message}
          </p>
          {subMessage && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
              {subMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
