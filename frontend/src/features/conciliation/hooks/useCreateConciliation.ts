import { useMutation, useQueryClient } from "@tanstack/react-query"; // 🌟 Importamos useQueryClient por buena práctica
import { useConciliationStore } from "../../../store/useConciliationStore";
import type { CreateConciliationDto } from "../types/conciliation-payload";
import { toast } from "sonner"; // 1. 🎉 IMPORTAMOS SONNER AQUÍ

const createConciliationRequest = async (
  payload: CreateConciliationDto,
): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/reconciliations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Error al guardar la conciliación bancaria.",
    );
  }
};

export function useCreateConciliation() {
  const resetStore = useConciliationStore((state) => state.reset);
  const queryClient = useQueryClient(); // Para refrescar caches si tienes tablas de historial

  return useMutation({
    mutationFn: createConciliationRequest,

    // 2. RECIBIMOS LOS ARGUMENTOS (data y variables) EN EL ONSUCCESS GLOBAL 🚀
    onSuccess: (_data, variables) => {
      // Opcional: Si tienes una vista de historial/dashboard con React Query, esto la mantendrá actualizada al vuelo
      queryClient.invalidateQueries({ queryKey: ["conciliations"] });

      // 3. DETECTAMOS EL ESTADO USANDO LAS VARIABLES DEL PAYLOAD ENVIADO
      if (variables.status === "COMPLETED") {
        toast.success("¡Excelente!", {
          description: "Auditoría cerrada y marcada como COMPLETADA con éxito.",
          duration: 5000,
        });
      } else {
        toast.info("Progreso guardado", {
          description:
            "Se guardó como BORRADOR. Puedes continuar editándola después.",
          duration: 5000,
        });
      }

      // 4. AHORA SÍ, LIMPIAMOS EL STORE GLOBAL.
      // Aunque esto desmonte tu vista, Sonner ya recibió la orden en su canal global de renderizado.
      resetStore();
    },

    // 5. DE PASO, CONFIGURAMOS EL TOAST DE ERROR GLOBAL ❌
    onError: (error: Error) => {
      console.error("Mutation Error [CreateConciliation]:", error.message);
      toast.error("Error al guardar", {
        description: error.message || "Hubo un problema con la base de datos.",
        duration: 5000,
      });
    },
  });
}
