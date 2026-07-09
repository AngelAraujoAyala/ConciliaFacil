import { useRef, useState, type DragEvent, type ChangeEvent } from "react";

interface FileDropzoneProps {
  title: string;
  description: string;
  accept: string;
  multiple: boolean;
  icon: string;
  onFilesSelected: (files: File[]) => void;
}

export default function FileDropzone({
  title,
  description,
  accept,
  multiple,
  icon,
  onFilesSelected,
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Función asíncrona y recursiva para extraer archivos dentro de carpetas
   * utilizando la FileSystem API nativa del navegador.
   */
  const extractFilesFromItems = async (
    items: DataTransferItemList,
  ): Promise<File[]> => {
    const fileList: File[] = [];

    const traverseEntry = async (entry: any) => {
      if (entry.isFile) {
        // Si es un archivo, lo convertimos a un objeto File estándar de JS
        const file = await new Promise<File>((resolve) => entry.file(resolve));
        fileList.push(file);
      } else if (entry.isDirectory) {
        // Si es una carpeta, creamos un lector de directorio
        const dirReader = entry.createReader();

        const readEntries = (): Promise<any[]> => {
          return new Promise((resolve) => {
            dirReader.readEntries((entries: any[]) => resolve(entries));
          });
        };

        // Leemos todos los archivos del interior de la carpeta
        const entries = await readEntries();
        for (const childEntry of entries) {
          await traverseEntry(childEntry); // Recursión por si hay subcarpetas
        }
      }
    };

    const promises = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          promises.push(traverseEntry(entry));
        }
      }
    }

    await Promise.all(promises);
    return fileList;
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      // Extraer de forma inteligente (soporta tanto archivos sueltos como carpetas)
      const files = await extractFilesFromItems(e.dataTransfer.items);
      onFilesSelected(files);
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Fallback tradicional por si el navegador no soporta la DataTransferItems API
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
        isDragActive
          ? "border-blue-500 bg-blue-50/50 scale-[0.99] dark:bg-blue-950/20"
          : "border-gray-300 bg-gray-50 hover:bg-gray-100/70 hover:border-gray-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/50 dark:hover:border-slate-650"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
      />

      <div className="text-4xl mb-3 select-none">{icon}</div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-350">{title}</h3>
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
        {description}
      </p>
    </div>
  );
}
