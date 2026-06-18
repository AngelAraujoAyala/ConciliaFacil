import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';

interface FileDropzoneProps {
  title: string;
  description: string;
  accept: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  icon: string;
}

export default function FileDropzone({
  title,
  description,
  accept,
  multiple = false,
  onFilesSelected,
  icon
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(multiple ? filesArray : [filesArray[0]]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(multiple ? filesArray : [filesArray[0]]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center 
        text-center cursor-pointer transition-all duration-200 min-h-55
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50 text-blue-700 scale-[1.01]' 
          : 'border-gray-300 bg-white hover:border-gray-400 text-gray-500'}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <span className="text-4xl mb-3 select-none">{icon}</span>
      <h3 className="font-semibold text-gray-800 text-base mb-1">{title}</h3>
      <p className="text-xs text-gray-400 max-w-60">{description}</p>
    </div>
  );
}