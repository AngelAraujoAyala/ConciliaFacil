import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita que reconsulte al backend cada que el contador cambia de ventana
      retry: 1, // Si una petición falla por micro-corte de red, solo reintenta una vez
      staleTime: 1000 * 60 * 5, // Considera los datos "frescos" por 5 minutos antes de volver a consultar de fondo
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
