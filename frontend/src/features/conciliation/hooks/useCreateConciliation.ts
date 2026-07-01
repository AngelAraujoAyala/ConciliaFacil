import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useConciliationStore } from "../../../store/useConciliationStore";
import type { CreateConciliationDto } from "../types/conciliation-payload";
import { toast } from "sonner";
import { apiClient } from "../../../api/apiClient";

const createConciliationRequest = async (
  payload: CreateConciliationDto,
): Promise<void> => {
  try {
    if (payload.id) {
      // Flujo REANUDAR: el registro ya existe en BD → actualizamos con PATCH
      // El id viaja como URL param; lo excluimos del body para mantener el DTO limpio.
      const { id, ...body } = payload;
      await apiClient.patch(`/reconciliations/${id}`, body);
    } else {
      // Flujo NUEVO: no hay registro previo → creamos con POST
      await apiClient.post("/reconciliations", payload);
    }
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: { message?: string } };
    };
    const errorMessage =
      axiosError.response?.data?.message ||
      "Error al guardar la conciliación bancaria.";
    throw new Error(errorMessage);
  }
};


export function useCreateConciliation() {
  const resetStore = useConciliationStore((state) => state.reset);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConciliationRequest,

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conciliations"] });

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

      resetStore();
    },
    onError: (error: Error) => {
      console.error("Mutation Error [CreateConciliation]:", error.message);
      toast.error("Error al guardar", {
        description: error.message || "Hubo un problema con la base de datos.",
        duration: 5000,
      });
    },
  });
}
