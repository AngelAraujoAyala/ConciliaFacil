import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/apiClient";
import type { ExceptionType } from "../../../types";
import { toast } from "sonner";

export interface ClassifyMovementDto {
  isException: boolean;
  exceptionType?: ExceptionType;
  notes?: string;
  matchedManualWith?: string[];
}

interface ClassifyMovementVariables {
  conciliationId: string;
  movementId: string;
  dto: ClassifyMovementDto;
}

const EXCEPTION_LABELS: Record<NonNullable<ExceptionType>, string> = {
  TRASPASO: "Traspaso entre cuentas",
  RETIRO_EFECTIVO: "Retiro de efectivo",
  COMISION_GLOBAL: "Comisión bancaria",
  MANUAL_MATCH: "Asociación manual",
};

const classifyMovementRequest = async ({
  conciliationId,
  movementId,
  dto,
}: ClassifyMovementVariables) => {
  const { data } = await apiClient.patch(
    `/reconciliations/${conciliationId}/movements/${movementId}/classify`,
    dto,
  );
  return data;
};

export function useClassifyMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classifyMovementRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conciliations"] });

      const { dto } = variables;
      if (!dto.isException) {
        toast.info("Clasificación removida", {
          description: "El movimiento vuelve a ser un pendiente real.",
          duration: 3500,
        });
        return;
      }

      const typeLabel =
        dto.exceptionType ? EXCEPTION_LABELS[dto.exceptionType] : "Excepción";

      toast.success("Movimiento clasificado", {
        description: `Marcado como "${typeLabel}" y removido de pendientes.`,
        duration: 4000,
      });
    },
    onError: (error: Error) => {
      console.error("Error al clasificar movimiento:", error.message);
      toast.error("Error al clasificar", {
        description:
          error.message || "No se pudo guardar la clasificación en el servidor.",
        duration: 5000,
      });
    },
  });
}
