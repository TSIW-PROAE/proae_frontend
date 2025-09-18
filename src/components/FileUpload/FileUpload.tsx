import { useState } from "react";

interface FileUploadProps {
  title: string;
  accept?: string;
  maxSize?: number;
  onFileSelect?: (file: File | null) => void;
}

export default function FileUpload({
  title,
  accept = ".pdf,.doc,.docx",
  maxSize = 10,
  onFileSelect
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (file: File | null) => {
    setError("");

    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`);
        return;
      }

      setSelectedFile(file);
      onFileSelect?.(file);
    } else {
      setSelectedFile(null);
      onFileSelect?.(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
    onFileSelect?.(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">{title}</h1>

      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg transition-colors duration-200 ${
            dragActive
              ? "border-blue-500 bg-blue-100"
              : error
                ? "border-red-300 bg-red-50"
                : "border-blue-300 bg-blue-50 hover:bg-blue-100"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className={`w-8 h-8 mb-3 ${error ? 'text-red-500' : 'text-blue-500'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className={`mb-2 text-sm font-medium ${error ? 'text-red-600' : 'text-blue-600'}`}>
                <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
              </p>
              <p className={`text-xs ${error ? 'text-red-500' : 'text-blue-500'}`}>
                {accept.replace(/\./g, '').toUpperCase()} (MAX. {maxSize}MB)
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name.slice(0, 40)}{selectedFile.name.length > 40 ? '...' : '' }
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="flex-shrink-0 ml-2 p-1 text-red-500 hover:text-red-700 transition-colors"
              title="Remover arquivo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
