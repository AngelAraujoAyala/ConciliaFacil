import { useState } from 'react';
import FileDropzone from '../components/FileDropzone';
import { extractBankMovements } from '../utils/extractBankMovements';
import type { BankMovement } from '../../../types';

export const ConciliationPage = () => {
  const [movements, setMovements] = useState<BankMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBankFileSelected = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Procesamos el primer archivo seleccionado (.csv)
      const parsedMovements = await extractBankMovements(files[0]);
      setMovements(parsedMovements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar el archivo.');
      setMovements([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper sencillo para dar formato de moneda local ($)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Módulo de Conciliación</h1>
        <p className="text-sm text-gray-500 mt-1">
          Carga el estado de cuenta bancario para comenzar a extraer la información.
        </p>
      </header>

      {/* Zona de Carga */}
      <section>
        <FileDropzone
          title="Estado de Cuenta Bancario"
          description="Arrastra y suelta tu archivo .csv o haz click para explorar"
          accept=".csv, .xlsx, .xls"
          multiple={false}
          icon="🏦"
          onFilesSelected={handleBankFileSelected}
        />
      </section>

      {/* Estado de Carga y Errores */}
      {isLoading && (
        <div className="text-center py-4 text-sm text-blue-600 font-medium animate-pulse">
          Procesando filas del estado de cuenta...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Lista de Movimientos Extraídos */}
      {movements.length > 0 && !isLoading && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              Movimientos Detectados ({movements.length})
            </h2>
            <button
              onClick={() => setMovements([])}
              className="text-xs text-red-500 hover:underline font-medium"
            >
              Limpiar datos
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-sm max-h-125 overflow-y-auto custom-scrollbar">
            {movements.map((movement) => (
              <div
                key={movement.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col pr-4 min-w-0">
                  <span className="text-xs font-mono text-gray-400">
                    {movement.date}
                  </span>
                  <span className="text-sm font-medium text-gray-800 truncate mt-0.5">
                    {movement.description}
                  </span>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span
                    className={`text-sm font-semibold ${
                      movement.type === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {movement.type === 'INGRESO' ? '+' : '-'} {formatCurrency(movement.amount)}
                  </span>
                  
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {movement.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}