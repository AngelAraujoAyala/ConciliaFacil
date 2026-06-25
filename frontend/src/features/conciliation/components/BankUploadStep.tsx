import { useState } from 'react';
import FileDropzone from './FileDropzone';
import { extractBankMovements } from '../utils/extractBankMovements';
import type { BankMovement } from '../../../types';

interface BankUploadStepProps {
  movements: BankMovement[];
  onMovementsParsed: (movements: BankMovement[]) => void;
  onNextStep: () => void;
}

export default function BankUploadStep({
  movements,
  onMovementsParsed,
  onNextStep,
}: BankUploadStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBankFileSelected = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);
      const parsedMovements = await extractBankMovements(files[0]);
      onMovementsParsed(parsedMovements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el archivo bancario.');
      onMovementsParsed([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <FileDropzone
        title="Estado de Cuenta Bancario"
        description="Arrastra tu archivo .csv, .xlsx o .xls, o haz click para explorar"
        accept=".csv, .xlsx, .xls"
        multiple={false}
        icon="🏦"
        onFilesSelected={handleBankFileSelected}
      />

      {isLoading && (
        <div className="text-center py-4 text-sm text-blue-600 animate-pulse font-medium">
          Procesando archivo bancario...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs font-bold underline ml-2">
            Cerrar
          </button>
        </div>
      )}

      {movements.length > 0 && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              Movimientos Detectados ({movements.length})
            </h2>
            <button
              onClick={() => onMovementsParsed([])}
              className="text-xs text-red-500 hover:underline"
            >
              Limpiar banco
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-sm max-h-87.5 overflow-y-auto custom-scrollbar">
            {movements.map((m) => (
              <div key={m.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-mono text-gray-400">{m.date}</span>
                  <span className="text-sm font-medium text-gray-800 truncate">{m.description}</span>
                </div>
                <span
                  className={`text-sm font-bold shrink-0 ${
                    m.type === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {m.type === 'INGRESO' ? '+' : '-'} {formatCurrency(m.amount)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onNextStep}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>Terminar y Continuar a Facturas</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}