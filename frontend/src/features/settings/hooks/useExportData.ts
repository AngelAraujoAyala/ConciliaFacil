import { useMutation } from "@tanstack/react-query";
import { exportUserData } from "../api/settingsApi";
import { getErrorMessage } from "../utils/getErrorMessage";
import { settingsFeedback } from "../utils/settingsFeedback";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function useExportData() {
  return useMutation({
    mutationFn: exportUserData,
    onSuccess: (blob) => {
      downloadBlob(blob, `conciliafacil-export-${Date.now()}.json`);
      settingsFeedback.success("Datos exportados correctamente.");
    },
    onError: (error: unknown) => {
      settingsFeedback.error("No se pudieron exportar los datos", {
        description: getErrorMessage(error),
      });
    },
  });
}
