import { FaqSection } from '../components/FaqSection';
import { ContactSection } from '../components/ContactSection';
import { ResourcesSection } from '../components/ResourcesSection';

export function SupportPage() {
  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Centro de Soporte</h1>
        <p className="text-slate-500 dark:text-slate-400">¿Tienes dudas o encontraste un problema? Estamos aquí para ayudarte a resolverlo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: FAQ */}
        <div className="lg:col-span-2">
          <FaqSection />
        </div>

        {/* Columna Derecha: Canales de contacto y plantilla */}
        <div className="space-y-6">
          <ContactSection />
          <ResourcesSection />
        </div>
      </div>
    </div>
  );
}

